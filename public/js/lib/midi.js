// Partitura pronta a partir de um arquivo MIDI (Standard MIDI File): o arquivo já traz as notas exatas, o andamento,
// o compasso e os instrumentos da música, então a partitura sai na hora, sem ouvir áudio nenhum. O app escreve duas
// pautas: a Melodia (a linha principal) e o Acompanhamento (o baixo e os acordes dos outros instrumentos, reduzidos
// para uma pauta em clave de fá), para que, ao tocar, soe como a música e não só como a linha do canto.

import { alturaDoMidi, estimarTom, novaPartitura, tiquesDoCompasso } from './partitura.js';

// ---- leitura do arquivo: { ppq, bpm, compasso, fifths, modo, notas: [{ ini, fim (em semínimas), alt, vel, trilha,
// canal, nome (da trilha) }] }
export function lerMidi(bytes) {
  const d = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const texto = (p, n) => String.fromCharCode(...d.subarray(p, p + n));
  const u32 = (p) => ((d[p] << 24) | (d[p + 1] << 16) | (d[p + 2] << 8) | d[p + 3]) >>> 0;
  const u16 = (p) => (d[p] << 8) | d[p + 1];
  // (o .rmi é um MIDI dentro de um RIFF: o cabeçalho de verdade vem depois)
  let p = 0;
  while (p < Math.min(d.length - 4, 64) && texto(p, 4) !== 'MThd') p++;
  if (texto(p, 4) !== 'MThd') throw new Error('o arquivo não é um MIDI');
  const tamanho = u32(p + 4);
  const nTrilhas = u16(p + 10);
  const divisao = u16(p + 12);
  if (divisao & 0x8000) throw new Error('MIDI com tempo em quadros (SMPTE) não é aceito');
  const ppq = divisao || 480;
  p += 8 + tamanho;
  const notas = [];
  let bpm = null;
  let compasso = null;
  let tom = null;
  for (let t = 0; t < nTrilhas && p + 8 <= d.length; t++) {
    if (texto(p, 4) !== 'MTrk') { p += 8 + u32(p + 4); t--; if (p >= d.length) break; continue; }
    const fim = Math.min(d.length, p + 8 + u32(p + 4));
    p += 8;
    let tique = 0;
    let status = 0;
    let nome = '';
    const abertas = new Map(); // canal*128 + altura → [nota aberta]
    const vlq = () => { let v = 0; let b; do { b = d[p++]; v = (v << 7) | (b & 0x7f); } while (b & 0x80 && p < fim); return v >>> 0; };
    const fechar = (chave) => { const n = abertas.get(chave)?.shift(); if (n) n.fim = tique / ppq; };
    while (p < fim) {
      tique += vlq();
      let b = d[p];
      if (b & 0x80) { status = b; p++; } else b = status; // "running status": o mesmo comando do evento anterior
      if (status === 0xff) {
        const tipo = d[p++];
        const n = vlq();
        if (tipo === 0x03 && !nome) nome = texto(p, Math.min(n, 60));
        else if (tipo === 0x51 && n === 3 && bpm == null) bpm = 60e6 / ((d[p] << 16) | (d[p + 1] << 8) | d[p + 2]);
        else if (tipo === 0x58 && n >= 2 && !compasso) compasso = [d[p], 2 ** d[p + 1]];
        else if (tipo === 0x59 && n >= 2 && !tom) tom = { fifths: (d[p] << 24) >> 24, modo: d[p + 1] ? 'minor' : 'major' };
        p += n;
      } else if (status === 0xf0 || status === 0xf7) {
        p += vlq();
      } else {
        const cmd = status & 0xf0;
        const canal = status & 0x0f;
        const a = d[p++];
        const v = cmd === 0xc0 || cmd === 0xd0 ? 0 : d[p++];
        const chave = canal * 128 + a;
        if (cmd === 0x90 && v > 0) {
          const n = { ini: tique / ppq, fim: null, alt: a, vel: v / 127, trilha: t, canal };
          notas.push(n);
          if (!abertas.has(chave)) abertas.set(chave, []);
          abertas.get(chave).push(n);
        } else if (cmd === 0x80 || cmd === 0x90) fechar(chave);
      }
    }
    for (const lista of abertas.values()) for (const n of lista) n.fim = tique / ppq;
    for (const n of notas) if (n.trilha === t) n.nome = nome;
    p = fim;
  }
  const boas = notas.filter((n) => n.fim != null && n.fim > n.ini);
  return { ppq, bpm: bpm || 120, compasso: compasso || [4, 4], fifths: tom?.fifths ?? null, modo: tom?.modo || 'major', notas: boas };
}

