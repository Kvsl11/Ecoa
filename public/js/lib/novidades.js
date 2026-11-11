// O que mudou em cada versão do app, em registro técnico e formal (a causa, o que foi alterado e o efeito, com os
// números medidos quando houver; impessoal, sem gíria). A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 653, data: '2026-11-11', titulo: 'Capa animada: faixas de moldura claras gravadas no clipe passam a ser reconhecidas e cortadas',
    itens: [
      { tipo: 'correcao', texto: 'Alguns clipes trazem, gravadas no próprio vídeo, faixas de moldura em cima e embaixo. A medição dessas faixas reconhecia apenas as pretas (linhas com luminosidade até 28 de 255); com faixas de outra cor lisa (brancas ou cinza), nada era medido, a capa animada da tela "Tocando agora" permanecia na ampliação padrão de 1,18, que corta 7,6% de cada lado, e as faixas apareciam no alto e no pé da capa. A medição passou a reconhecer faixas de qualquer cor lisa: uma linha é considerada faixa quando 92% dela tem a cor da borda, com tolerância de 18 por canal. Faixas não pretas só são aceitas quando existem nos dois lados, com pelo menos 2% da altura cada e na mesma cor, e permanece a menor medida entre os quadros analisados, de modo que um céu claro ou uma cena lisa não é tratado como moldura.' },
      { tipo: 'melhoria', texto: 'A ampliação da capa animada passou a incluir uma linha de medição a mais (1,9% da altura), para que a borda borrada da faixa também fique fora da área visível. Em vídeos de teste com faixas de 11,9% da altura, brancas, cinza e pretas, a ampliação calculada foi de 1,391, que corta 14,0% de cada lado; no vídeo sem faixas, a ampliação padrão foi mantida.' },
      { tipo: 'melhoria', texto: 'A mesma medição passou a valer para os quadros do clipe exibidos quando ele não está baixado, para a prévia e para a capinha das playlists. As medidas guardadas no aparelho, feitas apenas para faixas pretas, são descartadas e refeitas automaticamente na próxima exibição de cada clipe.' },
      { tipo: 'melhoria', texto: 'Pendente: a medição foi verificada por testes automatizados e em navegador, com vídeos de teste gerados; não foi executada no aplicativo com o clipe em que o problema foi observado nem em aparelho. Molduras laterais não são tratadas.' },
    ],
  },
  {
    versao: 652, data: '2026-11-11', titulo: 'Barra de reprodução do celular: ícone e nome do fone sem contorno, nos modos claro e escuro',
    itens: [
      { tipo: 'melhoria', texto: 'Na barra de reprodução do celular, o ícone de Bluetooth e o nome do fone conectado, abaixo do título, haviam recebido na versão 650 um contorno em tom escuro da cor da música (traço de 4,6 no ícone e de 1,5 px no texto). O contorno foi removido nos modos claro e escuro: o ícone e o nome passaram a ser desenhados apenas na cor do aplicativo. O contorno do ícone do fone, à direita, e do botão da música salva não foi alterado.' },
      { tipo: 'melhoria', texto: 'Pendente: a alteração foi conferida pelas regras de estilo; não foi executada em aparelho.' },
    ],
  },
  {
    versao: 651, data: '2026-11-11', titulo: 'Modo claro: ícones, botões e rótulos na cor exata escolhida nos Ajustes',
    itens: [
      { tipo: 'correcao', texto: 'No modo claro, ícones, botões e rótulos na cor do aplicativo usavam a cor escolhida nos Ajustes escurecida com 18% de preto quando ela era clara (para o ciano padrão, #0595ae), um tom diferente do botão da música salva, que usa a cor sem alteração (#06b6d4). A diferença era visível na tela "Tocando agora", entre o botão da música salva e os ícones do fone conectado, do nome do fone e da repetição ligada. O escurecimento foi removido: no modo claro, esses elementos passaram a usar exatamente a cor escolhida, em todo o aplicativo (99 regras de estilo, além do realce da partitura). Para o ciano padrão, o contraste sobre o branco passa de 3,5:1 para 2,4:1.' },
      { tipo: 'melhoria', texto: 'Os acordes da cifra, por serem texto de leitura, não foram alterados: continuam com a cor clara escurecida com 42% de preto no modo claro. O modo escuro e a cor do PDF também não foram alterados.' },
      { tipo: 'melhoria', texto: 'Pendente: a alteração foi conferida pelo valor calculado da cor em navegador, no modo claro; não foi executada em aparelho.' },
    ],
  },
  {
    versao: 650, data: '2026-11-11', titulo: 'Capa animada até o alto da tela e sem linha no pé; contorno no fone, no nome do fone e no botão da música salva, nos modos claro e escuro',
    itens: [
      { tipo: 'correcao', texto: 'Na tela "Tocando agora" do celular, o vídeo do clipe baixado usado como capa animada era dimensionado por medidas relativas ao contêiner (cqw/cqh). Em aparelho, o vídeo foi observado mais baixo que a área da capa, com uma faixa sem vídeo no alto, na altura da barra de status, e a borda inferior aparente. O vídeo passou a ocupar a área inteira da capa (100% da largura e da altura, com recorte para preencher), do alto da tela, atrás da barra de status, até o pé, nos modos claro e escuro.' },
      { tipo: 'correcao', texto: 'A capa animada terminava em uma borda reta na cor do pé da capa; com cores muito claras, no modo claro, a diferença para o fundo logo abaixo aparecia como uma linha. O vídeo passou a terminar 64 px antes do fim da capa (antes, 24 px), sob a cor cheia, e os 56 px finais passaram a se dissolver no fundo do player.' },
      { tipo: 'melhoria', texto: 'Na barra de reprodução do celular, o ícone do fone conectado havia recebido, na versão 649, um círculo preenchido no modo claro. O círculo foi removido. O ícone do fone, o ícone ao lado do nome do fone e o nome do fone passaram a ter um contorno nítido, mantendo a cor do aplicativo no desenho e no texto: os ícones são desenhados em duas camadas, a de baixo com o traço mais grosso (4,6 em vez de 2 unidades), e o texto recebe traço de 1,5 px por trás do preenchimento. O contorno usa um tom escuro da cor da própria música, nos dois modos, em vez de preto ou branco fixos: 62% da cor da música com preto no modo claro e 22% no modo escuro, em que a barra já é um tom escuro da música.' },
      { tipo: 'melhoria', texto: 'O contorno do botão da música salva, na mesma barra, e o desenho dentro dele passaram a usar o mesmo tom do contorno do fone: no modo claro, usava 85% do tom sobre o azul do botão e resultava esverdeado; no modo escuro, era da cor do próprio botão.' },
      { tipo: 'melhoria', texto: 'Pendente: os contornos e a capa animada foram verificados em navegador (390 × 844, modos claro e escuro, barra de status simulada de 44 px), com o fone simulado e um elemento de vídeo sem arquivo; não foram executados em aparelho. A faixa no alto e a linha no pé da capa não foram reproduzidas em navegador: a correção foi feita a partir das capturas do aparelho e depende de confirmação nele.' },
    ],
  },
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
