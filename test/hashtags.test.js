import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emIngles, hashtagsDaMusica, idiomaDaLetra, numeroCurto } from '../public/js/lib/hashtags.js';
import { musicaDaAudioDb } from '../public/js/lib/web.js';

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

test('hashtags: o clima da música e, faltando, as do estilo; em inglês ou português', () => {
  assert.deepEqual(hashtagsDaMusica({ musica: {}, generoArtista: 'Pop', ingles: true }), ['happy pop', 'upbeat', 'good mood', 'sing along']);
  assert.deepEqual(hashtagsDaMusica({ musica: { mood: 'Happy' }, generoArtista: 'Pop', ingles: true }), ['happy', 'upbeat', 'good mood', 'sing along']);
  assert.deepEqual(hashtagsDaMusica({ musica: { mood: 'Relaxed', theme: 'In Love', style: 'Rock/Pop', genre: 'Pop-Rock' }, ingles: true }).slice(0, 3), ['relaxed', 'in love', 'energetic']);
  assert.deepEqual(hashtagsDaMusica({ musica: { mood: 'Happy' }, generoArtista: 'Pop', ingles: false }), ['alegre', 'animada', 'bom humor', 'pra cantar junto']);
  assert.deepEqual(hashtagsDaMusica({ generoArtista: 'liturgia', ingles: false }), ['louvor', 'fé', 'paz', 'esperança']);
  assert.deepEqual(hashtagsDaMusica({ ingles: false }), ['bom humor', 'pra ouvir']);
});

test('musicaDaAudioDb: só a do mesmo artista e título, e só com algo para as hashtags', () => {
  const json = { track: [{ strArtist: 'Coldplay', strTrack: 'Yellow', strMood: 'Relaxed', strTheme: 'In Love', strStyle: 'Rock/Pop', strGenre: 'Pop-Rock' }] };
  assert.deepEqual(musicaDaAudioDb(json, 'Coldplay', 'Yellow'), { mood: 'Relaxed', theme: 'In Love', style: 'Rock/Pop', genre: 'Pop-Rock' });
  assert.equal(musicaDaAudioDb(json, 'Outro', 'Yellow'), null);
  assert.equal(musicaDaAudioDb({ track: [{ strArtist: 'Bruno Mars', strTrack: 'I Just Might' }] }, 'Bruno Mars', 'I Just Might'), null);
});
