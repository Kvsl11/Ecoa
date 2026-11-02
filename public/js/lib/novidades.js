// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 428, data: '2026-11-02', titulo: 'Tablet sem piscar ao abrir',
    itens: [
      { tipo: 'correcao', texto: 'No tablet, em pé ou deitado, ao abrir ou atualizar o app aparecia por um instante o jeito do computador, com o menu na lateral, antes de ele trocar para o menu de baixo. Agora o tablet já abre com a aparência dele.' },
    ],
  },
  {
    versao: 427, data: '2026-11-02', titulo: 'Selo “E” nas músicas com convidado',
    itens: [
      { tipo: 'correcao', texto: 'O “E” de explícita não aparecia em músicas cadastradas no nome do artista convidado, como “I Like You (A Happier Song)”, que o Cifra Club põe na Doja Cat e é do Post Malone com ela. Agora a música é reconhecida pelo “feat.” e por quem canta nela, e o selo (e a capa do álbum) aparece.' },
      { tipo: 'melhoria', texto: '“Trocar o vídeo” e “Trocar música” abrem numa folha que sobe do rodapé, como os menus dos três pontos, e não mais numa janela solta no meio da tela.' },
    ],
  },
  {
    versao: 426, data: '2026-11-02', titulo: 'Foto do artista certa no “ver mais”',
    itens: [
      { tipo: 'correcao', texto: 'Às vezes, ao tocar em “ver mais” no cartão do artista, a foto principal (a mesma do cartão) sumia e a segunda foto da sequência ficava no lugar dela. Acontecia quando a mesma foto chegava de dois lugares e a do cartão terminava de carregar por último. Agora a foto do cartão é sempre a primeira, no celular, no tablet e no computador.' },
    ],
  },
  {
    versao: 425, data: '2026-11-02', titulo: 'Mini player do tablet deitado só sobe',
    itens: [
      { tipo: 'correcao', texto: 'No tablet deitado, a barrinha do que está tocando era mais larga que o painel “Tocando agora”: ao tocar nela ou puxá-la para cima, ela encolhia para o lado antes de subir. Agora ela tem a mesma largura do painel e, ao abrir, só sobe.' },
    ],
  },
  {
    versao: 424, data: '2026-11-02', titulo: 'Sem tela preta ao sair da música',
    itens: [
      { tipo: 'correcao', texto: 'Às vezes, ao sair da música, a tela ficava toda preta, só com a seta de voltar no topo. Acontecia quando o celular fechava o app em segundo plano e, ao voltar, ele abria de novo direto na música: não havia página antes dela para onde voltar. Agora o app vai para a lista de onde a música veio (a Biblioteca, por exemplo).' },
    ],
  },
  {
    versao: 423, data: '2026-11-02', titulo: 'Partes da música sempre em inglês',
    itens: [
      { tipo: 'correcao', texto: 'Na letra e na cifra, nomes como “Primeiro Refrão”, “Segundo Refrão”, “Segundo Verso” ou “2º Refrão” voltavam a aparecer em português. Agora viram Chorus 1, Chorus 2, Verse 2… e “Último Refrão” vira Final Chorus, também nas músicas que você já tinha salvo.' },
    ],
  },
  {
    versao: 422, data: '2026-11-02', titulo: 'Fila inteira na folha esticada',
    itens: [
      { tipo: 'correcao', texto: 'Na Fila, ao puxar a folha para cima (deixando-a quase da tela toda), as músicas de baixo ficavam cortadas e sobrava um espaço vazio no pé da folha. Agora a lista ocupa a folha inteira, no celular e no tablet.' },
    ],
  },
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
