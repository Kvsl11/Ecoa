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

test('o artista do Deezer: o nome escrito junto vale, e entre os iguais fica o de mais fãs', async () => {
  const { artistaDeezerCerto, mesmoNomeDeArtista, faixaDaMusica } = await import('../public/js/lib/artistas.js');
  const busca = [
    { id: 248616612, name: 'Jung Kook', nb_fan: 7898 },
    { id: 9172904, name: 'Jungkook', nb_fan: 475487 },
    { id: 14480935, name: 'Jung Joonil', nb_fan: 1097 },
  ];
  assert.equal(artistaDeezerCerto(busca, 'Jung Kook').id, 9172904);
  assert.equal(artistaDeezerCerto(busca, 'Jungkook').id, 9172904);
  assert.ok(mesmoNomeDeArtista('JUNG KOOK', 'Jungkook'));
  assert.ok(!mesmoNomeDeArtista('Jung Joonil', 'Jung Kook'));
  // (o de nome igual, sem outro do mesmo nome, continua valendo)
  assert.equal(artistaDeezerCerto([{ id: 1, name: 'Kemuel', nb_fan: 300 }, { id: 2, name: 'Kemuel Silva', nb_fan: 90000 }], 'Kemuel').id, 1);
  // (vários iguais e nenhum conhecido: nenhum)
  assert.equal(artistaDeezerCerto([{ id: 1, name: 'Belief', nb_fan: 96 }, { id: 2, name: 'belief', nb_fan: 12 }], 'Belief'), null);
  // (só parecido: vale o conhecido)
  assert.equal(artistaDeezerCerto([{ id: 3, name: 'Belief Defect', nb_fan: 50 }], 'Belief'), null);
  assert.equal(artistaDeezerCerto([{ id: 4, name: 'Frei Gilson - CMES', nb_fan: 5000 }], 'Frei Gilson').id, 4);
  // a faixa da música diz quem canta
  const faixas = [
    { title: 'Standing Next to You (Piano rendition of Jung Kook, Latto)', artist: { id: 146804532, name: 'The Lullabeats' } },
    { title: 'Standing Next to You', artist: { id: 9172904, name: 'JUNG KOOK' } },
  ];
  assert.equal(faixaDaMusica(faixas, { titulo: 'Standing Next to You', artista: 'Jung Kook' }).artist.id, 9172904);
  assert.equal(faixaDaMusica(faixas, { titulo: 'Seven', artista: 'Jung Kook' }), null);
});

test('primeiraPorPreferencia: a preferida vence, mesmo chegando depois de uma de menos preferência', async () => {
  const { primeiraPorPreferencia } = await import('../public/js/lib/artistas.js');
  const depois = (ms, v) => () => new Promise((ok) => setTimeout(() => ok(v), ms));
  assert.equal(await primeiraPorPreferencia([depois(60, 'canal'), depois(5, 'deezer')], { folga: 500 }), 'canal');
  // a preferida sem foto: vale a próxima, sem esperar o tempo da folga
  assert.equal(await primeiraPorPreferencia([depois(5, ''), depois(10, 'cifra'), depois(1000, 'deezer')], { folga: 5000 }), 'cifra');
  // uma que falha conta como sem foto
  assert.equal(await primeiraPorPreferencia([() => Promise.reject(new Error('fora')), depois(5, 'deezer')]), 'deezer');
  assert.equal(await primeiraPorPreferencia([depois(5, ''), depois(5, '')]), '');
  assert.equal(await primeiraPorPreferencia([]), '');
});

test('primeiraPorPreferencia: a preferida lenta é esperada só a folga (e sempre, com folga 0)', async () => {
  const { primeiraPorPreferencia } = await import('../public/js/lib/artistas.js');
  const depois = (ms, v) => () => new Promise((ok) => setTimeout(() => ok(v), ms));
  const ini = Date.now();
  assert.equal(await primeiraPorPreferencia([depois(3000, 'canal'), depois(5, 'deezer')], { folga: 50 }), 'deezer');
  assert.ok(Date.now() - ini < 1000, 'não esperou o YouTube lento');
  assert.equal(await primeiraPorPreferencia([depois(150, 'canal'), depois(5, 'deezer')], { folga: 0 }), 'canal');
});
