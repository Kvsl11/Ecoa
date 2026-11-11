// O cartão para compartilhar uma música ou um trecho da letra (o botão de compartilhar do player, da letra e dos ⋮ da
// música): uma imagem 4:5 com a capa, o nome e o artista ("Música") ou com os versos escolhidos ("Letra"), na cor da
// música ou em outra das cores oferecidas, e o texto que vai junto na mensagem.
import { fonte, retangulo, simbolo } from './convite.js';

export const LARGURA_DO_CARTAO = 1080;
export const ALTURA_DO_CARTAO = 1350;
export const MAXIMO_DE_VERSOS = 5;

// "hsl(210 60% 40%)" (o formato de lib/cores.js) -> { h, s, l }; null se não for
export function lerHsl(cor) {
  const m = /hsla?\(\s*(-?[\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%/i.exec(String(cor || ''));
  return m ? { h: Number(m[1]), s: Number(m[2]), l: Number(m[3]) } : null;
}
// As cores oferecidas para o cartão: a da música (com o brilho limitado, para a letra branca ler bem), a mesma bem
// escura, o preto e o claro. Cada uma: { nome, fundo, fundo2 (o pé do degradê), texto, suave (o texto secundário) }
export function coresDoCartao(corDaMusica) {
  const { h, s } = lerHsl(corDaMusica) || { h: 190, s: 60 };
  const sat = Math.min(72, Math.max(28, s));
  return [
    { nome: 'Cor da música', fundo: `hsl(${h} ${sat}% 36%)`, fundo2: `hsl(${h} ${sat}% 24%)`, texto: '#fff', suave: 'rgba(255,255,255,0.74)' },
    { nome: 'Escura', fundo: `hsl(${h} ${Math.round(sat * 0.6)}% 16%)`, fundo2: `hsl(${h} ${Math.round(sat * 0.6)}% 9%)`, texto: '#fff', suave: 'rgba(255,255,255,0.7)' },
    { nome: 'Preta', fundo: '#18181b', fundo2: '#09090b', texto: '#fff', suave: 'rgba(255,255,255,0.68)' },
    { nome: 'Clara', fundo: '#fafaf9', fundo2: '#e7e5e4', texto: '#111', suave: 'rgba(17,17,17,0.66)' },
  ];
}

// As linhas da letra que podem ir no cartão: sem as vazias, as marcas de parte ("[Refrão]") e as repetidas em seguida
export function linhasParaEscolher(linhas) {
  const saida = [];
  for (const bruta of linhas || []) {
    const t = String(typeof bruta === 'string' ? bruta : bruta?.texto || '').replace(/\s+/g, ' ').trim();
    if (!t || /^[[(][^\])]*[\])]$/.test(t) || /^[♪♫\s.…-]+$/.test(t)) continue;
    saida.push(t);
  }
  return saida;
}
// Os versos que entram marcados ao abrir: a partir da linha que está sendo cantada (ou do começo), até 4 seguidos
export function versosIniciais(linhas, atual = -1, quantos = 4) {
  if (!linhas?.length) return [];
  const i = Math.max(0, Math.min(atual >= 0 ? atual : 0, linhas.length - 1));
  const ini = Math.min(i, Math.max(0, linhas.length - quantos));
  return Array.from({ length: Math.min(quantos, linhas.length - ini) }, (_, k) => ini + k);
}
// marca ou desmarca um verso (os índices ficam em ordem; no máximo MAXIMO_DE_VERSOS: além disso, não entra)
export function alternarVerso(marcados, i) {
  if (marcados.includes(i)) return marcados.filter((x) => x !== i);
  if (marcados.length >= MAXIMO_DE_VERSOS) return marcados;
  return [...marcados, i].sort((a, b) => a - b);
}

// O texto que vai na mensagem, junto com a imagem: os versos entre aspas (no cartão da letra), o nome e o artista, e
// o endereço para ouvir
export function textoDoCartao({ titulo = '', artista = '', url = '', versos = [] } = {}) {
  const nome = [titulo, artista].filter(Boolean).join(' — ');
  const trecho = versos.length ? `“${versos.join('\n')}”` : '';
  return [trecho, [nome, url].filter(Boolean).join('\n')].filter(Boolean).join('\n\n');
}

// Quebra o texto em linhas que cabem na largura (medir: texto -> largura). A palavra maior que a linha fica sozinha
export function quebrarTexto(medir, texto, largura) {
  const linhas = [];
  let atual = '';
  for (const palavra of String(texto || '').split(/\s+/).filter(Boolean)) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra;
    if (atual && medir(tentativa) > largura) { linhas.push(atual); atual = palavra; } else atual = tentativa;
  }
  if (atual) linhas.push(atual);
  return linhas;
}
// no máximo n linhas: a última termina com reticências quando sobra texto
export function limitarLinhas(medir, linhas, n, largura) {
  if (linhas.length <= n) return linhas;
  const saida = linhas.slice(0, n);
  let ultima = saida[n - 1];
  while (ultima && medir(`${ultima}…`) > largura) ultima = ultima.slice(0, -1).trimEnd();
  saida[n - 1] = `${ultima}…`;
  return saida;
}

