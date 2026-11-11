import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lerHsl, coresDoCartao, linhasParaEscolher, versosIniciais, alternarVerso, textoDoCartao, quebrarTexto, limitarLinhas, umaLinha, MAXIMO_DE_VERSOS, tamanhoDoCartao, duracaoDoCartao, proximoDe, ESTILOS_DO_TEXTO } from '../public/js/lib/cartao.js';

const medir = (t) => t.length * 10; // (cada letra com 10 de largura)

test('as cores do cartão: a da música, a escura, a preta e a clara', () => {
  assert.deepEqual(lerHsl('hsl(210 60% 40%)'), { h: 210, s: 60, l: 40 });
  assert.equal(lerHsl('#fff'), null);
  const cores = coresDoCartao('hsl(210 95% 80%)');
  assert.equal(cores.length, 4);
  assert.equal(cores[0].fundo, 'hsl(210 72% 36%)'); // (a saturação e o brilho limitados: a letra branca lê bem)
  assert.equal(cores[3].texto, '#111');
  assert.ok(coresDoCartao('').every((c) => c.fundo && c.fundo2 && c.texto && c.suave)); // (sem a cor da música: a do app)
});

test('as linhas para escolher: sem as vazias nem as marcas de parte', () => {
  assert.deepEqual(linhasParaEscolher(['[Refrão]', '  I stay out   too late ', '', { texto: 'Got nothing in my brain' }, '♪', '(Solo)']), ['I stay out too late', 'Got nothing in my brain']);
  assert.deepEqual(linhasParaEscolher(null), []);
});

test('os versos iniciais: a partir da linha cantada, até 4 seguidos, sem passar do fim', () => {
  const l = ['a', 'b', 'c', 'd', 'e', 'f'];
  assert.deepEqual(versosIniciais(l, 1), [1, 2, 3, 4]);
  assert.deepEqual(versosIniciais(l, 5), [2, 3, 4, 5]);
  assert.deepEqual(versosIniciais(l, -2), [0, 1, 2, 3]);
  assert.deepEqual(versosIniciais(['a', 'b'], 0), [0, 1]);
  assert.deepEqual(versosIniciais([], 0), []);
});

test('marcar e desmarcar os versos: em ordem e no máximo cinco', () => {
  let m = [];
  for (const i of [4, 1, 3]) m = alternarVerso(m, i);
  assert.deepEqual(m, [1, 3, 4]);
  assert.deepEqual(alternarVerso(m, 3), [1, 4]);
  const cheio = [0, 1, 2, 3, 4];
  assert.equal(cheio.length, MAXIMO_DE_VERSOS);
  assert.deepEqual(alternarVerso(cheio, 9), cheio);
});

test('o texto da mensagem: os versos entre aspas, o nome com o artista e o endereço', () => {
  assert.equal(textoDoCartao({ titulo: 'Shake It Off', artista: 'Taylor Swift', url: 'https://youtu.be/x' }), 'Shake It Off — Taylor Swift\nhttps://youtu.be/x');
  assert.equal(textoDoCartao({ titulo: 'Aba', artista: 'Kemuel', versos: ['linha um', 'linha dois'] }), '“linha um\nlinha dois”\n\nAba — Kemuel');
  assert.equal(textoDoCartao({ titulo: 'Só o nome' }), 'Só o nome');
});

test('a quebra do texto na largura e o limite de linhas com reticências', () => {
  assert.deepEqual(quebrarTexto(medir, 'um dois tres quatro', 80), ['um dois', 'tres', 'quatro']);
  assert.deepEqual(quebrarTexto(medir, 'palavramuitogrande ok', 50), ['palavramuitogrande', 'ok']);
  assert.deepEqual(quebrarTexto(medir, '', 50), []);
  assert.deepEqual(limitarLinhas(medir, ['um dois', 'tres', 'quatro'], 2, 80), ['um dois', 'tres…']);
  assert.deepEqual(limitarLinhas(medir, ['abcdefgh', 'x'], 1, 80), ['abcdefg…']);
  assert.deepEqual(limitarLinhas(medir, ['a'], 2, 80), ['a']);
  assert.equal(umaLinha(medir, 'Canção de Teste', 200), 'Canção de Teste');
  assert.equal(umaLinha(medir, 'Canção de Teste do Compartilhamento', 200), 'Canção de Teste do…');
});

test('o tamanho de cada cartão, a duração escrita e a volta pelos estilos do texto', () => {
  assert.deepEqual(tamanhoDoCartao('musica'), { l: 1080, a: 1920 });
  assert.deepEqual(tamanhoDoCartao('letra'), { l: 1080, a: 1080 });
  assert.deepEqual(tamanhoDoCartao('video'), { l: 1080, a: 920 });
  assert.deepEqual(tamanhoDoCartao('outro'), tamanhoDoCartao('musica'));
  assert.equal(duracaoDoCartao(243), '4:03');
  assert.equal(duracaoDoCartao(0), '');
  const chaves = ESTILOS_DO_TEXTO.map(([k]) => k);
  assert.equal(proximoDe(chaves, 'classico'), 'largo');
  assert.equal(proximoDe(chaves, 'inclinado'), 'classico');
});

