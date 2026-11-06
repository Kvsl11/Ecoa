// Prepara os arquivos estáticos que o Capacitor empacota dentro do APK.
// A pasta public/ é a fonte da versão Web; copiá-la não modifica nenhum arquivo do site.
import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, '../..');
const origem = resolve(raiz, 'public');
const destino = resolve(raiz, 'app-android/www');

await stat(resolve(origem, 'index.html'));
await rm(destino, { recursive: true, force: true });
await mkdir(destino, { recursive: true });
await cp(origem, destino, { recursive: true, force: true });

for (const arquivo of ['index.html', 'css/app.css', 'js/app.js']) {
  await stat(resolve(destino, arquivo));
}
console.log('Interface Web copiada para o pacote local do APK.');
