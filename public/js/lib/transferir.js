// Levar os downloads de um aparelho (ou do navegador) para outro (o app de Android) sem baixar de novo: um arquivo só,
// ".ecoa", com o que as músicas sabem dos downloads e os próprios arquivos (o áudio, o vídeo, o karaokê e os áudios da
// pessoa), um atrás do outro. O navegador e o app de Android guardam cada um no seu canto, que o outro não enxerga.
// Formato: "ECOA" · 4 bytes (o tamanho do cabeçalho, little-endian) · o cabeçalho em JSON · os arquivos, na ordem dele.
// O cabeçalho: { app: 'ecoa-downloads', versao: 1, em, musicas: [song], arquivos: [{ chave, tipo, tamanho }] }

const MAGICA = 'ECOA';

// arquivos: [{ chave, blob }] → um Blob só (os arquivos não são copiados para a memória: o Blob só aponta para eles)
export function montarPacote({ musicas = [], arquivos = [] } = {}) {
  const cabecalho = new TextEncoder().encode(JSON.stringify({
    app: 'ecoa-downloads', versao: 1, em: Date.now(), musicas,
    arquivos: arquivos.map(({ chave, blob }) => ({ chave, tipo: blob.type || '', tamanho: blob.size })),
  }));
  const tam = new Uint8Array(4);
  new DataView(tam.buffer).setUint32(0, cabecalho.length, true);
  return new Blob([MAGICA, tam, cabecalho, ...arquivos.map((a) => a.blob)], { type: 'application/octet-stream' });
}

// o arquivo escolhido → { musicas, arquivos: [{ chave, blob }] } (cada arquivo é um pedaço do escolhido, sem copiar)
export async function lerPacote(arquivo) {
  const inicio = new Uint8Array(await arquivo.slice(0, 8).arrayBuffer());
  if (inicio.length < 8 || new TextDecoder().decode(inicio.slice(0, 4)) !== MAGICA) throw new Error('Este arquivo não é um pacote de downloads do Ecoa.');
  const tam = new DataView(inicio.buffer).getUint32(4, true);
  let cab;
  try { cab = JSON.parse(new TextDecoder().decode(await arquivo.slice(8, 8 + tam).arrayBuffer())); } catch { cab = null; }
  if (cab?.app !== 'ecoa-downloads' || !Array.isArray(cab.arquivos)) throw new Error('O pacote de downloads está estragado.');
  let pos = 8 + tam;
  const arquivos = [];
  for (const { chave, tipo, tamanho } of cab.arquivos) {
    if (pos + tamanho > arquivo.size) throw new Error('O pacote de downloads veio pela metade (o arquivo foi cortado).');
    arquivos.push({ chave, blob: arquivo.slice(pos, pos + tamanho, tipo || '') });
    pos += tamanho;
  }
  return { musicas: Array.isArray(cab.musicas) ? cab.musicas : [], arquivos };
}

// junta, na música que já está aqui, o que ela sabe dos downloads que vieram (sem perder os que ela já tinha)
export function juntarDownloads(aqui, veio) {
  const patch = {};
  if (veio.baixado?.arquivos) {
    const arquivos = { ...(veio.baixado.arquivos || {}), ...(aqui.baixado?.arquivos || {}) };
    patch.baixado = { ...(veio.baixado || {}), ...(aqui.baixado || {}), arquivos, tamanho: Object.values(arquivos).reduce((t, x) => t + (x?.tamanho || 0), 0) };
  }
  if (veio.karaoke) patch.karaoke = { ...veio.karaoke, ...(aqui.karaoke || {}) };
  if (veio.audioProprio && !aqui.audioProprio) patch.audioProprio = veio.audioProprio;
  return patch;
}
