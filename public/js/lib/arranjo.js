// Partitura completa (o padrão da partitura gerada): a Melodia na clave de sol e, na clave de fá, o Acompanhamento
// escrito pelos acordes da música (o baixo no tempo forte e o acorde nos outros tempos, no desenho do compasso). Ao
// tocar, a partitura soa como a música (melodia, harmonia e pulso), e não só como a linha do canto.
//
// Os acordes vêm da pauta da melodia (a cifra em cada nota: e.c), como no coral pela cifra.

import { notasDaCifra } from './alinhamento.js';
import { alturaDoMidi, tiquesDoCompasso } from './partitura.js';
import { acordesDaPauta } from './harmonizar.js';

// a altura da classe "pc" dentro de [lo, lo + 11]
const naFaixa = (pc, lo) => lo + ((((pc - lo) % 12) + 12) % 12);
const BAIXO_DE = 40; // Mi2 a Ré#3
const ACORDE_DE = 52; // Mi3 a Ré#4

// o baixo (a nota da barra ou a fundamental) e o acorde fechado (até 4 notas), sempre na mesma região: cada nota do
// acorde cai sempre na mesma altura, então a passagem de um acorde para o outro move o mínimo
export function maoEsquerda(cifra) {
  const ac = notasDaCifra(cifra);
  if (!ac) return null;
  const quinta = ac.notas.find((n) => [6, 7, 8].includes((n.pc - ac.raiz + 12) % 12))?.pc ?? ac.raiz;
  const acorde = [...new Set(ac.notas.slice(0, 4).map((n) => naFaixa(n.pc, ACORDE_DE)))].sort((a, b) => a - b);
  return { baixo: naFaixa(ac.baixo, BAIXO_DE), quinta: naFaixa(quinta, BAIXO_DE), acorde };
}

// o desenho de um compasso: [{ t (tique no compasso), d, papel: 'baixo' | 'quinta' | 'acorde' }]
export function desenhoDoCompasso([tempos, unidade]) {
  const cheio = tiquesDoCompasso([tempos, unidade]);
  const out = [];
  if (unidade === 8) {
    // compasso composto (6/8, 9/8, 12/8) e 3/8: colcheias em grupos de 3 — baixo, acorde, acorde
    for (let t = 0, i = 0; t < cheio; t += 4, i++) out.push({ t, d: 4, papel: i % 3 ? 'acorde' : (i / 3) % 2 ? 'quinta' : 'baixo' });
    return out;
  }
  const n = cheio / 8; // semínimas no compasso
  for (let i = 0; i < n; i++) out.push({ t: i * 8, d: 8, papel: i === 0 ? 'baixo' : n === 4 && i === 2 ? 'quinta' : 'acorde' });
  return out;
}

// a pauta do acompanhamento para a melodia "pauta" (com as cifras nas notas): os eventos, do mesmo tamanho da melodia;
// null se a melodia não tem nenhum acorde que o app entenda
export function acompanhar(pauta, { compasso = [4, 4], anacruse = 0, fifths = 0 } = {}) {
  const acordes = acordesDaPauta(pauta);
  if (!acordes.length) return null;
  const total = pauta.ev.reduce((a, e) => a + e.d, 0);
  const cheio = tiquesDoCompasso(compasso);
  const desenho = desenhoDoCompasso(compasso);
  const inicio = anacruse > 0 && anacruse < cheio ? anacruse : 0;
  // toca do compasso da primeira nota (ou do primeiro acorde, o que vier antes) até o fim da última nota da melodia;
  // antes do primeiro acorde escrito, vale ele mesmo
  let fimDasNotas = 0;
  let primeiraNota = null;
  let tique = 0;
  for (const e of pauta.ev) { if (e.a?.length && primeiraNota == null) primeiraNota = tique; tique += e.d; if (e.a?.length) fimDasNotas = tique; }
  const comeco = Math.min(acordes[0].tique, primeiraNota ?? acordes[0].tique);
  const primeiro = Math.max(inicio, inicio + Math.floor((comeco - inicio) / cheio) * cheio);
  const acordeEm = (t) => { let a = acordes[0]; for (const x of acordes) { if (x.tique <= t) a = x; else break; } return a; };
  const ev = [];
  const pausa = (d) => { if (d > 0) { const u = ev[ev.length - 1]; if (u && !u.a.length) u.d += d; else ev.push({ a: [], d }); } };
  pausa(Math.min(primeiro, total));
  for (let c = primeiro; c < total; c += cheio) {
    for (const fig of desenho) {
      const t = c + fig.t;
      if (t >= total) break;
      const d = Math.min(fig.d, total - t);
      const mao = t < fimDasNotas ? maoEsquerda(acordeEm(t).cifra) : null;
      if (!mao) { pausa(d); continue; }
      // o acorde mudou no meio do compasso: a figura que cai nele toca o baixo novo
      const mudou = fig.t > 0 && acordes.some((x) => x.tique > c && x.tique > t - fig.d && x.tique <= t);
      const alts = fig.papel === 'acorde' && !mudou ? mao.acorde : [fig.papel === 'quinta' && !mudou ? mao.quinta : mao.baixo];
      ev.push({ a: alts.map((m) => alturaDoMidi(m, fifths)), d });
    }
  }
  return ev;
}

// o modelo com uma pauta só (a melodia, já com as cifras) → Melodia + Acompanhamento; false se não havia acordes
export function arranjar(modelo) {
  const melodia = modelo.pautas.find((p) => p.ev.some((e) => e.a?.length));
  if (!melodia) return false;
  const ev = acompanhar(melodia, modelo);
  if (!ev) return false;
  modelo.pautas = [{ ...melodia, id: 'md', nome: 'Melodia' }, { id: 'me', nome: 'Acompanhamento', clave: 'F', ev }];
  return true;
}
