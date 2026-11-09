// O que mudou em cada versão do app, em registro técnico e formal (a causa, o que foi alterado e o efeito, com os
// números medidos quando houver; impessoal, sem gíria). A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 609, data: '2026-11-08', titulo: 'Geração de letra sincronizada e cifra para músicas importadas',
    itens: [
      { tipo: 'novo', texto: 'No aplicativo Android, foi adicionada uma ferramenta para selecionar um arquivo de áudio e gerar uma transcrição da letra com marcações de tempo pelo Gemini, além de estimativas locais de tom, andamento e acordes. O resultado pode ser conferido e exportado em LRC (letra sincronizada) e ChordPro (cifra). A transcrição requer internet; a análise musical é executada no aparelho. Nesta versão, os arquivos são exportados para revisão e importação manual, sem substituir automaticamente uma música já existente na biblioteca.' },
    ],
  },
  {
    versao: 608, data: '2026-11-08', titulo: 'Áudio importado com letra, sincronia, acordes e tom; capas e fotos estáveis no Android',
    itens: [
      { tipo: 'novo', texto: 'O áudio importado para a biblioteca passou a ser processado no aplicativo Android. A letra sincronizada continua sendo procurada primeiro no LRCLIB, com o título e o artista lidos do nome do arquivo ("Artista - Título"). Quando o LRCLIB não tem a letra, como nas músicas próprias e nas gravações de ensaio, a letra cantada é transcrita pelo Gemini do aplicativo, com o instante de cada linha, e o andamento, o tom e o acorde de cada batida são calculados no próprio aparelho. Com esses dados, o aplicativo monta a cifra com os acordes sobre a palavra cantada no instante da troca, a introdução, os trechos instrumentais e o final, e guarda a letra sincronizada; com ela, o karaokê feito no celular passa a funcionar para a música. A análise de um minuto de música levou cerca de 0,2 s em computador; em áudio sintético, o tom e a sequência de acordes foram reconhecidos sem erro. Sem internet, os acordes ficam prontos e a letra é transcrita na próxima oportunidade; a cifra editada pela pessoa e a sincronia feita à mão não são alteradas. As músicas importadas antes desta versão passam pelo mesmo processamento em segundo plano. Disponível mediante atualização do aplicativo.' },
      { tipo: 'novo', texto: 'A importação passou a aceitar também WMA, AIFF, AMR, APE, ALAC, AC3, MKA, WebM e CAF. No aplicativo Android, os formatos que o navegador interno não reproduz são convertidos para M4A (AAC, 192 kb/s) pelo ffmpeg do próprio aplicativo antes de serem guardados. Disponível mediante atualização do aplicativo.' },
      { tipo: 'correcao', texto: 'No aplicativo Android, a foto do artista variava entre aberturas: as fontes (canal do YouTube, Deezer e Cifra Club) eram consultadas juntas e prevalecia a que respondesse em até 1,2 s. No navegador, o canal do YouTube não responde e a foto do Deezer sempre prevalecia; no Android, que acessa o YouTube pela conexão do sistema, a foto alternava. Além disso, quando o Deezer limitava as consultas, o aplicativo tentava de novo apenas uma vez, e outra fonte substituía a foto guardada. A foto do Deezer passou a ser a principal em todas as telas, com as demais fontes apenas como reserva; a foto do Deezer já guardada não é substituída quando ele não responde; as novas tentativas e os tempos de espera passaram a ser os mesmos do site; e o artista passou a ser localizado pelo nome quando a faixa aberta não consta no Deezer, de modo que a foto não depende da música aberta primeiro. As fotos de outras fontes guardadas nas músicas da biblioteca são substituídas pela do Deezer em segundo plano.' },
      { tipo: 'correcao', texto: 'Na busca, a linha da música exibia a miniatura do vídeo até a capa oficial chegar e então a trocava, o que aparecia como uma capa sem relação piscando. Ao abrir a música, a capa era procurada novamente com o título e o artista da página da cifra, que podem ser escritos de forma diferente, e a música podia abrir com outra capa. A linha passou a exibir a capa oficial diretamente (a miniatura do vídeo só aparece quando não há capa oficial), a capa vista na busca passou a acompanhar a música aberta, e a capa já guardada passou a ser mantida enquanto continuar entre as capas corretas da gravação, sem depender de quais imagens carregam primeiro.' },
      { tipo: 'correcao', texto: 'No aplicativo Android, a tela Novidades e as demais correções podiam não chegar com o APK novo: a página é carregada dos arquivos do APK, mas o service worker continuava servindo o pacote guardado da versão anterior quando o número de versão do site não mudava, como ocorreu nos APKs 1.200 a 1.206. O service worker passou a ser registrado com o número do APK instalado, e cada APK novo substitui o pacote guardado pelo seu. Disponível mediante atualização do aplicativo.' },
    ],
  },
  {
    versao: 607, data: '2026-11-07', titulo: 'Tema automático passou a seguir o modo do aparelho no Android',
    itens: [
      { tipo: 'correcao', texto: 'No aplicativo Android, o tema "Automático" exibia o tema claro mesmo com o aparelho no modo escuro. O navegador interno do Android (WebView) informa à página o modo claro ou escuro a partir do tema declarado no aplicativo, e não a partir da configuração do aparelho; além disso, a tela não era recriada quando o modo do sistema mudava, de modo que a troca não era percebida. O aplicativo passou a informar à página o modo real do aparelho ao abrir, ao voltar do segundo plano e no momento em que o modo do sistema muda, e o último valor informado é usado desde o início da próxima abertura, sem alternância visível entre os temas. A escolha manual de Escuro ou Claro não foi alterada. Disponível mediante atualização do aplicativo.' },
    ],
  },
  {
    versao: 606, data: '2026-11-07', titulo: 'Ajustes reorganizados, com ícones revistos e sem opções repetidas',
    itens: [
      { tipo: 'melhoria', texto: 'Os tópicos dos Ajustes passaram a ter ícones correspondentes ao conteúdo: Avançado deixou de usar o ícone de banco de dados (semelhante a uma memória) e passou a usar uma chave de ferramenta; Backup, que usava a seta de envio, passou a usar uma caixa de arquivo; Permissões passou a usar um escudo; PowerPoint, um quadro de apresentação; e Música e cifra, uma nota musical no lugar do sinal "#".' },
      { tipo: 'melhoria', texto: 'As opções repetidas foram unificadas. A exportação e a importação dos downloads, que ficavam em Downloads, passaram para Backup, que agora reúne a cópia da biblioteca e a dos downloads, cada uma com a sua explicação. O tópico Qualidade de mídia, que repetia a linha "Qualidade dos downloads" da página de Downloads, foi retirado da lista; a opção continua dentro de Downloads e internet. Os três atalhos do alto dos Ajustes (Economia de dados, Sessão privada e Capa animada) foram removidos, pois repetiam opções das páginas.' },
      { tipo: 'melhoria', texto: 'Música e cifra passou a ser dividida em Cifra (destaque e diagrama dos acordes), Reprodução (transição entre as músicas e capa animada) e Privacidade (sessão privada). Downloads e economia de dados passou a se chamar Downloads e internet, com a economia de dados e o download com dados móveis na seção Internet; a descrição da economia de dados passou a dizer o que ela faz: desliga a capa animada, toca do aparelho as músicas baixadas, até no modo vídeo, e evita que a busca carregue as músicas antes do toque.' },
      { tipo: 'correcao', texto: 'A sessão privada não registrava as músicas tocadas, mas abrir a página de uma música ainda a colocava nos Recentes; isso foi corrigido. Como a sessão não dava nenhum sinal de estar ligada, passou a ser indicada em Recentes, nas Estatísticas e no menu do perfil, com um atalho para desligá-la, e a opção passou a explicar o seu efeito.' },
    ],
  },
  {
    versao: 605, data: '2026-11-07', titulo: 'Busca e ordenação de "Músicas curtidas" reformuladas',
    itens: [
      { tipo: 'melhoria', texto: 'Em "Músicas curtidas" (celular, tablet, web e aplicativo Android), a busca e o botão de ordem passaram a ficar acima do título, fora da área visível ao abrir a página; ambos aparecem ao puxar a página para baixo e desaparecem gradualmente ao rolar. O campo passou a se chamar "Buscar na playlist", com fundo translúcido sobre o degradê, e o botão de ordem passou a se chamar "Ordenar". Com poucas músicas, a página recebe a altura necessária para que a busca permaneça oculta ao abrir.' },
      { tipo: 'novo', texto: 'Tocar no campo de busca abre o modo de busca: a seta de voltar e o campo ficam fixos no topo, seguidos dos filtros e da lista filtrada; o título, os botões e "Adicionar a esta playlist" são ocultados até a saída pela seta, que também limpa o texto digitado.' },
      { tipo: 'novo', texto: '"Ordenar" passou a abrir a folha "Ordenar por", com as opções Título, Artista, Álbum e Adicionadas recentemente; a ordem em uso aparece em destaque, com o sinal de confirmação. Antes, o botão alternava apenas entre a ordem recente e a alfabética.' },
    ],
  },
  {
    versao: 604, data: '2026-11-07', titulo: 'Indicadores de fixação e de download na biblioteca',
    itens: [
      { tipo: 'melhoria', texto: 'Na biblioteca (celular e tablet), o alfinete verde dos itens fixados foi ampliado de 13 px para 16 px (de 11 px para 15 px na grade do celular), alinhado à linha "Playlist • n músicas".' },
      { tipo: 'novo', texto: 'Playlists e repertórios cujas músicas com áudio ou vídeo estão todas baixadas no aparelho passaram a exibir, ao lado do alfinete, o círculo verde com a seta de download, no mesmo tamanho. O indicador também aparece em "Músicas curtidas", quando todas estão baixadas.' },
      { tipo: 'melhoria', texto: 'O cartão fixo "Baixadas" foi removido da biblioteca (celular, tablet, web e aplicativo Android), por repetir as músicas já reunidas em "Músicas curtidas", que passou a indicar quando estão todas baixadas. A lista das músicas baixadas continua acessível em Configurações → Músicas baixadas; o filtro "Baixadas" da biblioteca passou a listar apenas as playlists e os repertórios inteiramente baixados.' },
    ],
  },
  {
    versao: 603, data: '2026-11-07', titulo: 'Janela de troca de vídeo e de áudio reformulada',
    itens: [
      { tipo: 'correcao', texto: 'Nas janelas que sobem do rodapé com lista (como a de trocar o vídeo ou a música), um traço horizontal aparecia sobre cada botão "Escolher". A regra de estilo do rodapé da janela (fixo, com linha superior, fundo e margens) também se aplicava ao espaço dos botões de cada linha da lista, que usa a mesma classe. A regra passou a valer apenas para o rodapé da janela.' },
      { tipo: 'melhoria', texto: 'A janela de trocar o vídeo ou a música (áudio) foi reformulada, no celular e no tablet: o título indica a ação ("Trocar o vídeo", "Trocar a música (áudio)") e a música a que se refere; as linhas da lista passaram a ter miniatura maior, com a duração, e o nome em até duas linhas; a versão em uso aparece primeiro, destacada, com a etiqueta "Atual" e a indicação "Em uso" no lugar do botão; "Tenho o link do vídeo" passou a ser uma linha com ícone, que se expande; no rodapé, "Remover" fica à esquerda, em vermelho e com ícone, e "Cancelar" à direita.' },
    ],
  },
  {
    versao: 602, data: '2026-11-07', titulo: 'Capas estáveis, conta limpa por completo, menu das playlists por toque longo e novo selo de artista confirmado',
    itens: [
      { tipo: 'correcao', texto: 'A capa das músicas salvas podia mudar sozinha: ao abrir o aplicativo, ao tocar a música e ao exibir a biblioteca, a capa do álbum era procurada de novo e substituída sempre que a busca devolvia outra. Além disso, a escolha entre as capas encontradas ordenava as opções pela adequação à música (single e álbum à frente de coletâneas e de outras gravações), mas em seguida selecionava a de maior resolução e, no empate, a mais ouvida, de modo que uma coletânea gospel substituía a capa do single de "Aba", do Kemuel. A escolha passou a respeitar a ordem de adequação, considerando as duas fontes (Deezer e iTunes) em conjunto, e a resolução só desempata o mesmo álbum. A busca em segundo plano passou a preencher apenas a capa provisória (nenhuma, o quadro do vídeo ou a foto do artista): a capa do álbum já atribuída não é mais substituída. As capas salvas que forem de coletânea ou de outra gravação são corrigidas uma única vez, em segundo plano; as corretas e as escolhidas manualmente são mantidas.' },
      { tipo: 'melhoria', texto: 'Em "Trocar a capa", o botão "Automática", que não indicava atividade e, sem resposta da busca, removia a capa, foi substituído por "Achar a capa certa": durante a busca, a janela informa que o Deezer e o iTunes estão sendo consultados; ao final, exibe a capa encontrada, o álbum, a fonte e a resolução, e informa se a capa foi trocada, se a atual já era a correta ou se nada foi encontrado (nesse caso, a capa atual é mantida). Cada opção da grade passou a indicar a fonte. O Diagnóstico da música ganhou a seção "Capa", que identifica a capa de coletânea ou de outra gravação, e "Consertar agora" passou a informar quando a capa é corrigida.' },
      { tipo: 'correcao', texto: '"Apagar tudo", nas configurações, saía da conta e apagava apenas os dados do aparelho; como a conta é obrigatória, ao entrar novamente a nuvem restaurava músicas, playlists e repertórios, e na prática só os downloads eram removidos. O botão passou a limpar a conta: primeiro todos os itens da nuvem são marcados como apagados (os demais aparelhos da conta também são esvaziados na sincronização seguinte) e, em seguida, são removidos do aparelho a biblioteca, as playlists, os repertórios, os downloads, os karaokês, as estatísticas, o histórico e os ajustes. A sessão da conta é mantida. Sem internet ou sem resposta da nuvem, nada é apagado e o motivo é informado.' },
      { tipo: 'novo', texto: 'Na biblioteca, manter o dedo sobre uma playlist ou um repertório abre o menu inferior (celular e tablet) com as opções Fixar no topo (ou Desafixar), Renomear, Trocar a capa, Usar a capa automática, Selecionar várias e Excluir. Os itens fixados aparecem logo após "Músicas curtidas" e "Baixadas", com o ícone de alfinete, e a fixação é sincronizada pela conta. Antes, o toque longo apenas iniciava a seleção para exclusão.' },
      { tipo: 'melhoria', texto: 'O selo de artista confirmado, na seção "Sobre o artista", passou de um círculo azul para o formato de borda ondulada, preenchido em azul, com o sinal de confirmação em branco.' },
    ],
  },
  {
    versao: 601, data: '2026-11-07', titulo: 'Tela de entrada redesenhada',
    itens: [
      { tipo: 'melhoria', texto: 'A tela de entrada foi simplificada. Foram removidos o mural animado de quadros de clipes ao fundo, o indicador de música em reprodução no canto superior, as etiquetas de recursos e o título em duas cores. A tela passou a exibir, centralizados sobre fundo escuro liso com brilho suave na cor do aplicativo, o logotipo com três anéis concêntricos que se expandem lentamente a partir dele, o título em cor única, a descrição e o botão "Entrar com o Google". O mesmo layout é aplicado ao celular, ao tablet e ao computador. Com a remoção do mural, a tela deixou de baixar cerca de 45 imagens do YouTube ao abrir. Aplica-se à versão web e ao aplicativo Android.' },
    ],
  },
  {
    versao: 600, data: '2026-11-07', titulo: 'Cabeçalho do tablet afastado da barra de status do Android',
    itens: [
      { tipo: 'correcao', texto: 'No tablet, em orientação retrato e paisagem, a foto do perfil e os botões do cabeçalho, bem como o topo do painel "Tocando agora" (o título, o botão de recolher e o menu ⋮), ficavam sobrepostos à hora e aos ícones de rede da barra de status do Android. A regra de estilo específica do tablet definia um espaçamento superior fixo de 12 px, que substituía o espaçamento da área segura (env(safe-area-inset-top)) aplicado nos demais aparelhos; o painel "Tocando agora" não reservava essa área. O espaçamento superior passou a somar a altura da barra de status no cabeçalho, no painel lateral, na tela cheia e na barra fixa exibida ao rolar o painel.' },
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
