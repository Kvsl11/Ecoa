import { test } from 'node:test';
import assert from 'node:assert/strict';
import { separarArtistas, nomesParaConferir, primeiroArtista } from '../public/js/lib/artistas.js';

const sabe = (mapa) => (n) => mapa[n];

test('a dupla fica junta enquanto não se sabe', () => {
  assert.deepEqual(separarArtistas('Jorge & Mateus'), ['Jorge & Mateus']);
  assert.deepEqual(separarArtistas('Henrique & Juliano, Marília Mendonça'), ['Henrique & Juliano', 'Marília Mendonça']);
  assert.deepEqual(separarArtistas('Zezé Di Camargo e Luciano'), ['Zezé Di Camargo e Luciano']);
});

test('o que o Deezer disse vale', () => {
  assert.deepEqual(separarArtistas('Anitta & Ludmilla', { unico: sabe({ 'Anitta & Ludmilla': false }) }), ['Anitta', 'Ludmilla']);
  assert.deepEqual(separarArtistas('Jorge & Mateus', { unico: sabe({ 'Jorge & Mateus': true }) }), ['Jorge & Mateus']);
  assert.deepEqual(separarArtistas('Sá, Rodrix & Guarabyra', { unico: sabe({ 'Sá, Rodrix & Guarabyra': true }) }), ['Sá, Rodrix & Guarabyra']);
});

test('os separadores fortes e três nomes com "&" separam', () => {
  assert.deepEqual(separarArtistas('Lady Gaga / Bruno Mars'), ['Lady Gaga', 'Bruno Mars']);
  assert.deepEqual(separarArtistas('MC A x MC B'), ['MC A', 'MC B']);
  assert.deepEqual(separarArtistas('A & B & C'), ['A', 'B', 'C']);
});

test('nos compositores, " e " também liga (e separa quando não é dupla)', () => {
  assert.deepEqual(separarArtistas('Fulano e Beltrano e Ciclano', { comE: true }), ['Fulano', 'Beltrano', 'Ciclano']);
  assert.deepEqual(separarArtistas('Fulano e Beltrano', { comE: true }), ['Fulano', 'Beltrano']);
  assert.deepEqual(separarArtistas('Fulano & Beltrano', { comE: true }), ['Fulano & Beltrano']);
  assert.deepEqual(separarArtistas('Victor e Leo', { comE: true, unico: sabe({ 'Victor e Leo': true }) }), ['Victor e Leo']);
});

test('os nomes que vale conferir', () => {
  assert.deepEqual(nomesParaConferir('Jorge & Mateus'), ['Jorge & Mateus']);
  assert.deepEqual(nomesParaConferir('Anitta, Ludmilla'), []);
  assert.deepEqual(nomesParaConferir('Henrique & Juliano, Marília Mendonça'), ['Henrique & Juliano, Marília Mendonça', 'Henrique & Juliano']);
});

test('o primeiro artista, para a capa e a foto', () => {
  assert.equal(primeiroArtista('Jorge & Mateus'), 'Jorge & Mateus');
  assert.equal(primeiroArtista('Lady Gaga feat. Bruno Mars'), 'Lady Gaga');
  assert.equal(primeiroArtista('Zezé Di Camargo e Luciano'), 'Zezé Di Camargo e Luciano');
  assert.equal(primeiroArtista('Anitta & Ludmilla', { unico: () => false }), 'Anitta');
  assert.equal(primeiroArtista('Anitta, Ludmilla'), 'Anitta');
});
