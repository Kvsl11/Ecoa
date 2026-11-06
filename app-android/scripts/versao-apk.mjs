// O arquivo da versão do APK publicado (Ecoa-versao.json, ao lado do Ecoa.apk): o número e o nome da versão e as
// novidades que vêm DENTRO deste APK (a interface vai empacotada nele). O app instalado compara com as dele e, no aviso
// de versão nova, mostra só as que ele ainda não tem. Antes ia só o número, e o aviso listava as novidades do próprio
// app instalado (as antigas, que a pessoa já tinha)
//
//   node app-android/scripts/versao-apk.mjs <código> <nome>  → o JSON na saída
import { NOVIDADES } from '../../public/js/lib/novidades.js';

export function versaoDoApk(codigo, nome, novidades = NOVIDADES) {
  return {
    codigo: Number(codigo) || 0,
    nome: String(nome || ''),
    // (a versão da interface empacotada: a primeira das novidades)
    web: Number(novidades[0]?.versao) || 0,
    novidades: novidades.map((n) => ({ versao: n.versao, data: n.data, titulo: n.titulo, itens: n.itens.map((i) => i.texto) })),
  };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  process.stdout.write(JSON.stringify(versaoDoApk(process.argv[2], process.argv[3])) + '\n');
}