// ---- a melodia: a trilha (ou o canal) que canta a linha principal
const NOME_MELODIA = /melod|vocal|voca|voice|voz|lead|sing|canto|solo|chant|gesang|theme|tema/i;
const NOME_FUNDO = /bass|baixo|drum|bater|perc|pad|string|cordas|choir|coro|back/i;
// fração do tempo tocado em que soa mais de uma nota ao mesmo tempo
function sobreposta(notas) {
  const ordem = [...notas].sort((a, b) => a.ini - b.ini);
  let juntas = 0;
  let total = 0;
  let fimAnt = -Infinity;
  for (const n of ordem) {
    total += n.fim - n.ini;
    if (n.ini < fimAnt - 1e-6) juntas += Math.min(fimAnt, n.fim) - n.ini;
    fimAnt = Math.max(fimAnt, n.fim);
  }
  return total ? juntas / total : 0;
}
export function gruposDoMidi(notas) {
  const mapa = new Map();
  for (const n of notas) {
    if (n.canal === 9) continue; // a bateria
    const k = `${n.trilha}:${n.canal}`;
    if (!mapa.has(k)) mapa.set(k, { id: k, nome: n.nome || '', notas: [] });
    mapa.get(k).notas.push(n);
  }
  const fimDaMusica = Math.max(1, ...notas.map((n) => n.fim));
  return [...mapa.values()].map((g) => {
    const media = g.notas.reduce((a, n) => a + n.alt, 0) / g.notas.length;
    const poli = sobreposta(g.notas);
    const tocado = g.notas.reduce((a, n) => a + (n.fim - n.ini), 0) / fimDaMusica;
    let pontos = 0;
    if (NOME_MELODIA.test(g.nome)) pontos += 6;
    if (NOME_FUNDO.test(g.nome)) pontos -= 4;
    pontos += (1 - Math.min(1, poli * 3)) * 3; // uma nota de cada vez
    pontos += media >= 57 && media <= 84 ? 2 : media >= 50 && media <= 90 ? 0.5 : -2; // na altura de quem canta
    pontos += Math.min(1, g.notas.length / 60) * 2; // toca bastante
    pontos += Math.min(1, tocado * 2); // e por boa parte da música
    return { ...g, media, poli, pontos };
  }).sort((a, b) => b.pontos - a.pontos);
}

// ---- das notas para as pautas
const GRADE = 2; // semicolcheia (em tiques de 8 por semínima)
const noTique = (semiminimas) => Math.round((semiminimas * 8) / GRADE) * GRADE;

// uma linha só (em cada começo de nota, a mais aguda), já na grade: [{ t, d, alt }]
function linha(notas) {
  const porComeco = new Map();
  for (const n of notas) {
    const t = noTique(n.ini);
    const atual = porComeco.get(t);
    if (!atual || n.alt > atual.alt) porComeco.set(t, { t, fim: Math.max(t + GRADE, noTique(n.fim)), alt: n.alt });
  }
  const ordem = [...porComeco.values()].sort((a, b) => a.t - b.t);
  return ordem.map((n, i) => ({ t: n.t, d: Math.max(GRADE, Math.min(n.fim, ordem[i + 1]?.t ?? Infinity) - n.t), alt: n.alt }));
}
// o acompanhamento numa pauta: em cada começo (na grade de colcheias), o baixo e até 3 notas do acorde, dobrados para
// caber na clave de fá: [{ t, d, alts: [midi] }]
function reducao(notas) {
  const passo = 4;
  const naColcheia = (s) => Math.round((s * 8) / passo) * passo;
  const porComeco = new Map();
  for (const n of notas) {
    const t = naColcheia(n.ini);
    if (!porComeco.has(t)) porComeco.set(t, { t, fim: t + passo, alts: [] });
    const g = porComeco.get(t);
    g.alts.push(n.alt);
    g.fim = Math.max(g.fim, naColcheia(n.fim));
  }
  const dobrar = (alt, lo, hi) => { let a = alt; while (a < lo) a += 12; while (a > hi) a -= 12; return a; };
  const ordem = [...porComeco.values()].sort((a, b) => a.t - b.t);
  return ordem.map((g, i) => {
    const ordenadas = [...new Set(g.alts)].sort((a, b) => a - b);
    const baixo = dobrar(ordenadas[0], 36, 52);
    const alts = [baixo];
    for (const a of ordenadas.slice(1)) {
      const x = dobrar(a, 48, 64);
      if (x > baixo && !alts.some((y) => y % 12 === x % 12) && alts.length < 4) alts.push(x);
    }
    return { t: g.t, d: Math.max(passo, Math.min(g.fim, ordem[i + 1]?.t ?? Infinity) - g.t), alts: alts.sort((a, b) => a - b) };
  });
}
// [{ t, d, … }] → eventos do modelo (com as pausas entre as notas), de "de" até "ate"
function eventos(itens, de, ate, alturas) {
  const ev = [];
  let agora = de;
  for (const x of itens) {
    if (x.t < agora) continue;
    if (x.t >= ate) break;
    // o respiro de uma semicolcheia entre duas notas não vira pausa: a nota de antes segura até a próxima
    if (x.t > agora && x.t - agora <= GRADE && ev.length && ev[ev.length - 1].a.length) ev[ev.length - 1].d += x.t - agora;
    else if (x.t > agora) ev.push({ a: [], d: x.t - agora });
    const d = Math.min(x.d, ate - x.t);
    ev.push({ a: alturas(x), d });
    agora = x.t + d;
  }
  if (ate > agora) ev.push({ a: [], d: ate - agora });
  return ev;
}

