import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TAXA, analisar, andamento, ataques, corpoDaTranscricao, detectarTom, lerTranscricao, linhaComAcordes, montarCifra, nomesDoArquivo,
  segundosDe,
} from '../public/js/lib/analise-musical.js';

// uma "banda" sintética: cada acorde soa por `porAcorde` segundos (as três notas com harmônicos e o baixo na raiz),
// com um estalo de bateria a cada batida
const NOTA = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11, Bb: 10, Eb: 3 };
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
function notasDe(acorde) {
  const m = /^([A-G][#b]?)(m?)$/.exec(acorde);
  const r = NOTA[m[1]];
  return { raiz: r, notas: [r, r + (m[2] ? 3 : 4), r + 7] };
}
function banda(progressao, { porAcorde = 2, bpm = 120, repetir = 1 } = {}) {
  const seq = Array.from({ length: repetir }, () => progressao).flat();
  const seg = seq.length * porAcorde;
  const a = new Float32Array(Math.round(seg * TAXA));
  let x = 7;
  const rnd = () => { x = (x * 16807) % 2147483647; return x / 2147483647 - 0.5; };
  seq.forEach((acorde, k) => {
    const { raiz, notas } = notasDe(acorde);
    const ini = Math.round(k * porAcorde * TAXA);
    const fim = Math.round((k + 1) * porAcorde * TAXA);
    const freqs = [...notas.map((n) => hz(60 + n)), hz(36 + raiz), hz(48 + raiz)];
    for (let i = ini; i < fim; i++) {
      const t = i / TAXA;
      let v = 0;
      for (const f of freqs) for (let h = 1; h <= 3; h++) v += Math.sin(2 * Math.PI * f * h * t) / (h * h);
      a[i] = v * 0.05;
    }
  });
  const p = 60 / bpm;
  for (let t = 0; t < seg; t += p) {
    const o = Math.round(t * TAXA);
    for (let i = 0; i < 500 && o + i < a.length; i++) a[o + i] += rnd() * 0.6 * Math.exp(-i / 100);
  }
  return a;
}

test('os acordes e o tom de uma progressão conhecida (G D Em C)', () => {
  const r = analisar(banda(['G', 'D', 'Em', 'C'], { repetir: 3 }));
  assert.equal(r.tom.nome, 'G');
  const nomes = r.acordes.map((s) => s.acorde).filter(Boolean);
  // a progressão aparece inteira, na ordem, e quase sem trocas falsas
  assert.ok(nomes.join(' ').includes('G D Em C G D Em C'), nomes.join(' '));
  assert.ok(nomes.length <= 14, nomes.join(' '));
  // cada troca cai perto do instante em que o acorde muda (de 2 em 2 s)
  for (const s of r.acordes.slice(1, -1)) assert.ok(Math.abs(s.inicio / 2 - Math.round(s.inicio / 2)) <= 0.3, `troca em ${s.inicio}`);
});

test('o tom menor e a grafia com bemóis (Dm Bb F C → Dm; F Bb Eb C → F)', () => {
  const menor = analisar(banda(['Dm', 'Bb', 'C', 'Dm'], { repetir: 3 }));
  assert.equal(menor.tom.nome, 'Dm');
  assert.ok(menor.acordes.some((s) => s.acorde === 'Bb'), menor.acordes.map((s) => s.acorde).join(' '));
  const maior = analisar(banda(['F', 'Bb', 'C', 'F'], { repetir: 3 }));
  assert.equal(maior.tom.nome, 'F');
  assert.ok(!maior.acordes.some((s) => /#/.test(s.acorde)));
});

test('o andamento de uma batida conhecida', () => {
  for (const bpm of [90, 120, 140]) {
    const q = ataques(banda(['C', 'G'], { repetir: 6, bpm }));
    const achado = andamento(q.fluxo, q.passo);
    assert.ok(Math.abs(achado - bpm) <= 4, `${bpm} → ${achado}`);
  }
});

test('detectarTom: o croma das notas da escala de Lá maior', () => {
  const c = new Array(12).fill(0.01);
  for (const n of [9, 11, 1, 2, 4, 6, 8]) c[n] = 1;
  c[9] = 2; c[4] = 1.6; // (a tônica e a quinta mais presentes)
  assert.equal(detectarTom(c).nome, 'A');
  assert.equal(detectarTom(new Array(12).fill(0)), null);
});

test('segundosDe: os formatos de tempo da transcrição', () => {
  assert.equal(segundosDe('01:02.50'), 62.5);
  assert.equal(segundosDe('[1:02,5]'), 62.5);
  assert.equal(segundosDe('62.5'), 62.5);
  assert.equal(segundosDe(3), 3);
  assert.ok(Number.isNaN(segundosDe('logo')));
});

test('lerTranscricao: JSON e LRC, sem rótulos e com o fim de cada linha', () => {
  const json = { linhas: [
    { inicio: '00:12.0', fim: '00:15.5', texto: 'Senhor, eu sei que é teu este lugar' },
    { inicio: '00:10.0', texto: '[Refrão]' },
    { inicio: '00:16.0', texto: 'Todos querem entrar' },
    { inicio: '00:16.0', texto: 'Todos querem entrar' },
    { inicio: '00:40.0', texto: '(instrumental)' },
  ] };
  assert.deepEqual(lerTranscricao(json, 60), [
    { texto: 'Senhor, eu sei que é teu este lugar', inicio: 12, fim: 15.5 },
    { texto: 'Todos querem entrar', inicio: 16, fim: 28 },
  ]);
  const lrc = '[00:05.00] Primeira linha\n[00:08.50]  Segunda   linha\nlixo\n';
  assert.deepEqual(lerTranscricao(lrc, 12), [
    { texto: 'Primeira linha', inicio: 5, fim: 8.5 },
    { texto: 'Segunda linha', inicio: 8.5, fim: 12 },
  ]);
  assert.deepEqual(lerTranscricao('```json\n{"linhas": []}\n```'), []);
});

test('linhaComAcordes: o acorde do começo e a troca na palavra cantada naquele instante', () => {
  const acordes = [{ inicio: 0, fim: 4, acorde: 'G' }, { inicio: 4, fim: 8, acorde: 'D' }];
  const r = linhaComAcordes({ texto: 'Eu te louvo meu Senhor', inicio: 2, fim: 6 }, acordes);
  assert.equal(r.texto, '[G]Eu te [D]louvo meu Senhor');
  assert.equal(r.ultimo, 'D');
});

test('montarCifra: metadados, introdução, estrofes e final', () => {
  const acordes = [
    { inicio: 0, fim: 4, acorde: 'G' }, { inicio: 4, fim: 8, acorde: 'D' }, { inicio: 8, fim: 12, acorde: 'Em' },
    { inicio: 12, fim: 16, acorde: 'C' }, { inicio: 16, fim: 26, acorde: 'G' }, { inicio: 26, fim: 32, acorde: 'D' },
  ];
  const linhas = [{ texto: 'Primeira frase cantada', inicio: 8, fim: 12 }, { texto: 'Segunda frase', inicio: 12, fim: 16 }, { texto: 'Depois do solo', inicio: 26, fim: 30 }];
  const cifra = montarCifra({ titulo: 'Teste', artista: 'Eu', linhas, acordes, tom: { nome: 'G' }, bpm: 96, duracao: 32 });
  assert.equal(cifra, [
    '{title: Teste}', '{artist: Eu}', '{key: G}', '{tempo: 96}', '',
    '{comment: Introdução}', '[G]  [D]', '',
    '[Em]Primeira frase cantada', '[C]Segunda frase', '',
    '{comment: Instrumental}', '[G]', '',
    '[D]Depois do solo',
  ].join('\n') + '\n');
  // sem canto: só os acordes
  assert.match(montarCifra({ titulo: 'Solo', acordes, tom: { nome: 'G' } }), /\[G\] {2}\[D\] {2}\[Em\] {2}\[C\]\n\[G\] {2}\[D\]/);
});

test('corpoDaTranscricao: o áudio inteiro e a resposta em JSON', () => {
  const c = corpoDaTranscricao({ tipo: 'audio/mp3', dados: 'AAAA' });
  assert.equal(c.contents[0].parts[0].inline_data.mime_type, 'audio/mp3');
  assert.equal(c.generationConfig.responseMimeType, 'application/json');
  assert.ok(!c.tools);
});

test('nomesDoArquivo: o artista e o título pelo nome do arquivo', () => {
  assert.deepEqual(nomesDoArquivo('Kaio - Minha Canção.mp3'), { artista: 'Kaio', titulo: 'Minha Canção' });
  assert.deepEqual(nomesDoArquivo('03. Santo_Ensaio.m4a'), { titulo: 'Santo Ensaio', artista: '' });
  assert.deepEqual(nomesDoArquivo('gravacao-2026-11-08.wav'), { titulo: 'gravacao-2026-11-08', artista: '' });
});
