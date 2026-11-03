import { test } from 'node:test';
import assert from 'node:assert/strict';
import { harmonizarCoral, vozearAcorde, EXTENSOES } from '../public/js/lib/harmonizar.js';
import { midiDa } from '../public/js/lib/partitura.js';
import { notasDaCifra } from '../public/js/lib/alinhamento.js';

const ev = (a, d, l = '', c = '') => ({ a: a ? [a] : [], d, l: l ? [l] : [], c });
const soprano = (evs) => ({ id: 's', nome: 'Soprano', clave: 'G', ev: evs });
const alturas = (p) => p.ev.map((e) => (e.a.length ? midiDa(e.a[0]) : null));

test('coral pela cifra: Contralto, Tenor e Baixo no acorde, sem cruzar, na extensão e no ritmo do Soprano', () => {
  const s = soprano([
    ev('B4', 8, 'San', 'G'), ev('D5', 8, 'to'), ev('B4', 8, 'é', 'Em'), ev('A4', 8, 'o', 'C'),
    ev('G4', 8, 'Se', 'D'), ev('F#4', 8, 'nhor', 'D7'), ev('G4', 16, 'Deus', 'G'), ev(null, 8),
  ]);
  const pautas = harmonizarCoral(s, { fifths: 1 });
  assert.deepEqual(pautas.map((p) => p.nome), ['Soprano', 'Contralto', 'Tenor', 'Baixo']);
  assert.deepEqual(pautas.map((p) => p.clave), ['G', 'G', 'G8', 'F']);
  const [S, C, T, B] = pautas.map(alturas);
  const acordes = ['G', 'G', 'Em', 'C', 'D', 'D7', 'G'];
  for (let i = 0; i < acordes.length; i++) {
    // sem cruzar
    assert.ok(S[i] >= C[i] && C[i] >= T[i] && T[i] >= B[i], `${i}: ${S[i]} ${C[i]} ${T[i]} ${B[i]}`);
    const ac = notasDaCifra(acordes[i]);
    const classes = new Set(ac.notas.map((n) => n.pc));
    for (const x of [C[i], T[i], B[i]]) assert.ok(classes.has(x % 12), `${acordes[i]}: ${x}`);
    // o baixo na fundamental e a terça presente
    assert.equal(B[i] % 12, ac.baixo);
    assert.ok([S[i], C[i], T[i], B[i]].some((x) => x % 12 === ac.notas[1].pc), `${acordes[i]} sem terça`);
  }
  // nas extensões
  for (const [v, xs] of [['c', C], ['t', T], ['b', B]]) for (const x of xs.filter((y) => y != null)) assert.ok(x >= EXTENSOES[v][0] && x <= EXTENSOES[v][1], `${v}: ${x}`);
  // a mesma letra, no mesmo ritmo, e a pausa junto
  for (const p of pautas.slice(1)) {
    assert.deepEqual(p.ev.map((e) => e.d), s.ev.map((e) => e.d));
    assert.deepEqual(p.ev.map((e) => e.l[0] || ''), s.ev.map((e) => e.l[0] || ''));
    assert.deepEqual(p.ev.at(-1).a, []);
  }
});

test('coral pela cifra: acorde com barra põe a nota da barra no Baixo', () => {
  const r = vozearAcorde(midiDa('D5'), notasDaCifra('G/B'));
  assert.equal(r.b % 12, 11);
});

test('coral pela cifra: a nota de passagem da melodia não mexe nas outras vozes', () => {
  const s = soprano([ev('B4', 8, 'a', 'G'), ev('C5', 4, 'le'), ev('D5', 4, 'lu')]);
  const [, C, T, B] = harmonizarCoral(s).map(alturas);
  assert.equal(C[1], C[0]);
  assert.equal(T[1], T[0]);
  assert.equal(B[1], B[0]);
});

test('coral pela cifra: sem quintas nem oitavas paralelas numa cadência simples', () => {
  const s = soprano([ev('E5', 8, 'a', 'C'), ev('F5', 8, 'b', 'F'), ev('D5', 8, 'c', 'G'), ev('C5', 8, 'd', 'C')]);
  const vozes = harmonizarCoral(s).map(alturas);
  for (let i = 1; i < 4; i++) {
    for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) {
      const [x0, y0, x1, y1] = [vozes[a][i - 1], vozes[b][i - 1], vozes[a][i], vozes[b][i]];
      if (x0 === x1 || y0 === y1) continue;
      const i0 = Math.abs(x0 - y0) % 12;
      const i1 = Math.abs(x1 - y1) % 12;
      assert.ok(!((i0 === 7 && i1 === 7) || (i0 === 0 && i1 === 0)), `paralela entre ${a} e ${b} no ${i}`);
    }
  }
});

test('coral pela cifra: o melisma do Soprano (sem sílaba nova) é uma nota só nas outras vozes', () => {
  const s = soprano([ev('G4', 8, 'Glo', 'G'), ev('A4', 4), ev('B4', 4), ev('G4', 8, 'ria')]);
  const pautas = harmonizarCoral(s);
  for (const p of pautas.slice(1)) assert.equal(p.ev.reduce((a, e) => a + e.d, 0), 24);
  assert.ok(pautas[3].ev.length < 4);
});

test('coral pela cifra: sem nenhum acorde, null (o app usa as vozes do áudio)', () => {
  assert.equal(harmonizarCoral(soprano([ev('G4', 8, 'a')])), null);
});
