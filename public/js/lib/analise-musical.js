// A análise de uma música importada (o áudio da própria pessoa), feita no aparelho: o andamento e as batidas, o tom,
// os acordes de cada batida e a cifra em ChordPro com a letra transcrita no lugar em que é cantada. É o mesmo conjunto
// que os apps de estudo (o Moises, o Chordify) mostram ao abrir uma música: a letra que acompanha, os acordes no tempo,
// o tom e o BPM. Funções puras: o app traz as amostras (mono) e a letra transcrita, e guarda o resultado.
//
// O caminho:
// 1. de 0,1 em 0,1 s sai o croma (a força de cada uma das 12 notas) da faixa média e o do baixo, e o fluxo espectral
//    (o quanto o som novo surgiu ali: as batidas);
// 2. o andamento sai da autocorrelação do fluxo e as batidas, da programação dinâmica de Ellis (2007);
// 3. o tom é o perfil de Krumhansl-Kessler que mais se correlaciona com o croma da música inteira;
// 4. cada batida recebe o acorde (24 tríades maiores e menores, mais o "sem acorde") cujo modelo mais casa com o croma
//    médio dela; o caminho de Viterbi pelas batidas penaliza cada troca e dá preferência aos acordes do tom, o que tira
//    as trocas falsas de uma batida só;
// 5. a cifra: o acorde que soa no início de cada linha da letra fica no começo dela e as trocas no meio caem na
//    palavra cantada naquele instante (proporcional ao tempo da linha); a introdução, os solos e o final ficam numa
//    linha só de acordes.

export const TAXA = 11025; // as amostras chegam nesta taxa
export const PASSO = 0.1; // segundos por quadro
const N_FFT = 4096;

const NOMES_SUSTENIDO = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOMES_BEMOL = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
// os tons escritos com bemóis (maiores e menores)
const TONS_BEMOL = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm']);

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
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k;
        const b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci;
        const ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti;
        re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = nr;
      }
    }
  }
}

const classeDe = (f) => ((Math.round(12 * Math.log2(f / 440) + 69) % 12) + 12) % 12;

// 1. Os quadros: { medio, baixo (Float32Array quadros × 12, cada quadro de soma 1 ou zerado no silêncio), fluxo
// (Float32Array quadros), forca (o volume, 0–1 do maior), quadros, passo }
export function quadros(amostras, taxa = TAXA, { passo = PASSO } = {}) {
  const hop = Math.max(1, Math.round(taxa * passo));
  const total = Math.max(0, Math.floor((amostras.length - 1) / hop) + 1);
  const medio = new Float32Array(total * 12);
  const baixo = new Float32Array(total * 12);
  const fluxo = new Float32Array(total);
  const forca = new Float32Array(total);
  const janela = new Float32Array(N_FFT).map((_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N_FFT));
  const metade = N_FFT / 2;
  // a faixa média (as notas do acorde) de 130 Hz a 2 kHz; o baixo (a fundamental) de 50 a 260 Hz
  const nMedio = new Int8Array(metade).fill(-1);
  const nBaixo = new Int8Array(metade).fill(-1);
  for (let k = 1; k < metade; k++) {
    const f = (k * taxa) / N_FFT;
    if (f >= 130 && f <= 2000) nMedio[k] = classeDe(f);
    if (f >= 50 && f <= 260) nBaixo[k] = classeDe(f);
  }
  const re = new Float64Array(N_FFT);
  const im = new Float64Array(N_FFT);
  let antes = new Float32Array(metade);
  let agora = new Float32Array(metade);
  let maior = 0;
  for (let q = 0; q < total; q++) {
    const ini = q * hop - metade;
    let soma = 0;
    for (let i = 0; i < N_FFT; i++) {
      const x = amostras[ini + i] || 0;
      soma += x * x;
      re[i] = x * janela[i];
      im[i] = 0;
    }
    forca[q] = Math.sqrt(soma / N_FFT);
    if (forca[q] > maior) maior = forca[q];
    fft(re, im);
    let fl = 0;
    for (let k = 1; k < metade; k++) {
      // (a compressão logarítmica: a nota mais forte não apaga as outras do acorde)
      const m = Math.log1p(100 * Math.sqrt(re[k] * re[k] + im[k] * im[k]));
      agora[k] = m;
      const d = m - antes[k];
      if (d > 0 && k * taxa / N_FFT < 4000) fl += d;
      if (nMedio[k] >= 0) medio[q * 12 + nMedio[k]] += m;
      if (nBaixo[k] >= 0) baixo[q * 12 + nBaixo[k]] += m;
    }
    fluxo[q] = fl;
    [antes, agora] = [agora, antes];
  }
  for (let q = 0; q < total; q++) {
    const silencio = forca[q] < 0.02 * (maior || 1);
    for (const c of [medio, baixo]) {
      let s = 0;
      for (let n = 0; n < 12; n++) s += c[q * 12 + n];
      for (let n = 0; n < 12; n++) c[q * 12 + n] = silencio || !s ? 0 : c[q * 12 + n] / s;
    }
    forca[q] = maior ? forca[q] / maior : 0;
  }
  return { medio, baixo, fluxo, forca, quadros: total, passo: hop / taxa };
}

