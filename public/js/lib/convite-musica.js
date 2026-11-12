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

// "0:12" a partir dos segundos
export const tempoDaPrevia = (s) => { const n = Math.max(0, Math.floor(Number(s) || 0)); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`; };
