// O que mudou em cada versão do app, em registro técnico e formal (a causa, o que foi alterado e o efeito, com os
// números medidos quando houver; impessoal, sem gíria). A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 618, data: '2026-11-10', titulo: 'Partitura: arquivo pronto quando existe, geração em uma passada com acompanhamento, tela reorganizada; ajustes preservados entre aberturas',
    itens: [
      { tipo: 'novo', texto: 'Antes de gerar a partitura pelo áudio, o aplicativo passou a procurar um arquivo MIDI da música no acervo aberto BitMidi (busca pelo título, sem conta). Os arquivos cujo nome contém o título inteiro são listados, com prioridade para os que também trazem o artista; o arquivo escolhido é convertido em partitura com duas pautas (Melodia e Acompanhamento), com o andamento, o compasso e a armadura do próprio arquivo, e exibido com o player antes de ser salvo. A conversão de cinco arquivos do acervo (1.894 a 7.672 notas) levou de 7 a 45 ms. O acervo é mantido por envios de usuários e cobre melhor o repertório internacional; os nomes dos arquivos nem sempre informam o artista, razão pela qual a escolha e a audição ficam a cargo de quem usa. Sem resultado, sem conexão ou sem resposta em 7 segundos, a geração pelo áudio segue como antes.' },
      { tipo: 'novo', texto: 'As telas "Gerar com IA" e "Criar a partitura" passaram a aceitar um arquivo MIDI (.mid, .midi, .kar) escolhido no aparelho, convertido da mesma forma.' },
      { tipo: 'melhoria', texto: 'A partitura gerada pelo áudio passou a sair, por padrão, no formato "Completa": a melodia na clave de sol e, na clave de fá, o acompanhamento escrito pelos acordes da música (baixo no tempo forte e acorde nos demais tempos, conforme o compasso; nos compassos 6/8, 9/8 e 12/8, em grupos de três colcheias). O padrão anterior era o coral a quatro vozes. As opções "Melodia" e "Coral" permanecem; a opção "Coral do áudio" foi retirada da tela. Sem acordes na cifra nem no áudio, a partitura sai apenas com a melodia.' },
      { tipo: 'melhoria', texto: 'Na geração no aparelho, a separação entre voz e instrumentos pelo estéreo exigia uma segunda execução do modelo de notas sobre a música inteira. A separação passou a ser feita pela medição da intensidade de cada nota nos canais central e lateral (algoritmo de Goertzel), com uma única execução do modelo. Em um áudio estéreo de 3 min 18 s, em navegador de computador, o tempo até a prévia caiu de 73 s para 40 s. O tempo em aparelhos Android não foi medido.' },
      { tipo: 'correcao', texto: 'Na estimativa do tom pelas notas, os tons de Ré sustenido, Sol sustenido e Lá sustenido maior resultavam em armadura inexistente (8 a 10 sustenidos) e o nome do tom era exibido vazio. Passaram a ser escritos como Mi bemol, Lá bemol e Si bemol maior.' },
      { tipo: 'correcao', texto: 'Os ajustes (qualidade de áudio e de vídeo, tema, tamanho da letra e os demais) eram gravados somente dentro do bloco único que guarda a biblioteca inteira. Quando esse bloco ultrapassa o limite do armazenamento local, a gravação é recusada e, na abertura seguinte do aplicativo (por exemplo, após uma atualização), valia o conteúdo da última gravação aceita, com os ajustes anteriores. Os ajustes passaram a ser gravados também em uma chave própria, que prevalece na abertura; quando o bloco da biblioteca não cabe, o aplicativo passa a abrir pela cópia mantida no IndexedDB, que antes era sobrescrita pelo bloco antigo. A falha foi reproduzida em teste com o armazenamento limitado; a ocorrência não foi confirmada em aparelho. Os ajustes voltam ao padrão apenas com a desinstalação ou com "Apagar tudo".' },
      { tipo: 'melhoria', texto: 'A tela da partitura da música foi reorganizada: cabeçalho com a capa, o título, o artista e o botão Editar; resumo com o tom (atualizado conforme a transposição), o andamento, o compasso e o número de pautas; uma única barra com a alternância Desenhada/Original, a transposição, o tamanho (em porcentagem) e a exclusão; e a partitura em uma folha própria, separada do fundo.' },
      { tipo: 'correcao', texto: 'A montagem do APK da versão 617 falhava na compilação: a leitura do ícone do aplicativo para o cartão de convite reserva usava uma chamada que exige o tratamento de uma exceção verificada (NameNotFoundException). A leitura passou a usar as informações do próprio aplicativo, sem essa exceção. Disponível mediante atualização do aplicativo.' },
      { tipo: 'melhoria', texto: 'Pendente: as alterações foram verificadas por testes automatizados e por execução em navegador (busca, conversão, geração pelo áudio com um arquivo sintético e reabertura com o armazenamento limitado); a validação em aparelho Android e com gravações reais ainda não foi realizada, e a montagem do APK será confirmada pela execução do workflow.' },
    ],
  },
  {
    versao: 617, data: '2026-11-10', titulo: 'Convite do Ecoa: cartão redesenhado com código QR e prévia antes do envio',
    itens: [
      { tipo: 'melhoria', texto: 'O cartão enviado por "Compartilhar o Ecoa" (menu de opções da conta) era desenhado pelo Android com um leiaute fixo e simples. O cartão passou a ser desenhado pela interface (1080 × 1350 pixels, proporção 4:5), com a marca, a frase do aplicativo, os recursos principais, o primeiro nome de quem convida e um código QR do endereço de download, que permite a instalação apontando a câmera de outro aparelho. A imagem passou a ser enviada em JPEG, com cerca de 150 kB. Disponível mediante atualização do aplicativo.' },
      { tipo: 'novo', texto: 'A opção "Compartilhar o Ecoa" passou a abrir uma folha com a prévia do cartão e as ações Compartilhar e Copiar o link, em vez de abrir diretamente a lista de aplicativos do sistema. No navegador, a imagem é enviada junto com o texto quando o sistema aceita arquivos no compartilhamento; onde não há compartilhamento do sistema, a folha oferece o download da imagem.' },
      { tipo: 'correcao', texto: 'As falhas no compartilhamento e na cópia do link passaram a ser informadas na própria folha; antes, a confirmação da cópia do link não era exibida. O arquivo da imagem passou a receber um nome por envio, para que um convite novo não substitua o arquivo que outro aplicativo ainda está lendo. Disponível mediante atualização do aplicativo.' },
    ],
  },
  {
    versao: 616, data: '2026-11-10', titulo: 'Cor da música: matiz predominante da capa e capa gerada no player',
    itens: [
      { tipo: 'correcao', texto: 'Nas músicas sem imagem de capa (por exemplo, as importadas), a lista exibia a capa gerada em degradê no matiz do título, mas a barra do player exibia um quadrado preto: a regra de estilo da capa na barra (fundo preto) tinha precedência sobre a da capa gerada. A capa sem imagem do player (barra e Tocando agora) passou a usar o mesmo degradê e o mesmo matiz da capa gerada da lista.' },
      { tipo: 'correcao', texto: 'A cor de fundo das músicas sem capa era calculada por uma função diferente da usada na capa gerada, o que resultava em matizes distintos entre a lista e o player. O matiz passou a ser o mesmo nos dois casos; a saturação e a luminosidade continuam variando por título.' },
      { tipo: 'correcao', texto: 'A cor da tela da música e do player era sorteada, por música, entre até 4 cores fortes da capa, com desvio adicional de até 14° no matiz; uma capa predominantemente azul com um detalhe vermelho podia resultar em fundo vermelho. A cor passou a ser sempre a mais forte da capa (a predominante entre os pixels vivos), sem desvio de matiz; apenas a saturação (até 6 pontos) e a luminosidade (até 4 pontos) variam entre músicas. A cor não é guardada nas músicas; portanto, nenhuma revisão das músicas salvas é necessária.' },
      { tipo: 'melhoria', texto: 'Pendente: as alterações foram verificadas por testes automatizados e por renderização em navegador; a validação em aparelho Android ainda não foi realizada.' },
    ],
  },
  {
    versao: 615, data: '2026-11-10', titulo: 'Sincronização de letras pelo Gemini no Android: fila, tolerância na resposta e causa da falha',
    itens: [
      { tipo: 'correcao', texto: 'A revisão das músicas salvas da versão 612 disparava, ao mesmo tempo, um download de áudio e um pedido ao Gemini para cada música sem letra sincronizada no LRCLIB e na NetEase. Os pedidos simultâneos esgotavam a cota por minuto do Google e a sincronização terminava sem resultado. Os pedidos em segundo plano passaram a ser atendidos um de cada vez; após uma resposta de cota esgotada (HTTP 429), ficam suspensos por 10 minutos. A música aberta na tela e o "Consertar agora" não aguardam a fila.' },
      { tipo: 'correcao', texto: 'A resposta do alinhamento era aceita somente quando o texto de cada linha voltava idêntico ao enviado; linhas devolvidas com a numeração da lista ou com pequena alteração eram descartadas e, abaixo de 35% de linhas reconhecidas, a sincronia inteira era rejeitada. O pedido passou a exigir o número de cada linha, e a leitura passou a reconhecer a linha pelo texto, pelo texto sem a numeração ou pelo número.' },
      { tipo: 'melhoria', texto: 'O áudio usado na sincronização passou a ser baixado na qualidade normal, o que reduz o tamanho do pedido. Quando o Google recusa o arquivo no formato original (HTTP 400), o pedido é repetido com o áudio convertido para WAV mono.' },
      { tipo: 'novo', texto: 'Quando a cifra encontrada não contém a letra (menos de 3 linhas cantadas), o aplicativo para Android passou a solicitar ao Gemini a transcrição da gravação, com o instante de cada linha, em vez de encerrar a tentativa.' },
      { tipo: 'melhoria', texto: 'A causa da falha da sincronização pelo Gemini (chave ausente, baixador indisponível, erro devolvido pelo Google, linhas não localizadas) deixou de ser descartada e passou a ser exibida no resultado do "Consertar agora". As músicas salvas que permaneceram sem letra sincronizada serão reavaliadas em segundo plano; sincronizações manuais permanecem preservadas.' },
      { tipo: 'melhoria', texto: 'Pendente: as alterações foram verificadas por testes automatizados; a validação com chamadas reais ao Gemini em aparelho ainda não foi realizada. A montagem do APK confirmou que a chave e a assinatura do aplicativo são aceitas pelo Google.' },
    ],
  },
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
