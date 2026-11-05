import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escolherCifra, parecencaDaLetra } from '../public/js/lib/cifras.js';

const LETRA = `Voa beija-flor, voa
Vai levar o meu recado
Diz pra ela que eu ainda estou apaixonado
Voa beija-flor, voa
Bate asas no telhado
Fala que a saudade aqui não dá sossego`;
const CERTA = `{title: Voa Beija-flor}
[C]Voa beija-flor, [G]voa
Vai le[Am]var o meu recado
Diz pra [F]ela que eu ainda estou apaixonado
[C]Voa beija-flor, [G]voa
Bate [Am]asas no telhado
Fala que a [F]saudade aqui não dá sossego`;
const OUTRA = `{title: Beija-flor}
[D]Um beija-flor pousou na minha janela
[A]Trouxe o perfume da flor mais bela
[Bm]E eu fiquei olhando o céu sem fim
[G]Pensando em você longe de mim
[D]Cantando baixinho pra ninguém ouvir`;

test('a letra da cifra parece com a da música (ou não)', () => {
  assert.ok(parecencaDaLetra(CERTA, LETRA) >= 0.8);
  assert.ok(parecencaDaLetra(OUTRA, LETRA) < 0.2);
  assert.equal(parecencaDaLetra('[C]oi', LETRA), null);
});

test('entre as cifras achadas, fica a da música; nenhuma sendo dela, nenhuma', () => {
  const cifras = [{ url: 'outra', chordpro: OUTRA }, { url: 'certa', chordpro: CERTA }];
  assert.equal(escolherCifra(cifras, LETRA).url, 'certa');
  assert.equal(escolherCifra([{ url: 'outra', chordpro: OUTRA }], LETRA), null);
  // sem a letra da música para comparar, a primeira (como antes)
  assert.equal(escolherCifra(cifras, '').url, 'outra');
  assert.equal(escolherCifra([], LETRA), null);
});
