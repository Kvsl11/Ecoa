// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 530, data: '2026-11-05', titulo: 'Só clipe de verdade',
    itens: [
      { tipo: 'correcao', texto: 'Músicas como Blast Off, do Bruno Mars, vinham com um "vídeo" que é só a capa da música parada. Agora o app reconhece esses vídeos (pelo nome, como "Official Audio" e "Topic", e pelas imagens do vídeo, que são todas iguais) e só aceita clipe de canal oficial (o do artista, o VEVO ou a gravadora; não o de fã). Ele procura o clipe oficial; Sem clipe oficial, a música fica só música: sem o ícone de vídeo nas listas, sem a capa animada (só a capa normal) e sem o "Mudar para vídeo".' },
      { tipo: 'correcao', texto: 'O clipe e o áudio oficial com os outros artistas no nome ("Bruno Mars, Anderson .Paak, Silk Sonic - Leave the Door Open") voltam a ser reconhecidos. As músicas que tinham perdido o áudio oficial por isso o procuram de novo, sozinhas.' },
      { tipo: 'melhoria', texto: 'As músicas que você já tinha, inclusive as baixadas, são conferidas sozinhas, em segundo plano. Nas baixadas, o clipe oficial achado é baixado; na que fica só música, o vídeo parado sai do aparelho (sobra mais espaço) e ela continua tocando sem internet, só com o som.' },
    ],
  },
  {
    versao: 529, data: '2026-11-05', titulo: 'A cifra certa da música',
    itens: [
      { tipo: 'correcao', texto: 'Algumas músicas vinham com a cifra de outra música com o mesmo nome (a primeira achada no Cifra Club). Agora o app confere a cifra pela letra da música: se não for ela, tenta as outras cifras com o mesmo título e fica com a que é da música. Se nenhuma for, a música fica só com a letra, em vez de uma cifra errada.' },
      { tipo: 'correcao', texto: 'Quando o app consegue ouvir a gravação (música baixada, áudio importado ou o seu servidor), ele confere também os acordes: se a cifra não casa com o som em nenhum tom, procura entre as outras cifras da mesma música uma que case e troca, avisando.' },
      { tipo: 'correcao', texto: 'As músicas que você já tinha são conferidas sozinhas, em segundo plano. A cifra que você escreveu ou editou nunca é trocada.' },
    ],
  },
  {
    versao: 528, data: '2026-11-05', titulo: 'A última música na barra e o app abrindo no Início',
    itens: [
      { tipo: 'melhoria', texto: 'A barra do player embaixo continua com a última música tocada mesmo depois de fechar o app ou de ele se atualizar: abrindo de novo, ela está lá, pausada no ponto em que parou, pronta para continuar (com a fila de antes).' },
      { tipo: 'melhoria', texto: 'Abrindo o app de novo, ele começa sempre no Início, e não na tela em que você estava ao sair. Voltando para ele depois de mais de 2 minutos fora (sem música tocando), também. Recarregando, você fica na mesma tela; os avisos e os links de uma música continuam abrindo direto nela, e uma edição em andamento não é largada.' },
    ],
  },
  {
    versao: 527, data: '2026-11-05', titulo: 'Os tons na cor da música',
    itens: [
      { tipo: 'melhoria', texto: 'No player, tocando no tom, abre a janela com os 12 tons juntos, pintada na cor da música como os desenhos dos acordes: o tom da tela aceso na cor dos acordes, o original da cifra e o da gravação marcados, e o meio tom acima e abaixo embaixo.' },
    ],
  },
  {
    versao: 526, data: '2026-11-05', titulo: 'A cifra no tom da gravação e a tabela de tons',
    itens: [
      { tipo: 'novo', texto: 'A cifra no tom da música que toca: algumas cifras vêm em outro tom (quem escreveu tirou em outro, ou escreveu com o capotraste). O app ouve a gravação, compara as notas que soam com as dos acordes da cifra e, quando a resposta é clara, põe a cifra no tom da gravação, avisando ("Cifra no tom da gravação: D → E"). Ele ouve pelo arquivo baixado, pelo áudio que você importou ou pelo seu servidor; o tom que você escolher à mão nunca é mudado.' },
      { tipo: 'melhoria', texto: 'No player, o tom virou um botão só: tocando nele, abre a tabela com os 12 tons, com o original da cifra e o da gravação marcados, e o meio tom acima e abaixo embaixo.' },
      { tipo: 'melhoria', texto: 'As músicas baixadas que você já tinha são conferidas sozinhas, em segundo plano, e as que estavam em outro tom passam para o da gravação.' },
    ],
  },
  {
    versao: 525, data: '2026-11-05', titulo: 'O vídeo e a música são da mesma música',
    itens: [
      { tipo: 'correcao', texto: 'Muitas vezes o clipe vinha certo, mas o modo música tocava outra: a mesma música de outro artista, ou outra música com o nome dentro ("Beija-flor" no lugar de "Voa Beija-flor", um pot-pourri). Agora o áudio oficial e o clipe só valem quando são do artista certo e com o título exato; sem um assim, fica só o clipe.' },
      { tipo: 'correcao', texto: 'A cifra e a letra também: o título igual vem antes do parecido, e uma dupla como "Jorge & Mateus" não é mais confundida com outro "Jorge".' },
      { tipo: 'correcao', texto: 'As músicas que você já tinha são conferidas sozinhas, em segundo plano: o áudio de outra música sai, o certo é procurado, e a letra sincronizada e o download são refeitos. O áudio que você importou fica.' },
    ],
  },
  {
    versao: 524, data: '2026-11-05', titulo: 'O mesmo carregando no app todo',
    itens: [
      { tipo: 'melhoria', texto: 'Em todo o app, o carregando virou o contorno do que vai aparecer, com um brilho passando, no lugar exato: as linhas das músicas (artista, setores, acervo, orações, fontes, vídeos), as capas lado a lado (álbuns, trocar a capa), a capa grande do álbum e a foto redonda do artista, os parágrafos (Sobre o artista, oração) e a folha da partitura. Antes eram círculos girando com um texto embaixo.' },
      { tipo: 'melhoria', texto: 'Os cantos da Cindy Ferrarezi abrem como as músicas da busca: a tela do canto aparece na hora, com o contorno da letra.' },
    ],
  },
  {
    versao: 523, data: '2026-11-05', titulo: 'Sem o círculo girando ao abrir a música',
    itens: [
      { tipo: 'melhoria', texto: 'Ao tocar numa música da busca que ainda está sendo preparada, a tela dela abre na hora, com a cor, a capa, o nome e o contorno da letra, e se completa sozinha quando tudo chega. Antes aparecia um círculo girando no lugar dos botões da linha. A seta de voltar desiste da música e volta para a busca.' },
      { tipo: 'melhoria', texto: 'Com o player aberto, a música tocada vai direto para ele, e a linha só pulsa de leve enquanto ela é preparada.' },
    ],
  },
  {
    versao: 522, data: '2026-11-05', titulo: 'A música da busca abre na hora',
    itens: [
      { tipo: 'melhoria', texto: 'Na Busca, as primeiras músicas da lista já vão sendo preparadas enquanto você olha: a cifra, a letra, o vídeo, a letra sincronizada, o áudio oficial e a capa. Ao tocar numa delas, ela abre na hora, já com tudo sincronizado. As outras começam a ser preparadas no instante em que o dedo encosta. Com a economia de dados ligada, só a que você toca é preparada.' },
    ],
  },
  {
    versao: 521, data: '2026-11-05', titulo: 'A busca sem bolinhas girando',
    itens: [
      { tipo: 'melhoria', texto: 'Na Busca, enquanto você digita, o resultado anterior continua na tela (mais apagado) e uma linha fina corre embaixo da barra de busca. Quando chega o resultado novo, a tela troca de uma vez, sem pular. Antes cada seção (Artistas, Acervo, Músicas) apagava e ganhava uma bolinha girando.' },
      { tipo: 'melhoria', texto: 'Na primeira busca e em "Católicas em alta" e "Artistas católicos", aparece o contorno das capas e das linhas no lugar exato do que vai chegar. As músicas vêm primeiro, depois os artistas e o acervo.' },
      { tipo: 'melhoria', texto: 'No resto do app, o carregando virou três pontinhos discretos, no lugar do anel colorido girando.' },
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
