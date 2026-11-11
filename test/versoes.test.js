import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { escolherAudio, mesmaSincronia, paresDasSincronias, paresPelaDuracao, tempoNoAudio, tempoNoVideo } from '../public/js/lib/versoes.js';

const v = (id, titulo, canal, segundos) => ({ id, titulo, canal, segundos });

test('os menus de três pontos não oferecem alternar entre música e vídeo', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  assert.doesNotMatch(app, /valor: 'troca', rotulo: modoCapa\(\) \? 'Mudar para vídeo' : 'Mudar para música'/);
  assert.doesNotMatch(app, /valor: 'modo', rotulo: player\.modoMusica \? 'Mudar para vídeo' : 'Mudar para música'/);
});

test('acha o áudio oficial da gravação (e não o clipe, o ao vivo ou outra duração)', () => {
  const achados = [
    v('clipe000001', 'Sabrina Carpenter - Espresso (Official Video)', 'Sabrina Carpenter', 194),
    v('aovivo00001', 'Sabrina Carpenter - Espresso (Live)', 'Sabrina Carpenter', 175),
    v('fan00000001', 'Espresso - Sabrina Carpenter (lyrics)', 'Fã Clube', 178),
    v('topic000001', 'Espresso', 'Sabrina Carpenter', 175),
    v('outra000001', 'Cappuccino', 'Sabrina Carpenter', 175),
  ];
  const a = escolherAudio(achados, { titulo: 'Espresso', artista: 'Sabrina Carpenter', duracao: 175, evitar: 'clipe000001' });
  assert.equal(a.id, 'topic000001');
  // Mesmo título, artista e duração: a faixa type=music deve ganhar do stream que representa o clipe.
  const tipos = [
    { ...v('streamclip01', 'Espresso', 'Sabrina Carpenter - Topic', 175), tipo: 'stream' },
    { ...v('musictrack01', 'Espresso', 'Sabrina Carpenter', 175), tipo: 'music' },
  ];
  assert.equal(escolherAudio(tipos, { titulo: 'Espresso', artista: 'Sabrina Carpenter', duracao: 175 })?.id, 'musictrack01');
  assert.equal(escolherAudio(achados, { titulo: 'Espresso', artista: 'X', duracao: 300 }), null);
  assert.equal(escolherAudio(achados, { titulo: 'Espresso', duracao: 0 })?.id, 'topic000001');
  // Sem LRCLIB, o resultado type=music ainda deve ser encontrado pelo título e artista.
  const semLrc = [
    { ...v('8EJ3zbKTWQ8', 'Justin Bieber - Yummy (Official Video)', 'Justin Bieber', 230), tipo: 'stream' },
    { ...v('IBIxNypW6qM', 'Yummy', 'Justin Bieber', 210), tipo: 'music' },
  ];
  assert.equal(escolherAudio(semLrc, { titulo: 'Yummy', artista: 'Justin Bieber', duracao: 0 })?.id, 'IBIxNypW6qM');
  assert.equal(escolherAudio(semLrc, { titulo: 'Yummy', artista: 'Justin Bieber', duracao: 0, evitar: 'IBIxNypW6qM' }), null);
  // A diferença de alguns segundos entre LRCLIB e YouTube não deve impedir o áudio oficial.
  const thriller = [
    v('thrillerclip1', 'Michael Jackson - Thriller (Official Music Video)', 'Michael Jackson', 858),
    v('thrilleraudio', 'Michael Jackson - Thriller (Official Audio)', 'Michael Jackson - Topic', 363),
    v('thrillerlive1', 'Michael Jackson - Thriller (Live)', 'Michael Jackson', 360),
  ];
  assert.equal(escolherAudio(thriller, { titulo: 'Thriller', artista: 'Michael Jackson', duracao: 357, evitar: 'thrillerclip1' })?.id, 'thrilleraudio');
  // (o vídeo que um fã subiu no próprio canal, com o nome do artista só no título, não é o áudio oficial; o do canal do
  // clipe, o canal oficial do ministério, é)
  const odres = [v('JG6RmNXZv00', 'Odres Novos - Gerados Pela Imaculada', 'Raul Correia', 300)];
  assert.equal(escolherAudio(odres, { titulo: 'Odres Novos', artista: 'Gerados pela Imaculada', duracao: 0, evitar: 'Yquwfjrl-FE' }), null);
  const doCanal = [v('oficial0001', 'Odres Novos (Áudio Oficial)', 'Ministério Gerados pela Imaculada', 300)];
  assert.equal(escolherAudio(doCanal, { titulo: 'Odres Novos', artista: 'Gerados pela Imaculada', duracao: 0 })?.id, 'oficial0001');
});

test('o tempo passa do áudio para o clipe e volta, trecho por trecho (cena antes e no meio)', () => {
  // o clipe tem 10 s de cena antes da música e, depois do segundo 60 do áudio, mais 20 s de cena
  const pares = [[12, 22], [30, 40], [70, 100], [90, 120]];
  assert.equal(tempoNoVideo(pares, 5), 15);
  assert.equal(tempoNoVideo(pares, 45), 55);
  assert.equal(tempoNoVideo(pares, 80), 110);
  assert.equal(tempoNoAudio(pares, 110), 80);
  assert.equal(tempoNoAudio(pares, 3), 0); // na cena antes da música: o começo do áudio
  for (const t of [0, 13, 44, 71, 150]) assert.equal(tempoNoAudio(pares, tempoNoVideo(pares, t)), t);
});

test('os pares pelas duas sincronias, ou pela duração', () => {
  assert.deepEqual(paresDasSincronias([{ inicio: 1 }, { inicio: 5 }], [{ inicio: 11 }, { inicio: 15 }]), [[1, 11], [5, 15]]);
  assert.equal(paresDasSincronias([{ inicio: 1 }], [{ inicio: 1 }, { inicio: 2 }]), null);
  assert.deepEqual(paresPelaDuracao(194, 175), [[0, 19]]);
  assert.deepEqual(paresPelaDuracao(170, 175), [[0, 0]]);
});


