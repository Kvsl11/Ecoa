// O cartão de compartilhar em vídeo (o fundo animado, o trecho do clipe, o áudio do trecho da letra): o canvas é
// redesenhado a cada quadro e gravado pelo navegador, com ou sem o som de um arquivo de mídia do aparelho.

// Um <video> ou <audio> do aparelho (url de um arquivo baixado) parado no instante `inicio`, pronto para tocar. null se
// não abre em 8 s
export function prepararTrecho(url, tag, inicio) {
  return new Promise((ok) => {
    const el = document.createElement(tag);
    let feito = false;
    const fim = (v) => { if (!feito) { feito = true; clearTimeout(prazo); ok(v); } };
    const prazo = setTimeout(() => fim(null), 8000);
    el.preload = 'auto';
    el.playsInline = true;
    el.setAttribute('playsinline', '');
    el.addEventListener('error', () => fim(null), { once: true });
    el.addEventListener('loadedmetadata', () => {
      const t = Math.max(0, Math.min(inicio, (el.duration || inicio + 1) - 1));
      if (t < 0.05) { fim(el); return; }
      el.addEventListener('seeked', () => fim(el), { once: true });
      try { el.currentTime = t; } catch { fim(el); }
    }, { once: true });
    el.src = url;
    el.load();
  });
}

const TIPOS_SEM_SOM = ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
const TIPOS_COM_SOM = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];

// Grava o cartão em vídeo: desenhar(canvas, t) a cada quadro (t em segundos), durante os segundos pedidos. Com `som`
// (um <video> ou <audio> de prepararTrecho), a mídia toca do ponto em que está e o som dela vai para o vídeo (sem sair
// no alto-falante), entrando e saindo aos poucos. Sai em MP4 (H.264, AAC) onde o aparelho grava; senão, em WebM; em
// Full HD (o cartão tem 1080 px de largura), a 12 Mbit/s.
// Devolve { blob, comSom } ou null onde não há gravação de vídeo do canvas
export async function videoDoCartao(desenhar, segundos, { fps = 30, som = null } = {}) {
  if (typeof MediaRecorder !== 'function') return null;
  const canvas = document.createElement('canvas');
  let contexto = null;
  try {
    desenhar(canvas, 0);
    if (!canvas.captureStream) return null;
    const fluxo = canvas.captureStream(fps);
    let ganho = null;
    if (som) {
      try {
        contexto = new (window.AudioContext || window.webkitAudioContext)();
        const saida = contexto.createMediaStreamDestination();
        ganho = contexto.createGain();
        contexto.createMediaElementSource(som).connect(ganho).connect(saida);
        ganho.gain.value = 0;
        som.muted = false;
        som.volume = 1;
        await contexto.resume();
        await som.play();
        saida.stream.getAudioTracks().forEach((x) => fluxo.addTrack(x));
      } catch {
        // (sem o som: a mídia segue muda, para a imagem do clipe continuar passando)
        ganho = null;
        try { som.muted = true; await som.play(); } catch { /* segue parada */ }
      }
    }
    const comSom = Boolean(ganho);
    const tipo = (comSom ? TIPOS_COM_SOM : TIPOS_SEM_SOM).find((x) => MediaRecorder.isTypeSupported(x));
    if (!tipo) return null;
    const gravador = new MediaRecorder(fluxo, { mimeType: tipo, videoBitsPerSecond: 12_000_000, ...(comSom ? { audioBitsPerSecond: 192_000 } : {}) });
    const partes = [];
    gravador.ondataavailable = (e) => { if (e.data?.size) partes.push(e.data); };
    const fim = new Promise((ok, falha) => { gravador.onstop = ok; gravador.onerror = (e) => falha(e.error || new Error('a gravação falhou')); });
    gravador.start();
    if (comSom) {
      const agora = contexto.currentTime;
      const saida = Math.min(0.8, segundos / 4);
      ganho.gain.setValueAtTime(0, agora);
      ganho.gain.linearRampToValueAtTime(1, agora + Math.min(0.4, segundos / 4));
      ganho.gain.setValueAtTime(1, agora + segundos - saida);
      ganho.gain.linearRampToValueAtTime(0, agora + segundos);
    }
    await new Promise((ok) => {
      const inicio = performance.now();
      const passo = (agora) => {
        const t = (agora - inicio) / 1000;
        if (t >= segundos) { ok(); return; }
        desenhar(canvas, t);
        requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    });
    gravador.stop();
    await fim;
    fluxo.getTracks().forEach((x) => x.stop());
    const blob = new Blob(partes, { type: tipo.split(';')[0] });
    return blob.size ? { blob, comSom } : null;
  } catch { return null; } finally {
    try { som?.pause(); } catch { /* já parado */ }
    contexto?.close?.().catch(() => {});
  }
}
