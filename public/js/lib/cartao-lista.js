// O compartilhar de uma playlist ou de um repertório, no jeito do compartilhar da música (lib/cartao.js): o cartão em
// pé (como um story) com a capa (a da lista ou as capas das primeiras músicas, em mosaico), o tipo, o nome, o resumo
// (quantas músicas e a duração, ou a data do repertório) e a lista das músicas com a capinha de cada uma; e o link que
// abre a prévia da lista no Ecoa, para quem recebe (sem a conta: a prévia e o convite para baixar o app).
// O cartão é desenhado num <canvas> que a tela entrega; os textos chegam já traduzidos (o desenho não troca nada).
import { fonte, retangulo } from './convite.js';
import { ENDERECO_DO_ECOA, desenharImagem, marcaDoEcoa, umaLinha, quebrarTexto, limitarLinhas } from './cartao.js';

export const TAMANHO_DO_CARTAO_DA_LISTA = { l: 1080, a: 1920 };
// quantas músicas aparecem no cartão (as outras viram "+ N")
export const MUSICAS_NO_CARTAO = 7;

// ---- O link da lista: "#/lista/<código>", com o nome, o tipo, a data e as músicas (o nome, o artista, a parte da
// missa e o vídeo de cada uma). A biblioteca é de cada pessoa: o link leva a lista, e não o número dela no aparelho de
// quem enviou. O código é o JSON comprimido (deflate) em base64 de endereço ("z…"); sem o compressor do navegador, o
// JSON sem comprimir ("j…"). As listas grandes levam as primeiras MAXIMO_NO_LINK músicas
export const MAXIMO_NO_LINK = 60;
const cortar = (t, n = 90) => String(t || '').replace(/\s+/g, ' ').trim().slice(0, n);
const base64url = (bytes) => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const deBase64url = (s) => {
  const b = atob(String(s).replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((String(s).length + 3) % 4));
  return Uint8Array.from(b, (ch) => ch.charCodeAt(0));
};
async function passarPor(bytes, Fluxo, formato) {
  const r = new Response(new Blob([bytes]).stream().pipeThrough(new Fluxo(formato)));
  return new Uint8Array(await r.arrayBuffer());
}
// A capa de cada música (a mesma que aparece no aparelho de quem enviou: a do álbum) e a da lista (a escolhida pela
// pessoa: um endereço, ou a foto do aparelho já reduzida, em data:image/jpeg) vão no link. Sem elas, quem recebia via
// o quadro do vídeo nas faixas e um mosaico de outras capas no topo
const CAPA_DA_DEEZER = /^https:\/\/(?:e-)?cdns?-images\.dzcdn\.net\/images\/cover\/([0-9a-f]{32})\/[^?#]*$/;
const capaParaLink = (u) => {
  const s = String(u || '');
  const dz = CAPA_DA_DEEZER.exec(s);
  if (dz) return `d${dz[1]}`; // (a da Deezer, só o código: o link fica curto)
  return /^https:\/\/[^\s"'<>]+$/.test(s) && s.length <= 400 ? s : '';
};
const capaDoLink = (c) => {
  const s = String(c || '');
  if (/^d[0-9a-f]{32}$/.test(s)) return `https://cdn-images.dzcdn.net/images/cover/${s.slice(1)}/500x500-000000-80-0-0.jpg`;
  return /^https:\/\/[^\s"'<>]+$/.test(s) && s.length <= 400 ? s : '';
};
const capaDaListaDoLink = (c) => (/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(String(c || '')) && c.length <= 16000 ? c : capaDoLink(c));
// { nome, tipo: 'playlist' | 'repertorio', data ('2026-11-15'), capa, musicas: [{ titulo, artista, parte, video, capa }] }
export function dadosDoLinkDaLista({ nome = '', tipo = 'playlist', data = '', capa = '', musicas = [] } = {}) {
  const m = musicas.filter((x) => cortar(x?.titulo)).slice(0, MAXIMO_NO_LINK).map((x) => {
    const linha = [cortar(x.titulo), cortar(x.artista), cortar(x.parte, 40), /^[\w-]{11}$/.test(String(x.video || '')) ? x.video : '', capaParaLink(x.capa)];
    while (linha.length > 1 && !linha[linha.length - 1]) linha.pop();
    return linha;
  });
  const c = /^data:image\/jpeg;base64,/.test(String(capa || '')) ? capaDaListaDoLink(capa) : capaParaLink(capa);
  return { v: 2, n: cortar(nome, 120), t: tipo === 'repertorio' ? 'r' : 'p', ...(/^\d{4}-\d{2}-\d{2}$/.test(data || '') ? { d: data } : {}), ...(c ? { c } : {}), m, ...(musicas.length > m.length ? { mais: musicas.length - m.length } : {}) };
}
export async function codigoDaLista(lista) {
  const bytes = new TextEncoder().encode(JSON.stringify(dadosDoLinkDaLista(lista)));
  if (typeof CompressionStream === 'function') {
    try { return `z${base64url(await passarPor(bytes, CompressionStream, 'deflate-raw'))}`; } catch { /* sem o formato: vai sem comprimir */ }
  }
  return `j${base64url(bytes)}`;
}
export async function linkDaLista(lista) {
  return `${ENDERECO_DO_ECOA}#/lista/${await codigoDaLista(lista)}`;
}
// o código lido de volta: { nome, tipo, data, musicas: [{ titulo, artista, parte, video }], mais }; null se não é um
export async function lerCodigoDaLista(codigo) {
  try {
    const c = String(codigo || '');
    let bytes = deBase64url(c.slice(1));
    if (c[0] === 'z') bytes = await passarPor(bytes, DecompressionStream, 'deflate-raw');
    else if (c[0] !== 'j') return null;
    const d = JSON.parse(new TextDecoder().decode(bytes));
    if (!d || !Array.isArray(d.m)) return null;
    const musicas = d.m.map(([titulo = '', artista = '', parte = '', video = '', capa = ''] = []) => ({ titulo: cortar(titulo), artista: cortar(artista), parte: cortar(parte, 40), video: /^[\w-]{11}$/.test(video) ? video : '', capa: capaDoLink(capa) })).filter((x) => x.titulo);
    // (comCapas: o link novo, que leva as capas; o antigo não leva, e quem recebe as procura)
    return { nome: cortar(d.n, 120), tipo: d.t === 'r' ? 'repertorio' : 'playlist', data: /^\d{4}-\d{2}-\d{2}$/.test(d.d || '') ? d.d : '', capa: capaDaListaDoLink(d.c), comCapas: Number(d.v) >= 2, musicas, mais: Math.max(0, Number(d.mais) || 0) };
  } catch { return null; }
}
// para abrir o app Android a partir do navegador (o Chrome entrega ao app instalado; sem ele, a página de reserva)
export function linkDaListaNoAplicativo(link, reserva = link) {
  const resto = String(link || '').split('#/lista/')[1];
  if (!resto) return '';
  return `intent://lista/${resto}#Intent;scheme=ecoa;package=br.ecoa.app;S.browser_fallback_url=${encodeURIComponent(reserva)};end`;
}

// O texto que vai na mensagem, junto com a imagem: o nome, o tipo e o resumo, as primeiras músicas numeradas e o link
export function textoDaLista({ nome = '', rotulo = '', resumo = '', musicas = [], link = '', mais = 'e mais {}' } = {}) {
  const lista = musicas.slice(0, 10).map((m, i) => `${i + 1}. ${m.titulo}${m.artista ? ` — ${m.artista}` : ''}`);
  if (musicas.length > 10) lista.push(String(mais).replace('{}', musicas.length - 10));
  return [[nome, [rotulo, resumo].filter(Boolean).join(' · ')].filter(Boolean).join('\n'), lista.join('\n'), link].filter(Boolean).join('\n\n');
}

// ---- O cartão. dados: { nome, rotulo ("Playlist" / "Repertório"), resumo ("7 músicas · 23 min"), capa (a imagem da
// lista, ou null), capas (as das primeiras músicas, para o mosaico), musicas: [{ titulo, artista, parte, capa }],
// maisTexto ("+ 3 músicas"), rodape ("Ouça no app Ecoa"), cor (uma de coresDoCartao), escala }
export function desenharCartaoDaLista(canvas, { nome = '', rotulo = '', resumo = '', capa = null, capas = [], musicas = [], maisTexto = '', rodape = '', cor, escala = 1 } = {}) {
  const { l: L, a: A } = TAMANHO_DO_CARTAO_DA_LISTA;
  const e = Number(escala) > 0 ? Number(escala) : 1;
  const lp = Math.round(L * e); const ap = Math.round(A * e);
  if (canvas.width !== lp || canvas.height !== ap) { canvas.width = lp; canvas.height = ap; }
  const c = canvas.getContext('2d');
  c.setTransform(e, 0, 0, e, 0, 0);
  if ('imageSmoothingQuality' in c) c.imageSmoothingQuality = 'high';
  c.globalAlpha = 1;
  c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  if ('letterSpacing' in c) c.letterSpacing = '0px';
  const medir = (t) => c.measureText(t).width;
  const M = 72;
  // o fundo: o degradê da cor e uma luz suave atrás da capa
  const degrade = c.createLinearGradient(0, 0, 0, A);
  degrade.addColorStop(0, cor.fundo); degrade.addColorStop(1, cor.fundo2);
  c.fillStyle = degrade;
  c.fillRect(0, 0, L, A);
  const luz = c.createRadialGradient(L / 2, 470, 40, L / 2, 470, 620);
  luz.addColorStop(0, cor.texto === '#fff' ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.6)');
  luz.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = luz;
  c.fillRect(0, 0, L, A);
  marcaDoEcoa(c, M, M + 56, cor, 60);

  // a capa: a da lista; sem ela, as capas das primeiras músicas em mosaico (2 × 2), ou a única que houver
  const lado = 520; const cx = (L - lado) / 2; const cy = 196;
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.38)'; c.shadowBlur = 60; c.shadowOffsetY = 24;
  c.fillStyle = cor.painel;
  retangulo(c, cx, cy, lado, lado, 28); c.fill();
  c.restore();
  const doMosaico = (capas || []).filter(Boolean);
  if (capa || doMosaico.length < 4) desenharImagem(c, capa || doMosaico[0] || null, cx, cy, lado, lado, 28, cor);
  else {
    const meio = lado / 2;
    c.save();
    retangulo(c, cx, cy, lado, lado, 28); c.clip();
    doMosaico.slice(0, 4).forEach((img, k) => desenharImagem(c, img, cx + (k % 2) * meio, cy + Math.floor(k / 2) * meio, meio, meio, 0, cor));
    c.restore();
  }

  // o tipo, o nome (até 2 linhas, na maior letra que couber) e o resumo
  let y = cy + lado + 92;
  c.textAlign = 'center';
  c.fillStyle = cor.suave;
  c.font = fonte(700, 30);
  if ('letterSpacing' in c) c.letterSpacing = '4px';
  c.fillText(String(rotulo || '').toUpperCase(), L / 2, y);
  if ('letterSpacing' in c) c.letterSpacing = '-1px';
  let tam = 76; let linhas = [];
  for (; tam >= 48; tam -= 4) {
    c.font = fonte(800, tam);
    linhas = quebrarTexto(medir, nome, L - 2 * M);
    if (linhas.length <= 2) break;
  }
  linhas = limitarLinhas(medir, linhas, 2, L - 2 * M);
  c.fillStyle = cor.texto;
  y += 26;
  for (const linha of linhas) { y += tam * 1.08; c.fillText(linha, L / 2, y); }
  if ('letterSpacing' in c) c.letterSpacing = '0px';
  c.fillStyle = cor.suave;
  c.font = fonte(500, 34);
  y += 58;
  c.fillText(umaLinha(medir, resumo, L - 2 * M), L / 2, y);
  c.textAlign = 'left';

  // a lista: um painel com as primeiras músicas (o número, a capinha, o nome e o artista ou a parte da missa)
  const topo = y + 52;
  const pe = A - M - 70;
  const n = Math.min(musicas.length, MUSICAS_NO_CARTAO);
  // (maisTexto: "+ 2 músicas", quando a lista tem mais do que as que cabem — as músicas chegam já cortadas)
  const comMais = Boolean(maisTexto);
  const passo = Math.min(112, (pe - topo - 40 - (comMais ? 70 : 0)) / Math.max(1, n));
  const altura = 40 + n * passo + (comMais ? 70 : 0);
  c.save();
  c.fillStyle = cor.texto === '#fff' ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.7)';
  retangulo(c, M - 16, topo, L - 2 * M + 32, altura, 36); c.fill();
  c.restore();
  const capinha = Math.min(80, passo - 22);
  musicas.slice(0, n).forEach((m, k) => {
    const yl = topo + 20 + k * passo;
    const meio = yl + passo / 2;
    c.fillStyle = cor.suave;
    c.font = fonte(700, 30);
    c.textAlign = 'center';
    c.fillText(String(k + 1), M + 22, meio + 11);
    c.textAlign = 'left';
    desenharImagem(c, m.capa || null, M + 58, meio - capinha / 2, capinha, capinha, 12, cor);
    const tx = M + 58 + capinha + 24; const tl = L - M - tx;
    c.fillStyle = cor.texto;
    c.font = fonte(700, 34);
    c.fillText(umaLinha(medir, m.titulo, tl), tx, meio - 4);
    const sub = [m.parte, m.artista].filter(Boolean).join(' · ');
    if (sub) {
      c.fillStyle = cor.suave;
      c.font = fonte(500, 27);
      c.fillText(umaLinha(medir, sub, tl), tx, meio + 34);
    }
  });
  if (comMais) {
    c.fillStyle = cor.suave;
    c.font = fonte(700, 30);
    c.textAlign = 'center';
    c.fillText(maisTexto, L / 2, topo + 20 + n * passo + 44);
    c.textAlign = 'left';
  }
  // embaixo: o convite para ouvir no app
  if (rodape) {
    c.fillStyle = cor.texto;
    c.font = fonte(700, 32);
    c.textAlign = 'center';
    c.fillText(rodape, L / 2, A - M + 6);
    c.textAlign = 'left';
  }
  return canvas;
}