// 2a. O andamento (BPM, de 60 a 180) pela autocorrelação do fluxo, com a preferência pelos andamentos perto de 110
// (sem ela, a metade e o dobro do andamento certo empatam)
export function andamento(fluxo, passo = PASSO) {
  const n = fluxo.length;
  if (n < 40) return 0;
  // (suavizado em 3 pontos: o ataque que cai entre dois blocos não some na autocorrelação de atraso fracionário)
  const suave = Float32Array.from(fluxo, (v, i) => 0.25 * (fluxo[i - 1] || 0) + 0.5 * v + 0.25 * (fluxo[i + 1] || 0));
  const media = suave.reduce((a, b) => a + b, 0) / n;
  const x = Float32Array.from(suave, (v) => Math.max(0, v - media));
  let melhor = 0;
  let bpm = 0;
  for (let b = 60; b <= 180; b += 0.5) {
    const lag = 60 / b / passo;
    const l0 = Math.floor(lag);
    const fr = lag - l0;
    let s = 0;
    for (let i = 0; i + l0 + 1 < n; i++) s += x[i] * (x[i + l0] * (1 - fr) + x[i + l0 + 1] * fr);
    s /= n - l0;
    const peso = Math.exp(-0.5 * (Math.log2(b / 110) / 0.6) ** 2);
    if (s * peso > melhor) { melhor = s * peso; bpm = b; }
  }
  return bpm;
}

// 2b. As batidas (em quadros) pela programação dinâmica de Ellis: cada batida é um ponto de fluxo alto, a um período
// mais ou menos do anterior (o custo cresce com o desvio do período)
export function batidas(fluxo, bpm, passo = PASSO, { rigidez = 1 } = {}) {
  const n = fluxo.length;
  if (!(bpm > 0) || n < 4) return [];
  const periodo = 60 / bpm / passo;
  let maxF = 0;
  for (const v of fluxo) if (v > maxF) maxF = v;
  const f = Float32Array.from(fluxo, (v) => (maxF ? v / maxF : 0));
  const pont = new Float64Array(n);
  const anterior = new Int32Array(n).fill(-1);
  const de = Math.max(1, Math.round(periodo / 2));
  const ate = Math.max(de + 1, Math.round(periodo * 2));
  for (let t = 0; t < n; t++) {
    let melhor = 0;
    let quem = -1;
    for (let p = t - ate; p <= t - de; p++) {
      if (p < 0) continue;
      const v = pont[p] - rigidez * Math.log((t - p) / periodo) ** 2;
      if (quem < 0 || v > melhor) { melhor = v; quem = p; }
    }
    pont[t] = f[t] + (quem >= 0 ? Math.max(0, melhor) : 0);
    anterior[t] = quem >= 0 && melhor > 0 ? quem : -1;
  }
  // a última batida: a melhor pontuação no último período
  let fim = n - 1;
  for (let t = Math.max(0, n - Math.round(periodo)); t < n; t++) if (pont[t] > pont[fim]) fim = t;
  const lista = [];
  for (let t = fim; t >= 0; t = anterior[t]) lista.push(t);
  lista.reverse();
  // (o começo sem batida marcada, antes da primeira: completa no período, para a introdução também ter acordes)
  const primeira = lista[0] ?? 0;
  const antes = [];
  for (let t = primeira - periodo; t >= 0; t -= periodo) antes.unshift(Math.round(t));
  return [...antes, ...lista];
}

// 3. O tom: os perfis de Krumhansl-Kessler (maior e menor) girados pelas 12 notas, o que mais se correlaciona com o
// croma da música. { tonica (0–11), menor, nome ("G", "Em"), confianca (0–1, a correlação) }
const KK_MAIOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const KK_MENOR = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
function correlacao(a, b) {
  const ma = a.reduce((s, x) => s + x, 0) / a.length;
  const mb = b.reduce((s, x) => s + x, 0) / b.length;
  let num = 0;
  let da = 0;
  let dbb = 0;
  for (let i = 0; i < a.length; i++) { num += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; dbb += (b[i] - mb) ** 2; }
  return da && dbb ? num / Math.sqrt(da * dbb) : 0;
}
export function detectarTom(croma12) {
  if (!croma12 || croma12.length !== 12 || croma12.every((v) => !v)) return null;
  let melhor = null;
  for (let t = 0; t < 12; t++) {
    for (const menor of [false, true]) {
      const perfil = menor ? KK_MENOR : KK_MAIOR;
      const girado = Array.from({ length: 12 }, (_, i) => perfil[((i - t) % 12 + 12) % 12]);
      const c = correlacao(croma12, girado);
      if (!melhor || c > melhor.confianca) melhor = { tonica: t, menor, confianca: c };
    }
  }
  return { ...melhor, nome: nomeDoTom(melhor.tonica, melhor.menor), confianca: Math.round(melhor.confianca * 100) / 100 };
}
const nomeDoTom = (tonica, menor) => {
  const comBemol = NOMES_BEMOL[tonica] + (menor ? 'm' : '');
  return TONS_BEMOL.has(comBemol) ? comBemol : NOMES_SUSTENIDO[tonica] + (menor ? 'm' : '');
};

