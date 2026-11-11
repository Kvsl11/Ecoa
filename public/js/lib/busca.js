// A lista da busca de músicas: só o que tem a ver com o que foi digitado. As fontes (o Cifra Club, o Letras e o
// YouTube) devolvem também o que só tem uma palavra em comum, ou a palavra dentro da letra ("Blood in your eyes" trazia
// "Shoulda Put Something On", o trailer de um jogo e um vídeo de oftalmologia). Aqui cada resultado recebe uma nota
// pelas palavras da busca que aparecem no nome dele (o título, o artista, o canal do vídeo), e, havendo resultados
// que casam com a busca, os outros saem. Sem nenhum que case (a busca por um trecho da letra), a lista fica como veio.

const norm = (x) => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// as palavras que não dizem qual é a música (artigos, preposições, pronomes curtos, em português e em inglês)
const VAZIAS = new Set(['a', 'o', 'e', 'as', 'os', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'um', 'uma', 'que', 'por', 'para', 'pra', 'com', 'meu', 'minha', 'teu', 'tua', 'seu', 'sua',
  'the', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'and', 'my', 'your', 'you', 'me', 'i', 'is', 'it']);

// As palavras da busca que contam: sem as vazias (a não ser que só haja vazias) e sem repetir
export function palavrasDaBusca(termo) {
  const todas = [...new Set(norm(termo).split(' ').filter(Boolean))];
  const cheias = todas.filter((p) => !VAZIAS.has(p));
  return cheias.length ? cheias : todas;
}

// uma letra trocada, a mais ou a menos (o erro de digitação): só entre palavras de 4 letras ou mais
function quaseIgual(a, b) {
  if (a.length < 4 || b.length < 4 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const [ra, rb] = [a.slice(i), b.slice(i)];
  return ra.slice(1) === rb.slice(1) || ra.slice(1) === rb || ra === rb.slice(1);
}
// a palavra da busca aparece no texto: igual, como começo de uma palavra (a busca ainda sendo digitada, de 3 letras em
// diante) ou com uma letra de diferença
const aparece = (p, palavras) => palavras.some((x) => x === p || (p.length >= 3 && x.startsWith(p)) || quaseIgual(p, x));

// A nota do resultado na busca, de 0 a 1: a parte das palavras da busca que aparece no nome dele
export function notaNaBusca(termo, texto) {
  const ps = palavrasDaBusca(termo);
  if (!ps.length) return 1;
  const palavras = norm(texto).split(' ').filter(Boolean);
  return ps.filter((p) => aparece(p, palavras)).length / ps.length;
}

// Os resultados que casam com a busca (dois terços das palavras, ou mais), os que casam inteiro primeiro, na ordem em
// que vieram. Sem nenhum que case, a lista inteira (a busca pelo trecho da letra). textoDe: resultado -> o nome dele
export const NOTA_MINIMA = 0.66;
export function soOsDaBusca(itens, termo, textoDe) {
  const notas = (itens || []).map((item, i) => ({ item, i, n: notaNaBusca(termo, textoDe(item)) }));
  const bons = notas.filter((x) => x.n >= NOTA_MINIMA);
  if (!bons.length) return itens || [];
  return bons.sort((a, b) => (b.n === 1) - (a.n === 1) || a.i - b.i).map((x) => x.item);
}
