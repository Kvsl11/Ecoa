// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 463, data: '2026-11-03', titulo: 'Microfone do karaokê redesenhado',
    itens: [
      { tipo: 'melhoria', texto: 'O microfone do karaokê agora parece um microfone de verdade: a cabeça com a grade, o anel e o cabo, deitado como o do Apple Music, com as estrelinhas piscando em volta.' },
    ],
  },
  {
    versao: 462, data: '2026-11-03', titulo: 'Servidor da IA sempre ligado, sozinho',
    itens: [
      { tipo: 'melhoria', texto: 'O servidor da IA agora se ajeita sozinho: o Codespace do GitHub é o principal e, quando ele está desligado, o servidor de reserva (o Modal) atende na hora e manda o GitHub ligar o Codespace, que assume em uns 2 minutos. Sem a cota grátis do mês no Codespace, tudo fica no Modal. Não é mais preciso ir ao GitHub ligar nada, ler QR code ou colar endereço.' },
      { tipo: 'melhoria', texto: 'Ajustes → Avançado → Servidor da IA mostra qual dos dois está atendendo e por quê (o Codespace ligando, sem cota…).' },
    ],
  },
  {
    versao: 461, data: '2026-11-03', titulo: 'Karaokê sem depender do YouTube no servidor',
    itens: [
      { tipo: 'melhoria', texto: 'Nas músicas baixadas, o karaokê usa o próprio áudio do aparelho: ele vai para o servidor da IA, que só separa a voz da banda, sem precisar baixar a música do YouTube (que costuma recusar os servidores na nuvem). Funciona com o servidor no seu computador, no Codespace ou no Modal.' },
    ],
  },
  {
    versao: 460, data: '2026-11-03', titulo: 'Karaokê: tire a voz da música',
    itens: [
      { tipo: 'novo', texto: 'Karaokê, como o do Apple Music, nas músicas com a letra sincronizada: na letra na tela toda, toque no microfone com as estrelinhas (à direita, em cima da barra do tempo) e a voz do cantor some, ficando só a banda, para você cantar no lugar. É um controle deslizante: arraste o microfone para cima e a voz volta um pouco, de guia, para a música que você ainda está aprendendo (a letra atrás se apaga enquanto você arrasta). Toque de novo e a música volta a ser a gravação inteira, sem parar. Também no ⋯ do Tocando agora.' },
      { tipo: 'novo', texto: 'Nas músicas baixadas, o karaokê vem junto com o download (Ajustes → Downloads → “Baixar também o karaokê”): o microfone liga na hora, até sem internet. Nas outras, a primeira vez leva de 1 a 3 minutos (o servidor da IA separa a voz da banda, com a música tocando normal enquanto isso; o anel do microfone mostra quanto falta), e depois fica guardado. Com o karaokê ligado, a próxima música da fila já começa sem a voz.' },
      { tipo: 'melhoria', texto: 'A voz e a banda vêm separadas em estéreo e na qualidade cheia, no mesmo arquivo: nunca se desencontram, e com a voz no máximo o som é exatamente o da gravação. Funciona com o áudio oficial, com o vídeo e com o áudio que você importou.' },
    ],
  },
  {
    versao: 459, data: '2026-11-03', titulo: 'Artista e álbum em todas as músicas',
    itens: [
      { tipo: 'correcao', texto: 'No ⋯ das músicas da biblioteca, das playlists e dos repertórios, “Ir para o artista” e “Ver álbum” aparecem em toda música que tem artista. Antes só apareciam nas cifras que vieram do Cifra Club; as outras (de outros sites, do acervo, importadas) agora acham o artista pelo nome e o álbum pelo título.' },
    ],
  },
  {
    versao: 458, data: '2026-11-03', titulo: 'Servidor da IA ao vivo',
    itens: [
      { tipo: 'melhoria', texto: 'Os indicadores do Servidor da IA e da conta do YouTube atualizam sozinhos, sem precisar sair da tela: com o Codespace desligado, a tela confere a cada 5 segundos e fica verde assim que ele liga; ligado, confere a cada 15 segundos (o Lumen fica verde sozinho quando a chave da IA chega). Embaixo do estado aparece a hora da última conferência.' },
    ],
  },
  {
    versao: 457, data: '2026-11-03', titulo: 'Codespace liga o servidor sozinho',
    itens: [
      { tipo: 'correcao', texto: 'O Codespace não ligava o servidor sozinho, nem deixava a porta pública. Agora, ao ligar, o servidor sobe na hora (os pacotes novos instalam por trás e ele reinicia sozinho no fim) e, quando o GitHub não deixa a porta pública, o Codespace abre um túnel seguro e publica esse endereço no site. Os aparelhos acham o servidor sozinhos em uns 2 minutos, sem QR code.' },
    ],
  },
  {
    versao: 456, data: '2026-11-03', titulo: 'Servidor da IA sem nada para configurar',
    itens: [
      { tipo: 'melhoria', texto: 'Sem passo manual: o Codespace publica o próprio endereço no site quando liga, e o app acha o servidor sozinho em qualquer aparelho. A conexão do YouTube também volta sozinha: se o servidor perdeu a conexão (um Codespace novo, por exemplo), o app manda de novo a que está guardada no aparelho. Só quando o YouTube recusa a conta (os cookies venceram) é preciso conectar outra vez.' },
      { tipo: 'novo', texto: 'Tela nova Ajustes → Avançado → Servidor da IA: mostra numa olhada se o servidor está ligado, se o YouTube está conectado, se o Lumen está com a IA e se a voz e os tempos estão sendo ouvidos pelos modelos melhores. Desligado, o botão Ligar no GitHub leva direto ao Codespace. O campo para colar o endereço do servidor saiu do caminho (fica em “Usar outro servidor”, só para o servidor no computador).' },
    ],
  },
  {
    versao: 455, data: '2026-11-03', titulo: 'O servidor da IA é o do Codespace',
    itens: [
      { tipo: 'melhoria', texto: 'Tudo o que usava o servidor do Modal agora usa o servidor do Codespace do GitHub: a partitura pela IA, a letra sincronizada e o Lumen. Com o endereço do Codespace gravado no site, qualquer aparelho acha o servidor sozinho, sem ler o QR code. Com o Codespace desligado, a tela avisa para ligá-lo, e a partitura sai no próprio aparelho enquanto isso.' },
    ],
  },
  {
    versao: 454, data: '2026-11-03', titulo: 'Coral pela IA com vozes de verdade',
    itens: [
      { tipo: 'melhoria', texto: 'No coral feito pela IA, o Contralto, o Tenor e o Baixo agora são escritos pela cifra da música, como num hinário: cada voz canta uma nota do acorde, sem cruzar com as outras, perto da nota de antes e no mesmo ritmo e com a mesma letra do Soprano. Antes essas vozes saíam das notas do violão e do teclado, e ficavam emboladas. Se a gravação tem mesmo as 4 vozes, escolha “Coral do áudio” em Ajustar → Vozes.' },
      { tipo: 'melhoria', texto: 'O servidor separa o cantor principal do backing vocal: a melodia sai só da voz do solista, conferida pela afinação (antes o backing fazia a voz parecer um coral e essa conferência ficava de fora). E as batidas e o primeiro tempo de cada compasso agora são ouvidos por uma rede treinada para isso, então o compasso e a anacruse acertam mais.' },
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