// os acordes: 0–11 maiores, 12–23 menores, 24 = sem acorde
export const SEM_ACORDE = 24;
const MODELOS = Array.from({ length: 24 }, (_, i) => {
  const raiz = i % 12;
  const terca = i < 12 ? 4 : 3;
  const m = new Array(12).fill(0);
  m[raiz] = 1;
  m[(raiz + terca) % 12] = 0.8;
  m[(raiz + 7) % 12] = 0.9;
  return m;
});
export function nomeDoAcorde(i, tom = null) {
  if (i === SEM_ACORDE || i == null) return '';
  const bemol = tom ? TONS_BEMOL.has(tom.nome) : false;
  return (bemol ? NOMES_BEMOL : NOMES_SUSTENIDO)[i % 12] + (i >= 12 ? 'm' : '');
}
// os acordes do campo harmônico do tom (I ii iii IV V vi; no menor, o relativo): os que mais aparecem
function acordesDoTom(tom) {
  if (!tom) return new Set();
  const t = tom.menor ? (tom.tonica + 3) % 12 : tom.tonica; // (o menor usa o campo do relativo maior)
  return new Set([t, (t + 5) % 12, (t + 7) % 12, 12 + ((t + 2) % 12), 12 + ((t + 4) % 12), 12 + ((t + 9) % 12),
    ...(tom.menor ? [(tom.tonica + 7) % 12] : [])]); // (no menor, o V maior também é comum)
}

// a parecença de um croma (soma 1) com cada acorde: o cosseno com o modelo, mais o baixo na raiz
function notas(medio, baixo, i) {
  if (i === SEM_ACORDE) return 0;
  const m = MODELOS[i];
  let num = 0;
  let nm = 0;
  let nc = 0;
  for (let k = 0; k < 12; k++) { num += medio[k] * m[k]; nm += m[k] * m[k]; nc += medio[k] * medio[k]; }
  const cos = nc ? num / Math.sqrt(nm * nc) : 0;
  const raiz = i % 12;
  let maxB = 0;
  for (let k = 0; k < 12; k++) if (baixo[k] > maxB) maxB = baixo[k];
  return cos + (maxB ? 0.15 * (baixo[raiz] / maxB) : 0);
}

// 4. Os acordes de cada trecho entre batidas (ou de cada quadro, sem batidas). { inicio, fim, acorde } em segundos, já
// com os trechos iguais seguidos juntados
export function reconhecerAcordes(q, { marcas = null, tom = null, troca = 0.05, doTom = 0.015 } = {}) {
  const passo = q.passo || PASSO;
  const lim = marcas?.length >= 2 ? [...marcas] : Array.from({ length: q.quadros }, (_, i) => i);
  if (lim[lim.length - 1] < q.quadros) lim.push(q.quadros);
  const trechos = [];
  for (let k = 0; k + 1 < lim.length; k++) {
    const a = Math.max(0, lim[k]);
    const b = Math.min(q.quadros, lim[k + 1]);
    if (b <= a) continue;
    const medio = new Array(12).fill(0);
    const baixo = new Array(12).fill(0);
    let forca = 0;
    for (let f = a; f < b; f++) {
      for (let n = 0; n < 12; n++) { medio[n] += q.medio[f * 12 + n]; baixo[n] += q.baixo[f * 12 + n]; }
      forca += q.forca[f];
    }
    trechos.push({ a, b, medio, baixo, forca: forca / (b - a) });
  }
  if (!trechos.length) return [];
  const campo = acordesDoTom(tom);
  const N = 25;
  // a pontuação de cada acorde em cada trecho (o silêncio, quase sem som, fica sem acorde)
  const emissao = trechos.map((t) => {
    const soma = t.medio.reduce((x, y) => x + y, 0);
    return Array.from({ length: N }, (_, i) => {
      if (i === SEM_ACORDE) return soma && t.forca > 0.05 ? 0.35 : 2;
      if (!soma || t.forca <= 0.05) return -1;
      return notas(t.medio, t.baixo, i) + (campo.has(i) ? doTom : 0);
    });
  });
  // Viterbi: a soma das pontuações menos "troca" a cada mudança de acorde
  let pont = emissao[0].slice();
  const volta = [];
  for (let k = 1; k < trechos.length; k++) {
    const nova = new Array(N);
    const de = new Array(N);
    // Viterbi completo: cada acorde atual considera todos os acordes anteriores.
    // O atalho anterior só permitia permanecer no acorde atual ou saltar do melhor global,
    // o que podia apagar mudanças reais de harmonia e criar transições artificiais.
    for (let j = 0; j < N; j++) {
      let melhor = -Infinity;
      let anterior = 0;
      for (let i = 0; i < N; i++) {
        const candidato = pont[i] - (i === j ? 0 : troca);
        if (candidato > melhor) { melhor = candidato; anterior = i; }
      }
      nova[j] = melhor + emissao[k][j];
      de[j] = anterior;
    }
    volta.push(de);
    pont = nova;
  }
  let fim = 0;
  for (let i = 1; i < N; i++) if (pont[i] > pont[fim]) fim = i;
  const escolha = new Array(trechos.length);
  escolha[trechos.length - 1] = fim;
  for (let k = trechos.length - 1; k > 0; k--) escolha[k - 1] = volta[k - 1][escolha[k]];
  const seg = [];
  trechos.forEach((t, k) => {
    const acorde = nomeDoAcorde(escolha[k], tom);
    const inicio = Math.round(t.a * passo * 100) / 100;
    const fim2 = Math.round(t.b * passo * 100) / 100;
    const ult = seg[seg.length - 1];
    if (ult && ult.acorde === acorde) ult.fim = fim2;
    else seg.push({ inicio, fim: fim2, acorde });
  });
  return seg;
}

