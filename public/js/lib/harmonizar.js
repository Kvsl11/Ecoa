// Coral a 4 vozes pela cifra: a melodia (Soprano) vem do áudio e o Contralto, o Tenor e o Baixo são escritos pela
// harmonia (os acordes da música), com as regras de condução de vozes de um hinário: o baixo na nota do baixo do
// acorde (a fundamental ou a da barra: G/B → Si), o acorde completo (a terça nunca falta), as vozes sem cruzar e sem
// abrir demais, o menor movimento possível de uma nota para a outra e sem quintas e oitavas paralelas.
//
// Antes as 3 vozes de baixo saíam das notas da banda que a IA ouvia (o violão, o teclado, o baixo), repartidas por
// altura: o resultado era o acompanhamento redistribuído, não uma parte cantável. Uma gravação da missa quase nunca
// tem as 4 vozes de verdade para ouvir, e o que se ensaia é a harmonia da cifra.
//
// As vozes cantam no ritmo do Soprano e com a mesma letra (homorritmia, como no hinário); a nota de passagem da
// melodia (fora do acorde) não muda as outras vozes, que seguram a nota de antes.

import { notasDaCifra } from './alinhamento.js';
import { alturaDoMidi, midiDa } from './partitura.js';

export const EXTENSOES = { c: [55, 74], t: [48, 67], b: [41, 62] };
const CENTROS = { c: 63, t: 56, b: 48 };

const pc = (m) => ((Math.round(m) % 12) + 12) % 12;

// os acordes de uma pauta: [{ tique, cifra }] na ordem (só os que a leitura entende)
export function acordesDaPauta(pauta) {
  const out = [];
  let tique = 0;
  for (const e of pauta.ev) {
    if (e.c && notasDaCifra(e.c)) out.push({ tique, cifra: e.c });
    tique += e.d;
  }
  return out;
}

// o acorde que soa no tique (o último que começou; antes do primeiro, o primeiro)
function acordeEm(acordes, tique) {
  let a = acordes[0];
  for (const x of acordes) { if (x.tique <= tique) a = x; else break; }
  return a;
}

// todas as alturas da classe "classe" dentro de [lo, hi]
function alturasDe(classes, [lo, hi]) {
  const out = [];
  for (let p = lo; p <= hi; p++) if (classes.has(p % 12)) out.push(p);
  return out;
}

// paralelas: duas vozes que estavam a uma quinta (ou oitava/uníssono) e continuam nela, as duas se movendo
function paralela(a0, b0, a1, b1) {
  if (a0 == null || b0 == null || a0 === a1 || b0 === b1) return false;
  const i0 = Math.abs(a0 - b0) % 12;
  const i1 = Math.abs(a1 - b1) % 12;
  return (i0 === 7 && i1 === 7) || (i0 === 0 && i1 === 0);
}

