// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 550, data: '2026-11-06', titulo: 'O nome certo nos vídeos relacionados',
    itens: [
      { tipo: 'correcao', texto: 'Alguns vídeos relacionados apareciam com o nome cortado: "Don\'t Stop \'Til You Get Enough", do Michael Jackson, virava "t Stop" (o apóstrofo era lido como aspas), e "Thriller (Official 4K Video)" virava "Thriller Video)". Agora o nome sai inteiro e sem os restos do "Official Video".' },
    ],
  },
  {
    versao: 549, data: '2026-11-06', titulo: 'Os cartões do Explorar sempre com foto',
    itens: [
      { tipo: 'correcao', texto: 'No Explorar do Tocando agora, o cartão "Parecidos com…" às vezes aparecia vazio (quando o primeiro artista parecido não tinha foto ou ela não carregava). Agora o app tenta a foto dos outros artistas parecidos, depois a do próprio artista e, no fim, a capa da música. Os cartões "Músicas de…" e "Parecidas com…" também não ficam mais vazios.' },
    ],
  },
  {
    versao: 548, data: '2026-11-06', titulo: 'Os vídeos relacionados tocam a música que você já tem',
    itens: [
      { tipo: 'correcao', texto: 'Nos vídeos relacionados do Tocando agora, tocar numa música que você já salvou (e baixou) abria uma cópia nova, só do YouTube, sem o download, a cifra e a letra sincronizada dela. Agora o app reconhece a música da sua biblioteca, pelo vídeo ou pelo nome e artista, e toca a sua (do aparelho, quando está baixada).' },
    ],
  },
  {
    versao: 547, data: '2026-11-06', titulo: 'Os downloads lembram o servidor e ficam mais rápidos',
    itens: [
      { tipo: 'correcao', texto: 'Ao sair do app ou recarregar a página, o app esquecia o servidor que estava baixando e dizia para ligar o servidor: nada baixava. Agora ele lembra o último servidor que atendeu e já abre com ele, e só troca se ele não responder.' },
      { tipo: 'correcao', texto: 'As músicas que estavam na fila para baixar (e a que estava baixando) eram esquecidas ao fechar o app. Agora a fila fica guardada e continua sozinha logo que o app abre de novo.' },
      { tipo: 'melhoria', texto: 'O servidor é achado bem mais rápido: todos os endereços são testados ao mesmo tempo, em vez de um por um (com o Codespace desligado, eram quase um minuto de espera a cada abertura).' },
      { tipo: 'melhoria', texto: 'Os downloads ficaram mais rápidos: o servidor prepara o som e o clipe ao mesmo tempo, o clipe oficial é procurado enquanto o servidor é conferido, e o servidor baixa do YouTube em pedaços (o YouTube segurava a velocidade). Se o servidor cai no meio, o app passa para outro na hora.' },
    ],
  },
  {
    versao: 546, data: '2026-11-05', titulo: 'O nome girando sem parar e os vídeos do artista',
    itens: [
      { tipo: 'melhoria', texto: 'O nome da música que não cabe gira num laço contínuo, como no Spotify: quando ele termina, o começo já vem logo atrás, depois de um espaço, sem voltar de uma vez para o início.' },
      { tipo: 'correcao', texto: 'Com o vídeo na barrinha de baixo, a primeira letra do nome aparecia meio apagada. Agora ela aparece inteira; só a ponta da direita some aos poucos.' },
      { tipo: 'melhoria', texto: 'Com o vídeo tocando, a barrinha de baixo fica como a do Spotify: em cima o nome da música (girando quando não cabe) e embaixo o artista, sem a linha do fone (o ícone do fone continua à direita). Só com o áudio, continua o nome e o artista em cima e o fone embaixo.' },
      { tipo: 'melhoria', texto: 'Os vídeos relacionados do Tocando agora abrem já no modo vídeo, com o nome da música e o artista certos: no K-pop o vídeo sai no canal da empresa (HYBE LABELS, SMTOWN), mas o artista é o do título ("Seven (feat. Latto)", do Jung Kook), e não a empresa. Só entram os vídeos de música do artista (sem propagandas, entrevistas e vídeos de fãs) e cada música uma vez só.' },
    ],
  },
  {
    versao: 545, data: '2026-11-05', titulo: 'A barrinha no tamanho certo e o deslizar para trocar',
    itens: [
      { tipo: 'correcao', texto: 'Na barrinha de baixo, o nome da música aparecia gigante (com o tamanho do título das playlists). Ele voltou ao tamanho normal e continua andando para o lado quando não cabe.' },
      { tipo: 'correcao', texto: 'Passar o dedo na barrinha de baixo para trocar de música, com a música já no meio, fazia ela voltar ao começo em vez de trocar. Agora, para a esquerda vai para a próxima e para a direita para a anterior, como no Spotify; no fim da fila, o app avisa.' },
      { tipo: 'melhoria', texto: 'Na barrinha de cima do Tocando agora, o fone aparece só uma vez, embaixo do nome (sem o ícone repetido ao lado do ✓), como no Spotify.' },
    ],
  },
  {
    versao: 544, data: '2026-11-05', titulo: 'O ícone de ouvir em outro aparelho',
    itens: [
      { tipo: 'melhoria', texto: 'O ícone de ouvir em outro aparelho ficou mais parecido com o do Spotify: um tracinho embaixo do celular (no lugar do ponto) e um vão separando o celular da caixa de som.' },
    ],
  },
  {
    versao: 543, data: '2026-11-05', titulo: 'A barrinha de baixo como a do Spotify e o fone',
    itens: [
      { tipo: 'melhoria', texto: 'O nome da música que não cabe anda devagar para o lado, numa linha só, e volta ao começo: na barrinha de baixo, no Tocando agora e na barrinha de cima.' },
      { tipo: 'melhoria', texto: 'Com um fone conectado, a barrinha de baixo fica como a do Spotify: o nome e o artista na mesma linha, o fone embaixo na cor do app e, à direita, o ícone do fone, o ✓ e o play. Sem fone, o ícone do fone não aparece.' },
      { tipo: 'melhoria', texto: 'No Tocando agora, o ícone do fone embaixo dos controles ficou do tamanho do botão de compartilhar.' },
      { tipo: 'novo', texto: 'Conectou o fone com o app aberto: aparece o aviso "Tocando em …" (e, ao desconectar, que o som voltou para o celular). Como o Android só diz "Bluetooth headset", dá para dar o nome do seu fone na folha Conectar, e ele aparece em todo lugar.' },
      { tipo: 'melhoria', texto: 'Com o vídeo tocando, a barrinha de baixo mostra o vídeo colado na borda, da altura dela, como no Spotify.' },
      { tipo: 'melhoria', texto: 'Ícones novos: o do fone e o de ouvir em outro aparelho (o celular atrás de uma caixa de som, como no Spotify).' },
      { tipo: 'correcao', texto: 'O Diagnóstico da música ficava com a lista dos pares do áudio e do clipe enchendo a tela e os botões de baixo tortos. Agora a lista mostra só o começo e o fim (o "Copiar" leva ela inteira) e os botões vão de ponta a ponta.' },
    ],
  },
  {
    versao: 542, data: '2026-11-05', titulo: 'A atualização do app sem falhar',
    itens: [
      { tipo: 'correcao', texto: 'Às vezes o app abria e não atualizava para a versão nova: bastava um dos arquivos do app não chegar (o servidor recusava um deles quando eram pedidos todos de uma vez) para a versão nova ser descartada até a próxima abertura. Agora cada arquivo é pedido de novo quando falha, em grupos menores, e a atualização que não deu certo tenta de novo sozinha em poucos segundos. Com o app aberto, ele também confere de 10 em 10 minutos se há versão nova.' },
    ],
  },
  {
    versao: 541, data: '2026-11-05', titulo: 'Baixar todas as músicas curtidas',
    itens: [
      { tipo: 'novo', texto: 'As Músicas curtidas ganharam o botão de baixar tudo, como nas playlists: um toque baixa todas as músicas salvas para ouvir sem internet; tocando enquanto baixa, o download pausa, e com todas baixadas o botão fica verde.' },
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