// O envelope de ataque para o andamento e as batidas, mais fino que os quadros do croma (256 amostras, ~23 ms: com
// 0,1 s, 140 e 150 BPM ficavam a menos de um quadro de distância): a subida da energia (em log) de um bloco ao outro
export function ataques(amostras, taxa = TAXA, bloco = 256) {
  const n = Math.floor(amostras.length / bloco);
  const env = new Float32Array(n);
  let antes = 0;
  for (let b = 0; b < n; b++) {
    let s = 0;
    for (let i = b * bloco; i < (b + 1) * bloco; i++) s += amostras[i] * amostras[i];
    const e = Math.log1p(1000 * s / bloco);
    env[b] = Math.max(0, e - antes);
    antes = e;
  }
  return { fluxo: env, passo: bloco / taxa };
}

// tudo junto: { bpm, tom, acordes, duracao }
export function analisar(amostras, taxa = TAXA) {
  const q = quadros(amostras, taxa);
  const at = ataques(amostras, taxa);
  const bpm = andamento(at.fluxo, at.passo);
  // (as batidas, do envelope fino para os quadros do croma)
  const marcas = [...new Set(batidas(at.fluxo, bpm, at.passo).map((b) => Math.round((b * at.passo) / q.passo)))];
  // o croma da música inteira (o baixo pesa menos), para o tom
  const total = new Array(12).fill(0);
  for (let f = 0; f < q.quadros; f++) for (let n = 0; n < 12; n++) total[n] += q.medio[f * 12 + n] + 0.5 * q.baixo[f * 12 + n];
  let tom = detectarTom(total);
  let acordes = reconhecerAcordes(q, { marcas, tom });
  // (o tom pelos acordes achados: o relativo menor e o maior têm as mesmas notas; vence o que tem mais tempo de tônica)
  tom = tomPelosAcordes(tom, acordes);
  acordes = acordes.map((s) => ({ ...s, acorde: s.acorde && trocarGrafia(s.acorde, tom) }));
  return { bpm: Math.round(bpm), tom, acordes, duracao: Math.round((amostras.length / taxa) * 10) / 10 };
}

