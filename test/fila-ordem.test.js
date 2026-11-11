import test from 'node:test';
import assert from 'node:assert/strict';
import { ordemDaPlaylist, ordenarCurtidas } from '../public/js/lib/fila.js';

const MUSICAS = {
  a: { id: 'a', title: 'Zebra', artist: 'Bruno', createdAt: 3 },
  b: { id: 'b', title: 'Amor', artist: 'Ana', createdAt: 1, content: '{album: Zero}' },
  c: { id: 'c', title: 'Casa', artist: 'ana', createdAt: 2, content: '{album: Alfa}' },
  d: { id: 'd', title: 'Baile', artist: 'Élis', createdAt: 4 },
};
const musica = (id) => MUSICAS[id];
const itens = [{ songId: 'a', em: 10 }, { songId: 'b', em: 30 }, { songId: 'c', em: 20 }, { songId: 'd' }, { songId: 'sumiu' }];

test('playlist: a ordem personalizada é a salva', () => {
  assert.deepEqual(ordemDaPlaylist(itens, musica, 'personalizada'), [0, 1, 2, 3, 4]);
});
test('playlist por artista: o artista e, dentro dele, o título; devolve os índices salvos', () => {
  // (a removida, sem artista, vem primeiro; Ana/ana juntas, por título)
  assert.deepEqual(ordemDaPlaylist(itens, musica, 'artista'), [4, 1, 2, 0, 3]);
});
test('playlist por título e pelas adicionadas por último', () => {
  assert.deepEqual(ordemDaPlaylist(itens, musica, 'titulo'), [4, 1, 3, 2, 0]);
  assert.deepEqual(ordemDaPlaylist(itens, musica, 'adicionadas'), [1, 2, 0, 4, 3]);
});
test('curtidas: por artista, título, álbum e recentes, sem mexer na lista recebida', () => {
  const todas = Object.values(MUSICAS);
  const ids = (o) => ordenarCurtidas(todas, o).map((x) => x.id).join('');
  assert.equal(ids('artista'), 'bcad');
  assert.equal(ids('titulo'), 'bdca');
  assert.equal(ids('album'), 'cbda');
  assert.equal(ids('recentes'), 'dacb');
  assert.equal(todas.map((x) => x.id).join(''), 'abcd');
});
