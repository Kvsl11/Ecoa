import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { comIdioma, linguaDaResposta, SISTEMA } from '../public/js/lib/lumen-local.js';

test('o Lúmen responde no idioma do aparelho (português, inglês, espanhol; os outros em inglês)', () => {
  assert.match(comIdioma(SISTEMA, 'pt'), /Responda em português do Brasil/);
  assert.match(comIdioma(SISTEMA, 'en'), /Responda em inglês \(English\)/);
  assert.match(comIdioma(SISTEMA, 'es'), /Responda em espanhol \(español\)/);
  assert.equal(linguaDaResposta('fr'), linguaDaResposta('en'));
  // (a troca depende da frase: se ela mudar na instrução, a resposta voltaria a vir sempre em português)
  assert.notEqual(comIdioma(SISTEMA, 'en'), SISTEMA);
});

test('o servidor do Lúmen recebe o idioma e troca a mesma frase da instrução', async () => {
  const duvidas = await readFile(new URL('../servidor-ia/duvidas.py', import.meta.url), 'utf8');
  const app = await readFile(new URL('../servidor-ia/app.py', import.meta.url), 'utf8');
  assert.ok(duvidas.includes('Responda em português do Brasil'));
  assert.ok(duvidas.includes('com_idioma(SISTEMA, idioma)'));
  assert.ok(app.includes('idioma=pedido.idioma'));
});