const raizDe = (nome) => {
  const m = /^([A-G])([#b]?)/.exec(nome || '');
  if (!m) return -1;
  return (({ C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 })[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12;
};
function tomPelosAcordes(tom, acordes) {
  if (!tom) return tom;
  const tempo = (raiz, menor) => acordes.filter((s) => s.acorde && raizDe(s.acorde) === raiz && /m$/.test(s.acorde) === menor).reduce((a, s) => a + (s.fim - s.inicio), 0);
  const relativo = tom.menor ? { tonica: (tom.tonica + 3) % 12, menor: false } : { tonica: (tom.tonica + 9) % 12, menor: true };
  const doTom = tempo(tom.tonica, tom.menor);
  const doRelativo = tempo(relativo.tonica, relativo.menor);
  // (e a música costuma terminar na tônica)
  const ultimo = [...acordes].reverse().find((s) => s.acorde);
  const bonus = (r) => (ultimo && raizDe(ultimo.acorde) === r.tonica && /m$/.test(ultimo.acorde) === r.menor ? 4 : 0);
  if (doRelativo + bonus(relativo) > 1.3 * (doTom + bonus(tom))) return { ...tom, ...relativo, nome: nomeDoTom(relativo.tonica, relativo.menor) };
  return tom;
}
function trocarGrafia(acorde, tom) {
  const r = raizDe(acorde);
  if (r < 0) return acorde;
  return (TONS_BEMOL.has(tom?.nome) ? NOMES_BEMOL : NOMES_SUSTENIDO)[r] + (/m$/.test(acorde) ? 'm' : '');
}

// ---- a letra transcrita
// "1:02.5", "01:02", "62.5", "[01:02.50]" → segundos (NaN se não der)
export function segundosDe(v) {
  if (typeof v === 'number') return v;
  const t = String(v ?? '').trim().replace(/^\[|\]$/g, '');
  const m = /^(?:(\d+):)?(\d+):(\d+(?:[.,]\d+)?)$/.exec(t) || /^()(\d+)[:'](\d+(?:[.,]\d+)?)$/.exec(t);
  if (m) return Number(m[1] || 0) * 3600 + Number(m[2]) * 60 + Number(m[3].replace(',', '.'));
  const s = Number(t.replace(',', '.'));
  return Number.isFinite(s) ? s : NaN;
}

function normalizarSecao(valor) {
  const s = String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  if (/^(intro|introduction|introducao)$/.test(s)) return 'Intro';
  if (/^(verse|verso|estrofe)(\s*\d+)?$/.test(s)) return 'Verse' + (s.match(/\d+/)?.[0] ? ' ' + s.match(/\d+/)[0] : '');
  if (/^(pre chorus|pre refr[aã]o)$/.test(s)) return 'Pre-Chorus';
  if (/^(chorus|refr[aã]o)$/.test(s)) return 'Chorus';
  if (/^(bridge|ponte)$/.test(s)) return 'Bridge';
  if (/^(instrumental|solo)$/.test(s)) return 'Instrumental';
  if (/^(outro|final)$/.test(s)) return 'Outro';
  return String(valor).trim().replace(/\b\p{L}/gu, (m) => m.toLocaleUpperCase('pt-BR'));
}
function capitalizarFrase(texto) {
  // Maiúscula no começo da linha e depois de cada pontuação que encerra uma frase.
  return String(texto || '').trim().replace(/(^|[.!?…]+\s+)([“"'‘¿¡(]*)(\p{L})/gu,
    (_, separador, abertura, letra) => separador + abertura + letra.toLocaleUpperCase('pt-BR'));
}

function chaveEstrutural(texto) {
  return String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/\[[^\]]*\]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

// Quando o modelo não identifica os rótulos, recupera refrões repetidos por blocos de pelo menos duas linhas.
// O restante é separado em estrofes consecutivas, sem alterar os tempos nem a ordem cantada.
function inferirSecoes(linhas) {
  const saida = linhas.map((l) => ({ ...l }));
  const chaves = saida.map((l) => chaveEstrutural(l.texto));
  const n = chaves.length;
  let melhor = null;
  // O modelo às vezes devolve "Verse 1" em todas as linhas, mesmo quando o refrão se repete.
  // Esses rótulos genéricos não podem bloquear a detecção do refrão.
  const secaoForte = (s) => !!s && !/^Verse(?:\s+\d+)?$/i.test(s);
  for (let tamanho = Math.min(8, Math.floor(n / 2)); tamanho >= 2 && !melhor; tamanho--) {
    const vistos = new Map();
    for (let i = 0; i + tamanho <= n; i++) {
      if (saida.slice(i, i + tamanho).some((l) => secaoForte(l.secao))) continue;
      const bloco = chaves.slice(i, i + tamanho);
      if (bloco.some((x) => !x)) continue;
      const chave = bloco.join(' | ');
      const anteriores = vistos.get(chave) || [];
      const repeticao = anteriores.find((j) => Math.abs(i - j) >= tamanho);
      if (repeticao !== undefined) { melhor = { tamanho, inicios: [...anteriores, i] }; break; }
      anteriores.push(i);
      vistos.set(chave, anteriores);
    }
  }
  if (melhor) {
    for (const inicio of melhor.inicios) {
      for (let k = inicio; k < inicio + melhor.tamanho; k++) saida[k].secao = 'Chorus';
    }
  }
  let verso = 0;
  let emVerso = false;
  for (const linha of saida) {
    if (linha.secao && !/^Verse(?:\s+\d+)?$/i.test(linha.secao)) { emVerso = false; continue; }
    if (!emVerso) { verso++; emVerso = true; }
    if (!linha.secao || /^Verse(?:\s+\d+)?$/i.test(linha.secao)) linha.secao = 'Verse ' + verso;
  }
  return saida;
}

// A resposta da transcrição ({ linhas: [{ inicio, fim?, texto }] }, em JSON, ou linhas LRC "[mm:ss.xx] texto") →
// [{ texto, inicio, fim }] em ordem, sem as linhas vazias, os rótulos ("[Refrão]", "(instrumental)") e as repetições
// coladas (o mesmo instante duas vezes); o fim de cada linha é o começo da próxima (no máximo 12 s depois)
export function lerTranscricao(resposta, duracao = 0) {
  let lista = [];
  const texto = typeof resposta === 'string' ? resposta.trim().replace(/^```(?:json)?\s*|\s*```$/g, '') : '';
  let dados = typeof resposta === 'object' && resposta ? resposta : null;
  if (!dados && texto.startsWith('{')) { try { dados = JSON.parse(texto); } catch { dados = null; } }
  if (!dados && texto.startsWith('[{')) { try { dados = { linhas: JSON.parse(texto) }; } catch { dados = null; } }
  if (dados) {
    lista = (dados.linhas || dados.lines || []).map((l) => ({ texto: String(l.texto ?? l.text ?? ''), inicio: segundosDe(l.inicio ?? l.start), fim: segundosDe(l.fim ?? l.end), secao: String(l.secao ?? l.section ?? '').trim() }));
  } else {
    for (const linha of texto.split(/\r?\n/)) {
      const m = /^\s*\[(\d+:\d+(?:[.,]\d+)?)\]\s*(.*)$/.exec(linha);
      if (m) lista.push({ texto: m[2], inicio: segundosDe(m[1]), fim: NaN });
    }
  }
  lista = lista
    .map((l) => ({ ...l, texto: capitalizarFrase(l.texto.replace(/\s+/g, ' ').replace(/^[-–—•*]\s*/, '').trim()), secao: normalizarSecao(l.secao) }))
    .filter((l) => Number.isFinite(l.inicio) && l.inicio >= 0 && l.texto
      && !/^[[(].*[\])]$/.test(l.texto) // ([Refrão], (instrumental), (solo))
      && /[\p{L}\p{N}]/u.test(l.texto))
    .sort((a, b) => a.inicio - b.inicio);
  const saida = [];
  for (const l of lista) {
    const ult = saida[saida.length - 1];
    if (ult && Math.abs(ult.inicio - l.inicio) < 0.05 && ult.texto === l.texto) continue;
    if (duracao > 0 && l.inicio > duracao) continue;
    saida.push(l);
  }
  const normalizadas = saida.map((l, i) => {
    const prox = saida[i + 1]?.inicio ?? (duracao > 0 ? duracao : l.inicio + 6);
    const fim = Number.isFinite(l.fim) && l.fim > l.inicio && l.fim <= prox + 0.5 ? l.fim : Math.min(prox, l.inicio + 12);
    return { texto: capitalizarFrase(l.texto), inicio: Math.round(l.inicio * 100) / 100, fim: Math.round(Math.max(fim, l.inicio + 0.3) * 100) / 100, secao: l.secao || '' };
  });
  return inferirSecoes(normalizadas);
}

// O pedido ao Gemini: ouvir o áudio e devolver a letra cantada, linha por linha, com o instante em que cada uma
// começa e termina. (O Gemini ouve a música inteira de uma vez, com a voz no meio da banda.)
export const PEDIDO_TRANSCRICAO = 'Você é um transcritor de letras de música. Ouça a gravação inteira e transcreva EXATAMENTE a letra cantada, '
  + 'no idioma em que é cantada, como numa cifra: uma entrada separada para cada linha/frase cantada (normalmente de 2 a 7 palavras), quebrando nas pausas naturais do canto. NUNCA una duas ou mais linhas cantadas em uma única entrada, mesmo quando forem consecutivas; cada linha deve ter seu próprio início e fim. Não divida uma frase contínua palavra por palavra. '
  + 'Para cada linha, dê o instante em que a voz começa a cantá-la ("inicio") e em que termina ("fim"), no formato mm:ss.cc, '
  + 'medidos nesta gravação (do começo do arquivo). Transcreva cada repetição (o refrão cantado de novo entra de novo, no tempo dele). '
  + 'Não escreva acordes, nomes de quem canta nem descrições. IDENTIFIQUE A ESTRUTURA MUSICAL: para cada linha, preencha também "secao" com a seção correspondente, usando "Intro", "Verse 1", "Pre-Chorus", "Chorus", "Bridge", "Instrumental" ou "Outro" quando aplicável. Diferencie verso e refrão pelas repetições e mudanças musicais; mantenha o mesmo nome nas linhas da mesma seção e incremente o número dos versos quando houver nova estrofe. Se não for possível identificar com segurança, use string vazia. '
  + 'Não invente: se uma palavra não dá para entender, escreva a mais provável pelo som; se não há canto, devolva "linhas": [].';
// O áudio de uma música encontrada na busca + a letra que o app já encontrou: o Gemini não reescreve a letra,
// apenas localiza cada linha na gravação. Repetições devem aparecer de novo, nos tempos em que são cantadas.
export function corpoDaSincronia({ tipo, dados, linhas }) {
  const lista = (linhas || []).map((linha, i) => `${i + 1}. ${String(linha || '').trim()}`).filter((l) => l.trim().length > 0).join('\n');
  return {
    contents: [{ role: 'user', parts: [
      { inline_data: { mime_type: tipo, data: dados } },
      { text: 'Você é um alinhador de letras musicais. Ouça a gravação inteira e sincronize a letra fornecida abaixo com a voz. ' +
        'Devolva uma entrada para cada ocorrência cantada, com o número da linha na lista ("n"), o texto da linha exatamente como foi fornecido, sem o número ("texto"), e os instantes "inicio" e "fim" em mm:ss.cc, relativos ao começo do áudio. ' +
        'Preserve a ordem e as quebras das linhas; não junte linhas diferentes, não divida uma linha em palavras, não invente versos e não transcreva trechos que não estejam na letra fornecida. ' +
        'Quando o refrão ou outra linha se repetir, inclua novamente a mesma linha com o novo tempo. Ignore introduções instrumentais e pausas sem voz. ' +
        'Se uma linha não for cantada ou não puder ser localizada com segurança, omita-a. ' +
        'Retorne somente JSON no formato {"linhas":[{"n":1,"texto":"...","inicio":"00:00.00","fim":"00:03.20"}]}.\n\nLETRA NUMERADA:\n' + lista },
    ] }],
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          linhas: { type: 'ARRAY', items: { type: 'OBJECT', properties: {
            n: { type: 'INTEGER' }, texto: { type: 'STRING' }, inicio: { type: 'STRING' }, fim: { type: 'STRING' },
          }, required: ['n', 'texto', 'inicio', 'fim'] } },
        },
        required: ['linhas'],
      },
    },
  };
}

// A resposta do alinhamento → [{ texto, inicio, fim }], com o texto de cada linha como está na letra enviada. A linha é
// reconhecida pelo texto devolvido (sem a numeração da lista, que o modelo às vezes copia: "12. Santo, santo") e, se o
// texto veio alterado (a pontuação, uma palavra trocada), pelo número dela ("n"). O que não é da letra enviada sai.
const canonDaLinha = (v) => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
export function lerSincronia(resposta, linhas = [], duracao = 0) {
  let dados = typeof resposta === 'object' && resposta ? resposta : null;
  if (!dados) {
    const texto = String(resposta || '').trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
    try { dados = JSON.parse(texto); } catch { return []; }
  }
  if (Array.isArray(dados)) dados = { linhas: dados };
  const originais = new Map(linhas.map((l) => [canonDaLinha(l), l]));
  const entradas = [];
  for (const l of dados?.linhas || dados?.lines || []) {
    const cru = String(l?.texto ?? l?.text ?? '');
    const n = Number(l?.n ?? l?.numero ?? l?.linha);
    const original = originais.get(canonDaLinha(cru))
      ?? originais.get(canonDaLinha(cru.replace(/^\s*\d{1,3}\s*[.):-]\s*/, '')))
      ?? (Number.isInteger(n) && n >= 1 && n <= linhas.length ? linhas[n - 1] : undefined);
    if (original === undefined) continue;
    entradas.push({ texto: original, inicio: l.inicio ?? l.start, fim: l.fim ?? l.end });
  }
  return lerTranscricao({ linhas: entradas }, duracao)
    .map((l) => ({ texto: originais.get(canonDaLinha(l.texto)) ?? l.texto, inicio: l.inicio, fim: l.fim }));
}

export function corpoDaTranscricao({ tipo, dados }) {
  return {
    contents: [{ role: 'user', parts: [{ inline_data: { mime_type: tipo, data: dados } }, { text: PEDIDO_TRANSCRICAO }] }],
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          idioma: { type: 'STRING' },
          linhas: { type: 'ARRAY', items: { type: 'OBJECT', properties: { inicio: { type: 'STRING' }, fim: { type: 'STRING' }, texto: { type: 'STRING' }, secao: { type: 'STRING' } }, required: ['inicio', 'texto', 'secao'] } },
        },
        required: ['linhas'],
      },
    },
  };
}

