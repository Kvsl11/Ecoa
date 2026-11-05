// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
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
  {
    versao: 510, data: '2026-11-05', titulo: 'Os seguidores do Spotify direto do Spotify, e mais hashtags',
    itens: [
      { tipo: 'correcao', texto: 'Na prévia da playlist, a boca do cantor saía fora do tempo do som em algumas músicas baixadas: a prévia mostrava o clipe e tocava por cima o áudio oficial, que é outra gravação. Agora o som é sempre o do próprio clipe.' },
      { tipo: 'melhoria', texto: 'Na prévia da playlist, cada música ganhou de 6 a 10 hashtags, diferentes entre as músicas do mesmo artista: os estilos de verdade do artista (#pop, #funk), os temas da letra (#love song, #late night, #saudade), o clima da música e outras do estilo dela. Arraste para o lado para ver todas.' },
      { tipo: 'correcao', texto: 'Os seguidores no Spotify da tela do artista e da prévia da playlist estavam meses atrasados (o Bruno Mars aparecia com 70M, e no Spotify já passa de 90M): vinham de um site que guarda uma cópia antiga deles.' },
      { tipo: 'novo', texto: 'Agora eles vêm direto do Spotify, sempre os de agora: conecte a sua conta do Spotify uma vez em Ajustes → Spotify (o login é o do próprio Spotify). Sem conectar, os seguidores do Spotify não aparecem, e a tela do artista mostra o atalho para conectar.' },
    ],
  },
  {
    versao: 509, data: '2026-11-05', titulo: 'A prévia da playlist com os seguidores e as hashtags da música',
    itens: [
      { tipo: 'novo', texto: 'Na prévia da playlist (os clipes em tela cheia), embaixo do nome do artista aparecem os seguidores dele no Spotify, no jeito curto (90,3M seguidores). E, embaixo, as hashtags da música, que dizem a sensação dela (#happy, #upbeat, #good mood...): em inglês quando a música é cantada em inglês e em português nas outras. Quando são muitas, é só arrastar para o lado. Os botões de compartilhar e de mais opções ficam em pé, à direita.' },
      { tipo: 'melhoria', texto: 'As cores no fundo do cartão "Tocou por último", na gaveta do perfil, agora se mexem sempre do mesmo jeito, com a música tocando ou pausada.' },
    ],
  },
  {
    versao: 508, data: '2026-11-05', titulo: 'O "Tocou por último" não some mais',
    itens: [
      { tipo: 'correcao', texto: 'O "Tocou por último" da gaveta do perfil só mudava quando você abria a tela da música, e podia sumir. Agora conta qualquer música que começa a tocar (pelas listas, pela fila ou pelo play da própria gaveta), e, se a lista de tocadas estiver vazia, mostra a música que está no player.' },
    ],
  },
  {
    versao: 507, data: '2026-11-05', titulo: 'A prévia da playlist abre com som e o cartão ficou transparente',
    itens: [
      { tipo: 'melhoria', texto: 'Na prévia da playlist (os clipes em tela cheia), o cartão da música embaixo ficou transparente, mostrando o clipe por trás, com a capa um pouco maior. E a prévia já abre com som: para tirar, toque no alto-falante lá em cima.' },
      { tipo: 'melhoria', texto: 'Mudar a ordem das músicas em Editar playlist (e no repertório) agora tem o mesmo movimento da fila: a música que você segura sobe e acompanha o dedo, as outras deslizam por baixo para abrir espaço, e ao soltar ela desce até o lugar novo.' },
    ],
  },
  {
    versao: 506, data: '2026-11-05', titulo: 'O "Tocou por último" toca ali mesmo e ganhou movimento',
    itens: [
      { tipo: 'melhoria', texto: 'Na gaveta do perfil, as cores da capa no fundo do cartão "Tocou por último" agora se mexem devagar, sem parar. Com uma música tocando, elas correm mais rápido e o brilho pulsa de leve.' },
      { tipo: 'melhoria', texto: 'O botão de tocar desse cartão agora toca a música ali mesmo, sem sair da gaveta (ela aparece tocando no player), e vira o botão de pausar. Tocando no resto do cartão, a música abre, como antes.' },
      { tipo: 'correcao', texto: 'O triângulo do botão de tocar desse cartão estava puxado para a direita. Agora fica no centro da bola.' },
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
