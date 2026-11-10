import { test } from 'node:test';
import assert from 'node:assert/strict';

// um localStorage de mentira, com limite de tamanho por item (como o do navegador, que recusa o que não cabe)
function armazenamento(limite = Infinity) {
  const dados = new Map();
  return {
    dados,
    getItem: (k) => (dados.has(k) ? dados.get(k) : null),
    setItem: (k, v) => { if (String(v).length > limite) throw Object.assign(new Error('QuotaExceededError'), { name: 'QuotaExceededError' }); dados.set(k, String(v)); },
    removeItem: (k) => { dados.delete(k); },
  };
}
let vez = 0;
const abrirApp = () => import(`../public/js/store.js?abertura=${++vez}`);

test('ajustes: continuam como a pessoa deixou ao abrir o app de novo, mesmo quando a biblioteca não coube no armazenamento', async () => {
  globalThis.localStorage = armazenamento(600);
  let { db } = await abrirApp();
  db.setPref('qualidadeAudio', 'normal');
  // a biblioteca cresce e o bloco inteiro deixa de caber
  db.saveSong({ content: `{title: Grande}\n${'la la la '.repeat(200)}` });
  db.setPref('qualidadeAudio', 'alta');
  db.setPref('qualidadeVideo', '4k');
  db.setPref('fontScale', 1.4);
  assert.equal(localStorage.getItem('songbook.naoCoube'), '1');
  // o app fecha e abre de novo (uma atualização, por exemplo)
  ({ db } = await abrirApp());
  assert.equal(db.prefs().qualidadeAudio, 'alta');
  assert.equal(db.prefs().qualidadeVideo, '4k');
  assert.equal(db.prefs().fontScale, 1.4);
  assert.equal(db.prefs().theme, 'dark'); // o que não foi mexido fica no padrão
});

test('ajustes: os que estavam só no bloco da biblioteca (versões anteriores) continuam valendo; a chave própria vale mais', async () => {
  globalThis.localStorage = armazenamento();
  localStorage.setItem('songbook.v1', JSON.stringify({ songs: [], sets: [], prefs: { qualidadeAudio: 'maxima', scrollSpeed: 5 } }));
  let { db } = await abrirApp();
  assert.equal(db.prefs().qualidadeAudio, 'maxima');
  db.setPref('scrollSpeed', 7);
  assert.deepEqual(JSON.parse(localStorage.getItem('songbook.prefs')).scrollSpeed, 7);
  assert.equal(localStorage.getItem('songbook.naoCoube'), null);
  // o bloco voltou a um estado antigo: a chave dos ajustes prevalece
  localStorage.setItem('songbook.v1', JSON.stringify({ songs: [], sets: [], prefs: { qualidadeAudio: 'normal', scrollSpeed: 3 } }));
  ({ db } = await abrirApp());
  assert.equal(db.prefs().scrollSpeed, 7);
  assert.equal(db.prefs().qualidadeAudio, 'maxima');
  // "Apagar tudo": volta ao padrão
  localStorage.removeItem('songbook.prefs');
  db.clear();
  ({ db } = await abrirApp());
  assert.equal(db.prefs().qualidadeAudio, undefined);
  delete globalThis.localStorage;
});
