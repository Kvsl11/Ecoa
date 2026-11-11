// O que mudou em cada versão do app, em registro técnico e formal (a causa, o que foi alterado e o efeito, com os
// números medidos quando houver; impessoal, sem gíria). A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
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
  {
    versao: 639, data: '2026-11-11', titulo: 'Folhas com botões: botões no pé da folha quando aberta na altura toda',
    itens: [
      { tipo: 'correcao', texto: 'Nas folhas com botões no pé (por exemplo, "Nova versão do app"), ao puxar a folha para cima até a altura toda, os botões acompanhavam o texto e permanecia uma área vazia abaixo deles, porque o conteúdo mantinha a própria altura dentro da folha ampliada. Com a folha na altura toda, o conteúdo passou a ocupar a altura da folha e os botões passaram a ficar no pé. Na folha de altura normal, nada foi alterado.' },
      { tipo: 'melhoria', texto: 'Pendente: a correção foi medida em navegador, em página de teste com a marcação da folha "Nova versão do app" (tela de 390 × 800: botões de 729 a 800, no pé); não foi executada em aparelho.' },
    ],
  },
  {
    versao: 638, data: '2026-11-11', titulo: 'Letra na tela toda com versão para o modo claro e nome da faixa em reprodução na cor do aplicativo nos álbuns e artistas',
    itens: [
      { tipo: 'melhoria', texto: 'A letra na tela toda tinha uma única aparência, escura (a cor da música misturada com preto e o texto em branco), usada também no modo claro. No modo claro, a tela passou a ter versão própria: fundo em degradê da cor da música misturada com branco (34% da cor no topo, 20% no meio e 9% na base) e o texto, os botões, a barra de tempo, o botão de tocar e os acordes da cifra em um tom escuro da mesma cor. Na letra sincronizada, a frase atual fica no tom cheio, com realce claro; as próximas e as já cantadas ficam atenuadas. O modo escuro não foi alterado.' },
      { tipo: 'correcao', texto: 'Nas listas de faixas de álbum e de artista abertas pela busca, a faixa em reprodução exibia somente as barras animadas na cor do aplicativo; o nome permanecia cinza, porque a regra de cor das faixas sem cifra prevalecia sobre a da faixa em reprodução. O nome passou a ser exibido na cor do aplicativo, como nas playlists e nas demais listas.' },
      { tipo: 'melhoria', texto: 'Pendente: a tela da letra no modo claro foi verificada em navegador, em página de teste com a marcação da tela (letra, cifra e controles), em três cores de música; não foi executada no aplicativo com uma música em reprodução nem em aparelho. O cartão pequeno da letra dentro do player mantém a aparência escura do player. A cor do nome da faixa foi conferida pela regra de estilo, sem execução em aparelho.' },
    ],
  },
  {
    versao: 637, data: '2026-11-11', titulo: 'Compartilhamento: cor e personalização independentes por cartão e quadro da capa na cor do cartão',
    itens: [
      { tipo: 'correcao', texto: 'Na folha de compartilhar, a cor escolhida era aplicada aos cartões Música, Letra e Vídeo ao mesmo tempo, porque a folha guardava uma única cor para os três. A cor passou a ser guardada por cartão: a escolha altera somente o cartão exibido no centro, e os demais mantêm a cor que tinham. O mesmo passou a valer para as opções da tela "Personalizar" (imagem de fundo, fundo animado, estilo e alinhamento do texto). O marcador de cor selecionada acompanha o cartão exibido.' },
      { tipo: 'correcao', texto: 'No cartão Música, o quadro em volta da capa era sempre preto com 86% de opacidade; sobre a cor do cartão, o resultado era um preto translúcido, de tom variável conforme o fundo. O quadro passou a ter cor opaca, derivada da cor do cartão: o mesmo matiz com 15% de luminosidade na cor da música, um tom mais claro que o fundo nas cores escura e preta, e branco, com texto escuro, na cor clara. O nome, o artista e a marca do Ecoa seguem a cor do texto do quadro.' },
      { tipo: 'melhoria', texto: 'Pendente: a alteração foi verificada em navegador; a folha no aplicativo Android não foi executada em aparelho.' },
    ],
  },
  {
    versao: 636, data: '2026-11-11', titulo: 'Link de música compartilhada: abertura direta no aplicativo Android instalado',
    itens: [
      { tipo: 'correcao', texto: 'O link de uma música compartilhada, aberto no navegador do Android, parava em uma tela do site com o botão "Abrir no aplicativo" e, em navegador sem conta conectada, na tela de entrada, sem a música. A página passou a entregar o link ao aplicativo Android instalado no momento em que é aberta, antes de o site carregar e antes da tela de entrada; o aplicativo abre a música correspondente. A tentativa é feita uma vez por link, em cada aba.' },
      { tipo: 'melhoria', texto: 'Sem o aplicativo instalado, o site passou a abrir a música diretamente: quando a página permanece em primeiro plano 1,6 segundo depois da tentativa, a música é aberta no site, sem a tela intermediária. Os botões "Abrir no aplicativo", "Ouvir aqui" e "Procurar na busca" permanecem ao voltar a essa tela.' },
      { tipo: 'novo', texto: 'A tela de entrada do site, quando aberta por um link de música no navegador do Android, passou a exibir o botão "Abrir a música no aplicativo".' },
      { tipo: 'melhoria', texto: 'Pendente: a entrega automática depende de o navegador aceitar a abertura do aplicativo sem toque; onde o navegador a recusa, a música abre no site. Nos navegadores internos de outros aplicativos (WebView), a tentativa automática não é feita, e permanece a tela com o botão "Abrir no aplicativo". O aplicativo instalado precisa ser a versão que recebe links de música (a partir da 634). A verificação foi feita em navegador com identificação de Android; o comportamento em aparelho, com o aplicativo instalado, não foi executado. A abertura pelo Android sem passar pelo navegador continua dependente do arquivo assetlinks.json na raiz de kvsl11.github.io, não publicado.' },
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
