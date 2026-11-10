// O convite do Ecoa ("Compartilhar o Ecoa", nos ⋮ da conta): o texto que vai na mensagem e o cartão (imagem) que vai
// junto, com o código QR do endereço. O cartão é desenhado num <canvas> que a tela entrega; o resto não usa DOM.
import { codigoQR } from './qr.js';

export const APK_DO_ECOA = 'https://kvsl11.github.io/Ecoa/Ecoa.apk';
export const LARGURA = 1080;
export const ALTURA = 1350;

// só o primeiro nome de quem convida (sem e-mail e sem nome comprido demais no cartão)
export function primeiroNome(nome) {
  const n = String(nome || '').trim().split(/\s+/)[0] || '';
  return n.includes('@') || n.length > 18 ? '' : n;
}

// o que o convite diz: no APK, o download do app; no navegador, o endereço do site
export function dadosDoConvite({ android = false, site = '', nome = '' } = {}) {
  const url = android ? APK_DO_ECOA : site;
  const quem = primeiroNome(nome);
  return {
    url,
    quem,
    titulo: 'Ecoa — Ouça, cante e ecoe',
    texto: [
      'Conheça o Ecoa 🎵',
      'Músicas com letra sincronizada, cifras, acordes e karaokê em um só aplicativo.',
      android ? 'Baixe para Android:' : 'Abra no navegador:',
    ].join('\n'),
    chamada: android ? 'Baixe para Android' : 'Abra no navegador',
    instrucao: 'Aponte a câmera para o código',
    // (o endereço como aparece no cartão: sem o https:// e sem a barra do fim)
    endereco: url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    recursos: ['Letra sincronizada', 'Cifras e acordes', 'Karaokê', 'Músicas offline'],
  };
}

const FONTE = '"Figtree", "Circular", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const fonte = (peso, tamanho) => `${peso} ${tamanho}px ${FONTE}`;

function retangulo(c, x, y, l, a, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + l, y, x + l, y + a, r);
  c.arcTo(x + l, y + a, x, y + a, r);
  c.arcTo(x, y + a, x, y, r);
  c.arcTo(x, y, x + l, y, r);
  c.closePath();
}

// o símbolo do Ecoa (o mesmo do icon.svg): o quadrado em degradê, o "e" e as duas ondas
function simbolo(c, x, y, lado) {
  c.save();
  c.translate(x, y);
  c.scale(lado / 64, lado / 64);
  const g = c.createLinearGradient(8, 4, 56, 60);
  g.addColorStop(0, '#22d3ee'); g.addColorStop(0.55, '#0891b2'); g.addColorStop(1, '#1e3a8a');
  c.fillStyle = g;
  retangulo(c, 0, 0, 64, 64, 15);
  c.fill();
  c.strokeStyle = '#fff';
  c.lineCap = 'round';
  const traco = (d, largura, opacidade) => { c.globalAlpha = opacidade; c.lineWidth = largura; c.stroke(new Path2D(d)); };
  traco('M14.5 32H39.5A12.5 12.5 0 1 0 36.29 40.36', 6.4, 1);
  traco('M43.15 19.38A20.5 20.5 0 0 1 43.15 44.62', 4.2, 0.7);
  traco('M50.75 17.16A28 28 0 0 1 50.75 46.84', 3.6, 0.38);
  c.restore();
}

// o texto com o espaço entre as letras apertado (onde o canvas aceita), devolvendo a largura
function escrever(c, texto, x, y, aperto = 0) {
  if ('letterSpacing' in c) c.letterSpacing = `${aperto}px`;
  c.fillText(texto, x, y);
  const l = c.measureText(texto).width;
  if ('letterSpacing' in c) c.letterSpacing = '0px';
  return l;
}

