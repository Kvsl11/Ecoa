import { test } from 'node:test';
import assert from 'node:assert/strict';
import { codigoDaLista, dadosDoLinkDaLista, lerCodigoDaLista, linkDaLista, linkDaListaNoAplicativo, MAXIMO_NO_LINK, textoDaLista } from '../public/js/lib/cartao-lista.js';

const missa = {
  nome: 'Missa 15/11/2026 – 33º Domingo do Tempo Comum',
  tipo: 'repertorio',
  data: '2026-11-15',
  musicas: [
    { titulo: 'Meus Pensamentos São de Paz', artista: 'Cindy Ferrarezi', parte: 'Entrada', video: 'aaaaaaaaaaa' },
    { titulo: 'Glória a Deus nas Alturas', artista: '', parte: 'Glória' },
    { titulo: 'Bendito sejas, Senhor Deus!', artista: 'Giovanni Rodrigues', parte: 'Apresentação das Oferendas', video: 'não é id' },
  ],
};

test('o link da lista vai e volta com o nome, o tipo, a data e as músicas (comprimido)', async () => {
  const link = await linkDaLista(missa);
  assert.match(link, /^https:\/\/kvsl11\.github\.io\/Ecoa\/#\/lista\/z[\w-]+$/);
  const lido = await lerCodigoDaLista(link.split('#/lista/')[1]);
  assert.equal(lido.nome, missa.nome);
  assert.equal(lido.tipo, 'repertorio');
  assert.equal(lido.data, '2026-11-15');
  assert.deepEqual(lido.musicas, [
    { titulo: 'Meus Pensamentos São de Paz', artista: 'Cindy Ferrarezi', parte: 'Entrada', video: 'aaaaaaaaaaa' },
    { titulo: 'Glória a Deus nas Alturas', artista: '', parte: 'Glória', video: '' },
    { titulo: 'Bendito sejas, Senhor Deus!', artista: 'Giovanni Rodrigues', parte: 'Apresentação das Oferendas', video: '' },
  ]);
});

test('sem o compressor do navegador, o link vai sem comprimir e é lido igual', async () => {
  const CS = globalThis.CompressionStream;
  globalThis.CompressionStream = undefined;
  try {
    const codigo = await codigoDaLista({ ...missa, tipo: 'playlist' });
    assert.equal(codigo[0], 'j');
    const lido = await lerCodigoDaLista(codigo);
    assert.equal(lido.tipo, 'playlist');
    assert.equal(lido.musicas.length, 3);
  } finally { globalThis.CompressionStream = CS; }
});

test('listas grandes levam as primeiras músicas e contam as que ficaram de fora', async () => {
  const musicas = Array.from({ length: MAXIMO_NO_LINK + 15 }, (_, i) => ({ titulo: `Música número ${i + 1}`, artista: 'Artista' }));
  const d = dadosDoLinkDaLista({ nome: 'Grande', musicas });
  assert.equal(d.m.length, MAXIMO_NO_LINK);
  assert.equal(d.mais, 15);
  const lido = await lerCodigoDaLista(await codigoDaLista({ nome: 'Grande', musicas }));
  assert.equal(lido.musicas.length, MAXIMO_NO_LINK);
  assert.equal(lido.mais, 15);
  // (comprimido, o link de 60 músicas continua curto o bastante para as mensagens)
  assert.ok((await linkDaLista({ nome: 'Grande', musicas })).length < 1200);
});

test('código estragado ou de outro formato não é lido', async () => {
  assert.equal(await lerCodigoDaLista(''), null);
  assert.equal(await lerCodigoDaLista('x123'), null);
  assert.equal(await lerCodigoDaLista('zisso-nao-e-deflate'), null);
});

test('o link para abrir no app Android leva a lista e a página de reserva', async () => {
  const link = await linkDaLista(missa);
  const intent = linkDaListaNoAplicativo(link, 'https://exemplo/?baixarApp');
  assert.match(intent, /^intent:\/\/lista\/z[\w-]+#Intent;scheme=ecoa;package=br\.ecoa\.app;S\.browser_fallback_url=https%3A%2F%2Fexemplo%2F%3FbaixarApp;end$/);
});

test('o texto da mensagem: o nome, o resumo, as músicas numeradas e o link', () => {
  const texto = textoDaLista({ nome: 'Minha playlist', rotulo: 'Playlist', resumo: '3 músicas', musicas: missa.musicas, link: 'https://x' });
  assert.equal(texto, 'Minha playlist\nPlaylist · 3 músicas\n\n1. Meus Pensamentos São de Paz — Cindy Ferrarezi\n2. Glória a Deus nas Alturas\n3. Bendito sejas, Senhor Deus! — Giovanni Rodrigues\n\nhttps://x');
});
