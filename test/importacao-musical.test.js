import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gerarLrc, juntarLinhas } from '../public/js/lib/importacao-musical.js';

test('gerarLrc: preserva os tempos em centésimos e a ordem da letra', () => {
  assert.equal(gerarLrc([
    { inicio: 1.25, texto: 'Primeira linha' },
    { inicio: 62.5, texto: 'Segunda linha' },
  ]), '[00:01.25] Primeira linha\n[01:02.50] Segunda linha\n');
});

test('juntarLinhas: remove a duplicata de sobreposição sem apagar refrão repetido', () => {
  const r = juntarLinhas([
    [
      { texto: 'Santo, santo', inicio: 84.1, fim: 86.2 },
      { texto: 'Santo, santo', inicio: 88.5, fim: 90.0 },
    ],
    [
      { texto: 'Santo, santo', inicio: 84.3, fim: 86.1 },
      { texto: 'Glória a Deus', inicio: 91.0, fim: 94.0 },
    ],
  ], 100);
  assert.deepEqual(r.map((x) => x.inicio), [84.1, 88.5, 91]);
  assert.ok(r.every((x) => x.fim > x.inicio && x.fim <= 100));
});

test('juntarLinhas: não deixa o fim de uma frase invadir a próxima', () => {
  const r = juntarLinhas([[
    { texto: 'Primeira', inicio: 1, fim: 8 },
    { texto: 'Segunda', inicio: 4, fim: 7 },
  ]], 12);
  assert.equal(r[0].fim, 4);
});
