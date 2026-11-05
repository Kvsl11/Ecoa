// Separar os artistas de um nome ("Anitta, Ludmilla", "Lady Gaga / Bruno Mars") sem separar as duplas: "Jorge &
// Mateus", "Henrique & Juliano", "Zezé Di Camargo e Luciano", "Simon & Garfunkel" são um artista só, e separar levava
// a foto e a apresentação de outras pessoas ("Jorge" vinha como o Jorge Ben). Quem sabe se o nome inteiro é um artista
// só é o app (perguntando ao Deezer): `unico(nome)` responde true, false ou undefined (ainda não sabe). Enquanto não
// sabe, dois nomes ligados por "&" (ou " e ") ficam juntos, que é como as duplas se escrevem; com três ou mais, separa.

// os separadores fortes (sempre separam) e os que juntam duplas
const FORTES = /\s*(?:[,;/]|\sx\s)\s*/i;
const JUNTA_E = /\s+(?:&|e)\s+|\s*&\s*/i;
const JUNTA = /\s*&\s*/;

const limpar = (t) => String(t || '').replace(/[)\]]/g, '').trim();

// os nomes do texto; comE: também " e " separa (nos compositores: "Fulano e Beltrano"; no artista, " e " não separa).
// duplaComE: sem saber, dois nomes ligados por " e " ficam juntos ("Zezé Di Camargo e Luciano", no nome do artista); nos
// compositores, não (lá quase sempre são duas pessoas)
export function separarArtistas(texto, { unico = () => undefined, comE = false, duplaComE = false } = {}) {
  const t = limpar(texto);
  if (!t) return [];
  if (unico(t) === true) return [t];
  const juntaRe = comE ? JUNTA_E : JUNTA;
  return t.split(FORTES).map((x) => x.trim()).filter(Boolean).flatMap((pedaco) => {
    const partes = pedaco.split(juntaRe).map((x) => x.trim()).filter(Boolean);
    if (partes.length < 2) return [pedaco];
    const u = unico(pedaco);
    if (u === true) return [pedaco];
    if (u === false) return partes;
    // ainda sem saber: a dupla (dois nomes) fica junta
    return partes.length === 2 && (duplaComE || /&/.test(pedaco)) ? [pedaco] : partes;
  });
}

// os nomes que vale perguntar se são um artista só (os pedaços com "&" ou " e ")
export function nomesParaConferir(texto, { comE = false } = {}) {
  const t = limpar(texto);
  if (!t) return [];
  const juntaRe = comE ? JUNTA_E : JUNTA;
  const pedacos = t.split(FORTES).map((x) => x.trim()).filter((x) => x && x.split(juntaRe).length > 1);
  return [...new Set([...(pedacos.length && t !== pedacos[0] && /[&]|\se\s/i.test(t) ? [t] : []), ...pedacos])];
}

// o primeiro artista (para procurar a capa, a foto e a apresentação): sem o "feat."/"part." e sem separar a dupla
export function primeiroArtista(texto, opcoes = {}) {
  const semFeat = String(texto || '').split(/\s*(?:\(|\[)?\s*\b(?:feat\.?|ft\.?|featuring|part\.?|participa[çc][ãa]o(?: especial)?(?: de)?|with)\s+/i)[0];
  return separarArtistas(semFeat, { ...opcoes, comE: true, duplaComE: true })[0] || '';
}
