// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
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
  {
    versao: 501, data: '2026-11-04', titulo: 'O download traz sempre o áudio e o clipe',
    itens: [
      { tipo: 'correcao', texto: 'Muitas músicas baixavam só o áudio, sem o videoclipe. O clipe é o arquivo grande e falhava às vezes (o servidor demorava, o YouTube não entregava aquela qualidade), e o app desistia na primeira vez. Agora cada arquivo tenta até 3 vezes, e o vídeo desce de qualidade a cada tentativa (muito alta, alta, normal) para vir sempre junto.' },
      { tipo: 'correcao', texto: 'Se ainda assim o clipe não vier, o download tenta de novo sozinho daqui a alguns minutos e também ao abrir o app. As músicas que você já tinha baixado só com o áudio ganham o clipe sozinhas, em segundo plano, sem precisar apagar o download e baixar de novo. O que já tinha vindo fica.' },
    ],
  },
  {
    versao: 500, data: '2026-11-04', titulo: 'Os artistas em destaque no mural da entrada',
    itens: [
      { tipo: 'correcao', texto: 'No mural da tela de entrada, o Billie Jean aparecia todo preto: os quadros que o YouTube tira desse clipe são pretos. Agora cada clipe mostra só os quadros que têm imagem, e o Billie Jean aparece com a capa do vídeo.' },
      { tipo: 'novo', texto: 'Justin Bieber entrou no mural da tela de entrada, com Baby, Peaches e What Do You Mean?.' },
      { tipo: 'melhoria', texto: 'O mural ficou com os artistas em destaque. Cada clipe mostra só os quadros em que o artista aparece, como o Michael de monstro, de olhos amarelos, no Thriller. O nome do artista aparece grande em cada quadro, com a música embaixo, e também no alto da tela.' },
    ],
  },
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
