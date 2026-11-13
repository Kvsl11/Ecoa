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
    { titulo: 'Meus Pensamentos São de Paz', artista: 'Cindy Ferrarezi', parte: 'Entrada', video: 'aaaaaaaaaaa', capa: '' },
    { titulo: 'Glória a Deus nas Alturas', artista: '', parte: 'Glória', video: '', capa: '' },
    { titulo: 'Bendito sejas, Senhor Deus!', artista: 'Giovanni Rodrigues', parte: 'Apresentação das Oferendas', video: '', capa: '' },
  ]);
  assert.equal(lido.comCapas, true);
});

test('o link leva a capa de cada música e a da lista, as mesmas do aparelho de quem enviou', async () => {
  const h = 'abcdef0123456789abcdef0123456789';
  const itunes = 'https://is1-ssl.mzstatic.com/image/thumb/Music/v4/aa/bb/cc/x.jpg/1000x1000bb.jpg';
  const foto = 'data:image/jpeg;base64,' + 'A'.repeat(4000);
  const lista = { nome: 'Pop/ Kpop', capa: foto, musicas: [
    { titulo: 'Company', artista: 'Justin Bieber', video: 'bbbbbbbbbbb', capa: `https://cdn-images.dzcdn.net/images/cover/${h}/1000x1000-000000-80-0-0.jpg` },
    { titulo: 'Cream Soda', artista: 'EXO', capa: itunes },
    { titulo: 'Sem capa', artista: 'X', video: 'ccccccccccc', capa: 'data:image/jpeg;base64,AAAA' },
  ] };
  const lido = await lerCodigoDaLista(await codigoDaLista(lista));
  assert.equal(lido.capa, foto);
  assert.equal(lido.musicas[0].capa, `https://cdn-images.dzcdn.net/images/cover/${h}/500x500-000000-80-0-0.jpg`);
  assert.equal(lido.musicas[1].capa, itunes);
  assert.equal(lido.musicas[2].capa, '');
  // (a capa da lista em endereço também vai)
  const comEndereco = await lerCodigoDaLista(await codigoDaLista({ ...lista, capa: itunes }));
  assert.equal(comEndereco.capa, itunes);
  // (60 músicas com a capa da Deezer: o link continua curto o bastante para as mensagens)
  const muitas = Array.from({ length: 60 }, (_, i) => ({ titulo: `Música ${i}`, artista: 'A', video: 'ddddddddddd', capa: `https://cdn-images.dzcdn.net/images/cover/${i.toString(16).padStart(32, '7')}/1000x1000-000000-80-0-0.jpg` }));
  assert.ok((await linkDaLista({ nome: 'Grande', musicas: muitas })).length < 4000);
});

test('o link antigo, sem as capas, continua sendo lido', async () => {
  const antigo = 'j' + Buffer.from(JSON.stringify({ v: 1, n: 'Antiga', t: 'p', m: [['Música', 'Artista', '', 'aaaaaaaaaaa']] })).toString('base64url');
  const lido = await lerCodigoDaLista(antigo);
  assert.equal(lido.comCapas, false);
  assert.equal(lido.capa, '');
  assert.equal(lido.musicas[0].capa, '');
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