// o texto numa linha só: inteiro se cabe; senão cortado, com reticências
export function umaLinha(medir, texto, largura) {
  let t = String(texto || '').replace(/\s+/g, ' ').trim();
  if (medir(t) <= largura) return t;
  while (t && medir(`${t}…`) > largura) t = t.slice(0, -1).trimEnd();
  return `${t}…`;
}

// a capa (uma imagem já carregada) cortada em quadrado, com os cantos arredondados; sem ela, um quadro com a nota
function desenharCapa(c, capa, x, y, lado, raio, cor) {
  c.save();
  retangulo(c, x, y, lado, lado, raio);
  c.clip();
  if (capa) {
    const l = capa.width; const a = capa.height; const m = Math.min(l, a);
    c.drawImage(capa, (l - m) / 2, (a - m) / 2, m, m, x, y, lado, lado);
  } else {
    c.fillStyle = cor.texto === '#fff' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)';
    c.fillRect(x, y, lado, lado);
    c.fillStyle = cor.suave;
    c.font = fonte(700, lado * 0.42);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('♪', x + lado / 2, y + lado / 2);
    c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  }
  c.restore();
}

// Desenha o cartão no canvas. dados: { modo: 'musica' | 'letra', titulo, artista, capa (imagem carregada ou null),
// versos (os textos, no modo letra), cor (uma de coresDoCartao) }
export function desenharCartao(canvas, { modo = 'musica', titulo = '', artista = '', capa = null, versos = [], cor } = {}) {
  const L = LARGURA_DO_CARTAO; const A = ALTURA_DO_CARTAO; const M = 84;
  canvas.width = L; canvas.height = A;
  const c = canvas.getContext('2d');
  const medir = (t) => c.measureText(t).width;
  const fundo = c.createLinearGradient(0, 0, 0, A);
  fundo.addColorStop(0, cor.fundo); fundo.addColorStop(1, cor.fundo2);
  c.fillStyle = fundo;
  c.fillRect(0, 0, L, A);
  c.textBaseline = 'alphabetic';

  // a marca, no pé
  const pe = A - M;
  simbolo(c, M, pe - 60, 60);
  c.fillStyle = cor.texto;
  c.font = fonte(800, 40);
  c.fillText('Ecoa', M + 78, pe - 16);

  if (modo === 'letra' && versos.length) {
    // em cima: a capa pequena, o nome e o artista
    desenharCapa(c, capa, M, M, 132, 22, cor);
    const tx = M + 132 + 30; const tl = L - M - tx;
    c.fillStyle = cor.texto;
    c.font = fonte(700, 42);
    c.fillText(umaLinha(medir, titulo, tl), tx, M + 60);
    c.fillStyle = cor.suave;
    c.font = fonte(500, 34);
    c.fillText(umaLinha(medir, artista, tl), tx, M + 108);
    // os versos, na maior letra em que cabem
    const topo = M + 132 + 70; const altura = pe - 60 - 60 - topo; const larg = L - 2 * M;
    // (um respiro entre um verso e outro: o verso que quebra em duas linhas não se confunde com dois versos)
    let tamanho = 96; let blocos = []; let total = 0;
    const medirBlocos = () => {
      c.font = fonte(800, tamanho);
      blocos = versos.map((v) => quebrarTexto(medir, v, larg));
      total = blocos.reduce((n, b) => n + b.length, 0) * tamanho * 1.16 + (blocos.length - 1) * tamanho * 0.3;
    };
    for (medirBlocos(); total > altura && tamanho > 40; medirBlocos()) tamanho -= 4;
    const passo = tamanho * 1.16;
    c.fillStyle = cor.texto;
    let y = topo + Math.max(0, (altura - total) / 2) + tamanho * 0.9;
    for (const bloco of blocos) {
      for (const l of bloco) { if (y > topo + altura + tamanho * 0.3) break; c.fillText(l, M, y); y += passo; }
      y += tamanho * 0.3;
    }
    return canvas;
  }

  // a música: a capa grande, o nome e o artista
  const lado = L - 2 * 130; const cx = 130; const cy = 118;
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.38)'; c.shadowBlur = 60; c.shadowOffsetY = 26;
  c.fillStyle = cor.fundo2;
  retangulo(c, cx, cy, lado, lado, 40); c.fill();
  c.restore();
  desenharCapa(c, capa, cx, cy, lado, 40, cor);
  const larg = L - 2 * M;
  c.fillStyle = cor.texto;
  c.font = fonte(800, 62);
  let y = cy + lado + 104;
  for (const l of limitarLinhas(medir, quebrarTexto(medir, titulo, larg), 2, larg)) { c.fillText(l, M, y); y += 72; }
  c.fillStyle = cor.suave;
  c.font = fonte(500, 40);
  c.fillText(umaLinha(medir, artista, larg), M, y - 6);
  return canvas;
}
