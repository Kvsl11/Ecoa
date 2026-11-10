import { test } from 'node:test';
import assert from 'node:assert/strict';
import { faltaSono, novoTimerSono, OPCOES_SONO, textoSono, venceuSono } from '../public/js/lib/timer-sono.js';

test('o timer em minutos guarda o instante em que a música para', () => {
  const t = novoTimerSono(15, 1000);
  assert.deepEqual(t, { fimEm: 1000 + 15 * 60000 });
  assert.equal(faltaSono(t, 1000), 15 * 60000);
  assert.equal(venceuSono(t, 1000 + 15 * 60000 - 1), false);
  assert.equal(venceuSono(t, 1000 + 15 * 60000), true);
  assert.equal(faltaSono(t, 1000 + 16 * 60000), 0);
});

test('o timer de fim da música não tem relógio e nunca vence pelo tempo', () => {
  const t = novoTimerSono('fim', 0);
  assert.deepEqual(t, { noFim: true });
  assert.equal(faltaSono(t, 1e12), Infinity);
  assert.equal(venceuSono(t, 1e12), false);
  assert.equal(textoSono(t), 'Fim da música');
});

test('escolha inválida não cria timer', () => {
  for (const v of [0, -5, 'abc', NaN, null, undefined, 24 * 60 + 1]) assert.equal(novoTimerSono(v, 0), null);
  assert.equal(venceuSono(null), false);
  assert.equal(faltaSono(null), 0);
  assert.equal(textoSono(null), '');
});

test('o que falta é escrito em horas, minutos ou segundos', () => {
  assert.equal(textoSono(novoTimerSono(60, 0), 0), '1 h 00 min');
  assert.equal(textoSono(novoTimerSono(60, 0), 60000), '59 min');
  assert.equal(textoSono(novoTimerSono(15, 0), 1), '15 min');
  assert.equal(textoSono(novoTimerSono(5, 0), 5 * 60000 - 45000), '45 s');
  assert.equal(textoSono(novoTimerSono(5, 0), 5 * 60000), '0 s');
});

test('todas as opções da folha criam um timer', () => {
  for (const o of OPCOES_SONO) assert.ok(novoTimerSono(o.valor, 0), o.rotulo);
});
