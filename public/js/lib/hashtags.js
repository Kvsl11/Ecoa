// A prévia da playlist (os "stories"): o número curto dos seguidores ("90,3M") e as hashtags da música, que dizem a
// sensação dela (#happy pop, #upbeat, #good mood). As hashtags ficam em inglês quando a música é cantada em inglês, e
// em português nas outras. Vêm do que a TheAudioDB sabe da música (o clima, o tema, o estilo) e, faltando, do estilo do
// artista.

// 90300000 -> "90,3M"; 850000 -> "850K"; 999 -> "999"
export function numeroCurto(n) {
  const v = Number(n) || 0;
  if (v < 1000) return String(Math.round(v));
  const [div, suf] = v >= 1e9 ? [1e9, 'B'] : v >= 1e6 ? [1e6, 'M'] : [1e3, 'K'];
  const x = v / div;
  const casas = x < 100 ? 1 : 0;
  return `${x.toFixed(casas).replace(/\.0$/, '').replace('.', ',')}${suf}`;
}

// as palavras mais comuns de cada língua (nas letras): a que aparecer mais diz a língua da música
const COMUNS = {
  en: 'the you i and to me my a it in is of your that on we love be all so do no oh baby yeah just like know when what can don\'t i\'m it\'s'.split(' '),
  pt: 'o a e de que eu é não um uma meu minha você do da em no na pra para te se me tu teu tua seu sua com por mais amor coração quando vou sou está'.split(' '),
  es: 'el la y de que yo es no un una mi tú te se me por con para más amor corazón cuando soy está como pero'.split(' '),
};
// o texto da letra (sem os acordes [C] nem as diretivas {title: ...} do ChordPro)
const soLetra = (texto) => String(texto || '').replace(/\{[^}]*\}/g, ' ').replace(/\[[^\]]*\]/g, ' ');
// 'en' | 'pt' | 'es' | '' (sem letra para saber)
export function idiomaDaLetra(texto) {
  const palavras = soLetra(texto).toLowerCase().match(/[a-zà-ÿ']+/g) || [];
  if (palavras.length < 12) return '';
  const conta = {};
  for (const [l, lista] of Object.entries(COMUNS)) {
    const set = new Set(lista);
    conta[l] = palavras.reduce((n, p) => n + (set.has(p) ? 1 : 0), 0);
  }
  const [melhor, n] = Object.entries(conta).sort((a, b) => b[1] - a[1])[0];
  return n >= 4 ? melhor : '';
}
const PAISES_EN = new Set(['US', 'GB', 'UK', 'CA', 'AU', 'IE', 'NZ', 'JM']);
// a música é cantada em inglês? Pela letra; sem letra, pelo país do artista e pelo título
export function emIngles({ letra = '', pais = '', titulo = '' } = {}) {
  const l = idiomaDaLetra(letra);
  if (l) return l === 'en';
  if (pais) return PAISES_EN.has(String(pais).toUpperCase());
  const t = idiomaDaLetra(`${titulo} `.repeat(12));
  return t === 'en';
}

// o clima e o tema da TheAudioDB (e os nossos) em português
const PT = {
  happy: 'alegre', sad: 'triste', energetic: 'energia', relaxed: 'relaxante', romantic: 'romântica', angry: 'intensa', sensual: 'sensual',
  dreamy: 'sonhadora', melancholy: 'melancólica', melancholic: 'melancólica', philosophical: 'reflexiva', reflective: 'reflexiva',
  uplifting: 'pra cima', sophisticated: 'sofisticada', rousing: 'empolgante', dark: 'sombria', fun: 'divertida', party: 'festa',
  'party time': 'festa', 'in love': 'apaixonada', heartbreak: 'coração partido', 'break up': 'coração partido', chill: 'tranquila',
  calm: 'calma', motivation: 'motivação', inspirational: 'inspiradora', nostalgic: 'nostálgica', confident: 'confiante',
  sexy: 'sensual', groovy: 'groove', upbeat: 'animada', 'good mood': 'bom humor', 'feel good': 'astral',
};
// o estilo (o gênero do artista ou da música) -> as hashtags que costumam combinar com ele. Cada estilo tem várias, e
// cada música sorteia as dela (sempre as mesmas para a mesma música): as do mesmo artista não saem todas iguais
const POR_ESTILO = [
  [/k-?pop/, ['kpop', 'catchy', 'dance', 'energetic', 'idol', 'bright', 'hype', 'colorful', 'addictive'],
    ['kpop', 'chiclete', 'dançante', 'energia', 'coreografia', 'colorida', 'viciante', 'animada']],
  [/gospel|worship|christian|cristã|católic|louvor|religio|liturg/, ['worship', 'faith', 'peace', 'hope', 'praise', 'grace', 'prayer', 'spiritual', 'blessed'],
    ['louvor', 'fé', 'paz', 'esperança', 'adoração', 'oração', 'graça', 'gratidão', 'espiritual', 'missa']],
  [/sertanejo|country/, ['country', 'sing along', 'heartbreak', 'road trip', 'acoustic', 'storytelling', 'small town'],
    ['sertanejo', 'modão', 'sofrência', 'pra cantar junto', 'viola', 'boteco', 'saudade', 'raiz']],
  [/samba|pagode|forr[oó]|ax[eé]|mpb|bossa|brazil/, ['brazilian', 'groove', 'joy', 'tropical', 'swing', 'sunny', 'carnival'],
    ['brasilidade', 'gingado', 'alegria', 'roda de amigos', 'tropical', 'batucada', 'sol', 'domingo']],
  [/dance|disco|edm|electr|house|techno/, ['dance', 'energetic', 'party', 'groove', 'club', 'dancefloor', 'night out', 'bass', 'euphoric'],
    ['dançante', 'energia', 'festa', 'groove', 'pista', 'balada', 'noite', 'grave', 'euforia']],
  [/funk|soul|r&b|rnb|rhythm|new jack/, ['smooth', 'groove', 'romantic', 'feel good', 'retro', 'soulful', 'silky', 'slow jam', 'vintage', 'sexy'],
    ['suave', 'groove', 'romântica', 'astral', 'retrô', 'com alma', 'sedutora', 'clássica', 'vintage', 'gostosa de ouvir']],
  [/hip.?hop|rap|trap/, ['hype', 'flow', 'bass', 'swagger', 'street', 'beats', 'confident', 'bars'],
    ['flow', 'batida', 'grave', 'atitude', 'rua', 'rima', 'confiante', 'pesada']],
  [/metal|punk|grunge|hard rock/, ['energetic', 'loud', 'headbang', 'raw', 'intense', 'rebel', 'heavy'],
    ['energia', 'pesada', 'pra aumentar o som', 'intensa', 'rebelde', 'guitarra', 'crua']],
  [/rock/, ['energetic', 'guitar', 'rock vibes', 'anthem', 'road trip', 'classic', 'loud', 'live'],
    ['energia', 'guitarra', 'rock', 'hino', 'estrada', 'clássica', 'pra aumentar o som', 'ao vivo']],
  [/indie|alternative|folk|acoustic/, ['chill', 'indie vibes', 'dreamy', 'mellow', 'cozy', 'lo-fi', 'soft', 'introspective'],
    ['tranquila', 'indie', 'sonhadora', 'suave', 'aconchego', 'leve', 'introspectiva', 'violão']],
  [/jazz|blues/, ['smooth', 'late night', 'soulful', 'classy', 'mellow', 'vintage', 'lounge'],
    ['suave', 'fim de noite', 'com alma', 'elegante', 'vintage', 'lounge', 'café']],
  [/ballad|balada/, ['romantic', 'emotional', 'slow', 'heartfelt', 'tender', 'tearjerker'],
    ['romântica', 'emocionante', 'lenta', 'do coração', 'delicada', 'de chorar']],
  [/pop/, ['happy pop', 'upbeat', 'good mood', 'sing along', 'catchy', 'feel good', 'radio hit', 'bright', 'summer vibes', 'fun'],
    ['pop alegre', 'animada', 'bom humor', 'pra cantar junto', 'chiclete', 'astral', 'hit', 'leve', 'verão', 'divertida']],
];
const PADRAO = [['good vibes', 'feel good', 'playlist', 'on repeat', 'mood', 'music lover', 'daily mix'],
  ['bom humor', 'pra ouvir', 'playlist', 'no repeat', 'astral', 'trilha do dia', 'pra relaxar']];
// os temas da letra (as palavras que aparecem nela): ao menos duas vezes
const DA_LETRA = [
  [/\b(love|lover|loving|kiss|kisses)\b/g, 'love song', /\b(amor|amar|amo|beijo|paix[aã]o|apaixonad[oa])\b/g, 'apaixonada'],
  [/\b(dance|dancing|dancefloor|move|moving)\b/g, 'dance', /\b(dan[cç]a|dan[cç]ar|dan[cç]ando|rebola)\b/g, 'dançante'],
  [/\b(party|club|drinks|celebrate)\b/g, 'party', /\b(festa|balada|brinde|comemorar)\b/g, 'festa'],
  [/\b(night|midnight|tonight|moon|stars)\b/g, 'late night', /\b(noite|madrugada|lua|estrelas)\b/g, 'noite'],
  [/\b(cry|crying|tears|broken|goodbye|lonely|alone)\b/g, 'heartbreak', /\b(chorar|choro|l[aá]grimas?|saudade|sozinh[oa]|adeus)\b/g, 'saudade'],
  [/\b(summer|sun|sunshine|beach|ocean)\b/g, 'summer vibes', /\b(ver[aã]o|sol|praia|mar)\b/g, 'verão'],
  [/\b(god|lord|jesus|pray|prayer|heaven|holy)\b/g, 'faith', /\b(deus|senhor|jesus|cristo|ora[cç][aã]o|c[eé]u|santo|aleluia)\b/g, 'fé'],
  [/\b(money|cash|rich|diamonds|gold)\b/g, 'money moves', /\b(dinheiro|grana|rico|ouro)\b/g, 'ostentação'],
  [/\b(friends?|together|family)\b/g, 'friendship', /\b(amig[oa]s?|juntos|fam[ií]lia)\b/g, 'amizade'],
  [/\b(fire|wild|crazy|loud)\b/g, 'wild', /\b(fogo|louc[oa]|intens[oa])\b/g, 'intensa'],
  [/\b(dream|dreams|dreaming|fly|flying)\b/g, 'dreamy', /\b(sonho|sonhar|voar)\b/g, 'sonhadora'],
  [/\b(home|road|drive|driving)\b/g, 'road trip', /\b(estrada|viagem|caminho)\b/g, 'estrada'],
];
// um número tirado do texto (sempre o mesmo para o mesmo texto)
const hash = (t) => { let h = 2166136261; for (const c of String(t)) h = Math.imul(h ^ c.codePointAt(0), 16777619); return h >>> 0; };
const sorteio = (lista, semente) => [...lista].sort((a, b) => hash(semente + a) - hash(semente + b));
// os gêneros de verdade (os da MusicBrainz, os mais votados primeiro) que viram hashtag como estão: #funk, #r&b, #soul
const GENEROS = /^(pop|rock|funk|soul|r&b|rnb|hip hop|rap|trap|jazz|blues|disco|house|edm|reggae|reggaeton|country|folk|indie|metal|punk|gospel|k-pop|kpop|samba|pagode|forró|forro|axé|mpb|bossa nova|sertanejo|new jack swing|synthpop|electropop|dance-pop|neo soul|latin|grunge|ska|lo-fi|bachata|salsa|dancehall|afrobeats|piseiro|arrocha|worship|christian|contemporary r&b|pop rock|soft rock|alternative rock|indie pop)$/;

// { mood, theme, style, genre } da música (TheAudioDB), os gêneros do artista (MusicBrainz e TheAudioDB), a letra, a
// semente (a música: para o sorteio), ingles -> de 6 a 10 hashtags, sem repetir: ['happy', 'funk', 'love song', ...]
export function hashtagsDaMusica({ musica = {}, generoArtista = '', generos = [], letra = '', semente = '', ingles = false, min = 6, max = 10 } = {}) {
  const tags = [];
  // (sem repetir: com #happy, o #happy pop não entra)
  const repete = (t) => tags.some((x) => x === t || ` ${t} `.includes(` ${x} `) || ` ${x} `.includes(` ${t} `));
  // (só entra o que tem ao menos uma letra: a TheAudioDB devolve "..." no clima ou no tema que não foi preenchido, e
  // isso virava a hashtag "#...")
  const pos = (t) => { if (t && /\p{L}/u.test(t) && !repete(t)) tags.push(t); };
  const por = (t) => {
    const x = String(t || '').toLowerCase().replace(/[#_]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (x) pos(ingles ? x : PT[x]);
  };
  por(musica.mood);
  por(musica.theme);
  // os temas da letra (os que mais aparecem, até 3)
  const texto = soLetra(letra).toLowerCase();
  DA_LETRA.map(([en, ten, pt, tpt]) => [(texto.match(ingles ? en : pt) || []).length, ingles ? ten : tpt]).filter(([n]) => n >= 2)
    .sort((a, b) => b[0] - a[0]).slice(0, 3).forEach(([, t]) => pos(t));
  // até 2 gêneros de verdade do artista
  const gens = [...generos, musica.genre, musica.style, generoArtista].flatMap((g) => String(g || '').toLowerCase().split(/\s*[/,]\s*/)).map((g) => g.trim()).filter(Boolean);
  gens.filter((g) => GENEROS.test(g)).slice(0, 2).forEach((g) => pos(g.replace(/^rnb$/, 'r&b').replace(/^kpop$/, 'k-pop')));
  // o estilo principal e o segundo: as hashtags deles, sorteadas para a música
  const achados = [];
  for (const g of [...gens, gens.join(' ')]) for (const e of POR_ESTILO) if (e[0].test(g) && !achados.includes(e)) achados.push(e);
  achados.slice(0, 2).forEach((e, n) => sorteio(ingles ? e[1] : e[2], semente).slice(0, n ? 2 : 4).forEach(pos));
  // ainda pouco: mais do estilo principal e, por fim, as de sempre
  for (const lista of [...achados.slice(0, 2).map((e) => (ingles ? e[1] : e[2])), PADRAO[ingles ? 0 : 1]]) {
    if (tags.length >= min) break;
    for (const t of sorteio(lista, semente)) { if (tags.length >= min) break; pos(t); }
  }
  return tags.slice(0, max);
}
