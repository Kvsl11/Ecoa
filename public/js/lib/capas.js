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

// A mesma imagem em outro tamanho é a mesma capa: o Deezer e o iTunes trocam só o fim do endereço
// (".../1000x1000-000000-80-0-0.jpg", ".../1000x1000bb.jpg")
export const chaveDaImagem = (u) => String(u || '').replace(/^https?:\/\/[^/]+/, '').replace(/\/\d+x\d+[^/]*$/, '');

// O que a capa tem de errado para a música: 'coletanea' (o álbum que junta músicas de vários discos, quando não é o
// nome da música), 'outra' (karaokê, cover, tributo, versão infantil…) ou '' (é a da música)
export function problemaDaCapa(c, musica) {
  const { nivel } = avaliar(c, musica);
  if (nivel === 1) return 'outra';
  const album = norm(c?.album);
  const t = base(musica?.titulo) || norm(musica?.titulo);
  if (nivel && COLETANEA.test(album) && !` ${album} `.includes(` ${t} `)) return 'coletanea';
  return '';
}

// Entre as capas que abrem (na ordem da melhor para a pior, a de ordenarCapas), a escolhida é a primeira: a ordem diz
// qual é a da música. O tamanho só desempata a mesma capa (o mesmo álbum) vinda das duas fontes. Antes valia a maior e,
// entre as do mesmo tamanho, a mais ouvida, e a coletânea mais ouvida passava à frente do single ("Aba", do Kemuel)
// validas: [{ ...capa, i (a posição na ordem), largura, altura }]
export function escolherCapa(validas) {
  if (!validas?.length) return null;
  const ordem = [...validas].sort((a, b) => a.i - b.i);
  const melhor = ordem[0];
  const album = norm(melhor.album);
  const mesmas = album ? ordem.filter((c) => norm(c.album) === album) : [melhor];
  return mesmas.sort((a, b) => (b.largura * b.altura) - (a.largura * a.altura) || a.i - b.i)[0];
}

// ---- as capas de reserva: quando nem o Deezer nem o iTunes têm a música (o repertório católico e o independente
// faltam muito lá), a capa do álbum é procurada em outras bases abertas: o TheAudioDB, a MusicBrainz (com a imagem no
// Cover Art Archive) e a discografia do artista no Cifra Club. Passam pelo mesmo filtro de título e artista.
// O endereço da capa de reserva leva uma marca no fim (depois do "#", que não vai para o servidor da imagem): por ela o
// app sabe que foi ele quem pôs a capa, e não a pessoa, qualquer que seja o site da imagem
export const MARCA_RESERVA = '#capa-reserva';
export const ehCapaReserva = (u) => String(u || '').endsWith(MARCA_RESERVA);
const comMarca = (u) => (u && !ehCapaReserva(u) ? `${u}${MARCA_RESERVA}` : u || '');

// A busca de gravações da MusicBrainz (ws/2/recording?query=…&fmt=json) -> as capas dos lançamentos oficiais em que a
// gravação saiu, uma por grupo de lançamento (o álbum, com todas as edições dele): a imagem da frente no Cover Art
// Archive. O álbum de estúdio e o single antes do ao vivo e da coletânea
export function capasDaMusicBrainz(json, musica) {
  const TIPO = { album: 300, single: 250, ep: 200 };
  const itens = [];
  for (const g of json?.recordings || []) {
    const artista = g['artist-credit']?.[0]?.name || g['artist-credit']?.[0]?.artist?.name || '';
    for (const l of g.releases || []) {
      const grupo = l['release-group'];
      if (!grupo?.id || (l.status && l.status !== 'Official')) continue;
      const outros = (grupo['secondary-types'] || []).map((x) => String(x).toLowerCase());
      const rank = outros.includes('compilation') ? 50 : outros.length ? 150 : TIPO[String(grupo['primary-type'] || '').toLowerCase()] || 100;
      itens.push({
        url: comMarca(`https://coverartarchive.org/release-group/${grupo.id}/front-500`),
        album: grupo.title || l.title || '', titulo: g.title || '', artista, rank, fonte: 'MusicBrainz', reserva: true,
      });
    }
  }
  return ordenarCapas(itens, musica);
}

// A busca de faixas do TheAudioDB (searchtrack.php) -> as faixas que são a música, da melhor para a pior, com o número
// do álbum de cada uma (a capa do álbum vem em outro pedido: album.php?m=idAlbum) e a imagem da própria faixa, se houver
export function faixasDaAudioDb(json, musica) {
  const itens = (json?.track || []).map((x) => ({
    url: `audiodb:${x.idTrack || ''}`, idAlbum: x.idAlbum || '', imagem: x.strTrackThumb || '',
    album: x.strAlbum || '', titulo: x.strTrack || '', artista: x.strArtist || '', rank: Number(x.intTotalListeners) || 1,
  }));
  return ordenarCapas(itens, musica);
}
// a capa de uma faixa do TheAudioDB: a do álbum (a resposta de album.php), ou a imagem da faixa; null sem nenhuma
export function capaDaAudioDb(faixa, albumJson) {
  const a = (albumJson?.album || [])[0];
  const url = a?.strAlbumThumbHQ || a?.strAlbumThumb || faixa?.imagem || '';
  if (!url) return null;
  return { url: comMarca(url), album: a?.strAlbum || faixa.album, titulo: faixa.titulo, artista: faixa.artista, rank: faixa.rank, fonte: 'TheAudioDB', reserva: true };
}

// A discografia do artista no Cifra Club (lib/web.js, parseDiscografiaCifraClub) -> as capas dos álbuns que têm a
// música entre as faixas. O artista já foi conferido pelo nome ao achar a página dele; por isso vale o da música
export function capasDaDiscografia(albuns, musica) {
  const t = norm(musica?.titulo);
  const tb = base(musica?.titulo) || t;
  const TIPO = { album: 3, single: 2, ep: 2 };
  const itens = [];
  for (const a of albuns || []) {
    const imagem = a?.capaGrande || a?.capa || '';
    if (!imagem || /\.svg(\?|#|$)|thumb-art|\/img\//i.test(imagem)) continue;
    const faixa = (a.faixas || []).find((f) => [f.titulo, f.nome].some((n) => n && (norm(n) === t || base(n) === tb)));
    if (!faixa) continue;
    itens.push({
      url: comMarca(imagem), album: a.titulo || '', titulo: faixa.nome || faixa.titulo, artista: musica.artista,
      rank: (TIPO[String(a.tipo || '').toLowerCase()] || 1) * 1000 + (Number(faixa.popularidade) > 0 ? 1 : 0), fonte: 'Cifra Club', reserva: true,
    });
  }
  return ordenarCapas(itens, musica);
}
