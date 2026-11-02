// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 421, data: '2026-11-02', titulo: 'Músicas da busca numa coluna só',
    itens: [
      { tipo: 'melhoria', texto: 'Na Busca, as músicas e os vídeos aparecem sempre numa coluna só, um embaixo do outro, também no tablet e no computador (antes, na tela larga, ficavam em duas colunas).' },
    ],
  },
  {
    versao: 420, data: '2026-11-02', titulo: 'O app agora se chama Ecoa',
    itens: [
      { tipo: 'novo', texto: 'O Songbook Litúrgico agora se chama Ecoa: um nome curto para um app que é tanto para cantar na missa quanto para ouvir música, buscada na internet. A logo nova é uma nota musical com as ondas do som saindo dela, em branco sobre o fundo preto. A biblioteca, os repertórios e os downloads continuam todos aqui, sem mudar nada.' },
      { tipo: 'melhoria', texto: 'O ícone na tela inicial do celular e do tablet também muda (no Android, às vezes só depois de abrir o app de novo ou reinstalar o atalho).' },
    ],
  },
  {
    versao: 419, data: '2026-11-02', titulo: 'Busca no jeito do Spotify',
    itens: [
      { tipo: 'melhoria', texto: 'A Busca ficou como a do Spotify: a barra branca no alto e, embaixo, cards coloridos com o nome no canto e a foto de um artista inclinada. “Comece a navegar” traz os setores da missa em cards grandes; “Navegar por tudo”, os estilos musicais e as partes da missa (Entrada, Glória, Comunhão…). Os filtros só aparecem quando você digita.' },
      { tipo: 'novo', texto: 'Estilos musicais na Busca: Música católica, Sertanejo, Pop, Gospel, Samba e Pagode, MPB, Rock, Forró e Piseiro, Românticas, Funk, Rap e Hip-hop, Clássicos, K-pop, Eletrônica, Reggae e Infantil. Cada um abre uma página com os artistas e as mais tocadas, prontas para abrir com a cifra, a letra e o vídeo.' },
      { tipo: 'melhoria', texto: 'As Católicas em alta viraram uma fileira de capas que rola de lado, no lugar da lista em duas colunas.' },
    ],
  },
  {
    versao: 418, data: '2026-11-02', titulo: 'PDF e PowerPoint sobem do rodapé; topo sem bordas',
    itens: [
      { tipo: 'melhoria', texto: 'As opções de exportar em PDF e em PowerPoint (a escolha do tipo, o PowerPoint simples, o do modelo do grupo e a lista de cantos de cada momento) não flutuam mais no meio da tela: sobem do rodapé, como o menu dos três pontinhos, no celular, no tablet e no computador. Arrastando a alça para cima a janela cresce; para baixo, fecha. Os botões de gerar ficam sempre à vista, presos embaixo. O calendário continua como era.' },
      { tipo: 'correcao', texto: 'No tema claro, o degradê de cor no topo das telas (Início, Busca, Biblioteca, Músicas curtidas, Liturgia e as outras) vai até a borda da tela e desce até o branco, sem a margem branca e os cantos arredondados em volta da página.' },
    ],
  },
  {
    versao: 417, data: '2026-11-02', titulo: 'Uma cor para cada música',
    itens: [
      { tipo: 'melhoria', texto: 'O fundo da música (a letra, o player, o Sobre o artista) não se repete mais tanto: o app guarda as cores fortes de cada capa ou vídeo (até 4) e cada música escolhe uma delas, com um toque só dela no tom, na intensidade e no brilho. Capas parecidas, como as dos clipes, davam sempre o mesmo roxo ou o mesmo laranja; agora são centenas de variações, sempre escuras o bastante para ler a letra em branco. A mesma música tem sempre a mesma cor.' },
      { tipo: 'melhoria', texto: 'Sem capa, a cor pelo nome da música também ganhou mais variações.' },
    ],
  },
  {
    versao: 416, data: '2026-11-02', titulo: 'Tema claro sem bordas',
    itens: [
      { tipo: 'correcao', texto: 'No tema claro, sumiu a moldura cinza-clara em volta do app (bem à vista em volta do player escuro), e o degradê do topo das páginas, que virava uma faixa azul-acinzentada, ficou suave, na cor da tela.' },
      { tipo: 'melhoria', texto: 'O “Tocando agora” na tela toda, no tablet, vai de ponta a ponta, sem margem em volta; no tema claro, o painel do player aberto ao lado também encosta na borda.' },
      { tipo: 'correcao', texto: 'Com o painel do player aberto ao lado, os atalhos do Início e a grade da Biblioteca não ficam mais espremidos: as colunas seguem a largura da página (2 quando ela é estreita, até 4 quando é larga).' },
    ],
  },
  {
    versao: 415, data: '2026-11-02', titulo: 'Busca das Músicas curtidas rola com a página',
    itens: [
      { tipo: 'correcao', texto: 'Nas Músicas curtidas, a busca não fica mais presa no topo (com a faixa azul por cima das músicas): ela fica no alto da página e some ao rolar, como no Spotify.' },
    ],
  },
  {
    versao: 414, data: '2026-11-02', titulo: 'Repertórios e Músicas curtidas no jeito do Spotify',
    itens: [
      { tipo: 'melhoria', texto: 'Dentro do repertório e da playlist, a página ficou como a de uma playlist do Spotify: a capa grande no meio, o nome, o tipo e a data, a duração, os botões de baixar e editar à esquerda e o aleatório e o play à direita. As ações (Adicionar, Criar música, a data, PDF, PowerPoint, Selecionar e Excluir) viraram chips numa linha que rola de lado.' },
      { tipo: 'melhoria', texto: 'As Músicas curtidas ficaram como as do Spotify: o degradê azul, a busca e a ordem (Recentes ou A–Z) no alto, o nome e a quantidade, o aleatório e o play, os filtros em chips e a linha “Adicionar a esta playlist” antes das músicas.' },
      { tipo: 'novo', texto: 'Botão de aleatório nas duas páginas: ligado, o play começa por uma música qualquer e a fila segue embaralhada (é o mesmo aleatório do player).' },
    ],
  },
  {
    versao: 413, data: '2026-11-02', titulo: 'Biblioteca no jeito do Spotify',
    itens: [
      { tipo: 'melhoria', texto: 'A Biblioteca ficou como a do Spotify: as capas em grade, com o nome e “Repertório • 3 músicas” embaixo. As suas músicas salvas não ficam mais soltas: ficam dentro de “Músicas curtidas”, o card do coração fixado no topo (com o alfinete verde), junto com o das Baixadas. Depois vêm os seus repertórios e playlists.' },
      { tipo: 'novo', texto: 'Na Biblioteca, os chips Repertórios, Playlists e Artistas filtram a estante (Artistas mostra os artistas das suas músicas em fotos redondas). Dá para ordenar por Recentes ou em ordem alfabética e trocar entre grade e lista; a escolha fica guardada.' },
    ],
  },
  {
    versao: 412, data: '2026-11-02', titulo: 'Artista certo ao tocar na foto',
    itens: [
      { tipo: 'correcao', texto: 'Tocar no artista (nos créditos, no Explorar ou em Seus artistas) abre a página dele mesmo, e não a de outro artista de nome parecido: o Justice abria a página da Victoria Justice. Primeiro vale o nome igual; um nome de uma palavra só não é mais confundido com o de outra pessoa que tenha essa palavra no nome.' },
      { tipo: 'correcao', texto: 'As músicas já salvas que ficaram com a foto do artista errado (de outro nome parecido) perdem essa foto sozinhas, e a do artista certo é procurada de novo.' },
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
