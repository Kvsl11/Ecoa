// O que mudou em cada versão do app, em registro técnico e formal (a causa, o que foi alterado e o efeito, com os
// números medidos quando houver; impessoal, sem gíria). A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 674, data: '2026-11-12', titulo: "Downloads conferidos no aparelho: a música só aparece como baixada com os arquivos guardados; repertório ganha os botões da playlist",
    itens: [
      { tipo: 'correcao', texto: "A música era exibida como baixada, com a seta verde, apenas pela marcação guardada nela, sem conferência dos arquivos no aparelho. Com o arquivo apagado (dados do aplicativo limpos, falta de espaço, gravação interrompida) ou apenas marcado por outra música com o mesmo vídeo, a seta verde permanecia, o botão \"Baixar\" considerava a música já baixada e nada era reproduzido sem internet. Os arquivos passaram a ser conferidos no armazenamento do aparelho: na abertura do aplicativo e no retorno a ele (no máximo a cada 10 minutos), ao abrir um repertório ou uma playlist, antes de cada download e antes de oferecer \"Remover o download\". O arquivo ausente, vazio ou menor que o baixado é retirado da música, que volta a ser baixada automaticamente, exceto quando o download foi pausado. Em teste em navegador, com três músicas marcadas como baixadas e apenas uma com o arquivo guardado, as três exibiam a seta verde; após a correção, somente a música com o arquivo manteve a seta e as outras duas voltaram para a fila." },
      { tipo: 'correcao', texto: "Após gravar cada arquivo, o aplicativo passou a lê-lo de volta e comparar o tamanho; se o aparelho não guardou o arquivo inteiro, o download conta como falha e é tentado de novo, em vez de a música ficar marcada como baixada. O arquivo de outra música com o mesmo vídeo só é reaproveitado quando está de fato no aparelho." },
      { tipo: 'correcao', texto: "No aplicativo Android sem o servidor do computador, os downloads incompletos e os arquivos ausentes não voltavam a ser baixados automaticamente, porque a nova tentativa exigia o servidor. O baixador do próprio celular passou a valer para essas tentativas. Quando o download não pode começar (sem servidor ou baixador, ou sem áudio e vídeo para baixar), o motivo passou a ser exibido em uma janela; antes, o toque no botão não tinha efeito visível." },
      { tipo: 'novo', texto: "A tela do repertório passou a ter os mesmos botões da playlist, mantendo os existentes: a prévia dos clipes, Compartilhar, Vídeo (as faixas com a imagem do clipe, tocando no vídeo), Editar (retirar músicas e mudar a ordem arrastando) e Ordenar, que altera a ordem guardada do repertório (a do PDF, do PowerPoint e da reprodução), após confirmação, pela ordem da missa (Entrada, Ato Penitencial, Glória… Comunhão, Ação de Graças, Canto Final), por título ou por artista." },
      { tipo: 'melhoria', texto: "Pendente: verificado em navegador, em 390 px, em português, inglês e espanhol; o download completo pelo baixador do celular não foi executado em aparelho." },
    ],
  },
  {
    versao: 673, data: '2026-11-12', titulo: "Lista do repertório passa a seguir a da playlist: ícones sempre no início da linha, antes da parte da missa",
    itens: [
      { tipo: 'melhoria', texto: "Na lista do repertório, a parte da missa vinha antes dos ícones da música; quando o download mudava de estado (baixando, incompleto, baixado), o ícone era inserido de novo no início da linha, e em algumas músicas ele ficava antes da parte e em outras depois. A linha passou a seguir a mesma ordem da playlist em todas as músicas: os ícones (download, selo \"E\", karaokê, cifra e vídeo), a parte da missa, o artista com a foto e a duração, separados por \"•\". O tom passou a ficar ao lado do botão de opções, como na playlist." },
      { tipo: 'correcao', texto: "Foram removidos os separadores excedentes (\"Vídeo • · 0:58\" no repertório e \"Vídeo •\" no fim da linha na playlist, quando não havia artista). No repertório, com a parte da missa na linha, o vídeo passou a ser indicado apenas pelo ícone, e a parte fica inteira até 55% da largura; quando falta espaço, o nome do artista é encurtado primeiro. Verificado em 390 px em português, inglês e espanhol, sem texto sobreposto nem passando da largura." },
      { tipo: 'melhoria', texto: "Pendente: verificado em navegador; não executado em aparelho." },
    ],
  },
  {
    versao: 672, data: '2026-11-12', titulo: "Pausar passa a interromper a música de fato: o player não volta a tocar sozinho cerca de 1 s depois, no aplicativo e na notificação",
    itens: [
      { tipo: 'correcao', texto: "Ao pausar pelo botão do aplicativo ou pela notificação, a música era pausada e, cerca de 1 s depois, voltava a tocar sem nenhum toque: o player do YouTube voltava ao estado de reprodução após o comando de pausa, ou um comando de tocar enviado pelo sistema logo após a pausa era atendido. Na notificação, o botão permanecia em \"tocar\" enquanto o tempo avançava e o áudio continuava. A pausa pedida passou a ser mantida até um novo comando de tocar: o player do YouTube (o principal e o de reserva) e o arquivo do aparelho que retomam sozinhos são pausados de novo, o estado permanece \"pausado\" e o tempo fica no ponto da pausa. O comando de tocar que chega da notificação, do fone ou da tela de bloqueio até 1,5 s depois de uma pausa passou a ser ignorado. Em teste em navegador, com um player que retoma 0,9 s após a pausa, a reprodução foi interrompida de novo em 2 ms e o player permaneceu pausado; o tocar seguinte, pedido pela pessoa, funcionou normalmente." },
      { tipo: 'correcao', texto: "Mover a barra do tempo da notificação ou da tela de bloqueio com a música pausada fazia a música voltar a tocar. A barra passou a apenas levar ao ponto escolhido, mantendo a pausa. Ao retomar, o tempo exibido deixou de avançar 2 s por um instante." },
      { tipo: 'correcao', texto: "A notificação de reprodução não era redesenhada quando o Android recusava o primeiro plano ao serviço já ligado, e o botão ficava em \"tocar\" com a música tocando. A notificação passou a ser atualizada sempre que a música volta a tocar. Disponível mediante atualização do aplicativo." },
      { tipo: 'melhoria', texto: "Pendente: verificado em navegador, com um player do YouTube simulado (o YouTube não reproduz no navegador de teste) e com os comandos da notificação simulados; não executado em aparelho." },
    ],
  },
  {
    versao: 671, data: '2026-11-12', titulo: "Player de mídia das notificações: botão de fechar removido; pausado, é dispensado arrastando para o lado",
    itens: [
      { tipo: 'melhoria', texto: "Com a música pausada, o player de mídia do Android exibia um botão \"X\" adicional, incluído pelo aplicativo como ação do aviso e como ação personalizada da sessão de mídia. O botão foi removido das duas origens. Com a música pausada, o aviso deixa de ser fixo e é dispensado arrastando para o lado, como nos demais players; ao ser dispensado, a música permanece pausada e o aviso e o player do Android são retirados, pelo mesmo caminho já usado antes. Disponível mediante atualização do aplicativo." },
      { tipo: 'melhoria', texto: "Pendente: a alteração não foi executada em aparelho; a montagem do APK é feita pelo workflow Android." },
    ],
  },
  {
    versao: 670, data: '2026-11-12', titulo: "Nome da música em movimento deixa de aparecer duas vezes, sobreposto, no player, na letra e na cifra",
    itens: [
      { tipo: 'correcao', texto: "O nome que não cabe na linha anda para o lado seguido de uma cópia, e cada um tinha a própria animação. Quando o nome mudava (troca de música, chegada do artista), a cópia era refeita e recomeçava do zero, enquanto o nome seguia do ponto em que estava; fora de passo, ao fim da volta o nome reaparecia no início com a cópia ainda passando por cima dele, e o texto era exibido duas vezes, sobreposto. Ao refazer a cópia, o nome e a cópia passaram a recomeçar juntos, e a cada desenho a largada de todas as linhas do grupo é igualada à da primeira. A correção vale para a barra de reprodução, a tela Tocando agora, a barra superior e o nome exibido na letra e na cifra. Em teste em navegador, com troca do nome após 2,5 s, a defasagem entre o nome e a cópia passou de 2500 ms para 0 ms." },
      { tipo: 'melhoria', texto: "Pendente: verificado em navegador, com a mesma animação do aplicativo; não executado em aparelho." },
    ],
  },
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
