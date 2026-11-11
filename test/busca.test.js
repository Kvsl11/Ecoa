import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palavrasDaBusca, notaNaBusca, soOsDaBusca } from '../public/js/lib/busca.js';

// (o que as fontes devolveram de verdade para "Blood in your eyea": título · artista ou canal)
const LISTA = [
  'Shoulda Put Something On · N-Dubz',
  'Blood In Your Eyes · Tove Lo',
  'Grand Theft Auto VI: Pre-Load Now · Rockstar Games',
  'How do I treat a broken blood vessel in my eye? - Ask an Ophthalmologist · EyeSmart',
  'Elevator Eyes · Tove Lo',
];
const filtrar = (termo, lista = LISTA) => soOsDaBusca(lista, termo, (x) => x);

test('as palavras da busca: sem as vazias, a não ser que só haja vazias', () => {
  assert.deepEqual(palavrasDaBusca('Blood in your eyea'), ['blood', 'eyea']);
  assert.deepEqual(palavrasDaBusca('Noites Traiçoeiras'), ['noites', 'traicoeiras']);
  assert.deepEqual(palavrasDaBusca('The One'), ['one']);
  assert.deepEqual(palavrasDaBusca('a de'), ['a', 'de']);
});

test('"Blood in your eyea" (com o erro de digitação): só a música, sem o que tem uma palavra em comum', () => {
  assert.deepEqual(filtrar('Blood in your eyea'), ['Blood In Your Eyes · Tove Lo']);
  assert.deepEqual(filtrar('blood in your eyes tove lo'), ['Blood In Your Eyes · Tove Lo', 'Elevator Eyes · Tove Lo']);
});

test('a busca ainda sendo digitada casa pelo começo da palavra; "eye" não é "eyea"', () => {
  assert.equal(notaNaBusca('noites trai', 'Noites Traiçoeiras · Padre Marcelo Rossi'), 1);
  assert.equal(notaNaBusca('Blood in your eyea', 'How do I treat a broken blood vessel in my eye?'), 0.5);
  assert.equal(notaNaBusca('', 'qualquer'), 1);
});

test('sem nenhum resultado que case (a busca por um trecho da letra), a lista fica como veio', () => {
  const l = ['Noites Traiçoeiras · Padre Marcelo Rossi', 'Outra · Alguém'];
  assert.deepEqual(filtrar('deus está aqui neste momento', l), l);
  assert.deepEqual(soOsDaBusca([], 'x', (x) => x), []);
});

test('os que casam inteiro vêm antes dos que casam em parte, na ordem em que vieram', () => {
  const l = ['Tu És Adorado · Antônio Cirilo', 'Só Tu És Santo · MORADA', 'Tu és Santo · Ronaldo Bezerra', 'Aleluia · Coral'];
  assert.deepEqual(filtrar('tu és santo', l), ['Só Tu És Santo · MORADA', 'Tu és Santo · Ronaldo Bezerra', 'Tu És Adorado · Antônio Cirilo']);
});
