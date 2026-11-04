// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 499, data: '2026-11-04', titulo: 'Uma tela de entrada nova',
    itens: [
      { tipo: 'melhoria', texto: 'A tela de entrada ficou nova. No fundo, um mural com quadros de clipes famosos passa devagar, em fileiras inclinadas: Michael Jackson, The Beatles, Bruno Mars, Lady Gaga, Sabrina Carpenter, Queen e outros. No alto, aparece o nome de um dos clipes, trocando de tempos em tempos. Na frente ficam o "Ouça. Cante. Ecoe.", o que o app tem e o botão Entrar com o Google. No computador, o convite fica à esquerda e o mural ocupa o resto da tela.' },
    ],
  },
  {
    versao: 498, data: '2026-11-04', titulo: 'O carregamento como no Spotify',
    itens: [
      { tipo: 'melhoria', texto: 'Enquanto uma tela ou parte dela ainda está carregando, aparece só o círculo girando no meio, na cor do app, como no Spotify, no lugar dos textos "Carregando…" e "Buscando…". Vale em todas as telas: Busca, Início, Liturgia, Orações, artistas, álbuns, partituras e as outras.' },
      { tipo: 'melhoria', texto: 'Na Busca, ao tocar numa música, os textos que apareciam e sumiam embaixo do nome ("Trazendo a cifra e a letra…", "Sincronizando a letra…") saíram: fica só o círculo girando na linha até a música abrir. No Início, o aviso "buscando sugestões…" da liturgia de hoje também saiu, e na música a procura da letra sincronizada aparece só com o círculo.' },
    ],
  },
  {
    versao: 497, data: '2026-11-04', titulo: 'Ícones novos no menu do perfil',
    itens: [
      { tipo: 'melhoria', texto: 'O menu ⋯ do perfil ganhou ícones novos: a seta saindo da caixa para compartilhar, as duas setas para sincronizar e a porta com a flecha, em vermelho, para sair da conta. O seu e-mail aparece embaixo do nome.' },
    ],
  },
  {
    versao: 496, data: '2026-11-04', titulo: 'A tela de entrada do Ecoa',
    itens: [
      { tipo: 'novo', texto: 'O Ecoa agora abre com uma tela de entrada: para usar o app, entre com a sua conta Google. Você entra uma vez e continua entrado no aparelho, mesmo fechando o app, até tocar em Sair da conta (no ⋯ do seu perfil).' },
      { tipo: 'correcao', texto: 'A sua foto de perfil aparece também no topo da Biblioteca, no lugar do logo do Ecoa, como no Início, na Busca, nas Partituras e na Liturgia. Tocando nela, abre a gaveta do perfil.' },
      { tipo: 'melhoria', texto: 'Nas suas playlists e repertórios, onde estava o logo do Ecoa e "Você", agora aparecem a sua foto e o seu nome, como no Spotify.' },
      { tipo: 'melhoria', texto: 'No Início, a engrenagem dos Ajustes saiu do topo: os Ajustes ficam na gaveta que abre ao tocar na sua foto e no seu perfil, como no Spotify.' },
    ],
  },
  {
    versao: 495, data: '2026-11-04', titulo: 'Entre com o Google e tenha o seu perfil',
    itens: [
      { tipo: 'novo', texto: 'Agora dá para entrar com a sua conta Google. As suas músicas, os repertórios e as tocadas recentemente ficam guardados na conta: abra o Ecoa no celular, no tablet ou no computador e está tudo lá, e nada se perde se o navegador for limpo. Os downloads continuam sendo de cada aparelho.' },
      { tipo: 'novo', texto: 'A sua foto aparece no canto de cima, como no Spotify. Tocando nela, abre a gaveta do perfil, com as suas informações: o e-mail da conta e quando ela sincronizou, quantas músicas curtidas, repertórios, artistas e baixadas você tem, a música que você tocou por último e a versão do app. Embaixo ficam Ver perfil, Novidades, Tocadas recentemente e Ajustes.' },
      { tipo: 'novo', texto: 'A página do perfil tem o topo na cor da sua foto, o seu nome com quantos repertórios e músicas você tem, os botões Editar (para mudar o nome), Ajustes e ⋯ (Compartilhar o Ecoa, Sincronizar agora, Sair da conta), os seus repertórios e os artistas que você tocou recentemente.' },
    ],
  },
  {
    versao: 494, data: '2026-11-04', titulo: 'O karaokê entra sem travar a música',
    itens: [
      { tipo: 'correcao', texto: 'Ao tocar no microfone do karaokê, a música dava uma travada: sumia por quase um segundo e voltava. No celular, mais ainda com fone Bluetooth, o som do karaokê leva um instante para começar a sair, e o app baixava a música antes disso. Agora a música segue tocando normal até o karaokê estar soando de verdade, e só então uma passa para a outra, sem buraco.' },
    ],
  },
  {
    versao: 493, data: '2026-11-04', titulo: 'O botão de tela inteira aparece ao tocar no vídeo',
    itens: [
      { tipo: 'melhoria', texto: 'No Tocando agora, o botão de ver o vídeo na tela inteira fica escondido e aparece por uns 3 segundos quando você toca no vídeo, como no Spotify e no YouTube. Tocar de novo mostra outra vez. O mesmo vale na página da música e no painel do tablet. Na barrinha do player, embaixo, ele continua sempre à vista.' },
    ],
  },
  {
    versao: 492, data: '2026-11-04', titulo: 'O contorno da capinha dá duas voltas',
    itens: [
      { tipo: 'melhoria', texto: 'Ao entrar na playlist, o contorno da capinha da prévia agora faz a animação do Spotify. Ele dá duas voltas: na primeira, dois traços correm em volta da tela e somem; na segunda, voltam e crescem até fechar o contorno. Só depois o cartão de trás sai girando.' },
      { tipo: 'melhoria', texto: 'O cartão de trás ficou um pouco mais recolhido atrás da tela.' },
    ],
  },
  {
    versao: 491, data: '2026-11-04', titulo: 'O cartão inclinado e a sombra da capinha',
    itens: [
      { tipo: 'melhoria', texto: 'O cartão atrás da capinha da prévia agora fica inclinado, como no Spotify: no alto ele aparece à direita da tela e, embaixo, fica escondido atrás dela. Ao entrar na playlist, ele sai girando até ficar nessa posição.' },
      { tipo: 'melhoria', texto: 'A capinha ganhou a faixa escura em volta da tela, a sombra que separa a tela do cartão de trás, como no Spotify. O contorno e o cartão ficaram nos tons de cinza-azulado dele.' },
    ],
  },
  {
    versao: 490, data: '2026-11-04', titulo: 'A capinha da prévia ao entrar na playlist',
    itens: [
      { tipo: 'melhoria', texto: 'Ao entrar na playlist, a capinha da prévia faz a animação do Spotify. Ela já começa mostrando a primeira música, e não mais a capa da playlist. O contorno claro se desenha em volta e, no fim, o cartão de trás desliza para a direita.' },
      { tipo: 'melhoria', texto: 'A capinha ficou no tamanho e na proporção da do Spotify, um pouco mais estreita e alta que antes.' },
      { tipo: 'melhoria', texto: 'O app guarda no aparelho a medida das faixas pretas de cada clipe. Assim, a capinha e a prévia não precisam medir de novo, e o vídeo entra mais rápido.' },
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
