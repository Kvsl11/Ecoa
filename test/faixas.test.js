import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esqueletoDoTitulo, faixasPeloDeezer, participacoesDoTitulo, semelhancaDosTitulos, tituloSemParticipacoes } from '../public/js/lib/faixas.js';

// o Reanimation (Linkin Park) como o Cifra Club lista (nomes das originais, na ordem dele) e como o Deezer lista
const CIFRA_CLUB = ['Krwlng (feat. Aaron Lewis)', 'Points Of Authority', 'Enth E Nd', '[Chali]', 'Frgt/10', 'P5hng Me A*Wy', 'A Place For My Head',
  'X-Ecutioner Style', 'High Voltage', 'Riff Raff (Reanimation)', 'With You', 'Ntr/Mssion', "Big Pimpin'/Papercut (feat. Jay-Z)", 'Runaway', 'My December',
  'Stef', 'By Myself', 'Cure For The Itch', '1stp Klosr (The Humble Brothers) (feat. Jonathan Davis)', 'Crawling'].map((titulo) => ({ titulo }));
const DEEZER = ['Opening', 'Pts.Of.Athrty (Jay Gordon Reanimation)', 'Enth E Nd (Kutmasta Kurt Reanimation) [feat. Motion Man]', '[Chali]',
  'Frgt/10 (Alchemist Reanimation) [feat. Chali 2na]', 'P5hng Me A*wy (Mike Shinoda Reanimation) [feat. Stephen Richards]',
  'Plc.4 Mie Hæd (Amp Live Reanimation) [feat. Zion]', 'X-Ecutioner Style (feat. Black Thought)', 'H! Vltg3 (Evidence Reanimation) [feat. Pharoahe Monch and DJ Babu]',
  '[Riff Raff]', 'Wth>You (Chairman Hahn Reanimation) [feat. Aceyalone]', 'Ntr\\mssion', 'Ppr:kut (Cheapshot and Jubacca Reanimation) [feat. Rasco and Planet Asia]',
  'Rnw@y (Backyard Bangers Reanimation) [feat. Phoenix Orion]', 'My<Dsmbr (Mickey P. Reanimation) [feat. Kelli Ali]', '[Stef]',
  'By_Myslf (Josh Abraham and Mike Shinoda Reanimation)', 'Kyur4 Th Ich (Chairman Hahn Reanimation)',
  '1Stp Klosr (The Humble Brothers Reanimation) [feat. Jonathan Davis]', 'Krwlng (Mike Shinoda Reanimation) [feat. Aaron Lewis]',
  // (as faixas bônus do fim: a "My December" ao vivo não pode ficar no lugar da My<Dsmbr)
  'One Step Closer (Live LP Underground Tour 2003)', 'Buy Myself (Marilyn Manson Remix)', 'My December (Live Projekt Revolution Tour 2002)'];

test('álbum de versões: a faixa com o nome da original ganha o nome de verdade do Deezer (Reanimation)', () => {
  const r = faixasPeloDeezer(CIFRA_CLUB, DEEZER);
  const de = (t) => r[CIFRA_CLUB.findIndex((f) => f.titulo === t)];
  assert.deepEqual(de('My December'), { titulo: 'My<Dsmbr (Mickey P. Reanimation)', participacoes: 'Kelli Ali' });
  assert.equal(de('Points Of Authority')?.titulo, 'Pts.Of.Athrty (Jay Gordon Reanimation)');
  assert.equal(de('A Place For My Head')?.titulo, 'Plc.4 Mie Hæd (Amp Live Reanimation)');
  assert.equal(de('High Voltage')?.titulo, 'H! Vltg3 (Evidence Reanimation)');
  assert.equal(de('With You')?.titulo, 'Wth>You (Chairman Hahn Reanimation)');
  assert.equal(de('Runaway')?.titulo, 'Rnw@y (Backyard Bangers Reanimation)');
  assert.equal(de('By Myself')?.titulo, 'By_Myslf (Josh Abraham and Mike Shinoda Reanimation)');
  assert.equal(de('Cure For The Itch')?.titulo, 'Kyur4 Th Ich (Chairman Hahn Reanimation)');
  // as que já têm o nome de verdade no Cifra Club ficam como estão
  for (const t of ['Krwlng (feat. Aaron Lewis)', 'Enth E Nd', 'P5hng Me A*Wy', 'X-Ecutioner Style', 'Frgt/10']) assert.equal(de(t), null, t);
  // a "Crawling" repetida no fim (a "Krwlng" já foi casada): não vira outra faixa qualquer
  assert.equal(de('Crawling'), null);
});

test('álbum ao vivo: a faixa com o mesmo nome e "(Live)" no Deezer continua a mesma (sem trocar o nome nem a cifra)', () => {
  assert.deepEqual(faixasPeloDeezer([{ titulo: 'Numb' }, { titulo: 'In The End' }], ['Numb (Live)', 'In the End - Live in Texas']), [null, null]);
});

test('o mesmo nome com outra pontuação não é outra versão; números diferentes não se casam', () => {
  const r = faixasPeloDeezer([{ titulo: 'Nobodys Listening' }, { titulo: 'Dont Stay' }, { titulo: 'Figure.09' }, { titulo: 'Part 1' }, { titulo: 'Intro' }],
    ["Nobody's Listening", "Don't Stay", 'Figure.09', 'Part 2', 'Outro']);
  assert.deepEqual(r, [null, null, null, null, null]);
});

test('o esqueleto do nome desfaz a escrita estilizada; as participações saem do nome', () => {
  assert.equal(esqueletoDoTitulo('Krwlng'), esqueletoDoTitulo('Crawling'));
  assert.equal(esqueletoDoTitulo('Rnw@y'), esqueletoDoTitulo('Runaway'));
  assert.ok(semelhancaDosTitulos('My<Dsmbr', 'My December') >= 0.8);
  assert.ok(semelhancaDosTitulos('Numb', 'Faint') < 0.7);
  assert.equal(participacoesDoTitulo('Wth>You (Chairman Hahn Reanimation) [feat. Aceyalone]'), 'Aceyalone');
  assert.equal(tituloSemParticipacoes('Wth>You (Chairman Hahn Reanimation) [feat. Aceyalone]'), 'Wth>You (Chairman Hahn Reanimation)');
  assert.equal(participacoesDoTitulo('Numb'), '');
});
