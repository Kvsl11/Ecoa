// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 447, data: '2026-11-03', titulo: 'Permissões: notificações e microfone num lugar só',
    itens: [
      { tipo: 'novo', texto: 'Ajustes → Permissões mostra se as notificações e o microfone estão permitidos, ainda não pedidos ou bloqueados. Dá para permitir dali, e, quando o navegador bloqueou, a tela explica como liberar. Com as notificações ligadas, o botão “Testar” manda uma notificação de teste.' },
      { tipo: 'melhoria', texto: 'O app não pede mais as notificações no primeiro toque na tela, sem explicar nada. Agora um cartão no Início conta para que servem (os avisos dos downloads) e pergunta uma vez; “Agora não” não pergunta de novo, e dá para permitir depois em Ajustes → Permissões.' },
    ],
  },
  {
    versao: 446, data: '2026-11-02', titulo: 'Lumen: voz do Gemini desde o “olá” e a música na tela',
    itens: [
      { tipo: 'correcao', texto: 'A saudação do Lumen saía numa voz robótica (a do aparelho) na primeira vez. Agora ela espera a voz do Gemini, que o app já prepara quando abre e guarda no aparelho. A voz do aparelho só entra se o servidor estiver fora do ar.' },
      { tipo: 'melhoria', texto: 'Pedindo para o Lumen tocar uma música, ela toca e a tela da música abre, como quando você toca nela na lista.' },
      { tipo: 'correcao', texto: 'As perguntas faladas ganham o ponto de interrogação também quando começam chamando o Lumen (“Lumen, você pode…?”, “Olá Lumen, no que você pode me ajudar?”), e o “?” já aparece enquanto você fala.' },
      { tipo: 'melhoria', texto: 'O Lumen entende melhor o nome da música mesmo quando o reconhecimento de voz escreve errado: “never hinder” e “never ranger” acham “Neverender”.' },
    ],
  },
  {
    versao: 445, data: '2026-11-02', titulo: 'Lumen responde com o Gemini e não pisca mais',
    itens: [
      { tipo: 'correcao', texto: 'O Lumen respondia coisas sem nada a ver (como um texto de eucaristia para “o que você faz?”). O Gemini recusava as perguntas porque a cota grátis da pesquisa no Google tinha acabado, e o Lumen caía na busca simples. Agora, quando essa cota acaba, a pergunta vai de novo ao Gemini sem a pesquisa no Google, e ele responde.' },
      { tipo: 'melhoria', texto: '“Oi”, “o que você faz?”, “no que você pode me ajudar?” têm resposta na hora: a Lumen conta o que sabe fazer (tocar, buscar e adicionar músicas, a biblioteca, a liturgia, os cantos, as dúvidas, os arquivos).' },
      { tipo: 'correcao', texto: 'Na conversa por texto, enquanto o Lumen procura a resposta, os balões da conversa não piscam mais: só o aviso do que ele está fazendo muda, e só a resposta nova aparece com a animação.' },
    ],
  },
  {
    versao: 444, data: '2026-11-02', titulo: 'Lumen: busca, toca, adiciona na playlist e mexe no app',
    itens: [
      { tipo: 'novo', texto: 'O Lumen agora mexe no app: “toque Neverender”, “pausa a música”, “próxima música”, “volta a anterior”, “quais músicas tenho na biblioteca?”, “quais são os meus repertórios?”, “abra a liturgia”… Dá para pedir mais de uma coisa de uma vez (“traga as músicas da minha biblioteca e toque Neverender”). Ele acha a música mesmo com o nome dito de outro jeito (“never render”). No ao vivo, depois de responder, a conversa fecha e a música toca.' },
      { tipo: 'novo', texto: 'Peça ao Lumen para buscar e tocar qualquer música, mesmo fora da biblioteca: “busque a música Noites Traiçoeiras”, “busque Noites Traiçoeiras e toque”, “toque Oceans”. Ele mostra as músicas como na Busca, com capa e artista, para abrir ou salvar.' },
      { tipo: 'novo', texto: 'Adicione pelo Lumen: “adiciona Neverender na minha playlist”, “coloca essa música no repertório de domingo”, “salva essa música na biblioteca”. Se a música não está na biblioteca, ele procura e salva. Vale no ao vivo e na conversa por texto (escrevendo ou ditando).' },
      { tipo: 'correcao', texto: 'O texto das respostas do Lumen não abre mais buracos entre as palavras no celular (“Você   tem   2   músicas”): agora fica alinhado à esquerda.' },
      { tipo: 'melhoria', texto: 'O Lumen é o assistente do app inteiro: além da liturgia e do acervo, ele sabe as músicas da sua biblioteca, os repertórios e o que está tocando, e procura na internet o que o app não tem.' },
      { tipo: 'melhoria', texto: 'A saudação do ao vivo ficou curta (“Olá, eu sou a Lumen.”) e toca na hora em que você abre: ela fica guardada no aparelho, na voz escolhida. Antes ela demorava uns 5 segundos.' },
      { tipo: 'correcao', texto: 'O Lumen dizia toda hora que “a inteligência artificial não respondeu agora”. O Gemini 3.6 Flash estava recusando os pedidos pelo limite do plano grátis. Agora, quando um modelo do Gemini está no limite, o Lumen passa na hora para outro Gemini que a sua chave pode usar (e, no limite por minuto, espera uns segundos e tenta de novo). Se o arquivo inteiro do acervo deixar a pergunta grande demais, ela vai só com os trechos.' },
      { tipo: 'melhoria', texto: 'Quando a IA não responde mesmo assim, o Lumen não fala mais o aviso: só aparece um aviso pequeno, escrito, no alto da resposta.' },
    ],
  },
  {
    versao: 443, data: '2026-11-02', titulo: 'Lumen com o Gemini 3.6 Flash e as vozes do Gemini',
    itens: [
      { tipo: 'correcao', texto: 'O Lumen não estava usando o Gemini: o modelo que o servidor chamava (Gemini 2.5 Flash) foi desligado pelo Google, a IA dava erro e o Lumen respondia com a busca simples, sem avisar. Agora o Lumen usa o Gemini 3.6 Flash; se ele não responder, o servidor tenta os outros Gemini Flash que a sua chave pode usar.' },
      { tipo: 'novo', texto: 'Lumen ao vivo com a voz do próprio Gemini. Se a voz do Gemini não responder (ou acabar o limite grátis do dia), entra a voz de antes, sem parar a conversa.' },
      { tipo: 'melhoria', texto: 'Quando a IA não responde, o Lumen avisa (“a inteligência artificial não respondeu agora, então fiz uma busca simples”), em vez de responder calado pela busca simples.' },
      { tipo: 'melhoria', texto: 'O Lumen ao vivo espera você terminar: ele só responde depois de uns 5 segundos sem você falar. Dá para parar, pensar e continuar a frase. Para ele responder na hora, toque na pílula do meio.' },
      { tipo: 'melhoria', texto: 'A pergunta falada ganha a pontuação: o ponto de interrogação nas perguntas, a exclamação nos cumprimentos e agradecimentos e o ponto final no resto, no ao vivo e no ditado da conversa por texto.' },
      { tipo: 'novo', texto: 'As vozes do Lumen são as do Gemini, com os nomes de lá: 30 vozes (14 femininas e 16 masculinas), como Kore, Aoede, Zephyr, Charon e Puck, cada uma com o seu jeito (firme, leve, animada, tranquila…). Escolha no “⋯” do ao vivo: a voz nova se apresenta na hora. Com voz feminina, ela é “a Lumen” e fala de si no feminino; com voz masculina, ele é “o Lumen”.' },
    ],
  },
  {
    versao: 442, data: '2026-11-02', titulo: 'Lumen lê o PDF certo do acervo e escreve bonito',
    itens: [
      { tipo: 'melhoria', texto: 'O Lumen lê de verdade o arquivo do acervo que trata da sua pergunta: em “qual a estrutura da cerimônia do casamento?”, ele abre o Ritual do Matrimônio inteiro e responde pelo que está escrito nele (o mesmo com o batismo, a unção dos enfermos e os outros rituais). Antes ele via só pedaços soltos do texto.' },
      { tipo: 'correcao', texto: 'O texto do alto do Lumen ao vivo vinha bagunçado: o nome do arquivo com “.pdf.pdf”, palavras partidas, títulos em maiúsculas no meio da frase e pedaços começando pela metade. Agora os nomes aparecem limpos (“Cerimonial dos Bispos”), o texto dos PDFs vem arrumado e só frases inteiras são lidas.' },
      { tipo: 'correcao', texto: 'No ao vivo, a caixa com o que você fala não corta mais na terceira linha: ela mostra até cinco linhas e acompanha o fim do que você está falando.' },
      { tipo: 'melhoria', texto: 'Na conversa por texto, quando a pergunta passa de uma linha, ela ocupa a largura toda da caixa e os botões (enviar arquivo, microfone e enviar) descem para a linha de baixo, como no Gemini. Antes o texto ficava espremido no meio, no celular. Vale no celular, no tablet em pé e deitado e no computador.' },
    ],
  },
  {
    versao: 441, data: '2026-11-02', titulo: 'Lumen: o anexar e o microfone do chat voltam a funcionar',
    itens: [
      { tipo: 'correcao', texto: 'Na conversa por texto do Lumen, o botão de enviar arquivo ligava a gravação da voz (“Ouvindo…”), e o botão do microfone não fazia nada. Agora o de anexar abre a escolha do arquivo, e o microfone liga o ditado.' },
      { tipo: 'correcao', texto: 'Dúvidas como “como o salmista deve proclamar o salmo?” não viram mais uma lista de cantos repetidos com versos de antífona: sem a IA, a resposta vem dos documentos do acervo e da internet.' },
    ],
  },
  {
    versao: 440, data: '2026-11-02', titulo: 'Lumen pede o microfone e volta a falar',
    itens: [
      { tipo: 'correcao', texto: 'O Lumen ao vivo mostrava o texto, mas a voz não saía. No celular e no tablet Android, o microfone que fica atento para você interromper colocava o som em “modo ligação”, e a voz ia para o alto-falante de ouvido, quase muda. Agora a voz sai normal, e se o aparelho pausar a voz sozinho, ela volta a tocar.' },
      { tipo: 'novo', texto: 'O app pede a permissão do microfone antes de usar, no Lumen ao vivo e no ditado, com uma explicação. Se o microfone estiver bloqueado, ele mostra o caminho para liberar e o botão Tentar de novo.' },
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
