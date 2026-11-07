// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 586, data: '2026-11-07', titulo: 'O voltar do Android que não fecha o app',
    itens: [
      { tipo: 'correcao', texto: 'No app de Android, o gesto de voltar (ou o botão) fechava o app inteiro. Agora ele volta como no navegador: fecha primeiro o que estiver aberto (uma janela, uma folha, o menu, a gaveta do perfil) e depois volta para a tela anterior. Na primeira tela, o app vai para o segundo plano, sem fechar, e a música continua tocando. Vem com a atualização do app.' },
    ],
  },
  {
    versao: 585, data: '2026-11-07', titulo: 'Adicionar à playlist: os botões no rodapé e só as músicas que faltam',
    itens: [
      { tipo: 'melhoria', texto: 'Em "Adicionar a esta playlist", as músicas que já estão na playlist não aparecem mais na lista: só as que dá para adicionar.' },
      { tipo: 'correcao', texto: 'Em "Adicionar a esta playlist" (e ao escolher uma música), os botões Selecionar todas, Cancelar e Adicionar ficam sempre no rodapé, e a lista rola acima deles. Antes, com a folha puxada para cima, os botões ficavam no meio da tela, com um espaço vazio embaixo.' },
    ],
  },
  {
    versao: 584, data: '2026-11-07', titulo: 'Tudo mais rápido: as fotos, a música da busca, os artistas e os álbuns',
    itens: [
      { tipo: 'melhoria', texto: 'As fotos dos artistas (na biblioteca, na busca, na música) chegam muito mais rápido: o app pergunta ao YouTube, ao Cifra Club e ao Deezer ao mesmo tempo, em vez de um depois do outro, e não espera mais os servidores do YouTube que estão fora do ar (eles ficam de fora por um tempo).' },
      { tipo: 'correcao', texto: 'Na busca e na biblioteca, a fotinha do artista ao lado do nome podia ficar com o desenho de imagem quebrada. Agora, se a foto não carrega, volta o desenho do app e a foto é procurada de novo.' },
      { tipo: 'melhoria', texto: 'No app de Android, as consultas à internet (o Cifra Club, as letras, o Deezer, o YouTube, a liturgia) não ficam mais numa fila de 6 de cada vez, que um servidor fora do ar travava: agora vão muitas ao mesmo tempo, e o servidor que não responde é deixado de lado em 6 segundos. Vem com a atualização do app.' },
      { tipo: 'melhoria', texto: 'A música aberta pela busca aparece em poucos segundos: antes ela esperava a letra sincronizada (até 25 s), o áudio e o clipe (até 15 s) e o vídeo, um depois do outro. Agora abre logo, e o que ainda não chegou (a letra sincronizada, o áudio, o clipe, o vídeo) entra sozinho em seguida.' },
      { tipo: 'melhoria', texto: 'As páginas dos artistas e dos álbuns abrem mais rápido: o que já foi visto aparece na hora (e é atualizado em segundo plano), as páginas do Cifra Club não esperam mais um leitor lento antes de tentar outro, e, no app de Android, as músicas, os álbuns e a lista completa do artista vêm juntos.' },
      { tipo: 'melhoria', texto: 'No app de Android, a busca de vídeos lê a página do próprio YouTube, sem depender dos servidores públicos que vivem fora do ar. Vem com a atualização do app.' },
      { tipo: 'correcao', texto: 'No app de Android, o aviso de versão nova só aparecia ao abrir o app, e uma vez só: com o app aberto em segundo plano, a atualização não chegava. Agora ele confere também ao voltar para o app e, se você tocou em "Agora não", lembra de novo depois de 12 horas.' },
    ],
  },
  {
    versao: 583, data: '2026-11-07', titulo: 'A barrinha da música acima do aviso de offline',
    itens: [
      { tipo: 'correcao', texto: 'No celular (e no app de Android), com o aviso "Você está offline" / "Conectado novamente" / "Conexão lenta" embaixo, o menu subia para dar lugar a ele, mas a barrinha da música ficava no mesmo lugar, por cima dos ícones do menu. Agora ela sobe junto.' },
    ],
  },
  {
    versao: 582, data: '2026-11-06', titulo: 'O karaokê que você pede passa na frente',
    itens: [
      { tipo: 'correcao', texto: 'No app de Android, o karaokê pedido no microfone podia ficar parado no começo: ele esperava, numa fila só, os karaokês que o app faz sozinho em segundo plano (os das músicas baixadas). Agora o que você pede passa na frente, e os outros esperam. O áudio também vai para a separação em partes (um arquivo grande travava), e, se algo der errado, o motivo aparece na tela. E, no Wi-Fi, o modelo do karaokê (59 MB) já é baixado de antemão. Vem com a atualização do app.' },
    ],
  },
  {
    versao: 581, data: '2026-11-06', titulo: 'Os dados do artista na hora e a notificação de download que não some',
    itens: [
      { tipo: 'melhoria', texto: 'A foto do artista, os fãs, a apresentação ("Sobre o artista") e as fotos dos créditos aparecem na hora ao abrir a música: o app mostra o que já tem guardado e atualiza pela internet em segundo plano, sem aviso (antes esperava a internet toda vez e demorava muito). As músicas baixadas guardam também as fotos dos créditos, e os dados delas são atualizados sozinhos uma vez por dia.' },
      { tipo: 'melhoria', texto: 'No app de Android, a notificação do download fica presa enquanto há música baixando ou esperando na fila (não sai mais sem querer ao arrastar), com a barra do andamento; o download continua mesmo com o app minimizado. Quando a fila acaba, ela vira uma notificação comum. Vem com a atualização do app.' },
      { tipo: 'correcao', texto: 'No app de Android, o aviso "Você está offline" / "Conectado novamente" / "Conexão lenta" não aparecia: a página do app nem sempre fica sabendo quando a internet cai. Agora quem avisa é o próprio Android, que também mede a velocidade da rede para o "Conexão lenta". Vem com a atualização do app.' },
      { tipo: 'correcao', texto: 'No app de Android, voltar ao app depois de minimizado às vezes deixava a tela cinza, sem sair dela: o Android tinha fechado a parte que desenha a página, para liberar memória. Agora o app refaz a tela sozinho quando isso acontece (ou quando a página não responde), e essa parte fica com prioridade, para o Android só fechá-la em último caso. Vem com a atualização do app.' },
      { tipo: 'correcao', texto: 'No app de Android, ao atualizar o app (em Ajustes → Sobre ou no aviso de versão nova), a porcentagem do download pulava e voltava (10, 20 e pouco, 5…): cada toque em Atualizar começava outro download, e os dois se misturavam. Agora é um download só, que os dois lugares acompanham, e a barra só anda para a frente. Vem com a atualização do app.' },
    ],
  },
  {
    versao: 580, data: '2026-11-06', titulo: 'O karaokê do celular com muito mais qualidade',
    itens: [
      { tipo: 'melhoria', texto: 'No app de Android, o karaokê feito no celular passou para um modelo bem melhor: a voz não fica mais chiando no fundo e os instrumentos não somem junto com ela. Leva mais tempo (cerca do dobro, conforme o celular) e, na primeira vez, o app baixa o modelo novo (59 MB). Os karaokês já feitos no celular são refeitos sozinhos, um por vez. Dica: com "Baixar também o karaokê" ligado (Ajustes → Downloads), ele fica pronto junto com o download, antes de você precisar.' },
      { tipo: 'correcao', texto: 'Na capa animada (na barrinha e no Tocando agora), alguns clipes, sobretudo os antigos, mostravam uma imagem cinza com um "play" no meio ao trocar de música. Agora entra a imagem do próprio vídeo, e o aviso de "tocando" do Android também não usa mais essa imagem.' },
    ],
  },
  {
    versao: 579, data: '2026-11-06', titulo: 'A capa certa no aviso, o aviso de offline e a barrinha que acompanha o dedo',
    itens: [
      { tipo: 'correcao', texto: 'No app de Android, o aviso de "tocando" (e o widget) às vezes mostrava a capa da música anterior, principalmente sem internet. Agora a capa de antes sai na hora, e as capas das músicas baixadas ficam guardadas no celular para aparecerem certas offline. Vem com a atualização do app.' },
      { tipo: 'novo', texto: 'Como no Spotify: sem internet, aparece "Você está offline" embaixo do menu; quando a conexão volta, "Conectado novamente"; e, com a rede fraca, "Conexão lenta".' },
      { tipo: 'melhoria', texto: 'No app de Android, as informações da música e do artista (a foto e o canal do artista, as cifras, as letras) são buscadas direto pelo próprio celular, sem os serviços intermediários que falhavam: o "Sobre o artista" e os créditos vêm mais completos. Vem com a atualização do app.' },
      { tipo: 'correcao', texto: 'No app de Android, o "Consertar agora" do diagnóstico ficava minutos girando, esperando um servidor que o app não usa mais. Agora ele termina logo e também conserta o que é do celular: atualiza o baixador quando falta baixar alguma parte e refaz o karaokê que sumiu do aparelho. O diagnóstico ganhou a parte "App de Android", que mostra se o baixador, a busca direta, o Lúmen e o karaokê do celular estão funcionando.' },
      { tipo: 'melhoria', texto: 'Na barrinha da música, arrastar o nome para o lado troca de música como no Spotify: o nome acompanha o dedo e a próxima entra pelo outro lado. Uma passada rápida, mesmo curta, já troca.' },
    ],
  },
  {
    versao: 578, data: '2026-11-06', titulo: 'A partitura no próprio celular e as Novidades certas no app de Android',
    itens: [
      { tipo: 'novo', texto: 'No app de Android, a partitura pelo vídeo da música é feita no próprio celular, sem o servidor: o app baixa o áudio (ou usa o já baixado) e escreve a partitura ali mesmo.' },
      { tipo: 'correcao', texto: 'No app de Android, a tela Novidades passava da largura da tela (o texto era cortado à direita) e mostrava o número de versão do site. Agora cabe na tela e mostra a versão do app em que cada novidade chegou (quando o app sabe; senão, só a data).' },
    ],
  },
  {
    versao: 577, data: '2026-11-06', titulo: 'O karaokê e o Lúmen no próprio celular, no app de Android',
    itens: [
      { tipo: 'melhoria', texto: 'O app de Android não procura nem liga mais o servidor do GitHub (o Codespace) sozinho: era isso que gastava a cota de horas do mês. Os downloads, o karaokê, o Lúmen e a partitura agora são feitos no próprio celular.' },
      { tipo: 'novo', texto: 'No app de Android, o karaokê é feito no próprio celular, sem o servidor: a voz é separada da banda ali mesmo (de 1 a 2 minutos por música, conforme o celular; na primeira vez o app baixa o modelo, de 30 MB). Depois fica guardado e toca na hora, até sem internet. Nesse karaokê, o back vocal sai junto com o cantor.' },
      { tipo: 'novo', texto: 'No app de Android, o Lúmen responde direto do celular, sem o servidor: procura no acervo (inclusive no texto dos PDFs, guardado no aparelho) e pergunta ao Gemini, com a busca na web. Fotos, PDFs, áudios e vídeos enviados na conversa também vão direto para ele.' },
      { tipo: 'correcao', texto: 'O Baixar dos ⋮ de uma música às vezes não fazia nada: a música que já tinha tido o download pausado entrava na fila e saía na hora, sem aviso. Agora tocar em Baixar sempre baixa; e, se não der certo, o motivo aparece na tela (e não só na notificação).' },
      { tipo: 'correcao', texto: 'No aviso de versão nova do app de Android, "O que vem com ela" mostrava novidades antigas, que o app já tinha. Agora mostra as que chegam com a versão nova (a partir da próxima atualização).' },
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
