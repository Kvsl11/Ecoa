// Operações puras da fila: os índices originais são preservados para manter partes e faixas repetidas.
export function embaralharIndices(indices, atual, random = Math.random) {
  const restantes = indices.filter((i) => i !== atual);
  for (let i = restantes.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [restantes[i], restantes[j]] = [restantes[j], restantes[i]];
  }
  return atual === undefined || atual === null ? restantes : [atual, ...restantes];
}

export function moverIndice(indices, origem, destino) {
  if (!Array.isArray(indices) || origem < 0 || destino < 0 || origem >= indices.length || destino >= indices.length || origem === destino) return [...indices];
  const copia = [...indices];
  const [item] = copia.splice(origem, 1);
  copia.splice(destino, 0, item);
  return copia;
}

// A ordem em que a lista aparece na tela (o "Ordenar por" da playlist e das Músicas curtidas): a fila do player
// começa nela. Antes a fila seguia sempre a ordem salva, e a lista ordenada por artista tocava em outra ordem.
const album = (x) => /\{\s*album\s*:\s*([^}]*)\}/i.exec(x?.content || '')?.[1].trim() || '';

// a playlist: os índices dos itens (os da ordem salva) na ordem da vista.
// itens: [{ songId, em }]; musica(id) devolve a música; ordem: 'personalizada' | 'titulo' | 'artista' | 'adicionadas'
export function ordemDaPlaylist(itens, musica, ordem) {
  const lista = itens.map((it, i) => ({ it, i, s: musica(it.songId) }));
  // (sem diferença entre maiúsculas e acentos: "Ana" e "ana" são o mesmo artista, juntas pelo título)
  const porTexto = (f) => (a, b) => (f(a) || '').localeCompare(f(b) || '', 'pt-BR', { sensitivity: 'base' });
  if (ordem === 'titulo') lista.sort(porTexto((x) => x.s?.title));
  if (ordem === 'artista') lista.sort((a, b) => porTexto((x) => x.s?.artist)(a, b) || porTexto((x) => x.s?.title)(a, b));
  if (ordem === 'adicionadas') lista.sort((a, b) => (b.it.em || 0) - (a.it.em || 0) || b.i - a.i);
  return lista.map((x) => x.i);
}

// as Músicas curtidas: as músicas (numa lista nova) na ordem da vista.
// ordem: 'recentes' | 'titulo' | 'artista' | 'album'
export function ordenarCurtidas(musicas, ordem) {
  const itens = [...musicas];
  const pt = (a, b) => (a || '').localeCompare(b || '', 'pt-BR', { sensitivity: 'base' });
  if (ordem === 'recentes') itens.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  if (ordem === 'titulo') itens.sort((a, b) => pt(a.title, b.title));
  if (ordem === 'artista') itens.sort((a, b) => pt(a.artist, b.artist) || pt(a.title, b.title));
  if (ordem === 'album') itens.sort((a, b) => Number(!album(a)) - Number(!album(b)) || pt(album(a), album(b)) || pt(a.title, b.title));
  return itens;
}