// ---- a cifra
const acordeEm = (acordes, t) => acordes.find((s) => s.inicio <= t + 1e-6 && t < s.fim) || null;
// os acordes de um trecho sem letra (introdução, solo, final), sem repetir o vizinho: "[G]  [D]  [Em]  [C]"
function linhaDeAcordes(acordes, de, ate, ultimo) {
  const lista = [];
  for (const s of acordes) {
    if (!s.acorde || s.fim <= de + 0.3 || s.inicio >= ate - 0.3) continue;
    if (s.fim - s.inicio < 0.22 && lista.length) continue; // (o acorde de passagem curtinho fica de fora)
    if (lista[lista.length - 1] === s.acorde || (!lista.length && s.acorde === ultimo)) continue;
    lista.push(s.acorde);
  }
  return lista;
}
// as posições (no texto) do começo de cada palavra
const comecosDePalavra = (t) => { const r = []; const re = /\S+/g; let m; while ((m = re.exec(t))) r.push(m.index); return r; };

// Uma linha da letra com os acordes: o que soa no começo dela no início e cada troca na palavra cantada naquele
// instante (pela fração do tempo da linha). Devolve { texto, ultimo }
export function linhaComAcordes(linha, acordes, ultimo = '') {
  const { texto, inicio, fim } = linha;
  const palavras = comecosDePalavra(texto);
  const dur = Math.max(0.3, fim - inicio);
  const colocar = new Map(); // posição → acorde
  const noComeco = acordeEm(acordes, inicio + 0.05);
  if (noComeco?.acorde) colocar.set(0, noComeco.acorde);
  let atual = noComeco?.acorde || ultimo;
  for (const s of acordes) {
    if (!s.acorde || s.inicio <= inicio + 0.05 || s.inicio >= fim - 0.05) continue;
    if (s.acorde === atual) continue;
    if (s.fim - s.inicio < 0.2) continue; // (passagem muito curta)
    const fracao = (s.inicio - inicio) / dur;
    const alvo = fracao * texto.length;
    // a palavra cantada naquele ponto (a última que começa até ali), sem cair numa que já tem acorde
    let pos = palavras.filter((p) => p <= alvo).pop() ?? palavras[0] ?? 0;
    if (colocar.has(pos)) {
      const livre = palavras.find((p) => p > pos && !colocar.has(p));
      if (livre === undefined) { colocar.set(pos, s.acorde); atual = s.acorde; continue; }
      pos = livre;
    }
    colocar.set(pos, s.acorde);
    atual = s.acorde;
  }
  let saida = '';
  let ini = 0;
  for (const pos of [...colocar.keys()].sort((a, b) => a - b)) {
    saida += texto.slice(ini, pos) + `[${colocar.get(pos)}]`;
    ini = pos;
  }
  saida += texto.slice(ini);
  return { texto: saida, ultimo: atual };
}

