import test from 'node:test';
import assert from 'node:assert/strict';
import { faixasDoQuadro } from '../public/js/lib/molduras.js';

// um quadro de 96 x 54: faixas de `cor` em cima (c linhas) e embaixo (b linhas), o meio com uma cena variada
function quadro({ c = 0, b = 0, cor = [0, 0, 0], corBaixo = cor, ruido = 0, logo = false, cena = null } = {}) {
  const w = 96; const h = 54;
  const px = new Uint8ClampedArray(w * h * 4);
  let n = 7;
  const r = () => { n = (n * 1103515245 + 12345) >>> 0; return ruido ? (n >>> 16) % (ruido * 2 + 1) - ruido : 0; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const f = y < c ? cor : y >= h - b ? corBaixo : cena || [(x * 5 + y * 3) % 256, (x * 2 + y * 7) % 256, (x * 9) % 256];
    px[i] = f[0] + r(); px[i + 1] = f[1] + r(); px[i + 2] = f[2] + r(); px[i + 3] = 255;
  }
  // (o logotipo do canal em cima da faixa: 6 pixels claros no canto)
  if (logo) for (let x = 0; x < 6; x++) { px[x * 4] = 255; px[x * 4 + 1] = 255; px[x * 4 + 2] = 255; }
  return [px, w, h];
}

test('faixas pretas de cinema: medidas dos dois lados, com ruído e logotipo', () => {
  const f = faixasDoQuadro(...quadro({ c: 7, b: 7, ruido: 6, logo: true }));
  assert.equal(f.cima, 7 / 54);
  assert.equal(f.baixo, 7 / 54);
  assert.equal(f.lisa, false);
});

test('faixas brancas e cinza gravadas no clipe: reconhecidas', () => {
  for (const cor of [[255, 255, 255], [236, 236, 232], [128, 128, 128], [20, 60, 140]]) {
    const f = faixasDoQuadro(...quadro({ c: 6, b: 8, cor, ruido: 5 }));
    assert.deepEqual([f.cima, f.baixo, f.lisa], [6 / 54, 8 / 54, true], String(cor));
  }
});

test('céu claro só no alto da cena, ou cores diferentes em cima e embaixo: não é moldura', () => {
  assert.deepEqual(faixasDoQuadro(...quadro({ c: 12, b: 0, cor: [200, 220, 255] })), { cima: 0, baixo: 0, lisa: false });
  assert.deepEqual(faixasDoQuadro(...quadro({ c: 8, b: 8, cor: [255, 255, 255], corBaixo: [120, 200, 90] })), { cima: 0, baixo: 0, lisa: false });
});

test('quadro sem faixas e quadro de uma cor só: zero', () => {
  assert.deepEqual(faixasDoQuadro(...quadro()), { cima: 0, baixo: 0, lisa: false });
  assert.deepEqual(faixasDoQuadro(...quadro({ cena: [255, 255, 255] })), { cima: 0, baixo: 0, lisa: false });
  assert.deepEqual(faixasDoQuadro(...quadro({ cena: [0, 0, 0] })), { cima: 0, baixo: 0, lisa: false });
});

test('faixa preta só de um lado continua valendo (como antes)', () => {
  const f = faixasDoQuadro(...quadro({ c: 5, b: 0 }));
  assert.deepEqual([f.cima, f.baixo], [5 / 54, 0]);
});
