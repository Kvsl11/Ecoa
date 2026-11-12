// O que mudou em cada versão do app, em registro técnico e formal (a causa, o que foi alterado e o efeito, com os
// números medidos quando houver; impessoal, sem gíria). A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 669, data: '2026-11-12', titulo: "Link do cartão do Vídeo abre a música no vídeo; para quem não entrou, a prévia passa a ser o próprio clipe",
    itens: [
      { tipo: 'melhoria', texto: "O link compartilhado era o mesmo nos três cartões (Música, Letra e Vídeo) e abria sempre a música no modo música, ou a prévia com a capa. O link do cartão do Vídeo passou a levar o clipe e o ponto do clipe em que o refrão começa (calculado pela letra sincronizada da música de quem compartilha). Com a conta, a música abre já no modo vídeo; sem ela, a prévia exibe o clipe num quadro 16:9, a partir do refrão, por 30 segundos, com o tempo decorrido e o fundo nas cores da miniatura do clipe, e volta ao início ao fim. O clipe é iniciado sem som e o som é ligado assim que a reprodução começa; onde o som não é liberado, o botão passa a \"Ouvir com som\". Quando o clipe não pode ser reproduzido fora do YouTube, ou não começa em até 10 segundos (15 segundos após a resposta do YouTube), a prévia passa à capa e ao trecho do Deezer. Os links dos cartões da Música e da Letra continuam abrindo a música e a prévia com a capa." },
      { tipo: 'melhoria', texto: "No navegador do Android, \"Ouvir completa\" e \"Abrir a música no aplicativo\" passaram a levar o vídeo ao aplicativo instalado, que abre a música no modo vídeo." },
      { tipo: 'melhoria', texto: "Pendente: a prévia do vídeo foi verificada em navegador, em perfil de iPhone, com um clipe que pode ser incorporado e com um que não pode; a abertura no modo vídeo com a conta e o compartilhamento pelo aplicativo Android não foram executados em aparelho." },
    ],
  },
  {
    versao: 668, data: '2026-11-12', titulo: "Prévia do link compartilhado: abre com a capa e as cores da música, sem o fundo azul, e encontra a prévia com a internet lenta",
    itens: [
      { tipo: 'correcao', texto: "Sem a capa carregada, o fundo da prévia usava a cor do aplicativo como reserva e era exibido em azul, sem relação com a música. O fundo passou a ficar escuro e neutro até a capa chegar; a capa e as cores extraídas dela entram gradualmente, em 0,8 s." },
      { tipo: 'correcao', texto: "A busca da prévia só começava depois de o aplicativo carregar por completo e tinha limite de 6 segundos por tentativa e 12 segundos no total; com a internet lenta, músicas com prévia disponível eram exibidas como \"Prévia indisponível\", sem novas tentativas. A busca no Deezer passou a começar no carregamento da página, em paralelo e com prioridade alta, com uma segunda busca por texto simples quando a busca exata não encontra a faixa (caso de \"Blood In Your Eyes\"); a capa de 500 px e as cores dela são exibidas na tela inicial antes de o aplicativo terminar de carregar, e o aplicativo reaproveita o resultado. Cada busca do aplicativo passou a ter até 16 segundos, e, sem resultado, a prévia é procurada de novo a cada 15 segundos (até 8 vezes) e quando a internet volta. Em teste com conexão de 50 kB/s e 600 ms de latência, a capa e as cores passaram a aparecer aos 29 segundos, contra 65 segundos antes." },
      { tipo: 'correcao', texto: "Ao assumir a tela, o aplicativo trocava a capa exibida pela versão de 1000 px, e o quadro ficava vazio enquanto ela era baixada; a capa anterior passou a ser mantida até a maior terminar de carregar." },
      { tipo: 'melhoria', texto: "Pendente: verificado em navegador, em perfil de iPhone, com conexão normal, com conexão limitada e com uma música inexistente; não executado em aparelho." },
    ],
  },
  {
    versao: 667, data: '2026-11-12', titulo: "Selo \"E\" de música explícita passa a ser atribuído automaticamente, pelo catálogo e pela leitura da letra",
    itens: [
      { tipo: 'correcao', texto: "O selo \"E\" era atribuído somente pela marcação da gravação escolhida para a capa no Deezer ou no iTunes; quando a capa escolhida era a versão limpa ou uma coletânea, a música explícita ficava sem o selo. A marcação passou a considerar todas as gravações da mesma música e do mesmo artista no catálogo (exceto karaokê, cover e tributo), e a versão \"cleaned\" do iTunes continua indicando que existe a explícita. As marcações guardadas pela regra anterior são consultadas de novo quando a linha da música aparece." },
      { tipo: 'novo', texto: "Para as músicas ausentes do Deezer e do iTunes, ou sem marcação neles, o selo passou a ser atribuído pela leitura automática da letra salva no aparelho, como nas plataformas de streaming: uma lista de palavrões, termos sexuais explícitos e ofensas em português, inglês e espanhol, com peso 1 para os termos fortes (uma ocorrência basta) e 0,5 para os leves (são necessárias duas). Palavras com outro sentido comum (\"pau\", \"rola\", \"gozar\", \"concha\", \"cock\", \"polla\") ficaram fora da lista, e acordes, diretivas e comentários da cifra não são lidos. Quando o catálogo tem a música sem a marcação, a letra precisa somar 2 pontos. O nome da faixa com \"(Explicit)\" ou \"Sem censura\" também atribui o selo. A letra continua inteira; somente o selo indica." },
      { tipo: 'melhoria', texto: "Pendente: verificado por testes automatizados (letras em português, inglês e espanhol, cantos litúrgicos e letras com palavras ambíguas); não verificado em aparelho." },
    ],
  },
  {
    versao: 666, data: '2026-11-12', titulo: "Link compartilhado: a prévia aparece antes de o aplicativo terminar de carregar, também com a internet lenta; \"Pular\" passa a \"Ouvir completa\"; notificação de reprodução: pausar e fechar passam a funcionar sempre",
    itens: [
      { tipo: 'correcao', texto: "A tela de entrada já vem pronta na página e era exibida antes de o aplicativo carregar, enquanto a prévia só surgia depois do carregamento completo. Com a internet lenta, quem abria o link de uma música sem estar com a conta via apenas a tela de entrada por mais de um minuto. A página passou a exibir a tela da prévia imediatamente, com o nome e o artista do próprio link, no lugar da tela de entrada; ao fim do carregamento, ela é substituída pela prévia com a capa e o som, na mesma posição. Em teste com conexão de 50 kB/s e 600 ms de latência, a tela de entrada deixou de aparecer." },
      { tipo: 'correcao', texto: "Após 20 segundos sem o aplicativo aberto, a página apagava a cópia offline e era recarregada, mesmo quando os arquivos ainda estavam chegando por causa da internet lenta; o carregamento recomeçava do zero. A recuperação passou a ocorrer somente quando nenhum arquivo de código chega há 10 segundos, com espera de até 2 minutos enquanto o carregamento avança. Em teste com conexão de 120 kB/s, o recarregamento no meio do carregamento deixou de ocorrer." },
      { tipo: 'correcao', texto: "O botão no canto superior da prévia ficava sob o bloco central da tela, que recebia o toque no lugar dele. O botão passou a ficar acima do conteúdo." },
      { tipo: 'melhoria', texto: "O botão \"Pular\" passou a \"Ouvir completa\". No aplicativo Android, abre a tela de entrada do aplicativo; no navegador do Android, abre o aplicativo instalado na música e, sem ele, a tela de entrada da web; no iPhone, no computador e nos navegadores de dentro de outros aplicativos, abre a tela de entrada da web. Após a entrada, a música abre inteira." },
      { tipo: 'melhoria', texto: "No aplicativo Android, o link que abre o aplicativo passou a levar à tela da prévia assim que a página existe, sem esperar o carregamento completo; antes, a tela de entrada era exibida até o aplicativo terminar de abrir. Disponível mediante atualização do aplicativo." },
      { tipo: 'correcao', texto: "O comando de pausar da notificação, da tela de bloqueio e do fone só era executado quando o estado guardado do player indicava reprodução, e só alcançava uma das fontes de som; com o estado divergente, ou durante a transição entre músicas, a música continuava. O pausar passou a interromper todas as fontes — o arquivo do aparelho (áudio, vídeo e karaokê), o player do YouTube e o de reserva, e a música que sai na transição — independentemente do estado guardado, e o tocar passou a valer mesmo com o estado já marcado como reprodução. Após cada comando, o estado é reenviado ao Android imediatamente e de novo após 0,7 s e 2 s; durante a reprodução, também a cada 10 s." },
      { tipo: 'correcao', texto: "A notificação só passava a \"pausada\" quando a página confirmava a pausa; com o aplicativo adormecido em segundo plano, a confirmação não chegava, e a notificação permanecia como em reprodução, sem poder ser dispensada. A notificação e o player do Android passaram a indicar a pausa no momento do toque, podendo ser dispensados em seguida, e o comando passou a ser entregue também diretamente à página. Disponível mediante atualização do aplicativo." },
      { tipo: 'correcao', texto: "Com a música pausada em segundo plano, o Android pode encerrar o serviço da notificação; a partir daí, a notificação deixava de ser atualizada e ficava no último estado. Ela passou a ser atualizada também com o serviço encerrado; depois de dispensada, só volta quando a música tocar de novo. O botão de reprodução da notificação passou a enviar o comando correspondente ao que exibe (tocar ou pausar), em vez de alternar. Disponível mediante atualização do aplicativo." },
      { tipo: 'melhoria', texto: "Com a música pausada, a notificação e o player do Android 13 em diante passaram a exibir o botão Fechar, que pausa a música e remove a notificação, sem ser preciso abrir o aplicativo; dispensar a notificação também pausa a música. Disponível mediante atualização do aplicativo." },
      { tipo: 'melhoria', texto: "Pendente: verificado em navegador, com conexão limitada, em perfis de iPhone e Android (incluindo o endereço de volta à tela de entrada); o caminho do aplicativo Android foi simulado em navegador e não executado em aparelho; a notificação de reprodução não foi verificada em aparelho (o APK é compilado pelo workflow)." },
    ],
  },
  {
    versao: 665, data: '2026-11-12', titulo: "Prévia do link compartilhado: a tela deixa de piscar, permanece aberta até \"Pular\" e passa a usar o iTunes como reserva",
    itens: [
      { tipo: 'correcao', texto: "O fundo em movimento da prévia era formado por camadas da capa com 1,5 vez o tamanho da tela e por focos de luz, desfocados e misturados pelo CSS. Em celulares, essas camadas excediam a memória de vídeo: o nome do artista, a barra, o tempo e o botão de reprodução desapareciam e reapareciam, e o fundo era exibido sem a capa, na cor do aplicativo. O fundo passou a ser desenhado num único canvas de 64 px de largura, ampliado para a tela inteira, com as mesmas três camadas da capa em rotação e os três focos de luz nas cores da capa, a até 30 quadros por segundo; a barra de progresso passou a avançar por transformação, sem alterar a largura a cada quadro." },
      { tipo: 'correcao', texto: "A prévia era fechada automaticamente, com a exibição da tela de entrada, ao fim do trecho, quando o Deezer não tinha a música com trecho de 30 segundos e quando a busca demorava mais de 8 segundos; em alguns links, a tela de entrada aparecia sem que a prévia fosse vista. A prévia passou a permanecer aberta até o toque em \"Pular\": ao fim do trecho, volta ao início, parada; sem trecho disponível, exibe a capa, o nome e o aviso \"Prévia indisponível\"." },
      { tipo: 'melhoria', texto: "Quando o Deezer não tem a música com trecho de 30 segundos, a prévia passou a buscar o trecho e a capa no iTunes, com a mesma conferência de nome e artista." },
      { tipo: 'melhoria', texto: "Pendente: a prévia foi conferida em navegador, em 390 px, com som, tocando até o fim e voltando ao início, e com uma música inexistente; o desempenho do fundo não foi medido em aparelho." },
    ],
  },
  {
    versao: 664, data: '2026-11-12', titulo: "Prévia do link compartilhado: capa parada, sem o clipe, e somente o fundo em movimento nas cores da capa",
    itens: [
      { tipo: 'melhoria', texto: "Na prévia exibida a quem abre o link de uma música sem estar com a conta, o clipe oficial era reproduzido dentro do quadro da capa a partir do refrão. A prévia passou a manter a capa parada, sem vídeo, e a reproduzir somente o trecho de 30 segundos do Deezer (somente quando a faixa encontrada tem o mesmo nome e o mesmo artista); o movimento fica restrito ao fundo, formado por três camadas desfocadas da própria capa, que giram e se deslocam lentamente, e por três focos de luz nas cores extraídas da capa, cuja intensidade acompanha as batidas do trecho (análise do áudio; onde ela não é permitida, os focos pulsam em compasso fixo). A barra de progresso continua com o tempo decorrido (de 0:00 a 0:30), e ao fim da prévia (ou em \"Pular\") é exibida a tela de entrada. Como o trecho é o escolhido pelo Deezer, a prévia deixa de corresponder necessariamente ao refrão." },
      { tipo: 'correcao', texto: "O clipe da prévia era iniciado com o pedido de som junto com o de reprodução, o que impedia o início em alguns navegadores; após 8 segundos sem reprodução, a prévia passava ao trecho do Deezer. Com a remoção do clipe da prévia, o problema deixa de ocorrer." },
      { tipo: 'melhoria', texto: "Pendente: a prévia foi conferida em navegador, em 390 px, com som (gravação de tela com áudio), tocando até 0:30 e passando à tela de entrada; não executada em aparelho." },
    ],
  },
  {
    versao: 663, data: '2026-11-12', titulo: "Compartilhar: cartões da Letra e do Vídeo voltam a ser gerados, imagem em 4K e vídeo em Full HD; link compartilhado abre direto a música",
    itens: [
      { tipo: 'correcao', texto: "Desde a versão 655, a função de desenho do cartão de compartilhar recebia um parâmetro chamado t (o instante da animação) que ocultava a função de tradução de mesmo nome. Ao escrever \"Música · artista\" no cartão da Letra e o rótulo \"Videoclipe\" no cartão do Vídeo, o desenho era interrompido com erro: a prévia da Letra exibia apenas o título, sem os versos, e nem a imagem nem o vídeo do cartão eram gerados, de modo que apenas o texto era enviado e aparecia o aviso de que o aparelho não gera o vídeo. A tradução passou a usar outro nome, e os três cartões voltaram a ser desenhados por inteiro; o cartão da Letra e o do Vídeo voltaram a ser enviados em vídeo com o trecho da música quando ela está baixada. Um teste passou a desenhar os três cartões." },
      { tipo: 'melhoria', texto: "A imagem do cartão passou a ser gerada no dobro da resolução, em 4K (2160 × 3840 px no cartão da Música, 2160 × 2160 px no da Letra e 2160 × 1840 px no do Vídeo), em JPEG com qualidade 95%; se o aparelho não tiver memória para ela, é gerada em Full HD (1080 px de largura). O vídeo do cartão, em Full HD (1080 px de largura), passou de 6 para 12 Mbit/s, e o som, de 160 para 192 kbit/s. A capa obtida pela cópia de reserva passou de 900 para 1600 px." },
      { tipo: 'correcao', texto: "Ao abrir um link de música compartilhado com o player aberto, a música era enviada apenas ao player, e permanecia na frente uma tela intermediária com os botões \"Abrir a música\" e \"Procurar na busca\"; ao voltar da música, essa tela também reaparecia. Com a conta, o link passou a abrir diretamente a tela da música, no aplicativo Android, no navegador do celular, no tablet e no computador, e é substituído pelo Início no histórico: ao sair da música, é exibido o Início. Sem a conta, a música inteira não é aberta: é exibida somente uma prévia de 30 segundos, no formato da prévia do Spotify — a capa, o nome, o artista, a barra de progresso com o tempo decorrido (de 0:00 a 0:30) e o botão de reprodução, sem texto adicional. A prévia é o refrão: o clipe oficial é reproduzido no quadro da capa a partir do início do refrão, localizado pela letra sincronizada (com a duração da cena de abertura do clipe somada quando o clipe é mais longo que a gravação) e, sem a letra, a 30% da música; a legenda automática do YouTube é desativada. Quando o clipe não pode ser reproduzido fora do YouTube, é tentado outro clipe; sem clipe, é reproduzido o trecho de 30 segundos do Deezer, somente quando a faixa encontrada tem o mesmo nome e o mesmo artista. A reprodução é iniciada automaticamente onde o navegador permite; onde o som não é liberado, o botão passa a \"Ouvir com som\" e reinicia o refrão com som. Durante a prévia, o fundo é formado por três camadas desfocadas da própria capa, que giram e se deslocam lentamente, e por três focos de luz nas cores extraídas da capa, cuja intensidade acompanha as batidas do trecho do Deezer (análise do áudio; no clipe e onde a análise não é permitida, os focos pulsam em compasso fixo); sem o clipe, a capa recebe aproximação e deslocamento lentos, flutuação leve e um reflexo periódico. Ao fim da prévia (ou em \"Pular\"), é exibida a tela de entrada do aplicativo; após o login com a conta Google, a música abre inteira. Sem a prévia, a tela de entrada é exibida diretamente." },
      { tipo: 'melhoria', texto: "Pendente: os cartões, a gravação em MP4 e a prévia (390 px e 1280 px; com clipe, em \"Never Gonna Give You Up\", e com o trecho do Deezer, em \"Blood In Your Eyes\"; tocando até o fim e passando à tela de entrada) foram conferidos em navegador; o som do clipe não foi verificado na gravação; o envio pelo aplicativo Android e a abertura do link após o login não foram executados em aparelho." },
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
