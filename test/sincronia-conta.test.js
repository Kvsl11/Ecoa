import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hash, itensLocais, planejar, semLocais } from '../public/js/lib/sincronia-conta.js';

const base = (m) => Object.fromEntries([...m].map(([k, v]) => [k, hash(v)]));

test('o que é só do aparelho (downloads, áudio próprio, karaokê) não vai para a nuvem', () => {
  const s = { id: 'a', title: 'X', baixado: { arquivos: {} }, audioProprio: { nome: 'a.mp3' }, karaoke: { x: 1 }, rebaixar: true };
  assert.deepEqual(semLocais(s), { id: 'a', title: 'X' });
  const m = itensLocais({ songs: [s], sets: [{ id: 'r', items: [] }], recent: ['a'] });
  assert.deepEqual([...m.keys()], ['m_a', 'r_r', 'recentes']);
  assert.ok(!m.get('m_a').includes('baixado'));
});

test('primeira vez: tudo do aparelho sobe e tudo da nuvem desce', () => {
  const locais = new Map([['m_a', '{"id":"a"}'], ['recentes', '[]']]);
  const remotos = new Map([['m_b', '{"id":"b"}'], ['recentes', '[]']]);
  const p = planejar(locais, remotos, {});
  assert.deepEqual([...p.subir.keys()], ['m_a']);
  assert.deepEqual([...p.aplicar.keys()], ['m_b']);
  assert.deepEqual(Object.keys(p.base).sort(), ['m_a', 'm_b', 'recentes']);
});

test('mudou na nuvem e não aqui: desce; mudou aqui: sobe', () => {
  const antes = new Map([['m_a', '{"v":1}'], ['m_b', '{"v":1}']]);
  const b = base(antes);
  const locais = new Map([['m_a', '{"v":1}'], ['m_b', '{"v":2}']]);
  const p = planejar(locais, new Map([['m_a', '{"v":3}']]), b);
  assert.equal(p.aplicar.get('m_a'), '{"v":3}');
  assert.equal(p.subir.get('m_b'), '{"v":2}');
  assert.equal(p.base.m_a, hash('{"v":3}'));
});

test('mudou dos dois lados: fica a deste aparelho', () => {
  const b = base(new Map([['m_a', '{"v":1}']]));
  const p = planejar(new Map([['m_a', '{"v":2}']]), new Map([['m_a', '{"v":3}']]), b);
  assert.equal(p.aplicar.size, 0);
  assert.equal(p.subir.get('m_a'), '{"v":2}');
});

test('o que este aparelho mesmo mandou volta da nuvem sem mudar nada', () => {
  const b = base(new Map([['m_a', '{"v":1}']]));
  const p = planejar(new Map([['m_a', '{"v":1}']]), new Map([['m_a', '{"v":1}']]), b);
  assert.equal(p.aplicar.size + p.subir.size, 0);
});

test('apagado aqui: apaga na nuvem; apagado em outro aparelho: apaga aqui', () => {
  const b = base(new Map([['m_a', '{"v":1}'], ['m_b', '{"v":1}']]));
  const p = planejar(new Map([['m_b', '{"v":1}']]), new Map([['m_b', null]]), b);
  assert.ok(p.subir.has('m_a') && p.subir.get('m_a') === null);
  assert.ok(p.aplicar.has('m_b') && p.aplicar.get('m_b') === null);
  assert.deepEqual(p.base, {});
});

test('apagado em outro aparelho, mas editado aqui: a edição não se perde', () => {
  const b = base(new Map([['m_a', '{"v":1}']]));
  const p = planejar(new Map([['m_a', '{"v":2}']]), new Map([['m_a', null]]), b);
  assert.equal(p.aplicar.size, 0);
  assert.equal(p.subir.get('m_a'), '{"v":2}');
});

test('apagado aqui, mas editado em outro aparelho: a edição volta', () => {
  const b = base(new Map([['m_a', '{"v":1}']]));
  const p = planejar(new Map(), new Map([['m_a', '{"v":2}']]), b);
  assert.equal(p.aplicar.get('m_a'), '{"v":2}');
  assert.equal(p.subir.size, 0);
});

test('nada mudou: nada sobe', () => {
  const locais = new Map([['m_a', '{"v":1}'], ['recentes', '["a"]']]);
  const p = planejar(locais, new Map(), base(locais));
  assert.equal(p.subir.size, 0);
});
