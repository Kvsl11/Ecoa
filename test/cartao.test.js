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
  assert.equal(cores[0].painel, 'hsl(210 58% 15%)'); // (o quadro em volta da capa: opaco, do tom do fundo)
  assert.equal(cores[3].painelTexto, '#111');
  assert.ok(coresDoCartao('').every((c) => c.fundo && c.fundo2 && c.texto && c.suave && c.painel && !/rgba|transparent/.test(c.painel) && c.painelTexto && c.painelSuave)); // (sem a cor da música: a do app)
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

test('o link de música aberto no navegador do Android é entregue ao aplicativo, uma vez por link', async () => {
  const { readFile } = await import('node:fs/promises');
  const vm = await import('node:vm');
  const { linkParaAbrirNoAplicativo, linkDaMusicaNoEcoa } = await import('../public/js/lib/cartao.js');
  const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  const script = /<script>([\s\S]*?)<\/script>/.exec(html)[1];
  assert.ok(script.includes("'intent://'"), 'o primeiro script da página é o que entrega o link');
  const abrir = (href, userAgent, guardado = {}) => {
    const location = { href, hash: href.includes('#') ? href.slice(href.indexOf('#')) : '', search: /\?[^#]*/.exec(href)?.[0] || '' };
    const sessionStorage = { getItem: (k) => guardado[k] ?? null, setItem: (k, v) => { guardado[k] = String(v); } };
    vm.runInNewContext(script, { location, navigator: { userAgent }, sessionStorage, window: {}, Date, encodeURIComponent, String });
    return { foi: location.href, guardado };
  };
  const android = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36';
  const link = linkDaMusicaNoEcoa('Eu Seguirei', 'Frei Gilson');
  // (o mesmo endereço do botão "Abrir no aplicativo")
  const primeira = abrir(link, android);
  assert.equal(primeira.foi, linkParaAbrirNoAplicativo('Eu Seguirei', 'Frei Gilson'));
  // de volta ao site (sem o aplicativo, ou ao recarregar): não tenta de novo
  assert.equal(abrir(link, android, primeira.guardado).foi, link);
  // fora do Android, dentro do aplicativo e em outras telas: nada
  assert.equal(abrir(link, 'Mozilla/5.0 (Windows NT 10.0) Chrome/130.0').foi, link);
  assert.equal(abrir(link, `${android} EcoaAndroid`).foi, link);
  // (o navegador interno de outro aplicativo mostraria uma página de erro: fica o botão)
  assert.equal(abrir(link, android.replace('Pixel 8)', 'Pixel 8; wv)')).foi, link);
  const inicio = link.split('#')[0] + '#/biblioteca';
  assert.equal(abrir(inicio, android).foi, inicio);
  // o link de uma playlist ou repertório compartilhado também vai para o app (ecoa://lista/<código>)
  const lista = `${link.split('#')[0]}#/lista/zAbC_12-x`;
  assert.equal(abrir(lista, android).foi, `intent://lista/zAbC_12-x#Intent;scheme=ecoa;package=br.ecoa.app;S.browser_fallback_url=${encodeURIComponent(lista)};end`);
  // (de volta pela reserva, sem o app — "?baixarApp" —, a página fica: é ela que baixa o app)
  const reserva = `${link.split('#')[0]}?baixarApp#${link.split('#')[1]}`;
  assert.equal(abrir(reserva, android).foi, reserva);
});

test('o trecho da música dos versos escolhidos: do começo do primeiro ao fim do último, entre 4 e 30 s', async () => {
  const { indicesParaEscolher, trechoDosVersos } = await import('../public/js/lib/cartao.js');
  const linhas = ['[Verso]', 'a b', '', 'c d', 'e f', '♪', 'g h'];
  assert.deepEqual(indicesParaEscolher(linhas), [1, 3, 4, 6]); // (as mesmas linhas de linhasParaEscolher, pelo índice)
  assert.equal(indicesParaEscolher(linhas).length, linhasParaEscolher(linhas).length);
  const tempos = [{ inicio: 8 }, { inicio: 10, fim: 13 }, { inicio: 13 }, { inicio: 14, fim: 17 }, { inicio: 17, fim: 21 }, { inicio: 21 }, { inicio: 60, fim: 61 }];
  assert.deepEqual(trechoDosVersos(tempos, [1, 3, 4]), { inicio: 9.7, segundos: 11.7 }); // (0,3 s antes; 0,4 s depois do fim)
  assert.deepEqual(trechoDosVersos(tempos, [6]), { inicio: 59.7, segundos: 4 }); // (o mínimo)
  assert.deepEqual(trechoDosVersos(tempos, [1, 6]), { inicio: 9.7, segundos: 30 }); // (o máximo)
  assert.equal(trechoDosVersos(tempos, []), null);
  assert.equal(trechoDosVersos(null, [1]), null);
});

test('os versos enchem conforme são cantados: de 0 a 1 cada um, do começo ao fim do verso', async () => {
  const { preenchimentoDosVersos } = await import('../public/js/lib/cartao.js');
  const tempos = [{ inicio: 8 }, { inicio: 10, fim: 14 }, { inicio: 14 }, { inicio: 20 }];
  assert.deepEqual(preenchimentoDosVersos(tempos, [1, 2, 3], 9), [0, 0, 0]);
  assert.deepEqual(preenchimentoDosVersos(tempos, [1, 2, 3], 12), [0.5, 0, 0]);
  assert.deepEqual(preenchimentoDosVersos(tempos, [1, 2, 3], 17), [1, 0.5, 0]); // (sem o fim: o começo da linha seguinte)
  assert.deepEqual(preenchimentoDosVersos(tempos, [3], 22.5), [0.5]); // (a última linha, sem fim: 5 s)
  assert.deepEqual(preenchimentoDosVersos(tempos, [1, 9], 30), [1, 1]); // (sem o tempo da linha: cheia)
  assert.equal(preenchimentoDosVersos(null, [1], 3), null);
});

test('os três cartões são desenhados inteiros (a letra com os versos, o vídeo com o rótulo) e a imagem sai em 4K', async () => {
  const { desenharCartao, coresDoCartao } = await import('../public/js/lib/cartao.js');
  globalThis.Path2D ??= class { constructor(d) { this.d = d; } };
  const textos = [];
  const contexto = new Proxy({ measureText: (x) => ({ width: String(x).length * 20 }), fillText: (x) => textos.push(x), createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) }, {
    get: (alvo, k) => (k in alvo ? alvo[k] : () => {}),
    set: (alvo, k, v) => { alvo[k] = v; return true; },
  });
  const tela = () => ({ width: 0, height: 0, getContext: () => contexto });
  const cor = coresDoCartao('hsl(260 60% 40%)')[0];
  const base = { titulo: 'Blood In Your Eyes', artista: 'Tove Lo', cor, duracao: 241, t: 2.5 };
  for (const animacao of ['', 'ondas']) {
    textos.length = 0;
    desenharCartao(tela(), { ...base, modo: 'letra', versos: ['Better hang with me', 'Fast cars, big lips'], animacao, preenchido: [1, 0.4] });
    assert.ok(textos.includes('Música · Tove Lo'), 'a letra mostra o artista');
    assert.ok(textos.some((x) => /Better hang/.test(x)) && textos.includes('Ecoa'), 'a letra mostra os versos e a marca');
  }
  textos.length = 0;
  desenharCartao(tela(), { ...base, modo: 'video' });
  assert.ok(textos.includes('Videoclipe · 4:01'));
  const grande = desenharCartao(tela(), { ...base, modo: 'musica', escala: 2 });
  assert.deepEqual([grande.width, grande.height], [2160, 3840]);
});

test('a prévia do link compartilhado: só a faixa certa, com o trecho de 30 s', async () => {
  const { faixaDaPrevia, comparavel, tempoDaPrevia } = await import('../public/js/lib/convite-musica.js');
  const resposta = { data: [
    { title: 'Blood In Your Eyes (Live)', preview: '', artist: { name: 'Tove Lo' } },
    { title: 'Blood In Your Eyes', preview: 'https://x/outra.mp3', artist: { name: 'Outra Pessoa' }, album: {} },
    { title: 'Blood In Your Eyes', preview: 'https://x/certa.mp3', duration: 201, artist: { name: 'Tove Lo' }, album: { cover_xl: 'https://x/capa.jpg' } },
  ] };
  assert.deepEqual(faixaDaPrevia(resposta, 'Blood In Your Eyes', 'Tove Lo'), { titulo: 'Blood In Your Eyes', artista: 'Tove Lo', capa: 'https://x/capa.jpg', previa: 'https://x/certa.mp3', duracao: 201 });
  assert.equal(faixaDaPrevia(resposta, 'Outra Música', 'Tove Lo'), null); // (nada de tocar outra música)
  assert.equal(faixaDaPrevia(null, 'X'), null);
  const semCapa = { data: [{ title: 'Blood In Your Eyes', preview: 'p.mp3', artist: { name: 'Tove Lo' }, album: { cover_xl: null, md5_image: 'dc492b8d028525c713a52713b9bb005d' } }] };
  assert.match(faixaDaPrevia(semCapa, 'Blood In Your Eyes', 'Tove Lo').capa, /dc492b8d028525c713a52713b9bb005d\/1000x1000/);
  assert.equal(comparavel('Coração (Ao Vivo) feat. Fulano'), 'coracao');
  assert.equal(tempoDaPrevia(29.7), '0:29');
});

test('a prévia do link: sem a música no Deezer, o trecho do iTunes (só a faixa certa, capa em 1000 px)', async () => {
  const { faixaDoItunes } = await import('../public/js/lib/convite-musica.js');
  const resposta = { results: [
    { trackName: 'Outra', artistName: 'Tove Lo', previewUrl: 'https://x/outra.m4a' },
    { trackName: 'Blood In Your Eyes (from GTAVI: The Album)', artistName: 'Tove Lo', previewUrl: 'https://x/certa.m4a', artworkUrl100: 'https://x/Music/100x100bb.jpg', trackTimeMillis: 162000 },
  ] };
  assert.deepEqual(faixaDoItunes(resposta, 'Blood In Your Eyes', 'Tove Lo'), { titulo: 'Blood In Your Eyes (from GTAVI: The Album)', artista: 'Tove Lo', capa: 'https://x/Music/1000x1000bb.jpg', previa: 'https://x/certa.m4a', duracao: 162 });
  assert.equal(faixaDoItunes(resposta, 'Nada Igual', 'Tove Lo'), null);
  assert.equal(faixaDoItunes(null, 'X'), null);
});

test('o fundo da prévia é desenhado num canvas pequeno: a capa em três camadas e as três luzes, sem erro', async () => {
  const { desenharFundoDaPrevia } = await import('../public/js/lib/convite-musica.js');
  const feitos = [];
  const ctx = new Proxy({ filter: 'none', drawImage: () => feitos.push('capa'), createRadialGradient: () => ({ addColorStop() {} }), fillRect: () => feitos.push('pinta') }, {
    get: (alvo, k) => (k in alvo ? alvo[k] : () => {}), set: (alvo, k, v) => { alvo[k] = v; return true; },
  });
  desenharFundoDaPrevia(ctx, 64, 138, { img: {}, cores: ['hsl(263 70% 51%)', 'hsl(224 69% 55%)'], nivel: 0.6, t: 12.3 });
  assert.equal(feitos.filter((x) => x === 'capa').length, 3);
  assert.equal(feitos.filter((x) => x === 'pinta').length, 4); // (o fundo escuro e as três luzes)
  assert.equal(ctx.filter, 'none'); // (o desfoque não fica ligado depois do desenho)
  feitos.length = 0;
  desenharFundoDaPrevia(ctx, 64, 138, {}); // (sem a capa e sem as cores: só o fundo escuro)
  assert.deepEqual(feitos, ['pinta']);
});

test('o link do cartão do Vídeo leva o clipe e o ponto do refrão, e é lido de volta', async () => {
  const { linkDaMusicaNoEcoa, linkParaAbrirNoAplicativo, lerLinkDaMusica, ENDERECO_DO_ECOA } = await import('../public/js/lib/cartao.js');
  assert.equal(linkDaMusicaNoEcoa('Levitating', 'Dua Lipa', { video: 'TUVcZfQe-Kw', inicio: 47.6 }), `${ENDERECO_DO_ECOA}#/ouvir/Levitating/Dua%20Lipa/video/TUVcZfQe-Kw/47`);
  assert.equal(linkDaMusicaNoEcoa('Levitating', 'Dua Lipa', { video: 'TUVcZfQe-Kw' }), `${ENDERECO_DO_ECOA}#/ouvir/Levitating/Dua%20Lipa/video/TUVcZfQe-Kw`);
  assert.equal(linkDaMusicaNoEcoa('Levitating', '', { video: 'TUVcZfQe-Kw', inicio: 10 }), `${ENDERECO_DO_ECOA}#/ouvir/Levitating/-/video/TUVcZfQe-Kw/10`); // (sem o artista: "-")
  assert.equal(linkDaMusicaNoEcoa('Levitating', 'Dua Lipa', { video: 'não é id' }), `${ENDERECO_DO_ECOA}#/ouvir/Levitating/Dua%20Lipa`); // (a Música e a Letra: sem o vídeo)
  assert.ok(linkParaAbrirNoAplicativo('Levitating', 'Dua Lipa', { video: 'TUVcZfQe-Kw', inicio: 47 }).startsWith('intent://ouvir/Levitating/Dua%20Lipa/video/TUVcZfQe-Kw/47#Intent;'));
  assert.deepEqual(lerLinkDaMusica(['Levitating', 'Dua Lipa', 'video', 'TUVcZfQe-Kw', '47']), { titulo: 'Levitating', artista: 'Dua Lipa', video: { id: 'TUVcZfQe-Kw', inicio: 47 } });
  assert.deepEqual(lerLinkDaMusica(['Levitating', '-', 'video', 'TUVcZfQe-Kw']), { titulo: 'Levitating', artista: '', video: { id: 'TUVcZfQe-Kw', inicio: 0 } });
  assert.deepEqual(lerLinkDaMusica(['Levitating', 'Dua Lipa']), { titulo: 'Levitating', artista: 'Dua Lipa', video: null });
});
