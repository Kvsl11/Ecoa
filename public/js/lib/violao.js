// O som do acorde no violão: tocar no desenho de um acorde faz soar as cordas dele, uma depois da outra (como uma
// batida para baixo), com um violão de nylon de verdade, gravado nota por nota (tonejs-instruments, de Nicholaus
// Brosowsky, licença CC-BY 3.0), servido pelo jsDelivr numa versão fixa. As notas sem gravação saem da mais perto,
// afinada. Só as gravações que o acorde usa são baixadas, uma vez (o service worker guarda para o modo offline).
// (Antes o som era sintetizado no aparelho e soava com chiado, pouco natural.)
import { formaDoAcorde } from '../acordes.js';

const BASE = 'https://cdn.jsdelivr.net/gh/nbrosowsky/tonejs-instruments@622c2f1c32c8cfce4158ddc3eb26e518ddef37e5/samples/guitar-nylon/';
// As gravações, de Ré2 a Lá#5, com a altura em que cada uma soa DE VERDADE (MIDI, com os cents medidos): nem todas estão
// na nota do nome. A "D5.mp3" soa um semitom acima (é um Ré#5, 621,8 Hz): com ela, a nota Ré5 saía Ré#5, e o acorde que
// tinha Ré5 (o G com capotraste na 7ª, a corda Mi aguda) soava com meio tom de choque contra o Ré4, "zoado". A Dó#5 está
// 12 cents acima e as Lá5 e Lá#5, 10 abaixo (dava para ouvir batendo contra as outras cordas). Cada nota é afinada a
// partir da altura medida, não do nome do arquivo. (Medido pela fundamental, de 0,15 a 0,65 s depois do ataque)
const GRAVADAS = [
  ['D2', 37.97], ['E2', 39.99], ['Fs2', 42.02], ['Gs2', 44], ['A2', 45], ['B2', 47], ['Cs3', 49.01], ['D3', 49.98],
  ['E3', 52], ['Fs3', 54], ['G3', 55.01], ['A3', 56.99], ['B3', 59.01], ['Cs4', 60.96], ['Ds4', 63.01], ['E4', 64],
  ['Fs4', 66.02], ['Gs4', 68.02], ['A4', 69.05], ['B4', 71], ['Cs5', 73.12], ['D5', 74.99], ['E5', 75.96], ['Fs5', 78.07],
  ['G5', 78.98], ['Gs5', 80.03], ['A5', 80.9], ['As5', 81.9],
];

// as cordas soltas na afinação padrão (MIDI), da 6ª (Mi grave) para a 1ª (Mi agudo)
const CORDAS = [40, 45, 50, 55, 59, 64];

// as notas (MIDI) que soam no acorde, da corda mais grave para a mais aguda; o capotraste sobe todas (o desenho é a
// forma, e o som é o do tom real)
export function notasNoViolao(nome, capo = 0) {
  const forma = formaDoAcorde(nome);
  if (!forma) return [];
  return forma.casas.map((c, s) => (c >= 0 ? CORDAS[s] + c + (Number(capo) || 0) : null)).filter((n) => n !== null);
}

// a gravação usada para uma nota: a que soa mais perto dela, e quanto afinar (playbackRate) a partir de onde ela soa
export function gravacaoPara(midi) {
  const [nome, altura] = GRAVADAS.reduce((a, b) => (Math.abs(b[1] - midi) < Math.abs(a[1] - midi) ? b : a));
  return { midi: Math.round(altura), arquivo: `${nome}.mp3`, afinacao: 2 ** ((midi - altura) / 12) };
}

let ctx = null;
const AC = () => typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
const contexto = () => { const C = AC(); if (C && !ctx) ctx = new C({ latencyHint: 'interactive' }); return ctx; };
// as gravações: arquivo → Promise (baixando) e arquivo → { buf, inicio } (prontas: o acorde toca na hora, sem esperar)
const gravacoes = new Map();
const prontas = new Map();
// onde a nota começa de verdade: as gravações têm uns 30 ms de silêncio antes da palhetada (o som parecia atrasar)
function inicioDoSom(buf) {
  const x = buf.getChannelData(0);
  let pico = 0;
  for (let i = 0; i < Math.min(x.length, buf.sampleRate * 0.3); i++) pico = Math.max(pico, Math.abs(x[i]));
  const i = x.findIndex((v) => Math.abs(v) > pico * 0.05);
  return Math.max(0, i / buf.sampleRate - 0.003);
}
function baixar(arquivo) {
  if (!gravacoes.has(arquivo)) {
    gravacoes.set(arquivo, fetch(BASE + arquivo)
      .then((r) => { if (!r.ok) throw new Error(`violão: ${r.status}`); return r.arrayBuffer(); })
      .then((b) => contexto().decodeAudioData(b))
      .then((buf) => { const g = { buf, inicio: inicioDoSom(buf) }; prontas.set(arquivo, g); return g; })
      .catch(() => { gravacoes.delete(arquivo); return null; })); // sem internet: tenta de novo da próxima vez
  }
  return gravacoes.get(arquivo);
}

// deixa prontas as gravações dos acordes (os da música, quando a faixa dos desenhos aparece): no toque, o som sai na hora
export function prepararAcordes(nomes, { capo = 0 } = {}) {
  if (!AC()) return;
  for (const nome of nomes || []) for (const m of notasNoViolao(nome, capo)) baixar(gravacaoPara(m).arquivo);
}

let saida = null; // o volume do acorde que está tocando (um acorde novo abafa o anterior)
function soar(vozes, grav, intervalo) {
  const c = contexto();
  // abafa o acorde anterior, como a mão na corda
  if (saida) saida.gain.setTargetAtTime(0, c.currentTime, 0.03);
  const g = c.createGain();
  g.gain.value = 0.55;
  g.connect(c.destination);
  saida = g;
  const t0 = c.currentTime;
  vozes.forEach((v, i) => {
    const { buf, inicio } = grav[i];
    const src = c.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = v.afinacao;
    // as cordas agudas um pouco mais leves (a batida para baixo começa forte no bordão)
    const corda = c.createGain();
    corda.gain.value = 1 - i * 0.06;
    src.connect(corda).connect(g);
    src.start(t0 + i * intervalo, inicio);
    src.stop(t0 + i * intervalo + Math.min(4, (buf.duration - inicio) / v.afinacao));
  });
  // o som vai morrendo, sem cortar de repente
  g.gain.setTargetAtTime(0, t0 + 2.6, 0.5);
}

// toca o acorde: true se ele vai soar (com as gravações prontas, na hora; senão, assim que chegarem), false se o
// aparelho não tem áudio na web ou o acorde não é conhecido
export function tocarAcorde(nome, { capo = 0, intervalo = 0.028 } = {}) {
  const notas = notasNoViolao(nome, capo);
  if (!notas.length || !AC()) return false;
  const c = contexto();
  if (c.state === 'suspended') c.resume();
  const vozes = notas.map((m) => gravacaoPara(m));
  const ja = vozes.map((v) => prontas.get(v.arquivo));
  if (ja.every(Boolean)) { soar(vozes, ja, intervalo); return true; }
  Promise.all(vozes.map((v) => baixar(v.arquivo))).then((grav) => { if (grav.every(Boolean)) soar(vozes, grav, intervalo); });
  return true;
}
