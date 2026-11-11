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
