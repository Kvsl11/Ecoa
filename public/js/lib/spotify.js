// Os seguidores do artista no Spotify, sempre os de agora, pela API oficial do Spotify. Quem usa conecta a conta do
// Spotify uma vez (Ajustes → Spotify): o login é o do próprio Spotify (o fluxo PKCE, sem senha nem segredo no app; só o
// Client ID, que é público, do app criado em developer.spotify.com). A chave que o Spotify devolve fica no aparelho e
// se renova sozinha.

// o Client ID do app no painel do Spotify (developer.spotify.com/dashboard). Vazio: a conexão com o Spotify não aparece
export const SPOTIFY_CLIENT_ID = '';

const AUTORIZAR = 'https://accounts.spotify.com/authorize';
const TOKEN = 'https://accounts.spotify.com/api/token';
const API = 'https://api.spotify.com/v1';

const base64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
// o verificador do PKCE (aleatório, 64 caracteres) e o desafio dele (o SHA-256 em base64url)
export function gerarVerificador(cripto = globalThis.crypto) {
  const b = new Uint8Array(48);
  cripto.getRandomValues(b);
  return base64url(b);
}
export async function desafioDoVerificador(v, cripto = globalThis.crypto) {
  return base64url(await cripto.subtle.digest('SHA-256', new TextEncoder().encode(v)));
}
export function urlDeLogin({ clientId, redirect, desafio, estado }) {
  const p = new URLSearchParams({ client_id: clientId, response_type: 'code', redirect_uri: redirect, code_challenge_method: 'S256', code_challenge: desafio, state: estado });
  return `${AUTORIZAR}?${p}`;
}
// a resposta do token -> o que fica guardado ({ access, refresh, expira })
export function tokenGuardado(json, antes = {}, agora = Date.now()) {
  if (!json?.access_token) return null;
  return { access: json.access_token, refresh: json.refresh_token || antes.refresh || '', expira: agora + ((Number(json.expires_in) || 3600) - 60) * 1000 };
}
async function pedirToken(corpo, fetchImpl) {
  const res = await fetchImpl(TOKEN, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(corpo) });
  if (!res.ok) throw new Error(`Spotify: HTTP ${res.status}`);
  return res.json();
}
export const trocarCodigo = ({ clientId, codigo, redirect, verificador }, fetchImpl = fetch) =>
  pedirToken({ client_id: clientId, grant_type: 'authorization_code', code: codigo, redirect_uri: redirect, code_verifier: verificador }, fetchImpl);
export const renovarToken = ({ clientId, refresh }, fetchImpl = fetch) =>
  pedirToken({ client_id: clientId, grant_type: 'refresh_token', refresh_token: refresh }, fetchImpl);

const nome = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
// a busca de artistas do Spotify -> o artista com o mesmo nome (o de mais seguidores, se houver vários): null sem ele
export function artistaDoSpotify(json, quem) {
  const q = nome(quem);
  const mesmos = (json?.artists?.items || []).filter((a) => nome(a.name) === q);
  if (!mesmos.length) return null;
  const a = mesmos.sort((x, y) => (y.followers?.total || 0) - (x.followers?.total || 0))[0];
  return { id: a.id, seguidores: Number(a.followers?.total) || 0, popularidade: Number(a.popularity) || 0, foto: a.images?.[0]?.url || '' };
}
export async function buscarArtistaNoSpotify(quem, access, fetchImpl = fetch) {
  const res = await fetchImpl(`${API}/search?type=artist&limit=10&q=${encodeURIComponent(quem)}`, { headers: { Authorization: `Bearer ${access}` } });
  if (res.status === 401) { const e = new Error('Spotify: chave vencida'); e.vencida = true; throw e; }
  if (!res.ok) throw new Error(`Spotify: HTTP ${res.status}`);
  return artistaDoSpotify(await res.json(), quem);
}
