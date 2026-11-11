// O que mudou em cada versão do app, em registro técnico e formal (a causa, o que foi alterado e o efeito, com os
// números medidos quando houver; impessoal, sem gíria). A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
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
  {
    versao: 630, data: '2026-11-11', titulo: 'Fotos dos artistas na lista da playlist e na prévia, agrupadas quando há mais de um',
    itens: [
      { tipo: 'novo', texto: 'As linhas das músicas na página da playlist exibiam somente o nome do artista, sem a foto presente nas demais listas (biblioteca, Músicas curtidas e busca). Passaram a exibir a foto do artista antes do nome e, na música com mais de um artista, a foto do segundo sobreposta em parte à do primeiro; com três ou mais, após as duas fotos vem o marcador "+N" com a quantidade restante.' },
      { tipo: 'novo', texto: 'Na prévia da playlist (os clipes em tela cheia), a música com mais de um artista exibia somente a foto do primeiro. Passou a exibir a foto do segundo sobreposta em parte à do primeiro e, com três ou mais artistas, o marcador "+N", no mesmo arranjo das listas.' },
      { tipo: 'melhoria', texto: 'A foto do primeiro artista é a guardada na música ou a última conhecida no aparelho; a do segundo é a última conhecida e, quando não há, é procurada assim que a linha ou a prévia aparece na tela (requer conexão). Nada é guardado na música; portanto, nenhuma revisão das músicas salvas é necessária.' },
      { tipo: 'melhoria', texto: 'Pendente: a exibição foi verificada em navegador com tela de celular, em uma playlist de teste com três músicas; a validação em aparelho Android ainda não foi realizada.' },
    ],
  },
  {
    versao: 629, data: '2026-11-11', titulo: 'Logo do Ecoa por inteiro no widget e nas notificações',
    itens: [
      { tipo: 'correcao', texto: 'O desenho da logo usado pelo Android (o "e" com as duas ondas) estava em um quadro de 44 unidades, e a segunda onda, com a espessura do traço, chegava a 46,8: os 2,8 que excediam a borda direita eram cortados. O quadro passou a ter 50 unidades, com o desenho centrado e 2,25 de folga em cada lado. O mesmo desenho é usado em cinco lugares, todos corrigidos: o canto dos widgets padrão (4 × 2) e grande, o quadro exibido no lugar da capa nos três formatos do widget, o ícone da notificação do player e o ícone das notificações de aviso. Disponível mediante atualização do aplicativo.' },
      { tipo: 'melhoria', texto: 'Para a logo manter o tamanho aparente no quadro maior, as medidas no widget foram ajustadas: de 20 para 23 dp no formato padrão, de 22 para 25 dp no formato grande e de 44 para 50 dp no quadro sem capa. Nas notificações, o tamanho do ícone é definido pelo Android, e a logo fica cerca de 12% menor. A logo do ícone do aplicativo, das telas e dos cartões de compartilhamento usa um quadro de 64 unidades e não apresentava o corte.' },
      { tipo: 'melhoria', texto: 'Pendente: a correção foi conferida pelo cálculo dos limites do desenho e por uma renderização do vetor fora do Android; não foi executada em aparelho, e a compilação é conferida pela montagem do APK no workflow.' },
    ],
  },
  {
    versao: 628, data: '2026-11-11', titulo: 'Widget da tela inicial com a frase que está sendo cantada',
    itens: [
      { tipo: 'novo', texto: 'Os dois formatos maiores do widget passaram a exibir a frase que está sendo cantada, nas músicas com a letra sincronizada. No formato padrão (4 × 2), a frase ocupa uma linha, no lugar do artista (as duas linhas não cabem na altura mínima); no formato grande, a frase aparece em até duas linhas, abaixo do título e do artista. Entre uma frase e outra, e nas músicas sem a letra sincronizada, o widget fica como antes. Disponível mediante atualização do aplicativo.' },
      { tipo: 'melhoria', texto: 'A cada verso, somente o texto da frase é enviado ao widget (atualização parcial), sem reenviar a capa. A frase é atualizada enquanto a página do aplicativo está ativa: em primeiro plano ou, em segundo plano, com a música tocando do aparelho (baixada ou importada). Disponível mediante atualização do aplicativo.' },
      { tipo: 'melhoria', texto: 'Pendente: o envio da frase pela interface foi conferido por análise do código e a parte nativa não foi executada em aparelho; a compilação é conferida pela montagem do APK no workflow, e a imagem de demonstração é uma simulação do leiaute.' },
    ],
  },
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
