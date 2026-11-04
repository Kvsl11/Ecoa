import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trechoDoRefrao } from '../public/js/lib/refrao.js';

const sinc = (linhas) => ({ linhas, tempos: linhas.map((_, i) => ({ inicio: 10 + i * 4, fim: 13 + i * 4 })) });

test('o refrão começa na primeira linha do pedaço que se repete', () => {
  const s = sinc([
    'Primeira estrofe começa aqui', 'Uma linha só dela', 'Mais uma da estrofe',
    'Oh, eu te louvarei', 'Para sempre cantarei', 'Teu amor me alcançou',
    'Segunda estrofe diferente', 'Outra linha nova',
    'Oh, eu te louvarei!', 'Para sempre cantarei', 'Teu amor me alcançou',
  ]);
  assert.deepEqual(trechoDoRefrao(s), { inicio: 21.5, fim: 51.5 });
});

test('sem tempos ou sem nada repetido, não há refrão', () => {
  assert.equal(trechoDoRefrao(null), null);
  assert.equal(trechoDoRefrao({ linhas: ['a b', 'c d'], tempos: [] }), null);
  assert.equal(trechoDoRefrao(sinc(['uma coisa', 'outra coisa', 'mais uma coisa', 'última coisa aqui'])), null);
});

test('o tamanho do trecho é o pedido', () => {
  const s = sinc(['la la la', 'refrão aqui agora', 'canta comigo então', 'verso solto', 'refrão aqui agora', 'canta comigo então']);
  const t = trechoDoRefrao(s, 15);
  assert.equal(t.fim - t.inicio, 15);
  assert.equal(t.inicio, 13.5);
});
