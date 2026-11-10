// Repetir um trecho da música (o ensaio, como as "Song Sections" do Moises): as partes da música saem da letra
// sincronizada (onde cada parte começa e acaba) e a pessoa escolhe uma para repetir, ou marca o começo e o fim à mão.
// Aqui fica só a conta (sem tela nem player), para o teste; quem leva a música de volta ao começo do trecho é o
// player (app.js).

// o menor trecho que se repete, em segundos (menor que isso, a volta engasga)
export const MENOR_TRECHO = 2;

// As partes da música pela letra sincronizada.
// tempos: [{ inicio, fim }] de cada linha cantada; marcas: Map(linha → nome da parte que começa nela: "Chorus"…);
// pausas: as linhas que vêm depois de um trecho só de música (a parte de antes acaba no fim da última linha cantada,
// e não no começo desta); fins: o fim cantado de cada linha (sem ele, o `fim` do tempo); duracao: a da gravação.
// Devolve [{ nome, inicio, fim, linha }], na ordem da música. A parte sem nome é "Verse"; as repetidas ganham número.
export function secoesDaLetra({ tempos, marcas = new Map(), pausas = new Set(), fins = null, duracao = 0 } = {}) {
  if (!Array.isArray(tempos) || !tempos.length) return [];
  const valido = (k) => Number.isFinite(tempos[k]?.inicio);
  const comecos = [];
  for (let k = 0; k < tempos.length; k++) {
    if (!valido(k)) continue;
    if (!comecos.length || marcas.has(k) || pausas.has(k)) comecos.push(k);
  }
  const fimDe = (k) => {
    const f = Number(fins?.[k]);
    if (Number.isFinite(f) && f > tempos[k].inicio) return f;
    const g = Number(tempos[k].fim);
    return Number.isFinite(g) && g > tempos[k].inicio ? g : tempos[k].inicio + 4;
  };
  const secoes = comecos.map((k, i) => {
    const prox = comecos[i + 1];
    let ultima = k;
    for (let j = k; j < (prox ?? tempos.length); j++) if (valido(j)) ultima = j;
    // (a próxima parte vem logo: a volta é no começo dela; depois de um trecho só de música, no fim do que se cantou)
    let fim = prox !== undefined && !pausas.has(prox) ? tempos[prox].inicio : fimDe(ultima) + 0.4;
    if (prox !== undefined) fim = Math.min(fim, tempos[prox].inicio);
    if (duracao > 0) fim = Math.min(fim, duracao);
    const inicio = Math.max(0, tempos[k].inicio - 0.3);
    return { nome: marcas.get(k) || 'Verse', inicio, fim, linha: k };
  }).filter((s) => s.fim - s.inicio >= MENOR_TRECHO);
  // as partes de mesmo nome ganham número, na ordem em que aparecem (Verse 1, Verse 2; Chorus 1, Chorus 2), valendo
  // o nome sem o número que a cifra já trazia ("Verse 2" e a parte sem nome são o mesmo "Verse"); a única fica sem
  const base = (nome) => String(nome).replace(/\s*\d+\s*$/, '').trim() || 'Verse';
  const total = new Map();
  for (const s of secoes) total.set(base(s.nome), (total.get(base(s.nome)) || 0) + 1);
  const visto = new Map();
  return secoes.map((s) => {
    const b = base(s.nome);
    if (total.get(b) < 2) return { ...s, nome: b };
    const n = (visto.get(b) || 0) + 1;
    visto.set(b, n);
    return { ...s, nome: `${b} ${n}` };
  });
}

// o trecho marcado à mão: do começo (A) ao fim (B), na ordem certa e com o tamanho mínimo; null se não der
export function trechoMarcado(a, b, duracao = 0) {
  let ini = Number(a);
  let fim = Number(b);
  if (!Number.isFinite(ini) || !Number.isFinite(fim)) return null;
  if (fim < ini) [ini, fim] = [fim, ini];
  ini = Math.max(0, ini);
  if (duracao > 0) fim = Math.min(fim, duracao);
  if (fim - ini < MENOR_TRECHO) return null;
  return { nome: 'Trecho marcado', inicio: ini, fim };
}

// Para onde a música tem de ir agora, repetindo o trecho: o começo dele quando passou do fim ou está antes dele
// (a pessoa foi para outro ponto: a repetição continua, do começo); null = segue tocando.
export function voltaDoTrecho(trecho, agora) {
  if (!trecho || !Number.isFinite(agora)) return null;
  if (agora >= trecho.fim - 0.05 || agora < trecho.inicio - 1) return trecho.inicio;
  return null;
}

// "1:05"
export const relogio = (seg) => {
  const s = Math.max(0, Math.floor(Number(seg) || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
