// Timer de sono (como o do Spotify): a música para sozinha depois de um tempo, ou no fim da música que está tocando.
// Aqui fica só a conta (sem tela nem relógio), para o teste; quem pausa é o player (app.js).

// as escolhas da folha: minutos, ou 'fim' (o fim da música que está tocando)
export const OPCOES_SONO = [
  { valor: 5, rotulo: '5 minutos' },
  { valor: 10, rotulo: '10 minutos' },
  { valor: 15, rotulo: '15 minutos' },
  { valor: 30, rotulo: '30 minutos' },
  { valor: 45, rotulo: '45 minutos' },
  { valor: 60, rotulo: '1 hora' },
  { valor: 'fim', rotulo: 'Fim da música' },
];

// o timer escolhido: { fimEm } (o instante, em ms, em que a música para) ou { noFim: true }; null = escolha inválida
export function novoTimerSono(valor, agora = Date.now()) {
  if (valor === 'fim') return { noFim: true };
  const min = Number(valor);
  if (!Number.isFinite(min) || min <= 0 || min > 24 * 60) return null;
  return { fimEm: agora + Math.round(min * 60000) };
}

// quanto falta, em ms (0 = já passou); o timer de "fim da música" não tem relógio: Infinity
export function faltaSono(timer, agora = Date.now()) {
  if (!timer) return 0;
  if (timer.noFim) return Infinity;
  return Math.max(0, timer.fimEm - agora);
}

// passou da hora de parar?
export const venceuSono = (timer, agora = Date.now()) => Boolean(timer && !timer.noFim && agora >= timer.fimEm);

// o que falta, escrito: "1 h 05 min", "12 min", "45 s", "Fim da música"; '' sem timer
export function textoSono(timer, agora = Date.now()) {
  if (!timer) return '';
  if (timer.noFim) return 'Fim da música';
  const s = Math.ceil(faltaSono(timer, agora) / 1000);
  if (s >= 3600) return `${Math.floor(s / 3600)} h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')} min`;
  if (s >= 60) return `${Math.ceil(s / 60)} min`;
  return `${s} s`;
}
