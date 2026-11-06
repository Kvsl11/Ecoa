// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 570, data: '2026-11-06', titulo: 'A barrinha colada no menu, como no Spotify',
    itens: [
      { tipo: 'melhoria', texto: 'No celular (no navegador e no app de Android), a barrinha da música agora fica colada no menu de baixo, sem a faixa entre os dois, e o menu ficou mais transparente: o que está na tela aparece por trás dele, escurecendo até o pé, como no Spotify. Os ícones e os nomes do menu ficaram um pouco maiores.' },
    ],
  },
  {
    versao: 569, data: '2026-11-06', titulo: 'O Conectar igual ao do Spotify',
    itens: [
      { tipo: 'melhoria', texto: 'A folha Conectar ficou como a do Spotify: em cima, o fone que está tocando, com a qualidade, "Este celular" e a música; embaixo, este celular, com o nome dele (no app de Android), e no pé os botões Transmitir na TV e Bluetooth, pequenos.' },
      { tipo: 'melhoria', texto: 'No app de Android, saiu o "Mudar o nome deste fone": o app já usa o nome que o Android dá a ele (o mesmo das configurações do Bluetooth). E o botão Bluetooth abre direto as configurações de Bluetooth do celular (precisa da atualização do app).' },
      { tipo: 'melhoria', texto: 'O fone que está tocando aparece um pouco maior embaixo do nome da música, na barrinha de cima do Tocando agora e na de baixo.' },
    ],
  },
  {
    versao: 568, data: '2026-11-06', titulo: 'O APK diz em qual fone está tocando, e todas as janelas sobem do rodapé',
    itens: [
      { tipo: 'correcao', texto: 'No app de Android, quando um fone era conectado (Bluetooth, com fio ou USB), o app não percebia e não mostrava o nome dele. Agora é o próprio Android que informa por onde o som sai e o nome do fone ou da caixa (o mesmo das configurações do Bluetooth, como "JBL Tour Pro 3"), sem pedir o microfone. O app também avisa assim que o fone conecta ou desconecta (precisa da atualização do app: Ajustes → Sobre → Atualização do app).' },
      { tipo: 'melhoria', texto: 'No app de Android, a folha Conectar mostra o nome deste celular (o que aparece em Configurações → Sobre o telefone, ou o modelo) no lugar de "Este celular".' },
      { tipo: 'melhoria', texto: 'No player do Android (nas notificações e na tela de bloqueio) e nos avisos dos downloads, o ícone pequeno ao lado da capa agora é a logo do Ecoa, e não uma nota musical (precisa da atualização do app).' },
      { tipo: 'melhoria', texto: 'Todas as janelas agora sobem do rodapé com a alcinha em cima, iguais no app de Android e no navegador: as perguntas de confirmar ("Novo repertório", apagar…), as de configurar (PDF, PowerPoint, tom, diagnóstico), as listas de escolha (o ⋯ do Tocando agora, o tom da partitura, escolher uma música) e, no celular, o menu ⋯ da música e o calendário. Puxando a alça para cima, a janela cresce; para baixo, fecha.' },
    ],
  },
  {
    versao: 567, data: '2026-11-06', titulo: 'O topo do app de Android no lugar',
    itens: [
      { tipo: 'correcao', texto: 'No app de Android, agora de ponta a ponta, a foto do perfil e os botões do topo ficavam por cima dos filtros, dos títulos e dos Ajustes: o topo descia a altura da barra de status, e o começo das páginas não. Agora as páginas também descem, e o fundo de cada uma vai até atrás do relógio e da bateria.' },
      { tipo: 'melhoria', texto: 'No app de Android, os ícones do relógio e da bateria ficam escuros no tema claro e claros no escuro (precisa da atualização do app).' },
    ],
  },
  {
    versao: 566, data: '2026-11-06', titulo: 'O APK mostra a própria versão e aproveita a tela inteira',
    itens: [
      { tipo: 'melhoria', texto: 'No menu do perfil do APK, a versão agora é a do aplicativo Android instalado (APK), e não a versão do site. No navegador, a versão do site continua aparecendo normalmente.' },
      { tipo: 'melhoria', texto: 'No Android, o app passa a aproveitar a tela inteira: as áreas atrás do relógio e da navegação do sistema acompanham o fundo do Ecoa, mantendo os ícones do celular visíveis.' },
    ],
  },
  {
    versao: 565, data: '2026-11-06', titulo: 'O app de Android do tamanho certo, com o espaço do celular de verdade',
    itens: [
      { tipo: 'correcao', texto: 'Ao importar os downloads no app de Android, o karaokê podia não aparecer: ele ficava só na cópia da música que veio no arquivo, e não na música da biblioteca do app (com outro id, ou que tomava o lugar da cópia ao juntar com a conta). Agora o karaokê e o download vão para a música daqui que toca a mesma gravação, e o aviso no fim diz quantos karaokês vieram. Quem já importou: importe o mesmo arquivo de novo.' },
      { tipo: 'correcao', texto: 'Quando o navegador (ou o Android) não consegue separar os canais do áudio, o karaokê desligava sem dizer nada. Agora aparece o aviso.' },
      { tipo: 'correcao', texto: 'No app de Android, tudo ficava maior que no site (textos, ícones), com textos quebrados ou sobrepostos e telas espremidas: o app aumentava o texto pelo "Tamanho da fonte" do Android. Agora ele fica do tamanho do site no Chrome (precisa da atualização do app: Ajustes → Sobre → Atualização do app).' },
      { tipo: 'correcao', texto: 'No app de Android, o armazenamento não batia com o do celular: o total era só uma parte da memória. Agora os números são os mesmos das Configurações do Android (o total, o livre e o que o Ecoa ocupa).' },
      { tipo: 'correcao', texto: 'No player do Android (nas notificações e na tela de bloqueio), a barra ficava em 00:00 / 00:00 e não andava: a duração da música chega depois que ela começa, e o app só mandava no começo. Agora a duração e o ponto aparecem certos, e a barra anda.' },
      { tipo: 'correcao', texto: 'No app de Android, a música baixada pausava ao minimizar o app ou apagar a tela. Agora ela continua tocando (precisa da atualização do app). A que toca pelo YouTube pausa fora da tela: essa é uma regra do YouTube.' },
    ],
  },
  {
    versao: 564, data: '2026-11-06', titulo: 'A outra música começa do início',
    itens: [
      { tipo: 'correcao', texto: 'Trocar de música podia fazer a nova começar no ponto em que a de antes tinha parado (pausada em 2:10, a outra começava em 2:10), na música e no vídeo, no navegador e no app de Android. Agora a outra música sempre começa do início; só a última música, voltando ao abrir o app, continua de onde parou (agora também a baixada).' },
    ],
  },
  {
    versao: 563, data: '2026-11-06', titulo: 'O app de Android: baixa do site, sem a foto por cima e com o player do Android',
    itens: [
      { tipo: 'correcao', texto: 'No app de Android, a foto do perfil ficava por cima dos títulos e dos botões do topo (o app ia por baixo da barra de status do celular). Agora ele começa abaixo dela, como no navegador.' },
      { tipo: 'melhoria', texto: 'No app de Android, o aviso de "tocando" virou o player do próprio Android: com a capa, a barra do tempo (dá para arrastar), os botões, a tela de bloqueio e os botões do fone (precisa instalar o APK novo).' },
      { tipo: 'correcao', texto: 'O "Baixar o app para Android" ficava parado em "Baixando…" e o arquivo não aparecia nos downloads (o link levava ao GitHub, que redireciona para outro endereço). Agora o Ecoa.apk baixa direto do próprio site do Ecoa.' },
      { tipo: 'melhoria', texto: 'No app de Android, Ajustes → Downloads e economia de dados mostra o espaço de verdade do celular: o total, o livre, o que os outros apps e o sistema ocupam e tudo o que o Ecoa guarda (precisa instalar o APK novo). Os downloads do app ficam no próprio app, separados dos do navegador: a música baixada no navegador precisa ser baixada de novo no app.' },
      { tipo: 'correcao', texto: 'No app de Android, as notificações dos downloads não apareciam. Agora são as do próprio Android (com a capa; tocar abre a música), e o Android pergunta pelas notificações ao abrir o app e pelo microfone na primeira vez que ele é usado (precisa instalar o APK novo).' },
      { tipo: 'melhoria', texto: 'No app de Android, saíram o "Instalar o app" (em Sobre) e a tela Permissões dos Ajustes: as permissões são as do Android (Configurações → Apps → Ecoa). No navegador, tudo continua como estava.' },
      { tipo: 'novo', texto: 'Levar os downloads para o app de Android sem baixar de novo: no navegador, Ajustes → Downloads e economia de dados → Exportar os downloads (um arquivo com o áudio, o vídeo e o karaokê baixados); no app, Importar os downloads e escolher esse arquivo. Vale também entre dois aparelhos.' },
      { tipo: 'novo', texto: 'O app de Android se atualiza sozinho: ao abrir, ele avisa quando chega uma versão nova, e em Ajustes → Sobre → Atualização do app dá para verificar e atualizar. Ele baixa e o Android pergunta se pode instalar (na primeira vez, pede para permitir que o Ecoa instale a atualização). Este APK novo ainda precisa ser instalado pelo navegador; os próximos, não.' },
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
