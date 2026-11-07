import { test } from 'node:test';
import assert from 'node:assert/strict';
import { notaDaCapa, ordenarCapas, escolherCapa, problemaDaCapa, chaveDaImagem } from '../public/js/lib/capas.js';

// (o que o Deezer devolveu de verdade na busca, resumido: título, artista, álbum, popularidade)
const c = (titulo, artista, album, rank) => ({ titulo, artista, album, rank, url: `${artista}/${album}` });
const BEATLES = [
  c('Here Comes The Sun (Remastered 2009)', 'The Beatles', 'Abbey Road (Remastered 2009)', 886736),
  c('Here Comes The Sun (2019 Mix)', 'The Beatles', 'Abbey Road (Super Deluxe Edition)', 615257),
  c('Here Comes The Sun (Take 9)', 'The Beatles', 'Abbey Road (Super Deluxe Edition)', 242514),
  c('Here Comes The Sun / The Inner Light', 'The Beatles', 'Love', 296688),
  c('Here Comes the Sun', 'BPC - Beatles Para Crianças', 'Beatles para Crianças', 139246),
  c('Here Comes the Sun', 'London Symphony Orchestra', 'The Beatles Classics', 64969),
  c('Here Comes the Sun (Live)', 'The Beatles Revival Band', 'Live at the Alte Oper Frankfurt (Live)', 85522),
  c('Here Comes the Sun', 'The Beatles Complete On Ukulele', 'Here Comes The Sun', 50000),
];
const KEMUEL = [
  c('Aba (Ao Vivo)', 'Kemuel', 'Aba (Ao Vivo)', 662141),
  c('Aba (Acústico)', 'Kemuel', 'Filhos Acústico', 279416),
  c('Aba', 'Kemuel', 'Carro Kemuel', 109258),
  c('Algo Novo (feat. Lukas Agustinho)', 'Kemuel', 'Algo Novo', 666371),
  c('A Resposta', 'Thalles Roberto', 'Luz', 584779),
];

test('Here Comes The Sun: a capa do Abbey Road, não a do ukulele nem a dos covers', () => {
  const o = ordenarCapas(BEATLES, { titulo: 'Here Comes The Sun', artista: 'The Beatles' });
  assert.equal(o[0].album, 'Abbey Road (Remastered 2009)');
  assert.ok(o.every((x) => x.artista === 'The Beatles'), o.map((x) => x.artista).join(', '));
  assert.ok(!o.some((x) => x.album === 'Love')); // (outra música: o medley)
});

test('Aba do Kemuel: a do single que todo mundo conhece, não a da coletânea', () => {
  const o = ordenarCapas(KEMUEL, { titulo: 'Aba', artista: 'Kemuel' });
  assert.equal(o[0].album, 'Aba (Ao Vivo)');
  assert.deepEqual(o.map((x) => x.album), ['Aba (Ao Vivo)', 'Filhos Acústico', 'Carro Kemuel']);
});

test('o artista de nome só parecido conta apenas quando não há o igual', () => {
  const so = [c('Here Comes the Sun (Live)', 'The Beatles Revival Band', 'Live', 85522)];
  assert.equal(ordenarCapas(so, { titulo: 'Here Comes The Sun', artista: 'The Beatles' }).length, 1);
  const os2 = [...so, c('Here Comes The Sun', 'The Beatles', 'Abbey Road', 10)];
  assert.equal(ordenarCapas(os2, { titulo: 'Here Comes The Sun', artista: 'The Beatles' })[0].album, 'Abbey Road');
});

test('karaokê, cover e versão infantil quase não contam, mesmo muito ouvidos', () => {
  const l = [c('Song (Karaoke Version)', 'Ana', 'Karaoke Hits', 900000), c('Song', 'Ana', 'Album', 1000)];
  assert.equal(ordenarCapas(l, { titulo: 'Song', artista: 'Ana' })[0].album, 'Album');
});

