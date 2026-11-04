// Qual capa é a da música (a do álbum ou do single, como no Spotify), entre as que o Deezer e o iTunes devolvem na
// busca pelo título e pelo artista. Antes valia a primeira com o título exato e um artista de nome só parecido, e
// vinham capas de outras gravações: "Here Comes The Sun" dos Beatles saía com a capa de "The Beatles Complete On
// Ukulele" (as dos Beatles têm "(Remastered 2009)" no título, e a do ukulele tinha o título igual), e "Aba" do Kemuel
// com a de uma coletânea, e não a do single que todo mundo conhece.
// Agora: o artista com o nome igual (o parecido só quando não há o igual); o mesmo título, com ou sem o que vem entre
// parênteses; e, entre essas, a mais ouvida (o "rank" do Deezer), com um pouco de vantagem para o título exato e bem
// menos para as gravações que não são a da música (karaokê, cover, tributo, versão infantil, instrumental).

export const norm = (x) => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const compacto = (x) => norm(x).replace(/ /g, '');
// o título sem o que vem entre parênteses ou colchetes, nem depois de " - " (o "(Remastered 2009)", o "- Ao Vivo")
const base = (x) => norm(String(x || '').replace(/\s*[([][^)\]]*[)\]]/g, ' ').replace(/\s+[-–—]\s+.*$/, ''));
const resto = (x) => norm(String(x || '').match(/[([][^)\]]*[)\]]|\s[-–—]\s.*$/g)?.join(' ') || '');
const convidados = (x) => [...String(x || '').matchAll(/[([](?:feat|ft|with|part|com)\b\.?([^)\]]*)[)\]]/gi)].map((m) => norm(m[1])).join(' ');

// não é a gravação da música
const OUTRA = /\b(karaoke|instrumental|playback|backing|cover|covers|tribute|tributo|homenagem|made famous|originally performed|in the style|ukulele|lullaby|ninar|para criancas|for kids|kids|bebe|baby|8 bit|music box|piano version|string quartet|orchestra|orquestra)\b/;
// outra gravação do mesmo artista: vale, mas a de estúdio tem preferência quando é tão ouvida quanto
const REMIX = /\b(remix|rmx|mix|edit|sped up|slowed|reverb|demo|take \d+)\b/;
const VIVO = /\b(ao vivo|live|acustico|acoustic|session|sessions|unplugged|versao)\b/;
// o álbum que junta músicas de vários discos (as "Mais Tocadas", os "Hits"): a capa não é a da música
const COLETANEA = /\b(mais tocadas|melhores|hits|greatest|best of|the best|essential|essentials|coletanea|colecao|collection|top \d+|sucessos|louvores|playlist|now that s|internacional)\b/;
// a mesma gravação, só com outro nome
const MESMA = /\b(remaster|remastered|remasterizad[ao]|mono|stereo|single|album version|original|feat|ft|part|with|com)\b/;

const semFeat = (x) => norm(String(x || '').replace(/\s*[([](?:feat|ft|with|part|com)\b[^)\]]*[)\]]/gi, ' '));

// Como a capa se encaixa na música: { nivel (3: o artista com o nome igual; 2: um artista de nome só parecido; 1: uma
// gravação que não é a da música — karaokê, cover…; 0: não é a música), nota (a mais ouvida, com a vantagem do título
// exato) }. titulo: o da música, já sem os acréscimos do site ("Ao Vivo", "Cifra"…); artista: o principal
function avaliar(c, { titulo, artista }) {
  const t = norm(titulo);
  const a = norm(artista);
  const nada = { nivel: 0, nota: 0 };
  if (!t || !a || !c?.url) return nada;
  const tc = norm(c.titulo);
  const mesmoTitulo = tc === t || base(c.titulo) === t || semFeat(c.titulo) === t || (base(titulo) && base(c.titulo) === base(titulo));
  if (!mesmoTitulo) return nada;
  const ac = norm(c.artista);
  const igual = ac === a || (compacto(a).length >= 4 && compacto(c.artista) === compacto(a)) || ` ${convidados(c.titulo)} `.includes(` ${a} `) || Boolean(c.comoConvidado);
  const parecido = !igual && Boolean(ac) && (` ${ac} `.includes(` ${a} `) || ` ${a} `.includes(` ${ac} `));
  if (!igual && !parecido) return nada;
  const extra = tc === t || semFeat(c.titulo) === t ? '' : resto(c.titulo);
  const rank = Math.max(1, Number(c.rank) || 1);
  if (OUTRA.test(extra) || OUTRA.test(norm(c.album)) || (parecido && OUTRA.test(ac))) return { nivel: 1, nota: rank };
  let fator = !extra ? 1.3 : REMIX.test(extra) ? 0.5 : VIVO.test(extra) ? 0.85 : MESMA.test(extra) ? 1 : 0.7;
  // (a coletânea só é a capa quando não há outra: o nome da música no álbum é o single dela)
  const album = norm(c.album);
  if (COLETANEA.test(album) && !` ${album} `.includes(` ${base(titulo) || t} `)) fator *= 0.2;
  return { nivel: igual ? 3 : 2, nota: rank * fator };
}

// O quanto a capa é a da música (para comparar; 0: não é)
export function notaDaCapa(c, musica) {
  const { nivel, nota } = avaliar(c, musica);
  return nivel ? nivel * 1e12 + nota : 0;
}

// As capas da música, da melhor para a pior, sem repetir a mesma imagem. Só as do melhor nível que houver: com o
// artista de nome igual, as de nome parecido saem; e as gravações que não são a da música só ficam se não houver outra
export function ordenarCapas(itens, musica) {
  const notas = (itens || []).map((c, i) => ({ c, i, ...avaliar(c, musica) })).filter((x) => x.nivel > 0);
  const melhor = Math.max(0, ...notas.map((x) => x.nivel));
  const vistas = new Set();
  return notas
    .filter((x) => x.nivel === melhor)
    .sort((x, y) => y.nota - x.nota || x.i - y.i)
    .map((x) => x.c)
    .filter((c) => !vistas.has(c.url) && vistas.add(c.url));
}
