// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
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
  {
    versao: 484, data: '2026-11-04', titulo: 'As playlists no jeito do Spotify',
    itens: [
      { tipo: 'novo', texto: 'As playlists que você cria ganharam a página do Spotify: a capa grande no meio (ela encolhe ao rolar), o nome, a descrição, "Você" e a duração. Embaixo ficam a capinha, baixar e compartilhar, e à direita o aleatório e o play. Os chips são Adicionar, Mix, Vídeo, Editar, Nome e detalhes e Ordenar.' },
      { tipo: 'novo', texto: 'A capinha ao lado do baixar abre a prévia: as músicas em tela cheia, uma de cada vez, com o clipe rodando um trecho de 30 s. Arraste para cima para passar para a próxima. O alto-falante liga o som, e tocar no cartão da música toca a playlist a partir dela.' },
      { tipo: 'novo', texto: '"Editar" abre uma tela para tirar músicas (⊖), mudar a ordem (segure e arraste) e selecionar várias de uma vez. Nada muda até tocar em Salvar. "Nome e detalhes" muda a capa, o nome e a descrição.' },
      { tipo: 'novo', texto: '"Vídeo" mostra as faixas com a imagem do clipe. "Mix" faz as músicas se emendarem, como num DJ. "Ordenar" mostra por título, artista ou pelas adicionadas por último, sem mudar a ordem da playlist. O ⋮ do topo tem compartilhar, trocar a capa, baixar, adicionar a outra playlist, transformar em repertório e excluir.' },
    ],
  },
  {
    versao: 483, data: '2026-11-04', titulo: 'A Biblioteca no jeito do Spotify',
    itens: [
      { tipo: 'novo', texto: 'A Biblioteca ganhou o topo do Spotify: o ícone do app (abre os Ajustes), "Sua biblioteca", a lupa e o +. A lupa abre a busca numa tela só dela, que acha repertórios, playlists, artistas e músicas salvas. O + cria um repertório, uma playlist ou uma música, ou importa arquivos.' },
      { tipo: 'novo', texto: 'Os chips agora são Repertórios, Playlists, Artistas e Baixadas, numa fileira que rola de lado. Ao escolher um, fica só ele aceso, com o X para voltar a tudo.' },
      { tipo: 'novo', texto: 'Em "Recentes", toque para escolher a ordem: Recentes, Adicionados recentemente, Ordem alfabética ou Criador. O botão ao lado troca entre grade e lista.' },
      { tipo: 'melhoria', texto: 'A grade mostra três por linha no celular, com os artistas em fotos redondas misturados aos repertórios e às playlists. Músicas curtidas e Baixadas continuam fixadas no começo. Para excluir repertórios, segure o dedo num deles.' },
    ],
  },
  {
    versao: 482, data: '2026-11-04', titulo: 'A foto certa do artista',
    itens: [
      { tipo: 'correcao', texto: 'Alguns artistas apareciam com uma foto que não era deles. O Justice, por exemplo, vinha com uma estátua da Justiça. Quando não achava a foto em outro lugar, o app pegava a da página da Wikipédia com o mesmo nome, e "Justice" é a página do conceito de justiça. Agora só vale a página que é mesmo do artista, como "Justice (band)", e as fotos do "Sobre o artista" vêm dela. As músicas já salvas com a foto errada ganham a foto certa sozinhas.' },
    ],
  },
  {
    versao: 481, data: '2026-11-04', titulo: 'A letra sem atraso',
    itens: [
      { tipo: 'correcao', texto: 'Em algumas músicas, a letra sincronizada vinha uns segundos atrasada, como em "Club Tropicana" (Wham!), uns 4,5 s. O LRCLIB tem edições da mesma música feitas para gravações um pouco diferentes (o áudio oficial tem 266 s, e a maioria das edições, 268 a 270 s), e o app ficava com a mais repetida. Agora, assim que o app sabe a duração do áudio que toca, ele usa a edição feita para ela. As músicas já salvas são corrigidas sozinhas; a letra que você sincronizou à mão fica como está.' },
    ],
  },
  {
    versao: 480, data: '2026-11-04', titulo: 'A letra no tempo certo em mais músicas',
    itens: [
      { tipo: 'correcao', texto: 'Em algumas músicas, uma linha da letra sincronizada aparecia bem antes de ser cantada. Em "Club Tropicana" (Wham!), a primeira frase acendia uns 40 s antes da hora; em "Everything She Wants", o "Ah, ha-ha" e "Some people work for a living" chegavam adiantados. O LRCLIB tem várias edições da mesma letra, e as mais repetidas traziam essa linha errada. Agora o app compara as edições: a linha fora do lugar vai para onde as outras concordam que ela é cantada, sem precisar do servidor da IA.' },
      { tipo: 'correcao', texto: 'As músicas já salvas são corrigidas sozinhas, em segundo plano. A letra que você sincronizou à mão fica como está.' },
    ],
  },
  {
    versao: 479, data: '2026-11-04', titulo: 'O microfone do karaokê nas listas',
    itens: [
      { tipo: 'novo', texto: 'Nas listas de músicas (Músicas curtidas, a Biblioteca, os repertórios), o microfone com as estrelinhas aparece ao lado da setinha verde nas músicas que já têm o karaokê pronto no aparelho. Ele aparece assim que o karaokê fica pronto e some se você apagar o karaokê.' },
    ],
  },
  {
    versao: 478, data: '2026-11-04', titulo: 'O microfone do karaokê no ⋮',
    itens: [
      { tipo: 'melhoria', texto: 'No ⋮ do Tocando agora, a opção "Karaokê (tirar a voz)" agora tem o mesmo microfone com as estrelinhas do botão de karaokê da letra, em vez do microfone simples.' },
    ],
  },
  {
    versao: 477, data: '2026-11-04', titulo: 'Ícone de importar para cima',
    itens: [
      { tipo: 'melhoria', texto: 'O botão de importar da Busca (e o "Cole aqui", o "Colar copiado" e o "Trazer da internet" do editor) agora tem a seta para cima, como o importar da Biblioteca e dos Ajustes. Antes a seta apontava para baixo, como a de baixar.' },
    ],
  },
  {
    versao: 476, data: '2026-11-04', titulo: 'Servidor da IA mais claro',
    itens: [
      { tipo: 'melhoria', texto: 'A tela do Servidor da IA não fala mais em "sem a cota do mês" quando o Codespace está ligado: o app acha o Codespace sozinho, sem QR code, e o aviso de cota de antes some assim que ele responde.' },
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
