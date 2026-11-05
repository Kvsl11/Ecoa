import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { artistaDoSpotify, buscarArtistaNoSpotify, desafioDoVerificador, gerarVerificador, renovarToken, tokenGuardado, urlDeLogin } from '../public/js/lib/spotify.js';

test('PKCE: o verificador e o desafio (SHA-256 em base64url, o exemplo da RFC 7636)', async () => {
  const v = gerarVerificador(webcrypto);
  assert.match(v, /^[A-Za-z0-9_-]{64}$/);
  assert.equal(await desafioDoVerificador('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', webcrypto), 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  const u = new URL(urlDeLogin({ clientId: 'abc', redirect: 'https://kvsl11.github.io/Songbook/', desafio: 'D', estado: 'E' }));
  assert.equal(u.origin + u.pathname, 'https://accounts.spotify.com/authorize');
  assert.equal(u.searchParams.get('redirect_uri'), 'https://kvsl11.github.io/Songbook/');
  assert.equal(u.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(u.searchParams.get('response_type'), 'code');
});

test('a chave guardada: vence um minuto antes; na renovação sem refresh novo, fica o de antes', () => {
  assert.deepEqual(tokenGuardado({ access_token: 'A', refresh_token: 'R', expires_in: 3600 }, {}, 1000), { access: 'A', refresh: 'R', expira: 1000 + 3540 * 1000 });
  assert.equal(tokenGuardado({ access_token: 'B', expires_in: 3600 }, { refresh: 'R' }, 0).refresh, 'R');
  assert.equal(tokenGuardado({}), null);
});

test('o artista com o mesmo nome (o de mais seguidores) e os seguidores de agora', async () => {
  const json = { artists: { items: [
    { id: 'x', name: 'Bruno Mars Tribute', followers: { total: 10 } },
    { id: 'b', name: 'Bruno Mars', followers: { total: 90369843 }, popularity: 92, images: [{ url: 'https://i.scdn.co/a.jpg' }] },
    { id: 'c', name: 'bruno mars', followers: { total: 5 } },
  ] } };
  assert.deepEqual(artistaDoSpotify(json, 'Bruno Mars'), { id: 'b', seguidores: 90369843, popularidade: 92, foto: 'https://i.scdn.co/a.jpg' });
  assert.equal(artistaDoSpotify(json, 'Outro'), null);
  let pedido = null;
  const r = await buscarArtistaNoSpotify('Bruno Mars', 'TOK', async (url, op) => { pedido = { url, op }; return { ok: true, status: 200, json: async () => json }; });
  assert.equal(r.seguidores, 90369843);
  assert.equal(pedido.op.headers.Authorization, 'Bearer TOK');
  await assert.rejects(buscarArtistaNoSpotify('Bruno Mars', 'X', async () => ({ ok: false, status: 401 })), (e) => e.vencida === true);
  let corpo = '';
  await renovarToken({ clientId: 'abc', refresh: 'R' }, async (url, op) => { corpo = String(op.body); return { ok: true, json: async () => ({}) }; });
  assert.equal(corpo, 'client_id=abc&grant_type=refresh_token&refresh_token=R');
});
