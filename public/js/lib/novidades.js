// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 526, data: '2026-11-05', titulo: 'A cifra no tom da gravação e a tabela de tons',
    itens: [
      { tipo: 'novo', texto: 'A cifra no tom da música que toca: algumas cifras vêm em outro tom (quem escreveu tirou em outro, ou escreveu com o capotraste). O app ouve a gravação, compara as notas que soam com as dos acordes da cifra e, quando a resposta é clara, põe a cifra no tom da gravação, avisando ("Cifra no tom da gravação: D → E"). Ele ouve pelo arquivo baixado, pelo áudio que você importou ou pelo seu servidor; o tom que você escolher à mão nunca é mudado.' },
      { tipo: 'melhoria', texto: 'No player, o tom virou um botão só: tocando nele, abre a tabela com os 12 tons, com o original da cifra e o da gravação marcados, e o meio tom acima e abaixo embaixo.' },
      { tipo: 'melhoria', texto: 'As músicas baixadas que você já tinha são conferidas sozinhas, em segundo plano, e as que estavam em outro tom passam para o da gravação.' },
    ],
  },
  {
    versao: 525, data: '2026-11-05', titulo: 'O vídeo e a música são da mesma música',
    itens: [
      { tipo: 'correcao', texto: 'Muitas vezes o clipe vinha certo, mas o modo música tocava outra: a mesma música de outro artista, ou outra música com o nome dentro ("Beija-flor" no lugar de "Voa Beija-flor", um pot-pourri). Agora o áudio oficial e o clipe só valem quando são do artista certo e com o título exato; sem um assim, fica só o clipe.' },
      { tipo: 'correcao', texto: 'A cifra e a letra também: o título igual vem antes do parecido, e uma dupla como "Jorge & Mateus" não é mais confundida com outro "Jorge".' },
      { tipo: 'correcao', texto: 'As músicas que você já tinha são conferidas sozinhas, em segundo plano: o áudio de outra música sai, o certo é procurado, e a letra sincronizada e o download são refeitos. O áudio que você importou fica.' },
    ],
  },
  {
    versao: 524, data: '2026-11-05', titulo: 'O mesmo carregando no app todo',
    itens: [
      { tipo: 'melhoria', texto: 'Em todo o app, o carregando virou o contorno do que vai aparecer, com um brilho passando, no lugar exato: as linhas das músicas (artista, setores, acervo, orações, fontes, vídeos), as capas lado a lado (álbuns, trocar a capa), a capa grande do álbum e a foto redonda do artista, os parágrafos (Sobre o artista, oração) e a folha da partitura. Antes eram círculos girando com um texto embaixo.' },
      { tipo: 'melhoria', texto: 'Os cantos da Cindy Ferrarezi abrem como as músicas da busca: a tela do canto aparece na hora, com o contorno da letra.' },
    ],
  },
  {
    versao: 523, data: '2026-11-05', titulo: 'Sem o círculo girando ao abrir a música',
    itens: [
      { tipo: 'melhoria', texto: 'Ao tocar numa música da busca que ainda está sendo preparada, a tela dela abre na hora, com a cor, a capa, o nome e o contorno da letra, e se completa sozinha quando tudo chega. Antes aparecia um círculo girando no lugar dos botões da linha. A seta de voltar desiste da música e volta para a busca.' },
      { tipo: 'melhoria', texto: 'Com o player aberto, a música tocada vai direto para ele, e a linha só pulsa de leve enquanto ela é preparada.' },
    ],
  },
  {
    versao: 522, data: '2026-11-05', titulo: 'A música da busca abre na hora',
    itens: [
      { tipo: 'melhoria', texto: 'Na Busca, as primeiras músicas da lista já vão sendo preparadas enquanto você olha: a cifra, a letra, o vídeo, a letra sincronizada, o áudio oficial e a capa. Ao tocar numa delas, ela abre na hora, já com tudo sincronizado. As outras começam a ser preparadas no instante em que o dedo encosta. Com a economia de dados ligada, só a que você toca é preparada.' },
    ],
  },
  {
    versao: 521, data: '2026-11-05', titulo: 'A busca sem bolinhas girando',
    itens: [
      { tipo: 'melhoria', texto: 'Na Busca, enquanto você digita, o resultado anterior continua na tela (mais apagado) e uma linha fina corre embaixo da barra de busca. Quando chega o resultado novo, a tela troca de uma vez, sem pular. Antes cada seção (Artistas, Acervo, Músicas) apagava e ganhava uma bolinha girando.' },
      { tipo: 'melhoria', texto: 'Na primeira busca e em "Católicas em alta" e "Artistas católicos", aparece o contorno das capas e das linhas no lugar exato do que vai chegar. As músicas vêm primeiro, depois os artistas e o acervo.' },
      { tipo: 'melhoria', texto: 'No resto do app, o carregando virou três pontinhos discretos, no lugar do anel colorido girando.' },
    ],
  },
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
