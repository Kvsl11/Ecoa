// Ponte do Gemini ao Gemini Live nativo do Android.
// A sessão de áudio é criada pelo plugin Ecoa; não há servidor próprio nem chave Gemini no JavaScript.
function pluginEcoa() {
  const p = globalThis.Capacitor?.Plugins?.Ecoa;
  if (!p) throw new Error('A conversa por voz do Gemini está disponível no APK Android atualizado.');
  return p;
}

export async function iniciarConversaAoVivo({ genero = 'feminina', instrucao = '' } = {}) {
  const p = pluginEcoa();
  if (typeof p.lumenAoVivoIniciar !== 'function') {
    throw new Error('Atualize o APK para habilitar a conversa ao vivo nativa.');
  }
  return p.lumenAoVivoIniciar({ genero, instrucao });
}

export async function pararConversaAoVivo() {
  const p = pluginEcoa();
  if (typeof p.lumenAoVivoParar !== 'function') return { ativa: false };
  return p.lumenAoVivoParar();
}

export async function estadoConversaAoVivo() {
  const p = pluginEcoa();
  if (typeof p.lumenAoVivoStatus !== 'function') return { ativa: false };
  return p.lumenAoVivoStatus();
}
