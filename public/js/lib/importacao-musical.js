// Processamento de uma música importada no APK, sem servidor próprio.
// O áudio é decodificado no aparelho; a transcrição é enviada ao Gemini em blocos curtos
// pela ponte nativa já existente; tom, BPM e acordes são calculados localmente.
import {
  TAXA, corpoDaTranscricao, lerTranscricao, analisar, montarCifra,
} from './analise-musical.js';

const TAXA_TRANSCRICAO = 16000;
const DURACAO_BLOCO = 88;
const SOBREPOSICAO = 3;

function pluginEcoa() {
  const p = globalThis.Capacitor?.Plugins?.Ecoa;
  if (!p?.gemini) throw new Error('Este recurso precisa do APK Android atualizado com a integração Gemini.');
  return p;
}

function bytesParaBase64(bytes) {
  let bin = '';
  const passo = 0x8000;
  for (let i = 0; i < bytes.length; i += passo) {
    bin += String.fromCharCode(...bytes.subarray(i, Math.min(bytes.length, i + passo)));
  }
  return btoa(bin);
}

function base64ParaBytes(texto) {
  const bin = atob(texto);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function arquivoBase64(arquivo) {
  return bytesParaBase64(new Uint8Array(await arquivo.arrayBuffer()));
}

async function abrirAudio(arquivo, plugin) {
  const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AudioCtx) throw new Error('Este aparelho não disponibilizou o decodificador de áudio.');
  const ctx = new AudioCtx();
  try {
    let buffer;
    try {
      buffer = await ctx.decodeAudioData(await arquivo.arrayBuffer());
    } catch (original) {
      if (!plugin?.converterAudio) throw new Error('O Android não conseguiu abrir este formato de áudio.');
      const convertido = await plugin.converterAudio({ dados: await arquivoBase64(arquivo), nome: arquivo.name || 'audio' });
      if (!convertido?.dados) throw original;
      buffer = await ctx.decodeAudioData(base64ParaBytes(convertido.dados).buffer);
    }
    const canais = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i));
    const mono = new Float32Array(buffer.length);
    for (let i = 0; i < mono.length; i++) {
      let soma = 0;
      for (const canal of canais) soma += canal[i] || 0;
      mono[i] = soma / Math.max(1, canais.length);
    }
    return { mono, taxa: buffer.sampleRate, duracao: buffer.duration };
  } finally {
    await ctx.close().catch(() => {});
  }
}

function reamostrar(amostras, taxaOrigem, taxaDestino) {
  if (taxaOrigem === taxaDestino) return amostras;
  const tamanho = Math.max(1, Math.floor(amostras.length * taxaDestino / taxaOrigem));
  const saida = new Float32Array(tamanho);
  const escala = taxaOrigem / taxaDestino;
  for (let i = 0; i < tamanho; i++) {
    const x = i * escala;
    const a = Math.floor(x);
    const f = x - a;
    const v0 = amostras[a] || 0;
    const v1 = amostras[Math.min(a + 1, amostras.length - 1)] || 0;
    saida[i] = v0 + (v1 - v0) * f;
  }
  return saida;
}

function wavBase64(amostras) {
  const bytes = new ArrayBuffer(44 + amostras.length * 2);
  const view = new DataView(bytes);
  const texto = (p, s) => { for (let i = 0; i < s.length; i++) view.setUint8(p + i, s.charCodeAt(i)); };
  texto(0, 'RIFF'); view.setUint32(4, 36 + amostras.length * 2, true);
  texto(8, 'WAVE'); texto(12, 'fmt '); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, TAXA_TRANSCRICAO, true); view.setUint32(28, TAXA_TRANSCRICAO * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  texto(36, 'data'); view.setUint32(40, amostras.length * 2, true);
  for (let i = 0; i < amostras.length; i++) {
    const x = Math.max(-1, Math.min(1, amostras[i]));
    view.setInt16(44 + i * 2, x < 0 ? x * 32768 : x * 32767, true);
  }
  return bytesParaBase64(new Uint8Array(bytes));
}

