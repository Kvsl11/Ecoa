// O que mudou em cada versão do app, em registro técnico e formal (a causa, o que foi alterado e o efeito, com os
// números medidos quando houver; impessoal, sem gíria). A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 627, data: '2026-11-11', titulo: 'Listas de músicas: fotos dos artistas agrupadas quando há mais de um',
    itens: [
      { tipo: 'novo', texto: 'Nas linhas das listas (biblioteca, playlists, repertórios e busca), a música com mais de um artista exibia somente a foto do primeiro. Passou a exibir a foto do primeiro e, sobreposta em parte a ela, a do segundo; com três ou mais artistas, após as duas fotos vem um marcador "+N" com a quantidade restante. São considerados os nomes separados por vírgula ou "&" e o participante indicado no título ("feat.", "part."). As duplas reconhecidas como um único artista e os cantos da liturgia continuam com uma foto só.' },
      { tipo: 'melhoria', texto: 'A foto do segundo artista usa a última conhecida no aparelho; quando não há, é procurada assim que a linha aparece na tela, e entra no lugar do desenho padrão quando carrega. Nada é guardado na música; portanto, nenhuma revisão das músicas salvas é necessária.' },
      { tipo: 'melhoria', texto: 'Pendente: a exibição foi verificada em navegador com tela de celular, com as fotos simuladas; a busca real da foto do segundo artista e a validação em aparelho Android ainda não foram realizadas.' },
    ],
  },
  {
    versao: 626, data: '2026-11-11', titulo: 'Widget da tela inicial refeito: três formatos conforme o tamanho, capa arredondada e fundo na cor da capa',
    itens: [
      { tipo: 'correcao', texto: 'O widget tinha um único leiaute, com a capa em tamanho fixo (96 dp) e os botões alinhados à esquerda abaixo do texto; redimensionado, os elementos ficavam cortados ou desalinhados. Passou a ter três formatos, com as mesmas peças: uma linha (4 × 1), com a capa pequena, o nome, o artista e os botões à direita; o padrão (4 × 2), com a capa na altura inteira e os botões centralizados; e o grande (3 linhas ou mais), com a capa em cima. No Android 12 ou mais novo, o sistema troca o formato ao redimensionar; nas versões anteriores, o formato é escolhido pela altura do widget. O tamanho mínimo ao redimensionar passou de 250 × 110 dp para 180 × 50 dp. Disponível mediante atualização do aplicativo.' },
      { tipo: 'melhoria', texto: 'A capa do widget passou a ser recortada em quadrado, reduzida a 320 pixels e desenhada com os cantos arredondados; o fundo do widget recebe a cor média da capa, escurecida, e fica na cor padrão quando a capa quase não tem cor. Sem música ou sem capa, aparece um quadro com a logo do Ecoa. O botão de tocar e pausar passou a ser um círculo branco com o símbolo escuro, e os botões respondem ao toque. Disponível mediante atualização do aplicativo.' },
      { tipo: 'melhoria', texto: 'Pendente: o widget é código e recursos nativos do Android e não foi executado em aparelho; a compilação é conferida pela montagem do APK no workflow, e a imagem de demonstração enviada é uma simulação do leiaute, não uma captura de tela.' },
    ],
  },
  {
    versao: 625, data: '2026-11-11', titulo: 'Página inicial sem a liturgia do dia e com as músicas mais tocadas',
    itens: [
      { tipo: 'melhoria', texto: 'O atalho "Liturgia de hoje", o cartão da liturgia do dia e o filtro "Liturgia" foram retirados da página inicial, pois o mesmo conteúdo está na aba Liturgia. O lugar do atalho passou a ser ocupado por mais uma música recente (8 atalhos de músicas e repertórios, antes 7).' },
      { tipo: 'novo', texto: 'No lugar do cartão da liturgia, a página inicial passou a exibir "Suas mais tocadas": até 12 músicas da biblioteca, ordenadas pelo tempo ouvido nos últimos 30 dias (os mesmos dados das Estatísticas). A seção aparece a partir de 3 músicas ouvidas no período.' },
      { tipo: 'melhoria', texto: 'A liturgia de hoje, a do próximo domingo e as das datas dos repertórios futuros continuam sendo guardadas para uso sem internet ao abrir a página inicial.' },
    ],
  },
  {
    versao: 624, data: '2026-11-11', titulo: 'Controle de mídia do Android: comandos atendidos em segundo plano, botões sem abrir o aplicativo e aviso dispensável com a música pausada; cartões com a marca em uma cor e personalização nos três',
    itens: [
      { tipo: 'correcao', texto: 'Com o aplicativo em segundo plano e a música pausada, a página fica oculta e com os temporizadores suspensos; o comando de tocar, pular ou voltar enviado pelo aviso, pelo widget ou pelo fone só era processado quando o aplicativo voltava ao primeiro plano. A página passou a ser reativada por 12 segundos a cada comando recebido, antes da entrega dele. Disponível mediante atualização do aplicativo.' },
      { tipo: 'correcao', texto: 'O player do Android e os botões do fone enviavam "alternar" tanto para tocar quanto para pausar; um comando repetido ou atrasado invertia o estado (pausava o que deveria tocar). Passaram a enviar "tocar" e "pausar" explícitos, e a interface só age quando o estado atual difere do pedido. Disponível mediante atualização do aplicativo.' },
      { tipo: 'correcao', texto: 'Os botões do aviso de "tocando" e do widget abriam a tela do aplicativo a cada toque. Passaram a abrir uma tela invisível que entrega o comando e se fecha; a tela do aplicativo só vem para a frente quando o comando depende dela (aplicativo fechado, ou tocar e pular música reproduzida pelo YouTube, que não toca com a página oculta). Disponível mediante atualização do aplicativo.' },
      { tipo: 'correcao', texto: 'O aviso de "tocando" pertencia a um serviço mantido em primeiro plano também com a música pausada, o que impedia dispensá-lo. O serviço passou a ficar em primeiro plano somente durante a reprodução; pausado, o aviso permanece com os botões e pode ser dispensado, o que encerra o serviço e retira a sessão do player do Android até a próxima reprodução. Disponível mediante atualização do aplicativo.' },
      { tipo: 'novo', texto: 'A tela "Personalizar" da folha de compartilhamento, antes restrita ao cartão da letra, passou a valer para os três cartões (Música, Letra e Vídeo) e a oferecer, como fundo, somente a cor, a capa escurecida ou uma foto escolhida no aparelho. O estilo e o alinhamento do texto continuam próprios do cartão da letra.' },
      { tipo: 'melhoria', texto: 'A marca do Ecoa nos cartões passou a ser desenhada em uma só cor, a do texto do cartão (o símbolo sem o quadrado azul ao fundo e o nome ao lado).' },
      { tipo: 'melhoria', texto: 'Pendente: as alterações do controle de mídia são do código nativo do Android e não foram executadas em aparelho; a compilação é conferida pela montagem do APK no workflow. A música reproduzida pelo YouTube continua sem tocar com o aplicativo em segundo plano (regra do YouTube).' },
    ],
  },
  {
    versao: 623, data: '2026-11-11', titulo: 'Compartilhamento refeito: carrossel com os cartões Música, Letra e Vídeo, escolha dos versos em tela própria e personalização do cartão da letra',
    itens: [
      { tipo: 'novo', texto: 'A folha de compartilhamento passou a exibir os cartões em carrossel: o cartão central em destaque, os vizinhos visíveis nas laterais e a passagem de um para outro por arrasto ou pelas abas, cujo marcador desliza até a aba escolhida. Antes havia uma única prévia, trocada sem transição.' },
      { tipo: 'novo', texto: 'Foi incluído o cartão "Vídeo" (1080 × 920 pixels), com o quadro do videoclipe, a capa, o título, o artista e a duração; o link compartilhado é o do videoclipe. O cartão só é oferecido às músicas com videoclipe. Aberta pelo player em modo vídeo, a folha inicia nesse cartão.' },
      { tipo: 'melhoria', texto: 'O cartão "Música" passou ao formato vertical de 1080 × 1920 pixels, com a capa, o título e o artista em um painel escuro sobre a cor escolhida; o cartão "Letra" passou a 1080 × 1080 pixels, com os versos em corpo de até 104 pixels (antes 96), reduzido conforme a quantidade de texto.' },
      { tipo: 'novo', texto: 'A escolha dos versos passou a ocupar uma tela própria, na cor da música, com os versos em corpo maior e os escolhidos em destaque (até 5). A nova tela "Personalizar" do cartão da letra oferece a cor, a capa escurecida como fundo, quatro estilos de texto (Clássico, Largo, Estreito e Inclinado) e o alinhamento à esquerda ou centralizado.' },
      { tipo: 'melhoria', texto: 'Pendente: os três cartões, a troca entre eles, a escolha dos versos, a personalização e a gravação da imagem (JPEG de cerca de 150 kB) foram verificados em navegador com tela de celular; o arrasto do carrossel por toque e o envio pela parte nativa (WhatsApp, Instagram e lista do sistema) não foram validados em aparelho Android. Figurinhas sobre o cartão não foram implementadas.' },
    ],
  },
  {
    versao: 622, data: '2026-11-11', titulo: 'Troca de música em vídeo sem o quadro cinza do Android',
    itens: [
      { tipo: 'correcao', texto: 'Na troca de uma música para a outra no modo vídeo, o elemento de vídeo ficava por um instante sem imagem (arquivo ainda em carregamento), e o WebView do Android desenhava nesse intervalo o seu cartaz padrão: um quadro cinza com o triângulo de reprodução. Os vídeos do player, da capa animada e das prévias de playlist passaram a receber um cartaz transparente de 1 × 1 pixel; no intervalo fica apenas o fundo preto do vídeo, até a chegada do primeiro quadro.' },
      { tipo: 'melhoria', texto: 'Pendente: a alteração foi verificada por testes automatizados e pela conferência do atributo nos elementos; o quadro cinza é desenhado somente pelo WebView do Android e a ausência dele ainda não foi confirmada em aparelho.' },
    ],
  },
  {
    versao: 621, data: '2026-11-10', titulo: 'Tela de edição reorganizada; "Editar" nos menus; opção única de karaokê; nome longo em laço contínuo e em sincronia',
    itens: [
      { tipo: 'melhoria', texto: 'A tela de edição foi reorganizada. Antes do texto havia cinco faixas de controles (modos, desfazer e prévia, partes, acordes e estrutura). Os modos passaram a se chamar "Letra", "Letra e cifra" e "Colchetes", com uma frase que descreve o modo escolhido; a alternância entre edição e prévia recebeu os rótulos "Editar" e "Ver como fica"; as partes, os acordes, o tom e a estrutura foram reunidos no bloco recolhível "Partes, acordes e ferramentas", cujo estado (aberto ou fechado) é lembrado. Com o bloco fechado, o texto passou a começar 39 pixels acima em uma tela de 412 pixels de largura. O rodapé com Cancelar e Salvar deixou de exibir o texto entre ele e a barra do aplicativo.' },
      { tipo: 'melhoria', texto: 'A opção "Editar cifra" (ou "Editar a cifra") dos menus da música passou a se chamar "Editar", pois a tela edita o título, o artista, a letra e a cifra. No menu do player, a opção, antes exibida somente com a letra em tela cheia, passou a aparecer sempre que a música está salva na biblioteca.' },
      { tipo: 'melhoria', texto: 'O menu do player exibia duas opções de karaokê ("Karaokê (tirar a voz)" ou "Desligar o karaokê" e, em separado, "Apagar o karaokê do aparelho"). Passou a exibir uma única: "Gerar karaokê" enquanto a música não tem o karaokê no aparelho e "Apagar o karaokê" depois de gerado (apagar com o karaokê ligado desliga-o antes). Ligar, desligar e ajustar o volume da voz continuam no microfone da letra em tela cheia.' },
      { tipo: 'correcao', texto: 'Na letra em tela cheia, o nome longo da música saía pela esquerda, a linha ficava vazia e o nome reaparecia de uma vez: a regra das reticências do nome parado tinha precedência e ocultava a cópia que vem atrás do nome. A regra foi corrigida e o nome passou a girar em laço contínuo, como na barra do player (reproduzido e conferido em navegador, quadro a quadro).' },
      { tipo: 'correcao', texto: 'O nome da música e o do artista, quando longos, giravam cada um com a sua distância e a sua duração, e um parava no meio da volta do outro. As linhas do mesmo bloco passaram a usar a distância da mais comprida (a mais curta recebe um espaço maior até a cópia), com a mesma duração e a mesma largada; em medição no navegador, as duas linhas apresentaram o mesmo deslocamento em todos os instantes amostrados.' },
      { tipo: 'melhoria', texto: 'No modo de leitura da letra (botão do olho), o nome da música e o artista passaram a permanecer no topo; continuam ocultos a barra de progresso, o tempo, o play e os demais controles do rodapé.' },
      { tipo: 'melhoria', texto: 'Nos cartões do player com rolagem lateral ("Vídeos relacionados" e os demais), o trilho passou a terminar 10 pixels antes da borda do cartão, dos dois lados, com os cantos arredondados; antes, o vídeo cortado pela rolagem encostava na borda do cartão.' },
      { tipo: 'melhoria', texto: 'Pendente: a tela de edição e o giro do nome foram verificados em navegador; as opções de edição e de karaokê do menu do player, o modo de leitura e o trilho dos cartões não foram exercitados em execução, e nada desta versão foi validado em aparelho Android.' },
    ],
  },
  {
    versao: 620, data: '2026-11-10', titulo: 'Compartilhamento de música e de letra em cartão; busca restrita ao termo e música aberta igual à da lista; capas sem corte',
    itens: [
      { tipo: 'correcao', texto: 'Os botões de compartilhar do player, da letra e do menu da música dependiam do compartilhamento do navegador (navigator.share), inexistente no WebView do aplicativo Android; nele, o toque resultava apenas na cópia do texto ou em falha. O envio passou a ser feito pela parte nativa do aplicativo (método compartilharCartao), com a imagem anexada e o texto na legenda. Disponível mediante atualização do aplicativo.' },
      { tipo: 'novo', texto: 'Os mesmos botões passaram a abrir uma folha de compartilhamento com a prévia de um cartão de 1080 × 1350 pixels (JPEG, cerca de 130 kB): no modo "Música", a capa, o título e o artista; no modo "Letra", até 5 versos escolhidos em "Escolher os versos" (ao abrir, os 4 versos a partir da linha em execução). O cartão pode usar a cor da música, a variante escura, a preta ou a clara. Destinos: copiar o link, WhatsApp, Instagram (somente no aplicativo Android), copiar a letra, salvar a imagem (no navegador) e os demais aplicativos do sistema. No navegador, o WhatsApp recebe apenas o texto.' },
      { tipo: 'correcao', texto: 'A lista da busca de músicas incluía resultados sem relação com o termo: as fontes devolvem também o que tem uma única palavra em comum ou a palavra dentro da letra. Cada resultado passou a receber uma nota pelas palavras do termo presentes no título, no artista e no nome do vídeo (palavras vazias desconsideradas; tolerância de uma letra em palavras de 4 letras ou mais); havendo resultados com dois terços das palavras, os demais são retirados. Sem nenhum resultado nessa condição (busca por trecho de letra), a lista permanece como veio. Na busca "Blood in your eyea", a lista caiu de 7 linhas (3 sem relação com o termo e 3 vídeos da mesma música) para 2.' },
      { tipo: 'correcao', texto: 'Os vídeos sem música correspondente entravam na lista com o título inteiro do vídeo e o nome do canal no lugar do artista. Passaram a entrar com o título e o artista extraídos do nome do vídeo; os vídeos da mesma música são reunidos em uma linha, com preferência para o clipe oficial, e as outras versões de música já listada (remix, instrumental, com letra, cover) são retiradas.' },
      { tipo: 'correcao', texto: 'Ao abrir um resultado, a letra de reserva (LRCLIB) de mesmo título e de outro artista era aceita: "Blood In Your Eyes", de Tove Lo, abria com o nome e a letra de "Blood in Your Eyes", de Rocky Votolato. Com o artista conhecido, a letra de outro artista deixou de ser aceita, e a música aberta é conferida com a linha tocada (título e artista); em caso de divergência, abre com o título, o artista e o vídeo da lista, sem letra. As músicas salvas anteriormente com a letra de outro artista não são identificáveis de forma automática e não são alteradas.' },
      { tipo: 'correcao', texto: 'As capas das listas, dos cartões, da biblioteca e dos painéis do player eram exibidas ampliadas em 5% dentro do quadro (regra de estilo geral das capas), com perda de 2,4% da imagem em cada lado: a borda e o texto próximo à margem ficavam cortados. A ampliação foi retirada e a capa quadrada passou a aparecer inteira; o destaque ao passar o cursor foi mantido. As músicas cuja capa ainda é o quadro do vídeo (16:9) continuam recortadas ao centro até a chegada da capa do álbum.' },
      { tipo: 'melhoria', texto: 'Pendente: a folha de compartilhamento e a busca foram verificadas por testes automatizados e em navegador (a busca, com as fontes reais); o envio pela parte nativa (WhatsApp, Instagram e lista do sistema) e a montagem do APK ainda não foram validados em aparelho Android.' },
    ],
  },
  {
    versao: 619, data: '2026-11-10', titulo: 'Capa do álbum: bases de reserva para as músicas ausentes do Deezer e do iTunes',
    itens: [
      { tipo: 'novo', texto: 'A capa do álbum era procurada somente no Deezer e no iTunes; a música ausente das duas bases permanecia com o quadro do vídeo, a foto do artista ou a capa gerada. Quando o Deezer responde e nenhuma das duas bases tem a música, a busca passou a consultar três bases abertas, em paralelo: o TheAudioDB (capa do álbum da faixa), a MusicBrainz (lançamentos oficiais da gravação, com a imagem no Cover Art Archive; álbum de estúdio e single antes do ao vivo e da coletânea) e a discografia do artista no Cifra Club (álbuns que contêm a música entre as faixas). Os resultados passam pelo mesmo filtro de título e artista das capas oficiais. Em consulta de quatro músicas às bases reais, a MusicBrainz respondeu em 161 a 652 ms e o TheAudioDB em 130 a 450 ms; "Um Certo Galileu" (Padre Zezinho), ausente do TheAudioDB, foi localizada na MusicBrainz.' },
      { tipo: 'melhoria', texto: 'As capas de reserva são aceitas a partir de 300 × 300 pixels (as oficiais continuam exigindo 500 × 500), pois as bases abertas nem sempre dispõem da imagem maior. A capa de reserva é tratada como capa automática: não é substituída em segundo plano e pode ser trocada em "Trocar a capa", cuja lista e cujo botão "Achar a capa certa" passaram a incluir as três bases e a informar a origem de cada imagem.' },
      { tipo: 'melhoria', texto: 'Quando o Deezer não responde (limite de pedidos ou falha de conexão), as bases de reserva não são consultadas, para que uma falha passageira não fixe uma capa de reserva no lugar da oficial; a busca é repetida depois.' },
      { tipo: 'melhoria', texto: 'As músicas já salvas sem a capa do álbum passam por uma revisão automática (revisão 33), em segundo plano, que repete a busca com as bases de reserva. A capa escolhida manualmente não é alterada.' },
      { tipo: 'melhoria', texto: 'Pendente: a seleção das capas foi verificada por testes automatizados e por consulta direta ao TheAudioDB e à MusicBrainz, e a busca completa foi executada em navegador com as respostas das bases simuladas (três músicas salvas: capa do TheAudioDB, capa da MusicBrainz e, com o Deezer em falha, nenhuma consulta às reservas); a consulta à discografia do Cifra Club foi verificada apenas com dados de teste, e o carregamento das imagens reais do Cover Art Archive e a validação em aparelho Android ainda não foram realizados.' },
    ],
  },
  {
    versao: 618, data: '2026-11-10', titulo: 'Partitura: arquivo pronto quando existe, geração em uma passada com acompanhamento, tela reorganizada; ajustes preservados entre aberturas',
    itens: [
      { tipo: 'novo', texto: 'Antes de gerar a partitura pelo áudio, o aplicativo passou a procurar um arquivo MIDI da música no acervo aberto BitMidi (busca pelo título, sem conta). Os arquivos cujo nome contém o título inteiro são listados, com prioridade para os que também trazem o artista; o arquivo escolhido é convertido em partitura com duas pautas (Melodia e Acompanhamento), com o andamento, o compasso e a armadura do próprio arquivo, e exibido com o player antes de ser salvo. A conversão de cinco arquivos do acervo (1.894 a 7.672 notas) levou de 7 a 45 ms. O acervo é mantido por envios de usuários e cobre melhor o repertório internacional; os nomes dos arquivos nem sempre informam o artista, razão pela qual a escolha e a audição ficam a cargo de quem usa. Sem resultado, sem conexão ou sem resposta em 7 segundos, a geração pelo áudio segue como antes.' },
      { tipo: 'novo', texto: 'As telas "Gerar com IA" e "Criar a partitura" passaram a aceitar um arquivo MIDI (.mid, .midi, .kar) escolhido no aparelho, convertido da mesma forma.' },
      { tipo: 'melhoria', texto: 'A partitura gerada pelo áudio passou a sair, por padrão, no formato "Completa": a melodia na clave de sol e, na clave de fá, o acompanhamento escrito pelos acordes da música (baixo no tempo forte e acorde nos demais tempos, conforme o compasso; nos compassos 6/8, 9/8 e 12/8, em grupos de três colcheias). O padrão anterior era o coral a quatro vozes. As opções "Melodia" e "Coral" permanecem; a opção "Coral do áudio" foi retirada da tela. Sem acordes na cifra nem no áudio, a partitura sai apenas com a melodia.' },
      { tipo: 'melhoria', texto: 'Na geração no aparelho, a separação entre voz e instrumentos pelo estéreo exigia uma segunda execução do modelo de notas sobre a música inteira. A separação passou a ser feita pela medição da intensidade de cada nota nos canais central e lateral (algoritmo de Goertzel), com uma única execução do modelo. Em um áudio estéreo de 3 min 18 s, em navegador de computador, o tempo até a prévia caiu de 73 s para 40 s. O tempo em aparelhos Android não foi medido.' },
      { tipo: 'correcao', texto: 'Na estimativa do tom pelas notas, os tons de Ré sustenido, Sol sustenido e Lá sustenido maior resultavam em armadura inexistente (8 a 10 sustenidos) e o nome do tom era exibido vazio. Passaram a ser escritos como Mi bemol, Lá bemol e Si bemol maior.' },
      { tipo: 'correcao', texto: 'Os ajustes (qualidade de áudio e de vídeo, tema, tamanho da letra e os demais) eram gravados somente dentro do bloco único que guarda a biblioteca inteira. Quando esse bloco ultrapassa o limite do armazenamento local, a gravação é recusada e, na abertura seguinte do aplicativo (por exemplo, após uma atualização), valia o conteúdo da última gravação aceita, com os ajustes anteriores. Os ajustes passaram a ser gravados também em uma chave própria, que prevalece na abertura; quando o bloco da biblioteca não cabe, o aplicativo passa a abrir pela cópia mantida no IndexedDB, que antes era sobrescrita pelo bloco antigo. A falha foi reproduzida em teste com o armazenamento limitado; a ocorrência não foi confirmada em aparelho. Os ajustes voltam ao padrão apenas com a desinstalação ou com "Apagar tudo".' },
      { tipo: 'melhoria', texto: 'A tela da partitura da música foi reorganizada: cabeçalho com a capa, o título, o artista e o botão Editar; resumo com o tom (atualizado conforme a transposição), o andamento, o compasso e o número de pautas; uma única barra com a alternância Desenhada/Original, a transposição, o tamanho (em porcentagem) e a exclusão; e a partitura em uma folha própria, separada do fundo.' },
      { tipo: 'correcao', texto: 'A montagem do APK da versão 617 falhava na compilação: a leitura do ícone do aplicativo para o cartão de convite reserva usava uma chamada que exige o tratamento de uma exceção verificada (NameNotFoundException). A leitura passou a usar as informações do próprio aplicativo, sem essa exceção. Disponível mediante atualização do aplicativo.' },
      { tipo: 'melhoria', texto: 'Pendente: as alterações foram verificadas por testes automatizados e por execução em navegador (busca, conversão, geração pelo áudio com um arquivo sintético e reabertura com o armazenamento limitado); a validação em aparelho Android e com gravações reais ainda não foi realizada, e a montagem do APK será confirmada pela execução do workflow.' },
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
