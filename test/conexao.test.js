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
