import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registrar, podar, semanaDe, rotuloDoPeriodo, resumoDoPeriodo, segundosPorDia, mesesFechados, recentesPorDia, rotuloDoDia, minutos } from '../public/js/lib/estatisticas.js';

const musica = (id, titulo, artista, extra = {}) => ({ songId: id, titulo, artista, capa: `${id}.jpg`, ...extra });

test('soma o tempo de cada música no dia e junta as do repertório', () => {
  const r = {};
  registrar(r, '2026-11-05', musica('a', 'Neverender', 'Justice'), 0, 1);
  registrar(r, '2026-11-05', musica('a', 'Neverender', 'Justice'), 120, 2);
  registrar(r, '2026-11-05', musica('b', 'Santo', 'Padre Zezinho', { setId: 's1', repertorio: 'Missa de domingo' }), 60, 3);
  registrar(r, '2026-11-05', musica('c', 'Glória', 'CNBB', { setId: 's1', repertorio: 'Missa de domingo' }), 30, 4);
  assert.equal(r['2026-11-05']['m:a'].s, 120);
  const rep = r['2026-11-05']['r:s1'];
  assert.equal(rep.t, 'Missa de domingo');
  assert.equal(rep.s, 90);
  assert.deepEqual(Object.keys(rep.m), ['b', 'c']);
});

test('ignora o que não tem título', () => {
  assert.deepEqual(registrar({}, '2026-11-05', { songId: 'x' }, 10), {});
});

test('a semana vai de domingo a sábado', () => {
  assert.deepEqual(semanaDe('2026-11-05'), { inicio: '2026-11-01', fim: '2026-11-07' });
  assert.equal(rotuloDoPeriodo(semanaDe('2026-11-05')), '1–7 de nov.');
  assert.equal(rotuloDoPeriodo(semanaDe('2026-10-29')), '25–31 de out.');
  assert.equal(rotuloDoPeriodo({ inicio: '2026-09-27', fim: '2026-10-03' }), '27 de set. – 3 de out.');
});

test('o resumo da semana: minutos, artistas e músicas mais ouvidos', () => {
  const r = {};
  registrar(r, '2026-11-02', musica('a', 'Neverender', 'Justice'), 600);
  registrar(r, '2026-11-03', musica('b', 'D.A.N.C.E.', 'Justice'), 300);
  registrar(r, '2026-11-04', musica('c', 'Let It Happen', 'Tame Impala'), 700);
  registrar(r, '2026-10-20', musica('d', 'Fora da semana', 'Outro'), 900);
  const s = resumoDoPeriodo(r, semanaDe('2026-11-05'));
  assert.equal(minutos(s.segundos), 26);
  assert.equal(s.artistas[0].nome, 'Justice');
  assert.equal(s.artistas[0].s, 900);
  assert.equal(s.musicas[0].t, 'Let It Happen');
  assert.equal(s.musicas.length, 3);
  assert.deepEqual(segundosPorDia(r, semanaDe('2026-11-05')).map((d) => d.s), [0, 600, 300, 700, 0, 0, 0]);
});

test('os meses fechados, do mais novo para o mais antigo', () => {
  const r = {};
  registrar(r, '2026-09-10', musica('a', 'A', 'X'), 120);
  registrar(r, '2026-10-10', musica('b', 'B', 'Y'), 3000);
  registrar(r, '2026-11-01', musica('c', 'C', 'Z'), 3000);
  const m = mesesFechados(r, '2026-11-05');
  assert.deepEqual(m.map((x) => x.mes), ['2026-10', '2026-09']);
  assert.equal(m[0].nome, 'outubro');
  assert.equal(m[0].musica.t, 'B');
});

test('os recentes por dia, o mais novo primeiro', () => {
  const r = {};
  registrar(r, '2026-11-04', musica('a', 'A', 'X'), 10, 1);
  registrar(r, '2026-11-05', musica('b', 'B', 'Y'), 10, 2);
  registrar(r, '2026-11-05', musica('c', 'C', 'Y', { setId: 's', repertorio: 'Missa' }), 10, 3);
  const d = recentesPorDia(r);
  assert.deepEqual(d.map((x) => x.dia), ['2026-11-05', '2026-11-04']);
  assert.deepEqual(d[0].itens.map((x) => x.t), ['Missa', 'B']);
  assert.deepEqual(recentesPorDia(r, { tipo: 'repertorio' }).map((x) => x.dia), ['2026-11-05']);
  assert.equal(rotuloDoDia('2026-11-05', '2026-11-05'), 'Hoje');
  assert.equal(rotuloDoDia('2026-11-04', '2026-11-05'), 'Ontem');
  assert.equal(rotuloDoDia('2026-11-03', '2026-11-05'), 'ter., 3 de nov.');
  assert.equal(rotuloDoDia('2025-12-31', '2026-11-05'), 'qua., 31 de dez. de 2025');
});

test('tira os dias muito antigos', () => {
  const r = { '2024-01-01': {}, '2026-11-01': {} };
  podar(r, '2026-11-05', 30);
  assert.deepEqual(Object.keys(r), ['2026-11-01']);
});
