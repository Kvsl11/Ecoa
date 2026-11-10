import { test } from 'node:test';
import assert from 'node:assert/strict';
import { acompanhar, arranjar, desenhoDoCompasso, maoEsquerda } from '../public/js/lib/arranjo.js';
import { lerMidi, modeloDoMidi, gruposDoMidi } from '../public/js/lib/midi.js';
import { escolherProntas, pontuar, procurarProntas } from '../public/js/lib/prontas.js';
import { separarPelaEnergia, limpar } from '../public/js/lib/transcricao.js';
import { midiDa, paraMusicXML, emCompassos } from '../public/js/lib/partitura.js';

const ev = (a, d, c = '') => ({ a: a ? [a] : [], d, c });
const total = (evs) => evs.reduce((s, e) => s + e.d, 0);

test('acompanhamento: baixo no tempo forte, acorde nos outros tempos, do tamanho da melodia', () => {
  const melodia = { id: 'm', nome: 'Melodia', clave: 'G', ev: [ev('B4', 16, 'G'), ev('D5', 16), ev('C5', 16, 'C'), ev('B4', 8, 'D/F#'), ev('A4', 8), ev(null, 8)] };
  const evs = acompanhar(melodia, { compasso: [4, 4] });
  assert.equal(total(evs), total(melodia.ev));
  // 1º compasso (Sol): Sol grave, acorde, Ré (a quinta), acorde
  assert.deepEqual([evs[0], evs[2]].map((e) => e.a.map((x) => midiDa(x) % 12)), [[7], [2]]);
  assert.equal(evs[1].a.length, 3);
  assert.deepEqual(new Set(evs[1].a.map((x) => midiDa(x) % 12)), new Set([7, 11, 2]));
  // 2º compasso: Dó no 1º tempo; o Ré/Fá# entra no 3º tempo com o baixo na nota da barra (Fá#)
  assert.equal(midiDa(evs[4].a[0]) % 12, 0);
  assert.deepEqual(evs[6].a.map((x) => midiDa(x) % 12), [6]);
  // tudo na clave de fá: o baixo abaixo do acorde, nada acima do Ré#4
  for (const e of evs) for (const x of e.a) assert.ok(midiDa(x) >= 40 && midiDa(x) <= 63, x);
  // depois da última nota da melodia: pausa
  assert.deepEqual(evs[evs.length - 1].a, []);
});

test('acompanhamento: desenho de cada compasso e a anacruse em pausa', () => {
  assert.deepEqual(desenhoDoCompasso([3, 4]).map((f) => f.papel), ['baixo', 'acorde', 'acorde']);
  assert.deepEqual(desenhoDoCompasso([6, 8]).map((f) => f.papel), ['baixo', 'acorde', 'acorde', 'quinta', 'acorde', 'acorde']);
  assert.deepEqual(desenhoDoCompasso([2, 4]).map((f) => f.papel), ['baixo', 'acorde']);
  const melodia = { id: 'm', nome: 'Melodia', clave: 'G', ev: [ev('D4', 8), ev('G4', 24, 'G'), ev('B4', 24, 'Em')] };
  const evs = acompanhar(melodia, { compasso: [3, 4], anacruse: 8 });
  assert.deepEqual(evs[0], { a: [], d: 8 });
  assert.equal(total(evs), 56);
  assert.equal(midiDa(evs[1].a[0]) % 12, 7);
  assert.equal(midiDa(evs[4].a[0]) % 12, 4);
  assert.equal(acompanhar({ ev: [ev('C4', 8)] }), null); // sem acordes
  assert.equal(maoEsquerda('xyz'), null);
});

test('arranjo: o modelo vira Melodia + Acompanhamento e vira MusicXML com as duas pautas', () => {
  const m = { v: 1, titulo: 'T', compasso: [4, 4], fifths: 1, modo: 'major', bpm: 90, anacruse: 0,
    pautas: [{ id: 'm', nome: 'Melodia', clave: 'G', ev: [ev('B4', 32, 'G'), ev('C5', 32, 'C')] }] };
  assert.equal(arranjar(m), true);
  assert.deepEqual(m.pautas.map((p) => [p.nome, p.clave]), [['Melodia', 'G'], ['Acompanhamento', 'F']]);
  assert.equal(emCompassos(m).total, 2);
  const xml = paraMusicXML(m);
  assert.equal((xml.match(/<part id=/g) || []).length, 2);
  assert.match(xml, /<chord\/>/);
});

