// Conta Google (obrigatória: o app abre com a tela de entrada do index.html): entrar com o Gmail e ter a mesma biblioteca (músicas, repertórios e tocadas
// recentemente) em todos os aparelhos. Usa o Firebase (Authentication + Firestore) do projeto "ecoa-82a51".
// - Quem nunca entrou não baixa nada do Firebase: o SDK só carrega ao tocar em "Entrar com Google" ou se a pessoa
//   já entrou neste aparelho.
// - Os dados ficam em usuarios/{uid}/itens/{item}: { dados: JSON, mod: hora do servidor }. As regras do Firestore
//   (firestore.rules) só deixam cada pessoa ler e escrever os itens dela.
// - Cada sincronia baixa só o que mudou na nuvem desde a última (pelo "mod") e sobe só o que mudou aqui
//   (lib/sincronia-conta.js). Os apagados ficam na nuvem como item sem dados, para os outros aparelhos saberem.
import { db } from './store.js';
import { itensLocais, planejar } from './lib/sincronia-conta.js';

// (a configuração web do Firebase não é segredo: quem protege os dados são as regras do Firestore)
const CONFIG = {
  apiKey: 'AIzaSyDnOYcOxDs2dlY4W_7F_vga4siIailgxto',
  authDomain: 'ecoa-82a51.firebaseapp.com',
  projectId: 'ecoa-82a51',
  storageBucket: 'ecoa-82a51.firebasestorage.app',
  messagingSenderId: '286830451197',
  appId: '1:286830451197:web:3c980777c1e941e5cbe194',
};
const SDK = 'https://www.gstatic.com/firebasejs/12.4.0/';
const CHAVE = 'songbook.conta'; // quem entrou neste aparelho: { uid, nome, email, foto }
const chaveBase = (uid) => `songbook.conta.${uid}`; // { puxado, base, ultima }
const VOLTANDO = 'songbook.conta.entrando'; // entrou pelo redirecionamento (sem janelinha): conferir na volta
const MAX_ITEM = 900_000; // o Firestore aceita até 1 MiB por item
const MARGEM = 5 * 60e3; // relógios e gravações fora de ordem: baixa de novo os últimos 5 min (não faz mal repetir)

const lerJSON = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const gravarJSON = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento */ } };

export const estadoConta = { sincronizando: false, ultima: 0, erro: '' };
export const usuarioConta = () => lerJSON(CHAVE);
const avisar = () => window.dispatchEvent(new CustomEvent('songbook:conta'));

let sdk = null;
function carregarSdk() {
  sdk ||= Promise.all(['firebase-app.js', 'firebase-auth.js', 'firebase-firestore.js'].map((f) => import(SDK + f)))
    .then(([app, A, F]) => {
      const a = app.initializeApp(CONFIG);
      return { auth: A.getAuth(a), A, fs: F.getFirestore(a), F };
    })
    .catch((e) => { sdk = null; throw new Error('Não deu para carregar o login do Google. Confira a internet e tente de novo.', { cause: e }); });
  return sdk;
}

export function mensagemDoErro(e) {
  const c = e?.code || '';
  if (c === 'auth/unauthorized-domain') return 'Este endereço do app ainda não foi liberado no Firebase (Authentication → Configurações → Domínios autorizados).';
  if (c === 'auth/operation-not-allowed' || c === 'auth/configuration-not-found') return 'O login com Google ainda não foi ativado no Firebase (Authentication → Método de login → Google).';
  if (c === 'auth/network-request-failed' || c === 'unavailable') return 'Sem conexão com a internet.';
  if (c === 'auth/user-disabled') return 'Esta conta foi desativada.';
  if (c === 'permission-denied') return 'A nuvem recusou os dados: confira as regras do Firestore (firestore.rules).';
  if (c === 'not-found' || c === 'failed-precondition') return 'O banco de dados (Firestore) ainda não foi criado no Firebase.';
  return e?.message || 'Algo deu errado.';
}

let ouvindo = false;
function ouvir({ auth, A }) {
  if (ouvindo) return;
  ouvindo = true;
  A.onAuthStateChanged(auth, (u) => {
    if (u) definir(u);
    else { if (usuarioConta()) gravarJSON(CHAVE, null); avisar(); } // sem sessão: saiu (ou acabou) em outro lugar, ou voltou do Google sem entrar
  });
}
function definir(u) {
  const antes = usuarioConta();
  const agora = { uid: u.uid, nome: u.displayName || '', email: u.email || '', foto: u.photoURL || '' };
  gravarJSON(CHAVE, agora);
  avisar();
  if (antes?.uid !== agora.uid || !estadoConta.ultima) sincronizar({ forcar: true });
}

