// Os downloads do YouTube no próprio celular, pelo APK (app-android/: o yt-dlp com o Python, o ffmpeg e o QuickJS
// empacotados no app, em Baixador.java), sem o Codespace e sem o servidor Python. No navegador o plugin não existe:
// baixadorDoAparelho() é null e o site continua como sempre.

// o plugin Ecoa do APK, se ele tiver o baixador (um APK antigo não tem)
export function baixadorDoAparelho(C = globalThis.window?.Capacitor) {
  if (!C?.isNativePlatform?.() || !C.Plugins?.Ecoa) return null;
  const metodos = (C.PluginHeaders || []).find((h) => h.name === 'Ecoa')?.methods || [];
  return metodos.some((m) => m.name === 'baixarLocal') ? C.Plugins.Ecoa : null;
}

// o erro que outra qualidade não resolve (o vídeo longo demais, o YouTube pedindo login, o link errado)
export const erroSemVolta = (e) => e?.code === 'login' || /longo demais|login|inválido/i.test(String(e?.message || ''));

// Baixa o áudio (ou o clipe) no celular: o vídeo tenta na qualidade escolhida e depois nas de baixo (abaixo[q]), como
// pelo servidor. aoProgresso(0…1) a cada 1%; aoRecomecar() quando uma tentativa nova começa do zero; sinal: a pausa
// (cancela no celular na hora). Devolve { caminho, tipo, tamanho, qualidade, altura, titulo, duracao }
export async function baixarNoAparelho(nativo, yt, video, q, { abaixo = {}, aoProgresso = () => {}, aoRecomecar = () => {}, sinal, agora = Date.now } = {}) {
  if (!nativo) throw new Error('o celular não tem o baixador');
  const qualidades = video ? [q, ...(abaixo[q] || [])] : [q, q];
  let erro;
  for (let t = 0; t < qualidades.length; t++) {
    if (sinal?.aborted) throw new Error('Cancelado');
    if (t) aoRecomecar();
    const processo = `${yt}-${video ? 'v' : 'a'}-${agora().toString(36)}-${t}`;
    const ouvinte = await nativo.addListener('baixando', (ev) => { if (ev?.processo === processo && typeof ev.pct === 'number') aoProgresso(ev.pct); });
    const pausar = () => { void Promise.resolve(nativo.cancelarLocal({ processo })).catch(() => {}); };
    sinal?.addEventListener('abort', pausar, { once: true });
    try {
      const r = await nativo.baixarLocal({ video: yt, comVideo: Boolean(video), qualidade: qualidades[t], processo });
      if (!r?.caminho) throw new Error('o celular não devolveu o arquivo');
      if (video && !String(r.tipo || '').startsWith('video/')) throw new Error('veio só o áudio, não o videoclipe');
      return r;
    } catch (e) {
      erro = e;
      if (sinal?.aborted) throw new Error('Cancelado');
      if (erroSemVolta(e)) break;
    } finally {
      sinal?.removeEventListener('abort', pausar);
      void Promise.resolve(ouvinte?.remove?.()).catch(() => {});
    }
  }
  throw erro || new Error('não consegui baixar no celular');
}

// o arquivo que o yt-dlp do APK deixou no celular, lido pelo site (sem passar pela internet), com o tipo certo
export async function lerBaixadoNoAparelho(r, { converter = (c) => globalThis.window.Capacitor.convertFileSrc(c), fetchImpl = fetch } = {}) {
  const resp = await fetchImpl(converter(r.caminho));
  if (!resp.ok) throw new Error('não consegui ler o arquivo baixado no celular');
  const b = await resp.blob();
  return r.tipo && b.type !== r.tipo ? new Blob([b], { type: r.tipo }) : b;
}
