// Persistência local (localStorage) da biblioteca, repertórios e preferências.
import { parseChordPro, guessKey } from './chordpro.js';
import { LOCAIS } from './lib/sincronia-conta.js';

const KEY = 'songbook.v1';
const DEFAULT_PREFS = { theme: 'dark', fontScale: 1, showChords: true, scrollSpeed: 3, destaqueCifra: 'forte', videoFundo: true };

// Os ajustes (qualidade do áudio e do vídeo, tema, tamanho da letra…) ficam também numa chave só deles. Antes ficavam
// apenas dentro do bloco da biblioteca inteira (KEY): com a biblioteca grande, o bloco passa do limite do localStorage,
// a gravação falha e, ao abrir o app de novo (por exemplo, depois de uma atualização), os ajustes voltavam ao que
// estava na última gravação que coube. A chave dos ajustes é pequena e é gravada primeiro; ao abrir, ela vale mais
// que os ajustes do bloco
const KEY_PREFS = 'songbook.prefs';
// marca de que o bloco não coube no localStorage: a cópia do IndexedDB é a mais nova e é ela que abre o app
const KEY_NAO_COUBE = 'songbook.naoCoube';
function prefsGuardadas() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY_PREFS) || 'null');
    return p && typeof p === 'object' && !Array.isArray(p) ? p : {};
  } catch { return {}; }
}
// o estado a partir do JSON guardado (do localStorage ou da cópia); null se não é uma biblioteca
function estadoDe(json) {
  try {
    const data = JSON.parse(json || 'null');
    if (data && Array.isArray(data.songs)) return { sets: [], ...data, prefs: { ...DEFAULT_PREFS, ...data.prefs, ...prefsGuardadas() } };
  } catch { /* corrompido */ }
  return null;
}
function load() {
  try {
    const estado = estadoDe(localStorage.getItem(KEY));
    if (estado) return estado;
  } catch { /* armazenamento indisponível */ }
  return { songs: [], sets: [], prefs: { ...DEFAULT_PREFS, ...prefsGuardadas() } };
}

let state = load();
// músicas salvas por versões anteriores ainda não têm capa/vídeo extraídos do conteúdo
for (const s of state.songs) if ((s.youtube === undefined || s.parte === undefined) && s.content) Object.assign(s, metaFrom(s.content));

// Gravar é montar o texto da biblioteca inteira (alguns MB, com as cifras e as letras sincronizadas) e escrevê-lo no
// armazenamento, tudo de uma vez e segurando a tela enquanto isso. Cada mudança gravava na hora: abrir uma playlist de
// 28 músicas e tocar gravava a biblioteca inteira 57 vezes em 20 s (a duração de cada música, o vídeo de cada faixa, as
// revisões em segundo plano), e a tela engasgava a cada uma, mais ainda no tablet e com a biblioteca grande.
// As mudanças seguidas agora viram uma gravação só: 600 ms depois da última, e no máximo 2,5 s depois da primeira. O
// que está na memória já vale na hora; e nada fica por gravar ao sair (o app indo para o fundo, a página fechando).
const ESPERA_GRAVAR = 600;
const MAXIMO_SEM_GRAVAR = 2500;
let gravacaoPendente = 0;
let pedidaEm = 0;
function persist() {
  // (os ajustes primeiro e na hora: pequenos, cabem mesmo quando o bloco da biblioteca não cabe)
  try { localStorage.setItem(KEY_PREFS, JSON.stringify(state.prefs)); } catch { /* sem armazenamento */ }
  // (fora do navegador, nos testes e no servidor, grava na hora)
  if (typeof document === 'undefined' || typeof window === 'undefined') { gravarAgora(); return; }
  if (!gravacaoPendente) pedidaEm = Date.now();
  clearTimeout(gravacaoPendente);
  gravacaoPendente = setTimeout(gravarAgora, Math.max(0, Math.min(ESPERA_GRAVAR, MAXIMO_SEM_GRAVAR - (Date.now() - pedidaEm))));
}
// grava já o que estiver esperando (ao sair do app, e antes de quem precisa do que está guardado)
function gravarPendente() { if (gravacaoPendente) gravarAgora(); }
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') gravarPendente(); });
  window.addEventListener('pagehide', gravarPendente);
  window.addEventListener('beforeunload', gravarPendente);
  document.addEventListener('freeze', gravarPendente);
}
function gravarAgora() {
  clearTimeout(gravacaoPendente);
  gravacaoPendente = 0;
  const json = JSON.stringify(state);
  try {
    localStorage.setItem(KEY, json);
    if (naoCoube) { naoCoube = false; localStorage.removeItem(KEY_NAO_COUBE); }
  } catch (e) {
    console.warn('Não foi possível salvar', e);
    // o bloco não coube: fica marcado, e a cópia do IndexedDB (gravada logo abaixo) passa a ser a que abre o app
    if (!naoCoube) { naoCoube = true; try { localStorage.setItem(KEY_NAO_COUBE, '1'); } catch { /* sem armazenamento */ } }
  }
  copiaSegura(json);
  // a conta Google (conta.js) sobe o que mudou para a nuvem
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('songbook:salvo'));
}

