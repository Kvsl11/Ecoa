import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baixadorDoAparelho, baixarNoAparelho, lerBaixadoNoAparelho, erroSemVolta } from '../public/js/lib/baixador-aparelho.js';

// um plugin Ecoa de mentira: respostas[i] é o que a i-ésima chamada de baixarLocal devolve (ou o erro que lança)
function pluginFalso(respostas, { progresso = [] } = {}) {
  const pedidos = [];
  const cancelados = [];
  let ouvintes = [];
  return {
    pedidos, cancelados,
    get ouvintes() { return ouvintes.length; },
    async addListener(nome, fn) {
      const o = { nome, fn, remove: () => { ouvintes = ouvintes.filter((x) => x !== o); } };
      ouvintes.push(o);
      return o;
    },
    async baixarLocal(p) {
      pedidos.push(p);
      for (const pct of progresso) for (const o of ouvintes) o.fn({ processo: p.processo, pct });
      // (o andamento de outro download não conta para este)
      for (const o of ouvintes) o.fn({ processo: 'outro', pct: 0.99 });
      const r = respostas[pedidos.length - 1];
      if (r instanceof Error) throw r;
      return r;
    },
    async cancelarLocal(p) { cancelados.push(p.processo); return { cancelado: true }; },
  };
}

test('baixadorDoAparelho: só no APK com o método baixarLocal', () => {
  assert.equal(baixadorDoAparelho(undefined), null);
  assert.equal(baixadorDoAparelho({ isNativePlatform: () => false, Plugins: { Ecoa: {} } }), null);
  const Ecoa = {};
  assert.equal(baixadorDoAparelho({ isNativePlatform: () => true, Plugins: { Ecoa }, PluginHeaders: [{ name: 'Ecoa', methods: [{ name: 'musica' }] }] }), null);
  assert.equal(baixadorDoAparelho({ isNativePlatform: () => true, Plugins: { Ecoa }, PluginHeaders: [{ name: 'Ecoa', methods: [{ name: 'baixarLocal' }] }] }), Ecoa);
});

test('baixarNoAparelho: o áudio na qualidade pedida, com o andamento só deste download', async () => {
  const p = pluginFalso([{ caminho: '/c/a.m4a', tipo: 'audio/mp4', tamanho: 123456 }], { progresso: [0.1, 0.5, 1] });
  const andamento = [];
  const r = await baixarNoAparelho(p, 'dQw4w9WgXcQ', false, 'alta', { aoProgresso: (x) => andamento.push(x) });
  assert.equal(r.caminho, '/c/a.m4a');
  assert.deepEqual(andamento, [0.1, 0.5, 1]);
  assert.equal(p.pedidos[0].video, 'dQw4w9WgXcQ');
  assert.equal(p.pedidos[0].comVideo, false);
  assert.equal(p.pedidos[0].qualidade, 'alta');
  assert.equal(p.ouvintes, 0, 'o ouvinte do andamento sai no fim');
});

test('baixarNoAparelho: o clipe que falha tenta nas qualidades de baixo', async () => {
  const p = pluginFalso([new Error('HTTP Error 403'), new Error('timeout'), { caminho: '/c/v.mp4', tipo: 'video/mp4' }]);
  let recomecos = 0;
  const r = await baixarNoAparelho(p, 'dQw4w9WgXcQ', true, 'muito-alta', { abaixo: { 'muito-alta': ['alta', 'normal'] }, aoRecomecar: () => recomecos++ });
  assert.equal(r.caminho, '/c/v.mp4');
  assert.deepEqual(p.pedidos.map((x) => x.qualidade), ['muito-alta', 'alta', 'normal']);
  assert.ok(p.pedidos.every((x) => x.comVideo));
  assert.equal(recomecos, 2);
});

test('baixarNoAparelho: pedido o clipe, o arquivo só de som não vale', async () => {
  const p = pluginFalso([{ caminho: '/c/a.m4a', tipo: 'audio/mp4' }, { caminho: '/c/v.mp4', tipo: 'video/mp4' }]);
  const r = await baixarNoAparelho(p, 'dQw4w9WgXcQ', true, 'normal', { abaixo: { normal: ['normal'] } });
  assert.equal(r.tipo, 'video/mp4');
  assert.equal(p.pedidos.length, 2);
});

test('baixarNoAparelho: login e vídeo longo demais não tentam de novo', async () => {
  const login = Object.assign(new Error('o YouTube pediu login para baixar este vídeo'), { code: 'login' });
  const p = pluginFalso([login, { caminho: '/x', tipo: 'video/mp4' }]);
  await assert.rejects(baixarNoAparelho(p, 'dQw4w9WgXcQ', true, 'alta', { abaixo: { alta: ['normal'] } }), /login/);
  assert.equal(p.pedidos.length, 1);
  assert.ok(erroSemVolta(new Error('vídeo longo demais (mais de 30 min)')));
  assert.ok(!erroSemVolta(new Error('HTTP Error 403')));
});

test('baixarNoAparelho: a pausa cancela no celular e não tenta de novo', async () => {
  const ctrl = new AbortController();
  const p = pluginFalso([]);
  p.baixarLocal = async (pedido) => { p.pedidos.push(pedido); ctrl.abort(); throw new Error('Cancelado'); };
  await assert.rejects(baixarNoAparelho(p, 'dQw4w9WgXcQ', false, 'alta', { sinal: ctrl.signal }), /Cancelado/);
  assert.equal(p.pedidos.length, 1);
  assert.deepEqual(p.cancelados, [p.pedidos[0].processo]);
});

test('lerBaixadoNoAparelho: o arquivo do celular vira o Blob com o tipo certo', async () => {
  const urls = [];
  const fetchImpl = async (u) => { urls.push(u); return new Response(new Uint8Array(20000), { headers: { 'content-type': 'application/octet-stream' } }); };
  const b = await lerBaixadoNoAparelho({ caminho: '/data/c/baixar/x/audio.m4a', tipo: 'audio/mp4' }, { converter: (c) => 'https://localhost/_capacitor_file_' + c, fetchImpl });
  assert.equal(b.type, 'audio/mp4');
  assert.equal(b.size, 20000);
  assert.deepEqual(urls, ['https://localhost/_capacitor_file_/data/c/baixar/x/audio.m4a']);
  await assert.rejects(lerBaixadoNoAparelho({ caminho: '/x' }, { converter: (c) => c, fetchImpl: async () => new Response('', { status: 404 }) }), /não consegui ler/);
});
