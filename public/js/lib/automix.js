// A transição entre as músicas, como no Spotify e no Apple Music: o crossfade (a que acaba desce enquanto a próxima
// sobe, de 1 a 12 s) e o automix, que escolhe sozinho onde e como cruzar: depois da última frase cantada (sem cortar a
// voz), no tempo da batida da que acaba, e com a próxima entrando na primeira batida dela e no mesmo andamento.
// A batida só se acha no som que está no aparelho (os downloads e o áudio da pessoa): o YouTube não deixa o app ouvir
// o som do vídeo. Sem ela, o automix ainda escolhe o ponto pela letra sincronizada.

export const MAX_TRANSICAO = 12; // segundos (como no Spotify)
export const MIN_TRANSICAO = 1;

// os volumes nas duas pontas da transição, com x de 0 a 1: a mesma potência somada no meio (sem o buraco no volume
// que a reta dá)
export function volumes(x) {
  const t = Math.max(0, Math.min(1, x));
  return [Math.cos((t * Math.PI) / 2), Math.sin((t * Math.PI) / 2)];
}

// o crossfade simples: os últimos `seg` segundos da música
export function planoCrossfade(duracao, seg) {
  const dur = Math.max(MIN_TRANSICAO, Math.min(MAX_TRANSICAO, Number(seg) || 6));
  if (!(duracao > dur * 3)) return null;
  return { inicio: duracao - dur, dur, entradaEm: 0, taxa: 1 };
}

const HOP = 128; // amostras entre um quadro e outro (11,6 ms a 11025 Hz)
const JANELA = 512;

// a força dos ataques (as batidas, as notas que começam) quadro a quadro
function ataques(amostras) {
  const n = Math.max(0, Math.floor((amostras.length - JANELA) / HOP));
  const e = new Float32Array(n);
  for (let k = 0; k < n; k++) {
    let s = 0;
    const o = k * HOP;
    for (let i = 0; i < JANELA; i++) { const v = amostras[o + i]; s += v * v; }
    e[k] = Math.log(1 + 1000 * (s / JANELA));
  }
  const d = new Float32Array(n);
  for (let k = 1; k < n; k++) d[k] = Math.max(0, e[k] - e[k - 1]);
  // (tira a média de perto: sobra só o que sobe acima do vizinho)
  const meio = 20;
  const o = new Float32Array(n);
  let soma = 0;
  for (let k = 0; k < n; k++) {
    soma += d[k];
    if (k > 2 * meio) soma -= d[k - 2 * meio - 1];
    const ini = Math.max(0, k - 2 * meio);
    const media = soma / (k - ini + 1);
    o[k] = Math.max(0, d[k] - media);
  }
  return o;
}

// O andamento e a batida de um trecho: { bpm, periodo (s), fase (s: a primeira batida, a partir do começo do trecho),
// confianca (0 a 1) } ou null (silêncio, trecho curto)
export function batida(amostras, taxa = 11025) {
  if (!amostras || amostras.length < taxa * 6) return null;
  const o = ataques(amostras);
  const quadro = HOP / taxa;
  const n = o.length;
  let energia = 0;
  for (let k = 0; k < n; k++) energia += o[k] * o[k];
  if (energia <= 1e-9) return null;
  const ac = (L) => {
    const a = Math.floor(L);
    const f = L - a;
    let s = 0;
    for (let k = 0; k + a + 1 < n; k++) s += o[k] * (o[k + a] * (1 - f) + o[k + a + 1] * f);
    return s / energia;
  };
  // de 70 a 180 batidas por minuto, de 0,5 em 0,5; a preferência pelos andamentos do meio (perto de 115) resolve a
  // dúvida entre o dobro e a metade
  let melhor = null;
  const notas = [];
  for (let bpm = 70; bpm <= 180; bpm += 0.5) {
    const L = 60 / bpm / quadro;
    const bruto = ac(L) + 0.5 * ac(2 * L) + 0.25 * ac(4 * L);
    const peso = Math.exp(-0.5 * (Math.log2(bpm / 115) / 0.9) ** 2);
    const nota = bruto * peso;
    notas.push(nota);
    if (!melhor || nota > melhor.nota) melhor = { bpm, L, nota, bruto };
  }
  const media = notas.reduce((a, b) => a + b, 0) / notas.length;
  const confianca = Math.max(0, Math.min(1, (melhor.nota - media) / (melhor.nota + 1e-9)));
  // o andamento fino e a fase juntos: a grade de batidas (de 0,02 em 0,02 bpm, perto do achado) que mais cai em cima
  // dos ataques. Meio bpm de erro já escorrega a grade ao longo do trecho
  const naGrade = (f, P) => {
    let s = 0;
    for (let x = f; x < n; x += P) {
      const k = Math.round(x);
      s += o[k] + 0.5 * ((o[k - 1] || 0) + (o[k + 1] || 0));
    }
    return s;
  };
  let fase = 0;
  let maior = -1;
  const achado = melhor.bpm;
  for (let bpm = achado - 0.6; bpm <= achado + 0.6; bpm += 0.02) {
    const P = 60 / bpm / quadro;
    for (let f = 0; f < P; f += 0.5) {
      const s = naGrade(f, P);
      if (s > maior) { maior = s; fase = f; melhor = { ...melhor, bpm: Math.round(bpm * 100) / 100, L: P }; }
    }
  }
  const P = melhor.L;
  // (o quadro em que a energia mais sobe é o que já pega boa parte do ataque no fim da janela: o ataque fica quase uma
  // janela depois do começo dele)
  const periodo = P * quadro;
  const atraso = (JANELA - HOP) / taxa;
  let faseSeg = fase * quadro + atraso;
  faseSeg %= periodo;
  // a primeira batida de verdade: a primeira da grade que cai num ataque forte (pula o silêncio e o chiado do começo)
  let forte = 0;
  for (let k = 0; k < n; k++) if (o[k] > forte) forte = o[k];
  let primeira = faseSeg;
  for (let x = fase; x < n; x += P) {
    // (o ataque mais forte perto da batida, até 35 ms para cada lado: a própria batida)
    let pico = Math.round(x);
    for (let k = Math.max(0, pico - 3); k <= Math.min(n - 1, Math.round(x) + 3); k++) if (o[k] > (o[pico] || 0)) pico = k;
    if ((o[pico] || 0) >= forte * 0.3) { primeira = pico * quadro + atraso; break; }
  }
  return { bpm: melhor.bpm, periodo, fase: faseSeg, primeira, confianca };
}

