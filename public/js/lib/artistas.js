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

// ---- o artista certo no Deezer (e na Wikipédia) pelo nome
// O nome sem acentos, sem pontuação e sem espaços: "Jung Kook", "JUNG KOOK" e "Jungkook" são o mesmo artista
export const nomeJunto = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const nomeSeparado = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
// o mesmo nome, escrito junto ou separado ("Jung Kook" e "Jungkook"), ou um dentro do outro por palavras inteiras
// ("Frei Gilson" e "Frei Gilson - CMES")
export function mesmoNomeDeArtista(a, b) {
  const A = nomeSeparado(a);
  const B = nomeSeparado(b);
  if (!A || !B) return false;
  return A === B || nomeJunto(A) === nomeJunto(B) || ` ${A} `.includes(` ${B} `) || ` ${B} `.includes(` ${A} `);
}
// O artista do Deezer com o nome pedido. Os de nome igual — escrito junto ou separado — e, entre eles, o que tem mais
// fãs: o "Jung Kook" de 7.898 fãs (outro artista, com capa de música indiana) vinha no lugar do "Jungkook" de 475 mil,
// só por ter o espaço igual ao do nome procurado; e o "justice" desconhecido vinha antes do Justice. Vários com o mesmo
// nome e nenhum conhecido costuma ser outro artista (o "Belief" dos créditos de Perfect vinha com a capa de uma banda
// de 96 fãs), e um nome só parecido também ("Belief Defect" não é o "Belief"; o parecido, como "Frei Gilson - CMES",
// vale quando não há o igual e ele é conhecido): aí, null
export function artistaDeezerCerto(lista, nome) {
  const fas = (x) => Number(x?.nb_fan) || 0;
  const alvo = nomeJunto(nome);
  if (!alvo) return null;
  const parecidos = (lista || []).filter((x) => x && mesmoNomeDeArtista(x.name, nome)).sort((x, y) => fas(y) - fas(x));
  const iguais = parecidos.filter((x) => nomeJunto(x.name) === alvo);
  if (iguais.length) return iguais.length > 1 && fas(iguais[0]) < 1000 ? null : iguais[0];
  return parecidos[0] && fas(parecidos[0]) >= 1000 ? parecidos[0] : null;
}
// A faixa do Deezer que é a música (o mesmo título e o mesmo artista), numa busca por "artista título": o artista dela
// é com certeza o que canta a música, mesmo quando a busca por nome traz outro com o mesmo nome. null se não houver
export function faixaDaMusica(lista, { titulo, artista }) {
  const limpo = (t) => nomeSeparado(String(t || '').replace(/\s*[([][^)\]]*[)\]]/g, ''));
  const t = limpo(titulo);
  if (!t) return null;
  return (lista || []).find((x) => x?.artist?.id && limpo(x.title) === t && mesmoNomeDeArtista(x.artist.name, artista)) || null;
}

// As fontes (funções que devolvem a promessa do valor), da preferida para a última, todas ao mesmo tempo: vale a
// preferida que tiver o valor. Quando uma de menos preferência já tem e as de cima ainda não responderam, elas são
// esperadas só mais um pouco (folga): antes, uma depois da outra, a foto do artista esperava o YouTube fora do ar
// (até 6,5 s) antes de perguntar ao Cifra Club e ao Deezer, que respondem na hora
// (folga 0: espera sempre a preferida)
export function primeiraPorPreferencia(fontes, { folga = 1200 } = {}) {
  if (!fontes.length) return Promise.resolve('');
  return new Promise((ok) => {
    const res = fontes.map(() => undefined); // undefined: esperando; '': não tem
    let fim = false;
    let relogio = 0;
    const melhorPronta = () => res.find((v) => v);
    const conferir = () => {
      if (fim) return;
      for (const v of res) {
        if (v === undefined) break; // uma preferida ainda responde
        if (v) { fim = true; clearTimeout(relogio); ok(v); return; }
      }
      if (res.every((v) => v !== undefined)) { fim = true; clearTimeout(relogio); ok(''); return; }
      if (folga > 0 && melhorPronta() && !relogio) relogio = setTimeout(() => { if (!fim) { fim = true; ok(melhorPronta() || ''); } }, folga);
    };
    fontes.forEach((f, i) => {
      Promise.resolve().then(f).catch(() => '').then((v) => { res[i] = v || ''; conferir(); });
    });
  });
}
