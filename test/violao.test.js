import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gravacaoPara, notasNoViolao, tocarAcorde } from '../public/js/lib/violao.js';

test('as notas do acorde no violão, da corda mais grave para a mais aguda', () => {
  // G aberto (3 2 0 0 0 3): Sol, Si, Ré, Sol, Si, Sol
  assert.deepEqual(notasNoViolao('G'), [43, 47, 50, 55, 59, 67]);
  // Am (x 0 2 2 1 0): a 6ª corda não toca
  assert.deepEqual(notasNoViolao('Am'), [45, 52, 57, 60, 64]);
  // com capotraste na 2ª casa, a forma de G soa em A
  assert.deepEqual(notasNoViolao('G', 2), [45, 49, 52, 57, 61, 69]);
  assert.deepEqual(notasNoViolao('acorde que não existe'), []);
});

test('sem áudio na web (no Node), tocar só responde que não tocou', () => {
  assert.equal(tocarAcorde('G'), false);
});

test('cada nota usa a gravação do violão mais perto, afinada', () => {
  assert.deepEqual(gravacaoPara(64), { midi: 64, arquivo: 'E4.mp3', afinacao: 1 });
  assert.equal(gravacaoPara(61).arquivo, 'Cs4.mp3');
  const sol = gravacaoPara(43); // Sol2 não foi gravado: sai do Fá#2, meio tom acima
  assert.equal(sol.arquivo, 'Fs2.mp3');
  assert.ok(Math.abs(1200 * Math.log2(sol.afinacao) - 98) < 1); // (o Fá#2 gravado está 2 cents acima)
});

// a altura em que cada gravação soa de verdade (medida); a nota tocada = essa altura × a afinação
const SOA = { 'D5.mp3': 74.99, 'Cs5.mp3': 73.12, 'E5.mp3': 75.96, 'A5.mp3': 80.9, 'As5.mp3': 81.9 };
const soaEm = (g) => (SOA[g.arquivo] ?? g.midi) + 12 * Math.log2(g.afinacao);

test('o Ré5 não sai mais um semitom acima (a gravação "D5" soa em Ré#5)', () => {
  // (o G com capotraste na 7ª: a corda Mi aguda é o Ré5, que soava Ré#5 contra o Ré4 do mesmo acorde)
  assert.equal(notasNoViolao('G', 7).at(-1), 74);
  for (const nota of [73, 74, 75, 76, 81, 82]) {
    const g = gravacaoPara(nota);
    assert.ok(Math.abs(soaEm(g) - nota) < 0.01, `${nota} soa em ${soaEm(g)} (${g.arquivo})`);
  }
  assert.notEqual(gravacaoPara(74).arquivo, 'D5.mp3'); // (a mais perto do Ré5 é a Dó#5, 0,88 semitom abaixo)
  assert.equal(gravacaoPara(75).arquivo, 'D5.mp3'); // (o Ré#5 é ela mesma, quase sem afinar)
});
