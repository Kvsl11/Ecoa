import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  SISTEMA, SISTEMA_VOZ, montarPergunta, pedacos, limparTextoPdf, trechosDosPdfs, trechosQueImportam, candidatosGemini,
  chamarGemini, responderNoAparelho, corpoDoGemini, arquivoParaOGemini,
} from '../public/js/lib/lumen-local.js';

// um Gemini de mentira: respostas por modelo (uma lista, consumida em ordem) e a lista de modelos
function geminiFalso(porModelo, modelos = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-lite-latest']) {
  const pedidos = [];
  const chamar = async (caminho, corpo) => {
    pedidos.push({ caminho, corpo });
    if (caminho.startsWith('models?')) return { status: 200, texto: JSON.stringify({ models: modelos.map((n) => ({ name: `models/${n}`, supportedGenerationMethods: ['generateContent'] })) }) };
    const modelo = /models\/([^:]+):/.exec(caminho)[1];
    const r = (porModelo[modelo] || []).shift() || { status: 404, texto: '{"error":{"message":"not found"}}' };
    return r;
  };
  return { chamar, pedidos };
}
const ok = (texto, extra = {}) => ({ status: 200, texto: JSON.stringify({ candidates: [{ content: { parts: [{ text: texto }] }, ...extra }] }) });

test('Lúmen no aparelho: os textos do sistema são os mesmos do servidor', async () => {
  const py = await readFile(new URL('../servidor-ia/duvidas.py', import.meta.url), 'utf8');
  assert.ok(SISTEMA.startsWith('Você é o Lumen, o assistente do app Songbook Litúrgico.'));
  assert.ok(SISTEMA.includes('[[tocar: título exato da música'));
  assert.ok(py.includes('A resposta será LIDA EM VOZ ALTA'));
  assert.ok(SISTEMA_VOZ.includes('A resposta será LIDA EM VOZ ALTA'));
  assert.ok(!SISTEMA.includes('\\\n'));
});

test('Lúmen no aparelho: o texto dos PDFs em pedaços, como no servidor', () => {
  assert.equal(limparTextoPdf('cele-\nbração\n12\nda missa'), 'celebração da missa');
  const longo = Array.from({ length: 30 }, (_, i) => `Parágrafo ${i} ${'palavra '.repeat(10)}`).join('\n');
  const ps = pedacos(longo);
  assert.ok(ps.length > 1 && ps.every((p) => p.length <= 1200));
  const t = trechosDosPdfs('{"id":"x","titulo":"Ritual","caminho":"Docs","texto":"O rito do matrimônio."}\nquebrado\n');
  assert.deepEqual(t, [{ titulo: 'Ritual', caminho: 'Docs', texto: 'O rito do matrimônio.', id: 'x', tipo: 'documento' }]);
});

test('Lúmen no aparelho: a pergunta com o contexto do app e os trechos numerados', () => {
  const p = montarPergunta('Quando se canta o Glória?', [{ titulo: 'IGMR', caminho: 'Docs', texto: 'O Glória…' }], 'Hoje: domingo');
  assert.match(p, /^<app>\nHoje: domingo\n<\/app>/);
  assert.match(p, /\[1\] IGMR — Docs\nO Glória…/);
  assert.match(montarPergunta('x', []), /nenhum trecho do acervo/);
  assert.deepEqual(trechosQueImportam([{ nota: 10 }, { nota: 4 }, { nota: 3 }]).map((a) => a.nota), [10, 4]);
});

test('Lúmen no aparelho: o Flash mais novo primeiro, os Lite de reserva', () => {
  const lista = candidatosGemini(['gemini-2.5-flash', 'gemini-3.6-flash', 'gemini-3.6-flash-lite', 'gemini-3.6-flash-tts', 'gemini-3.6-pro']
    .map((n) => ({ name: `models/${n}`, supportedGenerationMethods: ['generateContent'] })));
  assert.equal(lista[0], 'gemini-3.6-flash');
  assert.ok(lista.includes('gemini-2.5-flash') && lista.includes('gemini-3.6-flash-lite'));
  assert.ok(!lista.some((n) => /tts|pro/.test(n)));
});

test('Lúmen no aparelho: modelo sem cota passa para o próximo; sem a busca do Google se ela estourar', async () => {
  const g = geminiFalso({
    'gemini-3.6-flash': [{ status: 429, texto: '{"error":{"message":"quota PerDay limit: 0"}}' }, { status: 429, texto: '{"error":{"message":"quota PerDay limit: 0"}}' }],
    'gemini-3.5-flash': [ok('Resposta [1].', { groundingMetadata: { webSearchQueries: ['a'], groundingChunks: [{ web: { uri: 'https://cnbb.org.br', title: 'CNBB' } }] } })],
  });
  const estado = {};
  const r = await responderNoAparelho({ pergunta: 'Quando se canta o Glória?', achados: [{ titulo: 'IGMR', caminho: 'Docs', texto: 'O Glória', id: 'a', tipo: 'documento', nota: 5 }] }, g.chamar, estado);
  assert.equal(r.resposta, 'Resposta [1].');
  assert.deepEqual(r.fontes, [{ n: 1, titulo: 'IGMR', caminho: 'Docs', id: 'a', tipo: 'documento' }]);
  assert.deepEqual(r.web, [{ titulo: 'CNBB', url: 'https://cnbb.org.br' }]);
  assert.equal(r.usouWeb, true);
  assert.equal(estado.bom, 'gemini-3.5-flash');
  // (o 429 com a busca: o mesmo modelo de novo, sem ela)
  const semBusca = g.pedidos.filter((p) => p.caminho.includes('3.6-flash'));
  assert.ok(semBusca[0].corpo.tools && !semBusca[1].corpo.tools);
  assert.ok(estado.semBuscaAte > Date.now());
});

test('Lúmen no aparelho: o modelo que só funciona pensando vai sem o ajuste', async () => {
  const g = geminiFalso({ 'gemini-3.6-flash': [{ status: 400, texto: '{"error":{"message":"thinking budget is not supported"}}' }, ok('oi')] });
  const dados = await chamarGemini(g.chamar, { contents: [] }, {});
  assert.equal(dados.candidates[0].content.parts[0].text, 'oi');
  const tentativas = g.pedidos.filter((p) => p.caminho.includes(':generateContent'));
  assert.ok(tentativas[0].corpo.generationConfig && !tentativas[1].corpo.generationConfig);
});

test('Lúmen no aparelho: sem internet, o erro sai na hora', async () => {
  const chamar = async (c) => (c.startsWith('models?') ? { status: 0, texto: 'sem conexão' } : { status: 0, texto: 'sem conexão com a IA' });
  await assert.rejects(chamarGemini(chamar, { contents: [] }, {}), (e) => e.status === 0);
});

test('Lúmen no aparelho: os arquivos enviados', () => {
  assert.deepEqual(arquivoParaOGemini({ nome: 'f.jpg', tipo: 'image/jpeg', dados: 'AAA' }), { nome: 'f.jpg', tipo: 'image/jpeg', dados: 'AAA' });
  assert.equal(arquivoParaOGemini({ nome: 'n.txt', tipo: 'text/plain', dados: Buffer.from('olá').toString('base64') }).texto, 'olá');
  const corpo = corpoDoGemini([{ role: 'user', content: 'resuma' }], 'S', [{ nome: 'f.pdf', tipo: 'application/pdf', dados: 'QQ==' }]);
  assert.deepEqual(corpo.contents[0].parts[0], { inline_data: { mime_type: 'application/pdf', data: 'QQ==' } });
  assert.deepEqual(corpo.contents[0].parts[1], { text: 'resuma' });
});