// ---- a biblioteca e os repertórios não se perdem: o navegador é avisado de que os dados do app são para guardar (não
// apaga quando falta espaço) e fica uma segunda cópia no IndexedDB. Se um dia o localStorage voltar vazio (limpeza do
// navegador, falta de espaço), o app volta com a cópia na próxima abertura
const BANCO = 'songbook-copia';
const abrirBanco = () => new Promise((ok, erro) => {
  const r = indexedDB.open(BANCO, 1);
  r.onupgradeneeded = () => r.result.createObjectStore('dados');
  r.onsuccess = () => ok(r.result);
  r.onerror = () => erro(r.error);
});
let copiaPendente = 0;
function copiaSegura(json) {
  if (typeof indexedDB === 'undefined') return;
  clearTimeout(copiaPendente);
  // (junta as gravações seguidas numa só)
  copiaPendente = setTimeout(() => abrirBanco().then((b) => {
    const tx = b.transaction('dados', 'readwrite');
    tx.objectStore('dados').put(json, KEY);
    tx.oncomplete = tx.onerror = () => b.close();
  // (com o bloco fora do localStorage, a cópia é a única gravação: vai na hora)
  }).catch(() => {}), naoCoube ? 0 : 400);
}
const tinhaDados = (() => { try { return Boolean(localStorage.getItem(KEY)); } catch { return false; } })();
let naoCoube = (() => { try { return Boolean(localStorage.getItem(KEY_NAO_COUBE)); } catch { return false; } })();
const lerCopia = () => abrirBanco().then((b) => new Promise((ok) => {
  const r = b.transaction('dados').objectStore('dados').get(KEY);
  r.onsuccess = () => { b.close(); ok(r.result); };
  r.onerror = () => { b.close(); ok(null); };
}));
if (typeof navigator !== 'undefined' && navigator.storage?.persist) navigator.storage.persisted?.().then((ja) => ja || navigator.storage.persist()).catch(() => {});
if (typeof indexedDB !== 'undefined') {
  if (naoCoube || !tinhaDados) {
    // o localStorage voltou vazio (limpeza do navegador) ou a última gravação não coube nele: o app abre com a cópia
    // do IndexedDB, que é a mais nova (o módulo espera por ela antes de o app começar). Antes, com a gravação que não
    // coube, o app abria com o bloco antigo do localStorage e ainda regravava a cópia com ele
    try {
      const daCopia = estadoDe(await lerCopia());
      if (daCopia && (naoCoube || ((daCopia.songs.length || daCopia.sets?.length) && !state.songs.length && !state.sets.length))) {
        state = daCopia;
        for (const s of state.songs) if ((s.youtube === undefined || s.parte === undefined) && s.content) Object.assign(s, metaFrom(s.content));
        // (se agora couber, o localStorage volta a ter o bloco inteiro)
        try { localStorage.setItem(KEY, JSON.stringify(state)); naoCoube = false; localStorage.removeItem(KEY_NAO_COUBE); } catch { /* continua na cópia */ }
      }
    } catch { /* sem a cópia: fica o que o localStorage tinha */ }
  } else copiaSegura(localStorage.getItem(KEY));
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export function youtubeId(url) {
  const m = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/.exec(url || '');
  return m ? m[1] : null;
}

function metaFrom(content) {
  const { meta } = parseChordPro(content);
  return {
    title: meta.title || 'Sem título',
    artist: meta.artist || meta.subtitle || '',
    key: meta.key || guessKey(content),
    source: meta.source || '',
    youtube: youtubeId(meta.youtube) || '',
    cover: meta.cover || '',
    pdf: meta.pdf || '',
    composer: meta.composer || meta.lyricist || '',
    parte: meta.x_parte || '',
  };
}

// Os cantos que o "Montar repertório" (a missa do dia) trouxe ficam só no repertório (soNoRepertorio): não aparecem nas
// Músicas da biblioteca. Saindo do último repertório em que estavam (o repertório apagado ou o canto tirado dele), saem
// do aparelho também; salvos pelo +, passam a ser da biblioteca
function tirarSoltas() {
  const usadas = new Set(state.sets.flatMap((st) => st.items.map((it) => it.songId)));
  state.songs = state.songs.filter((s) => !s.soNoRepertorio || usadas.has(s.id));
}
let extrasDaNuvem = null; // { locais(): { item: JSON }, eh(item): boolean, aplicar(item, JSON | null) }
export const db = {
  songs: () => [...state.songs].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR')),
  song: (id) => state.songs.find((s) => s.id === id),
  songBySource: (source) => source && state.songs.find((s) => s.source === source),

  saveSong(song) {
    const now = Date.now();
    const full = { transpose: 0, capo: 0, createdAt: now, ...song, ...metaFrom(song.content), id: song.id || uid(), updatedAt: now };
    // trocou o vídeo: a duração guardada era a do vídeo antigo
    const antes = state.songs.find((s) => s.id === full.id);
    if (antes && antes.youtube !== full.youtube) delete full.duracao;
    if (song.source && !full.source) full.source = song.source;
    const i = state.songs.findIndex((s) => s.id === full.id);
    if (i >= 0) state.songs[i] = full; else state.songs.push(full);
    persist();
    // música nova na biblioteca: o app pode baixá-la (Baixar ao salvar, nos ajustes dos downloads)
    if (i < 0 && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('songbook:nova-musica', { detail: { id: full.id } }));
    return full;
  },
  updateSong(id, patch) {
    const s = db.song(id);
    if (!s) return;
    Object.assign(s, patch);
    persist();
  },
  deleteSong(id) {
    state.songs = state.songs.filter((s) => s.id !== id);
    for (const set of state.sets) set.items = set.items.filter((it) => it.songId !== id);
    persist();
  },

  sets: () => [...state.sets].sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.name.localeCompare(b.name)),
  set: (id) => state.sets.find((s) => s.id === id),
  saveSet(set) {
    const full = { items: [], date: new Date().toISOString().slice(0, 10), ...set, id: set.id || uid() };
    const i = state.sets.findIndex((s) => s.id === full.id);
    // quando foi criado (a ordem "Adicionados recentemente" da biblioteca)
    if (!full.criadoEm) { if (i < 0) full.criadoEm = Date.now(); else if (state.sets[i].criadoEm) full.criadoEm = state.sets[i].criadoEm; }
    if (i >= 0) state.sets[i] = full; else state.sets.push(full);
    tirarSoltas();
    persist();
    return full;
  },
  deleteSet(id) {
    state.sets = state.sets.filter((s) => s.id !== id);
    tirarSoltas();
    persist();
  },

  // tocadas recentemente (mais recente primeiro)
  touchRecent(id) {
    const r = (state.recent || []).filter((x) => x !== id);
    r.unshift(id);
    state.recent = r.slice(0, 30);
    persist();
  },
  recent: () => (state.recent || []).map((id) => db.song(id)).filter(Boolean),
  recentSongs: (n = 12) => state.songs.filter((s) => !s.soNoRepertorio).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, n),

  prefs: () => state.prefs,
  setPref(k, v) {
    state.prefs[k] = v;
    persist();
  },

  exportAll: () => JSON.stringify({ app: 'songbook-liturgico', version: 1, ...state }, null, 2),
  importAll(json) {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    if (!Array.isArray(data.songs)) throw new Error('Arquivo de backup inválido');
    let n = 0;
    for (const s of data.songs) {
      if (!state.songs.some((x) => x.id === s.id)) { state.songs.push(s); n++; }
    }
    for (const s of data.sets || []) if (!state.sets.some((x) => x.id === s.id)) state.sets.push(s);
    persist();
    gravarPendente(); // (o backup que acabou de entrar: na hora)
    return n;
  },
  // ---- conta Google (conta.js): a biblioteca como vai para a nuvem e o que chega dela
  // (extras: outros itens que o app guarda fora da biblioteca, como o que cada aparelho ouviu: definirExtrasDaNuvem)
  paraNuvem: () => ({ songs: state.songs, sets: state.sets, recent: state.recent || [], extras: extrasDaNuvem?.locais() || null }),
  definirExtrasDaNuvem(p) { extrasDaNuvem = p; },
  // mudancas: Map item ("m_<id>", "r_<id>", "recentes") -> JSON, ou null quando o item foi apagado em outro aparelho
  daNuvem(mudancas) {
    for (const [k, json] of mudancas) {
      const obj = json ? JSON.parse(json) : null;
      if (k === 'recentes') { state.recent = Array.isArray(obj) ? obj : []; continue; }
      if (extrasDaNuvem?.eh(k)) { extrasDaNuvem.aplicar(k, json); continue; }
      const lista = k.startsWith('m_') ? 'songs' : k.startsWith('r_') ? 'sets' : null;
      if (!lista) continue;
      const id = k.slice(2);
      const i = state[lista].findIndex((x) => x.id === id);
      if (!obj) { if (i >= 0) state[lista].splice(i, 1); continue; }
      // o que é só deste aparelho (downloads, áudio próprio, karaokê) continua como estava aqui
      if (lista === 'songs' && i >= 0) for (const c of LOCAIS) if (state.songs[i][c] !== undefined) obj[c] = state.songs[i][c];
      if (i >= 0) state[lista][i] = obj; else state[lista].push(obj);
    }
    persist();
  },
  clear() {
    state = { songs: [], sets: [], recent: [], prefs: { ...DEFAULT_PREFS } };
    persist();
    gravarPendente(); // (apagar tudo: na hora)
  },
  // grava já o que estiver esperando para gravar (as mudanças seguidas são juntadas: ver persist)
  gravarJa: gravarPendente,
};