// ao abrir o app: só carrega o Firebase se alguém já entrou neste aparelho
export async function iniciarConta() {
  let voltando = false;
  try { voltando = sessionStorage.getItem(VOLTANDO) === '1'; sessionStorage.removeItem(VOLTANDO); } catch { /* sem sessionStorage */ }
  if (!usuarioConta() && !voltando) return;
  try {
    const f = await carregarSdk();
    if (voltando) await f.A.getRedirectResult(f.auth).catch((e) => { estadoConta.erro = mensagemDoErro(e); avisar(); });
    ouvir(f);
  } catch (e) { estadoConta.erro = mensagemDoErro(e); avisar(); }
}

// Entrar com Google: a janelinha do Google; onde ela não abre (bloqueada, app instalado no iPhone), vai para a página
// do Google e volta. Devolve false se a pessoa fechou a janelinha
// No app de Android (o APK), o login do site não abre (o Google não deixa entrar por dentro de um app): a conta é
// escolhida pelo próprio Android, e o Firebase entra com ela
const ecoaNativo = () => {
  const C = typeof window !== 'undefined' ? window.Capacitor : null;
  return C?.isNativePlatform?.() && C.Plugins?.Ecoa ? C.Plugins.Ecoa : null;
};
async function entrarPeloAndroid(f, nativo) {
  const { auth, A } = f;
  let r;
  try { r = await nativo.entrarComGoogle(); } catch (e) {
    if (e?.code === 'cancelado') return false;
    if (e?.code === 'sem-conta') throw new Error('Nenhuma conta Google neste celular: adicione uma nas Configurações do Android e tente de novo.', { cause: e });
    throw new Error(`Não deu para entrar com o Google pelo Android (${e?.message || 'erro'}).`, { cause: e });
  }
  const cred = A.GoogleAuthProvider.credential(r.idToken);
  const u = await A.signInWithCredential(auth, cred);
  ouvir(f);
  definir(u.user);
  return true;
}
export async function entrarComGoogle() {
  const f = await carregarSdk();
  const nativo = ecoaNativo();
  if (nativo) return entrarPeloAndroid(f, nativo);
  const { auth, A } = f;
  const p = new A.GoogleAuthProvider();
  p.setCustomParameters({ prompt: 'select_account' });
  try {
    const r = await A.signInWithPopup(auth, p);
    ouvir(f);
    definir(r.user);
    return true;
  } catch (e) {
    if (['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled'].includes(e.code)) return false;
    if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/web-storage-unsupported'].includes(e.code)) {
      try { sessionStorage.setItem(VOLTANDO, '1'); } catch { /* sem sessionStorage */ }
      await A.signInWithRedirect(auth, p);
      return false;
    }
    throw new Error(mensagemDoErro(e), { cause: e });
  }
}

// Sair: a biblioteca continua neste aparelho; a cópia da nuvem continua na conta
export async function sairDaConta() {
  const u = usuarioConta();
  clearTimeout(relogio);
  if (u) gravarJSON(chaveBase(u.uid), null);
  gravarJSON(CHAVE, null);
  estadoConta.ultima = 0;
  estadoConta.erro = '';
  avisar();
  if (sdk) { const { auth, A } = await sdk; await A.signOut(auth).catch(() => {}); }
  await ecoaNativo()?.sairDoGoogle().catch(() => {}); // (no Android: na próxima entrada, ele pergunta a conta de novo)
}

// o nome que aparece no perfil (Editar): fica na conta Google do app (vale nos outros aparelhos)
export async function editarNomeDaConta(nome) {
  const u = usuarioConta();
  if (!u || !nome) return;
  gravarJSON(CHAVE, { ...u, nome });
  avisar();
  const { auth, A } = await carregarSdk();
  if (auth.currentUser) await A.updateProfile(auth.currentUser, { displayName: nome });
}

const comPrazo =(p, ms) => Promise.race([p, new Promise((_, erro) => setTimeout(() => erro(Object.assign(new Error('A nuvem demorou para responder.'), { code: 'unavailable' })), ms))]);

