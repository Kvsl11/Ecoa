// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 591, data: '2026-11-07', titulo: 'A partitura e o karaokê feitos mais rápido, com a mesma qualidade',
    itens: [
      { tipo: 'melhoria', texto: 'A partitura gerada no aparelho sai mais rápido, com o mesmo resultado: a IA ouve vários trechos da música de uma vez, em vez de um por um, e solta a memória de cada trecho (o celular não vai mais ficando lento até o fim da música). Nas músicas mais longas, ela também não cai mais para o modo lento por passar do limite da placa de vídeo.' },
      { tipo: 'melhoria', texto: 'No app de Android, o karaokê feito no celular sai mais rápido, com o mesmo som: enquanto o modelo separa a voz de um trecho, o celular já prepara o próximo e grava o anterior (antes era um de cada vez); as contas dos dois lados do estéreo são feitas juntas; e o modelo fica carregado entre uma música e outra. Vem com a atualização do app.' },
    ],
  },
  {
    versao: 590, data: '2026-11-07', titulo: 'As telas de partitura repaginadas',
    itens: [
      { tipo: 'melhoria', texto: 'As telas de partitura ganharam um visual mais moderno e limpo. Na lista, o "Gerar com IA" vem em destaque, com a "Nova partitura" e o acervo em cartões logo abaixo. Ao gerar, um anel mostra o andamento em porcentagem e o tempo, e as etapas aparecem numa linha do tempo. Na partitura pronta, as vozes (Coral, Coral do áudio, Melodia) ficam logo embaixo da prévia, e os botões Editar e Salvar ficam presos no pé da tela.' },
    ],
  },
  {
    versao: 589, data: '2026-11-07', titulo: 'Salvar da busca de primeira, e a música da busca no "Tocou por último"',
    itens: [
      { tipo: 'correcao', texto: 'Na busca, tocar no + para salvar uma música às vezes abria a música (com a tela de carregamento) e não salvava: o círculo é pequeno, e o toque um pouco fora dele caía na música. Agora a área do toque é maior, os toques seguintes enquanto salva não abrem a música, e salvar aproveita o que já começou a ser trazido (fica mais rápido). Se não der para salvar, o app avisa.' },
      { tipo: 'correcao', texto: 'O "Tocou por último", na gaveta do perfil, mostra também a música aberta pela busca que está tocando, mesmo antes de ser salva (antes aparecia a anterior).' },
    ],
  },
  {
    versao: 588, data: '2026-11-07', titulo: 'O "Conexão lenta" só quando está mesmo lenta',
    itens: [
      { tipo: 'correcao', texto: 'Nos dados móveis, o aviso "Conexão lenta" aparecia o tempo todo, mesmo com a internet boa: ele vinha da estimativa de velocidade do celular, que nos dados móveis costuma ser baixa e fixa. Agora o app confirma com uma medida de verdade (pedidos pequenos à internet, cronometrados) e só avisa quando a conexão está mesmo lenta; quando melhora, o aviso sai sozinho.' },
    ],
  },
  {
    versao: 587, data: '2026-11-07', titulo: 'Os avisos da conexão em branco e os downloads sempre com o vídeo',
    itens: [
      { tipo: 'correcao', texto: 'No app de Android, a tela Ajustes → Avançado mostrava um pedaço de cartão vazio em cima do "Apagar tudo". Saiu.' },
      { tipo: 'melhoria', texto: 'Em Ajustes → Downloads, saiu a escolha "O que baixar": as músicas são baixadas sempre com o áudio e o clipe. Quem tinha escolhido "Só o áudio" recebe sozinho, em segundo plano, o clipe das músicas já baixadas.' },
      { tipo: 'melhoria', texto: 'Os avisos "Conexão lenta" e "Conectado novamente", embaixo do menu, aparecem em branco, como o "Você está offline" (antes eram laranja e verde).' },
    ],
  },
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
