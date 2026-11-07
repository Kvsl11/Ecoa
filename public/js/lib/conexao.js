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

// A estimativa de velocidade do Android e a do navegador (o navigator.connection) não bastam para dizer que a conexão
// está lenta: nos dados móveis, muitos aparelhos e operadoras informam um número baixo e fixo mesmo com a internet boa,
// e o "Conexão lenta" aparecia sempre fora do Wi-Fi. Elas só levantam a suspeita; quem confirma é uma medida de
// verdade: pedidos pequenos à internet, cronometrados. tempos: os milissegundos de cada pedido (Infinity: não
// respondeu a tempo). Lenta quando a maioria demorou mais que o limite
export const LIMITE_LENTA_MS = 1800;
export function lentaPelasMedidas(tempos, limite = LIMITE_LENTA_MS) {
  const ts = (tempos || []).filter((t) => typeof t === 'number' && !Number.isNaN(t));
  if (!ts.length) return false;
  return ts.filter((t) => t > limite).length > ts.length / 2;
}
