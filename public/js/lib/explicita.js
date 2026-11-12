// O selo "E" (explícita), como no Spotify, no Apple Music e no Deezer. No mercado, o selo vem da gravadora (o
// "explicit" da faixa no catálogo, o que o Deezer e o iTunes devolvem) e, sem ele, de uma leitura automática da letra
// (palavrão, termo sexual explícito, ofensa). Aqui é igual: o catálogo primeiro (catalogoExplicito) e, para a música
// que o catálogo não tem ou não marca, a letra (analisarLetra), em português, inglês e espanhol.
//
// A lista é de propósito curta e só com palavras que não têm outro sentido comum: "pau", "rola", "pica", "gozar",
// "concha", "polla", "cock" e parecidas ficam de fora, para o canto da missa e a música romântica nunca ganharem o
// selo por engano. Cada termo tem um peso: 1 (forte: basta uma vez) ou 0.5 (leve: precisa de duas, ou de um forte).

const FORTES = [
  // português
  'porra', 'caralho', 'caralhos', 'foda', 'fodas', 'foda-se', 'fodase', 'fodido', 'fodida', 'fodidos', 'fodidas',
  'foder', 'fuder', 'fodendo', 'fudendo', 'fode', 'fodo', 'fodeu', 'fudeu', 'fodi', 'fudi',
  'puta', 'putas', 'puto', 'putaria', 'putinha', 'filho da puta', 'fdp', 'pqp', 'vsf', 'vtnc', 'tnc',
  'buceta', 'boceta', 'bucetinha', 'xereca', 'xoxota', 'xota', 'piroca', 'pirocada', 'caceta', 'cacetada',
  'punheta', 'siririca', 'boquete', 'arrombado', 'arrombada', 'cuzao', 'cuzinho', 'viado', 'viadinho', 'baitola',
  'vagabunda', 'vadia', 'rabuda', 'chifruda', 'meter a rola', 'sentando gostoso', 'sarrada', 'sarrar',
  // inglês
  'fuck', 'fucks', 'fucked', 'fucker', 'fuckers', 'fucking', 'fuckin', 'motherfucker', 'motherfuckers',
  'motherfuckin', 'shit', 'shits', 'shitty', 'bullshit', 'bitch', 'bitches', 'bitchin', 'nigga', 'niggas', 'nigger',
  'pussy', 'pussies', 'cunt', 'cunts', 'whore', 'whores', 'slut', 'sluts', 'asshole', 'assholes', 'dickhead',
  'blowjob', 'cocksucker', 'fag', 'faggot', 'hoes', 'tits',
  // espanhol
  'mierda', 'verga', 'vergazo', 'pendejo', 'pendeja', 'pendejos', 'chingar', 'chingada', 'chingado',
  'chingadera', 'chingon', 'cabron', 'cabrona', 'cabrones', 'culero', 'culera', 'joder', 'jodido', 'jodida',
  'follar', 'follando', 'hijo de puta', 'hijueputa', 'malparido', 'gonorrea', 'mamaguevo', 'maricon',
  'putita', 'perreo sucio',
];
// (as que aparecem em música sem ser explícita só de passagem: "gostosa", "bunda", "sexy" e "tesão" nem entram)
const LEVES = [
  'merda', 'cacete', 'bosta', 'cu',
  'damn', 'goddamn', 'ass', 'dick', 'hoe',
  'carajo', 'culo', 'perra', 'cono',
];

const tirarAcentos = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
// o texto como a lista: sem acento, minúsculo, só letras e números separados por um espaço
export const normalizarLetra = (s) => ` ${tirarAcentos(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `;

// os termos já no formato do texto normalizado ("foda-se" vira " foda se ")
const termos = [...FORTES.map((p) => [p, 1]), ...LEVES.map((p) => [p, 0.5])]
  .map(([p, peso]) => [normalizarLetra(p), peso])
  .filter(([p], i, l) => l.findIndex(([q]) => q === p) === i);

// O que tirar do texto antes da leitura: as diretivas e os comentários do ChordPro ({title: …}, # …), os acordes entre
// colchetes e as marcas de parte ("Refrão:", "[Chorus]")
function soALetra(texto) {
  return String(texto || '')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .split(/\r?\n/).filter((l) => !/^\s*#/.test(l)).join('\n');
}

// Lê a letra e diz se ela é explícita: { explicita, pontos, termos: [os achados, sem repetir] }. A letra explícita tem
// 1 ponto ou mais (um termo forte, ou dois leves). Um termo leve repetido no refrão conta cada vez.
export function analisarLetra(texto) {
  const t = normalizarLetra(soALetra(texto));
  let pontos = 0;
  const achados = [];
  if (t.trim().length < 2) return { explicita: false, pontos, termos: achados };
  for (const [p, peso] of termos) {
    let i = t.indexOf(p);
    if (i < 0) continue;
    achados.push(p.trim());
    while (i >= 0) { pontos += peso; i = t.indexOf(p, i + p.length - 1); }
  }
  return { explicita: pontos >= 1, pontos, termos: achados };
}

// O nome da faixa que já diz: "(Explicit)", "[Explícita]", "- Explicit Version". A versão limpa ("Clean", "Radio
// Edit", "Versão Limpa") diz que existe a explícita, mas ela mesma não é: fica de fora
export function tituloExplicito(titulo) {
  const t = normalizarLetra(titulo);
  if (/ (clean|limpa|radio edit|censurada|censored) /.test(t)) return false;
  return / (explicit|explicita|explicito|uncensored|sem censura|sin censura) /.test(t);
}

// O catálogo (Deezer e iTunes, já filtrados pelo mesmo título e artista): true se alguma das gravações da música é
// marcada como explícita (e não só a escolhida para a capa, que às vezes é a versão limpa ou a coletânea), false se o
// catálogo tem a música e nenhuma é, null se não tem. "outra" (karaokê, cover, tributo) não conta
export function catalogoExplicito(candidatas, problema = () => '') {
  const daMusica = (candidatas || []).filter((c) => c && (c.fonte === 'Deezer' || c.fonte === 'iTunes') && problema(c) !== 'outra');
  if (!daMusica.length) return null;
  return daMusica.some((c) => c.explicita);
}

// A decisão, como no mercado: o catálogo que diz "sim" vale; o que diz "não" pode estar errado (muitos lançamentos
// brasileiros chegam ao Deezer sem a marca), e então a letra precisa ser clara (2 pontos); sem catálogo, basta 1 ponto
// catalogo: true | false | null; letra: o resultado de analisarLetra (ou null, sem letra)
export function decidirExplicita({ catalogo = null, letra = null, titulo = '' } = {}) {
  if (catalogo === true || tituloExplicito(titulo)) return true;
  if (!letra) return false;
  return catalogo === false ? letra.pontos >= 2 : letra.explicita;
}
