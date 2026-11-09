import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('o atualizador consulta os arquivos publicados no endereço atual do Ecoa', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  assert.match(app, /https:\/\/kvsl11\.github\.io\/Ecoa\/Ecoa\.apk/);
  assert.match(app, /https:\/\/kvsl11\.github\.io\/Ecoa\/Ecoa-versao\.json/);
  assert.doesNotMatch(app, /kvsl11\.github\.io\/Songbook\/Ecoa/);
});

test('o download nativo não repete áudio na mesma qualidade', async () => {
  const helper = await readFile(new URL('../public/js/lib/baixador-aparelho.js', import.meta.url), 'utf8');
  assert.match(helper, /const qualidades = video \? \[q, \.\.\.\(abaixo\[q\] \|\| \[\]\)\] : \[q\];/);
});

test('o baixador Android só troca de cliente para erros que pedem login', async () => {
  const java = await readFile(new URL('../app-android/android/app/src/main/java/br/ecoa/app/Baixador.java', import.meta.url), 'utf8');
  assert.match(java, /req\.addOption\("--retries", 3\)/);
  assert.match(java, /req\.addOption\("--fragment-retries", 3\)/);
  assert.match(java, /if \(!pedeLogin\(e\.getMessage\(\)\)\) break;/);
  assert.doesNotMatch(java, /int alvo = Math\.min\(alturaDoVideo\(qualidade\), 720\)/);
});
