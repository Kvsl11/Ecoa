// O que mudou em cada versão do app, em registro técnico e formal (a causa, o que foi alterado e o efeito, com os
// números medidos quando houver; impessoal, sem gíria). A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 679, data: '2026-11-12', titulo: "Músicas adicionadas ao repertório ou à playlist deixam de entrar nas Músicas curtidas; a barra da prévia da lista compartilhada passa a começar do zero",
    itens: [
      { tipo: 'correcao', texto: "A música ainda não salva, adicionada a um repertório ou a uma playlist (pelo botão de repertório na página da música, pelo Adicionar do repertório, da playlist e da fila, pela troca do canto no repertório, pelo Salvar de uma lista recebida e pelo pedido ao Lúmen), era salva também na biblioteca e passava a aparecer nas Músicas curtidas. Essas músicas passaram a ficar apenas no repertório ou na playlist, como os cantos do \"Montar repertório\"; o + continua a colocá-las nas Músicas curtidas. A música cancelada antes de escolher o repertório deixou de ficar guardada." },
      { tipo: 'correcao', texto: "Tirar das Músicas curtidas uma música que está em algum repertório ou playlist a apagava também de lá, após uma confirmação. A música passou a sair apenas das Músicas curtidas e a permanecer no repertório ou na playlist; as músicas que já estavam no aparelho podem ser retiradas das Músicas curtidas desse modo, pois a origem delas não fica registrada." },
      { tipo: 'correcao', texto: "Na prévia da playlist ou do repertório compartilhado, ao passar para o trecho seguinte, a barra de progresso da nova música aparecia com o tempo em que o trecho anterior havia parado, e a barra da música anterior voltava deslizando até o início. A causa era o evento de tempo do áudio anterior, ainda na fila, ser aplicado à nova música, somado à animação da largura. O tempo passou a ser aplicado apenas ao áudio do trecho atual, o áudio anterior é descarregado ao trocar de música e a barra é zerada sem animação: a nova música começa com a barra no início." },
      { tipo: 'melhoria', texto: "Pendente: não verificado em navegador nem em aparelho." },
    ],
  },
  {
    versao: 678, data: '2026-11-12', titulo: "Compartilhar playlist e repertório: cartão nítido e folha que cresce ao ser puxada, como a da música",
    itens: [
      { tipo: 'correcao', texto: "Na folha de compartilhar da playlist e do repertório, o cartão era exibido com 50% de opacidade e reduzido, como os cartões laterais do carrossel da música, e parecia embaçado; ao puxar a folha para cima, o cartão não crescia e os destinos não ficavam no pé. A folha passou a usar o mesmo comportamento da folha da música: o cartão aparece inteiro e nítido, centralizado, e, com a folha puxada, ocupa a altura disponível, com as cores e os destinos embaixo. Verificado em navegador nas larguras de celular (390 px) e de tablet (800 px), com a folha normal e puxada." },
      { tipo: 'melhoria', texto: "Pendente: não executado em aparelho." },
    ],
  },
  {
    versao: 677, data: '2026-11-12', titulo: "Lúmen, convite e mensagens do baixador passam a seguir o idioma do aparelho; a tradução das notificações e do compartilhar passa a ser conferida por teste",
    itens: [
      { tipo: 'correcao', texto: "O Lúmen (Gemini) era instruído a responder sempre em português do Brasil, no celular, no servidor e na conversa ao vivo, e a leitura em voz alta usava a voz em português mesmo com o aparelho em inglês ou espanhol. A resposta, a leitura em voz alta e a voz do aparelho passaram a seguir o idioma do aparelho (português do Brasil, inglês ou espanhol; os demais idiomas ficam em inglês, como o aplicativo). No servidor do computador, a mudança vale após a atualização do servidor." },
      { tipo: 'correcao', texto: "O cartão de reserva do convite, desenhado pelo Android, e o texto que o acompanha estavam fixos em português; passaram a ser lidos dos textos do aplicativo nos três idiomas. Os erros do baixador do celular que ainda não tinham tradução (vídeo longo demais e envio só do áudio) foram incluídos nos dicionários e aparecem traduzidos na notificação de download. Disponível mediante atualização do aplicativo." },
      { tipo: 'melhoria', texto: "Foi incluído um teste que lê no código todos os textos das notificações e os que passam pela tradução fora da tela (o texto de compartilhar, os cartões desenhados, os avisos do sistema) e falha quando algum deles não existe em inglês ou em espanhol. Na conferência atual, todos os textos estão traduzidos; em teste em navegador, o texto copiado ao compartilhar um repertório saiu como \"Setlist · 9 songs · Sun, 11/15/2026\" em inglês e \"Repertorio · 9 canciones · dom, 15/11/2026\" em espanhol, com os nomes das músicas mantidos como foram escritos." },
      { tipo: 'melhoria', texto: "Pendente: a conversa com o Lúmen e a leitura em voz alta não foram executadas em aparelho; o cartão nativo do convite não foi gerado em aparelho." },
    ],
  },
  {
    versao: 676, data: '2026-11-12', titulo: "Cantos da Liturgia passam a vir prontos, com vídeo e capa; o link da playlist e do repertório toca prévias de 30 s e só abre no aplicativo",
    itens: [
      { tipo: 'correcao', texto: "O \"Montar repertório\" e o \"Montar playlist\" da Liturgia (Missa litúrgica e Missa popular: acervo litúrgico, Hinário da CNBB, Cindy Ferrarezi e Músicas para Missa) salvavam cada canto apenas com a cifra; a playlist procurava só o vídeo. A maioria ficava sem capa e, aberta, sem música, sendo preciso escolher um vídeo manualmente. Cada canto passou a receber o mesmo preparo das músicas da Busca: o vídeo procurado pelo nome e pelo autor (no acervo e no Hinário, como canto litúrgico), a capa do vídeo ou a do álbum quando o autor é conhecido, o áudio oficial e a letra sincronizada, três cantos por vez, com o progresso no botão. O mesmo vale para o canto trocado no repertório e para o canto salvo sem vídeo ao ser aberto (no máximo uma vez por semana) ou ao abrir o repertório. Os cantos já salvos assim passam pela revisão automática. Em teste em navegador, com a busca do YouTube simulada, três cantos da Cindy Ferrarezi sem vídeo receberam o vídeo em 5 segundos ao abrir o repertório. O texto oficial da CNBB (leituras e salmo do dia) permanece como está." },
      { tipo: 'novo', texto: "A prévia do link de uma playlist ou de um repertório passou a tocar o trecho de 30 segundos de cada música ao toque: o do Deezer e, sem ele, o do iTunes; sem os dois (caso de muitos cantos de missa), 30 segundos do próprio vídeo. Ao fim do trecho, a próxima música começa; a música sem trecho e sem vídeo é indicada como \"Prévia indisponível\". As capas ausentes são obtidas do Deezer ou do iTunes, completando também o mosaico do topo. O botão do rodapé passou a \"Ouvir completa no app\"." },
      { tipo: 'melhoria', texto: "No navegador, os links compartilhados (de música, playlist e repertório) passaram a abrir sempre a prévia com o convite para o aplicativo, também para quem tem a conta na web; a música e a lista completas só abrem no aplicativo Android. Dentro do aplicativo, o comportamento é o mesmo de antes." },
      { tipo: 'melhoria', texto: "Pendente: verificado em navegador, com o Deezer, o iTunes e a busca do YouTube simulados (o ambiente de teste não alcança esses serviços); não executado em aparelho." },
    ],
  },
  {
    versao: 675, data: '2026-11-12', titulo: "Link compartilhado passa a levar ao aplicativo, e não à entrada pela web; playlist e repertório ganham o compartilhamento com cartão",
    itens: [
      { tipo: 'melhoria', texto: "Na prévia do link de uma música aberta no navegador, o botão \"Ouvir completa\" levava à entrada com a conta pela web. O botão passou a \"Ouvir no app\": no navegador do Android, abre o aplicativo instalado na música; sem o aplicativo, inicia o download do APK publicado no site do Ecoa no GitHub e exibe os passos (baixar, instalar e voltar para abrir o link no aplicativo, onde a pessoa entra com a conta). Nos navegadores internos de outros aplicativos, o mesmo, com a indicação de abrir o link no Chrome caso o download não comece. No iPhone e no computador, como o aplicativo é exclusivo do Android, é exibido o código QR do download para um celular Android. A entrada pela web deixou de ser oferecida no link." },
      { tipo: 'novo', texto: "O compartilhamento de playlist e de repertório enviava apenas o texto com a lista. Passou a abrir a mesma folha do compartilhamento da música, com um cartão em formato vertical (1080 × 1920 px, salvo em 2160 × 3840 px): a capa da lista ou o mosaico das capas das primeiras músicas, o tipo, o nome, a quantidade de músicas com a duração ou a data, e as sete primeiras músicas com a capa, a parte da missa e o artista, seguidas de \"+ N músicas\". Há quatro cores e os destinos Copiar link, WhatsApp, Instagram, Telegram, Facebook, X, Copiar lista, Salvar imagem e Mais." },
      { tipo: 'novo', texto: "O link enviado abre a prévia da lista: sem a conta, a capa, o nome, o resumo, as músicas e o botão \"Abrir no app\", com o mesmo caminho de download do aplicativo; com a conta, a lista na tela, com cada música abrindo ao toque e o botão \"Salvar na biblioteca\", que reúne as músicas já salvas e traz as demais pelo nome. O link leva até 60 músicas, comprimidas (60 músicas em menos de 1.200 caracteres), e o aplicativo Android passou a abrir os links ecoa://lista. Disponível mediante atualização do aplicativo." },
      { tipo: 'melhoria', texto: "Pendente: verificado em navegador, em 390 px, em português, inglês e espanhol, nos perfis de Android e de iPhone, com o retorno pela página de reserva simulado; a abertura do aplicativo instalado pelo link e a instalação do APK não foram executadas em aparelho." },
    ],
  },
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
