import { test } from 'node:test';
import assert from 'node:assert/strict';
import { versaoDoApk } from '../app-android/scripts/versao-apk.mjs';
import { notasDaRelease } from '../app-android/scripts/notas-release.mjs';
import { NOVIDADES, novidadesQueChegam, versaoDoAppDaNovidade } from '../public/js/lib/novidades.js';

test('versão do APK: leva as novidades que vão dentro dele', () => {
  const v = versaoDoApk('62', '1.62');
  assert.equal(v.codigo, 62);
  assert.equal(v.nome, '1.62');
  assert.equal(v.web, NOVIDADES[0].versao);
  assert.equal(v.novidades.length, NOVIDADES.length);
  assert.equal(v.novidades[0].titulo, NOVIDADES[0].titulo);
  assert.ok(Array.isArray(v.novidades[0].itens) && typeof v.novidades[0].itens[0] === 'string');
});

test('aviso de versão nova: só as novidades que o app instalado ainda não tem', () => {
  const novs = [{ versao: 12, titulo: 'C', itens: [] }, { versao: 11, titulo: 'B', itens: [] }, { versao: 10, titulo: 'A', itens: [] }];
  const publicada = versaoDoApk(5, '1.5', novs);
  assert.deepEqual(novidadesQueChegam(publicada, 10).map((n) => n.titulo), ['C', 'B']);
  assert.deepEqual(novidadesQueChegam(publicada, 12), []);
  // (o arquivo de antes, só com o número: nada, em vez das novidades antigas do app instalado)
  assert.deepEqual(novidadesQueChegam({ codigo: 5, nome: '1.5' }, 10), []);
});

test('versão do APK: o histórico dos APKs publicados continua de um para o outro', () => {
  const novs = [{ versao: 12, titulo: 'C', itens: [] }];
  const primeiro = versaoDoApk(70, '1.70', novs, { codigo: 69, nome: '1.69', web: 11 });
  assert.deepEqual(primeiro.historico, [{ codigo: 69, nome: '1.69', web: 11 }, { codigo: 70, nome: '1.70', web: 12 }]);
  // (o arquivo de antes do histórico, sem a versão das novidades: começa só com este)
  assert.deepEqual(versaoDoApk(70, '1.70', novs, { codigo: 69, nome: '1.69' }).historico, [{ codigo: 70, nome: '1.70', web: 12 }]);
  const segundo = versaoDoApk(71, '1.71', novs, primeiro);
  assert.deepEqual(segundo.historico.map((h) => h.codigo), [69, 70, 71]);
});

test('Novidades no app: a versão do app em que cada novidade chegou, ou nada', () => {
  const h = [{ codigo: 62, nome: '1.62', web: 575 }, { codigo: 64, nome: '1.64', web: 577 }];
  assert.equal(versaoDoAppDaNovidade(577, h), '1.64');
  assert.equal(versaoDoAppDaNovidade(576, h), '1.64');
  // (a que veio no primeiro APK conhecido, ou antes dele: não dá para saber)
  assert.equal(versaoDoAppDaNovidade(575, h), null);
  assert.equal(versaoDoAppDaNovidade(570, h), null);
  assert.equal(versaoDoAppDaNovidade(578, h), null);
});

test('nota da Release Android: a última nota técnica com o tipo e o texto de cada item', () => {
  const nota = notasDaRelease();
  const atual = NOVIDADES[0];
  assert.ok(nota.includes(`**Versão ${atual.versao} — ${atual.data}: ${atual.titulo}**`));
  for (const item of atual.itens) assert.ok(nota.includes(` — ${item.texto}`), item.texto.slice(0, 40));
  assert.ok(!/undefined|\*\*\*\*/.test(nota), nota);
  assert.match(nota, /- \*\*(NOVO|MELHORIA|CORREÇÃO)\*\* — /);
  // (os itens só com o texto, como no Ecoa-versao.json, também saem inteiros)
  const doJson = notasDaRelease(versaoDoApk(1, '1.1').novidades);
  assert.ok(doJson.includes(`- ${atual.itens[0].texto}`) && !/undefined|\*\*\*\*/.test(doJson));
  assert.ok(notasDaRelease([]).includes('Não há nota técnica cadastrada.'));
});
