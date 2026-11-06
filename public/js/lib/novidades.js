// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 553, data: '2026-11-06', titulo: 'O Explorar sempre responde e o tablet mais bem acabado',
    itens: [
      { tipo: 'correcao', texto: 'No Explorar do Tocando agora, "Parecidos com…" e "Parecidas com…" às vezes não abriam nada (com o Justice, por exemplo): o Deezer recusava os pedidos feitos todos de uma vez ao abrir a tela, e o app guardava a resposta vazia como se não houvesse parecidos. Agora o pedido é refeito, e, se mesmo assim não vier nada, os cartões mostram outra sugestão (os artistas da rádio do artista, as músicas mais ouvidas dele) ou abrem as músicas do artista.' },
      { tipo: 'melhoria', texto: 'No tablet (em pé ou deitado), o Diagnóstico da música sobe do rodapé, como os ⋮, em vez de abrir no meio da tela.' },
      { tipo: 'melhoria', texto: 'No painel do lado do tablet, a barrinha de cima (o nome da música, o artista, o ✓ e o play, que aparece ao rolar) ficou um pouco mais alta, e o nome não encosta mais na borda esquerda.' },
      { tipo: 'melhoria', texto: 'No tablet, com o player recolhido, o vídeo da barrinha de baixo fica colado na borda esquerda do cartão e com a altura toda dele, sem a margem em volta, como no celular e no Spotify.' },
    ],
  },
  {
    versao: 552, data: '2026-11-06', titulo: 'No tablet: a barra das prévias inteira e os tons no rodapé',
    itens: [
      { tipo: 'melhoria', texto: 'No tablet (em pé ou deitado), a janela "Escolher o tom" sobe do rodapé, como no celular, em vez de abrir no meio da tela por cima da cifra. Arraste a alça para baixo para fechar.' },
      { tipo: 'melhoria', texto: 'Nas prévias, no tablet (em pé ou deitado), o artista, as hashtags e o cartão da música vão de uma ponta à outra da tela, embaixo, em vez de ficarem numa coluna estreita à esquerda.' },
    ],
  },
  {
    versao: 551, data: '2026-11-06', titulo: 'Os artistas parecidos levam à página deles',
    itens: [
      { tipo: 'correcao', texto: 'No Explorar do Tocando agora, tocar num artista dos "Parecidos com…" não abria a página dele (as músicas e os álbuns): o app abria e logo voltava. O mesmo acontecia com as pessoas dos créditos ("Mostrar tudo" e "Por trás da música"). Agora a página do artista abre no lugar do Tocando agora.' },
    ],
  },
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
