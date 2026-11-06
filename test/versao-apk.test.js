import { test } from 'node:test';
import assert from 'node:assert/strict';
import { versaoDoApk } from '../app-android/scripts/versao-apk.mjs';
import { NOVIDADES, novidadesQueChegam } from '../public/js/lib/novidades.js';

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