// as maneiras de cantar o acorde "ac" ({ raiz, baixo, notas: [{pc}] }) com a nota "s" no Soprano: [{ c, t, b, custo }],
// com o custo só do acorde em si (completo, distâncias, uníssonos); o caminho de um para o outro conta em passagem()
export function vozeamentos(s, ac) {
  const classes = new Set(ac.notas.map((n) => n.pc));
  const terca = ac.notas[1] && ac.notas[1].pc !== (ac.raiz + 7) % 12 ? ac.notas[1].pc : null;
  const quinta = ac.notas.find((n) => [6, 7, 8].includes((n.pc - ac.raiz + 12) % 12))?.pc ?? null;
  const setima = ac.notas.find((n) => [9, 10, 11].includes((n.pc - ac.raiz + 12) % 12))?.pc ?? null;
  const graves = alturasDe(new Set([ac.baixo]), EXTENSOES.b);
  const baixos = graves.length ? graves : [CENTROS.b];
  const out = [];
  for (const b of baixos) {
    if (b >= s) continue;
    const tenores = alturasDe(classes, [Math.max(EXTENSOES.t[0], b), EXTENSOES.t[1]]);
    for (const t of tenores) {
      const contraltos = alturasDe(classes, [Math.max(EXTENSOES.c[0], t), Math.min(EXTENSOES.c[1], s)]);
      for (const c of contraltos) {
        let custo = 0;
        const usadas = [pc(s), pc(c), pc(t), pc(b)];
        const conta = (x) => usadas.filter((u) => u === x).length;
        // o acorde completo: sem a terça não se sabe se é maior ou menor; a sétima, quando há, também
        if (terca != null && !conta(terca)) custo += 12;
        if (!conta(ac.raiz)) custo += 6;
        if (quinta != null && !conta(quinta)) custo += 1;
        if (setima != null && !conta(setima)) custo += 3;
        // a terça dobrada soa pesada
        if (terca != null && conta(terca) > 1) custo += 3;
        // uníssono com a voz de cima (duas vozes na mesma nota) só se não tiver jeito
        if (c === s) custo += 6;
        if (t === c) custo += 6;
        if (t === b) custo += 8;
        // distâncias: Soprano–Contralto e Contralto–Tenor até uma oitava; Tenor–Baixo até uma décima segunda
        if (s - c > 12) custo += 4 + (s - c - 12);
        if (c - t > 12) custo += 4 + (c - t - 12);
        if (t - b > 19) custo += 3;
        // uma segunda abaixo do Soprano (a nota da melodia fora do acorde): dissonante
        if (s - c > 0 && s - c <= 2) custo += 4;
        // perto do meio da extensão de cada voz (pouco: só desempata)
        custo += Math.abs(c - CENTROS.c) * 0.08 + Math.abs(t - CENTROS.t) * 0.08 + Math.abs(b - CENTROS.b) * 0.05;
        out.push({ c, t, b, custo });
      }
    }
  }
  if (out.length) return out;
  // a melodia grave demais para caber as 3 vozes abaixo dela: as vozes ficam nas notas do acorde mais perto do meio
  const perto = (lista, alvo) => lista.reduce((x, y) => (Math.abs(y - alvo) < Math.abs(x - alvo) ? y : x), lista[0]);
  return [{ c: perto(alturasDe(classes, EXTENSOES.c), CENTROS.c), t: perto(alturasDe(classes, EXTENSOES.t), CENTROS.t), b: perto(baixos, CENTROS.b), custo: 20 }];
}

// o custo de ir de um acorde cantado (a: { s, c, t, b }) para o seguinte (b): cada voz perto de onde estava (as vozes
// do meio quase sem saltos; o baixo pode pular mais) e sem quintas ou oitavas paralelas
export function passagem(a, b) {
  const mov = (x, y, solto) => { const d = Math.abs(x - y); return d + (d > solto ? (d - solto) * 1.5 : 0) + (d > 12 ? 10 : 0); };
  let custo = mov(b.c, a.c, 4) * 0.7 + mov(b.t, a.t, 4) * 0.7 + mov(b.b, a.b, 7) * 0.25;
  const vs = ['s', 'c', 't', 'b'];
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (paralela(a[vs[i]], a[vs[j]], b[vs[i]], b[vs[j]])) custo += 8;
  return custo;
}

// uma nota do Soprano só, sem contexto (ou vindo de "ant"): { c, t, b }
export function vozearAcorde(s, ac, ant = null) {
  let melhor = null;
  for (const v of vozeamentos(s, ac)) {
    const custo = v.custo + (ant ? passagem(ant, { s, ...v }) : 0);
    if (!melhor || custo < melhor.custo) melhor = { ...v, custo };
  }
  return { c: melhor.c, t: melhor.t, b: melhor.b };
}

