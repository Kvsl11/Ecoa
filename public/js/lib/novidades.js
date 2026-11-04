// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 494, data: '2026-11-04', titulo: 'O karaokê entra sem travar a música',
    itens: [
      { tipo: 'correcao', texto: 'Ao tocar no microfone do karaokê, a música dava uma travada: sumia por quase um segundo e voltava. No celular, mais ainda com fone Bluetooth, o som do karaokê leva um instante para começar a sair, e o app baixava a música antes disso. Agora a música segue tocando normal até o karaokê estar soando de verdade, e só então uma passa para a outra, sem buraco.' },
    ],
  },
  {
    versao: 493, data: '2026-11-04', titulo: 'O botão de tela inteira aparece ao tocar no vídeo',
    itens: [
      { tipo: 'melhoria', texto: 'No Tocando agora, o botão de ver o vídeo na tela inteira fica escondido e aparece por uns 3 segundos quando você toca no vídeo, como no Spotify e no YouTube. Tocar de novo mostra outra vez. O mesmo vale na página da música e no painel do tablet. Na barrinha do player, embaixo, ele continua sempre à vista.' },
    ],
  },
  {
    versao: 492, data: '2026-11-04', titulo: 'O contorno da capinha dá duas voltas',
    itens: [
      { tipo: 'melhoria', texto: 'Ao entrar na playlist, o contorno da capinha da prévia agora faz a animação do Spotify. Ele dá duas voltas: na primeira, dois traços correm em volta da tela e somem; na segunda, voltam e crescem até fechar o contorno. Só depois o cartão de trás sai girando.' },
      { tipo: 'melhoria', texto: 'O cartão de trás ficou um pouco mais recolhido atrás da tela.' },
    ],
  },
  {
    versao: 491, data: '2026-11-04', titulo: 'O cartão inclinado e a sombra da capinha',
    itens: [
      { tipo: 'melhoria', texto: 'O cartão atrás da capinha da prévia agora fica inclinado, como no Spotify: no alto ele aparece à direita da tela e, embaixo, fica escondido atrás dela. Ao entrar na playlist, ele sai girando até ficar nessa posição.' },
      { tipo: 'melhoria', texto: 'A capinha ganhou a faixa escura em volta da tela, a sombra que separa a tela do cartão de trás, como no Spotify. O contorno e o cartão ficaram nos tons de cinza-azulado dele.' },
    ],
  },
  {
    versao: 490, data: '2026-11-04', titulo: 'A capinha da prévia ao entrar na playlist',
    itens: [
      { tipo: 'melhoria', texto: 'Ao entrar na playlist, a capinha da prévia faz a animação do Spotify. Ela já começa mostrando a primeira música, e não mais a capa da playlist. O contorno claro se desenha em volta e, no fim, o cartão de trás desliza para a direita.' },
      { tipo: 'melhoria', texto: 'A capinha ficou no tamanho e na proporção da do Spotify, um pouco mais estreita e alta que antes.' },
      { tipo: 'melhoria', texto: 'O app guarda no aparelho a medida das faixas pretas de cada clipe. Assim, a capinha e a prévia não precisam medir de novo, e o vídeo entra mais rápido.' },
    ],
  },
  {
    versao: 489, data: '2026-11-04', titulo: 'Baixada fica verde',
    itens: [
      { tipo: 'correcao', texto: 'O botão de baixar da playlist voltava a aparecer cinza com tudo baixado. Agora a música ou playlist baixada mostra o círculo verde cheio com a seta preta em todo lugar: na playlist, na página da música e no "Remover o download" dos ⋮. O que ainda falta baixar fica só com o contorno.' },
    ],
  },
  {
    versao: 488, data: '2026-11-04', titulo: 'A capinha da prévia sem piscar',
    itens: [
      { tipo: 'correcao', texto: 'A capinha da playlist dava uma piscada mostrando as faixas pretas do clipe antes de ficar normal. Agora o app mede as faixas antes de mostrar o vídeo, e ele já entra sem elas. O mesmo vale para a prévia em tela cheia.' },
      { tipo: 'melhoria', texto: 'A capinha ficou como a do Spotify: a tela com o contorno claro e um cartão claro atrás, como uma capinha.' },
      { tipo: 'melhoria', texto: 'Com a música pausada, as barrinhas ao lado do nome viram três quadradinhos, como o "..." do Spotify. Tocando, voltam a se mexer.' },
    ],
  },
  {
    versao: 487, data: '2026-11-04', titulo: 'Adicionar várias de uma vez',
    itens: [
      { tipo: 'novo', texto: 'No "Adicionar" da playlist, dá para marcar várias músicas (ou todas, com "Selecionar todas") e adicionar de uma vez. As que já estão na playlist aparecem apagadas, com "Na playlist". Na aba "Procurar na internet", tocar numa música salva ela na biblioteca e já deixa marcada.' },
      { tipo: 'melhoria', texto: 'A capinha da playlist agora passa um pouco de cada música, uns 4 segundos do refrão de cada uma, como os stories em miniatura. Antes mostrava só a primeira.' },
    ],
  },
  {
    versao: 486, data: '2026-11-04', titulo: 'A música tocando em todas as listas',
    itens: [
      { tipo: 'novo', texto: 'Como no Spotify, a música que está tocando aparece destacada em todas as listas: na Biblioteca, nas Músicas curtidas, na Busca, nas playlists e nos repertórios. O nome fica na cor que você escolheu nos Ajustes e, enquanto ela toca, aparecem as barrinhas animadas antes dele.' },
      { tipo: 'novo', texto: 'Na playlist com o "Vídeo" ligado, tocar numa música (ou no play) abre o clipe. Com ele desligado, abre a versão música.' },
      { tipo: 'melhoria', texto: 'Os clipes da prévia da playlist e da capinha não têm mais as faixas pretas em cima e embaixo: o app mede as faixas no vídeo e amplia só o necessário. A capinha ganhou os cartões empilhados atrás, como nos stories do Spotify.' },
    ],
  },
  {
    versao: 485, data: '2026-11-04', titulo: 'A prévia da playlist no refrão',
    itens: [
      { tipo: 'novo', texto: 'A prévia da playlist (os clipes em tela cheia) agora toca o refrão de cada música, achado pela letra sincronizada. Com a música baixada, o clipe e o áudio tocam do aparelho, sem internet.' },
      { tipo: 'novo', texto: 'A capinha ao lado do baixar ganhou movimento: mostra, sem som, o clipe baixado de uma das músicas no refrão. Sem clipe baixado, as imagens dos clipes vão passando.' },
      { tipo: 'melhoria', texto: 'O "Salvar" das telas da playlist, o ✓ da prévia e a marca da ordem escolhida agora ficam na cor que você escolheu nos Ajustes, em vez de verde. Saiu o chip Mix da playlist.' },
      { tipo: 'correcao', texto: 'Com a playlist toda baixada, o botão de baixar aparecia cinza. Agora fica verde e cheio, e só o contorno quando ainda falta baixar.' },
      { tipo: 'correcao', texto: 'Na playlist, o nome de uma música que já tinha tocado continuava destacado. Agora só a música que está tocando fica destacada, e o destaque acompanha o player quando ele passa para a próxima.' },
    ],
  },
];