test('a conversão fica parada durante uma cena curta detectada entre âncoras', () => {
  const pares = [[0, 3], [9.8, 12.8], [9.8, 17.8], [10, 18]];
  assert.ok(Math.abs(tempoNoAudio(pares, 15) - 9.8) < 0.01);
  assert.equal(tempoNoVideo(pares, 9.8), 17.8);
});

test('a conversão preserva cenas inseridas e corrige pequenas diferenças de relógio', () => {
  const pares = [[0, 10], [20, 30], [20, 38], [40, 58]];
  // Durante a cena extra, o vídeo avança, mas a música fica parada no segundo 20.
  assert.equal(tempoNoAudio(pares, 34), 20);
  assert.equal(tempoNoAudio(pares, 38), 20);
  // Ao sair da cena, o áudio volta a avançar; na ida, o segundo 20 aponta para o trecho depois da cena.
  assert.equal(tempoNoVideo(pares, 20), 38);
  assert.equal(tempoNoVideo(pares, 30), 48);
  // Pequena deriva entre as gravações é distribuída, em vez de acumular um salto no fim.
  assert.equal(tempoNoVideo([[0, 10], [100, 111]], 50), 60.5);
  // Uma edição grande continua sendo um corte, não uma interpolação que atravessa a cena.
  assert.equal(tempoNoVideo([[0, 10], [50, 60], [50, 90], [100, 140]], 49), 59);
  assert.equal(tempoNoVideo([[0, 10], [50, 60], [50, 90], [100, 140]], 50), 90);
});

test('só compartilha o mesmo vídeo entre Música e Vídeo quando a sincronia é idêntica', () => {
  assert.equal(mesmaSincronia([[0, 0], [10, 10.2], [40, 40.1]]), true);
  assert.equal(mesmaSincronia([[0, 18], [10, 28], [40, 58]]), false); // introdução
  assert.equal(mesmaSincronia([[0, 0], [10, 10], [40, 55]]), false); // corte no meio
  assert.equal(mesmaSincronia([]), false);
  assert.equal(mesmaSincronia(null), false);
});

test('a busca abre a música depois de localizar o videoclipe e esperar (com limite) áudio + LRCLIB', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const abrir = app.indexOf('async function abrirPrevia(');
  const buscarVideo = app.indexOf('const v = await noMaximo(busca, 4000, ATRASOU);', abrir);
  const metadados = app.indexOf('Object.assign(novo, {', buscarVideo);
  const preparar = app.indexOf('prepararMusicaAoAbrir(novo)', metadados);
  const esperar = app.indexOf('await Promise.all([noMaximo(preparo,', preparar);
  const entrar = app.indexOf("location.hash = '#/musica/previa'", esperar);
  assert.ok(abrir >= 0 && buscarVideo > abrir, 'aguarda a busca do videoclipe (com limite; o que chegar depois entra sozinho)');
  assert.ok(metadados > buscarVideo && preparar > metadados, 'preenche os metadados antes de preparar áudio e letra');
  assert.ok(esperar > preparar && entrar > esperar, 'espera a preparação (com limite) antes de navegar');
  const buscarCapa = app.indexOf('const buscaCapaDaPrevia =', metadados);
  const aplicarCapa = app.indexOf('const aplicarCapaDaPrevia =', buscarCapa);
  assert.ok(buscarCapa > metadados && aplicarCapa > buscarCapa && aplicarCapa < preparar,
    'a capa original deve começar a ser buscada em paralelo antes de aguardar áudio e LRCLIB');
  assert.match(app.slice(buscarCapa, preparar), /capaOficial\(novo\.title, novo\.artist\)/);
  assert.match(app.slice(buscarCapa, preparar), /novo\.content = definirMeta\(novo\.content, 'cover', url\)/);
  const cacheCapa = app.slice(app.indexOf('function capaOficial('), app.indexOf('async function fotoDeezer'));
  assert.match(cacheCapa, /if \(!url\) capasOficiais\.delete\(k\)/,
    'uma falha temporária não pode manter a busca de capa bloqueada para sempre');
  const funcao = app.indexOf('async function descobrirVersoes(song)');
  assert.ok(funcao > 0, 'a descoberta da faixa de áudio deve existir');
  const fim = app.indexOf('// as duas versões da música (o clipe e o áudio oficial)', funcao);
  assert.match(app.slice(funcao, fim), /procurarAudio\(song/);
  const prepararMusica = app.indexOf('function prepararMusicaAoAbrir(song)');
  const fimPreparar = app.indexOf('// o áudio oficial da gravação', prepararMusica);
  assert.ok(prepararMusica > 0 && fimPreparar > prepararMusica, 'a preparação da música deve existir');
  assert.doesNotMatch(app.slice(prepararMusica, fimPreparar), /Promise\.all\(\[audioPromise,\s*sincroniaPromise\]\)/,
    'a letra sincronizada não pode esperar a descoberta do áudio oficial (o Piped fora do ar segurava o LRCLIB por minutos)');
  assert.match(app.slice(prepararMusica, fimPreparar), /return sincroniaPromise\.then\(/);
});

test('um download parcial pode ser retomado e o áudio não precisa ser baixado novamente', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  assert.match(app, /function precisaBaixar\(song\)/);
  assert.match(app, /video && !String\(arquivo\.tipo \|\| ''\)\.toLowerCase\(\)\.startsWith\('video\/'\)/);
  assert.match(app, /if \(!s \|\| !\(precisaBaixar\(s\) \|\| \(qualidade && precisaMelhorar\(s, qualidade === 'todas'\)\)\) \|\| baixando\.has\(s\.id\)\) return/);
  assert.match(app, /const faltam = ss\.filter\(\(s\) => precisaBaixar\(s\)/);
});


test('o casamento sonoro recalibra mapas antigos e permite nova tentativa após falha temporária', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  assert.match(app, /const CASAMENTO = 3;/);
  assert.match(app, /function acertarVersoes\(song, _sincronia = null, \{ pedido = false \} = \{\}\)/);
  assert.match(app, /\(!pedido && casamentoFalhou\.has\(chave\)\)/);
  assert.match(app, /if \(pedido\) casamentoFalhou\.delete\(chave\)/);
  assert.match(app, /vsSalvasAoAbrir\.casamento \|\| 1\) < CASAMENTO/);
  assert.match(app, /vsSalvas\.casamento \|\| 1\) < CASAMENTO/);
});