// a batida que serve para encaixar (o suficiente de certeza)
export const BATIDA_OK = 0.35;
const boa = (b) => Boolean(b && b.confianca >= BATIDA_OK && b.periodo > 0);

// A taxa para a próxima entrar no andamento da que acaba (sem mudar o tom): só quando estão perto (até 8%, contando o
// dobro e a metade); longe, cada uma no seu (esticar mais do que isso se ouve)
export function taxaDoEncaixe(saida, entrada) {
  if (!boa(saida) || !boa(entrada)) return 1;
  for (const m of [1, 2, 0.5]) {
    const r = (saida.bpm * m) / entrada.bpm;
    if (Math.abs(r - 1) <= 0.08) return Math.round(r * 1000) / 1000;
  }
  return 1;
}

// O plano do automix. duracao: a da música que acaba; fimCanto: o fim da última frase cantada (da letra
// sincronizada), ou null; saida: a batida da que acaba (com a fase contada do começo da música), ou null; entrada: a
// da próxima (do começo dela), ou null. { inicio, dur, entradaEm (onde a próxima começa), taxa }
export function planoAutomix({ duracao, fimCanto = null, saida = null, entrada = null }) {
  if (!(duracao > 20)) return null;
  const temBatida = boa(saida);
  // a duração: compassos inteiros (16 batidas; 8 nas lentas; 32 nas muito rápidas), entre 4 e 12 s
  let dur = 8;
  if (temBatida) {
    let batidas = 16;
    while (batidas * saida.periodo > MAX_TRANSICAO && batidas > 4) batidas /= 2;
    while (batidas * saida.periodo < 4 && batidas < 64) batidas *= 2;
    dur = batidas * saida.periodo;
  }
  const fim = duracao - 0.4; // (um respiro antes do fim de verdade, onde o vídeo às vezes já para)
  let inicio = fim - dur;
  if (Number.isFinite(fimCanto) && fimCanto > 0 && fimCanto < duracao) {
    // a voz nunca é cortada: começa depois da última frase. Com o final instrumental comprido, não espera ele
    // inteiro (como o Apple Music): começa um pouco depois da voz, até 25 s antes do fim
    const depoisDaVoz = fimCanto + 1;
    if (inicio < depoisDaVoz) {
      inicio = depoisDaVoz;
      dur = Math.max(3, Math.min(dur, fim - inicio));
    } else inicio = Math.min(inicio, Math.max(fimCanto + 4, duracao - 25));
    inicio = Math.max(depoisDaVoz, Math.min(inicio, fim - dur));
  }
  // na batida da que acaba
  if (temBatida) {
    const p = saida.periodo;
    let k = Math.round((inicio - saida.fase) / p);
    let alinhado = saida.fase + k * p;
    if (Number.isFinite(fimCanto) && alinhado < fimCanto + 0.5) alinhado = saida.fase + ++k * p;
    if (alinhado + 2 < duracao) inicio = alinhado;
    // (e a duração em batidas inteiras, sem passar do fim)
    const cabem = Math.floor((fim - inicio) / p);
    const batidas = Math.max(2, Math.min(Math.round(dur / p), cabem));
    dur = batidas * p;
  }
  dur = Math.max(MIN_TRANSICAO, Math.min(MAX_TRANSICAO, dur, duracao - inicio));
  // a próxima entra na primeira batida dela (pula o silêncio do começo, até 3 s)
  const primeira = Number.isFinite(entrada?.primeira) ? entrada.primeira : entrada?.fase;
  const entradaEm = boa(entrada) && primeira >= 0 && primeira < 3 ? primeira : 0;
  return { inicio, dur, entradaEm, taxa: taxaDoEncaixe(saida, entrada) };
}
