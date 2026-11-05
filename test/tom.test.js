import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cromaDoAudio, notasDoAcorde, tomQueCasa } from '../public/js/lib/tom.js';

test('as notas dos acordes', () => {
  assert.deepEqual(notasDoAcorde('C').sort((a, b) => a - b), [0, 4, 7]);
  assert.deepEqual(notasDoAcorde('Am').sort((a, b) => a - b), [0, 4, 9]);
  assert.deepEqual(notasDoAcorde('G7').sort((a, b) => a - b), [2, 5, 7, 11]);
  assert.deepEqual(notasDoAcorde('C7M').sort((a, b) => a - b), [0, 4, 7, 11]);
  assert.deepEqual([...new Set(notasDoAcorde('D/F#'))].sort((a, b) => a - b), [2, 6, 9]);
  assert.deepEqual(notasDoAcorde('Bm7(b5)').sort((a, b) => a - b), [2, 5, 9, 11]);
  assert.deepEqual(notasDoAcorde('Dsus4').sort((a, b) => a - b), [2, 7, 9]);
  assert.deepEqual(notasDoAcorde('xyz'), []);
});

// uma "gravação" de mentira: os acordes tocados um depois do outro (cada nota com os harmônicos)
const TAXA = 11025;
function gravacao(acordes, segundosPorAcorde = 2) {
  const n = Math.floor(TAXA * segundosPorAcorde);
  const saida = new Float32Array(n * acordes.length * 2);
  let pos = 0;
  for (let volta = 0; volta < 2; volta++) {
    for (const a of acordes) {
      for (const nota of notasDoAcorde(a)) {
        const f0 = 130.81 * 2 ** (nota / 12);
        for (let h = 1; h <= 4; h++) for (let i = 0; i < n; i++) saida[pos + i] += Math.sin((2 * Math.PI * f0 * h * i) / TAXA) / (h * 2);
      }
      pos += n;
    }
  }
  return saida;
}

test('a cifra num tom abaixo da gravação sobe para o tom dela', () => {
  const croma = cromaDoAudio(gravacao(['E', 'B', 'C#m', 'A']), TAXA);
  const cifraEmD = ['D', 'A', 'Bm', 'G', 'D', 'A', 'Bm', 'G'];
  const r = tomQueCasa(cifraEmD, croma);
  assert.equal(r.semitons, 2);
  assert.equal(r.ajustar, true);
  // a cifra no tom certo fica como está
  const certa = tomQueCasa(['E', 'B', 'C#m', 'A'], croma);
  assert.equal(certa.semitons, 0);
  assert.equal(certa.ajustar, false);
  assert.equal(certa.certa, true);
});

test('com a gravação e a cifra em tons menores relativos, ou sem resposta clara, a cifra fica', () => {
  const croma = cromaDoAudio(gravacao(['Am', 'F', 'C', 'G']), TAXA);
  assert.equal(tomQueCasa(['Am', 'F', 'C', 'G'], croma).ajustar, false);
  assert.equal(tomQueCasa(['C'], new Array(12).fill(1 / 12)), null);
  assert.equal(tomQueCasa([], croma), null);
});