test('fundos animados: a volta se repete a cada DURACAO_DA_ANIMACAO e o acaso é sempre o mesmo', async () => {
  const { FUNDOS_ANIMADOS, DURACAO_DA_ANIMACAO, voltaDaAnimacao, acaso, desenharFundoAnimado } = await import('../public/js/lib/cartao.js');
  assert.deepEqual(FUNDOS_ANIMADOS.map(([k]) => k), ['eco', 'ondas', 'aurora', 'bolhas', 'brilhos']);
  assert.equal(voltaDaAnimacao(0), 0);
  assert.equal(voltaDaAnimacao(DURACAO_DA_ANIMACAO), 0);
  assert.ok(Math.abs(voltaDaAnimacao(DURACAO_DA_ANIMACAO * 1.5) - 0.5) < 1e-9);
  assert.equal(acaso(3, 2), acaso(3, 2));
  for (let i = 0; i < 50; i++) assert.ok(acaso(i, 1) >= 0 && acaso(i, 1) < 1);
  // o que é desenhado no fim da volta é igual ao do começo (o vídeo emenda) e nada é desenhado fora do save/restore
  const desenho = (qual, t) => {
    const ops = [];
    const grad = { addColorStop() {} };
    const c = new Proxy({}, { get: (_, k) => (k === 'createRadialGradient' ? (...a) => { ops.push([k, ...a.map((n) => Math.round(n * 100))]); return grad; }
      : (...a) => { ops.push([k, ...a.map((n) => (typeof n === 'number' ? Math.round(n * 100) : n))]); }), set: () => true });
    desenharFundoAnimado(c, 1080, 1080, '#fff', qual, t);
    return ops;
  };
  for (const [qual] of FUNDOS_ANIMADOS) {
    const a = desenho(qual, 0);
    assert.ok(a.length > 4, qual);
    assert.equal(a[0][0], 'save');
    assert.equal(a.at(-1)[0], 'restore');
    assert.deepEqual(desenho(qual, DURACAO_DA_ANIMACAO), a, qual);
    assert.notDeepEqual(desenho(qual, 1.5), a, qual);
  }
});

test('o link compartilhado é o da música no Ecoa, e o do aplicativo leva o mesmo caminho', async () => {
  const { linkDaMusicaNoEcoa, linkParaAbrirNoAplicativo, ENDERECO_DO_ECOA } = await import('../public/js/lib/cartao.js');
  assert.equal(linkDaMusicaNoEcoa('Eu Seguirei', 'Frei Gilson'), `${ENDERECO_DO_ECOA}#/ouvir/Eu%20Seguirei/Frei%20Gilson`);
  assert.equal(linkDaMusicaNoEcoa('  Só  Tu ', ''), `${ENDERECO_DO_ECOA}#/ouvir/S%C3%B3%20Tu`);
  assert.equal(linkDaMusicaNoEcoa('', 'Alguém'), '');
  // (a barra do nome não vira mais um pedaço do caminho, e os parênteses não cortam o link nas mensagens)
  const l = linkDaMusicaNoEcoa("Die With A Smile (feat. Bruno Mars)", 'AC/DC');
  assert.ok(!/[()'!*\s]/.test(l), l);
  const [, t, a] = /#\/ouvir\/([^/]+)\/([^/]+)$/.exec(l);
  assert.equal(decodeURIComponent(t), 'Die With A Smile (feat. Bruno Mars)');
  assert.equal(decodeURIComponent(a), 'AC/DC');
  const app = linkParaAbrirNoAplicativo('Eu Seguirei', 'Frei Gilson');
  assert.ok(app.startsWith('intent://ouvir/Eu%20Seguirei/Frei%20Gilson#Intent;scheme=ecoa;package=br.ecoa.app;'), app);
  assert.ok(app.includes(`S.browser_fallback_url=${encodeURIComponent(linkDaMusicaNoEcoa('Eu Seguirei', 'Frei Gilson'))}`));
  assert.equal(linkParaAbrirNoAplicativo(''), '');
});

test('o link leva o vídeo da música de quem envia, e as partes voltam como foram', async () => {
  const { linkDaMusicaNoEcoa, linkParaAbrirNoAplicativo, musicaDoLink, ENDERECO_DO_ECOA } = await import('../public/js/lib/cartao.js');
  assert.equal(linkDaMusicaNoEcoa('Eu Seguirei', 'Frei Gilson', 'o2QQWcLE7ac'), `${ENDERECO_DO_ECOA}#/ouvir/Eu%20Seguirei/Frei%20Gilson/o2QQWcLE7ac`);
  assert.equal(linkDaMusicaNoEcoa('Aleluia', '', 'o2QQWcLE7ac'), `${ENDERECO_DO_ECOA}#/ouvir/Aleluia/-/o2QQWcLE7ac`);
  // (o que não é um identificador do YouTube não entra)
  assert.equal(linkDaMusicaNoEcoa('Aleluia', 'Coral', 'https://x.y/z'), `${ENDERECO_DO_ECOA}#/ouvir/Aleluia/Coral`);
  assert.ok(linkParaAbrirNoAplicativo('Eu Seguirei', 'Frei Gilson', 'o2QQWcLE7ac').startsWith('intent://ouvir/Eu%20Seguirei/Frei%20Gilson/o2QQWcLE7ac#Intent;'));
  assert.deepEqual(musicaDoLink('Eu Seguirei', 'Frei Gilson', 'o2QQWcLE7ac'), { titulo: 'Eu Seguirei', artista: 'Frei Gilson', video: 'o2QQWcLE7ac' });
  assert.deepEqual(musicaDoLink('Aleluia', '-', 'o2QQWcLE7ac'), { titulo: 'Aleluia', artista: '', video: 'o2QQWcLE7ac' });
  assert.deepEqual(musicaDoLink('Aleluia', 'Coral', 'curto'), { titulo: 'Aleluia', artista: 'Coral', video: '' });
});
