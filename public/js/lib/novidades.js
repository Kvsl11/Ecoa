// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 476, data: '2026-11-04', titulo: 'Servidor da IA mais claro',
    itens: [
      { tipo: 'melhoria', texto: 'A tela do Servidor da IA não fala mais em "sem a cota do mês" quando o Codespace está ligado: o app acha o Codespace sozinho, sem QR code, e o aviso de cota de antes some assim que ele responde.' },
    ],
  },
  {
    versao: 475, data: '2026-11-04', titulo: 'Codespace achado sozinho e letra no tempo certo',
    itens: [
      { tipo: 'correcao', texto: 'O app acha o Codespace sozinho, sem QR code: o endereço publicado no site e, se ele ainda não foi atualizado, o último Codespace que funcionou neste aparelho. Um endereço velho de QR code guardado não atrapalha mais (sai sozinho). E o Modal (a reserva) só é usado se responder de verdade: desativado por falta de crédito, o app continua tentando o Codespace, e o Servidor da IA, nos Ajustes, diz o que está acontecendo.' },
      { tipo: 'correcao', texto: 'Algumas músicas tinham a letra sincronizada fora do tempo, como "Club Tropicana" e "Everything She Wants" do Wham!. A letra vem do LRCLIB, que tem várias edições da mesma música com a mesma duração, mas com a primeira frase em tempos bem diferentes (em "Club Tropicana", de 10 s a 52 s), e o app escolhia uma pela duração. Agora, quando as edições discordam, o servidor da IA ouve o áudio e acerta a letra no ponto em que ela é cantada. As músicas já salvas são conferidas sozinhas (só as que estão nesse caso).' },
    ],
  },
  {
    versao: 474, data: '2026-11-04', titulo: 'Sem a linha no Tocando agora',
    itens: [
      { tipo: 'correcao', texto: 'A linha clara que ainda aparecia no degradê do Tocando agora, logo acima do cartão da letra, sumiu de vez (no celular e no tablet). Eram os quadros do clipe, no fundo, aparecendo por baixo do degradê bem na borda.' },
      { tipo: 'melhoria', texto: 'Trocar a capa: o contorno da capa escolhida aparece inteiro, e no tablet a tela sobe do rodapé, como os menus do ⋮, em vez de ficar flutuando.' },
    ],
  },
  {
    versao: 473, data: '2026-11-04', titulo: 'Ícones certos no ⋮ da música',
    itens: [
      { tipo: 'melhoria', texto: 'No ⋮ da música, cada opção tem o seu ícone: "Trocar música" com as setas de trocar, "Abrir a música" com a seta de abrir (antes as duas tinham a mesma nota musical) e "Criar partitura" com o ícone de partitura, a pauta com a nota (antes eram umas estrelinhas).' },
    ],
  },
  {
    versao: 472, data: '2026-11-04', titulo: 'A capa certa, a fila a partir da que toca',
    itens: [
      { tipo: 'correcao', texto: 'As músicas não ganham mais a capa de outra gravação. O app pegava a primeira capa com o título igual, mesmo de outro artista de nome parecido: "Here Comes The Sun" saía com a capa de um disco de ukulele, e "Aba" do Kemuel com a de uma coletânea. Agora vale o artista com o nome igual e, entre as gravações dele, a mais ouvida (o álbum ou o single que todo mundo conhece). As músicas que já estavam com a capa errada são corrigidas sozinhas.' },
      { tipo: 'melhoria', texto: 'A fila começa pela música que está tocando, seguida das próximas. As que já tocaram somem dela; com "repetir todas", elas aparecem no fim, que é quando tocam de novo. A que está tocando fica sempre no topo (não dá para arrastar para baixo dela).' },
      { tipo: 'correcao', texto: 'Sumiu a linha fininha que aparecia no degradê do Tocando agora, logo acima do cartão da letra (no tablet e no celular).' },
      { tipo: 'novo', texto: 'Trocar a capa: no ⋮ da música, escolha entre as capas achadas (o álbum, o single, as outras gravações) ou uma foto do aparelho. A capa escolhida fica; para voltar, toque em "Automática".' },
    ],
  },
  {
    versao: 471, data: '2026-11-04', titulo: 'A fila que você vê é a que toca',
    itens: [
      { tipo: 'correcao', texto: 'A fila não muda mais sozinha. Com a música tocando de uma playlist ou de um repertório, abrir essa mesma música pela biblioteca (ou pela busca) passava a fila, sem aviso, para a da biblioteca, em ordem alfabética: a próxima que tocava não era a que a fila mostrava. Agora a música continua na fila em que estava.' },
      { tipo: 'melhoria', texto: 'Partituras no tablet deitado (e no computador): a tela agora usa a largura toda, em duas colunas. À esquerda, o título, os atalhos (Gerar com IA, Nova partitura) e o Acervo litúrgico; à direita, as suas partituras. Sem nenhuma partitura ainda, o recado ocupa a coluna em vez de deixar metade da tela vazia.' },
    ],
  },
  {
    versao: 470, data: '2026-11-04', titulo: 'Acordes afinados e música sem acelerar',
    itens: [
      { tipo: 'correcao', texto: 'O som dos acordes (tocar no desenho do acorde) não sai mais desafinado. Uma das gravações do violão, a do Ré agudo, soava meio tom acima (era um Ré#): os acordes com essa nota, como o G com capotraste na 7ª casa, saíam com um choque de meio tom, "zoados". Agora cada nota é afinada pela altura medida de cada gravação (algumas outras também estavam um pouco fora).' },
      { tipo: 'correcao', texto: 'A música não acelera nem desacelera mais. O automix tocava a próxima um pouco mais rápida ou mais lenta para casar com o andamento da anterior (e voltava aos poucos), e às vezes o player ficava com a velocidade mudada e a música seguinte tocava acelerada, mesmo com a transição desligada. Agora a velocidade nunca muda, e o encaixe na batida é só no comecinho, ainda sem som.' },
    ],
  },
  {
    versao: 469, data: '2026-11-04', titulo: 'Crossfade de verdade e karaokês atualizados sozinhos',
    itens: [
      { tipo: 'correcao', texto: 'O crossfade e o automix agora baixam o volume da música que está acabando: ela vai sumindo enquanto a próxima sobe. Antes, logo que a próxima começava, o app trocava ela para o áudio oficial e a transição se cancelava: a anterior era cortada e a próxima entrava no volume cheio.' },
      { tipo: 'melhoria', texto: 'O volume da música que sai desce desde o começo da transição, de um jeito que dá para ouvir (antes ficava quase cheio na primeira metade). E o automix não corta mais o final instrumental de músicas que tocam pelo YouTube: ele só encurta o final quando consegue encaixar na batida (nas músicas baixadas).' },
      { tipo: 'melhoria', texto: 'Os karaokês que você já tinha são atualizados sozinhos, em segundo plano, para tirar só o cantor (o back vocal volta). Não são feitos do zero: o servidor aproveita a voz que já estava separada, sem baixar a música de novo, e fica bem mais rápido. Tocando no microfone de um que ainda não foi atualizado, ele atualiza na hora do mesmo jeito.' },
    ],
  },
  {
    versao: 468, data: '2026-11-04', titulo: 'Karaokê tira só o cantor',
    itens: [
      { tipo: 'melhoria', texto: 'O karaokê agora tira só a voz do cantor principal: o back vocal e o coro continuam tocando, como no Apple Music. A separação também ficou mais precisa (modelos melhores na placa de vídeo) e sem o chiado que aparecia nas emendas, e o resto da música sai exatamente como na gravação, sem perder qualidade.' },
      { tipo: 'melhoria', texto: 'Músicas ao vivo: a plateia (gritos, palmas, o povo cantando junto) não confunde mais a separação, e continua no karaokê junto com a banda.' },
      { tipo: 'melhoria', texto: 'Sem internet, o karaokê de antes continua funcionando até ser atualizado.' },
    ],
  },
  {
    versao: 467, data: '2026-11-04', titulo: 'Crossfade e automix entre as músicas',
    itens: [
      { tipo: 'novo', texto: 'Transição entre as músicas, como no Spotify e no Apple Music (Ajustes → Música e cifra). No crossfade, a música que acaba vai sumindo enquanto a próxima já começa, nos últimos 1 a 12 segundos (você escolhe). No automix, o app escolhe sozinho onde e como passar: depois da última frase cantada (sem cortar a voz) e, nas músicas baixadas, no tempo da batida, com a próxima entrando na primeira batida dela e no mesmo andamento.' },
      { tipo: 'melhoria', texto: 'No iPhone e no iPad o sistema não deixa o app mudar o volume da música: lá elas continuam trocando como antes, no fim.' },
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