function normalizarModelo(texto) {
  const limpo = String(texto || '').trim().replace(/^\u0060\u0060\u0060(?:json)?\s*|\s*\u0060\u0060\u0060$/g, '');
  try { return JSON.parse(limpo); } catch {
    const inicio = limpo.indexOf('{');
    const fim = limpo.lastIndexOf('}');
    if (inicio >= 0 && fim > inicio) return JSON.parse(limpo.slice(inicio, fim + 1));
    throw new Error('O Gemini devolveu uma transcrição num formato que não consegui interpretar.');
  }
}

async function modelosDisponiveis(plugin) {
  try {
    const r = await plugin.gemini({ caminho: 'models?pageSize=1000', tempo: 30000 });
    if (r.status === 200) return (JSON.parse(r.texto).models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map((m) => String(m.name || '').replace(/^models\//, ''))
      .filter((n) => n.startsWith('gemini') && /flash/i.test(n) && !/live|tts|embedding|image|robotics|computer|gemma/i.test(n));
  } catch { /* usa a lista de reserva */ }
  return [];
}

async function transcreverBloco(plugin, modelos, amostras, inicio, duracao) {
  const dados = wavBase64(amostras);
  const corpo = corpoDaTranscricao({ tipo: 'audio/wav', dados });
  corpo.contents[0].parts[1].text +=
    '\nEste é um trecho da gravação original. O trecho começa em ' + inicio.toFixed(2) +
    ' segundos e dura ' + duracao.toFixed(2) + ' segundos. Marque os tempos relativos ao COMEÇO DESTE TRECHO.';
  const tentativas = [...new Set([...modelos, 'gemini-3.6-flash', 'gemini-flash-latest'])];
  let ultimo = '';
  for (const modelo of tentativas) {
    const r = await plugin.gemini({
      caminho: 'models/' + modelo + ':generateContent',
      corpo: JSON.stringify(corpo),
      tempo: 240000,
    });
    if (r.status === 200) {
      const dadosResposta = JSON.parse(r.texto);
      const partes = dadosResposta?.candidates?.[0]?.content?.parts || [];
      const texto = partes.map((p) => p.text || '').join('');
      if (!texto) throw new Error('O Gemini não retornou a letra deste trecho.');
      return normalizarModelo(texto);
    }
    ultimo = 'Gemini (' + r.status + '): ' + String(r.texto || '').slice(0, 220);
    if (![400, 404, 429, 500, 503].includes(r.status)) break;
  }
  throw new Error(ultimo || 'Não encontrei um modelo Gemini disponível para transcrever o áudio.');
}

export function juntarLinhas(partes, duracao) {
  const todas = partes.flat().sort((a, b) => a.inicio - b.inicio);
  const saida = [];
  const chave = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  for (const linha of todas) {
    if (linha.inicio < 0 || linha.inicio >= duracao || !linha.texto) continue;
    const k = chave(linha.texto);
    const repetida = saida.some((x) => chave(x.texto) === k && Math.abs(x.inicio - linha.inicio) <= 1.2);
    if (!repetida) saida.push(linha);
  }
  return saida.map((l, i) => ({
    ...l,
    fim: Math.min(duracao, Math.max(l.inicio + 0.3, Math.min(l.fim || l.inicio + 6, saida[i + 1]?.inicio ?? duracao))),
  }));
}

function workerAnalise(amostras) {
  return new Promise((resolve, reject) => {
    let worker;
    try { worker = new Worker(new URL('./analise-musical-worker.js', import.meta.url), { type: 'module' }); }
    catch (e) { reject(new Error('Não consegui iniciar a análise musical local: ' + e.message)); return; }
    const limite = setTimeout(() => { worker.terminate(); reject(new Error('A análise musical demorou demais. Tente um trecho menor.')); }, 180000);
    worker.onmessage = (e) => {
      clearTimeout(limite); worker.terminate();
      if (e.data?.ok) resolve(e.data.r);
      else reject(new Error(e.data?.erro || 'Falha ao analisar os acordes.'));
    };
    worker.onerror = (e) => { clearTimeout(limite); worker.terminate(); reject(new Error(e.message || 'Falha no processamento local do áudio.')); };
    worker.postMessage({ amostras }, [amostras.buffer]);
  });
}

export function gerarLrc(linhas) {
  return linhas.map((l) => {
    const t = Math.max(0, l.inicio);
    const mm = String(Math.floor(t / 60)).padStart(2, '0');
    const ss = (t % 60).toFixed(2).padStart(5, '0');
    return '[' + mm + ':' + ss + '] ' + l.texto;
  }).join('\n') + (linhas.length ? '\n' : '');
}

export async function processarMusicaImportada(arquivo, {
  titulo = '', artista = '', aoProgresso = () => {},
} = {}) {
  if (!arquivo || !arquivo.size) throw new Error('Escolha um arquivo de áudio.');
  const plugin = pluginEcoa();
  const disponibilidade = await plugin.geminiDisponivel?.();
  if (disponibilidade && !disponibilidade.tem) throw new Error('Este APK não foi montado com a chave do Gemini.');
  aoProgresso('Abrindo o áudio no aparelho…');
  const audio = await abrirAudio(arquivo, plugin);
  if (!(audio.duracao > 0)) throw new Error('Não consegui identificar a duração desta música.');
  const paraAnalise = reamostrar(audio.mono, audio.taxa, TAXA);
  const paraVoz = reamostrar(audio.mono, audio.taxa, TAXA_TRANSCRICAO);
  const modelos = await modelosDisponiveis(plugin);
  aoProgresso('Analisando tom, andamento e acordes no próprio celular…');
  const analisePromise = workerAnalise(paraAnalise);
  const blocos = [];
  const passo = Math.max(1, Math.floor(DURACAO_BLOCO * TAXA_TRANSCRICAO));
  const sobre = Math.floor(SOBREPOSICAO * TAXA_TRANSCRICAO);
  const total = Math.max(1, Math.ceil(Math.max(0, paraVoz.length - sobre) / Math.max(1, passo - sobre)));
  for (let i = 0, inicio = 0; inicio < paraVoz.length; i++, inicio += passo - sobre) {
    const fim = Math.min(paraVoz.length, inicio + passo);
    const trecho = paraVoz.slice(inicio, fim);
    const offset = inicio / TAXA_TRANSCRICAO;
    aoProgresso('Transcrevendo a letra: trecho ' + (i + 1) + ' de ' + total + '…');
    const resposta = await transcreverBloco(plugin, modelos, trecho, offset, trecho.length / TAXA_TRANSCRICAO);
    const linhas = lerTranscricao(resposta, trecho.length / TAXA_TRANSCRICAO)
      .map((l) => ({ ...l, inicio: l.inicio + offset, fim: l.fim + offset }));
    blocos.push(linhas);
    if (fim >= paraVoz.length) break;
  }
  aoProgresso('Finalizando a sincronização e a cifra…');
  const [analise] = await Promise.all([analisePromise]);
  const linhas = juntarLinhas(blocos, audio.duracao);
  const nomes = {
    titulo: titulo.trim() || arquivo.name?.replace(/\.[^.]+$/, '') || 'Música importada',
    artista: artista.trim(),
  };
  const cifra = montarCifra({
    ...nomes, linhas, acordes: analise.acordes, tom: analise.tom, bpm: analise.bpm, duracao: audio.duracao,
  });
  return {
    ...nomes,
    duracao: audio.duracao,
    linhas,
    lrc: gerarLrc(linhas),
    cifra,
    bpm: analise.bpm,
    tom: analise.tom,
    acordes: analise.acordes,
    idioma: '',
  };
}
