// Idioma do app: segue o idioma do aparelho. Português do Brasil, inglês e espanhol; qualquer outro idioma fica em
// inglês. O texto do código continua em português: com o aparelho em outro idioma, os textos são trocados na tela
// (e nos avisos, no cartão, no PDF) pelo dicionário do idioma (i18n-en.js, i18n-es.js), carregado só nesse caso.
//
// Como acrescentar um texto novo: escreva em português no código, como sempre, e ponha a tradução nos dois
// dicionários, com o texto em português como chave. Um trecho que muda (um nome, um número) vira "{}" na chave, ou
// "{n}" quando é sempre um número; no valor, {1}, {2}… são esses trechos na ordem da chave e {1|um|vários} escolhe a
// palavra pelo número ("{n} músicas": "{1} {1|song|songs}"). O teste test/i18n.test.js confere os dois dicionários.
//
// O que NÃO é traduzido: o que a pessoa escreveu ou o que veio de fora (o nome das músicas, dos artistas e das
// playlists, a letra, a cifra, a liturgia). Nesses lugares (DADOS, abaixo) um texto curto nunca é trocado, para uma
// música chamada "Hoje" não virar "Today"; translate="no" num elemento desliga a tradução dentro dele, e a classe
// "ui" liga de volta para um rótulo do app que fique no meio dos dados.

const NO_NAVEGADOR = typeof navigator !== 'undefined' && typeof document !== 'undefined';

// o idioma do app pelo idioma do aparelho (o primeiro da lista do navegador)
export function idiomaDe(lista) {
  const l = String((Array.isArray(lista) ? lista[0] : lista) || '').toLowerCase();
  if (l.startsWith('pt')) return 'pt';
  if (l.startsWith('es')) return 'es';
  return 'en';
}

const DO_APARELHO = NO_NAVEGADOR ? (navigator.languages?.length ? navigator.languages[0] : navigator.language) || 'pt-BR' : 'pt-BR';
export const IDIOMA = NO_NAVEGADOR ? idiomaDe(DO_APARELHO) : 'pt';
// o idioma para datas e números (o do aparelho, quando é um dos três; senão, o inglês)
export const LOCALE = IDIOMA === 'pt' ? 'pt-BR' : String(DO_APARELHO).toLowerCase().startsWith(IDIOMA) ? DO_APARELHO : IDIOMA === 'es' ? 'es' : 'en-US';

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const TEM_LETRAS = /[A-Za-zÀ-ÿ]{2}/;
const palavrasDe = (s) => (s.match(/[A-Za-zÀ-ÿ]{2,}/g) || []).length;
const numeroDe = (s) => Number(String(s).replace(/[^\d]/g, ''));
// um texto com menos de 3 palavras é "curto": pode ser o nome de uma música, e não é trocado no meio dos dados
const CURTO = 3;

