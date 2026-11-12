import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analisarLetra, catalogoExplicito, decidirExplicita, tituloExplicito } from '../public/js/lib/explicita.js';

test('explícita: palavrão forte na letra basta (português, inglês e espanhol)', () => {
  assert.equal(analisarLetra('Eu vou embora, porra\nnão aguento mais').explicita, true);
  assert.equal(analisarLetra("I don't give a [G]fuck about it").explicita, true);
  assert.equal(analisarLetra('Me vale una mierda lo que digas').explicita, true);
  assert.equal(analisarLetra('Foda-se o mundo').explicita, true);
  assert.deepEqual(analisarLetra('Filho da puta').termos.includes('filho da puta'), true);
});

test('explícita: canto da missa, louvor e música romântica não ganham o selo', () => {
  const letras = [
    '{title: Segura na mão de Deus}\n[C]Se as águas do mar da vida quiserem te afogar\nSegura na mão de Deus e vai',
    'Ela é gostosa, ela é sexy, rola um clima bom\nPica-pau no pau da árvore',
    'Hoje eu vou gozar a vida, a concha do mar',
    'Cuidado com o cupim, a cuca e o cume da montanha',
    'Amazing grace how sweet the sound, a class act, my passion',
    'Cono de luz, la polla del corral',
  ];
  for (const l of letras) assert.equal(analisarLetra(l).explicita, false, l);
});

test('explícita: termo leve só conta repetido; acordes e diretivas ficam fora', () => {
  assert.equal(analisarLetra('Que merda de dia').explicita, false);
  assert.equal(analisarLetra('Que merda de dia\nque merda de vida').explicita, true);
  assert.equal(analisarLetra('{comment: porra}\n[Fuck]Aleluia').explicita, false);
});

test('explícita: o nome da faixa e o catálogo', () => {
  assert.equal(tituloExplicito('Música (Explicit)'), true);
  assert.equal(tituloExplicito('Música (Clean Version)'), false);
  assert.equal(tituloExplicito('Uncensored'), true);
  assert.equal(catalogoExplicito([]), null);
  assert.equal(catalogoExplicito([{ fonte: 'Deezer', explicita: false }, { fonte: 'iTunes', explicita: true }]), true);
  assert.equal(catalogoExplicito([{ fonte: 'Deezer', explicita: false }]), false);
  // (o karaokê explícito não é a música)
  assert.equal(catalogoExplicito([{ fonte: 'Deezer', explicita: true, album: 'k' }], (c) => (c.album === 'k' ? 'outra' : '')), null);
});

test('explícita: a decisão, como no mercado', () => {
  const um = analisarLetra('porra');
  const dois = analisarLetra('porra, caralho');
  assert.equal(decidirExplicita({ catalogo: true }), true);
  assert.equal(decidirExplicita({ catalogo: null, letra: um }), true);
  assert.equal(decidirExplicita({ catalogo: false, letra: um }), false);
  assert.equal(decidirExplicita({ catalogo: false, letra: dois }), true);
  assert.equal(decidirExplicita({ catalogo: null, letra: null, titulo: 'X (Explicit)' }), true);
  assert.equal(decidirExplicita({}), false);
});
