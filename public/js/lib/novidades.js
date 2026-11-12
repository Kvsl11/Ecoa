// O que mudou em cada versão do app, em registro técnico e formal (a causa, o que foi alterado e o efeito, com os
// números medidos quando houver; impessoal, sem gíria). A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 663, data: '2026-11-12', titulo: "Compartilhar: cartões da Letra e do Vídeo voltam a ser gerados, imagem em 4K e vídeo em Full HD; link compartilhado abre direto a música",
    itens: [
      { tipo: 'correcao', texto: "Desde a versão 655, a função de desenho do cartão de compartilhar recebia um parâmetro chamado t (o instante da animação) que ocultava a função de tradução de mesmo nome. Ao escrever \"Música · artista\" no cartão da Letra e o rótulo \"Videoclipe\" no cartão do Vídeo, o desenho era interrompido com erro: a prévia da Letra exibia apenas o título, sem os versos, e nem a imagem nem o vídeo do cartão eram gerados, de modo que apenas o texto era enviado e aparecia o aviso de que o aparelho não gera o vídeo. A tradução passou a usar outro nome, e os três cartões voltaram a ser desenhados por inteiro; o cartão da Letra e o do Vídeo voltaram a ser enviados em vídeo com o trecho da música quando ela está baixada. Um teste passou a desenhar os três cartões." },
      { tipo: 'melhoria', texto: "A imagem do cartão passou a ser gerada no dobro da resolução, em 4K (2160 × 3840 px no cartão da Música, 2160 × 2160 px no da Letra e 2160 × 1840 px no do Vídeo), em JPEG com qualidade 95%; se o aparelho não tiver memória para ela, é gerada em Full HD (1080 px de largura). O vídeo do cartão, em Full HD (1080 px de largura), passou de 6 para 12 Mbit/s, e o som, de 160 para 192 kbit/s. A capa obtida pela cópia de reserva passou de 900 para 1600 px." },
      { tipo: 'correcao', texto: "Ao abrir um link de música compartilhado com o player aberto, a música era enviada apenas ao player, e permanecia na frente uma tela intermediária com os botões \"Abrir a música\" e \"Procurar na busca\"; ao voltar da música, essa tela também reaparecia. Com a conta, o link passou a abrir diretamente a tela da música, no aplicativo Android, no navegador do celular, no tablet e no computador, e é substituído pelo Início no histórico: ao sair da música, é exibido o Início. Sem a conta, a música inteira não é aberta: é exibida somente a prévia de 30 segundos do Deezer, no formato da prévia do Spotify — a capa, o nome, o artista, a barra de tempo e o botão de reprodução, sem texto adicional —, iniciada automaticamente onde o navegador permite e somente quando a faixa encontrada tem o mesmo nome e o mesmo artista. Durante a prévia, o fundo é formado por três camadas desfocadas da própria capa, que giram e se deslocam lentamente, e por três focos de luz nas cores extraídas da capa, cuja intensidade acompanha as batidas do trecho (análise do áudio da prévia; onde ela não é permitida, os focos pulsam em compasso fixo); a capa recebe aproximação e deslocamento lentos, flutuação leve e um reflexo periódico. Ao fim da prévia (ou em \"Pular\"), é exibida a tela de entrada do aplicativo; após o login com a conta Google, a música abre inteira. Sem a prévia, a tela de entrada é exibida diretamente." },
      { tipo: 'melhoria', texto: "Pendente: os cartões, a gravação em MP4 e a prévia (390 px e 1280 px, tocando até o fim e passando à tela de entrada) foram conferidos em navegador; o envio pelo aplicativo Android e a abertura do link após o login não foram executados em aparelho." },
    ],
  },
  {
    versao: 662, data: '2026-11-12', titulo: "Prévia do editor no modo Letra sem os acordes; painel \"Partes, acordes e ferramentas\" reorganizado",
    itens: [
      { tipo: 'correcao', texto: "Na tela de edição, com o modo Letra selecionado, a aba \"Ver como fica\" exibia a cifra completa, com os acordes acima da letra, embora esse modo permita corrigir apenas o texto. A prévia passou a acompanhar o modo de edição: no modo Letra, os acordes, as linhas só de acordes e as partes apenas instrumentais deixam de ser exibidos; nos modos Letra e cifra e Colchetes, a prévia continua com os acordes. A cifra guardada não é alterada." },
      { tipo: 'melhoria', texto: "O painel \"Partes, acordes e ferramentas\" do editor exibia em duas faixas de rolagem lateral, com botões de mesma aparência, os atalhos para inserir uma parte (Chorus, Verse, Bridge…) e os atalhos para ir até as partes já escritas; partes de mesmo nome apareciam repetidas (\"Bridge\", \"Bridge\") e as duas faixas pareciam duplicadas. O painel passou a ser dividido em grupos com título — Inserir parte, Ferramentas, Acordes e Ir até a parte —, com os botões quebrando linha em vez de ficarem ocultos na rolagem lateral; as partes da música são numeradas na ordem em que aparecem. No modo Letra, mudar o tom e completar a cifra deixam de ser exibidos, porque esse modo não altera os acordes." },
      { tipo: 'melhoria', texto: "Pendente: conferido em navegador, em 390 px, em português e inglês; não executado em aparelho." },
    ],
  },
  {
    versao: 661, data: '2026-11-12', titulo: 'Música salva pela busca ou pelo álbum já entra com a capa do álbum, também na notificação do download',
    itens: [
      { tipo: 'correcao', texto: 'Ao salvar uma música pelo botão + da busca, da página do álbum ou do artista, a música era gravada sem capa, embora a linha exibisse a capa do álbum. Até a procura da capa terminar em segundo plano, a biblioteca, a tela da música, o player e a notificação do download exibiam o quadro do vídeo ou a foto do artista. A capa exibida na linha passou a ser gravada com a música no momento em que ela é salva; sem ela, é usada a capa já conhecida para o título e o artista. Capas provisórias (quadro do vídeo, foto do artista) não são gravadas. Em teste, a música salva pela busca, que antes ficava sem capa, passou a ter a capa do álbum três segundos após o toque.' },
      { tipo: 'correcao', texto: 'A notificação do download e a de reprodução passaram a usar a capa do álbum já conhecida quando a música ainda tem apenas uma capa provisória; o quadro do vídeo é usado somente quando não há outra.' },
      { tipo: 'melhoria', texto: 'As músicas já salvas que continuam sem a capa do álbum a procuram novamente, em segundo plano. A capa escolhida manualmente é mantida.' },
      { tipo: 'melhoria', texto: 'Pendente: conferido em navegador, na busca; não executado em aparelho. A notificação do download depende do aplicativo de Android e não foi exibida no teste.' },
    ],
  },
  {
    versao: 660, data: '2026-11-12', titulo: 'Transição entre músicas: fim no som e funcionamento em segundo plano; "Sobre o artista" no idioma do aparelho; tela de edição na cor da música',
    itens: [
      { tipo: 'correcao', texto: 'O crossfade e o automix eram calculados sobre os últimos segundos do arquivo. Em gravações com silêncio no fim, a transição cruzava silêncio com silêncio: ouvia-se a música acabar, uma pausa e a próxima começar. Nas músicas baixadas e no áudio próprio, o aplicativo passou a localizar onde o som começa e termina (acima de 3% do volume da gravação) e a transição termina onde o som termina, com a próxima entrando onde o som dela começa. Em teste com faixas de 40 s e 4 s de silêncio final, o crossfade de 6 s passou de 34–40 s para 30–36 s.' },
      { tipo: 'correcao', texto: 'O passo da transição dependia apenas do relógio da página, que o celular limita ou suspende com o aplicativo em segundo plano ou a tela apagada; nesses casos a transição começava tarde, avançava aos saltos ou não ocorria. O passo passou a ser executado também a cada aviso de tempo da própria música (arquivo ou YouTube). Em teste com o relógio de 50 ms suspenso, o crossfade e o automix ocorreram no ponto previsto.' },
      { tipo: 'melhoria', texto: 'A próxima música passou a ser aberta sem som antes da hora da transição (0,6 s nos arquivos do aparelho e 3 s no YouTube) e a voltar ao ponto de entrada no início da subida de volume, para que o tempo de abertura não consuma a transição.' },
      { tipo: 'correcao', texto: 'Com o aparelho em inglês ou espanhol, a apresentação do artista em "Sobre o artista" era sempre a da Wikipédia em português, e a linha de números exibia "mi inscritos". A apresentação passou a ser buscada na Wikipédia do idioma do aparelho, com a versão em português como reserva, e a biografia de reserva (TheAudioDB) segue o mesmo idioma; os números passaram a ser abreviados e traduzidos no idioma do aparelho.' },
      { tipo: 'melhoria', texto: 'A tela de edição da música foi reorganizada: a tela inteira adota a cor da música, nos modos claro e escuro; a capa exibida é a da própria música, e não mais o quadro do vídeo recortado; os ícones deixaram a cor de destaque; "Editar" e "Ver como fica" ficam na primeira linha, com desfazer, refazer e tela cheia, e os três modos de edição na linha seguinte; os detalhes da música mostram em uma linha o que está preenchido; "Cancelar" e "Salvar" têm o mesmo tamanho. O guia "Como escrever" foi removido.' },
      { tipo: 'melhoria', texto: 'Pendente: a transição foi medida em navegador com arquivos de teste; não foi executada em aparelho, e a transição entre vídeos do YouTube não pôde ser reproduzida no ambiente de teste. A apresentação do artista foi conferida na Wikipédia em espanhol; a consulta em inglês não respondeu durante a conferência.' },
    ],
  },
  {
    versao: 659, data: '2026-11-12', titulo: 'Destaque máximo dos acordes com brilho uniforme; barra de reprodução sem contorno nos botões; folha "Adicionar a esta playlist" com botões alinhados',
    itens: [
      { tipo: 'correcao', texto: 'No nível Máximo do destaque dos acordes, a caixa escura atrás de cada acorde era semitransparente e acompanhava a opacidade de 50% aplicada aos acordes das linhas já cantadas na letra sincronizada; na mesma tela, parte das caixas aparecia escura, com contorno forte, e parte clara e apagada. A caixa e o contorno foram substituídos por um brilho na cor do próprio acorde (um halo claro no modo claro), e os acordes passaram a ter opacidade integral em todas as linhas; a linha já cantada continua indicada pela letra. Todos os acordes ficam com a mesma aparência.' },
      { tipo: 'melhoria', texto: 'Na barra de reprodução do celular, o contorno escuro em volta do botão da música salva e do ícone do fone conectado foi retirado, nos modos claro e escuro. O botão passou a ter a borda na cor do próprio fundo, e o ícone do fone, uma única camada na cor do aplicativo.' },
      { tipo: 'correcao', texto: 'Na folha "Adicionar a esta playlist", o botão "Selecionar todas" dividia o rodapé com "Cancelar" e "Adicionar"; quando ele era ocultado (lista vazia ou busca na internet), os dois botões ficavam encostados à direita, com larguras diferentes. Os dois passaram a ocupar a largura inteira, com o mesmo tamanho (168 px cada em tela de 390 px), e "Selecionar todas" foi movido para baixo do campo de busca. O botão "Adicionar" deixou de exibir a quantidade de músicas marcadas.' },
      { tipo: 'correcao', texto: 'Com o aparelho em inglês ou espanhol, o atalho "Procurar outras na internet" da mesma folha exibia a palavra "outras" em português. O texto passou a ter entrada própria nos dois dicionários.' },
      { tipo: 'melhoria', texto: 'Pendente: as alterações foram conferidas em navegador, em 390 px, nos modos claro e escuro, em inglês e espanhol; não foram executadas em aparelho. No aplicativo de Android, elas chegam quando a atualização é instalada em Ajustes.' },
    ],
  },
  {
    versao: 658, data: '2026-11-12', titulo: 'Aplicativo de Android: o conteúdo só muda quando a atualização é instalada em Ajustes',
    itens: [
      { tipo: 'correcao', texto: 'No aplicativo de Android, cada versão nova do site era baixada e ativada automaticamente, com recarga da tela durante o uso, antes de a atualização ser instalada em Ajustes → Sobre → Atualização do app. A atualização continuava indicada, porque ela instala o APK, cujo número não havia mudado. O pacote de arquivos baixado por um APK passou a permanecer em uso enquanto esse APK estiver instalado: uma versão nova do site não é baixada nem recarrega a tela. O conteúdo é trocado quando o APK é atualizado em Ajustes. No site, aberto pelo navegador, a atualização automática foi mantida.' },
      { tipo: 'melhoria', texto: 'Em simulação em navegador, duas versões seguidas do site com o mesmo número de APK não alteraram o pacote em uso nem pediram recarga da tela; o registro com outro número de APK baixou o pacote novo e removeu o anterior; sem número de APK, a versão nova entrou automaticamente.' },
      { tipo: 'melhoria', texto: 'Pendente: a alteração não foi executada em aparelho. Ela passa a valer com a publicação desta versão do site, sem exigir um APK novo. Em consequência, as correções publicadas no site deixam de chegar ao aplicativo até a atualização ser instalada em Ajustes.' },
    ],
  },
  {
    versao: 657, data: '2026-11-12', titulo: 'Desempenho: gravações da biblioteca agrupadas e listas compridas mais leves; textos de progresso traduzidos',
    itens: [
      { tipo: 'correcao', texto: 'Cada alteração em uma música gravava a biblioteca inteira no armazenamento do aparelho, de forma síncrona. Ao abrir uma playlist de 28 músicas e iniciar a reprodução, com biblioteca de teste de 300 músicas (2,3 MB), a biblioteca era regravada 57 vezes em 20 segundos, e a tela ficava bloqueada durante cada gravação. As alterações consecutivas passaram a ser reunidas em uma única gravação, 600 ms após a última e no máximo 2,5 s após a primeira; o que está pendente é gravado quando o aplicativo vai para segundo plano ou é fechado. No mesmo teste, as gravações caíram de 57 para 7, e o tempo de tela bloqueada por elas, de 959 ms para 106 ms, medido em navegador de computador.' },
      { tipo: 'melhoria', texto: 'Nas listas compridas (biblioteca, Músicas curtidas e playlist), todas as linhas eram calculadas e desenhadas na abertura, inclusive as que estão fora da tela. As linhas fora da área visível passaram a ser montadas apenas ao rolar. Com 400 músicas, em tamanho de tablet, o tempo em tarefas longas na abertura da lista caiu de 723 ms para 420 ms, medido em navegador de computador.' },
      { tipo: 'melhoria', texto: 'Na abertura do aplicativo, o tema passou a ser lido do bloco de ajustes, e não mais da biblioteca inteira. Com o player aberto, a conferência do lugar do vídeo passou de 60 para 20 vezes por segundo quando o vídeo já está posicionado. Na tela inicial, a fileira "Clipes de artistas parecidos" passou a consultar o Deezer e o YouTube somente quando a página é rolada até as fileiras de clipes.' },
      { tipo: 'correcao', texto: 'Com o aparelho em inglês ou espanhol, os textos de progresso dos botões permaneciam em português ("Baixando…", "Instalando…", "Limpando…", entre outros), porque a varredura dos textos não incluía palavras isoladas seguidas de reticências. Foram acrescentadas 33 entradas aos dois dicionários, e um texto conhecido seguido de reticências ou de dois-pontos passou a ser traduzido mesmo sem entrada própria.' },
      { tipo: 'melhoria', texto: 'Pendente: as medições foram feitas em navegador de computador, em tamanho de tablet (800 × 1280), com bibliotecas de teste; não foram executadas em tablet nem em celular. O custo de desenho do aparelho (o vídeo, a capa animada e as animações do painel "Tocando agora") não foi medido e pode responder por parte dos travamentos observados.' },
    ],
  },
  {
    versao: 656, data: '2026-11-12', titulo: 'Artista e álbum pelo catálogo do Deezer; busca com músicas e artistas em alta no Brasil e no mundo; mais clipes na tela inicial',
    itens: [
      { tipo: 'melhoria', texto: 'A página do artista, a lista de álbuns e a página do álbum eram montadas com a discografia do Cifra Club, que traz apenas as músicas com cifra. Passaram a usar o catálogo do Deezer: as 50 músicas mais tocadas, todos os lançamentos (álbuns, EPs, singles e coletâneas, com capa, ano e tipo) e, no álbum, as faixas, a data de lançamento, a duração e a gravadora. Do Cifra Club vem apenas a cifra, procurada quando a música é aberta; a lista das músicas com cifra fica na aba "Com cifra". O artista que o Deezer não tem continua com a página anterior. No teste com um artista, foram exibidos 50 músicas e 75 lançamentos.' },
      { tipo: 'melhoria', texto: 'A opção "Ver álbum" de uma música e a seção Artistas da busca passaram a consultar o Deezer primeiro; o Cifra Club é usado quando o Deezer não devolve resultado. Páginas de karaokê, tributo e covers listadas como artistas são descartadas da busca.' },
      { tipo: 'novo', texto: 'A tela de busca, sem texto digitado, exibia apenas conteúdo católico. Foram incluídas três fileiras: "Em alta no Brasil" e "Em alta no mundo" (as 40 primeiras músicas das paradas do Deezer) e "Artistas em alta" (20 artistas), intercaladas com "Católicas em alta" e "Artistas católicos".' },
      { tipo: 'melhoria', texto: 'Na tela inicial, a fileira "Mais clipes dos seus artistas" era limitada a 12 clipes de 4 artistas. As fileiras passaram a crescer com a rolagem lateral: a dos seus artistas considera até 12 artistas, e a nova fileira "Clipes de artistas parecidos" percorre os artistas relacionados no Deezer (20 por artista). A fileira "Seus videoclipes" passou de 12 para até 40 clipes. Em teste com biblioteca de 2 artistas, a rolagem levou as fileiras de 12 para 20 e de 12 para 60 clipes.' },
      { tipo: 'melhoria', texto: 'Pendente: as telas foram verificadas em navegador (390 × 800), em português e em inglês, com biblioteca de teste; não foram executadas em aparelho nem no aplicativo de Android. A abertura de uma música a partir da lista do Deezer foi executada em navegador com uma música, que abriu com a cifra. Sem internet, as páginas do Deezer não abrem.' },
    ],
  },
  {
    versao: 655, data: '2026-11-12', titulo: 'Idioma do aparelho (português, inglês e espanhol); cifra das músicas em coreano sobre a letra em hangul; tom na playlist; artistas da prévia',
    itens: [
      { tipo: 'novo', texto: 'O aplicativo exibia todos os textos em português, independentemente do idioma configurado no aparelho. Passou a seguir o idioma do aparelho: português do Brasil, inglês e espanhol; nos demais idiomas, é exibido em inglês. Os textos das telas, dos menus, dos avisos do sistema, do cartão de convite e do PDF são trocados por dicionários com cerca de 2.600 entradas em inglês e 2.400 em espanhol; datas e números passaram a usar o formato do idioma. Os nomes de músicas, artistas e playlists, as letras, as cifras e os textos da liturgia não são traduzidos.' },
      { tipo: 'melhoria', texto: 'Dezenove telas foram conferidas em inglês e em espanhol, na largura de 390 px: a verificação automática não encontrou texto além da largura da tela nem cortado em botões e cartões. Dois rótulos em espanhol que quebravam no meio da palavra foram encurtados ("Tiempos litúrgicos" e "Descargar lo guardado").' },
      { tipo: 'novo', texto: 'Os textos nativos do Android (widget da tela inicial, botões e canais de notificação do player e dos downloads) passaram a seguir o idioma do aparelho. Disponível mediante atualização do aplicativo.' },
      { tipo: 'correcao', texto: 'Nas músicas em coreano, a letra sincronizada vem em hangul e a cifra dos sites traz a letra romanizada. A comparação palavra a palavra descartava o hangul, os acordes não eram passados para a letra sincronizada e a aba Cifra exibia a letra romanizada, sem acompanhar o canto. As palavras em hangul passaram a ser romanizadas (Romanização Revisada) e comparadas pelo som, com tolerância de uma letra (duas nas palavras de sete letras ou mais): os acordes são exibidos sobre a mesma letra da aba Letra, com o destaque da frase cantada. Em um trecho de teste de quatro frases, os doze acordes foram posicionados.' },
      { tipo: 'melhoria', texto: 'Na lista de músicas da playlist, o tom da música passou a ser exibido ao lado do menu de cada faixa, como já ocorria nas Músicas curtidas.' },
      { tipo: 'melhoria', texto: 'Na prévia da playlist, nas músicas com mais de um artista, apenas o nome do primeiro era exibido e as fotos não respondiam ao toque. O nome passou a incluir os participantes entre parênteses ("Lady Gaga (feat. Bruno Mars)"), e cada foto e cada nome abre a página do respectivo artista.' },
      { tipo: 'melhoria', texto: 'Pendente: a tradução, o tom na playlist e a prévia foram verificados em navegador e por testes automatizados; não foram executados em aparelho. Os textos nativos do Android não foram compilados nem executados. Permanecem em português as respostas do Lumen, as notas das versões anteriores a esta e parte das mensagens de erro vindas do Android. A cifra em coreano foi verificada por teste automatizado com um trecho de letra; não foi executada no aplicativo com a música em que o problema foi observado.' },
    ],
  },
  {
    versao: 654, data: '2026-11-11', titulo: 'Fila de reprodução na mesma ordem em que a playlist e as Músicas curtidas estão ordenadas',
    itens: [
      { tipo: 'correcao', texto: 'A opção "Ordenar por" da playlist e das Músicas curtidas alterava apenas a lista exibida. A fila do player era montada sempre na ordem salva (na playlist, a ordem personalizada; nas Músicas curtidas, a ordem interna da biblioteca), de modo que uma lista ordenada por artista era reproduzida em outra sequência. A fila passou a ser montada na ordenação escolhida em cada lista: título, artista, álbum ou adicionadas recentemente. Ao alterar a ordenação com uma música em reprodução, a fila é refeita na nova ordem a partir da música atual; ao desligar o aleatório, a fila retorna à ordenação da lista.' },
      { tipo: 'melhoria', texto: 'A lista exibida e a fila passaram a usar a mesma rotina de ordenação. Na playlist ordenada por título ou por artista, a comparação deixou de diferenciar maiúsculas e acentos, o que mantém juntas as músicas do mesmo artista escrito de formas diferentes. A ordem salva da playlist e os repertórios de missa não foram alterados.' },
      { tipo: 'melhoria', texto: 'Pendente: a ordenação foi verificada por testes automatizados e a abertura do aplicativo, em navegador; a reprodução em sequência não foi executada no aplicativo nem em aparelho. Os filtros das Músicas curtidas (por exemplo, "Baixadas") não restringem a fila, que continua incluindo todas as músicas com áudio ou vídeo.' },
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