test('a sincronia automática consulta somente o LRCLIB e nunca chama o servidor de IA', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const inicio = app.indexOf('async function sincronizarMusica(song');
  const fim = app.indexOf('function guardarSincronia(song, sinc)', inicio);
  assert.ok(inicio >= 0 && fim > inicio);
  const rotina = app.slice(inicio, fim);
  assert.match(rotina, /letraSincronizada\(/);
  assert.doesNotMatch(rotina, /servidorIA|chamarComEtapas|\/letra|notificar\(/);
  assert.match(app, /if \(midiaDe\(song\)\) sincronizarAoTocar\(\)/);
  assert.doesNotMatch(app, /id="btn-sincronizar"|valor: 'sincronizar'|sincronizarDoPlayer/);
});


test('abrir ou tocar música não procura o servidor de IA', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const inicio = app.indexOf('let SERVIDOR_IA');
  const fim = app.indexOf("const view = $('#view');", inicio);
  const inicializacao = app.slice(inicio, fim);
  assert.ok(inicializacao.includes('function carregarServidor('));
  assert.doesNotMatch(inicializacao, /carregarServidor\(\);/);
  assert.match(app, /await carregarServidor\(\)/);
});

test('avisos de sincronização não são exibidos, mas downloads notificam no celular', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const css = await readFile(new URL('../public/css/app.css', import.meta.url), 'utf8');
  const sw = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.match(app, /function toast\(\) \{\}/);
  assert.match(app, /async function notificarSistema\(/);
  assert.match(app, /Notification\.requestPermission/);
  assert.ok(app.includes('Baixando ${pct}%'));
  const inicioSync = app.indexOf('async function sincronizarMusica(song');
  const fimSync = app.indexOf('// o áudio oficial da gravação no YouTube:', inicioSync);
  assert.doesNotMatch(app.slice(inicioSync, fimSync), /notificarSistema|Notification/);
  assert.match(app, /Download concluído/);
  assert.match(app, /Não deu para baixar/);
  assert.doesNotMatch(app, /avisoRapido|aviso-rapido|notificarSistema\([^)]*(?:LRCLIB|sincroniza)/i);
  assert.doesNotMatch(css, /aviso-rapido/);
  assert.match(sw, /notificationclick/);
  assert.match(sw, /badge-96\.png/);
});

test('ao abrir uma música, o LRCLIB é consultado na hora, sem esperar o áudio oficial', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const abrir = app.indexOf('async function abrirPrevia(');
  const rota = app.indexOf("if (jaNaPrevia) route(); else location.hash = '#/musica/previa';", abrir);
  const preparo = app.indexOf('const preparo = prepararMusicaAoAbrir(novo)', abrir);
  assert.ok(preparo > abrir && preparo < rota, 'a tela só navega depois de iniciar o preparo da música');
  assert.match(app, /noMaximo\(preparo, 3500, 'demorou'\)/, 'espera pouco pela letra sincronizada: a música abre na hora e a letra entra depois');
  const helper = app.slice(app.indexOf('function prepararMusicaAoAbrir(song)'), app.indexOf('// o áudio oficial da gravação'));
  assert.match(helper, /descobrirVersoes\(song\)/);
  assert.match(helper, /sincronizarMusica\(song, \{ audioPromise \}\)/);
  assert.match(helper, /tentouSincronizar\.delete\(chave\)/);
  const rotinaSync = app.slice(app.indexOf('async function sincronizarMusica(song'), app.indexOf('// A preparação começa no clique/entrada da música'));
  // o LRCLIB vem primeiro: a descoberta do áudio oficial anda junto e só é esperada em segundo plano
  const principal = rotinaSync.slice(0, rotinaSync.indexOf('const melhorando'));
  assert.ok(principal.includes('letraSincronizadaJa(') && principal.indexOf('letraSincronizadaJa(') < (principal.indexOf('await descoberta') >>> 0), 'o LRCLIB não pode esperar a descoberta do áudio oficial');
  assert.match(rotinaSync, /const melhora = melhorarSincronia\(/);
});

test('cada prévia da busca tem seu próprio bloqueio de sincronização LRCLIB', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const inicio = app.indexOf('async function sincronizarMusica(song');
  const fim = app.indexOf('// A preparação começa no clique/entrada da música', inicio);
  const rotina = app.slice(inicio, fim);
  assert.match(rotina, /const chaveSincronizacao = previaOriginal \|\| song\.id/);
  assert.match(rotina, /sincronizando\.has\(chaveSincronizacao\)/);
  assert.match(rotina, /sincronizando\.delete\(chaveSincronizacao\)/);
});

test('a consulta LRCLIB é sequencial para evitar limite de requisições e tem tentativas configuráveis', async () => {
  const web = await readFile(new URL('../public/js/lib/web.js', import.meta.url), 'utf8');
  const inicio = web.indexOf('export async function letraSincronizada(');
  const fim = web.indexOf('// A gravação oficial entre as letras', inicio);
  const rotina = web.slice(inicio, fim);
  assert.ok(rotina.includes('for (let i = 0; i < consultas.length; i++)'));
  assert.ok(rotina.includes('setTimeout(ok, 350)'));
  assert.ok(!rotina.includes('Promise.all(consultas.map'));
  assert.match(rotina, /timeout = 10000/);
  assert.match(rotina, /tentativas = 4/);
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  assert.ok(app.includes('OPÇÕES_LRCLIB_RÁPIDAS = { espera: 1000, timeout: 10000, tentativas: 4 }'));
});

