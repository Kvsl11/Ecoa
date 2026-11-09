// A análise da música importada (analise-musical.js) fora da tela: o andamento, o tom e os acordes de uma música
// inteira levam um ou dois segundos no celular e travariam os toques. Recebe { amostras } (mono, na TAXA) e devolve
// { bpm, tom, acordes, duracao }
import { analisar } from './analise-musical.js';

self.onmessage = (e) => {
  try {
    self.postMessage({ ok: true, r: analisar(e.data.amostras) });
  } catch (erro) {
    self.postMessage({ ok: false, erro: String(erro?.message || erro) });
  }
};