const UNIDADES = new Set([2, 4, 8]);
// MIDI lido → o modelo da partitura (Melodia + Acompanhamento); null se o arquivo não tem notas afinadas
export function modeloDoMidi(midi, { titulo = '' } = {}) {
  const grupos = gruposDoMidi(midi.notas);
  if (!grupos.length) return null;
  let melodia;
  let resto;
  if (grupos.length === 1) {
    // um instrumento só (piano solo): a linha de cima é a melodia e o que soa abaixo dela, o acompanhamento
    const todas = grupos[0].notas;
    const topo = new Map();
    for (const n of todas) { const t = noTique(n.ini); if (n.alt >= 60 && (!topo.has(t) || n.alt > topo.get(t).alt)) topo.set(t, n); }
    const doTopo = new Set(topo.values());
    melodia = [...doTopo];
    resto = todas.filter((n) => !doTopo.has(n));
    if (melodia.length < 8) { melodia = todas; resto = []; }
  } else {
    // a melodia passa de um instrumento para outro (a introdução no violino, o canto na voz): onde o instrumento
    // principal fica calado por mais de um tempo, entra o próximo instrumento de uma nota só que estiver tocando
    melodia = [...grupos[0].notas];
    const cobertos = () => melodia.map((n) => [n.ini - 1, n.fim + 1]).sort((a, b) => a[0] - b[0]);
    for (const g of grupos.slice(1)) {
      if (g.poli > 0.15 || g.media < 55 || g.media > 88 || NOME_FUNDO.test(g.nome)) continue;
      const faixas = cobertos();
      // (as faixas estão em ordem de começo: basta guardar até onde já se cobriu)
      let k = 0;
      let ateOnde = -Infinity;
      const livres = [];
      for (const n of [...g.notas].sort((a, b) => a.ini - b.ini)) {
        while (k < faixas.length && faixas[k][0] <= n.fim) { ateOnde = Math.max(ateOnde, faixas[k][1]); k++; }
        if (ateOnde <= n.ini) livres.push(n);
      }
      if (livres.length >= 4) melodia.push(...livres);
    }
    const daMelodia = new Set(melodia);
    resto = grupos.flatMap((g) => g.notas).filter((n) => !daMelodia.has(n));
  }
  const compasso = UNIDADES.has(midi.compasso?.[1]) && midi.compasso[0] >= 1 && midi.compasso[0] <= 12 ? midi.compasso : [4, 4];
  const cheio = tiquesDoCompasso(compasso);
  const mel = linha(melodia);
  const acomp = reducao(resto);
  const tudo = [...mel, ...acomp];
  if (!mel.length) return null;
  // sem os compassos vazios do começo; o fim fecha o último compasso
  const de = Math.floor(Math.min(...tudo.map((x) => x.t)) / cheio) * cheio;
  const ate = Math.ceil(Math.max(...tudo.map((x) => x.t + x.d)) / cheio) * cheio;
  let { fifths, modo } = midi;
  if (fifths == null || fifths < -7 || fifths > 7) {
    ({ fifths, modo } = estimarTom(midi.notas.filter((n) => n.canal !== 9).map((n) => ({ pitchMidi: n.alt, durationSeconds: n.fim - n.ini, amplitude: n.vel }))));
  }
  // a melodia muito grave ou muito aguda para a clave de sol: sobe ou desce em oitavas
  const media = mel.reduce((a, n) => a + n.alt, 0) / mel.length;
  const oitava = media < 55 ? 12 : media > 86 ? -12 : 0;
  const m = novaPartitura({ titulo, compasso, fifths, modo, bpm: Math.round(Math.max(30, Math.min(240, midi.bpm)) * 10) / 10, tipo: 'piano' });
  m.pautas[0].nome = 'Melodia';
  m.pautas[0].ev = eventos(mel, de, ate, (x) => [alturaDoMidi(x.alt + oitava, fifths)]);
  if (acomp.length) {
    m.pautas[1].nome = 'Acompanhamento';
    m.pautas[1].ev = eventos(acomp, de, ate, (x) => x.alts.map((a) => alturaDoMidi(a, fifths)));
  } else m.pautas.pop();
  // (a letra e a cifra não entram sozinhas: o arranjo do MIDI pode ter introdução e repetições diferentes da cifra)
  m.letraAuto = true;
  m.cifraAuto = true;
  return m;
}
