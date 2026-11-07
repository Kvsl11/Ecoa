// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 594, data: '2026-11-07', titulo: 'As fotos dos artistas que não carregavam',
    itens: [
      { tipo: 'correcao', texto: 'Na biblioteca, alguns artistas ficavam sem foto (só com o desenho) porque o site da foto recusava mostrá-la dentro do app, e a procura de novo trazia a mesma foto. Agora a foto é pedida sem dizer de qual site vem o pedido e, se ainda assim não carregar, o app tenta as outras fontes (YouTube, Cifra Club, Deezer e Wikipédia), uma depois da outra, até achar uma que carregue.' },
      { tipo: 'correcao', texto: 'O artista sem foto mostra só o desenho do artista, sem a nota da música junto ou no lugar dele. Se ainda aparecer a nota e o microfone juntos, é a versão antiga: feche e abra o app para ele se atualizar.' },
    ],
  },
  {
    versao: 593, data: '2026-11-07', titulo: 'Downloads na qualidade de verdade, até 4K, e as fotos dos artistas',
    itens: [
      { tipo: 'correcao', texto: 'O vídeo baixado podia vir em 360p mesmo com a "Muito alta" escolhida: quando o YouTube não dava a imagem boa por um caminho, o app aceitava a de 360p calado. Agora ele tenta pelos outros caminhos do YouTube e fica com a maior imagem que o vídeo tem. Os vídeos já baixados em 360p são baixados de novo sozinhos. Vem com a atualização do app.' },
      { tipo: 'novo', texto: 'Em Ajustes → Qualidade de mídia, o vídeo vai agora até 4K: Normal (480p), Alta (720p), Muito alta (1080p), 2K (1440p) e 4K (2160p). No áudio, com os valores de verdade: Normal (AAC 48 kb/s), Alta (AAC 128 kb/s), Muito alta (Opus 160 kb/s, a melhor que o YouTube costuma ter) e Máxima (AAC 256 kb/s, quando o vídeo tem).' },
      { tipo: 'melhoria', texto: 'Trocar a qualidade baixa de novo, sozinho, as músicas já baixadas em outra (maior ou menor), sem precisar tocar em "Atualizar". Cada uma continua tocando sem internet até a nova chegar.' },
      { tipo: 'correcao', texto: 'Na biblioteca, o artista cuja foto não carregava ficava com a nota e o microfone um em cima do outro, ou com a nota no lugar da foto. Agora aparece só o desenho do artista, a foto quebrada é esquecida e outra é procurada.' },
      { tipo: 'melhoria', texto: 'As prévias das playlists começam com a imagem do vídeo em HD (antes era uma imagem pequena esticada na tela, borrada) e pedem o vídeo em HD ao YouTube.' },
    ],
  },
  {
    versao: 592, data: '2026-11-07', titulo: 'No app de Android, a partitura é sempre gerada pela IA',
    itens: [
      { tipo: 'melhoria', texto: 'No app de Android, gerar a partitura não pede mais para escolher um arquivo de áudio: a IA do próprio celular gera sempre com o áudio da música. Quando ela não consegue (a música sem vídeo, por exemplo), as opções são tentar de novo ou criar do zero, no editor. O "Abrir MusicXML" também saiu do começo do editor no app.' },
    ],
  },
  {
    versao: 591, data: '2026-11-07', titulo: 'A partitura e o karaokê feitos mais rápido, com a mesma qualidade',
    itens: [
      { tipo: 'melhoria', texto: 'A partitura gerada no aparelho sai bem mais rápido, com as mesmas notas: a IA passou a fazer as contas num motor muito mais rápido (no teste, 15 segundos de música em 2 segundos, contra 28 antes), solta a memória de cada trecho (o celular não vai mais ficando lento até o fim da música) e, nas músicas mais longas, não passa mais do limite da placa de vídeo.' },
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
