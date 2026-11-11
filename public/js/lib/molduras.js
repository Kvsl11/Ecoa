// As faixas de moldura de um quadro do clipe (em cima e embaixo): as pretas, de cinema, e as de qualquer outra cor lisa
// (brancas, cinza, coloridas), que alguns clipes trazem gravadas no próprio vídeo. Antes só as pretas eram
// reconhecidas, e o clipe com faixas claras aparecia com elas na capa animada.
// Uma linha é faixa quando quase toda ela (92%) tem a cor da borda: o logotipo do canal pode estar em cima da faixa.
const PERTO = 18; // o quanto cada canal pode fugir da cor da borda (o ruído da compressão)
const ESCURO = 30; // até aqui a linha é preta (a regra de antes)
const luz = (r, g, b) => r * 0.3 + g * 0.59 + b * 0.11;
const mediana = (v) => { const o = [...v].sort((a, b) => a - b); return o[o.length >> 1]; };

// a cor de uma linha: a mediana de cada canal
function corDaLinha(px, w, y) {
  const r = []; const g = []; const b = [];
  for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; r.push(px[i]); g.push(px[i + 1]); b.push(px[i + 2]); }
  return [mediana(r), mediana(g), mediana(b)];
}
function linhaDaCor(px, w, y, cor, preta) {
  let n = 0;
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (preta ? luz(px[i], px[i + 1], px[i + 2]) <= ESCURO
      : Math.abs(px[i] - cor[0]) <= PERTO && Math.abs(px[i + 1] - cor[1]) <= PERTO && Math.abs(px[i + 2] - cor[2]) <= PERTO) n++;
  }
  return n >= w * 0.92;
}

// px: os pixels RGBA do quadro (w x h). Devolve as faixas como fração da altura: { cima, baixo, lisa }.
// lisa = as faixas não são pretas. Essas só valem quando existem dos dois lados (2% da altura ou mais em cada um) e
// na mesma cor: um céu claro no alto da cena, sem o par embaixo, não é moldura. O quadro de uma cor só não tem faixa.
export function faixasDoQuadro(px, w, h) {
  const nada = { cima: 0, baixo: 0, lisa: false };
  if (!px || w < 1 || h < 2) return nada;
  const corC = corDaLinha(px, w, 0);
  const corB = corDaLinha(px, w, h - 1);
  const pretaC = luz(...corC) <= ESCURO;
  const pretaB = luz(...corB) <= ESCURO;
  let cima = 0;
  while (cima < h && linhaDaCor(px, w, cima, corC, pretaC)) cima++;
  if (cima >= h) return nada;
  let baixo = 0;
  while (baixo < h && linhaDaCor(px, w, h - 1 - baixo, corB, pretaB)) baixo++;
  if (pretaC && pretaB) return { cima: cima / h, baixo: baixo / h, lisa: false };
  // (um lado preto e o outro não: só o preto é faixa, como antes)
  if (pretaC !== pretaB) return { cima: pretaC ? cima / h : 0, baixo: pretaB ? baixo / h : 0, lisa: false };
  const mesmaCor = corC.every((c, i) => Math.abs(c - corB[i]) <= PERTO);
  if (!mesmaCor || Math.min(cima, baixo) / h < 0.02) return nada;
  return { cima: cima / h, baixo: baixo / h, lisa: true };
}
