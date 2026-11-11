// O que mudou em cada versão do app, em registro técnico e formal (a causa, o que foi alterado e o efeito, com os
// números medidos quando houver; impessoal, sem gíria). A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 649, data: '2026-11-11', titulo: 'Tela inicial: fileiras de videoclipes no lugar do cartão do próximo repertório; fone conectado com contorno no modo claro; publicação do site aguardando o APK',
    itens: [
      { tipo: 'novo', texto: 'Na tela inicial, o cartão "Para o próximo repertório" (ou "Feito por você") foi removido; os repertórios continuam na fileira "Seus repertórios". No lugar dele, foram incluídas duas fileiras de quadros em 16:9. "Seus videoclipes" reúne até 12 clipes das músicas da biblioteca que têm videoclipe conferido, com as baixadas primeiro (marcadas com o selo de baixada). "Mais clipes dos seus artistas" reúne até 12 clipes do YouTube dos até 4 artistas com mais músicas baixadas (sem músicas baixadas, os da biblioteca), alternando entre os artistas e sem os clipes que já são músicas do aparelho; essa fileira depende de internet e só aparece quando a busca retorna resultados. Ao tocar em um quadro, a reprodução inicia no modo vídeo; o clipe de uma música da biblioteca toca a música de lá, com a letra, a cifra e os arquivos dela.' },
      { tipo: 'melhoria', texto: 'No modo claro, o ícone do fone conectado, na barra de reprodução do celular, era desenhado apenas em traço na cor do aplicativo, com pouco contraste sobre a barra clara. Passou a ter o mesmo desenho do botão da música salva ao lado: círculo de 26 px preenchido com a cor do aplicativo, com contorno de 2 px e desenho no tom escuro da barra. O modo escuro não foi alterado.' },
      { tipo: 'melhoria', texto: 'No modo claro, ícones, botões e rótulos na cor do aplicativo usavam a cor escurecida com 42% de preto (para o ciano padrão, #036a7b), um tom diferente do azul do botão da música salva (#06b6d4). O escurecimento passou a 18% (#0595ae, contraste de 3,5:1 sobre o branco), mais próximo do azul do botão. A cor idêntica não foi adotada em texto e traço finos porque o contraste sobre o branco seria de 2,4:1. Os acordes da cifra, que são texto de leitura, mantêm o escurecimento de 42%.' },
      { tipo: 'correcao', texto: 'A publicação do site falhava com "release not found" (execução 1727) quando coincidia com a publicação do APK, que apaga e recria a release "android" no mesmo envio. A etapa que copia o APK para o site passou a aguardar a release ficar disponível, com até 20 tentativas a cada 15 s (5 min), antes de falhar. O conteúdo da versão 648 foi publicado pela execução seguinte (1728).' },
      { tipo: 'melhoria', texto: 'Pendente: as fileiras e o botão do fone foram verificados em navegador (390 × 844, modos claro e escuro), com biblioteca de teste de 4 músicas e o fone simulado; não foram executados em aparelho nem com a biblioteca real. A espera pela release só é exercida na próxima publicação que coincidir com a do APK.' },
    ],
  },
  {
    versao: 648, data: '2026-11-11', titulo: 'Cartão do artista: título "Sobre o artista" legível sobre qualquer foto, nos dois modos',
    itens: [
      { tipo: 'correcao', texto: 'No modo claro, o título "Sobre o artista", exibido sobre a foto do artista, herdava o tom escuro do texto do cartão e ficava ilegível sobre fotos escuras. O título passou a ser sempre branco, com sombra reforçada, e a faixa escurecida no alto da foto foi intensificada (de 45% para 62% de preto no topo, até desaparecer a 42% da altura), o que mantém a leitura sobre fotos escuras, claras ou coloridas, nos modos claro e escuro.' },
      { tipo: 'melhoria', texto: 'Os demais textos sobre imagem foram conferidos pelas regras de estilo (os quadros de "Explorar o artista", a duração nos vídeos relacionados, o topo sobre a capa animada, o cabeçalho da música com o clipe ao fundo e os cartões da tela inicial): já usam cor fixa branca com sombra ou escurecimento e não foram alterados.' },
      { tipo: 'melhoria', texto: 'Pendente: a correção foi verificada em navegador, em página de teste com o cartão sobre fundos preto, branco e amarelo, nos dois modos; não foi executada no aplicativo com fotos reais nem em aparelho.' },
    ],
  },
  {
    versao: 647, data: '2026-11-11', titulo: 'Barra de reprodução do celular: linha de progresso de ponta a ponta do cartão',
    itens: [
      { tipo: 'melhoria', texto: 'Na barra de reprodução do celular, a linha de progresso começava e terminava 8 px para dentro das bordas do cartão, com 2 px de altura. Passou a ocupar a largura inteira do cartão, do início ao fim, com 3 px de altura, acompanhando os cantos arredondados inferiores (o cartão recorta a linha nos cantos). O vídeo da barra passou a terminar logo acima da linha, com o canto inferior esquerdo reto. A alteração vale para os modos claro e escuro.' },
      { tipo: 'melhoria', texto: 'Pendente: a alteração foi medida em navegador, em página de teste com a marcação da barra (cartão e linha de 8 a 382 px, em tela de 390 px), nos dois modos; não foi executada no aplicativo nem em aparelho.' },
    ],
  },
  {
    versao: 646, data: '2026-11-11', titulo: 'Tela "Sobre": marca do aplicativo em traço vetorial, sem o fundo azul',
    itens: [
      { tipo: 'melhoria', texto: 'Na tela "Sobre", o quadro ao lado do nome do aplicativo exibia o ícone completo (a marca branca sobre o quadrado em degradê azul) em 18 px. Passou a exibir somente a marca, em traço vetorial de 26 px, sem o fundo azul, na cor do texto do aplicativo: escura no modo claro e clara no modo escuro.' },
      { tipo: 'melhoria', texto: 'Pendente: a alteração foi verificada em navegador, em página de teste com a marcação da linha, nos dois modos; não foi executada no aplicativo nem em aparelho.' },
    ],
  },
  {
    versao: 645, data: '2026-11-11', titulo: 'Compartilhamento: telas "Escolher os versos" e "Personalizar" na tela toda, com versão para o modo claro',
    itens: [
      { tipo: 'correcao', texto: 'As telas "Escolher os versos" e "Personalizar" abriam dentro da folha de compartilhar (94% da altura), com a alça da folha acima delas. Na tela dos versos, a alça formava uma faixa na cor da folha (branca no modo claro) sobre o fundo colorido, com os cantos arredondados aparentes. As duas telas passaram a ocupar a tela toda, sem a alça, nos dois modos; ao voltar aos cartões, a folha retorna ao tamanho anterior.' },
      { tipo: 'melhoria', texto: 'A tela "Escolher os versos" tinha uma única aparência (a cor do cartão cheia, com o texto branco), usada também no modo claro. No modo claro, passou a ter fundo em degradê da cor do cartão misturada com branco (de 30% a 12% da cor), com o texto em tom escuro da mesma cor e os versos escolhidos e o botão "Continuar" em fundo escuro com texto branco. O modo escuro não foi alterado. A tela "Personalizar" já seguia o modo do aplicativo.' },
      { tipo: 'melhoria', texto: 'Pendente: as telas foram verificadas em navegador, em página de teste com a marcação da folha (390 × 800), nos dois modos; não foram executadas no aplicativo nem em aparelho.' },
    ],
  },
  {
    versao: 644, data: '2026-11-11', titulo: 'Barra de reprodução: vídeo sem faixas escuras nas bordas',
    itens: [
      { tipo: 'correcao', texto: 'Na barra de reprodução do celular, o vídeo era exibido inteiro dentro de um espaço mais largo que a proporção 16:9 (112 × 59 px, para um vídeo de 112 × 63 px), com faixas pretas nas laterais, e com cantos arredondados próprios (6 px), diferentes dos do espaço (8 px à esquerda). No modo claro, as faixas e os cantos apareciam como bordas escuras sobre a barra clara. O vídeo passou a preencher o espaço inteiro, com o excedente cortado, e a usar os mesmos cantos do espaço.' },
      { tipo: 'melhoria', texto: 'Pendente: a correção foi medida em navegador, em página de teste com a marcação do vídeo (quadro do YouTube: 112 × 63 px centrado em 112 × 59 px; vídeo baixado: preenchimento com corte); não foi executada no aplicativo com uma música em reprodução nem em aparelho.' },
    ],
  },
  {
    versao: 643, data: '2026-11-11', titulo: 'Modo claro: barra fixa do topo do "Tocando agora" com fundo claro e textos dos cartões legíveis',
    itens: [
      { tipo: 'correcao', texto: 'A barra fixa do topo do "Tocando agora" (exibida ao rolar a tela) permanecia com fundo escuro no modo claro, com o nome da música, os botões e a linha de progresso, já em tom escuro, ilegíveis. A regra do modo claro incluída na versão 642 tinha precedência menor que a regra original da barra e não era aplicada. A regra foi reescrita com a mesma forma da original: a barra passou a ter fundo claro (24% da cor da música), com o texto e a linha de progresso visíveis.' },
      { tipo: 'correcao', texto: 'No modo claro, nos cartões abaixo do player, o botão "Explorar", os papéis na lista de créditos e o nome do artista nos vídeos relacionados mantinham a cor branca do modo escuro e ficavam quase invisíveis sobre o cartão claro. Passaram a usar o tom escuro da cor da música.' },
      { tipo: 'melhoria', texto: 'Pendente: a correção foi verificada em navegador, em página de teste com a marcação da barra e do cartão (cor de fundo calculada da barra: clara); não foi executada no aplicativo nem em aparelho.' },
    ],
  },
  {
    versao: 642, data: '2026-11-11', titulo: 'Compartilhamento com a música por padrão e prévia em reprodução na folha; modo claro em "Por trás da música", "Sobre o artista", "ver mais" e na barra fixa do player',
    itens: [
      { tipo: 'melhoria', texto: 'O botão "Com a música" foi removido da folha de compartilhar. Os cartões Letra e Vídeo passaram a ser enviados sempre com a música quando ela está disponível no aparelho (a música baixada com a letra sincronizada, no cartão Letra; o videoclipe baixado, no cartão Vídeo). Sem o arquivo, os cartões são enviados como antes.' },
      { tipo: 'novo', texto: 'A folha de compartilhar exibia os cartões parados, e o resultado só era conhecido depois do envio. Com a música disponível no aparelho, o cartão em exibição passou a ser reproduzido na folha como será enviado: no cartão Vídeo, o trecho de 15 segundos do refrão do clipe em movimento no quadro, com o som; no cartão Letra, o áudio do trecho dos versos escolhidos. O trecho recomeça ao terminar, com o som entrando e saindo gradualmente. A música em reprodução no aplicativo é pausada durante a prévia e retomada ao fechar a folha.' },
      { tipo: 'novo', texto: 'No cartão Letra enviado com a música, os versos passaram a ser preenchidos conforme são cantados: iniciam atenuados (34% de opacidade) e são preenchidos da esquerda para a direita, linha por linha, entre o início e o fim de cada verso na letra sincronizada. O mesmo preenchimento é exibido na prévia e gravado no vídeo enviado.' },
      { tipo: 'correcao', texto: 'A tela "Por trás da música" tinha uma única aparência, escura, usada também no modo claro. No modo claro, passou a ter fundo branco, com a cor da música clareada (26% da cor) apenas no alto, e o texto, os botões e os detalhes em tom escuro. O modo escuro não foi alterado.' },
      { tipo: 'melhoria', texto: 'A tela "Sobre o artista" voltou ao fundo cinza-escuro fixo (#121212) no modo escuro, como antes da versão 641; no modo claro, passou a ter fundo branco com o texto em tom escuro, no lugar do degradê na cor da música.' },
      { tipo: 'correcao', texto: 'No modo claro, o esmaecido atrás do "ver mais" do cartão do artista usava a cor do modo escuro e aparecia como uma faixa marrom-escura sobre o cartão claro; passou a usar a cor do cartão. A barra fixa do topo do "Tocando agora" (exibida ao rolar a tela) mantinha o fundo escuro, sobre o qual o texto e a linha de progresso, já em tom escuro, não eram visíveis; passou a ter fundo claro (24% da cor da música), com a linha de progresso visível.' },
      { tipo: 'melhoria', texto: 'Pendente: o preenchimento dos versos e as telas no modo claro foram verificados em navegador, em páginas de teste com a marcação das telas. A prévia em reprodução na folha (o clipe em movimento, o som e a pausa do player), a gravação do vídeo com os versos preenchidos e o envio não foram executados no aplicativo com uma música baixada nem em aparelho. Sem a música baixada, a prévia permanece parada, porque o player do YouTube não permite a reprodução dentro do cartão.' },
    ],
  },
  {
    versao: 641, data: '2026-11-11', titulo: 'Modo claro no player ("Tocando agora" e barra de reprodução) e tela "Sobre o artista" na cor da música',
    itens: [
      { tipo: 'melhoria', texto: 'A tela "Tocando agora", o cartão da letra, os cartões abaixo dele e a barra de reprodução tinham uma única aparência, escura (a cor da música misturada com preto e o conteúdo em branco), usada também no modo claro. No modo claro, passaram a ter versão própria: a cor da música misturada com branco (em degradê até o branco na tela "Tocando agora"; 24% da cor na barra de reprodução; 30% no cartão da letra) e o texto, os botões e a barra de tempo em um tom escuro da mesma cor. O que fica sobre imagem (o vídeo, a capa, a foto do artista e o topo sobre a capa animada) e os itens na cor do aplicativo (música salva, aleatório e repetir ligados, fone conectado) não foram alterados. O modo escuro não foi alterado.' },
      { tipo: 'melhoria', texto: 'A tela "Sobre o artista" tinha fundo cinza-escuro fixo (#121212) nos dois modos. O fundo passou a usar a cor predominante da música em reprodução, a mesma da letra na tela toda: no modo escuro, a cor misturada com preto (de 80% a 62% da cor); no modo claro, a cor misturada com branco, em degradê, com o texto em um tom escuro da mesma cor.' },
      { tipo: 'melhoria', texto: 'Pendente: as telas foram verificadas em navegador, em páginas de teste com a marcação do player e da tela do artista, no celular, nos dois modos; não foram executadas no aplicativo com uma música em reprodução, no tablet nem em aparelho. A capa animada (quadros do clipe atrás do topo) foi verificada com uma imagem de teste.' },
    ],
  },
  {
    versao: 640, data: '2026-11-11', titulo: 'Compartilhamento: cartões Letra e Vídeo enviados com a música (áudio do trecho dos versos e trecho do refrão do clipe)',
    itens: [
      { tipo: 'novo', texto: 'O cartão Letra passou a poder ser enviado em vídeo com o áudio da música: o trecho em que os versos escolhidos são cantados, obtido pela letra sincronizada, do início do primeiro verso (0,3 segundo antes) ao fim do último, com duração entre 4 e 30 segundos. O som entra e sai gradualmente. O cartão mantém a cor, a imagem de fundo e o fundo animado escolhidos.' },
      { tipo: 'novo', texto: 'O cartão Vídeo passou a poder ser enviado com 15 segundos do videoclipe, a partir do refrão (identificado pela letra sincronizada; sem ela, a 30% da música), com a imagem do clipe em movimento no quadro do cartão e o som do próprio clipe.' },
      { tipo: 'novo', texto: 'A folha de compartilhar passou a exibir o botão "Com a música" nos cartões Letra e Vídeo quando a música está disponível; desligado, o cartão é enviado como antes (imagem, ou vídeo sem som com o fundo animado). O formato é MP4 (H.264 e AAC) onde o aparelho grava nesse formato e WebM nos demais; a geração leva o mesmo tempo do trecho, indicado na folha.' },
      { tipo: 'melhoria', texto: 'Condição: o áudio e a imagem vêm do arquivo baixado no aparelho, porque o player do YouTube não permite a gravação. O cartão Letra exige a música baixada e a letra sincronizada; o cartão Vídeo exige o videoclipe baixado. Sem o arquivo, o botão não é exibido e os cartões são enviados como antes. O cartão Música não foi alterado.' },
      { tipo: 'melhoria', texto: 'Pendente: a gravação foi verificada em navegador com mídia de teste (cartão Letra: 1080 × 1080, 10,2 s, com áudio; cartão Vídeo: 1080 × 920, 15 s, com imagem e áudio do clipe). Não foram executados a folha no aplicativo com uma música baixada, a gravação em aparelho Android nem o envio ao WhatsApp e ao Instagram.' },
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

// O aviso de versão nova do app de Android: as novidades do APK publicado (Ecoa-versao.json, que o robô monta com as
// novidades que vão dentro dele) que o app instalado ainda não tem. webInstalada: a primeira versão das novidades do
// app instalado. O arquivo de antes, sem as novidades, não mostra nada (antes apareciam as do app instalado, antigas)
export function novidadesQueChegam(publicada, webInstalada = NOVIDADES[0]?.versao) {
  return (Array.isArray(publicada?.novidades) ? publicada.novidades : [])
    .filter((n) => Number(n?.versao) > Number(webInstalada || 0) && n.titulo);
}

// Em qual versão do app de Android cada novidade chegou: historico = [{ codigo, nome, web }] (os APKs que o app
// conhece: os que ele mesmo já foi e os que o robô publicou), web = a primeira versão das novidades que o APK trouxe.
// A novidade v chegou no primeiro APK com web >= v, desde que o APK anterior a ele (conhecido) ainda não a tivesse;
// sem saber o anterior, não dá para dizer: null (a tela mostra só a data, nunca um número errado)
export function versaoDoAppDaNovidade(v, historico = []) {
  const l = historico.filter((h) => Number(h?.codigo) && Number(h.web)).sort((a, b) => a.codigo - b.codigo);
  const i = l.findIndex((h) => Number(h.web) >= Number(v));
  return i > 0 && Number(l[i - 1].web) < Number(v) ? String(l[i].nome) : null;
}