// Monta o tradutor de um dicionário { 'texto em português': 'tradução' }. Devolve (texto, opções) => tradução ou null
export function criarTradutor(dic, { ehDado = () => false } = {}) {
  const exatos = new Map();
  const padroes = [];
  for (const [chave, valor] of Object.entries(dic)) {
    const tipos = chave.match(/\{n?\}/g);
    if (!tipos) { exatos.set(chave, valor); continue; }
    const partes = chave.split(/\{n?\}/);
    const fonte = partes.map((p, i) => escRe(p) + (i < tipos.length ? (tipos[i] === '{n}' ? '(\\d[\\d.,]*)' : '([\\s\\S]*?)') : '')).join('');
    const ancora = partes.map((p) => p.trim()).sort((a, b) => b.length - a.length)[0];
    padroes.push({ re: new RegExp(`^${fonte}$`), valor, ancora, tipos, partes, palavras: palavrasDe(partes.join(' ')), soNumeros: tipos.every((x) => x === '{n}'), peso: partes.join('').length });
  }
  // (o padrão com mais texto fixo primeiro: o mais específico ganha)
  padroes.sort((a, b) => b.peso - a.peso);
  const memoria = new Map();

  const aplicar = (valor, trechos) => valor
    .replace(/\{(\d+)\|([^|}]*)\|([^}]*)\}/g, (_, k, um, varios) => (numeroDe(trechos[k - 1]) === 1 ? um : varios))
    .replace(/\{(\d+)\}/g, (_, k) => trechos[k - 1] ?? '');

  // modo: 'livre' (tudo), 'partes' (o texto inteiro curto fica; os pedaços de uma linha "A · B" são trocados) ou
  // 'dado' (nenhum texto curto). Um padrão só com números ("3 músicas") é sempre seguro
  function traduzir(texto, modo = 'livre', nivel = 0) {
    if (!texto || !TEM_LETRAS.test(texto)) return null;
    const chaveMemo = modo[0] + (nivel ? 1 : 0) + texto;
    if (memoria.has(chaveMemo)) return memoria.get(chaveMemo);
    let r = null;
    const livre = modo === 'livre' || (modo === 'partes' && nivel > 0);
    // (ao lado do nome do artista, um rótulo de duas palavras do app, como "Cifra própria", é trocado; uma só, não)
    const minimo = modo === 'partes' ? 2 : CURTO;
    const pode = (palavras, seguro = false) => seguro || ((livre || palavras >= minimo) && !(palavras < CURTO && ehDado(texto)));
    const exato = exatos.get(texto);
    if (exato !== undefined && pode(palavrasDe(texto))) r = aplicar(exato, []);
    if (r === null) {
      for (const p of padroes) {
        if (!pode(p.palavras, p.soNumeros) || !texto.includes(p.ancora)) continue;
        const m = p.re.exec(texto);
        if (!m) continue;
        const trechos = m.slice(1).map((trecho, i) => {
          // (número, ou um nome entre aspas: fica como está; o resto pode ser outro texto do app)
          if (p.tipos[i] === '{n}' || nivel >= 2 || /[“"«]$/.test(p.partes[i])) return trecho;
          const [, antes, miolo, depois] = /^(\s*)([\s\S]*?)(\s*)$/.exec(trecho);
          const t = traduzir(miolo, modo === 'partes' ? 'livre' : modo, nivel + 1);
          return t === null ? trecho : antes + t + depois;
        });
        r = aplicar(p.valor, trechos);
        break;
      }
    }
    // vários textos numa linha só ("Playlist · 12 músicas"): cada um por si
    if (r === null && nivel < 2) {
      for (const sep of [' · ', ' • ', ' — ']) {
        if (!texto.includes(sep)) continue;
        let mudou = false;
        const partes = texto.split(sep).map((parte) => { const t = traduzir(parte.trim(), modo, nivel + 1); if (t !== null) mudou = true; return t === null ? parte : t; });
        if (mudou) { r = partes.join(sep); break; }
      }
    }
    if (memoria.size > 6000) memoria.clear();
    memoria.set(chaveMemo, r);
    return r;
  }
  return traduzir;
}

// ---- no navegador ----
let tradutor = null;
let dadosDoApp = () => false;
// os nomes guardados na biblioteca (músicas, artistas, playlists…) nunca são trocados: o app diz quais são
export function definirDados(fn) { dadosDoApp = fn; }

if (NO_NAVEGADOR && IDIOMA !== 'pt') {
  try {
    const dic = (await import(`./i18n-${IDIOMA}.js`)).default;
    tradutor = criarTradutor(dic, { ehDado: (s) => { try { return dadosDoApp(s); } catch { return false; } } });
  } catch (e) { console.warn('i18n: o dicionário não carregou; o app fica em português', e); }
}

const normal = (s) => String(s).replace(/\s+/g, ' ').trim();

// Um texto do app no idioma do aparelho (para o que não passa pela tela: aviso do sistema, cartão, texto de
// compartilhar). Em português, ou sem tradução, devolve o próprio texto
export function t(texto) {
  if (!tradutor || texto == null) return texto;
  const s = String(texto);
  const [, antes, miolo, depois] = /^(\s*)([\s\S]*?)(\s*)$/.exec(s);
  const r = tradutor(normal(miolo));
  return r === null ? s : antes + r + depois;
}

const ATRIBUTOS = ['title', 'aria-label', 'placeholder', 'data-tip', 'alt', 'aria-description', 'data-vazio', 'data-rotulo', 'data-dica'];
// onde ficam os dados (nomes de música, artista, playlist, a letra): texto curto ali não é trocado
// o nome da música e do artista nas listas (o texto direto do elemento; um selo dentro dele é do app)
const NOMES = '.track .t, .card b, .tile > b';
const NOMES_E_APP = '.track .s, .card small';
// onde o que aparece veio de fora ou foi escrito pela pessoa
const DADOS = '.pl-nome, .pl-desc, .pv-nome, .est-nome, .pl-artista-nome, .rolar, .chat-bolha, .dv-texto, .lit-linha, .texto-extra';
const DO_APP = '.ui, .track[data-ler] .t, .parte-tag, .kind';
// onde nada é trocado: a cifra, a letra, os campos em que a pessoa escreve
const FORA = 'script, style, noscript, textarea, svg, [contenteditable], [translate="no"], .line, .lyric, .chord, .letra-linha, .karaoke-linha, .comment, .tab, pre, code';

const feitos = new WeakMap(); // nó de texto -> o texto que o app pôs e a tradução que ficou
const atributosFeitos = new WeakMap();
const naoAchados = new Set();
const DEPURAR = NO_NAVEGADOR && (() => { try { return localStorage.getItem('ecoa.i18n.depurar') === '1'; } catch { return false; } })();
if (DEPURAR) window.__i18nFaltando = naoAchados;

function traduzirTexto(no) {
  const cru = no.data;
  if (!TEM_LETRAS.test(cru)) return;
  const feito = feitos.get(no);
  if (feito && feito.saida === cru) return;
  const pai = no.parentElement;
  if (!pai || pai.closest(FORA)) return;
  const [, antes, miolo, depois] = /^(\s*)([\s\S]*?)(\s*)$/.exec(cru);
  const texto = normal(miolo);
  const modo = pai.closest(DO_APP) ? 'livre' : pai.matches(NOMES) || pai.closest(DADOS) ? 'dado' : pai.matches(NOMES_E_APP) ? 'partes' : 'livre';
  const r = tradutor(texto, modo);
  if (r === null || r === texto) { if (DEPURAR && r === null && modo === 'livre') naoAchados.add(texto); return; }
  const saida = antes + r + depois;
  feitos.set(no, { saida });
  no.data = saida;
}

function traduzirAtributos(el) {
  for (const a of ATRIBUTOS) {
    if (!el.hasAttribute(a)) continue;
    const cru = el.getAttribute(a);
    if (!TEM_LETRAS.test(cru)) continue;
    let feito = atributosFeitos.get(el);
    if (feito && feito[a] === cru) continue;
    const r = tradutor(normal(cru));
    if (r === null) { if (DEPURAR) naoAchados.add(normal(cru)); continue; }
    if (!feito) atributosFeitos.set(el, feito = {});
    feito[a] = r;
    el.setAttribute(a, r);
  }
}

// Troca os textos de uma árvore (a tela, ou o documento do PDF antes de imprimir)
export function traduzirArvore(raiz) {
  if (!tradutor || !raiz) return;
  if (raiz.nodeType === 3) { traduzirTexto(raiz); return; }
  if (raiz.nodeType !== 1 && raiz.nodeType !== 9 && raiz.nodeType !== 11) return;
  if (raiz.nodeType === 1) {
    if (raiz.closest('[translate="no"]')) return;
    traduzirAtributos(raiz);
  }
  const doc = raiz.ownerDocument || raiz;
  const passeio = doc.createTreeWalker(raiz, 5 /* elementos e textos */, {
    acceptNode: (n) => (n.nodeType === 1 && (n.matches('script, style, noscript, svg, textarea') || n.getAttribute('translate') === 'no') ? 2 /* pula com os filhos */ : 1),
  });
  for (let n = passeio.nextNode(); n; n = passeio.nextNode()) {
    if (n.nodeType === 3) traduzirTexto(n); else traduzirAtributos(n);
  }
}

// Liga a tradução da tela: troca o que já está nela e acompanha o que o app desenhar depois
export function iniciarTraducao() {
  if (!NO_NAVEGADOR) return;
  document.documentElement.lang = LOCALE;
  // o aparelho mudou de idioma com o app aberto: recarrega no idioma novo
  window.addEventListener('languagechange', () => {
    const novo = idiomaDe(navigator.languages?.length ? navigator.languages : [navigator.language]);
    if (novo !== IDIOMA) location.reload();
  });
  if (!tradutor) return;
  traduzirArvore(document.documentElement);
  new MutationObserver((mudancas) => {
    for (const m of mudancas) {
      if (m.type === 'characterData') traduzirTexto(m.target);
      else if (m.type === 'attributes') traduzirAtributos(m.target);
      else for (const n of m.addedNodes) traduzirArvore(n);
    }
  }).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATRIBUTOS });
}
