// O que mudou em cada versão do app, em registro técnico e formal (a causa, o que foi alterado e o efeito, com os
// números medidos quando houver; impessoal, sem gíria). A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
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
  {
    versao: 635, data: '2026-11-11', titulo: 'Aplicativo Android: zoom de página com os dois dedos desativado',
    itens: [
      { tipo: 'correcao', texto: 'No aplicativo Android, no celular e no tablet, a tela podia ser ampliada com os dois dedos (e com dois toques), como uma página de navegador: a página não declarava limite de ampliação e o WebView mantinha o zoom de página ligado. No aplicativo, a página passou a declarar a escala fixa (máxima 1, sem ampliação pelo usuário) e a aceitar somente o gesto de rolagem. Essa parte vale para o aplicativo já instalado, sem atualização.' },
      { tipo: 'melhoria', texto: 'O WebView do aplicativo passou a ter o zoom de página desligado também na parte nativa (suporte a zoom e controles de zoom). Disponível mediante atualização do aplicativo.' },
      { tipo: 'melhoria', texto: 'No site aberto pelo navegador, o zoom continua disponível. Pendente: a alteração foi conferida em navegador com a identificação do aplicativo; o gesto dos dois dedos não foi executado em aparelho.' },
    ],
  },
  {
    versao: 634, data: '2026-11-11', titulo: 'Compartilhamento: link que abre a música no Ecoa e destinos Instagram, Telegram, Facebook e X',
    itens: [
      { tipo: 'correcao', texto: 'O link enviado com o cartão (e o copiado em "Copiar link") era o endereço do vídeo no YouTube. Passou a ser o endereço da música no Ecoa (kvsl11.github.io/Ecoa/#/ouvir/nome/artista), nos cartões Música, Letra e Vídeo. Quem abre o link chega à música: a da própria biblioteca, quando já a tem, ou a música trazida pelo nome e pelo artista, como as da busca. A biblioteca é individual; por isso o link leva o nome e o artista, e não o identificador da música de quem enviou.' },
      { tipo: 'novo', texto: 'No navegador do Android, o link exibe uma tela com o botão "Abrir no aplicativo", que entrega a música ao aplicativo instalado, além de "Ouvir aqui" e "Procurar na busca". O aplicativo Android passou a receber os links de música (os do site e o endereço próprio ecoa://ouvir) e a abrir a música correspondente. Disponível mediante atualização do aplicativo.' },
      { tipo: 'novo', texto: 'Aos destinos do compartilhamento foram acrescentados Telegram, Facebook e X, com o símbolo oficial de cada um. O destino Instagram, antes exibido somente no aplicativo Android, passou a aparecer também no navegador que oferece o compartilhamento do sistema. No aplicativo, cada destino abre o aplicativo correspondente com o cartão; no navegador, Telegram, Facebook e X abrem a página de compartilhar de cada serviço com o link.' },
      { tipo: 'melhoria', texto: 'Pendente: o Android só abre diretamente no aplicativo o link do site quando o endereço é conferido por um arquivo publicado na raiz de kvsl11.github.io (assetlinks.json), que fica fora deste repositório e não foi publicado; até lá, o link abre no navegador, com o botão "Abrir no aplicativo", ou diretamente no aplicativo se a opção "Abrir links compatíveis" for ligada nas configurações do Android. A rota e os destinos foram verificados em navegador; a parte Android não foi executada em aparelho.' },
    ],
  },
  {
    versao: 633, data: '2026-11-11', titulo: 'Compartilhamento: fundos animados no cartão, enviado em vídeo',
    itens: [
      { tipo: 'novo', texto: 'A tela "Personalizar" do compartilhamento passou a ter a ferramenta "Animado", com cinco fundos em movimento para os cartões Música, Letra e Vídeo: Eco (anéis que se abrem a partir do centro), Ondas, Aurora, Bolhas e Brilhos. O movimento é desenhado sobre a cor escolhida, sobre a capa ou sobre a foto do aparelho, e é exibido na prévia do cartão. A opção "Parado" mantém o cartão em imagem, como antes.' },
      { tipo: 'novo', texto: 'Com um fundo animado, o cartão passou a ser enviado em vídeo, e não em imagem: uma volta completa da animação, de 6 segundos, a 30 quadros por segundo, no tamanho do cartão (1080 × 1920 na Música, 1080 × 1080 na Letra e 1080 × 920 no Vídeo), sem som. O fim do vídeo coincide com o começo, para a repetição contínua. O formato é MP4 (H.264) onde o aparelho grava nesse formato e WebM nos demais; onde não há gravação de vídeo, é enviada a imagem, com aviso. A geração leva os mesmos 6 segundos, indicados na folha.' },
      { tipo: 'melhoria', texto: 'A parte Android do compartilhamento passou a aceitar o arquivo de vídeo, além da imagem, para o WhatsApp, o Instagram e os demais aplicativos. Disponível mediante atualização do aplicativo.' },
      { tipo: 'melhoria', texto: 'Pendente: os cinco fundos foram criados sem o vídeo de referência indicado, que não foi recebido; a correspondência com ele ainda não foi conferida. A geração foi verificada em navegador (MP4 H.264, 1080 × 1080, 181 quadros, 6,03 s, 2,2 MB); o envio do vídeo ao WhatsApp e ao Instagram no aparelho Android, e a aceitação do arquivo por esses aplicativos, ainda não foram testados.' },
    ],
  },
  {
    versao: 632, data: '2026-11-11', titulo: 'Compartilhamento: folha sem espaço vazio na altura toda, telas de ajuste abertas por inteiro e símbolos oficiais do WhatsApp e do Instagram',
    itens: [
      { tipo: 'correcao', texto: 'Na folha de compartilhar, puxada para a altura toda (94% da tela), o conteúdo mantinha a altura original e restava uma área vazia abaixo dos destinos. O conteúdo passou a ocupar a altura inteira: o cartão cresce (até 86% da largura da tela ou 440 pixels) e fica centrado no espaço disponível, e as abas, as cores e os destinos ficam no pé da folha.' },
      { tipo: 'correcao', texto: 'As telas "Escolher os versos" e "Personalizar" tinham altura limitada (640 pixels na primeira) e também deixavam área vazia. Passaram a abrir com a folha na altura toda: a lista de versos vai até o pé e, no "Personalizar", o cartão ocupa o espaço entre o título e as ferramentas. Ao voltar aos cartões, a folha retorna ao tamanho em que estava.' },
      { tipo: 'correcao', texto: 'Os destinos WhatsApp e Instagram usavam desenhos aproximados, em traço. Passaram a exibir o símbolo oficial de cada aplicativo (conjunto Simple Icons, de domínio público), preenchido, sobre a cor da marca; o fundo do Instagram passou ao degradê oficial.' },
      { tipo: 'melhoria', texto: 'Pendente: os fundos animados e as demais opções de fundo solicitados com base em um vídeo de referência não foram implementados, pois o vídeo não foi recebido. A verificação foi feita em navegador com tela de celular; o destino Instagram só existe no aplicativo Android e não foi executado em aparelho.' },
    ],
  },
  {
    versao: 631, data: '2026-11-11', titulo: 'Prévia da playlist: hashtag vazia ("#...") deixou de ser exibida',
    itens: [
      { tipo: 'correcao', texto: 'Na prévia da playlist, algumas músicas exibiam uma hashtag sem texto, apenas "#...". A base consultada para o clima e o tema da música (TheAudioDB) devolve "..." no campo que não foi preenchido, e esse valor era usado como hashtag. Passou a ser aceita somente a hashtag que contém ao menos uma letra; a vaga é ocupada pela hashtag seguinte, e o mínimo de 6 por música foi mantido.' },
      { tipo: 'melhoria', texto: 'As hashtags são calculadas a cada exibição e não ficam guardadas na música; portanto, a correção vale para as músicas já salvas, sem revisão. Foi acrescentado um teste automatizado para o caso.' },
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
