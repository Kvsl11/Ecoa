// O que mudou em cada versão do app, em registro técnico e formal (a causa, o que foi alterado e o efeito, com os
// números medidos quando houver; impessoal, sem gíria). A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 599, data: '2026-11-07', titulo: 'Retorno ao aplicativo sem tela vazia e faixas de álbuns de versões com o nome correto',
    itens: [
      { tipo: 'correcao', texto: 'Ao retornar ao aplicativo Android após longo período em segundo plano, a tela podia permanecer vazia indefinidamente. Quando o sistema encerra a página para liberar memória, ela é recarregada no retorno, e a folha de estilos das fontes (Google Fonts) era carregada de forma bloqueante: com a conexão ainda instável, a página não era desenhada e o aplicativo não iniciava. As fontes passaram a ser carregadas de forma assíncrona, com a fonte do sistema até a chegada delas. Além disso, a verificação executada no retorno passou a confirmar a inicialização completa do aplicativo e a recarregar a página quando ela não ocorre (no máximo duas vezes, seguidas da recriação da tela). Disponível mediante atualização do aplicativo.' },
      { tipo: 'correcao', texto: 'Em álbuns de versões, como o Reanimation do Linkin Park, o Cifra Club lista as faixas com o nome da música original e as associa à cifra da original ("My December" no lugar de "My<Dsmbr"); a faixa abria a cifra, a letra e o vídeo da música original. As faixas passaram a ser conferidas com o mesmo álbum no Deezer: a que tem outro nome lá recebe o nome correto, o remixador e as participações (por exemplo, "My<Dsmbr (Mickey P. Reanimation)", Linkin Park feat. Kelli Ali), e a cifra, a letra e o vídeo são procurados por esse nome. Diferenças apenas de pontuação e faixas bônus ao vivo ou demo não alteram a faixa.' },
    ],
  },
  {
    versao: 598, data: '2026-11-07', titulo: 'Fotos de artistas no Android, transições sem sobreposição e indicador de progresso do karaokê',
    itens: [
      { tipo: 'correcao', texto: 'No aplicativo Android, a foto do artista não era exibida na página do artista, na seção "Sobre o artista" e nas listas, embora aparecesse na biblioteca. O servidor de imagens do Google, origem das fotos dos canais do YouTube, recusa (HTTP 429) as requisições cujo cabeçalho Referer indica "localhost", endereço da página dentro do aplicativo. As imagens passaram a ser solicitadas sem esse cabeçalho, e as utilizadas como fundo são obtidas da mesma forma e exibidas a partir de cópia local. Disponível mediante atualização do aplicativo.' },
      { tipo: 'correcao', texto: 'O indicador circular de progresso do karaokê e o do download deixaram de ser exibidos porque a variável --pct, compartilhada pelos dois, passou a ser registrada como porcentagem pela tela de partitura, o que invalidava os valores numéricos. Cada componente passou a usar uma variável própria. O indicador do karaokê foi redesenhado: anel de 3 px na borda do botão, com avanço contínuo; arco giratório enquanto a porcentagem ainda não é conhecida; e etiqueta discreta ao lado com a etapa e a porcentagem (por exemplo, "Tirando a voz · 42%").' },
      { tipo: 'correcao', texto: 'O menu ⋮ e as demais folhas inferiores surgiam com transparência e deslocamento curto, sobrepondo momentaneamente o texto ao conteúdo de trás; passaram a deslizar a partir da borda inferior, opacas, com o fundo escurecido gradualmente, e a descer ao fechar (antes desapareciam de uma vez). A tela "Tocando agora" passou a abrir da mesma forma.' },
      { tipo: 'correcao', texto: 'Ao fechar a tela "Tocando agora", a capa animada (quadros ou trechos do clipe) era desmontada e, ao reabrir, montada novamente, com cada imagem surgindo gradualmente a partir da cor de fundo. Ela passou a permanecer montada e oculta, com a animação pausada, e é retomada no mesmo ponto ao reabrir.' },
    ],
  },
  {
    versao: 597, data: '2026-11-07', titulo: 'Salvamento direto pelo player, busca restrita a conteúdo externo e notas de versão em registro técnico',
    itens: [
      { tipo: 'correcao', texto: 'O botão de salvar do player, acionado sobre uma música aberta pela busca ou sobre um vídeo de "Vídeos relacionados", abria a página da música com a tela de carregamento e só então tentava salvar; quando a música aberta vinha associada a outro vídeo, a verificação falhava e nada era salvo. O salvamento passou a ser executado diretamente no player, sem navegação nem tela de carregamento, pelo mesmo procedimento do botão de salvar das listas: o botão exibe um indicador de progresso e passa a ✓ ao concluir. Aplica-se à versão web e ao aplicativo Android.' },
      { tipo: 'melhoria', texto: 'A tela Buscar deixou de exibir a seção "Na sua biblioteca" e o filtro Biblioteca: os resultados passam a se limitar a conteúdo externo (músicas, artistas e acervo litúrgico), e a consulta ao conteúdo já salvo permanece disponível na busca da própria Biblioteca. Aplica-se à versão web e ao aplicativo Android.' },
      { tipo: 'melhoria', texto: 'As notas de versão exibidas em Novidades passaram a adotar registro técnico e formal, com a descrição objetiva da causa, da alteração implementada e do efeito obtido. As entradas das nove versões anteriores foram revisadas segundo o mesmo padrão.' },
    ],
  },
  {
    versao: 596, data: '2026-11-07', titulo: 'Android: requisições de rede fora da fila nativa e reutilização de conexões',
    itens: [
      { tipo: 'melhoria', texto: 'No aplicativo Android, todas as requisições externas eram encaminhadas à camada nativa e processadas em uma fila única, de modo que consultas leves aguardavam a conclusão de páginas extensas. Os serviços que admitem CORS (busca de artistas do Cifra Club, Piped, LRCLIB, Wikipédia, TheAudioDB, iTunes, MusicBrainz e oEmbed do YouTube) passaram a ser consultados diretamente pelo WebView, como na versão web. A camada nativa fica reservada às origens sem CORS (páginas do Cifra Club e do YouTube, Deezer) e atua como contingência. Em simulação, o volume na fila nativa caiu de cerca de 210 para 85 requisições, sem tempo de espera. Disponível mediante atualização do aplicativo.' },
      { tipo: 'melhoria', texto: 'A camada nativa deixou de encerrar a conexão HTTP após cada resposta: a conexão retorna ao pool e é reutilizada nas requisições seguintes à mesma origem, o que elimina um novo handshake TLS por requisição. Disponível mediante atualização do aplicativo.' },
      { tipo: 'melhoria', texto: 'No aplicativo Android, a validade do cache das páginas de artista do Cifra Club (página principal, discografia e lista completa, com cerca de 500 kB cada) foi ampliada de 5 minutos para 1 hora, evitando novo download a cada acesso.' },
    ],
  },
  {
    versao: 595, data: '2026-11-07', titulo: 'Redução do tráfego de rede na busca, na abertura de músicas e nos dados de artistas',
    itens: [
      { tipo: 'melhoria', texto: 'Foi identificado consumo excessivo de rede: abrir o aplicativo e realizar uma busca gerava cerca de 500 requisições e 57 MB de tráfego. As causas eram o download integral de três páginas do Cifra Club por artista apenas para obter a foto e o download da página de resultados do YouTube (cerca de 560 kB) em cada consulta de vídeo. A foto passou a ser obtida pelo índice de busca de artistas (cerca de 2 kB), com a página do artista como alternativa, e a página do YouTube passou a ser consultada somente quando o Piped não responde em 1,5 s. Instâncias do Piped indisponíveis ou com resposta inválida (403/404 em HTML) são excluídas após a primeira falha, e as requisições simultâneas aguardam a sondagem inicial. O mesmo fluxo passou a gerar cerca de 3 MB; o tempo até os resultados da busca caiu de 3,8 s para 0,8 s, e o de abertura da música, de 1,6 s para 0,9 s.' },
      { tipo: 'melhoria', texto: 'A pré-carga automática dos três primeiros resultados da busca deixou de incluir a localização do áudio oficial (cinco consultas ao YouTube por música). A preparação completa ocorre apenas para a música selecionada.' },
      { tipo: 'melhoria', texto: 'Os dados de artistas armazenados no aparelho (foto, apresentação, canal e dados da TheAudioDB) passaram a ter validade de 24 horas, sem nova consulta à rede nesse período. O canal do YouTube passou a ser consultado uma única vez por artista em cada sessão.' },
      { tipo: 'melhoria', texto: 'Na seção "Sobre o artista", a apresentação é exibida assim que recebida, sem aguardar a fonte complementar (TheAudioDB). O acesso a "ver mais" é disponibilizado em até 2,5 s, e a consulta à Wikipédia passou a ter tempo limite.' },
      { tipo: 'correcao', texto: 'O botão de salvar do player não reconhecia a música aberta pela busca enquanto o vídeo ainda não estava registrado na prévia, exibindo "Abra a música para salvar" ou apenas navegando até a página. A verificação foi corrigida, e a música passa a ser salva na biblioteca.' },
      { tipo: 'melhoria', texto: 'As orações e o missal do dia (Pocket Terço) já armazenados no aparelho passaram a ser exibidos imediatamente, com a atualização do arquivo realizada em segundo plano.' },
    ],
  },
  {
    versao: 594, data: '2026-11-07', titulo: 'Correção no carregamento de fotos de artistas',
    itens: [
      { tipo: 'correcao', texto: 'Algumas fotos de artistas não eram exibidas na biblioteca, e a nova tentativa retornava o mesmo endereço inválido. As imagens passaram a ser solicitadas sem o cabeçalho Referer (referrerpolicy="no-referrer"), o que contorna a proteção contra hotlink de alguns servidores. Em caso de falha, as fontes alternativas (YouTube, Cifra Club, Deezer e Wikipédia) são consultadas sequencialmente até que uma imagem seja carregada com sucesso.' },
      { tipo: 'correcao', texto: 'Artistas sem foto exibem exclusivamente o ícone de artista, sem sobreposição com o ícone de música. Instalações que ainda apresentem os dois ícones sobrepostos estão em versão anterior e são atualizadas ao reiniciar o aplicativo.' },
    ],
  },
  {
    versao: 593, data: '2026-11-07', titulo: 'Downloads na resolução configurada (até 4K), fotos de artistas e prévias em HD',
    itens: [
      { tipo: 'correcao', texto: 'Downloads de vídeo podiam ser concluídos em 360p mesmo com a qualidade "Muito alta" selecionada: quando um cliente do YouTube não disponibilizava a resolução solicitada, o formato de 360p era aceito sem aviso. O downloader passou a consultar os demais clientes do YouTube e a selecionar a maior resolução disponível. Vídeos já baixados em 360p são baixados novamente de forma automática. Disponível mediante atualização do aplicativo.' },
      { tipo: 'novo', texto: 'Em Ajustes → Qualidade de mídia, as opções de vídeo foram ampliadas até 4K: Normal (480p), Alta (720p), Muito alta (1080p), 2K (1440p) e 4K (2160p). As opções de áudio passaram a indicar os parâmetros reais: Normal (AAC 48 kb/s), Alta (AAC 128 kb/s), Muito alta (Opus 160 kb/s, a maior taxa usual no YouTube) e Máxima (AAC 256 kb/s, quando disponível).' },
      { tipo: 'melhoria', texto: 'A alteração da qualidade configurada passou a disparar automaticamente um novo download das músicas já baixadas em outra qualidade, superior ou inferior, sem necessidade de acionar "Atualizar". Cada música permanece disponível offline até a conclusão da nova versão.' },
      { tipo: 'correcao', texto: 'Na biblioteca, artistas cuja foto falhava ao carregar exibiam os ícones de música e de microfone sobrepostos, ou o ícone de música no lugar da foto. Passou a ser exibido apenas o ícone de artista; o endereço inválido é descartado e uma nova foto é buscada.' },
      { tipo: 'melhoria', texto: 'As prévias das playlists passaram a iniciar com a miniatura do vídeo em alta definição (antes, uma imagem de baixa resolução ampliada) e a solicitar ao YouTube a reprodução em HD.' },
    ],
  },
  {
    versao: 592, data: '2026-11-07', titulo: 'Android: geração de partitura exclusivamente por IA no aparelho',
    itens: [
      { tipo: 'melhoria', texto: 'No aplicativo Android, a geração de partitura deixou de solicitar a seleção de um arquivo de áudio: o modelo de IA executado no aparelho utiliza sempre o áudio da própria música. Em caso de falha (por exemplo, música sem vídeo), são oferecidas as opções de nova tentativa ou de criação manual no editor. A opção "Abrir MusicXML" foi removida da tela inicial do editor no aplicativo.' },
    ],
  },
  {
    versao: 591, data: '2026-11-07', titulo: 'Desempenho na geração de partituras e de karaokê',
    itens: [
      { tipo: 'melhoria', texto: 'A transcrição de partituras no aparelho passou a utilizar um motor de inferência mais eficiente, com resultado idêntico: em teste, 15 segundos de áudio foram processados em 2 segundos (antes, 28). A memória de cada segmento passou a ser liberada após o processamento, o que elimina a degradação progressiva de desempenho, e as músicas longas deixaram de exceder o limite de memória da GPU.' },
      { tipo: 'melhoria', texto: 'No aplicativo Android, a separação de voz para o karaokê passou a operar em pipeline: enquanto o modelo processa um segmento, o seguinte é preparado e o anterior é gravado (antes, as etapas eram sequenciais). Os dois canais estéreo passaram a ser processados em conjunto, e o modelo permanece carregado entre uma música e outra. O resultado sonoro é o mesmo. Disponível mediante atualização do aplicativo.' },
    ],
  },
  {
    versao: 590, data: '2026-11-07', titulo: 'Reformulação visual das telas de partitura',
    itens: [
      { tipo: 'melhoria', texto: 'As telas de partitura receberam nova interface. Na listagem, a opção "Gerar com IA" passou a ter destaque, seguida de "Nova partitura" e do acervo, em cartões. Durante a geração, um indicador circular informa o progresso percentual e o tempo decorrido, e as etapas são apresentadas em linha do tempo. Na partitura concluída, as vozes (Coral, Coral do áudio e Melodia) ficam logo abaixo da prévia, e os botões Editar e Salvar permanecem fixos no rodapé.' },
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
