// A velocidade da música no ensaio (como o "speed changer" do Moises): mais devagar para tirar a música, mais rápido
// para repassar. O tom não muda (o navegador estica o som sem mudar a altura). Tudo no aparelho.
// Só os passos que o player do YouTube também aceita (de 0,25 em 0,25), para o vídeo e o arquivo do aparelho
// andarem iguais. Aqui fica só a conta, para o teste; quem aplica é o player (app.js).
export const VELOCIDADES = [0.5, 0.75, 1, 1.25, 1.5];

// a velocidade válida mais próxima (qualquer coisa estranha vira a normal)
export function velocidadeValida(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return 1;
  return VELOCIDADES.reduce((a, b) => (Math.abs(b - n) < Math.abs(a - n) ? b : a), 1);
}

// "0,75×", "Normal"
export const rotuloVelocidade = (v) => (velocidadeValida(v) === 1 ? 'Normal' : `${String(velocidadeValida(v)).replace('.', ',')}×`);

// o ponto da música agora: o último que o player informou mais o que passou desde então, na velocidade da música
// (no máximo `teto` segundos de relógio adiante: sem notícia do player, o ponto não sai andando sozinho)
export function pontoAgora(tempo, passouSeg, velocidade = 1, teto = 2) {
  return tempo + Math.min(teto, Math.max(0, passouSeg)) * velocidadeValida(velocidade);
}
