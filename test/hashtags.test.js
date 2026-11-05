import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emIngles, hashtagsDaMusica, idiomaDaLetra, numeroCurto } from '../public/js/lib/hashtags.js';
import { artistaDaMusicBrainz, generosDaMusicBrainz, musicaDaAudioDb, perfisDaMusicBrainz } from '../public/js/lib/web.js';

test('número curto dos seguidores, como nos stories', () => {
  assert.equal(numeroCurto(90300000), '90,3M');
  assert.equal(numeroCurto(104565684), '105M');
  assert.equal(numeroCurto(13462718), '13,5M');
  assert.equal(numeroCurto(850000), '850K');
  assert.equal(numeroCurto(1200), '1,2K');
  assert.equal(numeroCurto(2000000), '2M');
  assert.equal(numeroCurto(999), '999');
  assert.equal(numeroCurto(1500000000), '1,5B');
});

test('a língua da letra (sem os acordes do ChordPro)', () => {
  assert.equal(idiomaDaLetra('{title: X}\n[G]Baby, I just might [D]fall in love with you tonight, yeah, and you know it is all I need, oh'), 'en');
  assert.equal(idiomaDaLetra('[C]Eu te amo, meu [G]amor, você é tudo que eu quero para a minha vida, não vou te deixar'), 'pt');
  assert.equal(idiomaDaLetra('curta'), '');
  assert.equal(emIngles({ letra: '', pais: 'US' }), true);
  assert.equal(emIngles({ letra: '', pais: 'BR' }), false);
  assert.equal(emIngles({ titulo: 'I Just Might' }), true);
  assert.equal(emIngles({ titulo: 'Noites Traiçoeiras' }), false);
});

test('hashtags: pelo menos 6, sem repetir, e diferentes entre as músicas do mesmo artista', () => {
  const generos = ['pop', 'funk', 'r&b', 'hip hop', 'soul'];
  const listas = ['a', 'b', 'c', 'd'].map((semente) => hashtagsDaMusica({ generos, generoArtista: 'Pop', semente, ingles: true }));
  for (const l of listas) {
    assert.ok(l.length >= 6 && l.length <= 10, l.join(','));
    assert.equal(new Set(l).size, l.length);
    assert.deepEqual(l.slice(0, 2), ['pop', 'funk']); // (os gêneros de verdade do artista)
  }
  assert.ok(new Set(listas.map((l) => l.join(','))).size >= 3, 'as músicas do mesmo artista não saem todas iguais');
  // a mesma música: sempre as mesmas
  assert.deepEqual(hashtagsDaMusica({ generos, semente: 'a', ingles: true }), hashtagsDaMusica({ generos, semente: 'a', ingles: true }));
});

test('hashtags: o clima da música, os temas da letra e, em português, as traduzidas', () => {
  const h = hashtagsDaMusica({ musica: { mood: 'Happy', theme: 'In Love' }, generos: ['pop'], semente: 'x', ingles: true, letra: 'baby dance with me, dance dance all night tonight' });
  assert.deepEqual(h.slice(0, 5), ['happy', 'in love', 'dance', 'late night', 'pop']);
  assert.ok(!h.includes('happy pop')); // (com #happy, o #happy pop não entra)
  const pt = hashtagsDaMusica({ musica: { mood: 'Happy' }, generos: ['sertanejo'], semente: 'y', ingles: false, letra: 'saudade, saudade, vou chorar, meu amor, amor' });
  assert.deepEqual(pt.slice(0, 4), ['alegre', 'saudade', 'apaixonada', 'sertanejo']);
  assert.ok(pt.length >= 6);
  const missa = hashtagsDaMusica({ generoArtista: 'liturgia', semente: 'm', ingles: false, letra: 'Senhor Deus, aleluia, Senhor Jesus Cristo' });
  assert.equal(missa[0], 'fé');
  assert.ok(missa.length >= 6);
  assert.ok(hashtagsDaMusica({ semente: 'z', ingles: false }).length >= 6); // (sem nada: as de sempre)
});

test('generosDaMusicBrainz: os gêneros mais votados, só do artista com o mesmo nome', () => {
  const json = { artists: [
    { name: 'Bruno Mars', score: 100, tags: [{ count: 6, name: 'funk' }, { count: 14, name: 'pop' }, { count: 5, name: 'R&B' }, { count: 0, name: 'x' }] },
    { name: 'Bruno Mars Tribute', score: 68, tags: [{ count: 50, name: 'karaoke' }] },
  ] };
  assert.deepEqual(generosDaMusicBrainz(json, 'Bruno Mars'), ['pop', 'funk', 'r&b']);
  assert.deepEqual(generosDaMusicBrainz(json, 'Outro'), []);
});

test('musicaDaAudioDb: só a do mesmo artista e título, e só com algo para as hashtags', () => {
  const json = { track: [{ strArtist: 'Coldplay', strTrack: 'Yellow', strMood: 'Relaxed', strTheme: 'In Love', strStyle: 'Rock/Pop', strGenre: 'Pop-Rock' }] };
  assert.deepEqual(musicaDaAudioDb(json, 'Coldplay', 'Yellow'), { mood: 'Relaxed', theme: 'In Love', style: 'Rock/Pop', genre: 'Pop-Rock' });
  assert.equal(musicaDaAudioDb(json, 'Outro', 'Yellow'), null);
  assert.equal(musicaDaAudioDb({ track: [{ strArtist: 'Bruno Mars', strTrack: 'I Just Might' }] }, 'Bruno Mars', 'I Just Might'), null);
});

test('MusicBrainz: o id do artista e os perfis oficiais (Instagram e canal do YouTube)', () => {
  assert.deepEqual(artistaDaMusicBrainz({ artists: [{ id: 'afb', name: 'Bruno Mars', score: 100, tags: [{ count: 2, name: 'Pop' }] }] }, 'Bruno Mars'), { id: 'afb', generos: ['pop'] });
  const rels = { relations: [
    { type: 'social network', url: { resource: 'https://www.instagram.com/p/ABC123/' } },
    { type: 'social network', url: { resource: 'http://www.instagram.com/brunomars/' } },
    { type: 'youtube', url: { resource: 'https://www.youtube.com/channel/UCoUM-UJ7rirJYP8CQ0EIaHA' } },
    { type: 'social network', url: { resource: 'https://twitter.com/BrunoMars' } },
  ] };
  assert.deepEqual(perfisDaMusicBrainz(rels), { instagram: 'https://www.instagram.com/brunomars/', youtube: 'https://www.youtube.com/channel/UCoUM-UJ7rirJYP8CQ0EIaHA' });
  assert.deepEqual(perfisDaMusicBrainz({ relations: [] }), { instagram: '', youtube: '' });
});
