import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { codigoQR, reedSolomon } from '../public/js/lib/qr.js';
import { APK_DO_ECOA, dadosDoConvite, primeiroNome } from '../public/js/lib/convite.js';

const texto = (m) => m.map((l) => l.map((v) => (v ? '1' : '0')).join('')).join('\n');

test('código QR: o tamanho acompanha o texto, e os três cantos estão no lugar', () => {
  assert.equal(codigoQR('a').length, 21);
  assert.equal(codigoQR('x'.repeat(17)).length, 21);
  assert.equal(codigoQR('x'.repeat(18)).length, 25);
  assert.equal(codigoQR('z'.repeat(106)).length, 37);
  assert.throws(() => codigoQR('z'.repeat(107)));
  const m = codigoQR(APK_DO_ECOA);
  const n = m.length;
  assert.equal(n, 29);
  assert.ok(m.every((l) => l.length === n));
  const canto = ['1111111', '1000001', '1011101', '1011101', '1011101', '1000001', '1111111'];
  for (const [x, y] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
    assert.deepEqual(m.slice(y, y + 7).map((l) => l.slice(x, x + 7).map((v) => (v ? '1' : '0')).join('')), canto);
  }
  // (o módulo sempre escuro, ao lado do canto de baixo)
  assert.equal(m[n - 8][8], true);
});

test('código QR: correção de erros e matriz do endereço do APK conferidas com um leitor', () => {
  // (o exemplo da norma: "HELLO WORLD" na versão 1-M)
  const dados = [32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17];
  assert.deepEqual([...reedSolomon(dados, 10)], [196, 35, 39, 119, 235, 215, 231, 226, 93, 23]);
  // a matriz do endereço do APK, lida com sucesso por um leitor de QR (jsQR) quando este teste foi escrito
  assert.equal(createHash('sha256').update(texto(codigoQR(APK_DO_ECOA))).digest('hex'), 'c0c15b67004267ee97e4b2fe5b04393f2b95c1c882c68c654af78ed55b667114');
});

test('convite: o texto, o endereço e o nome de quem convida', () => {
  const apk = dadosDoConvite({ android: true, site: 'https://kvsl11.github.io/Ecoa/', nome: 'Maria  Clara Souza' });
  assert.equal(apk.url, 'https://kvsl11.github.io/Ecoa/Ecoa.apk');
  assert.equal(apk.endereco, 'kvsl11.github.io/Ecoa/Ecoa.apk');
  assert.equal(apk.quem, 'Maria');
  assert.match(apk.texto, /Baixe para Android:$/);
  const web = dadosDoConvite({ site: 'https://kvsl11.github.io/Ecoa/' });
  assert.equal(web.url, 'https://kvsl11.github.io/Ecoa/');
  assert.equal(web.endereco, 'kvsl11.github.io/Ecoa');
  assert.equal(web.quem, '');
  assert.match(web.texto, /Abra no navegador:$/);
  // (o e-mail nunca vai para o cartão no lugar do nome)
  assert.equal(primeiroNome('alguem@exemplo.com'), '');
  assert.equal(primeiroNome(''), '');
});

test('convite: a tela e o APK usam o mesmo endereço e o pacote leva os módulos novos', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const sw = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
  const plugin = await readFile(new URL('../app-android/android/app/src/main/java/br/ecoa/app/EcoaPlugin.java', import.meta.url), 'utf8');
  assert.doesNotMatch(app, /github\.io\/Songbook\/Ecoa\.apk/);
  assert.ok(plugin.includes(`"${APK_DO_ECOA}"`));
  assert.match(plugin, /call\.getString\("imagem"/);
  assert.ok(sw.includes("'js/lib/convite.js'") && sw.includes("'js/lib/qr.js'"));
});