// a frase inteira de uma vez (Viterbi): o melhor caminho para as 3 vozes juntas, de nota em nota do Soprano. Escolher
// nota por nota (a melhor agora) às vezes encurralava uma voz e ela tinha de saltar uma sétima mais adiante.
// notas: [{ s, ac, segura }] (segura: a nota de passagem da melodia, fora do acorde e com o mesmo acorde da anterior:
// as outras vozes seguram a nota de antes). Devolve [{ c, t, b }]
function caminhoDaFrase(notas) {
  const opcoes = [];
  const custo = [];
  const veio = [];
  notas.forEach((n, k) => {
    // só as melhores maneiras de cada acorde (as outras nunca ganham e deixam a conta lenta no celular)
    let ops = vozeamentos(n.s, n.ac).sort((a, b) => a.custo - b.custo).slice(0, 24).map((v) => ({ ...v, s: n.s }));
    if (n.segura && k > 0) {
      // segurar: cada opção da nota anterior continua igual (se ainda fica abaixo do Soprano)
      ops = opcoes[k - 1].map((v, i) => ({ c: v.c, t: v.t, b: v.b, s: n.s, custo: v.c <= n.s ? 0 : 20, de: i })).concat(ops.map((v) => ({ ...v, custo: v.custo + 6 })));
    }
    opcoes.push(ops);
    if (k === 0) {
      custo.push(ops.map((v) => v.custo));
      veio.push(ops.map(() => -1));
      return;
    }
    const ant = opcoes[k - 1];
    const ca = custo[k - 1];
    const cs = [];
    const vs = [];
    for (const v of ops) {
      let melhor = Infinity;
      let de = -1;
      for (let i = 0; i < ant.length; i++) {
        const x = ca[i] + (v.de === i ? 0 : v.de != null ? 1e6 : passagem(ant[i], v));
        if (x < melhor) { melhor = x; de = i; }
      }
      cs.push(melhor + v.custo);
      vs.push(de);
    }
    custo.push(cs);
    veio.push(vs);
  });
  const out = new Array(notas.length);
  let i = custo[notas.length - 1].indexOf(Math.min(...custo[notas.length - 1]));
  for (let k = notas.length - 1; k >= 0; k--) {
    const v = opcoes[k][i];
    out[k] = { c: v.c, t: v.t, b: v.b };
    i = veio[k][i];
  }
  return out;
}

// o coral pela cifra: do Soprano (pauta com notas, a letra e as cifras em "c") e dos acordes ([{ tique, cifra }],
// ou os da própria pauta), as pautas do Contralto, do Tenor e do Baixo, no mesmo ritmo e com a mesma letra.
// Devolve as 4 pautas (o Soprano como veio) ou null sem acordes para seguir
export function harmonizarCoral(soprano, { acordes = null, fifths = 0 } = {}) {
  const lista = (acordes?.length ? acordes : acordesDaPauta(soprano))
    .map((x) => ({ ...x, ac: notasDaCifra(x.cifra) })).filter((x) => x.ac)
    .sort((a, b) => a.tique - b.tique);
  if (!lista.length || !soprano.ev.some((e) => e.a?.length)) return null;
  // as notas do Soprano, com o acorde de cada uma; as pausas separam as frases (cada frase, um caminho)
  const itens = [];
  let tique = 0;
  let antAc = null;
  for (const e of soprano.ev) {
    if (!e.a?.length) { itens.push(null); antAc = null; } else {
      const s = midiDa(e.a[0]);
      const ac = acordeEm(lista, tique).ac;
      const segura = antAc === ac && !ac.notas.some((n) => n.pc === pc(s));
      itens.push({ s, ac, segura });
      antAc = ac;
    }
    tique += e.d;
  }
  const escolhas = new Array(itens.length).fill(null);
  for (let k = 0; k < itens.length;) {
    if (!itens[k]) { k++; continue; }
    let fim = k;
    while (fim < itens.length && itens[fim]) fim++;
    caminhoDaFrase(itens.slice(k, fim)).forEach((v, i) => { escolhas[k + i] = v; });
    k = fim;
  }
  const vozes = { c: [], t: [], b: [] };
  soprano.ev.forEach((e, k) => {
    const l = e.l ? [...e.l] : [];
    const r = escolhas[k];
    for (const v of 'ctb') vozes[v].push(r ? { a: [alturaDoMidi(r[v], fifths)], d: e.d, l, c: '' } : { a: [], d: e.d, l: [], c: '' });
  });
  // a mesma nota repetida sem sílaba nova (o melisma do Soprano) vira uma nota só, mais longa
  for (const v of 'ctb') {
    const ev = vozes[v];
    for (let i = ev.length - 1; i > 0; i--) {
      const a = ev[i - 1];
      const b = ev[i];
      if (a.a.length && b.a.length && a.a[0] === b.a[0] && !b.l.some(Boolean)) { a.d += b.d; ev.splice(i, 1); }
    }
  }
  return [
    soprano,
    { id: 'c', nome: 'Contralto', clave: 'G', ev: vozes.c },
    { id: 't', nome: 'Tenor', clave: 'G8', ev: vozes.t },
    { id: 'b', nome: 'Baixo', clave: 'F', ev: vozes.b },
  ];
}
