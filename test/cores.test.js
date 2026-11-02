import { test } from 'node:test';
import assert from 'node:assert/strict';
import { corDominante, corCss, coresDaCapa, corDaMusicaNaCapa, corPeloTitulo } from '../public/js/lib/cores.js';

// imagem de teste: uma lista de [r, g, b, quantos pixels]
const imagem = (...partes) => new Uint8ClampedArray(partes.flatMap(([r, g, b, n]) => Array.from({ length: n }, () => [r, g, b, 255]).flat()));

test('corDominante: o matiz que mais aparece, escuro o bastante para o texto', () => {
  const azul = corDominante(imagem([20, 60, 200, 60], [240, 240, 240, 30], [200, 40, 30, 10]));
  assert.ok(azul.h > 215 && azul.h < 235, `matiz ${azul.h}`);
  assert.ok(azul.l <= 38 && azul.l >= 22);
  const vermelho = corDominante(imagem([220, 20, 30, 40], [230, 30, 10, 40], [10, 10, 10, 20]));
  assert.ok(vermelho.h > 350 || vermelho.h < 10, `matiz ${vermelho.h}`);
  // capas diferentes, cores diferentes (não só o matiz)
  const apagado = corDominante(imagem([120, 140, 110, 50]));
  const vivo = corDominante(imagem([40, 220, 20, 50]));
  assert.ok(vivo.s > apagado.s);
  assert.match(corCss(vivo), /^hsl\(\d+ \d+% \d+%\)$/);
});

test('corDominante: capa cinza ou preta e branca não tem cor', () => {
  assert.equal(corDominante(imagem([30, 30, 30, 50], [220, 220, 220, 50])), null);
  assert.equal(corDominante(new Uint8ClampedArray()), null);
});

test('coresDaCapa: as cores fortes de matizes diferentes, a mais forte primeiro', () => {
  const cores = coresDaCapa(imagem([20, 60, 200, 60], [200, 40, 30, 40], [240, 240, 240, 30]));
  assert.ok(cores.length >= 2);
  assert.ok(cores[0].h > 215 && cores[0].h < 235, `primeira ${cores[0].h}`);
  assert.ok(cores.some((c) => c.h > 350 || c.h < 10), 'o vermelho também entra');
  assert.equal(cores[0].p, 1);
  // a cor que quase não aparece não entra
  assert.equal(coresDaCapa(imagem([20, 60, 200, 100], [200, 40, 30, 3])).length, 1);
  assert.equal(coresDaCapa(imagem([30, 30, 30, 50])), null);
});

test('corDaMusicaNaCapa: a mesma música, a mesma cor; músicas diferentes, cores variadas e sempre escuras', () => {
  const cores = coresDaCapa(imagem([200, 120, 90, 80], [60, 30, 120, 40]));
  assert.deepEqual(corDaMusicaNaCapa(cores, 'Into You|Ariana Grande'), corDaMusicaNaCapa(cores, 'Into You|Ariana Grande'));
  const vistas = new Set();
  for (let i = 0; i < 200; i++) {
    const c = corDaMusicaNaCapa(cores, `Música ${i}|Artista`);
    assert.ok(c.l >= 18 && c.l <= 40 && c.s >= 22 && c.s <= 80, corCss(c));
    vistas.add(corCss(c));
  }
  // com a mesma capa (ou capas parecidas), 200 músicas dão bem mais de 100 cores diferentes
  assert.ok(vistas.size > 120, `${vistas.size} cores`);
  assert.equal(corDaMusicaNaCapa(null, 'x'), null);
});

test('corPeloTitulo: sem capa, a cor varia com o título e fica escura', () => {
  const vistas = new Set();
  for (let i = 0; i < 300; i++) {
    const c = corPeloTitulo(`Canto ${i}`);
    assert.ok(c.l >= 22 && c.l <= 38 && c.s >= 30 && c.s <= 70);
    vistas.add(corCss(c));
  }
  assert.ok(vistas.size > 280, `${vistas.size} cores`);
});
