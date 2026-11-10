// O que mudou em cada versão do app, em registro técnico e formal (a causa, o que foi alterado e o efeito, com os
// números medidos quando houver; impessoal, sem gíria). A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 614, data: '2026-11-10', titulo: 'Remoção da repetição de trecho do player',
    itens: [
      { tipo: 'melhoria', texto: 'A função "Repetir um trecho", adicionada ao menu de opções do player na versão 613, foi removida a pedido. O menu, a barra de tempo e a transição entre músicas (crossfade e automix) voltaram ao comportamento da versão 612. A função não guardava dados nas músicas; portanto, nenhuma revisão das músicas salvas é necessária.' },
    ],
  },
  {
    versao: 613, data: '2026-11-10', titulo: 'Repetição de trecho no player para ensaio',
    itens: [
      { tipo: 'novo', texto: 'Foi adicionada ao menu de opções do player (⋯ do Tocando agora) a função "Repetir um trecho". Nas músicas com letra sincronizada, as partes da gravação (Verse, Chorus, Bridge e demais marcações da cifra) passam a ser listadas com o instante de início e de fim, calculados a partir da letra sincronizada, e a parte escolhida é reproduzida em repetição contínua até ser desligada. Numa gravação de 10 min 47 s usada na verificação, foram identificadas 8 partes.' },
      { tipo: 'novo', texto: 'Em qualquer música, o trecho a repetir também pode ser marcado manualmente: o início e o fim são definidos no ponto em que a reprodução se encontra, com duração mínima de 2 segundos. O trecho ativo é destacado na barra de tempo e indicado no menu.' },
      { tipo: 'melhoria', texto: 'Durante a repetição de um trecho, a transição entre músicas (crossfade e automix) e a passagem para a faixa seguinte ficam suspensas. A repetição não é guardada: é encerrada ao trocar de música, ao trocar entre o clipe e o áudio ou ao fechar o player.' },
      { tipo: 'melhoria', texto: 'Pendências do modo de ensaio, ainda não entregues: separação em quatro faixas (voz, bateria, baixo e demais instrumentos) com mixer, alteração de velocidade e de tom do áudio, metrônomo e contagem inicial. O retorno automático ao início do trecho foi validado por testes automatizados; a validação com reprodução real em aparelho permanece pendente.' },
    ],
  },
  {
    versao: 612, data: '2026-11-10', titulo: 'Sincronização de letras ajustada à duração da gravação',
    itens: [
      { tipo: 'correcao', texto: 'O cache das consultas de letras sincronizadas passou a distinguir buscas antecipadas sem duração das consultas realizadas após a identificação do áudio. Com isso, resultados do LRCLIB e da reserva NetEase deixam de ser reutilizados entre edições com durações diferentes, reduzindo deslocamentos de tempo causados por masters incompatíveis. As sincronias automáticas já salvas serão reavaliadas em segundo plano; sincronizações manuais permanecem preservadas. Quando LRCLIB e NetEase não fornecem uma letra sincronizada correspondente, o Gemini no Android continua como alternativa, seguido pelo servidor configurado.' },
    ],
  },
  {
    versao: 611, data: '2026-11-10', titulo: 'Integração Gemini padronizada e identidade da assistência simplificada',
    itens: [
      { tipo: 'melhoria', texto: 'O servidor passou a priorizar o Google Gemini quando a chave correspondente está configurada, inclusive quando há também uma chave do provedor alternativo. A seleção explícita de Claude continua disponível por configuração; na ausência da chave Gemini, mantém-se o provedor alternativo como reserva.' },
      { tipo: 'correcao', texto: 'A API de síntese de fala deixou de receber parâmetros de gênero ou personagem. A seleção da voz passou a ser interna ao serviço, com configuração única para a síntese Gemini e para a voz neural de reserva, evitando que a interface envie escolhas de persona.' },
      { tipo: 'melhoria', texto: 'A identidade visual da assistência foi simplificada com um símbolo inspirado no padrão visual do Gemini e ajustes de apresentação da conversa e do modo ao vivo. A conexão dos controles da interface à sessão nativa Gemini Live e a validação em aparelho permanecem etapas pendentes, não incluídas como recursos concluídos nesta versão.' },
      { tipo: 'melhoria', texto: 'As instruções da assistência passaram a exigir que propostas de repertório sejam apresentadas antes da gravação e que o salvamento só seja confirmado após uma ação explícita e o retorno de sucesso do aplicativo. A interface de confirmação visual ainda depende da implementação dos cartões de ação.' },
    ],
  },
  {
    versao: 610, data: '2026-11-08', titulo: 'Remoção definitiva do botão extra de geração musical',
    itens: [
      { tipo: 'correcao', texto: 'O botão separado de geração de letra e cifra foi removido da interface. A geração continua automática durante a importação da música, sem exigir um comando manual nem ocupar a área dos controles do player. O número do pacote offline foi atualizado para invalidar o cache antigo que ainda podia exibir a interface anterior.' },
    ],
  },
  {
    versao: 609, data: '2026-11-08', titulo: 'Geração de letra sincronizada e cifra para músicas importadas',
    itens: [
      { tipo: 'novo', texto: 'No aplicativo Android, foi adicionada uma ferramenta para selecionar um arquivo de áudio e gerar uma transcrição da letra com marcações de tempo pelo Gemini, além de estimativas locais de tom, andamento e acordes. O resultado pode ser conferido e exportado em LRC (letra sincronizada) e ChordPro (cifra). A transcrição requer internet; a análise musical é executada no aparelho. Nesta versão, os arquivos são exportados para revisão e importação manual, sem substituir automaticamente uma música já existente na biblioteca.' },
    ],
  },
  {
    versao: 608, data: '2026-11-08', titulo: 'Áudio importado com letra, sincronia, acordes e tom; capas e fotos estáveis no Android',
    itens: [
      { tipo: 'novo', texto: 'O áudio importado para a biblioteca passou a ser processado no aplicativo Android. A letra sincronizada continua sendo procurada primeiro no LRCLIB, com o título e o artista lidos do nome do arquivo ("Artista - Título"). Quando o LRCLIB não tem a letra, como nas músicas próprias e nas gravações de ensaio, a letra cantada é transcrita pelo Gemini do aplicativo, com o instante de cada linha, e o andamento, o tom e o acorde de cada batida são calculados no próprio aparelho. Com esses dados, o aplicativo monta a cifra com os acordes sobre a palavra cantada no instante da troca, a introdução, os trechos instrumentais e o final, e guarda a letra sincronizada; com ela, o karaokê feito no celular passa a funcionar para a música. A análise de um minuto de música levou cerca de 0,2 s em computador; em áudio sintético, o tom e a sequência de acordes foram reconhecidos sem erro. Sem internet, os acordes ficam prontos e a letra é transcrita na próxima oportunidade; a cifra editada pela pessoa e a sincronia feita à mão não são alteradas. As músicas importadas antes desta versão passam pelo mesmo processamento em segundo plano. Disponível mediante atualização do aplicativo.' },
      { tipo: 'novo', texto: 'A importação passou a aceitar também WMA, AIFF, AMR, APE, ALAC, AC3, MKA, WebM e CAF. No aplicativo Android, os formatos que o navegador interno não reproduz são convertidos para M4A (AAC, 192 kb/s) pelo ffmpeg do próprio aplicativo antes de serem guardados. Disponível mediante atualização do aplicativo.' },
      { tipo: 'correcao', texto: 'No aplicativo Android, a foto do artista variava entre aberturas: as fontes (canal do YouTube, Deezer e Cifra Club) eram consultadas juntas e prevalecia a que respondesse em até 1,2 s. No navegador, o canal do YouTube não responde e a foto do Deezer sempre prevalecia; no Android, que acessa o YouTube pela conexão do sistema, a foto alternava. Além disso, quando o Deezer limitava as consultas, o aplicativo tentava de novo apenas uma vez, e outra fonte substituía a foto guardada. A foto do Deezer passou a ser a principal em todas as telas, com as demais fontes apenas como reserva; a foto do Deezer já guardada não é substituída quando ele não responde; as novas tentativas e os tempos de espera passaram a ser os mesmos do site; e o artista passou a ser localizado pelo nome quando a faixa aberta não consta no Deezer, de modo que a foto não depende da música aberta primeiro. As fotos de outras fontes guardadas nas músicas da biblioteca são substituídas pela do Deezer em segundo plano.' },
      { tipo: 'correcao', texto: 'Na busca, a linha da música exibia a miniatura do vídeo até a capa oficial chegar e então a trocava, o que aparecia como uma capa sem relação piscando. Ao abrir a música, a capa era procurada novamente com o título e o artista da página da cifra, que podem ser escritos de forma diferente, e a música podia abrir com outra capa. A linha passou a exibir a capa oficial diretamente (a miniatura do vídeo só aparece quando não há capa oficial), a capa vista na busca passou a acompanhar a música aberta, e a capa já guardada passou a ser mantida enquanto continuar entre as capas corretas da gravação, sem depender de quais imagens carregam primeiro.' },
      { tipo: 'correcao', texto: 'No aplicativo Android, a tela Novidades e as demais correções podiam não chegar com o APK novo: a página é carregada dos arquivos do APK, mas o service worker continuava servindo o pacote guardado da versão anterior quando o número de versão do site não mudava, como ocorreu nos APKs 1.200 a 1.206. O service worker passou a ser registrado com o número do APK instalado, e cada APK novo substitui o pacote guardado pelo seu. Disponível mediante atualização do aplicativo.' },
    ],
  },
  {
    versao: 607, data: '2026-11-07', titulo: 'Tema automático passou a seguir o modo do aparelho no Android',
    itens: [
      { tipo: 'correcao', texto: 'No aplicativo Android, o tema "Automático" exibia o tema claro mesmo com o aparelho no modo escuro. O navegador interno do Android (WebView) informa à página o modo claro ou escuro a partir do tema declarado no aplicativo, e não a partir da configuração do aparelho; além disso, a tela não era recriada quando o modo do sistema mudava, de modo que a troca não era percebida. O aplicativo passou a informar à página o modo real do aparelho ao abrir, ao voltar do segundo plano e no momento em que o modo do sistema muda, e o último valor informado é usado desde o início da próxima abertura, sem alternância visível entre os temas. A escolha manual de Escuro ou Claro não foi alterada. Disponível mediante atualização do aplicativo.' },
    ],
  },
  {
    versao: 606, data: '2026-11-07', titulo: 'Ajustes reorganizados, com ícones revistos e sem opções repetidas',
    itens: [
      { tipo: 'melhoria', texto: 'Os tópicos dos Ajustes passaram a ter ícones correspondentes ao conteúdo: Avançado deixou de usar o ícone de banco de dados (semelhante a uma memória) e passou a usar uma chave de ferramenta; Backup, que usava a seta de envio, passou a usar uma caixa de arquivo; Permissões passou a usar um escudo; PowerPoint, um quadro de apresentação; e Música e cifra, uma nota musical no lugar do sinal "#".' },
      { tipo: 'melhoria', texto: 'As opções repetidas foram unificadas. A exportação e a importação dos downloads, que ficavam em Downloads, passaram para Backup, que agora reúne a cópia da biblioteca e a dos downloads, cada uma com a sua explicação. O tópico Qualidade de mídia, que repetia a linha "Qualidade dos downloads" da página de Downloads, foi retirado da lista; a opção continua dentro de Downloads e internet. Os três atalhos do alto dos Ajustes (Economia de dados, Sessão privada e Capa animada) foram removidos, pois repetiam opções das páginas.' },
      { tipo: 'melhoria', texto: 'Música e cifra passou a ser dividida em Cifra (destaque e diagrama dos acordes), Reprodução (transição entre as músicas e capa animada) e Privacidade (sessão privada). Downloads e economia de dados passou a se chamar Downloads e internet, com a economia de dados e o download com dados móveis na seção Internet; a descrição da economia de dados passou a dizer o que ela faz: desliga a capa animada, toca do aparelho as músicas baixadas, até no modo vídeo, e evita que a busca carregue as músicas antes do toque.' },
      { tipo: 'correcao', texto: 'A sessão privada não registrava as músicas tocadas, mas abrir a página de uma música ainda a colocava nos Recentes; isso foi corrigido. Como a sessão não dava nenhum sinal de estar ligada, passou a ser indicada em Recentes, nas Estatísticas e no menu do perfil, com um atalho para desligá-la, e a opção passou a explicar o seu efeito.' },
    ],
  },
  {
    versao: 605, data: '2026-11-07', titulo: 'Busca e ordenação de "Músicas curtidas" reformuladas',
    itens: [
      { tipo: 'melhoria', texto: 'Em "Músicas curtidas" (celular, tablet, web e aplicativo Android), a busca e o botão de ordem passaram a ficar acima do título, fora da área visível ao abrir a página; ambos aparecem ao puxar a página para baixo e desaparecem gradualmente ao rolar. O campo passou a se chamar "Buscar na playlist", com fundo translúcido sobre o degradê, e o botão de ordem passou a se chamar "Ordenar". Com poucas músicas, a página recebe a altura necessária para que a busca permaneça oculta ao abrir.' },
      { tipo: 'novo', texto: 'Tocar no campo de busca abre o modo de busca: a seta de voltar e o campo ficam fixos no topo, seguidos dos filtros e da lista filtrada; o título, os botões e "Adicionar a esta playlist" são ocultados até a saída pela seta, que também limpa o texto digitado.' },
      { tipo: 'novo', texto: '"Ordenar" passou a abrir a folha "Ordenar por", com as opções Título, Artista, Álbum e Adicionadas recentemente; a ordem em uso aparece em destaque, com o sinal de confirmação. Antes, o botão alternava apenas entre a ordem recente e a alfabética.' },
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
