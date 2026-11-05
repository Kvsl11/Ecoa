// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 511, data: '2026-11-05', titulo: 'O carregando do "Sobre o artista" no meio da tela',
    itens: [
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
  {
    versao: 505, data: '2026-11-04', titulo: 'A prévia da playlist ocupa a tela toda no tablet',
    itens: [
      { tipo: 'melhoria', texto: 'No tablet, a prévia da playlist (os clipes das músicas, um de cada vez, que abre pela capinha ao lado do baixar) ficava numa coluna estreita no meio da tela. Agora ela ocupa a tela toda, em pé e deitado, como no celular: o clipe preenche a tela, e o artista e o cartão da música ficam embaixo, maiores e mais fáceis de tocar.' },
    ],
  },
  {
    versao: 504, data: '2026-11-04', titulo: 'A gaveta do perfil de cara nova',
    itens: [
      { tipo: 'melhoria', texto: 'A gaveta que abre pela sua foto ficou mais moderna: o topo na cor da sua foto, com o seu nome, o e-mail e o botão Ver perfil; a sincronia com a conta Google numa linha só, com o botão de sincronizar ao lado (ele gira enquanto sincroniza); os números da biblioteca numa faixa; a última música tocada num cartão com a capa ao fundo e o botão de tocar; e o menu num cartão com ícones coloridos.' },
    ],
  },
  {
    versao: 503, data: '2026-11-04', titulo: 'O vídeo online não para mais por "outro dispositivo"',
    itens: [
      { tipo: 'correcao', texto: 'O vídeo que toca pela internet (sem estar baixado) parava muito com o aviso do YouTube de que a conta estava sendo usada em outros dispositivos. Era o próprio app: além do player que você ouve, ele abre outros do YouTube por baixo (a capa animada, o clipe esperando para a troca entre música e vídeo, a próxima música no crossfade, a prévia das playlists), e cada um contava como outra reprodução da sua conta ao mesmo tempo. Agora só o player que você ouve usa a sua conta do YouTube; os outros abrem sem conta e não contam.' },
    ],
  },
  {
    versao: 502, data: '2026-11-04', titulo: 'O clipe vem junto mesmo quando a música estava com o vídeo só de áudio',
    itens: [
      { tipo: 'correcao', texto: 'Algumas músicas, como Levitating, estavam salvas com o vídeo que é só o áudio: o "Topic" do YouTube Music, com a capa parada. Esse vídeo o YouTube nem deixa baixar como vídeo, e o download trazia só a música. Agora, antes de baixar, o app confere: se o vídeo é só o áudio, procura o clipe oficial (do canal do artista) e baixa o áudio e o clipe.' },
      { tipo: 'correcao', texto: 'As músicas que você já baixou assim ganham o clipe sozinhas, em segundo plano. Quando falta o clipe, o aviso do download agora diz o porquê.' },
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