// Desenha o cartão do convite (1080 × 1350, a proporção 4:5 das redes) no canvas.
export function desenharConvite(canvas, dados) {
  canvas.width = LARGURA; canvas.height = ALTURA;
  const c = canvas.getContext('2d');
  const M = 84; // a margem

  // o fundo: azul-noite, com dois clarões e as ondas do eco saindo do canto
  const fundo = c.createLinearGradient(0, 0, LARGURA, ALTURA);
  fundo.addColorStop(0, '#041019'); fundo.addColorStop(0.5, '#062436'); fundo.addColorStop(1, '#0a1a44');
  c.fillStyle = fundo;
  c.fillRect(0, 0, LARGURA, ALTURA);
  const clarao = (x, y, raio, cor) => {
    const g = c.createRadialGradient(x, y, 0, x, y, raio);
    g.addColorStop(0, cor); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, LARGURA, ALTURA);
  };
  clarao(LARGURA + 40, 120, 760, 'rgba(34,211,238,0.34)');
  clarao(-80, ALTURA - 260, 720, 'rgba(37,99,235,0.36)');
  c.save();
  c.lineCap = 'round';
  [[250, 0.2, 8], [390, 0.14, 7], [530, 0.09, 6], [670, 0.055, 5], [810, 0.03, 4]].forEach(([raio, opacidade, largura]) => {
    c.strokeStyle = `rgba(125,231,247,${opacidade})`;
    c.lineWidth = largura;
    c.beginPath();
    c.arc(LARGURA + 60, 150, raio, Math.PI * 0.5, Math.PI * 1.02);
    c.stroke();
  });
  c.restore();

  // a marca
  simbolo(c, M, M, 112);
  c.fillStyle = '#fff';
  c.textBaseline = 'alphabetic';
  c.font = fonte(800, 68);
  escrever(c, 'Ecoa', M + 140, M + 80, -2);

  // quem convida (com a conta aberta)
  let y = 372;
  if (dados.quem) {
    c.font = fonte(600, 34);
    const rotulo = `${dados.quem} convidou você`;
    const l = c.measureText(rotulo).width + 56;
    c.fillStyle = 'rgba(34,211,238,0.14)';
    retangulo(c, M, y - 46, l, 68, 34); c.fill();
    c.strokeStyle = 'rgba(34,211,238,0.45)'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#a5f3fc';
    c.fillText(rotulo, M + 28, y);
    y += 62;
  } else y -= 6;

  // a frase
  c.font = fonte(800, 132);
  c.fillStyle = '#fff';
  escrever(c, 'Ouça, cante', M - 4, y + 118, -5);
  const l = escrever(c, 'e ', M - 4, y + 256, -5);
  const ciano = c.createLinearGradient(M + l, 0, M + l + 360, 0);
  ciano.addColorStop(0, '#67e8f9'); ciano.addColorStop(1, '#22d3ee');
  c.fillStyle = ciano;
  escrever(c, 'ecoe.', M - 4 + l, y + 256, -5);
  y += 256;

  // os recursos, em pílulas (quebrando a linha quando não cabem)
  c.font = fonte(600, 33);
  let x = M; y += 70;
  dados.recursos.forEach((r) => {
    const larg = c.measureText(r).width + 62;
    if (x + larg > LARGURA - M) { x = M; y += 86; }
    c.fillStyle = 'rgba(255,255,255,0.08)';
    retangulo(c, x, y, larg, 68, 34); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#e2f3f9';
    c.fillText(r, x + 31, y + 45);
    x += larg + 16;
  });

  // embaixo: o painel com o código QR e o endereço
  const pa = 292; const py = ALTURA - M - pa;
  c.fillStyle = 'rgba(255,255,255,0.09)';
  retangulo(c, M, py, LARGURA - 2 * M, pa, 44); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 2; c.stroke();
  const lado = pa - 56; const qx = M + 28; const qy = py + 28;
  c.fillStyle = '#fff';
  retangulo(c, qx, qy, lado, lado, 26); c.fill();
  const qr = codigoQR(dados.url);
  const borda = 18; const modulo = (lado - 2 * borda) / qr.length;
  c.fillStyle = '#041019';
  qr.forEach((linha, j) => linha.forEach((escuro, i) => {
    // (um fio a mais em cada módulo: sem ele, sobram riscos brancos entre os quadradinhos)
    if (escuro) c.fillRect(qx + borda + i * modulo, qy + borda + j * modulo, modulo + 0.6, modulo + 0.6);
  }));
  const tx = qx + lado + 40; const tl = LARGURA - M - 36 - tx;
  c.fillStyle = '#67e8f9';
  c.font = fonte(700, 27);
  escrever(c, dados.instrucao.toUpperCase(), tx, py + 84, 2);
  c.fillStyle = '#fff';
  c.font = fonte(800, 54);
  escrever(c, dados.chamada, tx, py + 160, -1.5);
  // o endereço, diminuindo a letra até caber
  let tamanho = 32;
  do { c.font = fonte(500, tamanho); tamanho -= 1; } while (c.measureText(dados.endereco).width > tl && tamanho > 18);
  c.fillStyle = 'rgba(226,243,249,0.78)';
  c.fillText(dados.endereco, tx, py + 220);
  return canvas;
}