// um MIDI pequeno, montado à mão: formato 1, 96 tiques por semínima
function midiDeTeste() {
  const vlq = (n) => { const b = [n & 0x7f]; while ((n >>= 7)) b.unshift((n & 0x7f) | 0x80); return b; };
  const trilha = (eventos) => { const corpo = [...eventos.flat(), 0, 0xff, 0x2f, 0]; return [0x4d, 0x54, 0x72, 0x6b, 0, 0, corpo.length >> 8, corpo.length & 255, ...corpo]; };
  const nome = (s) => [0, 0xff, 0x03, s.length, ...[...s].map((c) => c.charCodeAt(0))];
  const nota = (canal, alt, dur, espera = 0) => [...vlq(espera), 0x90 | canal, alt, 100, ...vlq(dur), 0x80 | canal, alt, 0];
  const regencia = trilha([[0, 0xff, 0x51, 3, 0x09, 0x27, 0xc0], [0, 0xff, 0x58, 4, 3, 2, 24, 8], [0, 0xff, 0x59, 2, 1, 0]]); // 100 bpm, 3/4, Sol maior
  const melodia = trilha([nome('Lead Vocal'), ...[67, 69, 71, 72, 74, 71, 67, 69, 71].map((a) => nota(0, a, 96))]);
  // (acordes: as 3 notas começam juntas e terminam juntas; uso "running status" no 2º acorde)
  const acorde = (alts, dur) => [...alts.flatMap((a) => [0, 0x91, a, 90]), ...alts.flatMap((a, i) => [...vlq(i ? 0 : dur), 0x81, a, 0])];
  const piano = trilha([nome('Piano'), acorde([43, 59, 62], 288), [0, 0x91, 48, 90, 0, 52, 90, 0, 55, 90, 0x82, 0x20, 0x81, 48, 0, 0, 52, 0, 0, 55, 0], acorde([50, 54, 57], 288)]);
  const bateria = trilha([nome('Drums'), ...[36, 38, 38].map((a) => nota(9, a, 96))]);
  return new Uint8Array([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 1, 0, 4, 0, 96, ...regencia, ...melodia, ...piano, ...bateria]);
}

test('MIDI: leitura do andamento, compasso, tom e notas (com running status); a bateria fica de fora', () => {
  const midi = lerMidi(midiDeTeste());
  assert.equal(Math.round(midi.bpm), 100);
  assert.deepEqual(midi.compasso, [3, 4]);
  assert.deepEqual([midi.fifths, midi.modo], [1, 'major']);
  assert.equal(midi.notas.filter((n) => n.canal === 0).length, 9);
  assert.equal(midi.notas.filter((n) => n.canal === 1).length, 9);
  assert.deepEqual(midi.notas.filter((n) => n.canal === 1 && n.alt === 48).map((n) => [n.ini, n.fim]), [[3, 6]]);
  const grupos = gruposDoMidi(midi.notas);
  assert.equal(grupos.length, 2);
  assert.equal(grupos[0].nome, 'Lead Vocal');
  assert.throws(() => lerMidi(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])), /não é um MIDI/);
});

test('MIDI → partitura: Melodia exata na clave de sol e Acompanhamento com os acordes na clave de fá', () => {
  const m = modeloDoMidi(lerMidi(midiDeTeste()), { titulo: 'Teste' });
  assert.deepEqual([m.compasso, m.fifths, m.bpm], [[3, 4], 1, 100]);
  assert.deepEqual(m.pautas.map((p) => [p.nome, p.clave]), [['Melodia', 'G'], ['Acompanhamento', 'F']]);
  assert.deepEqual(m.pautas[0].ev.map((e) => [e.a[0], e.d]), ['G4', 'A4', 'B4', 'C5', 'D5', 'B4', 'G4', 'A4', 'B4'].map((a) => [a, 8]));
  assert.deepEqual(m.pautas[1].ev.map((e) => [e.a.join(' '), e.d]), [['G2 B3 D4', 24], ['C3 E3 G3', 24], ['D3 F#3 A3', 24]]);
  assert.equal(emCompassos(m).total, 3);
  assert.match(paraMusicXML(m), /<fifths>1<\/fifths>/);
});

