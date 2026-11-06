// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 563, data: '2026-11-06', titulo: 'O app de Android: baixa do site, sem a foto por cima e com o player do Android',
    itens: [
      { tipo: 'correcao', texto: 'No app de Android, a foto do perfil ficava por cima dos títulos e dos botões do topo (o app ia por baixo da barra de status do celular). Agora ele começa abaixo dela, como no navegador.' },
      { tipo: 'melhoria', texto: 'No app de Android, o aviso de "tocando" virou o player do próprio Android: com a capa, a barra do tempo (dá para arrastar), os botões, a tela de bloqueio e os botões do fone (precisa instalar o APK novo).' },
      { tipo: 'correcao', texto: 'O "Baixar o app para Android" ficava parado em "Baixando…" e o arquivo não aparecia nos downloads (o link levava ao GitHub, que redireciona para outro endereço). Agora o Ecoa.apk baixa direto do próprio site do Ecoa.' },
      { tipo: 'melhoria', texto: 'No app de Android, Ajustes → Downloads e economia de dados mostra o espaço de verdade do celular: o total, o livre, o que os outros apps e o sistema ocupam e tudo o que o Ecoa guarda (precisa instalar o APK novo). Os downloads do app ficam no próprio app, separados dos do navegador: a música baixada no navegador precisa ser baixada de novo no app.' },
      { tipo: 'correcao', texto: 'No app de Android, as notificações dos downloads não apareciam. Agora são as do próprio Android (com a capa; tocar abre a música), e o Android pergunta pelas notificações ao abrir o app e pelo microfone na primeira vez que ele é usado (precisa instalar o APK novo).' },
      { tipo: 'melhoria', texto: 'No app de Android, saíram o "Instalar o app" (em Sobre) e a tela Permissões dos Ajustes: as permissões são as do Android (Configurações → Apps → Ecoa). No navegador, tudo continua como estava.' },
    ],
  },
  {
    versao: 562, data: '2026-11-06', titulo: 'O Ecoa para Android, com widget',
    itens: [
      { tipo: 'novo', texto: 'O Ecoa ganhou um app de Android (APK): na gaveta do perfil, "Baixar o app para Android" (aparece no Android, pelo navegador). Ele é o mesmo Ecoa, com a sua conta Google, e traz o que o navegador não deixa: o widget da tela inicial (a capa, o nome e o artista da última música, com voltar, tocar/pausar e pular), o aviso de "tocando" nas notificações com os mesmos botões, que mantém a música tocando com o app minimizado, e os downloads guardados no próprio app.' },
    ],
  },
  {
    versao: 561, data: '2026-11-06', titulo: 'O modo música só com o áudio oficial',
    itens: [
      { tipo: 'correcao', texto: 'O modo música podia tocar um vídeo que um fã subiu no próprio canal, com o nome do artista só no título, e não a gravação do canal oficial (em "Odres Novos", tocava o vídeo de outro canal, e não o do Ministério Gerados pela Imaculada). Agora o áudio do modo música vem só de uma fonte oficial: a faixa do YouTube Music, o canal do próprio artista, o mesmo canal do vídeo que você abriu ou o da gravadora. Sem achar, o modo música toca o próprio vídeo oficial. As músicas salvas são conferidas sozinhas, e o áudio que não for oficial sai.' },
    ],
  },
  {
    versao: 560, data: '2026-11-06', titulo: 'A letra e a cifra do artista certo',
    itens: [
      { tipo: 'correcao', texto: 'O vídeo de uma música no canal do próprio artista (como "Odres Novos", no canal do Ministério Gerados pela Imaculada) podia vir com a letra e a cifra de outra música de mesmo nome, de outro artista. Agora só vale a do artista do canal; sem achar, a música fica sem a letra, em vez de vir com a de outra. O mesmo vale para o conserto das músicas salvas sem a letra, que também mantém o vídeo que estava tocando.' },
    ],
  },
  {
    versao: 559, data: '2026-11-06', titulo: 'As Estatísticas são da sua conta Google',
    itens: [
      { tipo: 'melhoria', texto: 'As Estatísticas e os Recentes passam a ser da sua conta Google, e não de cada aparelho: o que você ouve no celular, no tablet e no computador entra junto, somado. Cada aparelho manda o que ouviu para a sua conta (com o que já tinha guardado), e nenhum apaga o do outro. Na sessão privada, continua sem contar nada.' },
    ],
  },
  {
    versao: 558, data: '2026-11-06', titulo: 'Os vídeos com "//" no título trazem a letra e a cifra',
    itens: [
      { tipo: 'correcao', texto: 'O vídeo com o título no jeito "Odres Novos // Luau da Imaculada II" (comum nos vídeos de música católica) abria como uma música com esse nome inteiro, e a busca não achava a letra nem a cifra. Agora o nome da música é o da esquerda e o artista é o canal. As músicas que já tinham sido salvas assim, sem a letra e a cifra, arrumam o nome e procuram de novo sozinhas (o "Consertar agora" do Diagnóstico também).' },
    ],
  },
  {
    versao: 557, data: '2026-11-06', titulo: 'A música baixada continua com o app minimizado',
    itens: [
      { tipo: 'correcao', texto: 'A música baixada parava ao minimizar o app ou apagar a tela quando tocava o clipe baixado (no modo vídeo, ou no modo música de uma música sem o áudio oficial): o celular pausa os vídeos em segundo plano. Agora, ao minimizar, o mesmo arquivo passa a tocar só como som, do mesmo ponto, e volta a ser vídeo quando o app abre de novo. A próxima música da fila, baixada, também continua.' },
    ],
  },
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
