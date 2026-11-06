// O estado da conexão, como no Spotify: "Você está offline" enquanto não há internet, "Conectado novamente" por uns
// segundos quando ela volta e "Conexão lenta" quando a rede está fraca (2G, ou muito lenta pelas medidas do aparelho).
// rede: o navigator.connection do Android (Chrome/WebView): effectiveType, downlink (Mb/s) e rtt (ms); pode faltar
export function estadoDaConexao({ online = true, rede = null } = {}) {
  if (!online) return 'offline';
  if (!rede) return 'ok';
  const tipo = String(rede.effectiveType || '');
  if (tipo === 'slow-2g' || tipo === '2g') return 'lenta';
  // (o 3g sozinho não é lento para o app; só com as medidas ruins juntas)
  const downlink = Number(rede.downlink);
  const rtt = Number(rede.rtt);
  if ((Number.isFinite(rtt) && rtt >= 1500) || (Number.isFinite(downlink) && downlink > 0 && downlink < 0.15)) return 'lenta';
  return 'ok';
}

export const TEXTO_DA_CONEXAO = { offline: 'Você está offline', lenta: 'Conexão lenta', volta: 'Conectado novamente' };