test('o convidado no "feat." também é o artista da música', () => {
  const l = [c('I Like You (A Happier Song) (feat. Doja Cat)', 'Post Malone', 'Twelve Carat Toothache', 800000)];
  assert.ok(notaDaCapa(l[0], { titulo: 'I Like You (A Happier Song)', artista: 'Doja Cat' }) > 0);
});

test('sem o mesmo título, não é a capa', () => {
  assert.equal(notaDaCapa(c('Here Comes The Rain', 'The Beatles', 'X', 9), { titulo: 'Here Comes The Sun', artista: 'The Beatles' }), 0);
});

test('a coletânea ("Mais Tocadas", "Hits") fica depois do álbum e do single, mesmo mais ouvida', () => {
  const l = [c('Aba', 'Kemuel', 'Kemuel Mais Tocadas', 900000), c('Aba (Ao Vivo)', 'Kemuel', 'Aba (Ao Vivo)', 662141), c('Aba', 'Kemuel', 'Melhores Kemuel', 500000)];
  const o = ordenarCapas(l, { titulo: 'Aba', artista: 'Kemuel' });
  assert.equal(o[0].album, 'Aba (Ao Vivo)');
  assert.equal(o.length, 3); // (as coletâneas continuam para escolher à mão)
});

test('a escolhida é a primeira da ordem que abre, não a maior nem a mais ouvida', () => {
  // (a coletânea gospel mais ouvida e maior não passa à frente do single)
  const validas = [
    { ...c('Aba', 'Kemuel', 'Aba (Ao Vivo)', 100), i: 0, largura: 1000, altura: 1000 },
    { ...c('Aba', 'Kemuel', 'Louvores Mais Tocadas', 900000), i: 3, largura: 1400, altura: 1400 },
  ];
  assert.equal(escolherCapa(validas).album, 'Aba (Ao Vivo)');
  // o mesmo álbum nas duas fontes: a maior
  const duas = [
    { ...c('Aba', 'Kemuel', 'Aba (Ao Vivo)', 1), url: 'a', i: 0, largura: 600, altura: 600 },
    { ...c('Aba', 'Kemuel', 'Aba (Ao Vivo)', 1), url: 'b', i: 2, largura: 1000, altura: 1000 },
  ];
  assert.equal(escolherCapa(duas).url, 'b');
  assert.equal(escolherCapa([]), null);
});

test('o problema da capa: coletânea, outra gravação ou nenhum', () => {
  const m = { titulo: 'Aba', artista: 'Kemuel' };
  assert.equal(problemaDaCapa(c('Aba', 'Kemuel', 'Aba (Ao Vivo)', 1), m), '');
  assert.equal(problemaDaCapa(c('Aba', 'Kemuel', 'As Mais Tocadas Gospel', 1), m), 'coletanea');
  assert.equal(problemaDaCapa(c('Aba (Playback)', 'Kemuel', 'Aba', 1), m), 'outra');
});

test('a mesma capa em outro tamanho tem a mesma chave', () => {
  assert.equal(chaveDaImagem('https://e-cdns-images.dzcdn.net/images/cover/abc/1000x1000-000000-80-0-0.jpg'), chaveDaImagem('https://cdn-images.dzcdn.net/images/cover/abc/500x500-000000-80-0-0.jpg'));
  assert.equal(chaveDaImagem('https://is1-ssl.mzstatic.com/image/thumb/Music/x/y.jpg/1000x1000bb.jpg'), chaveDaImagem('https://is1-ssl.mzstatic.com/image/thumb/Music/x/y.jpg/100x100bb.jpg'));
  assert.notEqual(chaveDaImagem('https://e-cdns-images.dzcdn.net/images/cover/abc/1000x1000-000000-80-0-0.jpg'), chaveDaImagem('https://e-cdns-images.dzcdn.net/images/cover/xyz/1000x1000-000000-80-0-0.jpg'));
});