test('se o LRCLIB encontrar duração diferente, refaz a busca do áudio mesmo quando já existe uma versão associada', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const inicio = app.indexOf('async function sincronizarMusica(song');
  const fim = app.indexOf('// A preparação começa no clique/entrada da música', inicio);
  const rotina = app.slice(inicio, fim);
  // em segundo plano: o áudio da duração da letra, guardado como versão; a letra provisória passa para ele
  assert.ok(rotina.includes('procurarAudio(s, durLrc)'));
  assert.ok(rotina.includes('guardarVersoes(s, { video: s.youtube, audio: achado.id'));
  assert.ok(rotina.includes('provisoria: true'));
  assert.match(app, /s0\.provisoria && versoes\?\.audio/);
});

test('a busca abre a música mesmo quando a sincronização automática não encontra correspondência', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const abrir = app.indexOf('async function abrirPrevia(');
  const preparar = app.indexOf('const preparo = prepararMusicaAoAbrir(novo)', abrir);
  const navegar = app.indexOf("location.hash = '#/musica/previa'", preparar);
  assert.ok(preparar > abrir && navegar > preparar, 'a música abre depois da tentativa de preparação');
  assert.doesNotMatch(app.slice(preparar, navegar), /openDialog|Não foi possível sincronizar/);
  // sem letra sincronizada, a página mostra isso (e não pede de novo ao LRCLIB sem parar)
  assert.match(app, /Sem letra sincronizada para esta música/);
  assert.match(app, /if \(r === 'erro'\) setTimeout\(\(\) => \{ tentouSincronizar\.delete\(chaveSync\);/);
});

test('trocar música e trocar vídeo alteram versões independentes', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const audio = app.slice(app.indexOf('function trocarAudioDaMusica'), app.indexOf('function escolherVideo'));
  const video = app.slice(app.indexOf('function trocarVideoDaMusica'), app.indexOf('function trocarAudioDaMusica'));
  assert.match(audio, /audio:\s*novo/);
  assert.match(audio, /video:\s*s\.youtube/);
  assert.doesNotMatch(audio, /definirMeta\(.*youtube/);
  assert.match(video, /definirMeta\(s\.content, 'youtube', url\)/);
  assert.match(app, /const tipo = comCapa \? 'audio' : 'video'/);
  assert.match(app, /escolherVideo\(song, tipo\)/);
});


test('a letra sincronizada usa o identificador da faixa de áudio, não o do videoclipe', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  assert.match(app, /const videoDaLetra = \(song\) => versoesDe\(song\)\?\.audio \|\| song\?\.youtube/);
  assert.match(app, /song\.sincronia\.video === videoDaLetra\(song\) \? song\.sincronia : null/);
  assert.doesNotMatch(app, /song\.sincronia\.video === atual\?\.youtube/);
  assert.match(app, /atual\.sincronia\.video === videoDaLetra\(atual\)/);
});

