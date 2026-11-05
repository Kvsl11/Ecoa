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
// o estilo (o gênero do artista ou da música) -> as hashtags que costumam combinar com ele
const POR_ESTILO = [
  [/k-?pop/, ['kpop', 'catchy', 'dance', 'energetic'], ['kpop', 'chiclete', 'dançante', 'energia']],
  [/gospel|worship|christian|cristã|católic|louvor|religio|liturg/, ['worship', 'faith', 'peace', 'hope'], ['louvor', 'fé', 'paz', 'esperança']],
  [/sertanejo|country/, ['country', 'sing along', 'heartbreak'], ['sertanejo', 'modão', 'sofrência', 'pra cantar junto']],
  [/samba|pagode|forr[oó]|ax[eé]|mpb|bossa|brazil/, ['brazilian', 'groove', 'joy'], ['brasilidade', 'gingado', 'alegria', 'roda de amigos']],
  [/dance|disco|edm|electr|house|techno/, ['dance', 'energetic', 'party', 'groove'], ['dançante', 'energia', 'festa', 'groove']],
  [/funk|soul|r&b|rnb|rhythm/, ['smooth', 'groove', 'romantic', 'feel good'], ['suave', 'groove', 'romântica', 'astral']],
  [/hip.?hop|rap|trap/, ['hype', 'flow', 'bass'], ['flow', 'batida', 'grave']],
  [/metal|punk|grunge|hard rock/, ['energetic', 'loud', 'headbang'], ['energia', 'pesada', 'pra aumentar o som']],
  [/rock/, ['energetic', 'guitar', 'rock vibes'], ['energia', 'guitarra', 'rock']],
  [/indie|alternative|folk|acoustic/, ['chill', 'indie vibes', 'dreamy'], ['tranquila', 'indie', 'sonhadora']],
  [/jazz|blues/, ['smooth', 'late night', 'soulful'], ['suave', 'fim de noite', 'com alma']],
  [/ballad|balada/, ['romantic', 'emotional', 'slow'], ['romântica', 'emocionante', 'lenta']],
  [/pop/, ['happy pop', 'upbeat', 'good mood', 'sing along'], ['pop alegre', 'animada', 'bom humor', 'pra cantar junto']],
];
const PADRAO = [['good vibes', 'feel good'], ['bom humor', 'pra ouvir']];

// { mood, theme, style, genre } da música (TheAudioDB), genero do artista, ingles -> ['happy pop', 'upbeat', ...]
export function hashtagsDaMusica({ musica = {}, generoArtista = '', ingles = false, max = 8 } = {}) {
  const tags = [];
  const por = (t) => {
    const x = String(t || '').toLowerCase().replace(/[#_]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!x) return;
    const final = ingles ? x : PT[x];
    if (final && !tags.includes(final)) tags.push(final);
  };
  por(musica.mood);
  por(musica.theme);
  const estilo = [musica.style, musica.genre, generoArtista].filter(Boolean).join(' ').toLowerCase();
  // (sem repetir: com #happy, o #happy pop não entra)
  const repete = (t) => tags.some((x) => x === t || ` ${t} `.includes(` ${x} `));
  for (const [re, en, pt] of POR_ESTILO) if (re.test(estilo)) { (ingles ? en : pt).forEach((t) => { if (!repete(t)) tags.push(t); }); break; }
  if (tags.length < 3) (ingles ? PADRAO[0] : PADRAO[1]).forEach((t) => { if (!tags.includes(t)) tags.push(t); });
  return tags.slice(0, max);
}
