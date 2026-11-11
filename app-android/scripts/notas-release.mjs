// O texto da Release Android (Releases → android): a apresentação do APK e a última nota técnica, tirada das
// NOVIDADES (com o tipo de cada item). O Ecoa-versao.json leva só o texto dos itens, para o app instalado; por isso
// a nota não é montada a partir dele (saía "**** — undefined" em cada item).
//
//   node app-android/scripts/notas-release.mjs  → o texto (Markdown) na saída
import { NOVIDADES } from '../../public/js/lib/novidades.js';

const ROTULO = { novo: 'NOVO', melhoria: 'MELHORIA', correcao: 'CORREÇÃO' };

export function notasDaRelease(novidades = NOVIDADES) {
  const atual = novidades[0];
  // (o item pode vir só com o texto, como no Ecoa-versao.json)
  const itens = (atual?.itens || []).map((i) => (typeof i === 'string' ? { texto: i } : i)).filter((i) => i?.texto);
  return [
    'O Ecoa para Android: baixe o **Ecoa.apk** abaixo e abra no celular (o Android pede para permitir "instalar apps desconhecidos" na primeira vez).',
    '',
    '- O mesmo app do site, com a sua conta Google.',
    '- O widget da tela inicial: segure o dedo na tela inicial → Widgets → Ecoa.',
    '- O aviso de "tocando" com os botões, que mantém a música tocando com o app minimizado.',
    '',
    'As novidades do app chegam junto com a versão publicada. A atualização instalada é identificada pelo número do APK; consulte Ajustes → Sobre → Atualização do app.',
    '',
    '## Última nota técnica',
    atual ? `**Versão ${atual.versao} — ${atual.data}: ${atual.titulo}**` : 'Não há nota técnica cadastrada.',
    ...itens.flatMap((i) => ['', `- ${ROTULO[i.tipo] ? `**${ROTULO[i.tipo]}** — ` : ''}${i.texto}`]),
    '',
  ].join('\n');
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) process.stdout.write(notasDaRelease());
