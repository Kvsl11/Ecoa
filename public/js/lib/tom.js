// O tom da cifra que casa com a gravação. Algumas cifras vêm num tom diferente do da música que toca (quem escreveu
// tirou em outro tom, ou pôs o capotraste e escreveu os desenhos). O app ouve a gravação e mede quanto soa cada uma
// das 12 notas (o croma); a cifra diz quais notas os acordes dela têm. Girando a cifra pelos 12 tons, o tom em que as
// notas dos acordes mais casam com as da gravação é o tom certo. Funções puras: o app traz o som e aplica o resultado.

// C = 0 … B = 11
const NOTA = { C: 0, 'B#': 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, Fb: 4, F: 5, 'E#': 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11, Cb: 11 };
export const notaDe = (n) => NOTA[String(n || '').trim()];

// as notas (classes de altura) de um acorde: "Am7", "F#m7(b5)", "G/B", "Dsus4", "C7M", "Bb°"
export function notasDoAcorde(acorde) {
  const m = /^([A-G][#b]?)([^/]*)(?:\/([A-G][#b]?))?$/.exec(String(acorde || '').trim());
  if (!m) return [];
  const r = notaDe(m[1]);
  if (r === undefined) return [];
  const q = m[2] || '';
  const menor = /^(m(?!aj)|min|-)/.test(q) || /^m\d/.test(q);
  const dim = /(dim|°|º|b5|ø)/.test(q);
  const aum = /(aug|\+|#5)/.test(q) && !/add/.test(q);
  const sus4 = /sus4?(?!2)/.test(q) && !/sus2/.test(q);
  const sus2 = /sus2/.test(q) || (/^2$/.test(q));
  let terca = menor || dim ? 3 : 4;
  let quinta = dim ? 6 : aum ? 8 : 7;
  const intervalos = new Set([0, quinta]);
  if (sus4) intervalos.add(5); else if (sus2) intervalos.add(2); else intervalos.add(terca);
  if (/(7M|maj7|M7|7\+)/.test(q)) intervalos.add(11);
  else if (/7/.test(q)) intervalos.add(dim && /°7|dim7/.test(q) ? 9 : 10);
  if (/(^|[^1])6/.test(q)) intervalos.add(9);
  if (/9/.test(q)) intervalos.add(2);
  const notas = [...intervalos].map((i) => (r + i) % 12);
  // (o baixo diferente entra como mais uma nota; o baixo que já é do acorde pesa mais uma vez)
  if (m[3] && notaDe(m[3]) !== undefined) notas.push(notaDe(m[3]));
  return notas;
}

// o perfil da cifra: quanto cada nota aparece nos acordes (cada acorde conta uma vez por vez que aparece; a tônica e a
// quinta pesam mais que as outras notas)
export function perfilDaCifra(acordes) {
  const p = new Array(12).fill(0);
  for (const a of acordes || []) {
    const notas = notasDoAcorde(a);
    notas.forEach((n, i) => { p[n] += i === 0 ? 1.5 : i === 1 ? 1.1 : 1; });
  }
  return p;
}

const correlacao = (a, b) => {
  const ma = a.reduce((s, x) => s + x, 0) / 12;
  const mb = b.reduce((s, x) => s + x, 0) / 12;
  let num = 0; let da = 0; let db = 0;
  for (let i = 0; i < 12; i++) { num += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
  return da && db ? num / Math.sqrt(da * db) : 0;
};
const girar = (p, s) => p.map((_, i) => p[((i - s) % 12 + 12) % 12]);

// Quantos semitons subir a cifra para casar com a gravação (−5 … 6), e a confiança. `ajustar` só é verdade quando a
// resposta é clara: o tom achado casa bem (correlação ≥ 0,6), bem melhor que o tom da cifra como está (+0,15) e que o
// segundo melhor (+0,08) — senão a cifra fica como veio
export function tomQueCasa(acordes, croma) {
  const perfil = perfilDaCifra(acordes);
  if (!croma || croma.length !== 12 || perfil.every((x) => !x) || croma.every((x) => Math.abs(x - croma[0]) < 1e-9)) return null;
  const notas = Array.from({ length: 12 }, (_, s) => ({ s: s > 6 ? s - 12 : s, c: correlacao(girar(perfil, s), croma) }))
    .sort((a, b) => b.c - a.c);
  const [melhor, segundo] = notas;
  const comoEsta = notas.find((x) => x.s === 0).c;
  const ajustar = melhor.s !== 0 && melhor.c >= 0.6 && melhor.c - comoEsta >= 0.15 && melhor.c - segundo.c >= 0.08;
  return { semitons: melhor.s, casamento: Math.round(melhor.c * 100) / 100, comoEsta: Math.round(comoEsta * 100) / 100, ajustar, certa: melhor.s === 0 && melhor.c >= 0.6 };
}

// O croma de um áudio (mono, amostras em `taxa` Hz): a energia de cada nota de 65 Hz a 2 kHz, somada nos quadros
// (FFT de 4096 pontos com janela de Hann), cada quadro com o mesmo peso (o volume não conta)
export function cromaDoAudio(amostras, taxa, { maxSegundos = 240 } = {}) {
  const N = 4096;
  const fim = Math.min(amostras?.length || 0, Math.floor(maxSegundos * taxa));
  if (fim < N) return null;
  const hann = new Float32Array(N).map((_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1)));
  const classe = new Int8Array(N / 2).fill(-1);
  for (let k = 1; k < N / 2; k++) {
    const f = (k * taxa) / N;
    if (f < 65 || f > 2000) continue;
    classe[k] = ((Math.round(69 + 12 * Math.log2(f / 440)) % 12) + 12) % 12;
  }
  const total = new Array(12).fill(0);
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  for (let ini = 0; ini + N <= fim; ini += N) {
    for (let i = 0; i < N; i++) { re[i] = amostras[ini + i] * hann[i]; im[i] = 0; }
    fft(re, im);
    const q = new Array(12).fill(0);
    let soma = 0;
    for (let k = 1; k < N / 2; k++) {
      if (classe[k] < 0) continue;
      const mag = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
      q[classe[k]] += mag;
      soma += mag;
    }
    if (soma < 1e-3) continue; // (o silêncio não conta)
    for (let i = 0; i < 12; i++) total[i] += q[i] / soma;
  }
  const s = total.reduce((a, b) => a + b, 0);
  return s ? total.map((x) => x / s) : null;
}

// FFT radix-2 no lugar (N potência de 2)
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang); const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1; let ci = 0;
      for (let j = 0; j < len / 2; j++) {
        const a = i + j; const b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci; const ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
}
