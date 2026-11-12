// Os textos que não passam pela tela — as notificações (notificarSistema) e o que vai por t() / traduzir() (o texto de
// compartilhar, os cartões desenhados, os avisos do sistema) — precisam existir nos dicionários de inglês e espanhol: o
// app segue o idioma do aparelho também neles. Os trechos que mudam (${...}) entram como "3" (vale como número e como
// trecho qualquer dos padrões)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { criarTradutor } from '../public/js/lib/i18n.js';
import EN from '../public/js/lib/i18n-en.js';
import ES from '../public/js/lib/i18n-es.js';

const en = criarTradutor(EN);
const es = criarTradutor(ES);
const ARQUIVOS = ['public/js/app.js', 'public/js/lib/cartao.js', 'public/js/lib/cartao-lista.js', 'public/js/lib/convite.js'];

// o trecho entre parênteses (ou chaves) a partir de i, respeitando textos e templates
function bloco(src, i, abre = '(', fecha = ')') {
  let n = 0;
  for (let k = i; k < src.length; k++) {
    const c = src[k];
    if (c === '"' || c === "'" || c === '`') { k = fimDoTexto(src, k); continue; }
    if (c === abre) n++;
    else if (c === fecha && --n === 0) return src.slice(i, k + 1);
  }
  return '';
}
function fimDoTexto(src, i) {
  const q = src[i];
  for (let k = i + 1; k < src.length; k++) {
    if (src[k] === '\\') { k++; continue; }
    if (q === '`' && src[k] === '$' && src[k + 1] === '{') { const b = bloco(src, k + 1, '{', '}'); k += b.length; continue; }
    if (src[k] === q) return k;
  }
  return src.length;
}
// os textos (literais e templates) de um trecho; ${...} vira "3" (vale como número e como trecho qualquer)
function textos(trecho) {
  const saida = [];
  for (let k = 0; k < trecho.length; k++) {
    const c = trecho[k];
    if (c !== '"' && c !== "'" && c !== '`') continue;
    const fim = fimDoTexto(trecho, k);
    let corpo = trecho.slice(k + 1, fim);
    if (c === '`') {
      let s = ''; let j = 0;
      while (j < corpo.length) {
        if (corpo[j] === '$' && corpo[j + 1] === '{') { const b = bloco(corpo, j + 1, '{', '}'); s += '3'; j += 1 + b.length; } else s += corpo[j++];
      }
      corpo = s;
    }
    saida.push(corpo.replace(/\\(["'`\\])/g, '$1').replace(/\\n/g, '\n'));
    k = fim;
  }
  return saida;
}
const TEM = /[A-Za-zÀ-ÿ]{3}/;
const ignorar = (s) => !TEM.test(s) || /^(https?:|#\/|[\w.-]+\.(js|png|apk|json)$|[\w-]+$)/.test(s) || /^[a-z]+(-[a-z]+)*$/.test(s);

test('as notificações e os textos de compartilhar e dos cartões existem em inglês e em espanhol', () => {
  const faltando = [];
  let vistos = 0;
  const conferir = (arquivo, onde, s) => {
    const x = s.replace(/\s+/g, ' ').trim();
    if (!x || ignorar(x)) return;
    vistos++;
    const sem = [en(x) === null && 'en', es(x) === null && 'es'].filter(Boolean);
    if (sem.length) faltando.push(`${arquivo} (${onde}, sem ${sem.join(' e ')}): ${x}`);
  };
  for (const arquivo of ARQUIVOS) {
    const src = readFileSync(new URL(`../${arquivo}`, import.meta.url), 'utf8');
    for (const m of src.matchAll(/notificarSistema\(\{/g)) {
      const b = bloco(src, m.index + 'notificarSistema'.length, '(', ')');
      for (const campo of ['titulo', 'texto']) {
        for (const c of b.matchAll(new RegExp(`\\b${campo}:\\s*`, 'g'))) {
          let fim = c.index + c[0].length; let n = 0;
          for (; fim < b.length; fim++) {
            const ch = b[fim];
            if (ch === '"' || ch === "'" || ch === '`') { fim = fimDoTexto(b, fim); continue; }
            if ('({['.includes(ch)) n++; else if (')}]'.includes(ch)) { if (n === 0) break; n--; } else if (ch === ',' && n === 0) break;
          }
          for (const s of textos(b.slice(c.index + c[0].length, fim))) conferir(arquivo, `notificação, ${campo}`, s);
        }
      }
    }
    for (const m of src.matchAll(/\b(t|traduzir)\((?=['"`])/g)) {
      const [primeiro] = textos(bloco(src, m.index + m[1].length, '(', ')'));
      if (primeiro !== undefined) conferir(arquivo, `${m[1]}()`, primeiro);
    }
  }
  assert.ok(vistos >= 25, `a conferência achou só ${vistos} textos: a leitura do código parou de funcionar`);
  assert.deepEqual(faltando, []);
});
