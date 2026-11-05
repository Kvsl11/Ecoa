import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// O app e o servidor precisam concordar que um pedido de vídeo termina em um arquivo realmente de vídeo.
test('download de vídeo: o app pede vídeo e o servidor valida o arquivo final', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const api = await readFile(new URL('../servidor-ia/app.py', import.meta.url), 'utf8');
  const youtube = await readFile(new URL('../servidor-ia/youtube.py', import.meta.url), 'utf8');
  assert.match(app, /json: \{ url: `https:\/\/youtu\.be\/\$\{yt\}`, video, qualidade:/);
  assert.match(api, /video: bool = False/);
  assert.match(api, /midia="video" if pedido\.video else "audio"/);
  assert.match(youtube, /info\.get\("filepath"\)/);
  assert.match(youtube, /if com_video and not tipo\.startswith\("video\/"\)/);
  assert.match(youtube, /nunca um fragmento \.f137\.mp4/);
});

test('download: o som e o vídeo, um depois do outro, e o progresso inclui a transferência ao celular', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const youtube = await readFile(new URL('../servidor-ia/youtube.py', import.meta.url), 'utf8');
  // (um arquivo por vez: o som e depois o vídeo; e uma música por vez na fila)
  assert.match(app, /for \(const a of \[\.\.\.lista\]\.sort\(\(x, y\) => Number\(x\.video\) - Number\(y\.video\)\)\)/);
  assert.match(app, /const DOWNLOADS_JUNTOS = 1;/);
  assert.match(app, /resp\.body\?\.getReader/);
  assert.ok(app.includes('texto: `Baixando ${pct}%${posicaoNoLote()}`'));
  assert.match(app, /void guardarImagensDaMusica\(song\)\.catch/);
  assert.match(youtube, /"concurrent_fragment_downloads": 4/);
  assert.match(youtube, /if not pede_login\(e\) or indice == 5/);
});

test('download de vídeo não é omitido quando a faixa de áudio é outra gravação', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const inicio = app.indexOf('function arquivosParaBaixar(song)');
  const fim = app.indexOf('// Se o áudio já baixou', inicio);
  const rotina = app.slice(inicio, fim);
  assert.match(rotina, /if \(song\.youtube && \(comVideo \|\| \(!audio && !song\.audioProprio\)\)\) lista\.push/);
  assert.doesNotMatch(rotina, /vs\?\.diferentes\) lista\.push/);
});

