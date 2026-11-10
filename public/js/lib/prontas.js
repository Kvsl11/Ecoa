// Partitura pronta: antes de gerar pelo áudio, o app procura um arquivo MIDI da música num acervo aberto da internet
// (BitMidi: busca e download sem conta, liberados para qualquer site). O MIDI já tem as notas exatas, então a
// partitura sai em segundos (lib/midi.js). O acervo é enviado por usuários e cobre melhor o repertório internacional;
// os nomes dos arquivos nem sempre trazem o artista, então o app mostra os candidatos e a pessoa ouve antes de usar.

const BASE = 'https://bitmidi.com';

const semAcento = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
// palavras do nome, sem o que vem entre parênteses (ao vivo, versão…), sem a extensão e sem as palavras vazias
const VAZIAS = new Set(['a', 'o', 'as', 'os', 'de', 'da', 'do', 'das', 'dos', 'e', 'em', 'the', 'of', 'and', 'mid', 'midi', 'kar', 'feat', 'ft']);
export const palavras = (s) => semAcento(s).replace(/\.(mid|midi|kar)$/i, '').replace(/[([{].*?[)\]}]/g, ' ')
  .split(/[^a-z0-9]+/).filter((w) => w && !VAZIAS.has(w));

// o quanto o arquivo "nome" parece ser a música: 0 = não é (falta palavra do título); quanto maior, melhor
export function pontuar(nome, titulo, artista = '') {
  const doNome = palavras(nome);
  const doTitulo = palavras(titulo);
  if (!doTitulo.length || !doTitulo.every((w) => doNome.includes(w))) return 0;
  const doArtista = palavras(artista);
  const achouArtista = doArtista.length ? doArtista.filter((w) => doNome.includes(w)).length / doArtista.length : 0;
  // palavras do arquivo que não são do título nem do artista: outra música com o título dentro do nome
  const sobra = doNome.filter((w) => !doTitulo.includes(w) && !doArtista.includes(w) && !/^\d+$/.test(w)).length;
  return Math.max(0.05, 1 + achouArtista * 2 - sobra * 0.35);
}

// os candidatos da busca, do mais parecido para o menos: [{ nome, url, pontos, certo (título e artista no nome) }]
export function escolherProntas(resultados, titulo, artista = '', maximo = 5) {
  return (resultados || [])
    .map((r) => ({ nome: String(r.name || '').replace(/\.(mid|midi|kar)$/i, ''), url: r.downloadUrl ? BASE + r.downloadUrl : '', pontos: pontuar(r.name, titulo, artista), tocadas: Number(r.plays) || 0 }))
    .filter((r) => r.url && r.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos || b.tocadas - a.tocadas)
    .slice(0, maximo)
    .map(({ tocadas, ...r }) => ({ ...r, certo: r.pontos >= 2.5 }));
}

// procura a música no acervo; [] se não achou, sem internet ou se o acervo não respondeu a tempo
export async function procurarProntas(titulo, artista = '', { buscar = fetch, espera = 7000 } = {}) {
  const q = palavras(titulo).join(' ');
  if (q.length < 3) return [];
  const ctrl = new AbortController();
  const relogio = setTimeout(() => ctrl.abort(), espera);
  try {
    const r = await buscar(`${BASE}/api/midi/search?q=${encodeURIComponent(q)}&pageSize=30`, { signal: ctrl.signal });
    if (!r.ok) return [];
    const dados = await r.json();
    return escolherProntas(dados?.result?.results, titulo, artista);
  } catch { return []; } finally { clearTimeout(relogio); }
}

// baixa o arquivo MIDI de um candidato (os bytes)
export async function baixarPronta(url, { buscar = fetch, espera = 15000 } = {}) {
  const ctrl = new AbortController();
  const relogio = setTimeout(() => ctrl.abort(), espera);
  try {
    const r = await buscar(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error('o acervo não entregou o arquivo');
    return new Uint8Array(await r.arrayBuffer());
  } finally { clearTimeout(relogio); }
}
