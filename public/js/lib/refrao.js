// O trecho do refrão de uma música, pela letra sincronizada ({ linhas, tempos: [{ inicio, fim }] }): o refrão é o
// pedaço que se repete. Para cada linha, conta quantas das próximas (uma janela de 4) aparecem de novo em outro ponto
// da música; o refrão começa na primeira linha repetida da janela com mais repetidas (no empate, a que vem antes).
// Devolve { inicio, fim } em segundos (o trecho de `duracao` segundos, começando meio segundo antes da linha), ou null
// quando a letra não tem tempos ou nada se repete.

const limpar = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/\(.*?\)|\[.*?\]/g, ' ').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

export function trechoDoRefrao(sinc, duracao = 30) {
  const linhas = sinc?.linhas || [];
  const tempos = sinc?.tempos || [];
  const idx = linhas.map((_, i) => i).filter((i) => Number.isFinite(tempos[i]?.inicio) && limpar(linhas[i]).split(' ').length >= 2);
  if (idx.length < 4) return null;
  const vezes = new Map();
  for (const i of idx) { const k = limpar(linhas[i]); vezes.set(k, (vezes.get(k) || 0) + 1); }
  const repetida = (i) => vezes.get(limpar(linhas[i])) >= 2;
  let melhor = -1;
  let pontos = 0;
  for (let j = 0; j < idx.length; j++) {
    if (!repetida(idx[j])) continue;
    const n = idx.slice(j, j + 4).filter(repetida).length;
    if (n > pontos) { pontos = n; melhor = j; }
  }
  if (melhor < 0 || pontos < 2) return null;
  const inicio = Math.max(0, tempos[idx[melhor]].inicio - 0.5);
  return { inicio, fim: inicio + duracao };
}