test('a foto do artista acompanha o salvamento e é persistida para a biblioteca', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  assert.match(app, /data-foto-artista=/);
  assert.match(app, /fotoArtista: b\.dataset\.fotoArtista \|\| ''/);
  assert.match(app, /fotoArtista: item\.fotoArtista/);
  assert.match(app, /preview\.fotoArtista \? \{ fotoArtista: preview\.fotoArtista \}/);
  assert.match(app, /db\.updateSong\(item\.id, \{ fotoArtista: url \}\)/, 'a foto corrigida que chega depois também é persistida');
  // (a guardada aparece na lista, menos a imagem padrão de site, que não é foto: fotoReal)
  // (a linha passa a foto guardada, já filtrada, para miniDosArtistas, que desenha as fotinhas dos artistas)
  assert.match(app, /miniDosArtistas\(s\.title, s\.artist \|\| '', fotoReal\(s\.fotoArtista\), ehDaLiturgia\(s\)\)/);
  assert.match(app, /fotoPrincipal \? `<img src=/);
  const resolverFoto = app.slice(app.indexOf('function fotoDoArtista(nome'), app.indexOf('// A foto e a capa que já se conhece na hora'));
  assert.match(resolverFoto, /if \(!fotosArtistas\.has\(k\)\)/, 'existe uma única resolução por artista, não uma por música');
  assert.match(resolverFoto, /primeiraPorPreferencia\(\[\(\) => fotoDeezer\(nome, titulo\), \(\) => fotoDoCanalDeVerdade\(nome\), cifraClub\]/, 'as fontes vão ao mesmo tempo, na ordem de preferência (o Deezer primeiro)');
  assert.ok(resolverFoto.indexOf('fotoDeezer(nome, titulo)') < resolverFoto.indexOf('fotoDoCanalDeVerdade(nome)') && resolverFoto.indexOf('fotoDoCanalDeVerdade(nome)') < resolverFoto.indexOf('fotoWikipedia(nome)'), 'a ordem de preferência das fontes fica a mesma');
  assert.match(resolverFoto, /\{ folga: 0 \}/, 'a escolha segue a preferência à risca: a primeira a responder não ganha (a foto não fica trocando)');
  assert.match(resolverFoto, /fotoDoDeezer\(guardada\) && !fotoDoDeezer\(f\) \? guardada : f/, 'a foto do Deezer guardada não é trocada pela de outra fonte quando o Deezer não responde');
  assert.doesNotMatch(resolverFoto, /Promise\.any|cacheKey|fotoDeezer\(nome\)\s*,/, 'o APK não cria fotos diferentes por faixa');
  assert.match(app, /nativo\?\.buscarPagina/, 'as consultas JSONP usam a conexão nativa no APK');
  assert.match(app, /output=jsonp&callback=ecoaJsonp/, 'o Android recebe e interpreta a resposta JSONP diretamente');
  assert.match(app, /lerJsonpDaPagina\(r\.texto\)/, 'a resposta do Deezer é convertida em JSON antes de chegar à interface');
  assert.match(app, /if \(r\.error\.code !== 4 \|\| vez >= 3\) return null;/, 'o APK tenta de novo como o site quando o Deezer limita consultas (com uma só tentativa, outra fonte entrava)');
  assert.doesNotMatch(app, /noApk\(\) \? 700 : 1500|noApk\(\) \? 2200 : 4500/, 'a foto espera o mesmo tempo no APK e no site');
  assert.match(app, /enriquecerLinhasMusicais\(\$\('#mu-res'\), lista, \{ busca: true \}\)/, 'as fotos são carregadas depois que os resultados já aparecem');
  assert.match(app, /limitar\(buscarCifraClub\(termo\).*4500\)/, 'a busca não espera indefinidamente por uma fonte lenta');
  assert.match(app, /noMaximo\(pVideos, 2200, \[\]\)/, 'o YouTube não pode segurar a lista de músicas');
  assert.match(app, /fotosArtistas\.delete\(k\)/,'falhas vazias não podem ficar memorizadas durante a sessão');
  assert.match(app, /const exibida = box\.dataset\.mostrando/,'fotos já exibidas também precisam ser atualizadas');
});


test('a capa da busca é a mesma ao abrir a música, sem piscar outra antes', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  // (a linha da busca não mostra a miniatura do vídeo antes da capa oficial: só quando não há capa oficial)
  assert.match(app, /capa: r\.capa \|\| \(r\.semCapaOficial \? r\.video\?\.capa : ''\)/);
  assert.match(app, /if \(!url && busca && item\.video\?\.capa && !item\.capa\) \{ item\.semCapaOficial = true; url = item\.video\.capa; \}/);
  // (a capa vista na busca vai para a música aberta e não é escolhida de novo)
  assert.match(app, /capaDaBusca: capaAutomatica\(dados\.capa\) \? dados\.capa : ''/);
  assert.match(app, /const buscaCapaDaPrevia = capaDaBusca \? Promise\.resolve\(capaDaBusca\)/);
  assert.match(app, /aplicarCapaDaPrevia\(capaDaBusca \|\| capaConhecida\(novo\.title, novo\.artist\)\)/);
  // (a capa guardada que continua entre as achadas, da gravação certa, fica)
  const oficial = app.slice(app.indexOf('function capaOficial('), app.indexOf('// Confere a capa da música salva'));
  assert.match(oficial, /if \(mesma && !problemaDaCapa\(mesma, musica\)\) \{ marcarExplicita\(k, mesma\.explicita\); return conhecida; \}/);
  assert.ok(oficial.indexOf('return conhecida') < oficial.indexOf('maiorCapaDisponivel(l)'), 'a guardada é conferida antes de escolher entre as imagens que abrem');
});

test('app.js passa pela verificação real de sintaxe do Node', async () => {
  const { spawnSync } = await import('node:child_process');
  const arquivo = new URL('../public/js/app.js', import.meta.url);
  const r = spawnSync(process.execPath, ['--check', arquivo.pathname], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr || r.stdout || 'erro de sintaxe em app.js');
});

test('os pares pelas letras sincronizadas do áudio e do clipe (com cena antes e frases a mais)', async () => {
  const { paresPelasLetras } = await import('../public/js/lib/versoes.js');
  const linhas = ['Primeira frase', 'Segunda frase', 'O refrão aqui', 'Mais uma do refrão', 'Terceira estrofe', 'Fim da música'];
  const doAudio = { linhas, tempos: linhas.map((_, i) => ({ inicio: 10 + i * 10, fim: 18 + i * 10 })) };
  // o clipe: 15 s de cena antes, uma fala a mais no meio e, depois da 4ª frase, mais 8 s de cena
  const lv = ['Fala do clipe', ...linhas.slice(0, 4), 'Outra fala', ...linhas.slice(4)];
  const tv = [3, 25, 35, 45, 55, 60, 73, 83].map((x) => ({ inicio: x, fim: x + 8 }));
  const pares = paresPelasLetras(doAudio, { linhas: lv, tempos: tv });
  assert.deepEqual(pares, [[10, 25], [20, 35], [30, 45], [40, 55], [50, 73], [60, 83]]);
  assert.equal(tempoNoVideo(pares, 15), 30);
  assert.equal(tempoNoAudio(pares, 78), 55);
  assert.equal(paresPelasLetras(doAudio, { linhas: ['outra', 'letra', 'nada', 'igual'], tempos: tv.slice(0, 4) }), null);
});

test('versões: o servidor casa pelo som já ao abrir, e a troca é sempre na hora', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const casar = app.slice(app.indexOf('async function casarVersoesAgora('), app.indexOf('// as amostras (mono, na taxa do casamento)'));
  // sem as duas no aparelho, o servidor vem antes (não depende mais de trocar de versão)
  assert.ok(casar.indexOf('casarNoServidor(') >= 0 && !/pedido && !ehArquivo/.test(casar));
  assert.match(app, /if \(vs\?\.video && casandoVersoes\.has\(vs\.video\)\) return casandoPromessas\.get\(vs\.video\)/);
  // a troca não espera o casamento; chegando depois, acerta a partir do ponto de onde saiu
  assert.doesNotMatch(app, /Acertando a posição/);
  assert.match(app, /tempoNoVideo\(vs\.pares, ultimaTroca\.t \+ passou\)/);
  assert.match(app, /tempoNoAudio\(vs\.pares, ultimaTroca\.t \+ passou\)/);
  // a prévia espera pouco pelas versões (para ainda poder começar a tocar sozinha)
  assert.match(app, /noMaximo\(versoesProntas, 3500, null\)/);
});

test('os pares pelas legendas automáticas do clipe (Speed Demon: introdução longa e palavras erradas)', async () => {
  const { paresPelaLegenda } = await import('../public/js/lib/versoes.js');
  const { lerVtt } = await import('../public/js/lib/web.js');
  const linhas = ['Speed demon you got to pay your fine', 'All this way you got to hit the line', 'Gotta stop you now you run the light',
    'Speed demon you wanna win the race', 'Pull over boy and get what you deserve', 'Got a cop in back who wanna get your name'];
  const doAudio = { linhas, tempos: linhas.map((_, i) => ({ inicio: 20 + i * 8, fim: 27 + i * 8 })) };
  // o clipe: 6 min de cena antes da música; a legenda automática erra palavras e parte as linhas
  const vtt = `WEBVTT\n\n00:00:10.000 --> 00:00:14.000\n[Music]\n\n` + [
    ['06:20.500', 'speed demon you got to pay'], ['06:23.000', 'your fine'], ['06:28.400', 'all this way you gotta hit the line'],
    ['06:36.600', 'gotta stop you now you run the lights'], ['06:44.300', 'speed demon you want to win the race'],
    ['06:52.500', 'pull over boy and get what you deserve'], ['07:00.400', 'got a cop in back who want to get your name'],
  ].map(([t, x]) => `00:${t} --> 00:${t.replace(/\.\d+$/, '.999')}\n${x}`).join('\n\n');
  const cues = lerVtt(vtt);
  assert.equal(cues.length, 7);
  const pares = paresPelaLegenda(doAudio, cues);
  assert.ok(pares.length >= 5);
  // o deslocamento achado é o da cena antes da música (360 s), com erro de menos de 1 s
  for (const [a, v] of pares) assert.ok(Math.abs(v - a - 360.5) < 1, `${a} → ${v}`);
  assert.ok(Math.abs(tempoNoVideo(pares, 30) - 390.5) < 1);
});

test('trocar a música/o vídeo não salva a prévia sozinho e refaz a sincronia para a versão nova', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const trocar = app.slice(app.indexOf("if (b.dataset.pl === 'trocar') {"), app.indexOf("if (b.dataset.pl === 'ampliar')"));
  assert.doesNotMatch(trocar, /salvarDaPrevia\(\)/, 'o "Trocar música" não pode salvar a música na biblioteca');
  assert.match(trocar, /trocarNaPrevia\(tipo, url\)/);
  for (const f of ['function trocarAudioDaMusica(', 'function trocarVideoDaMusica(', 'function trocarNaPrevia(']) {
    const corpo = app.slice(app.indexOf(f), app.indexOf('\n}\n', app.indexOf(f)));
    assert.match(corpo, /reatarSincronia\(/, f);
  }
  // salvar a música da busca usa a prévia que está aberta (com a letra), sem trazer de novo
  const salvar = app.slice(app.indexOf('async function salvarDaInternet('), app.indexOf('async function addToSetDialog('));
  assert.ok(salvar.indexOf('preview.source === fonteItem') < salvar.indexOf('await trazerMusica('));
  assert.match(app, /catch \{ return Infinity; \}/, 'um erro ao ler a cifra não pode fazer a letra dela ser trocada');
});

// Speed Demon (clipe longo, com cenas e o refrão repetido): um trecho do áudio casado com a outra vez do refrão no clipe
// fazia a troca entre a música e o vídeo cair no lugar errado só ali. O pico (o deslocamento que muda e volta) sai; a
// cena (o deslocamento que muda e fica) continua valendo
test('pares: o trecho casado no lugar errado sai, a cena inserida fica', async () => {
  const { semPicos, tempoNoVideo, tempoNoAudio } = await import('../public/js/lib/versoes.js');
  const pares = [];
  for (let t = 0; t <= 200; t += 5) {
    let v = t + 20 + (t >= 100 ? 30 : 0);
    if (t >= 60 && t <= 70) v += 120; // (o refrão achado 2 min adiante)
    pares.push([t, v]);
    if (t === 100) pares.push([100, 120]); // (o começo da cena de 30 s)
  }
  const ficam = semPicos(pares);
  assert.ok(!ficam.some(([a]) => a >= 60 && a <= 70));
  assert.ok(ficam.some(([a, v]) => a === 100 && v === 120) && ficam.some(([a, v]) => a === 100 && v === 150));
  assert.equal(tempoNoVideo(pares, 65), 85);
  assert.equal(tempoNoVideo(pares, 150), 200);
  assert.equal(tempoNoAudio(pares, 85), 65);
  // (sem picos, nada muda)
  const limpos = [[0, 10], [50, 60], [100, 140], [150, 190]];
  assert.deepEqual(semPicos(limpos), limpos);
});

test('o vídeo que é só o áudio e o clipe oficial da música', async () => {
  const { pareceSoAudio, escolherClipe } = await import('../public/js/lib/versoes.js');
  assert.equal(pareceSoAudio({ titulo: 'Levitating', canal: 'Dua Lipa - Topic' }), true);
  assert.equal(pareceSoAudio({ titulo: 'Dua Lipa - Levitating (Official Audio)', canal: 'Dua Lipa' }), true);
  assert.equal(pareceSoAudio({ titulo: 'Dua Lipa - Levitating (Lyrics)', canal: 'Letras' }), true);
  assert.equal(pareceSoAudio({ titulo: 'Dua Lipa - Levitating Featuring DaBaby (Official Music Video)', canal: 'Dua Lipa' }), false);
  const videos = [
    { id: 'aud', titulo: 'Dua Lipa - Levitating (Official Audio)', canal: 'Dua Lipa', segundos: 203 },
    { id: 'let', titulo: 'Dua Lipa - Levitating (Lyrics)', canal: '7clouds', segundos: 203 },
    { id: 'viv', titulo: 'Dua Lipa - Levitating (Live at the BRITs)', canal: 'BRIT Awards', segundos: 240 },
    { id: 'TUVcZfQe-Kw', titulo: 'Dua Lipa - Levitating Featuring DaBaby (Official Music Video)', canal: 'Dua Lipa', segundos: 230 },
    { id: 'kar', titulo: 'Levitating - Dua Lipa (Karaoke Version)', canal: 'Sing King', segundos: 203 },
  ];
  assert.equal(escolherClipe(videos, { titulo: 'Levitating', artista: 'Dua Lipa', evitar: 'aud' })?.id, 'TUVcZfQe-Kw');
  assert.equal(escolherClipe(videos.filter((v) => v.id !== 'TUVcZfQe-Kw'), { titulo: 'Levitating', artista: 'Dua Lipa' }), null);
  // (o canal do artista vale mais que o "Official Music Video" de uma cópia; os bastidores e o ao vivo ficam de fora)
  const espresso = [
    { id: 'eVli-tstM5E', titulo: 'Sabrina Carpenter - Espresso', canal: 'Sabrina Carpenter', segundos: 201 },
    { id: 'copia', titulo: 'Sabrina Carpenter - Espresso (Official Music Video)', canal: 'BeatStream', segundos: 271 },
    { id: 'viv', titulo: 'Sabrina Carpenter - Espresso - Live at Coachella 2026', canal: 'Sabrina Carpenter', segundos: 182 },
    { id: 'bts', titulo: 'Sabrina Carpenter - Espresso (Behind the Scenes)', canal: 'Sabrina Carpenter', segundos: 207 },
  ];
  assert.equal(escolherClipe(espresso, { titulo: 'Espresso', artista: 'Sabrina Carpenter' })?.id, 'eVli-tstM5E');
  const baby = [
    { id: 'fa', titulo: 'Justin Bieber "Baby" OFFICIAL HD MUSIC VIDEO', canal: 'JustinBiberFeverVEVO', segundos: 224 },
    { id: 'kffacxfA7G4', titulo: 'Justin Bieber - Baby ft. Ludacris', canal: 'Justin Bieber', segundos: 220 },
    { id: 'ia', titulo: 'Justin Bieber - Baby ft. Ludacris (4K 60FPS) (Official Video)', canal: 'AIUpscalia', segundos: 218 },
  ];
  assert.equal(escolherClipe(baby, { titulo: 'Baby', artista: 'Justin Bieber' })?.id, 'kffacxfA7G4');
});

test('o áudio oficial é da mesma música: o artista certo e o título exato (não outra com o título dentro)', () => {
  const v = (id, titulo, canal, segundos = 207, tipo) => ({ id, titulo, canal, segundos, ...(tipo ? { tipo } : {}) });
  const lista = [
    v('outroartist', 'Voa Beija-flor', 'Fulano de Tal', 207, 'music'),
    v('potpourri01', 'Jorge e Mateus - Voa Beija Flor Pot-Pourri', 'Jorge & Mateus Oficial', 210),
    v('certo000001', 'Voa Beija-flor', 'Jorge & Mateus', 207, 'music'),
  ];
  assert.equal(escolherAudio(lista, { titulo: 'Voa Beija-flor', artista: 'Jorge & Mateus', duracao: 207 })?.id, 'certo000001');
  assert.equal(escolherAudio(lista.slice(0, 2), { titulo: 'Voa Beija-flor', artista: 'Jorge & Mateus', duracao: 207 }), null);
  // "Beija-flor" (Jota.pê) não é "Voa Beija-flor", mesmo com o título dentro
  assert.equal(escolherAudio([v('voabeija001', 'Voa Beija-flor', 'Jota.pê', 207, 'music')], { titulo: 'Beija-flor', artista: 'Jota.pê', duracao: 207 }), null);
  // a dupla escrita de outro jeito no canal, o VEVO, o participante e o "Official Audio" continuam valendo
  assert.equal(escolherAudio([v('duplaee0001', 'Voa Beija-flor (Official Audio)', 'Jorge e Mateus', 207)], { titulo: 'Voa Beija-flor', artista: 'Jorge & Mateus', duracao: 207 })?.id, 'duplaee0001');
  assert.equal(escolherAudio([v('vevo0000001', 'Espresso (Audio)', 'SabrinaCarpenterVEVO', 175)], { titulo: 'Espresso', artista: 'Sabrina Carpenter', duracao: 175 })?.id, 'vevo0000001');
  assert.equal(escolherAudio([v('feat0000001', 'Bruno Mars - Die With A Smile ft. Lady Gaga (Official Audio)', 'Bruno Mars', 252)], { titulo: 'Die With A Smile', artista: 'Lady Gaga, Bruno Mars', duracao: 251 })?.id, 'feat0000001');
});

test('o clipe também é do artista certo e com o título exato', async () => {
  const { escolherClipe } = await import('../public/js/lib/versoes.js');
  const v = (id, titulo, canal, segundos = 230) => ({ id, titulo, canal, segundos });
  assert.equal(escolherClipe([v('outroclipe1', 'Voa Beija-flor (Official Video)', 'Banda Cover')], { titulo: 'Voa Beija-flor', artista: 'Jorge & Mateus' }), null);
  assert.equal(escolherClipe([v('clipecerto1', 'Jorge & Mateus - Voa Beija-flor (Clipe Oficial)', 'Jorge & Mateus')], { titulo: 'Voa Beija-flor', artista: 'Jorge & Mateus' })?.id, 'clipecerto1');
});

test('o vídeo que é só a capa parada: os três quadros iguais', async () => {
  const { quadrosParados } = await import('../public/js/lib/versoes.js');
  const quadro = (f) => Uint8ClampedArray.from({ length: 32 * 24 * 4 }, (_, i) => (i % 4 === 3 ? 255 : f(i)));
  const capa = quadro((i) => (i * 7) % 255);
  // (a compressão do JPEG muda um pouco cada quadro: continua parado)
  const capaJpeg = quadro((i) => ((i * 7) % 255) + ((i % 13) - 6) * 0.3);
  assert.equal(quadrosParados([capa, capaJpeg, capa]), true);
  const clipe = [quadro((i) => (i * 3) % 255), quadro((i) => (i * 11 + 40) % 255), quadro((i) => 255 - ((i * 5) % 255))];
  assert.equal(quadrosParados(clipe), false);
  assert.equal(quadrosParados([capa]), null);
});

test('o título exato aceita os outros artistas antes do traço', async () => {
  const { mesmoTitulo } = await import('../public/js/lib/versoes.js');
  assert.equal(mesmoTitulo({ titulo: 'Bruno Mars, Anderson .Paak, Silk Sonic - Leave the Door Open [Official Video]' }, 'Leave The Door Open', 'Bruno Mars'), true);
  assert.equal(mesmoTitulo({ titulo: 'Jorge e Mateus - Voa Beija Flor Pot-Pourri' }, 'Voa Beija-flor', 'Jorge & Mateus'), false);
  assert.equal(mesmoTitulo({ titulo: 'Fulano - Voa Beija-flor' }, 'Beija-flor', 'Fulano'), false);
});

test('no K-pop o clipe oficial sai no canal da empresa ("Official MV")', async () => {
  const { escolherClipe } = await import('../public/js/lib/versoes.js');
  const v = (id, titulo, canal, segundos = 215) => ({ id, titulo, canal, segundos });
  const lista = [
    v('lyric000001', "정국 (Jung Kook) 'Standing Next to You' Lyric Video", 'BANGTANTV'),
    v('coreo000001', "정국 (Jung Kook) 'Standing Next to You' Official MV (Choreography ver.)", 'HYBE LABELS'),
    v('clipe000001', "정국 (Jung Kook) 'Standing Next to You' Official MV", 'HYBE LABELS'),
  ];
  assert.equal(escolherClipe(lista, { titulo: 'Standing Next to You', artista: 'Jungkook' })?.id, 'clipe000001');
  assert.equal(escolherClipe([v('aespa000001', "aespa 에스파 'Supernova' MV", 'SMTOWN')], { titulo: 'Supernova', artista: 'aespa' })?.id, 'aespa000001');
  // (o "MV" de um canal de fã continua não valendo)
  assert.equal(escolherClipe([v('fa000000001', "aespa 'Supernova' MV", 'kpop fanmade edits')], { titulo: 'Supernova', artista: 'Fulano' }), null);
});

test('quando não há LRC, tenta alinhar a letra encontrada com Gemini no APK', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const inicio = app.indexOf('function sincronizarPeloGemini(song');
  const fim = app.indexOf('// Confere a letra em dúvida', inicio);
  assert.ok(inicio > 0 && fim > inicio);
  const rotina = app.slice(inicio, fim);
  assert.match(rotina, /corpoDaSincronia/);
  assert.match(rotina, /baixarNoAparelho\(baixador, video, false/);
  assert.match(rotina, /'gemini' : 'transcricao'/);
  // sem letra na cifra, a gravação é transcrita; os pedidos da revisão entram numa fila e a falha fica registrada
  assert.match(rotina, /corpoDaTranscricao\(audio\)/);
  assert.match(rotina, /filaDoGemini\.then\(protegida\)/);
  assert.match(rotina, /emWav: true/);
  assert.match(rotina, /falhasDoGemini\.set\(chave/);
  assert.match(rotina, /linhasCantadas\(inicial\.content/);
  assert.match(app, /if \(!ok\) void sincronizarPeloServidor\(song\)/);
});

test('diagnóstico: Consertar agora tenta sincronização Gemini quando não há LRC', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const inicio = app.indexOf('async function consertarMusica(id');
  const fim = app.indexOf('let revisaoRodando', inicio);
  assert.ok(inicio >= 0 && fim > inicio);
  const rotina = app.slice(inicio, fim);
  assert.match(rotina, /sincronizarPeloGemini\(s1, \{ prioridade: true \}\)/);
  assert.match(rotina, /motivoDoGemini\(s1\)/);
  assert.match(rotina, /Sincronizando a letra com Gemini no celular/);
  assert.match(rotina, /sincronizarPeloServidor\(s1\)/);
  assert.match(rotina, /!sincValida\(s1\)/);
});


test('cache da letra sincronizada separa a busca antecipada da edição com duração conhecida', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const inicio = app.indexOf('const letrasSincronizadas = new Map();');
  const fim = app.indexOf('// A edição do LRCLIB', inicio);
  assert.ok(inicio >= 0 && fim > inicio);
  const rotina = app.slice(inicio, fim);
  assert.match(rotina, /chaveDaLetraSinc = \(titulo, artista, duracao = 0\)/);
  assert.match(rotina, /Math\.round\(Number\(duracao\)\)/);
  assert.match(rotina, /chaveDaLetraSinc\(titulo, artista, duracao\)/);
});

test('a revisão reavalia sincronias automáticas sem apagar a atual e preserva as manuais', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const revisoesInicio = app.indexOf('const REVISOES = [');
  const revisoesFim = app.indexOf('];', revisoesInicio);
  const revisoes = app.slice(revisoesInicio, revisoesFim);
  assert.match(revisoes, /rev: 31, refazerLetra: true/);
  assert.match(revisoes, /rev: 32, letra: true/);
  const inicio = app.indexOf("if ((quer('letra') || quer('refazerLetra'))");
  const fim = app.indexOf('// a letra do LRCLIB de novo', inicio);
  assert.ok(inicio > 0 && fim > inicio);
  const rotina = app.slice(inicio, fim);
  assert.match(rotina, /!sincOkDe\(s\) \|\| quer\('refazerLetra'\)/);
  assert.match(rotina, /s\.sincronia\.fonte !== 'lrclib'/);
  assert.doesNotMatch(rotina, /sincronia: undefined/);
});

test('LRCLIB e NetEase têm prioridade antes do fallback Gemini', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const web = await readFile(new URL('../public/js/lib/web.js', import.meta.url), 'utf8');
  const busca = app.indexOf('const lrc = await letraSincronizadaJa(song.title, artista, durAudioSabida);');
  const gemini = app.indexOf('void sincronizarPeloGemini(song)', busca);
  assert.ok(busca > 0 && gemini > busca);
  const inicio = web.indexOf('export async function letraSincronizada(');
  const fim = web.indexOf('let lrclibForaAte = 0;', inicio);
  assert.ok(inicio > 0 && fim > inicio);
  const rotina = web.slice(inicio, fim);
  assert.ok(rotina.indexOf('if (reserva) return reserva;') > rotina.indexOf('const reserva = await pReserva;'));
  assert.ok(rotina.indexOf('if (reserva) return reserva;') < rotina.lastIndexOf('return null;'));
});
