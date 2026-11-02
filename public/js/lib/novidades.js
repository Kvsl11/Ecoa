// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 440, data: '2026-11-02', titulo: 'Lumen pede o microfone e volta a falar',
    itens: [
      { tipo: 'correcao', texto: 'O Lumen ao vivo mostrava o texto, mas a voz não saía. No celular e no tablet Android, o microfone que fica atento para você interromper colocava o som em “modo ligação”, e a voz ia para o alto-falante de ouvido, quase muda. Agora a voz sai normal, e se o aparelho pausar a voz sozinho, ela volta a tocar.' },
      { tipo: 'novo', texto: 'O app pede a permissão do microfone antes de usar, no Lumen ao vivo e no ditado, com uma explicação. Se o microfone estiver bloqueado, ele mostra o caminho para liberar e o botão Tentar de novo.' },
      { tipo: 'correcao', texto: 'O botão de enviar arquivo, na conversa por texto do Lumen, ligava o ditado (ficava “Ouvindo…”) em vez de abrir a escolha do arquivo. Agora ele abre a escolha do arquivo.' },
      { tipo: 'correcao', texto: 'Dúvidas como “como o salmista deve proclamar o salmo?” não viram mais uma lista de cantos repetidos com versos de antífona: sem a IA, a resposta vem dos documentos do acervo e da internet.' },
      { tipo: 'melhoria', texto: 'O que o Lumen fala aparece sempre escrito. O botão do alto agora mostra ou esconde só o que VOCÊ fala: sem o traço, a sua fala aparece escrita embaixo; com o traço, não aparece.' },
    ],
  },
  {
    versao: 439, data: '2026-11-02', titulo: 'Lumen ao vivo de cara nova, mais esperto e com arquivos',
    itens: [
      { tipo: 'melhoria', texto: 'Lumen ao vivo repaginado, como o do Gemini: no alto ficam só o logo, o botão da legenda e o “⋯” (com a voz); a resposta aparece numa coluna no centro, em letra de leitura; o que você fala aparece numa caixa embaixo, centrada, junto com o “Toque para interromper” e a barra de botões.' },
      { tipo: 'novo', texto: 'Legenda: com o botão do alto ligado, a resposta acompanha a voz (as palavras já ditas acendem, as que vêm ficam apagadas). Desligado, a tela fica só com o brilho. A escolha fica guardada.' },
      { tipo: 'novo', texto: 'Falar por cima interrompe: enquanto o Lumen fala, se você começar a falar, ele para na hora e passa a ouvir. Dá para desligar no “⋯” (Parar quando eu falar).' },
      { tipo: 'novo', texto: 'Mande um arquivo para o Lumen (PDF, foto, vídeo, áudio, Word ou texto) pelo botão de enviar, ao lado das fontes, no ao vivo e na conversa por texto, e pergunte o que quiser sobre ele. O arquivo fica junto das perguntas até você tocar no x.' },
      { tipo: 'melhoria', texto: 'O Lumen entende a pergunta falada: “preciso que você me diga se tem algo no acervo sobre casamento” acha o Ritual do Matrimônio e os outros arquivos do acervo (PDFs e áudios, pelo nome e pela pasta), também por sinônimos (casamento e matrimônio, enterro e exéquias, batizado e batismo…). Com o servidor, procura também dentro do texto dos PDFs.' },
      { tipo: 'correcao', texto: 'O teclado do tablet e do celular não abre mais sozinho a cada resposta do Lumen.' },
      { tipo: 'correcao', texto: 'O que você fala começa com letra maiúscula, no ao vivo e no ditado.' },
      { tipo: 'correcao', texto: 'A pílula colorida do ao vivo não tem mais as bordinhas pretas quando se mexe.' },
    ],
  },
  {
    versao: 438, data: '2026-11-02', titulo: 'Tela cheia no mini player e o x da busca',
    itens: [
      { tipo: 'correcao', texto: 'No mini player aumentado, o botão de tela cheia do vídeo abria o Tocando agora em vez de pôr o vídeo na tela inteira. Agora ele leva o vídeo para a tela cheia, no celular e no tablet, também nos vídeos do YouTube.' },
      { tipo: 'novo', texto: 'Na Busca, a barra branca tem um x no fim para apagar tudo o que foi escrito de uma vez. Ele aparece quando você toca na barra ou escreve algo, e some quando a barra está vazia e fora de uso.' },
    ],
  },
  {
    versao: 437, data: '2026-11-02', titulo: 'Mini player: passar o dedo de novo troca a música',
    itens: [
      { tipo: 'correcao', texto: 'Passar o dedo para o lado no mini player voltou a trocar de música (para a próxima ou para a anterior), no celular e no tablet. Desde que o vídeo passou a crescer com o dedo, o deslizar para o lado tinha parado. Agora funciona também em cima do vídeo, em qualquer tamanho do cartão.' },
      { tipo: 'correcao', texto: 'O ✓ da biblioteca ficava mais baixo que o tocar/pausar no mini player aumentado (no médio do celular e no médio e no grande do tablet). Agora os botões ficam na mesma altura.' },
      { tipo: 'correcao', texto: 'No modo música (com a capa), o mini player não fica mais grande com a capa cortada: ele volta ao compacto, com a capinha. Voltando para o vídeo, o tamanho que você escolheu volta junto.' },
    ],
  },
  {
    versao: 436, data: '2026-11-02', titulo: 'O vídeo volta ao Tocando agora',
    itens: [
      { tipo: 'correcao', texto: 'Depois de aumentar o vídeo do mini player até o tamanho grande, o Tocando agora (no tablet, deitado ou em pé, e na tela toda) abria sem o vídeo: só o nome, a barra do tempo e os botões. O tamanho grande do mini player levava o vídeo para fora da tela. Agora os tamanhos valem só no mini player, e o Tocando agora mostra o vídeo como sempre.' },
    ],
  },
  {
    versao: 435, data: '2026-11-02', titulo: 'Puxe o player para aumentar o vídeo',
    itens: [
      { tipo: 'novo', texto: 'Com um vídeo tocando, segure o mini player e puxe para cima: o vídeo cresce junto com o dedo, como no Spotify. São três tamanhos: o compacto, o médio (o vídeo maior, com o nome em cima e os botões embaixo) e o grande (o vídeo na largura toda). Puxe para baixo para diminuir. O tamanho escolhido fica guardado.' },
      { tipo: 'melhoria', texto: 'Vale no celular, no tablet (o cartão sobe a partir do pé da tela) e no computador (arraste a barra de baixo com o mouse: o vídeo flutua acima dela e cresce ou diminui). No tamanho grande, puxar mais uma vez para cima abre o Tocando agora.' },
    ],
  },
  {
    versao: 434, data: '2026-11-02', titulo: 'A música certa do artista certo',
    itens: [
      { tipo: 'correcao', texto: 'Na Busca, uma música com o mesmo nome de outra vinha misturada: “Neverender”, do Justice, abria com o vídeo certo, mas a letra, a versão de música e o artista eram da “Neverender” do Coheed and Cambria. Agora o app usa o artista que a busca já mostrava (ou o que está no título do vídeo) e não aceita a música de outro artista só porque o título é igual. Se você salvou uma música assim, tire da biblioteca e salve de novo pela Busca.' },
    ],
  },
  {
    versao: 433, data: '2026-11-02', titulo: 'Lumen mais inteligente e com voz de verdade',
    itens: [
      { tipo: 'novo', texto: 'Lumen ao vivo com voz realista: a resposta é falada por uma voz neural (feminina ou masculina, troque no alto da tela), no lugar da voz robótica do celular. As respostas faladas vêm curtas, como numa conversa.' },
      { tipo: 'melhoria', texto: 'O brilho da conversa ao vivo, como o do Gemini: sobe de baixo da tela e cresce e clareia junto com a voz, no ritmo de verdade da fala. A pílula do meio também acompanha o volume, sem os pulos de antes.' },
      { tipo: 'melhoria', texto: 'O Lumen responde com IA (Claude ou Gemini) dúvidas sobre a missa e a liturgia, os cantos do acervo para cada celebração (casamento, batismo, exéquias…) e a liturgia de qualquer data, como “qual o salmo de 30 de janeiro de 2027?”.' },
      { tipo: 'correcao', texto: 'O Lumen às vezes respondia só com a busca simples, sem a IA, porque a tela dele não conferia o endereço do servidor. Agora confere antes de cada pergunta.' },
    ],
  },
  {
    versao: 432, data: '2026-11-02', titulo: 'Partituras com cara nova',
    itens: [
      { tipo: 'melhoria', texto: 'As telas de partitura ficaram mais limpas: Partituras, Criar a partitura e Gerar com IA têm menos texto, cartões leves e as escolhas mais à mão (tom e compasso lado a lado, os tipos de partitura em grade).' },
      { tipo: 'melhoria', texto: 'Gerar com IA: enquanto a IA trabalha, um cartão só mostra a etapa da vez, o tempo e uma barra com o andamento geral; as etapas aparecem numa lista enxuta, marcadas conforme terminam. No fim, “Partitura pronta” vem numa linha, com o resumo e os ajustes recolhidos.' },
      { tipo: 'correcao', texto: 'O andamento da IA às vezes parava na primeira etapa (“Baixando o áudio”, em 0%) até a partitura ficar pronta. Agora cada etapa acende na hora.' },
      { tipo: 'correcao', texto: 'No ensaio, a voz em destaque aparecia cortada (“S…”, “C…”) com o volume espremido do lado. Agora o nome aparece inteiro e o volume fica embaixo, como nas outras vozes.' },
    ],
  },
  {
    versao: 431, data: '2026-11-02', titulo: 'A música anterior para na hora',
    itens: [
      { tipo: 'correcao', texto: 'Ao abrir outra música, às vezes a anterior continuava tocando por alguns instantes. Acontecia com a música que ainda não tinha vídeo (enquanto o app procurava um) e com as músicas baixadas (enquanto a nova abria do aparelho). Agora a anterior para assim que você toca na outra.' },
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
