// O convite de quem abre o link de uma música compartilhada (#/ouvir/<nome>/<artista>) sem ter entrado no Ecoa: em vez
// da música inteira, uma prévia — a capa, o nome, o artista e o trecho de 30 s do Deezer — e o cartão para entrar com a
// conta Google. Entrando, a música abre inteira (app.js, viewOuvir).

// o texto comparável: sem acentos, sem maiúsculas, sem o que vem entre parênteses ou colchetes ("(Remastered)",
// "[Ao vivo]") e sem "feat."
export function comparavel(texto) {
  return String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[([][^)\]]*[)\]]/g, ' ').replace(/\b(feat|ft)\.?\s.*$/, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
}
const parecido = (a, b) => { const x = comparavel(a); const y = comparavel(b); return Boolean(x && y) && (x === y || x.includes(y) || y.includes(x)); };

// A faixa da prévia na resposta da busca do Deezer ({ data: [{ title, preview, artist: { name }, album: { cover_xl } }] }):
// a primeira com o trecho de 30 s cujo nome bate com o pedido e, havendo o artista, cujo artista também bate. Devolve
// { titulo, artista, capa, previa, duracao } ou null (sem uma faixa certa, nada de tocar outra música)
export function faixaDaPrevia(resposta, titulo, artista = '') {
  const faixas = Array.isArray(resposta?.data) ? resposta.data : [];
  const certa = faixas.find((f) => f?.preview && parecido(f.title_short || f.title, titulo) && (!artista || parecido(f.artist?.name, artista)));
  if (!certa) return null;
  return {
    titulo: certa.title_short || certa.title || titulo,
    artista: certa.artist?.name || artista,
    // (algumas faixas vêm sem o endereço da capa, só com o código da imagem: o endereço é montado com ele, em 1000 px)
    capa: certa.album?.cover_xl || certa.album?.cover_big || certa.album?.cover_medium
      || (/^[0-9a-f]{32}$/.test(certa.album?.md5_image || certa.md5_image || '') ? `https://cdn-images.dzcdn.net/images/cover/${certa.album?.md5_image || certa.md5_image}/1000x1000-000000-80-0-0.jpg` : ''),
    previa: certa.preview,
    duracao: Number(certa.duration) || 0, // (a da faixa inteira, em segundos)
  };
}

// O mesmo na resposta da busca do iTunes ({ results: [{ trackName, artistName, previewUrl, artworkUrl100,
// trackTimeMillis }] }), a reserva quando o Deezer não tem a música com o trecho: a capa vem em 1000 px
export function faixaDoItunes(resposta, titulo, artista = '') {
  const faixas = Array.isArray(resposta?.results) ? resposta.results : [];
  const certa = faixas.find((f) => f?.previewUrl && parecido(f.trackName, titulo) && (!artista || parecido(f.artistName, artista)));
  if (!certa) return null;
  return {
    titulo: certa.trackName || titulo,
    artista: certa.artistName || artista,
    capa: String(certa.artworkUrl100 || '').replace(/\/\d+x\d+(bb)?\.(jpg|png)$/, '/1000x1000bb.jpg'),
    previa: certa.previewUrl,
    duracao: Math.round((Number(certa.trackTimeMillis) || 0) / 1000),
  };
}

// "0:12" a partir dos segundos
export const tempoDaPrevia = (s) => { const n = Math.max(0, Math.floor(Number(s) || 0)); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`; };

// O fundo em movimento da prévia, desenhado num canvas pequeno (uns 64 px de largura) que o CSS estica na tela toda — a
// ampliação já deixa a imagem desfocada. Antes eram camadas da capa do tamanho de 1,5 tela, desfocadas pelo CSS, com
// luzes também desfocadas e misturadas: no celular, isso passava da memória de vídeo, e a tela piscava (o nome, a barra
// e o botão sumiam e voltavam) e o fundo ficava sem a capa. Aqui: três camadas da capa girando devagar, cada uma num
// sentido e numa velocidade (uma volta a cada 26, 19 e 15 s), e três luzes nas cores da capa passeando (vão e voltam
// em 18, 22 e 26 s), maiores e mais fortes com a batida (nivel, de 0 a 1). t: os segundos desde o começo
const VOLTA = Math.PI * 2;
const CAMADAS = [
  { tam: 1.5, voltas: 1 / 26, alfa: 0.75, dx: 0, dy: 0, modo: 'source-over' },
  { tam: 1.1, voltas: -1 / 19, alfa: 0.5, dx: -0.18, dy: -0.14, modo: 'screen' },
  { tam: 0.95, voltas: 1 / 15, alfa: 0.45, dx: 0.2, dy: 0.18, modo: 'overlay' },
];
const LUZES = [
  { x: -0.1, y: 0.05, mx: 0.75, my: 0.45, periodo: 18 },
  { x: 1.1, y: 0.45, mx: -0.8, my: -0.35, periodo: 22 },
  { x: 0.25, y: 1.1, mx: 0.45, my: -0.55, periodo: 26 },
];
export function desenharFundoDaPrevia(ctx, L, A, { img = null, cores = [], nivel = 0, t = 0 } = {}) {
  const lado = Math.max(L, A);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  if ('filter' in ctx) ctx.filter = 'none';
  ctx.fillStyle = '#07090b';
  ctx.fillRect(0, 0, L, A);
  // (um desfoque pequeno no canvas pequeno: barato, e na tela vira um desfoque largo)
  if ('filter' in ctx) ctx.filter = `blur(${Math.max(2, Math.round(L / 14))}px) saturate(1.5)`;
  if (img) {
    for (const c of CAMADAS) {
      const tam = lado * c.tam * (1 + 0.08 * Math.sin(t * VOLTA * Math.abs(c.voltas) * 2));
      ctx.save();
      ctx.globalCompositeOperation = c.modo;
      ctx.globalAlpha = c.alfa;
      ctx.translate(L / 2 + c.dx * lado, A / 2 + c.dy * lado);
      ctx.rotate(t * VOLTA * c.voltas);
      ctx.drawImage(img, -tam / 2, -tam / 2, tam, tam);
      ctx.restore();
    }
  }
  ctx.globalCompositeOperation = 'screen';
  LUZES.forEach((luz, k) => {
    const cor = cores[k % (cores.length || 1)];
    if (!cor) return;
    const ida = 0.5 - 0.5 * Math.cos((t / luz.periodo) * Math.PI); // (de 0 a 1 e de volta, devagar)
    const x = (luz.x + luz.mx * ida) * L; const y = (luz.y + luz.my * ida) * A;
    const r = lado * 0.42 * (0.95 + nivel * 0.4);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, cor); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = Math.min(1, 0.45 + nivel * 0.5);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, L, A);
  });
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  if ('filter' in ctx) ctx.filter = 'none';
}