test('download de vídeo prioriza o arquivo final mesclado e ignora fragmentos', async () => {
  const youtube = await readFile(new URL('../servidor-ia/youtube.py', import.meta.url), 'utf8');
  assert.match(youtube, /info\.get\("requested_downloads"\)/);
  assert.match(youtube, /re\.search\(r"\\\.f\\d\+\\\."/);
  assert.match(youtube, /arquivos\.sort\(key=lambda f: \(bool\(re\.search/);
});

test('download: IDs válidos de vídeos do YouTube passam pela validação', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  assert.ok(app.includes("if (!/^[\\w-]{11}$/.test(yt || ''))"), 'a validação deve aceitar os 11 caracteres de um ID do YouTube');
  assert.ok(!app.includes("if (!/^[\\\\w-]{11}$/.test(yt || ''))"), 'não pode procurar uma barra invertida literal ou apenas a letra w');
});

test('download: o ícone entra em andamento imediatamente, antes da verificação do servidor', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const inicio = app.indexOf('async function baixarMusica(song');
  const fim = app.indexOf('async function baixarAgora(id', inicio);
  const rotina = app.slice(inicio, fim);
  assert.ok(rotina.indexOf('baixando.set(s.id, { pct: 0, preparando: true })') < rotina.indexOf('!servidorIA().url'));
  assert.ok(rotina.indexOf('baixando.set(s.id, { pct: 0, preparando: true })') < rotina.indexOf('avisarDownloads()'));
  assert.match(rotina, /texto: `Download iniciado · preparando áudio e videoclipe\$\{posicaoNoLote\(\)\}`/);
  assert.match(rotina, /Não deu para baixar/);
  assert.match(rotina, /finally[\s\S]*baixando\.delete\(id\)/);
});

test('download: redescobre o servidor antes de iniciar cada fila e usa recuperação de entrega', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const inicio = app.indexOf('async function baixarMusica(song');
  const fim = app.indexOf('async function baixarAgora(id', inicio);
  const rotina = app.slice(inicio, fim);
  assert.ok(rotina.indexOf('await carregarServidor()') < rotina.indexOf('!servidorIA().url'));
  // (o arquivo vem do mesmo servidor que baixou: com o Modal de reserva, o Codespace pode ligar no meio do download)
  const baixar = app.slice(app.indexOf('async function baixarAgora(id'), app.indexOf('// as capas e a partitura', app.indexOf('async function baixarAgora(id')));
  assert.match(baixar, /const cfg = servidorIA\(\);[\s\S]*?r = await tentarBaixar\(cfg, yt, video/);
  assert.match(baixar, /receberArquivo\(cfg, r\.arquivo/);
  const tentar = app.slice(app.indexOf('async function tentarBaixar('), app.indexOf('async function baixarAgora(id'));
  assert.match(tentar, /chamarComEtapas\(cfg, '\/baixar'/);
});

test('download: o videoclipe tenta de novo, descendo de qualidade, e o parcial se completa sozinho', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const tentar = app.slice(app.indexOf('async function tentarBaixar('), app.indexOf('async function baixarAgora(id'));
  // (3 tentativas: o vídeo na qualidade escolhida e depois nas mais baixas)
  assert.match(app, /QUALIDADES_ABAIXO = \{ 'muito-alta': \['alta', 'normal'\]/);
  assert.match(tentar, /video \? \[q, q, \.\.\.QUALIDADES_ABAIXO\[q\]\] : \[q, q, q\]/);
  // (pediu o clipe e veio só o som: tenta de novo)
  assert.match(tentar, /video && r\?\.tipo && !String\(r\.tipo\)\.startsWith\('video\/'\)/);
  // o download parcial volta para a fila sozinho, e ao abrir o app as baixadas pela metade também
  const baixar = app.slice(app.indexOf('async function baixarAgora(id'), app.indexOf('// O download que ficou parcial'));
  assert.match(baixar, /if \(\(falhas\.length \|\| precisaMelhorar\(db\.song\(id\)\)\) && !db\.song\(id\)\?\.baixarPausado\) completarDepois\(id\)/);
  assert.match(app, /s\.baixado && !s\.baixarPausado && \(precisaBaixar\(s\) \|\| precisaMelhorar\(s\)\) && midiaDe\(s\)/);
});
test('download em Áudio e vídeo preserva o clipe mesmo quando é outra gravação', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const inicio = app.indexOf('function arquivosParaBaixar(song)');
  const fim = app.indexOf('// Se o áudio já baixou', inicio);
  const rotina = app.slice(inicio, fim);
  assert.match(rotina, /if \(song\.youtube && \(comVideo \|\| \(!audio && !song\.audioProprio\)\)\) lista\.push/);
  const baixar = app.slice(app.indexOf('async function baixarAgora(id'), app.indexOf('// as capas e a partitura', app.indexOf('async function baixarAgora(id')));
  assert.doesNotMatch(baixar, /delete arquivos\[vsAqui\.video\]|apagarAudio\(chaveBaixada\(vsAqui\.video\)\)/);
  assert.match(baixar, /Download parcial/);
  assert.match(baixar, /faltou\.join\(' e '\)/);
});

test('YouTube: yt-dlp tem novas tentativas para falhas de rede e fragmentos', async () => {
  const youtube = await readFile(new URL('../servidor-ia/youtube.py', import.meta.url), 'utf8');
  assert.match(youtube, /"socket_timeout": 30/);
  assert.match(youtube, /"retries": 6/);
  assert.match(youtube, /"fragment_retries": 6/);
  assert.match(youtube, /"extractor_retries": 5/);
});

test('players de apoio do YouTube sem a conta (não contam como outro dispositivo)', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  assert.match(app, /const YT_SEM_CONTA = 'https:\/\/www\.youtube-nocookie\.com\/embed\/'/);
  // a outra versão que espera por baixo, a capa animada e a prévia
  assert.match(app, /f\.src = ytEmbed\(outra, \{ autoplay: false, semConta: true \}\)/);
  assert.match(app, /f\.src = `\$\{YT_SEM_CONTA\}\$\{encodeURIComponent\(id\)\}\?\$\{p\}`/);
  assert.match(app, /ytEmbed\(s\.youtube, \{ inicio: m\.tVideo, mudo: true, semConta: true \}\)/);
  // e só um endereço com a conta: o do player que se ouve
  assert.equal((app.match(/https:\/\/www\.youtube\.com\/embed\//g) || []).length, 1);
});

test('download: o áudio que é o próprio vídeo da música baixa uma vez só, como vídeo (o áudio não apaga o clipe)', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const rotina = app.slice(app.indexOf('function arquivosParaBaixar(song)'), app.indexOf('// Se o áudio já baixou'));
  assert.match(rotina, /audio && !\(audio === song\.youtube && comVideo\)/);
});

test('download: a entrega do servidor não trava (tempo sem dados, nova tentativa de onde parou) e o arquivo é conferido', async () => {
  const { receberArquivo } = await import('../public/js/lib/servidor-ia.js');
  const dados = new Uint8Array(30000).map((_, i) => i % 251);
  let pedidos = 0;
  // 1º pedido: manda metade e para (a conexão "trava"); 2º: o servidor continua do ponto (206)
  const fetchImpl = async (url, { headers, signal }) => {
    pedidos++;
    const de = Number(/bytes=(\d+)-/.exec(headers.Range || '')?.[1] || 0);
    const parte = pedidos === 1 ? dados.slice(0, 15000) : dados.slice(de);
    const body = new ReadableStream({
      start(c) {
        c.enqueue(parte);
        if (pedidos === 1) signal.addEventListener('abort', () => c.error(Object.assign(new Error('parou'), { name: 'AbortError' })));
        else c.close();
      },
    });
    return { ok: true, status: de ? 206 : 200, headers: new Map([['content-length', String(parte.length)]]), body };
  };
  const blob = await receberArquivo({ url: 'https://servidor.test' }, 'n1', { tamanho: 30000, tipo: 'video/mp4', inatividade: 50, fetchImpl, aguardar: async () => {} });
  assert.equal(pedidos, 2);
  assert.equal(blob.size, 30000);
  assert.deepEqual(new Uint8Array(await blob.arrayBuffer()), dados);
  // o servidor que não tem mais o arquivo: erro na hora (o app baixa do YouTube de novo)
  const sem = async () => ({ ok: false, status: 404, text: async () => '{"detail":"o arquivo não está mais no servidor"}', headers: new Map() });
  await assert.rejects(receberArquivo({ url: 'https://servidor.test' }, 'n2', { fetchImpl: sem, aguardar: async () => {} }), (e) => e.status === 404);
});

test('download da playlist: o toque no meio pausa onde está, e o pausado não volta sozinho', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const pausar = app.slice(app.indexOf('function pausarDownloads(songs)'), app.indexOf('// Em "Áudio e vídeo", a música tem que vir com o clipe'));
  assert.match(pausar, /baixarPausado: true/);
  assert.match(pausar, /filaBaixar\.splice\(i, 1\)/);
  assert.match(pausar, /controlesDeDownload\.get\(id\)\?\.abort\(\)/);
  // (o botão da playlist pausa quando há música baixando; tocar de novo tira a pausa e baixa só as que faltam)
  assert.match(app, /if \(ss\.some\(\(s\) => baixando\.has\(s\.id\)\)\) \{\n    pausarDownloads\(ss\);/);
  assert.match(app, /if \(s\.baixarPausado\) db\.updateSong\(s\.id, \{ baixarPausado: undefined \}\)/);
  // e nada retoma sozinho o que foi pausado
  assert.match(app, /s\.baixado && !s\.baixarPausado && \(precisaBaixar\(s\) \|\| precisaMelhorar\(s\)\)/);
  assert.match(app, /if \(s && precisaBaixar\(s\) && !s\.baixarPausado\)/);
});

test('download: a entrega pausada para na hora, sem tentar de novo', async () => {
  const { receberArquivo } = await import('../public/js/lib/servidor-ia.js');
  const ctrl = new AbortController();
  let pedidos = 0;
  const fetchImpl = async (url, { signal }) => {
    pedidos++;
    const body = new ReadableStream({ start(c) { c.enqueue(new Uint8Array(1000)); signal.addEventListener('abort', () => c.error(Object.assign(new Error('x'), { name: 'AbortError' }))); setTimeout(() => ctrl.abort(), 10); } });
    return { ok: true, status: 200, headers: new Map([['content-length', '50000']]), body };
  };
  await assert.rejects(receberArquivo({ url: 'https://servidor.test' }, 'n', { tamanho: 50000, sinal: ctrl.signal, fetchImpl, aguardar: async () => {} }), /Cancelado/);
  assert.equal(pedidos, 1);
});

test('download: uma notificação só para a fila toda (não uma por música ao entrar na fila)', async () => {
  const app = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const fila = app.slice(app.indexOf('async function baixarMusica(song'), app.indexOf('async function baixarDaFila('));
  assert.doesNotMatch(fila, /notificarSistema/);
  assert.doesNotMatch(app, /tag: `baixar-\$\{id\}`|tag: 'baixar-' \+/);
  assert.match(app, /const TAG_DOWNLOAD = 'baixar';/);
  assert.match(app, /titulo: 'Downloads concluídos'/);
});
