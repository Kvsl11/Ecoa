// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 412, data: '2026-11-02', titulo: 'Artista certo ao tocar na foto',
    itens: [
      { tipo: 'correcao', texto: 'Tocar no artista (nos créditos, no Explorar ou em Seus artistas) abre a página dele mesmo, e não a de outro artista de nome parecido: o Justice abria a página da Victoria Justice. Primeiro vale o nome igual; um nome de uma palavra só não é mais confundido com o de outra pessoa que tenha essa palavra no nome.' },
      { tipo: 'correcao', texto: 'As músicas já salvas que ficaram com a foto do artista errado (de outro nome parecido) perdem essa foto sozinhas, e a do artista certo é procurada de novo.' },
    ],
  },
  {
    versao: 411, data: '2026-11-02', titulo: 'Lumen em tela cheia',
    itens: [
      { tipo: 'melhoria', texto: 'Ao entrar no Lumen, o menu (o de baixo no celular e no tablet, o lateral no computador) e o player somem, e a tela fica só com a conversa. Eles voltam quando você sai pela seta lá em cima. A música que estiver tocando continua tocando.' },
    ],
  },
  {
    versao: 410, data: '2026-11-02', titulo: 'Início no jeito do Spotify',
    itens: [
      { tipo: 'melhoria', texto: 'A página inicial ficou parecida com a do Spotify: no topo, os filtros Tudo, Músicas, Repertórios e Liturgia mostram só o que você escolher; os atalhos ficam em 4 colunas no tablet; os repertórios aparecem como os “mixes”, com a capa grande e o nome numa faixa colorida; as Recentes ficam menores; o próximo repertório ganha um cartão largo com o botão de tocar; e os artistas da sua biblioteca aparecem em fotos redondas.' },
      { tipo: 'melhoria', texto: 'Como no Spotify, a barra de rolagem não aparece mais em nenhuma tela do app (a rolagem continua normal).' },
    ],
  },
  {
    versao: 409, data: '2026-11-01', titulo: 'Balão do acorde na cor da música',
    itens: [
      { tipo: 'melhoria', texto: 'Na cifra em tela cheia, o balão que abre ao tocar num acorde tem agora o mesmo fundo dos diagramas da faixa (a cor da música), com o desenho em branco e os dedos e o nome na cor dos acordes, no lugar do fundo cinza.' },
    ],
  },
  {
    versao: 408, data: '2026-11-01', titulo: '“Diagrama dos acordes”',
    itens: [
      { tipo: 'melhoria', texto: 'Nos Ajustes, a opção “Desenho dos acordes” agora se chama “Diagrama dos acordes” (também nos avisos de ligar e desligar e no botão da cifra).' },
    ],
  },
  {
    versao: 407, data: '2026-11-01', titulo: 'Ícone novo para o desenho dos acordes',
    itens: [
      { tipo: 'melhoria', texto: 'O botão do desenho dos acordes (na cifra em tela cheia e nos Ajustes) ganhou um ícone que é o próprio desenho de um acorde: o braço do violão com as 6 cordas, as casas e os dedos (um Lá menor), no lugar dos quadradinhos.' },
    ],
  },
  {
    versao: 406, data: '2026-11-01', titulo: 'Acorde que soa na hora',
    itens: [
      { tipo: 'correcao', texto: 'O som do acorde sai na hora do toque: as notas do violão dos acordes da música já vão sendo preparadas quando a faixa dos desenhos aparece, e o silêncio do começo de cada gravação foi tirado.' },
      { tipo: 'correcao', texto: 'Rolando a faixa dos desenhos até o fim, o último acorde aparece inteiro (antes ficava meio apagado na borda).' },
    ],
  },
  {
    versao: 405, data: '2026-11-01', titulo: 'Violão de verdade nos acordes',
    itens: [
      { tipo: 'melhoria', texto: 'O som do acorde agora é de um violão de nylon de verdade, gravado nota por nota, no lugar do som feito pelo aparelho (que tinha chiado). Na primeira vez que um acorde toca, as notas dele são baixadas; depois ficam guardadas e tocam também sem internet.' },
      { tipo: 'correcao', texto: 'Arrastar para o lado a faixa dos desenhos dos acordes (ou a das ferramentas) não troca mais de música no repertório.' },
    ],
  },
  {
    versao: 404, data: '2026-11-01', titulo: 'Ouça o acorde no violão',
    itens: [
      { tipo: 'novo', texto: 'Tocar no desenho de um acorde faz ele soar no violão, corda por corda, como uma batida para baixo: na faixa dos acordes da cifra em tela cheia, no balão que abre ao tocar num acorde da cifra (que já toca ao abrir) e nos desenhos da página da música. Com capotraste, soa no tom de verdade.' },
    ],
  },
  {
    versao: 403, data: '2026-11-01', titulo: 'Desenho dos acordes na cifra',
    itens: [
      { tipo: 'correcao', texto: 'O desenho dos acordes (Ajustes) volta a aparecer: na letra com a cifra em tela cheia, uma faixa logo abaixo dos botões mostra como montar cada acorde da música, no tom e no capotraste escolhidos. Tocar num acorde da cifra mostra o desenho dele.' },
      { tipo: 'novo', texto: 'Um botão ao lado do Rolar liga e desliga o desenho dos acordes ali mesmo, sem ir aos Ajustes.' },
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