let rodando = false;
let pendente = false;
let relogio = 0;
let ouvidasPendentes = false; // o que se ouviu mudou desde a última sincronia
function agendar(ms = 4000) { clearTimeout(relogio); relogio = setTimeout(() => { relogio = 0; sincronizar(); }, ms); }

export async function sincronizar({ forcar = false } = {}) {
  const u = usuarioConta();
  if (!u) return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
  if (rodando) { pendente = true; return; }
  const salvo = lerJSON(chaveBase(u.uid)) || { puxado: 0, base: {}, ultima: 0 };
  // nada mudou aqui e a nuvem foi vista há pouco: não gasta uma consulta
  if (!forcar && Date.now() - (salvo.ultima || 0) < 60e3 && !planejar(itensLocais(db.paraNuvem()), new Map(), salvo.base).subir.size) return;
  rodando = true;
  estadoConta.sincronizando = true;
  avisar();
  let chegaram = 0;
  try {
    const { auth, fs, F } = await carregarSdk();
    await auth.authStateReady();
    if (auth.currentUser?.uid !== u.uid) return;
    const col = F.collection(fs, 'usuarios', u.uid, 'itens');
    const q = salvo.puxado ? F.query(col, F.where('mod', '>', F.Timestamp.fromMillis(salvo.puxado - MARGEM))) : col;
    const snap = await comPrazo(F.getDocs(q), 30e3);
    const remotos = new Map();
    let puxado = salvo.puxado || 0;
    snap.forEach((d) => {
      const x = d.data();
      remotos.set(d.id, typeof x.dados === 'string' ? x.dados : null);
      const m = x.mod?.toMillis?.() || 0;
      if (m > puxado) puxado = m;
    });
    // (a biblioteca é lida só agora, depois da espera: o que a pessoa mexeu enquanto isso entra no plano)
    const plano = planejar(itensLocais(db.paraNuvem()), remotos, salvo.base);
    if (plano.aplicar.size) { db.daNuvem(plano.aplicar); chegaram = plano.aplicar.size; }
    const grandes = [];
    const subir = [...plano.subir].filter(([k, v]) => {
      if (v && v.length > MAX_ITEM) { grandes.push(k); delete plano.base[k]; return false; }
      return true;
    });
    for (let i = 0; i < subir.length; i += 400) {
      const lote = F.writeBatch(fs);
      for (const [k, v] of subir.slice(i, i + 400)) lote.set(F.doc(col, k), { dados: v, mod: F.serverTimestamp() });
      await comPrazo(lote.commit(), 60e3);
    }
    estadoConta.ultima = Date.now();
    ouvidasPendentes = false;
    gravarJSON(chaveBase(u.uid), { puxado, base: plano.base, ultima: estadoConta.ultima });
    estadoConta.erro = grandes.length ? `${grandes.length} ${grandes.length === 1 ? 'item ficou' : 'itens ficaram'} só neste aparelho (grande demais para a nuvem).` : '';
  } catch (e) {
    estadoConta.erro = mensagemDoErro(e);
  } finally {
    rodando = false;
    estadoConta.sincronizando = false;
    avisar();
    if (chegaram) window.dispatchEvent(new CustomEvent('songbook:nuvem', { detail: { n: chegaram } }));
    if (pendente) { pendente = false; agendar(1000); }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('songbook:salvo', () => { if (usuarioConta()) agendar(); });
  // o que se ouve (as Estatísticas, que são da conta): muda a cada poucos segundos tocando, então sobe no máximo a cada
  // 10 minutos e ao sair do app
  window.addEventListener('songbook:ouvidas', () => {
    ouvidasPendentes = true;
    if (usuarioConta() && !relogio && Date.now() - estadoConta.ultima > 10 * 60e3) agendar(4000);
  });
  window.addEventListener('online', () => { if (usuarioConta()) agendar(1000); });
  document.addEventListener('visibilitychange', () => {
    if (!usuarioConta()) return;
    // voltou para o app: vê o que mudou nos outros aparelhos; saindo: sobe o que estava esperando
    if (!document.hidden) { if (Date.now() - estadoConta.ultima > 30e3) sincronizar({ forcar: true }); } else if (relogio || ouvidasPendentes) { clearTimeout(relogio); relogio = 0; sincronizar(); }
  });
}
