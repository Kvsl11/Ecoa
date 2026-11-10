import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MENOR_TRECHO, relogio, secoesDaLetra, trechoMarcado, voltaDoTrecho } from '../public/js/lib/trechos.js';

// 8 linhas: verso (0-1), refrão (2-3), [solo], verso (4-5), refrão (6-7)
const tempos = [10, 15, 20, 25, 50, 55, 60, 65].map((t) => ({ inicio: t, fim: t + 4 }));
const marcas = new Map([[2, 'Chorus'], [6, 'Chorus']]);
const pausas = new Set([4]);

test('as partes saem das marcações e das pausas da letra sincronizada', () => {
  const s = secoesDaLetra({ tempos, marcas, pausas, duracao: 80 });
  assert.deepEqual(s.map((x) => x.nome), ['Verse 1', 'Chorus 1', 'Verse 2', 'Chorus 2']);
  assert.deepEqual(s.map((x) => x.linha), [0, 2, 4, 6]);
  // o verso acaba onde o refrão começa
  assert.equal(s[0].inicio, 9.7);
  assert.equal(s[0].fim, 20);
  // o refrão antes do solo acaba no fim do que se cantou, não no começo do verso seguinte (25 s depois)
  assert.ok(Math.abs(s[1].fim - 29.4) < 1e-9);
  // a última parte não passa da duração
  assert.ok(s[3].fim <= 80);
});

test('o fim cantado de cada linha, quando informado, vale mais que o do tempo', () => {
  const fins = tempos.map((t) => t.inicio + 2);
  const s = secoesDaLetra({ tempos, marcas, pausas, fins });
  assert.ok(Math.abs(s[1].fim - 27.4) < 1e-9);
});

test('uma parte única fica sem número; as repetidas são numeradas na ordem, mesmo com o número que a cifra trazia', () => {
  const s = secoesDaLetra({ tempos: tempos.slice(0, 4), marcas: new Map([[2, 'Bridge 1']]) });
  assert.deepEqual(s.map((x) => x.nome), ['Verse', 'Bridge']);
  const n = secoesDaLetra({ tempos, marcas: new Map([[2, 'Verse 1'], [4, 'Chorus'], [6, 'Verse 1 ']]) });
  assert.deepEqual(n.map((x) => x.nome), ['Verse 1', 'Verse 2', 'Chorus', 'Verse 3']);
});

test('sem letra sincronizada não há partes; linha sem tempo é ignorada; parte curta demais sai', () => {
  assert.deepEqual(secoesDaLetra({ tempos: null }), []);
  assert.deepEqual(secoesDaLetra({ tempos: [] }), []);
  assert.deepEqual(secoesDaLetra(), []);
  const s = secoesDaLetra({ tempos: [{}, { inicio: 5, fim: 9 }, { inicio: 9.5, fim: 10 }], marcas: new Map([[2, 'Chorus']]) });
  assert.deepEqual(s.map((x) => [x.nome, x.linha]), [['Verse', 1]]);
  assert.ok(s[0].fim - s[0].inicio >= MENOR_TRECHO);
});

test('o trecho marcado à mão fica na ordem certa e tem tamanho mínimo', () => {
  assert.deepEqual(trechoMarcado(30, 12), { nome: 'Trecho marcado', inicio: 12, fim: 30 });
  assert.equal(trechoMarcado(10, 11), null);
  assert.equal(trechoMarcado('x', 11), null);
  assert.deepEqual(trechoMarcado(-3, 500, 200), { nome: 'Trecho marcado', inicio: 0, fim: 200 });
});

test('a música volta ao começo do trecho no fim dele ou quando está antes; dentro dele, segue', () => {
  const t = { inicio: 20, fim: 30 };
  assert.equal(voltaDoTrecho(t, 25), null);
  assert.equal(voltaDoTrecho(t, 19.5), null); // (a folga de quem acabou de voltar)
  assert.equal(voltaDoTrecho(t, 29.96), 20);
  assert.equal(voltaDoTrecho(t, 80), 20);
  assert.equal(voltaDoTrecho(t, 5), 20);
  assert.equal(voltaDoTrecho(null, 5), null);
  assert.equal(voltaDoTrecho(t, NaN), null);
});

test('relógio em minutos e segundos', () => {
  assert.equal(relogio(65.9), '1:05');
  assert.equal(relogio(0), '0:00');
  assert.equal(relogio(-4), '0:00');
});