// A primeira versão de cada mês. O número mostrado ("2026.10.31-383") é a data da versão e quantas versões o mês já
// teve: recomeça do 1 quando o mês vira. O número de verdade (o do sw.js, que atualiza o app) continua subindo sempre.
// Ao publicar a primeira versão de um mês novo, acrescente aqui o mês com o número dela (um teste confere).
// (outubro de 2026: o app começou nele, na versão 1; novembro começou na 384)
export const PRIMEIRA_DO_MES = { '2026-10': 1, '2026-11': 384 };
export function versaoMostrada(versao, data) {
  const d = String(data || '');
  const primeira = PRIMEIRA_DO_MES[d.slice(0, 7)] ?? 1;
  return `${d.replaceAll('-', '.')}-${Number(versao) - primeira + 1}`;
}
// a versão do app como aparece nos Ajustes e nas Novidades
export const APP_VERSAO = versaoMostrada(NOVIDADES[0].versao, NOVIDADES[0].data);

// as versões que a pessoa ainda não viu (mais nova primeiro); sem nenhuma vista ainda, só a atual
export function novidadesNaoVistas(vista) {
  const v = Number(vista) || 0;
  if (!v) return NOVIDADES.slice(0, 1);
  return NOVIDADES.filter((n) => n.versao > v);
}
