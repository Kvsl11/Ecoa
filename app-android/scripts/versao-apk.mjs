// O arquivo da versão do APK publicado (Ecoa-versao.json, ao lado do Ecoa.apk): o número e o nome da versão, as
// novidades que vêm DENTRO deste APK (a interface vai empacotada nele) e o histórico dos APKs publicados (qual versão
// das novidades cada um trouxe). O app instalado compara com as dele: no aviso de versão nova mostra só as que ele
// ainda não tem, e na tela Novidades mostra em qual versão do app cada uma chegou (e não o número do site)
//
//   node app-android/scripts/versao-apk.mjs <código> <nome> [Ecoa-versao.json anterior]  → o JSON na saída
import { readFileSync } from 'node:fs';
import { NOVIDADES } from '../../public/js/lib/novidades.js';

export function versaoDoApk(codigo, nome, novidades = NOVIDADES, anterior = null) {
  const web = Number(novidades[0]?.versao) || 0;
  const atual = { codigo: Number(codigo) || 0, nome: String(nome || ''), web };
  // (o histórico do arquivo anterior; o de antes do histórico vira o primeiro, se trouxer a versão das novidades)
  const antes = Array.isArray(anterior?.historico) ? anterior.historico
    : anterior?.codigo && anterior.web ? [{ codigo: anterior.codigo, nome: anterior.nome, web: anterior.web }] : [];
  const historico = [...antes.filter((h) => Number(h?.codigo) && Number(h.codigo) !== atual.codigo && h.web), atual]
    .sort((a, b) => a.codigo - b.codigo).slice(-60);
  return {
    ...atual,
    novidades: novidades.map((n) => ({ versao: n.versao, data: n.data, titulo: n.titulo, itens: n.itens.map((i) => i.texto) })),
    historico,
  };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  let anterior = null;
  try { anterior = process.argv[4] ? JSON.parse(readFileSync(process.argv[4], 'utf8')) : null; } catch { anterior = null; }
  process.stdout.write(JSON.stringify(versaoDoApk(process.argv[2], process.argv[3], NOVIDADES, anterior)) + '\n');
}
