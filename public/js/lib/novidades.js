// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
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
  {
    versao: 466, data: '2026-11-04', titulo: 'Karaokê só na música em que você ligou',
    itens: [
      { tipo: 'correcao', texto: 'O karaokê agora vale só para a música em que você tocou no microfone. Ao passar para outra música, ele desliga sozinho e ela toca normal, sem o servidor preparar o karaokê dela (antes ele continuava ligado e preparava o karaokê de cada música seguinte, gastando os créditos). Para usar em outra música, é só tocar no microfone dela.' },
    ],
  },
  {
    versao: 465, data: '2026-11-04', titulo: 'Karaokê sem estalos e o clipe de volta',
    itens: [
      { tipo: 'correcao', texto: 'O karaokê podia dar estalos e chiadinhos: o celular, ocupado com a tela, engasgava o som, e a banda com a voz às vezes passava do limite. Agora o som do karaokê tem mais folga e não estala, nem ao arrastar o volume da voz. Os karaokês novos também saem com mais qualidade (menos chiado onde a voz estava).' },
      { tipo: 'melhoria', texto: 'O microfone: com o karaokê ligado, tocar nele abre o volume da voz (para desligar, toque no microfone com o controle aberto); tocar fora do controle fecha ele na hora e a letra volta ao normal; e o microfone e a porcentagem ficam escuros quando o branco passa por eles, sem sumir.' },
      { tipo: 'correcao', texto: 'O clipe escolhido não some mais: quando ele é outra gravação da música (outra edição, cenas a mais), o “Mudar para vídeo” continua e toca o clipe. Antes a música ficava só com o áudio, as duas versões iguais.' },
      { tipo: 'melhoria', texto: 'O Lumen responde mais rápido: o Gemini responde direto, sem a etapa de “pensar” antes (que levava vários segundos a mais em toda pergunta).' },
    ],
  },
  {
    versao: 464, data: '2026-11-03', titulo: 'Karaokê muito mais rápido',
    itens: [
      { tipo: 'melhoria', texto: 'O karaokê agora é preparado numa placa de vídeo (no Modal), como nos apps profissionais de separar faixas: a voz sai da música em uns 15 a 30 segundos, em vez de 1 a 3 minutos. Só o karaokê vai para lá; o resto continua no servidor de sempre. Se a placa não estiver disponível, ele é preparado no servidor de sempre, como antes.' },
      { tipo: 'melhoria', texto: 'O volume da voz no microfone agora acompanha a barra: arrastando para baixo, a voz vai sumindo aos poucos e só some de vez lá embaixo (antes, baixar um pouquinho já tirava quase tudo). E saiu o “Karaokê” escrito embaixo da barra do tempo. O controle aberto mostra a porcentagem da voz e, em 0%, uma setinha para cima, mostrando que dá para arrastar.' },
    ],
  },
  {
    versao: 463, data: '2026-11-03', titulo: 'Microfone do karaokê redesenhado',
    itens: [
      { tipo: 'melhoria', texto: 'O microfone do karaokê agora parece um microfone de verdade, simples: a cabeça, o anel e o cabo, deitado como o do Apple Music, com as estrelinhas piscando em volta.' },
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
