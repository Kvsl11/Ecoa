// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 536, data: '2026-11-05', titulo: 'O botão de baixar da playlist',
    itens: [
      { tipo: 'melhoria', texto: 'Na playlist, enquanto as músicas baixam, o botão de baixar só pisca de leve (como as setas das músicas na lista), sem o anel verde em volta. Com todas baixadas, ele fica verde.' },
    ],
  },
  {
    versao: 535, data: '2026-11-05', titulo: 'Downloads mais rápidos e sempre com o clipe',
    itens: [
      { tipo: 'correcao', texto: 'Muitas músicas baixavam só o som, sem o clipe: quando o áudio oficial é o próprio clipe, o app pedia o mesmo vídeo duas vezes e o som, chegando por último, apagava o clipe. Agora ele baixa uma vez só, como vídeo. As baixadas que ficaram só com o som completam sozinhas.' },
      { tipo: 'correcao', texto: 'O download não trava mais: se a conexão com o servidor para no meio do arquivo, o app pede de novo de onde parou (ou do começo), e o arquivo é conferido (inteiro e, no clipe, de vídeo) antes de ser guardado.' },
      { tipo: 'melhoria', texto: 'Mais rápido: duas músicas baixam ao mesmo tempo (antes uma por vez, e a que travava segurava a fila), e a procura do clipe antes do download espera menos.' },
      { tipo: 'melhoria', texto: 'A qualidade de áudio e de vídeo escolhida nos Ajustes vale: o clipe tenta duas vezes nela antes de aceitar uma menor (para a música não ficar sem ele), e o que veio numa qualidade menor é baixado de novo na escolhida, sozinho. "Atualizar os downloads" não apaga mais antes: cada arquivo só é trocado quando o novo chega inteiro, e a música continua tocando sem internet.' },
      { tipo: 'melhoria', texto: 'O download que ficou pela metade tenta se completar com mais insistência (em 2, 5, 15, 30 e 60 minutos) e, nas listas, aparece com a seta apagada até ficar completo (a verde é só com tudo no aparelho).' },
    ],
  },
  {
    versao: 534, data: '2026-11-05', titulo: 'A prévia da playlist só com clipes',
    itens: [
      { tipo: 'correcao', texto: 'A prévia da playlist (os clipes passando, como stories) e a capinha animada ao lado do baixar ainda mostravam as músicas sem clipe de verdade, como Blast Off, com a capa parada. Agora elas mostram só as músicas que têm clipe. Ao abrir a playlist, as músicas que ainda não tinham sido conferidas são conferidas na hora.' },
    ],
  },
  {
    versao: 533, data: '2026-11-05', titulo: 'O clipe volta para as músicas do K-pop',
    itens: [
      { tipo: 'correcao', texto: 'A música que tinha ficado sem clipe por engano (como Standing Next to You, do Jungkook) não voltava se ela fosse a última que você tocou: a conferência em segundo plano pulava a música que está no player, e desde a versão anterior a última tocada fica sempre lá. Agora ela só pula a que está tocando, e a música marcada sem clipe é conferida de novo assim que você abre ou toca ela: o clipe volta na hora e, se ela é baixada, o clipe é baixado de novo (com o servidor ligado e no Wi-Fi).' },
    ],
  },
  {
    versao: 532, data: '2026-11-05', titulo: 'A capa uma vez só',
    itens: [
      { tipo: 'melhoria', texto: 'No Tocando agora, a música sem capa animada (como as que não têm clipe) mostrava a capa duas vezes: a grande em cima e a pequena ao lado do nome. Agora fica só a grande, como no Spotify. Com a capa animada ou no modo vídeo, a pequena continua.' },
    ],
  },
  {
    versao: 531, data: '2026-11-05', titulo: 'Os clipes do K-pop',
    itens: [
      { tipo: 'correcao', texto: 'No K-pop o clipe oficial sai no canal da empresa (HYBE LABELS, SMTOWN, JYP, YG, 1theK…) e se chama "Official MV", e o app achava que músicas como Standing Next to You, do Jungkook, não tinham clipe. Agora esses canais e o "MV" contam como oficiais.' },
      { tipo: 'correcao', texto: 'As músicas que tinham ficado só música por isso são conferidas de novo, sozinhas; nas baixadas, o clipe volta a ser baixado.' },
    ],
  },
  {
    versao: 530, data: '2026-11-05', titulo: 'Só clipe de verdade',
    itens: [
      { tipo: 'correcao', texto: 'Músicas como Blast Off, do Bruno Mars, vinham com um "vídeo" que é só a capa da música parada. Agora o app reconhece esses vídeos (pelo nome, como "Official Audio" e "Topic", e pelas imagens do vídeo, que são todas iguais) e só aceita clipe de canal oficial (o do artista, o VEVO ou a gravadora; não o de fã). Ele procura o clipe oficial; Sem clipe oficial, a música fica só música: sem o ícone de vídeo nas listas, sem a capa animada (só a capa normal) e sem o "Mudar para vídeo".' },
      { tipo: 'correcao', texto: 'O clipe e o áudio oficial com os outros artistas no nome ("Bruno Mars, Anderson .Paak, Silk Sonic - Leave the Door Open") voltam a ser reconhecidos. As músicas que tinham perdido o áudio oficial por isso o procuram de novo, sozinhas.' },
      { tipo: 'melhoria', texto: 'As músicas que você já tinha, inclusive as baixadas, são conferidas sozinhas, em segundo plano. Nas baixadas, o clipe oficial achado é baixado; na que fica só música, o vídeo parado sai do aparelho (sobra mais espaço) e ela continua tocando sem internet, só com o som.' },
    ],
  },
  {
    versao: 529, data: '2026-11-05', titulo: 'A cifra certa da música',
    itens: [
      { tipo: 'correcao', texto: 'Algumas músicas vinham com a cifra de outra música com o mesmo nome (a primeira achada no Cifra Club). Agora o app confere a cifra pela letra da música: se não for ela, tenta as outras cifras com o mesmo título e fica com a que é da música. Se nenhuma for, a música fica só com a letra, em vez de uma cifra errada.' },
      { tipo: 'correcao', texto: 'Quando o app consegue ouvir a gravação (música baixada, áudio importado ou o seu servidor), ele confere também os acordes: se a cifra não casa com o som em nenhum tom, procura entre as outras cifras da mesma música uma que case e troca, avisando.' },
      { tipo: 'correcao', texto: 'As músicas que você já tinha são conferidas sozinhas, em segundo plano. A cifra que você escreveu ou editou nunca é trocada.' },
    ],
  },
  {
    versao: 528, data: '2026-11-05', titulo: 'A última música na barra e o app abrindo no Início',
    itens: [
      { tipo: 'melhoria', texto: 'A barra do player embaixo continua com a última música tocada mesmo depois de fechar o app ou de ele se atualizar: abrindo de novo, ela está lá, pausada no ponto em que parou, pronta para continuar (com a fila de antes).' },
      { tipo: 'melhoria', texto: 'Abrindo o app de novo, ele começa sempre no Início, e não na tela em que você estava ao sair. Voltando para ele depois de mais de 2 minutos fora (sem música tocando), também. Recarregando, você fica na mesma tela; os avisos e os links de uma música continuam abrindo direto nela, e uma edição em andamento não é largada.' },
    ],
  },
  {
    versao: 527, data: '2026-11-05', titulo: 'Os tons na cor da música',
    itens: [
      { tipo: 'melhoria', texto: 'No player, tocando no tom, abre a janela com os 12 tons juntos, pintada na cor da música como os desenhos dos acordes: o tom da tela aceso na cor dos acordes, o original da cifra e o da gravação marcados, e o meio tom acima e abaixo embaixo.' },
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
