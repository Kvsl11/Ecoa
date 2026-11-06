import { test } from 'node:test';
import assert from 'node:assert/strict';
import { textoParaCopiar } from '../public/js/render.js';

const cifra = `{title: Santo}
{key: G}
{soc}
[G]Santo, [D]santo, [Em]santo é o [C]Senhor
{eoc}

[G]Deus do uni[D]verso`;

test('copiar a letra: sem os acordes, com o nome e o artista em cima', () => {
  assert.equal(textoParaCopiar(cifra, { titulo: 'Santo', artista: 'Fulano' }), 'Santo – Fulano\n\nSanto, santo, santo é o Senhor\n\nDeus do universo');
});

test('copiar a cifra: os acordes em cima da sílaba, no tom da tela, com o tom e as partes', () => {
  const t = textoParaCopiar(cifra, { comCifra: true, transpose: 2, titulo: 'Santo', artista: 'Fulano' });
  assert.match(t, /^Santo – Fulano\nTom: A\n\n\[Chorus\]\nA {6}E {6}F#m {7}D\nSanto, santo, santo é o Senhor\n\n/);
  assert.match(t, /A {10}E\nDeus do universo$/);
});

test('copiar a cifra com capotraste: o desenho do acorde e a casa', () => {
  const t = textoParaCopiar(cifra, { comCifra: true, capo: 2, titulo: 'Santo' });
  assert.match(t, /Tom: G \(capotraste na 2ª casa\)/);
  assert.match(t, /^F {6}C {6}Dm/m);
});
