import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estadoDaConexao } from '../public/js/lib/conexao.js';

test('conexão: offline, lenta ou boa, como no Spotify', () => {
  assert.equal(estadoDaConexao({ online: false }), 'offline');
  assert.equal(estadoDaConexao({ online: false, rede: { effectiveType: '4g' } }), 'offline');
  assert.equal(estadoDaConexao({ online: true }), 'ok');
  assert.equal(estadoDaConexao({ online: true, rede: { effectiveType: '2g' } }), 'lenta');
  assert.equal(estadoDaConexao({ online: true, rede: { effectiveType: 'slow-2g' } }), 'lenta');
  assert.equal(estadoDaConexao({ online: true, rede: { effectiveType: '3g', rtt: 300, downlink: 1.5 } }), 'ok');
  assert.equal(estadoDaConexao({ online: true, rede: { effectiveType: '4g', rtt: 2000, downlink: 0.4 } }), 'lenta');
  assert.equal(estadoDaConexao({ online: true, rede: { effectiveType: '4g', rtt: 100, downlink: 0.1 } }), 'lenta');
  assert.equal(estadoDaConexao({ online: true, rede: { effectiveType: '4g', rtt: 0, downlink: 0 } }), 'ok');
});

test('a conexão só é lenta quando os pedidos de verdade demoram (a estimativa sozinha não basta)', async () => {
  const { lentaPelasMedidas, LIMITE_LENTA_MS } = await import('../public/js/lib/conexao.js');
  // dados móveis bons: os pedidos respondem rápido, mesmo com o Android estimando pouca velocidade
  assert.equal(lentaPelasMedidas([180, 220, 160]), false);
  // um pedido lento só não basta
  assert.equal(lentaPelasMedidas([180, 4000, 200]), false);
  // a maioria lenta ou sem resposta a tempo
  assert.equal(lentaPelasMedidas([2500, Infinity, 300]), true);
  assert.equal(lentaPelasMedidas([Infinity, Infinity, Infinity]), true);
  assert.equal(lentaPelasMedidas([LIMITE_LENTA_MS, LIMITE_LENTA_MS + 1, LIMITE_LENTA_MS + 1]), true);
  assert.equal(lentaPelasMedidas([]), false);
});

test('o pedido que falhou sem demorar (endereço bloqueado) não conta como lentidão', async () => {
  const { lentaPelasMedidas } = await import('../public/js/lib/conexao.js');
  assert.equal(lentaPelasMedidas([NaN, NaN, NaN]), false);
  assert.equal(lentaPelasMedidas([NaN, 200, NaN]), false);
  assert.equal(lentaPelasMedidas([NaN, Infinity, Infinity]), true);
});
