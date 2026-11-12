import { test } from 'node:test';
import assert from 'node:assert/strict';
import { batida, bordasDoSom, planoAutomix, planoCrossfade, volumes } from '../public/js/lib/automix.js';

const TAXA = 11025;
// uma batida sintética: um estalo (ruído que some rápido) a cada batida, com um ruído baixinho por baixo
function batidas(bpm, fase, seg = 20, { acento = 0, semente = 1 } = {}) {
  const a = new Float32Array(Math.round(seg * TAXA));
  let x = semente;
  const rnd = () => { x = (x * 16807) % 2147483647; return x / 2147483647 - 0.5; };
  for (let i = 0; i < a.length; i++) a[i] = rnd() * 0.01;
  const p = 60 / bpm;
  for (let t = fase, k = 0; t < seg; t += p, k++) {
    const o = Math.round(t * TAXA);
    const forte = acento && k % 4 === 0 ? 1 : 0.6;
    for (let i = 0; i < 600 && o + i < a.length; i++) a[o + i] += rnd() * forte * Math.exp(-i / 120);
  }
  return a;
}
const perto = (a, b, tol) => Math.abs(a - b) <= tol;
const faseCerta = (achada, fase, periodo, tol = 0.035) => {
  const d = Math.abs(((achada - fase) % periodo + periodo * 1.5) % periodo - periodo / 2);
  return d <= tol;
};

test('acha o andamento e a fase da batida', () => {
  for (const [bpm, fase] of [[120, 0.3], [96, 0.1], [140, 0.25], [80, 0.6]]) {
    const b = batida(batidas(bpm, fase), TAXA);
    assert.ok(b, `achou a batida (${bpm})`);
    assert.ok(perto(b.bpm, bpm, 1.5), `${bpm}: deu ${b.bpm}`);
    assert.ok(faseCerta(b.fase, fase, b.periodo), `${bpm}: fase ${b.fase} em vez de ${fase}`);
    assert.ok(b.confianca >= 0.35, `${bpm}: confiança ${b.confianca}`);
  }
});

test('a primeira batida pula o silêncio do começo', () => {
  for (const [bpm, fase] of [[118, 1.6], [100, 0.9], [128, 2.2]]) {
    const b = batida(batidas(bpm, fase), TAXA);
    assert.ok(perto(b.primeira, fase, 0.04), `${bpm}: primeira em ${b.primeira} em vez de ${fase}`);
  }
});

test('silêncio ou trecho curto não têm batida', () => {
  assert.equal(batida(new Float32Array(TAXA * 10), TAXA), null);
  assert.equal(batida(batidas(120, 0, 3), TAXA), null);
});

test('crossfade: os últimos segundos escolhidos, de 1 a 12', () => {
  assert.deepEqual(planoCrossfade(200, 6), { inicio: 194, dur: 6, entradaEm: 0, encaixar: false });
  assert.equal(planoCrossfade(200, 30).dur, 12);
  assert.equal(planoCrossfade(200, 0.2).dur, 1);
  assert.equal(planoCrossfade(10, 6), null); // (música curta demais)
});

test('automix: nunca corta a voz', () => {
  const p = planoAutomix({ duracao: 200, fimCanto: 195 });
  assert.ok(p.inicio >= 196, `começou em ${p.inicio}`);
  assert.ok(p.dur >= 3 && p.inicio + p.dur <= 200);
});

test('automix: com o final instrumental comprido e a batida, não espera ele inteiro', () => {
  const saida = { bpm: 120, periodo: 0.5, fase: 0.2, confianca: 0.8 };
  const p = planoAutomix({ duracao: 240, fimCanto: 180, saida });
  assert.ok(p.inicio >= 181 && p.inicio <= 216, `começou em ${p.inicio}`);
});

test('automix: sem a batida, o final comprido não é cortado (a transição fica no fim)', () => {
  const p = planoAutomix({ duracao: 240, fimCanto: 180 });
  assert.ok(p.inicio >= 230 && p.inicio + p.dur <= 240, `começou em ${p.inicio}`);
});