test('partitura pronta: o nome do arquivo precisa ter o título inteiro; o artista no nome vem primeiro', () => {
  assert.equal(pontuar('Deep Purple - Hallelujah.mid', 'Aleluia'), 0);
  assert.ok(pontuar('Queen - Bohemian Rhapsody.mid', 'Bohemian Rhapsody', 'Queen') > pontuar('Bohemian-Rhapsody-1.mid', 'Bohemian Rhapsody', 'Queen'));
  assert.equal(pontuar('R.CONIFF.Aquarela brasileira.mid', 'Aquarela do Brasil'), 0);
  assert.ok(pontuar('Garota de Ipanema.mid', 'Garota de Ipanema (Ao Vivo)', 'Tom Jobim') > 0);
  const lista = escolherProntas([
    { name: 'Bohemian-Rhapsody-1.mid', downloadUrl: '/uploads/1.mid', plays: 9 },
    { name: 'Queen - Bohemian Rhapsody.mid', downloadUrl: '/uploads/2.mid', plays: 1 },
    { name: 'Rhapsody in Blue.mid', downloadUrl: '/uploads/3.mid', plays: 99 },
  ], 'Bohemian Rhapsody', 'Queen');
  assert.deepEqual(lista.map((x) => [x.nome, x.url, x.certo]), [
    ['Queen - Bohemian Rhapsody', 'https://bitmidi.com/uploads/2.mid', true], ['Bohemian-Rhapsody-1', 'https://bitmidi.com/uploads/1.mid', false]]);
});

test('partitura pronta: sem internet ou sem resposta, a busca devolve vazio (a geração pelo áudio segue)', async () => {
  assert.deepEqual(await procurarProntas('Noites Traiçoeiras', '', { buscar: async () => { throw new Error('offline'); } }), []);
  assert.deepEqual(await procurarProntas('Noites Traiçoeiras', '', { buscar: async () => ({ ok: false }) }), []);
  let pedido = '';
  const achadas = await procurarProntas('Noites Traiçoeiras', 'Pe. Marcelo', { buscar: async (u) => { pedido = u; return { ok: true, json: async () => ({ result: { results: [{ name: 'noites traicoeiras.mid', downloadUrl: '/uploads/7.mid' }] } }) }; } });
  assert.match(pedido, /q=noites%20traicoeiras/);
  assert.equal(achadas.length, 1);
});

test('separação pelo estéreo sem a segunda passada: a nota do centro é voz, a aberta para o lado é banda', () => {
  const sr = 22050;
  const n = sr * 2;
  const meio = new Float32Array(n);
  const lado = new Float32Array(n);
  const f = (alt) => 440 * 2 ** ((alt - 69) / 12);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const voz = 0.5 * Math.sin(2 * Math.PI * f(69) * t); // Lá4 no centro: igual nos dois lados
    const violao = 0.4 * Math.sin(2 * Math.PI * f(64) * t); // Mi4 só na esquerda
    const teclado = 0.4 * Math.sin(2 * Math.PI * f(60) * t); // Dó4 70% esquerda, 20% direita
    const dobra = 0.5 * Math.sin(2 * Math.PI * f(72) * t) ; // Dó5 cantado no centro…
    const dobrado = 0.4 * Math.sin(2 * Math.PI * f(72) * t + 1); // …e tocado pelo violão na esquerda: continua voz
    const [e, d] = [voz + dobra + violao + dobrado + 0.7 * teclado, voz + dobra + 0.2 * teclado];
    meio[i] = (e + d) / 2;
    lado[i] = (e - d) / 2;
  }
  const N = (alt) => ({ ini: 0.2, fim: 1.6, alt, amp: 0.6, fonte: 'mistura' });
  const { voz, banda } = separarPelaEnergia([N(69), N(64), N(60), N(40), N(72)], meio, lado, sr);
  assert.deepEqual(voz.map((x) => x.alt), [69, 72]);
  assert.deepEqual(banda.map((x) => x.alt).sort(), [40, 60, 64]);
  // e a limpeza aceita as partes já separadas (a voz sai acima da banda na força)
  const r = limpar({ meio: [N(69), N(64)], partes: { voz: voz.filter((x) => x.alt === 69), banda: banda.filter((x) => x.alt !== 40) } });
  assert.equal(r.tipo, 'solo');
  const daVoz = r.notas.find((x) => x.pitchMidi === 69);
  assert.equal(daVoz.fonte, 'voz');
  assert.ok(r.notas.filter((x) => x.fonte === 'banda').every((x) => x.amplitude < daVoz.amplitude));
});
