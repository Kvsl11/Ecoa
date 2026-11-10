// Cor da capa: as cores de uma imagem (os pixels já reduzidos, RGBA) viram o fundo da letra da música, do player e do
// que mais usa a cor da música. Cada capa dá as suas cores fortes (os matizes que mais aparecem, contando mais os pixels
// vivos), com a saturação e o brilho puxados delas, sempre escuros o bastante para o texto branco. A música fica com a
// mais forte delas, no matiz da capa; só a saturação e o brilho mudam um pouco de música para música.

function hsvDe(r, g, b) {
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max / 255 };
}

const N = 36; // faixas de 10°

// o peso de cada faixa de matiz (e as somas para a média de cada uma); null quando a capa é cinza
function faixas(pixels) {
  const peso = new Array(N).fill(0);
  const somaS = new Array(N).fill(0);
  const somaV = new Array(N).fill(0);
  const somaX = new Array(N).fill(0);
  const somaY = new Array(N).fill(0);
  let total = 0;
  let colorido = 0;
  for (let i = 0; i + 3 < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) continue; // transparente
    const { h, s, v } = hsvDe(pixels[i], pixels[i + 1], pixels[i + 2]);
    total++;
    if (s < 0.18 || v < 0.12) continue; // cinza, branco ou quase preto: não diz a cor
    // os pixels vivos e médios contam mais que os apagados
    const w = s * s * (1 - Math.abs(v - 0.6));
    const k = Math.floor(h / (360 / N)) % N;
    peso[k] += w;
    somaS[k] += s * w;
    somaV[k] += v * w;
    somaX[k] += Math.cos((h * Math.PI) / 180) * w;
    somaY[k] += Math.sin((h * Math.PI) / 180) * w;
    colorido++;
  }
  if (!total || colorido / total < 0.04) return null;
  return { peso, somaS, somaV, somaX, somaY };
}

// a cor de uma faixa junto com as vizinhas (um vermelho dividido entre 355° e 5° continua um vermelho só)
function corDaFaixa(f, k) {
  const ks = [(k + N - 1) % N, k, (k + 1) % N];
  const w = ks.reduce((a, j) => a + f.peso[j], 0);
  if (!w) return null;
  const h = Math.round(((Math.atan2(ks.reduce((a, j) => a + f.somaY[j], 0), ks.reduce((a, j) => a + f.somaX[j], 0)) * 180) / Math.PI + 360) % 360);
  const s = ks.reduce((a, j) => a + f.somaS[j], 0) / w;
  const v = ks.reduce((a, j) => a + f.somaV[j], 0) / w;
  // fundo escuro com a cara da capa: capa viva → fundo vivo; capa clara → fundo um pouco mais claro
  return { h, s: Math.round(28 + s * 42), l: Math.round(22 + v * 16) };
}

// as cores fortes da capa: até 4, de matizes diferentes (a mais forte primeiro), cada uma com o peso dela (p, de 0 a 1);
// só entram as que aparecem bastante (pelo menos 30% da mais forte). null quando a capa é cinza
export function coresDaCapa(pixels) {
  const f = faixas(pixels);
  if (!f) return null;
  const janela = f.peso.map((_, k) => f.peso[(k + N - 1) % N] * 0.5 + f.peso[k] + f.peso[(k + 1) % N] * 0.5);
  const usadas = new Set();
  const cores = [];
  let primeiro = 0;
  while (cores.length < 4) {
    let melhor = -1;
    for (let k = 0; k < N; k++) if (!usadas.has(k) && (melhor < 0 || janela[k] > janela[melhor])) melhor = k;
    if (melhor < 0 || janela[melhor] <= 0) break;
    if (!cores.length) primeiro = janela[melhor];
    else if (janela[melhor] < primeiro * 0.3) break;
    // (as faixas vizinhas, até 30° de cada lado, são a mesma cor: não entram de novo)
    for (let d = -3; d <= 3; d++) usadas.add((melhor + d + N) % N);
    const c = corDaFaixa(f, melhor);
    if (c) cores.push({ ...c, p: Math.round((janela[melhor] / primeiro) * 100) / 100 });
  }
  return cores.length ? cores : null;
}

// devolve { h, s, l } (matiz 0–360, saturação e luminosidade em %) da cor mais forte, ou null quando a capa é cinza
export function corDominante(pixels) {
  const cores = coresDaCapa(pixels);
  if (!cores) return null;
  const { h, s, l } = cores[0];
  return { h, s, l };
}

// um número da música (o mesmo sempre para a mesma música)
function semente(texto) {
  let n = 2166136261;
  for (const c of String(texto || '')) n = Math.imul(n ^ c.charCodeAt(0), 16777619) >>> 0;
  return n;
}
const limitar = (x, a, b) => Math.max(a, Math.min(b, x));

// o matiz das capas geradas (as músicas sem imagem, nas listas): o mesmo sempre para o mesmo título
export const matizDoTitulo = (titulo) => [...String(titulo)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

// A cor da música: a cor mais forte da capa (a predominante entre os pixels vivos), no matiz dela. Só a saturação (até
// 6 pontos) e o brilho (até 4) mudam um pouco de música para música, sempre escuros o bastante para o texto branco.
// (Antes a música sorteava uma entre as até 4 cores fortes da capa e ainda andava o matiz até 14°: uma capa quase toda
// azul com um detalhe vermelho podia dar o fundo vermelho.) A mesma música tem sempre a mesma cor
export function corDaMusicaNaCapa(cores, chave) {
  if (!cores?.length) return null;
  const c = cores[0];
  const m = semente(chave + '·tom');
  return {
    h: Math.round(c.h) % 360,
    s: limitar(c.s + ((m >>> 5) % 13) - 6, 22, 80),
    l: limitar(c.l + ((m >>> 10) % 9) - 4, 18, 40),
  };
}

// sem capa: uma cor pelo título, no matiz da capa gerada das listas (a saturação e o brilho variam de música para
// música). Antes o matiz saía de outra conta, e o player ficava de uma cor e a capa da lista de outra
export function corPeloTitulo(titulo) {
  const n = semente(titulo);
  return { h: matizDoTitulo(titulo), s: 30 + ((n >>> 9) % 41), l: 22 + ((n >>> 15) % 17) };
}

export const corCss = ({ h, s, l }) => `hsl(${h} ${s}% ${l}%)`;
