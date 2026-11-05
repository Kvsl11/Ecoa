// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 520, data: '2026-11-05', titulo: 'As duplas não são mais separadas',
    itens: [
      { tipo: 'correcao', texto: 'Nas músicas de duplas, como "Voa Beija-flor" de Jorge & Mateus, o app separava os nomes e mostrava outros artistas: o "Sobre o artista" vinha com o Jorge Ben e as fotos de outras pessoas. Agora a dupla fica junta, com a foto, a apresentação e a capa dela. Quando "&" liga dois artistas diferentes (como "Anitta & Ludmilla"), o app confere e mostra cada um.' },
      { tipo: 'correcao', texto: 'As músicas de duplas que já estavam na biblioteca têm a capa automática conferida de novo, e as baixadas guardam de novo o "Sobre o artista" certo, sozinhas, em segundo plano. A capa escolhida por você fica.' },
    ],
  },
  {
    versao: 519, data: '2026-11-05', titulo: 'Voltar para a gaveta do perfil',
    itens: [
      { tipo: 'melhoria', texto: 'O que você abre pela gaveta do perfil (Novidades, Estatísticas, Recentes, Ajustes e o seu perfil) agora volta direto para a gaveta, aberta na tela em que você estava. Antes a seta de Novidades passava por Sobre e por Ajustes até chegar ao início.' },
    ],
  },
  {
    versao: 518, data: '2026-11-05', titulo: 'O botão do tamanho da letra não pisca mais',
    itens: [
      { tipo: 'correcao', texto: 'Na letra em tela cheia, o botão do tamanho da letra (o A pequeno e o A grande) e os outros botões ao lado piscavam um quadrado claro enquanto a letra corria. Agora ficam firmes.' },
    ],
  },
  {
    versao: 517, data: '2026-11-05', titulo: 'Estatísticas, Recentes por dia e a gaveta do perfil nova',
    itens: [
      { tipo: 'novo', texto: 'Estatísticas: veja quantos minutos você ouviu esta semana, o artista e a música mais ouvidos (com a lista completa de cada um), o gráfico de cada dia e, em "Seus últimos destaques", quanto você ouviu nos meses que passaram. Dá para compartilhar o resumo da semana.' },
      { tipo: 'novo', texto: 'Recentes: o que você tocou, separado por dia (Hoje, Ontem e as datas), com os repertórios juntos num item só. Os botões Músicas e Repertórios mostram só um tipo.' },
      { tipo: 'novo', texto: 'Sessão privada, nos Ajustes: enquanto estiver ligada, o que você ouve não entra nos Recentes nem nas Estatísticas.' },
      { tipo: 'melhoria', texto: 'A gaveta do perfil ficou como a do Spotify: o cartão com a sua foto e o "Ver perfil", e os atalhos Estatísticas, Recentes, Novidades e Ajustes e privacidade.' },
      { tipo: 'melhoria', texto: 'No alto dos Ajustes, três atalhos ligam e desligam na hora a economia de dados, a sessão privada e a capa animada. Com a conta Google, o botão Sair fica no fim da lista.' },
    ],
  },
  {
    versao: 516, data: '2026-11-05', titulo: 'A gaveta do perfil mais enxuta',
    itens: [
      { tipo: 'melhoria', texto: 'Na gaveta do perfil, saiu o cartão "Conta Google · Sincronizada agora": a sua conta já aparece lá em cima, com a foto e o e-mail. O cartão só volta se a sincronia der erro. Para sincronizar na hora, use "Ver perfil".' },
    ],
  },
  {
    versao: 515, data: '2026-11-05', titulo: 'O topo do perfil com as mesmas cores do "Tocou por último"',
    itens: [
      { tipo: 'correcao', texto: 'Na gaveta do perfil, o fundo lá em cima, atrás da sua foto, agora usa a mesma capa borrada do cartão "Tocou por último", e as cores dos dois ficam iguais (antes o topo ficava num tom diferente).' },
      { tipo: 'melhoria', texto: 'Os ícones de Novidades, Tocadas recentemente e Ajustes, na gaveta do perfil, agora ficam no cinza do app.' },
    ],
  },
  {
    versao: 514, data: '2026-11-05', titulo: 'O topo do perfil na cor da última música',
    itens: [
      { tipo: 'melhoria', texto: 'Na gaveta do perfil, o fundo lá em cima, atrás da sua foto e do seu nome, agora fica na cor da capa da música do "Tocou por último", combinando com o cartão dela.' },
    ],
  },
  {
    versao: 513, data: '2026-11-05', titulo: 'Os seguidores e as hashtags da prévia aparecem juntos',
    itens: [
      { tipo: 'melhoria', texto: 'Na prévia da playlist, os seguidores do artista e as hashtags da música aparecem juntos, de uma vez (antes as hashtags chegavam depois). Da segunda vez em diante, aparecem na hora.' },
    ],
  },
  {
    versao: 512, data: '2026-11-05', titulo: 'Os seguidores do artista na prévia da playlist, sempre atualizados',
    itens: [
      { tipo: 'melhoria', texto: 'Na prévia da playlist, embaixo do nome do artista, aparecem os seguidores dele: os do canal do YouTube, lidos na hora (41,2M seguidores).' },
      { tipo: 'correcao', texto: 'Os seguidores do Spotify saíram: o Spotify deixou de liberar esse número para apps como o Ecoa em 2026, e a cópia que havia estava meses atrasada. A opção de conectar o Spotify também saiu. Na tela do artista ficam os inscritos no YouTube e os fãs no Deezer, os dois atualizados.' },
    ],
  },
  {
    versao: 511, data: '2026-11-05', titulo: 'O carregando do "Sobre o artista" no meio da tela',
    itens: [
      { tipo: 'melhoria', texto: 'Em "Sobre o artista", as fotos mais novas vêm primeiro (a do canal do YouTube e a do Deezer), e as que podem ser antigas ficam para o fim. Com o Spotify conectado, a foto do artista é a do Spotify, a oficial de agora.' },
      { tipo: 'melhoria', texto: 'Ao abrir "Sobre o artista", o círculo de carregando fica no meio da tela (antes ficava lá em cima, com a tela vazia).' },
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
