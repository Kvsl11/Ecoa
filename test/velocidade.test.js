import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pontoAgora, rotuloVelocidade, velocidadeValida, VELOCIDADES } from '../public/js/lib/velocidade.js';

test('as velocidades são passos de 0,25 (os que o player do YouTube aceita) e incluem a normal', () => {
  assert.ok(VELOCIDADES.includes(1));
  for (const v of VELOCIDADES) assert.equal((v * 4) % 1, 0);
});

test('velocidade estranha vira a normal; a de fora dos passos, a mais próxima', () => {
  for (const v of [0, -1, NaN, 'x', null, undefined]) assert.equal(velocidadeValida(v), 1);
  assert.equal(velocidadeValida(0.8), 0.75);
  assert.equal(velocidadeValida(3), 1.5);
  assert.equal(velocidadeValida(0.1), 0.5);
  assert.equal(velocidadeValida('1.25'), 1.25);
});

test('rótulo da velocidade', () => {
  assert.equal(rotuloVelocidade(1), 'Normal');
  assert.equal(rotuloVelocidade(0.75), '0,75×');
  assert.equal(rotuloVelocidade(1.5), '1,5×');
});

test('o ponto da música anda na velocidade dela e não passa do teto sem notícia do player', () => {
  assert.equal(pontoAgora(10, 1, 1), 11);
  assert.equal(pontoAgora(10, 1, 0.5), 10.5);
  assert.equal(pontoAgora(10, 1, 1.5), 11.5);
  assert.equal(pontoAgora(10, 30, 0.5), 11);
  assert.equal(pontoAgora(10, -3, 1), 10);
});
