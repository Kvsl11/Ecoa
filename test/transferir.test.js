import { test } from 'node:test';
import assert from 'node:assert/strict';
import { montarPacote, lerPacote, juntarDownloads, downloadsPelaGravacao } from '../public/js/lib/transferir.js';

test('o pacote de downloads volta igual: as músicas e cada arquivo, com o tipo', async () => {
  const a = new Blob(['áudio da música'], { type: 'audio/webm' });
  const b = new Blob([new Uint8Array([0, 1, 2, 255])], { type: 'video/mp4' });
  const musicas = [{ id: 'm1', title: 'Odres Novos', baixado: { arquivos: { abc: { tipo: 'video/mp4', tamanho: 4 } } } }];
  const pacote = montarPacote({ musicas, arquivos: [{ chave: 'yt:abc', blob: b }, { chave: 'm1', blob: a }] });
  const lido = await lerPacote(pacote);
  assert.deepEqual(lido.musicas, musicas);
  assert.deepEqual(lido.arquivos.map((x) => [x.chave, x.blob.type, x.blob.size]), [['yt:abc', 'video/mp4', 4], ['m1', 'audio/webm', a.size]]);
  assert.deepEqual([...new Uint8Array(await lido.arquivos[0].blob.arrayBuffer())], [0, 1, 2, 255]);
  assert.equal(await lido.arquivos[1].blob.text(), 'áudio da música');
});

test('outro arquivo, ou o pacote cortado, dá erro em vez de guardar lixo', async () => {
  await assert.rejects(lerPacote(new Blob(['{"app":"songbook-liturgico"}'])), /não é um pacote/);
  const pacote = montarPacote({ arquivos: [{ chave: 'yt:x', blob: new Blob(['0123456789']) }] });
  await assert.rejects(lerPacote(pacote.slice(0, pacote.size - 3)), /pela metade/);
});

test('junta os downloads que vieram aos que a música já tinha aqui', () => {
  const aqui = { baixado: { arquivos: { a: { tamanho: 10 } }, em: 2 }, karaoke: { a: { v: 'aqui' } } };
  const veio = { baixado: { arquivos: { a: { tamanho: 99 }, b: { tamanho: 5 } }, em: 1 }, karaoke: { a: { v: 'veio' }, b: { v: 'veio' } }, audioProprio: { duracao: 3 } };
  const p = juntarDownloads(aqui, veio);
  assert.deepEqual(p.baixado.arquivos, { a: { tamanho: 10 }, b: { tamanho: 5 } });
  assert.equal(p.baixado.tamanho, 15);
  assert.deepEqual(p.karaoke, { a: { v: 'aqui' }, b: { v: 'veio' } });
  assert.deepEqual(p.audioProprio, { duracao: 3 });
  assert.deepEqual(juntarDownloads({ audioProprio: { duracao: 1 } }, { audioProprio: { duracao: 3 } }), {});
});

test('o karaokê e o download vão para a música daqui pela gravação, mesmo com outro id', () => {
  const veio = [{ id: 'do-navegador', youtube: 'clipe1', karaoke: { audio1: { versao: 2 } }, baixado: { arquivos: { audio1: { tamanho: 4 }, clipe1: { tamanho: 6 } } } },
    { id: 'outra', karaoke: { semArquivo: { versao: 2 } } }];
  const aqui = [{ id: 'do-app', youtube: 'clipe1', versoes: { audio: 'audio1' } }, { id: 'sem-nada', youtube: 'zzz' },
    { id: 'ja-tinha', youtube: 'clipe1', versoes: { audio: 'audio1' }, karaoke: { audio1: { versao: 2, meu: true } }, baixado: { arquivos: { audio1: { tamanho: 4 }, clipe1: { tamanho: 6 } } } }];
  const { patches, karaokes } = downloadsPelaGravacao(aqui, veio, new Set(['kar:audio1', 'yt:audio1', 'yt:clipe1']), {
    fonteDe: (s) => s.versoes?.audio || s.youtube, gravacoesDe: (s) => [s.youtube, s.versoes?.audio],
  });
  assert.equal(karaokes, 1); // (o "semArquivo" não veio no pacote)
  assert.deepEqual([...patches.keys()], ['do-app']);
  assert.deepEqual(patches.get('do-app').karaoke, { audio1: { versao: 2 } });
  assert.deepEqual(patches.get('do-app').baixado.arquivos, { clipe1: { tamanho: 6 }, audio1: { tamanho: 4 } });
  assert.equal(patches.get('do-app').baixado.tamanho, 10);
});