test('automix: o final curto é coberto inteiro, desde logo depois da voz', () => {
  const p = planoAutomix({ duracao: 200, fimCanto: 190 });
  assert.ok(perto(p.inicio, 191, 1e-6) && perto(p.inicio + p.dur, 199.6, 1e-6), JSON.stringify(p));
});

test('automix: começa numa batida da que acaba, em batidas inteiras, e a próxima entra na batida dela', () => {
  const saida = { bpm: 120, periodo: 0.5, fase: 0.2, confianca: 0.8 };
  const entrada = { bpm: 121, periodo: 60 / 121, fase: 0.7, confianca: 0.8 };
  const p = planoAutomix({ duracao: 200, fimCanto: 180, saida, entrada });
  const k = (p.inicio - 0.2) / 0.5;
  assert.ok(perto(k, Math.round(k), 1e-6), `fora da batida: ${p.inicio}`);
  assert.ok(perto(p.dur / 0.5, Math.round(p.dur / 0.5), 1e-6), `duração fora da batida: ${p.dur}`);
  assert.ok(p.dur >= 4 && p.dur <= 12);
  assert.ok(p.inicio + p.dur <= 200);
  assert.equal(p.entradaEm, 0.7);
  assert.equal(p.encaixar, true);
  assert.equal('taxa' in p, false); // (a velocidade das músicas nunca muda)
  assert.equal(planoAutomix({ duracao: 200, fimCanto: 180, saida, entrada: null }).encaixar, false);
});

test('volumes: a que sai desce desde o começo (se ouve) e a que entra sobe, sem buraco no meio', () => {
  assert.deepEqual(volumes(0).map((v) => Math.round(v * 1000) / 1000), [1, 0]);
  assert.deepEqual(volumes(1).map((v) => Math.round(v * 1000) / 1000), [0, 1]);
  assert.ok(volumes(0.25)[0] < 0.6, 'com um quarto da transição, a que sai já está bem mais baixa');
  assert.ok(volumes(0.5)[0] <= 0.25);
  for (let x = 0; x <= 1; x += 0.05) {
    const [a, b] = volumes(x);
    assert.ok(a + b >= 0.99 && a + b <= 1.01, `soma em ${x}: ${a + b}`);
    if (x > 0) assert.ok(a <= volumes(x - 0.05)[0] && b >= volumes(x - 0.05)[1]);
  }
});

test('acha onde o som começa e acaba, sem o silêncio das pontas', () => {
  const a = new Float32Array(40 * TAXA);
  for (let i = Math.round(1.5 * TAXA); i < 36 * TAXA; i++) a[i] = 0.4 * Math.sin(i / 8);
  // (um resto de eco bem baixo depois do fim não conta como som)
  for (let i = 36 * TAXA; i < 38 * TAXA; i++) a[i] = 0.002 * Math.sin(i / 8);
  const b = bordasDoSom(a, TAXA);
  assert.ok(perto(b.inicio, 1.5, 0.06), `começo: ${b.inicio}`);
  assert.ok(perto(b.fim, 36, 0.06), `fim: ${b.fim}`);
  assert.equal(bordasDoSom(new Float32Array(40 * TAXA), TAXA), null, 'só silêncio: não há bordas');
});

test('o crossfade acaba onde o som acaba e a próxima entra onde o som dela começa', () => {
  assert.deepEqual(planoCrossfade(200, 6), { inicio: 194, dur: 6, entradaEm: 0, encaixar: false });
  const p = planoCrossfade(200, 6, { fimSom: 195.5, inicioSom: 1.2 });
  assert.equal(p.inicio, 189.5);
  assert.equal(p.entradaEm, 1.2);
  // silêncio comprido demais nas pontas não é silêncio de borda: vale o arquivo inteiro
  const q = planoCrossfade(200, 6, { fimSom: 150, inicioSom: 25 });
  assert.equal(q.inicio, 194);
  assert.equal(q.entradaEm, 0);
});

test('o automix também acaba onde o som acaba', () => {
  const p = planoAutomix({ duracao: 200, fimSom: 195, inicioSom: 2 });
  assert.ok(perto(p.inicio + p.dur, 195, 0.01), `fim da transição: ${p.inicio + p.dur}`);
  assert.equal(p.entradaEm, 2);
});
