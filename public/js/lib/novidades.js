// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 556, data: '2026-11-06', titulo: 'A letra que acompanha também sem o LRCLIB, e as janelas no rodapé',
    itens: [
      { tipo: 'correcao', texto: 'Na barrinha de baixo (no celular e no tablet), o vídeo cobria o começo da linha do andamento da música. Agora ele para logo acima dela, e a linha aparece inteira.' },
      { tipo: 'novo', texto: 'As músicas que o LRCLIB e a NetEase não têm (muitas músicas católicas e brasileiras, que o Spotify tem por um serviço fechado) também ganham a letra que acompanha: o servidor da IA encaixa a letra da cifra na voz do vídeo, em segundo plano, e ela aparece sozinha quando fica pronta (leva um ou dois minutos, com o servidor ligado). O "Consertar agora" do Diagnóstico também faz isso.' },
      { tipo: 'correcao', texto: 'No Diagnóstico, tocar em "Consertar agora" numa música que não está na biblioteca parecia não fazer nada (o aviso ficava escondido atrás da janela). Agora o Diagnóstico diz que a música não está salva e o botão vira "Salvar na biblioteca"; salva, ela passa pelas correções sozinha. Depois do conserto, a janela também diz o que continua faltando e por quê (por exemplo, a letra sincronizada que o LRCLIB não tem), e o Copiar responde no próprio botão.' },
      { tipo: 'melhoria', texto: 'No celular, todas as janelas que sobem de baixo encostam no rodapé e vão de uma ponta à outra da tela, sem a folga embaixo e dos lados: as listas de opções (como os ⋮ do Tocando agora), o menu de mais opções e o calendário, como as outras folhas.' },
    ],
  },
  {
    versao: 555, data: '2026-11-06', titulo: 'O Diagnóstico arrumado',
    itens: [
      { tipo: 'correcao', texto: 'O Diagnóstico da música: o fim da lista ficava escondido atrás dos botões e não dava para ver. Agora o título e os botões ficam parados e só o meio rola, até a última parte. O sinal laranja dos avisos aparecia esticado numa barra (e o item com um fundo), e os botões de baixo ficaram organizados: Consertar agora em cima e, embaixo, Copiar e Fechar lado a lado, do mesmo tamanho.' },
    ],
  },
  {
    versao: 554, data: '2026-11-06', titulo: 'O Explorar sempre responde e o Diagnóstico no rodapé do tablet',
    itens: [
      { tipo: 'correcao', texto: 'No Explorar do Tocando agora, "Parecidos com…" e "Parecidas com…" às vezes não abriam nada (com o Justice, por exemplo): o Deezer recusava os pedidos feitos todos de uma vez ao abrir a tela, e o app guardava a resposta vazia como se não houvesse parecidos. Agora o pedido é refeito, e, se mesmo assim não vier nada, os cartões mostram outra sugestão (os artistas da rádio do artista, as músicas mais ouvidas dele) ou abrem as músicas do artista.' },
      { tipo: 'melhoria', texto: 'No tablet (em pé ou deitado), o Diagnóstico da música sobe do rodapé, como os ⋮, em vez de abrir no meio da tela.' },
    ],
  },
  {
    versao: 553, data: '2026-11-06', titulo: 'As barrinhas do tablet mais bem acabadas',
    itens: [
      { tipo: 'melhoria', texto: 'No painel do lado do tablet, a barrinha de cima (o nome da música, o artista, o ✓ e o play, que aparece ao rolar) ficou um pouco mais alta, e o nome não encosta mais na borda esquerda.' },
      { tipo: 'melhoria', texto: 'No tablet, com o player recolhido, o vídeo da barrinha de baixo fica colado na borda esquerda do cartão e com a altura toda dele, sem a margem em volta, como no celular e no Spotify.' },
    ],
  },
  {
    versao: 552, data: '2026-11-06', titulo: 'No tablet: a barra das prévias inteira e os tons no rodapé',
    itens: [
      { tipo: 'melhoria', texto: 'No tablet (em pé ou deitado), a janela "Escolher o tom" sobe do rodapé, como no celular, em vez de abrir no meio da tela por cima da cifra. Arraste a alça para baixo para fechar.' },
      { tipo: 'melhoria', texto: 'Nas prévias, no tablet (em pé ou deitado), o artista, as hashtags e o cartão da música vão de uma ponta à outra da tela, embaixo, em vez de ficarem numa coluna estreita à esquerda.' },
    ],
  },
  {
    versao: 551, data: '2026-11-06', titulo: 'Os artistas parecidos levam à página deles',
    itens: [
      { tipo: 'correcao', texto: 'No Explorar do Tocando agora, tocar num artista dos "Parecidos com…" não abria a página dele (as músicas e os álbuns): o app abria e logo voltava. O mesmo acontecia com as pessoas dos créditos ("Mostrar tudo" e "Por trás da música"). Agora a página do artista abre no lugar do Tocando agora.' },
    ],
  },
  {
    versao: 550, data: '2026-11-06', titulo: 'O nome certo nos vídeos relacionados',
    itens: [
      { tipo: 'correcao', texto: 'Alguns vídeos relacionados apareciam com o nome cortado: "Don\'t Stop \'Til You Get Enough", do Michael Jackson, virava "t Stop" (o apóstrofo era lido como aspas), e "Thriller (Official 4K Video)" virava "Thriller Video)". Agora o nome sai inteiro e sem os restos do "Official Video".' },
    ],
  },
  {
    versao: 549, data: '2026-11-06', titulo: 'Os cartões do Explorar sempre com foto',
    itens: [
      { tipo: 'correcao', texto: 'No Explorar do Tocando agora, o cartão "Parecidos com…" às vezes aparecia vazio (quando o primeiro artista parecido não tinha foto ou ela não carregava). Agora o app tenta a foto dos outros artistas parecidos, depois a do próprio artista e, no fim, a capa da música. Os cartões "Músicas de…" e "Parecidas com…" também não ficam mais vazios.' },
    ],
  },
  {
    versao: 548, data: '2026-11-06', titulo: 'Os vídeos relacionados tocam a música que você já tem',
    itens: [
      { tipo: 'correcao', texto: 'Nos vídeos relacionados do Tocando agora, tocar numa música que você já salvou (e baixou) abria uma cópia nova, só do YouTube, sem o download, a cifra e a letra sincronizada dela. Agora o app reconhece a música da sua biblioteca, pelo vídeo ou pelo nome e artista, e toca a sua (do aparelho, quando está baixada).' },
    ],
  },
  {
    versao: 547, data: '2026-11-06', titulo: 'Os downloads lembram o servidor e ficam mais rápidos',
    itens: [
      { tipo: 'correcao', texto: 'Ao sair do app ou recarregar a página, o app esquecia o servidor que estava baixando e dizia para ligar o servidor: nada baixava. Agora ele lembra o último servidor que atendeu e já abre com ele, e só troca se ele não responder.' },
      { tipo: 'correcao', texto: 'As músicas que estavam na fila para baixar (e a que estava baixando) eram esquecidas ao fechar o app. Agora a fila fica guardada e continua sozinha logo que o app abre de novo.' },
      { tipo: 'melhoria', texto: 'O servidor é achado bem mais rápido: todos os endereços são testados ao mesmo tempo, em vez de um por um (com o Codespace desligado, eram quase um minuto de espera a cada abertura).' },
      { tipo: 'melhoria', texto: 'Os downloads ficaram mais rápidos: o servidor prepara o som e o clipe ao mesmo tempo, o clipe oficial é procurado enquanto o servidor é conferido, e o servidor baixa do YouTube em pedaços (o YouTube segurava a velocidade). Se o servidor cai no meio, o app passa para outro na hora.' },
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