// A cifra inteira em ChordPro: o título, o artista, o tom e o andamento; os trechos sem canto de mais de 4 s viram uma
// linha só de acordes (a introdução, os solos, o final) e uma pausa de mais de 3 s no canto separa as estrofes
export function montarCifra({ titulo = '', artista = '', linhas = [], acordes = [], tom = null, bpm = 0, duracao = 0 }) {
  const limpo = (v) => String(v || '').replace(/[{}\n]/g, ' ').trim();
  const out = [`{title: ${limpo(titulo) || 'Música importada'}}`];
  if (limpo(artista)) out.push(`{artist: ${limpo(artista)}}`);
  if (tom?.nome) out.push(`{key: ${tom.nome}}`);
  if (bpm > 0) out.push(`{tempo: ${Math.round(bpm)}}`);
  out.push('');
  const fimDaMusica = duracao || acordes[acordes.length - 1]?.fim || linhas[linhas.length - 1]?.fim || 0;
  let ultimo = '';
  let secaoAtual = '';
  const soAcordes = (de, ate, rotulo) => {
    const lista = linhaDeAcordes(acordes, de, ate, ultimo);
    if (!lista.length) return;
    if (out[out.length - 1] !== '') out.push('');
    out.push(`{comment: ${rotulo}}`);
    out.push(lista.map((a) => `[${a}]`).join('  '));
    out.push('');
    ultimo = lista[lista.length - 1];
  };
  if (!linhas.length) {
    // (sem canto: a música instrumental fica com os acordes, de quatro em quatro por linha)
    const lista = linhaDeAcordes(acordes, 0, fimDaMusica || Infinity, '');
    for (let i = 0; i < lista.length; i += 4) out.push(lista.slice(i, i + 4).map((a) => `[${a}]`).join('  '));
    return out.join('\n').trim() + '\n';
  }
  if (linhas[0].inicio > 4) soAcordes(0, linhas[0].inicio, 'Introdução');
  linhas.forEach((l, i) => {
    const antes = linhas[i - 1];
    if (antes) {
      const pausa = l.inicio - antes.fim;
      if (pausa > 4) soAcordes(antes.fim, l.inicio, 'Instrumental');
      else if (pausa > 3 && out[out.length - 1] !== '') out.push('');
    }
    const secao = normalizarSecao(l.secao);
    if (secao && secao !== secaoAtual) {
      if (out[out.length - 1] !== '') out.push('');
      out.push(`{comment: ${secao}}`);
      secaoAtual = secao;
    }
    const r = linhaComAcordes(l, acordes, ultimo);
    out.push(r.texto);
    ultimo = r.ultimo;
  });
  const ult = linhas[linhas.length - 1];
  if (fimDaMusica - ult.fim > 4) soAcordes(ult.fim, fimDaMusica, 'Final');
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

// "Artista - Título.mp3", "01. Título (Ao Vivo).m4a", "Titulo_da_musica.wav" → { titulo, artista }
export function nomesDoArquivo(nome) {
  let t = String(nome || '').replace(/\.[^./\\]{1,5}$/, '').replace(/_+/g, ' ').replace(/\s+/g, ' ').trim();
  t = t.replace(/^\d{1,3}\s*[-.)]\s*/, '').trim(); // (o número da faixa)
  const partes = t.split(/\s+[-–—]\s+/);
  if (partes.length >= 2 && partes[0] && partes.slice(1).join(' - ')) return { artista: partes[0].trim(), titulo: partes.slice(1).join(' - ').trim() };
  return { titulo: t || 'Música importada', artista: '' };
}
