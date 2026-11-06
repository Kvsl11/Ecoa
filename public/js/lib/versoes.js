// As duas versões de uma música, como no Spotify: no modo música toca o áudio oficial da gravação (o mesmo do LRCLIB,
// e a letra sincronizada acompanha certinho); no modo vídeo, o videoclipe (com as cenas, sem a letra). Trocar de uma
// para a outra continua no mesmo ponto da música: os pares [tempo no áudio, tempo no vídeo] dizem onde cada trecho
// cantado está em cada uma (o clipe tem cenas antes da música ou no meio dela, e o áudio não).

const normal = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Só é a mesma versão nos dois modos quando todos os trechos casam no mesmo instante.
// Se houver introdução, corte ou deslocamento, o áudio e o videoclipe continuam separados.
export function mesmaSincronia(pares, tolerancia = 0.8) {
  return Boolean(pares?.length) && pares.every(([audio, video]) =>
    Number.isFinite(audio) && Number.isFinite(video) && Math.abs(audio - video) <= tolerancia);
}
// outra gravação da mesma música (o tempo do LRCLIB não vale) ou outra edição dela
// (e a versão limpa, com os palavrões cortados: o modo música toca a gravação como ela é)
const OUTRA_GRAVACAO = /\b(live|ao vivo|en vivo|cover|karaoke|instrumental|remix|sped up|slowed|nightcore|acustic[oa]|acoustic|reverb|8d|playback|versao|version|edit|clean|censored|radio edit)\b/;
// sem a voz (o modo música é a gravação cantada, para a letra acompanhar): a base, o instrumental, o karaokê, os
// multitracks e as versões só num instrumento; no título ou no nome do canal
const SEM_VOZ = /\b(instrumentals?|instrumentais|karaoke|playback|pb|base|bases|backing( track)?|minus one|sem voz|no vocals?|without vocals?|off vocal|vocal removed|fundo musical|multitracks?|stems?|beat|type beat|piano|violao|guitarra|guitar|teclado|sax|saxofone|flauta|violino|cello|8 ?bit|music box|lofi|lo fi)\b/;
const CANAL_SEM_VOZ = /\b(karaoke|instrumentals?|backing|playback|minus one|sing king|bases?|multitracks?|piano|beats?|lofi)\b/;
// o próprio clipe (o modo música quer o áudio, não outro vídeo com cenas)
const CLIPE = /\b(official (music )?video|music video|official mv|m ?v|videoclipe|clipe oficial|clipe)\b/;

// ---- é a mesma música? (o áudio oficial e o clipe são procurados no YouTube pelo título e pelo artista, e a busca traz
// de tudo: a mesma música de outro artista, outra música com o título dentro — "Beija-flor" dentro de "Voa Beija-flor"
// —, o pot-pourri que passa por ela). Antes valia qualquer vídeo com o título no nome, e o artista quase não pesava:
// o modo música tocava outra música, com o clipe certo
const PALAVRAS_DO_NOME = new Set(['official', 'oficial', 'audio', 'video', 'videoclipe', 'clipe', 'clip', 'mv', 'lyric', 'lyrics', 'letra',
  'legendado', 'traducao', 'hd', 'hq', '4k', '1080p', '720p', 'visualizer', 'visualiser', 'remastered', 'remaster', 'remasterizado',
  'topic', 'music', 'musica', 'faixa', 'single', 'full', 'song', 'vevo', 'e', 'and', 'x', 'vs', 'com', 'with', 'part', 'feat', 'ft']);
const palavrasDe = (t) => normal(t).split(' ').filter(Boolean);
const juntas = (t) => normal(t).replace(/ /g, '');
// os nomes do artista que valem: o nome todo e cada um dos que ele junta ("Lady Gaga, Bruno Mars", "Jorge & Mateus")
const nomesDoArtista = (artista) => {
  const sem = String(artista || '').replace(/\s*(?:\(|\[)?\b(?:feat\.?|ft\.?|featuring|part\.?)\s+/i, ', ');
  return [sem, ...sem.split(/\s*(?:,|;|\/|&|\s(?:e|and|x)\s)\s*/i)].map((x) => palavrasDe(x).filter((p) => !['e', 'and', 'the', 'x'].includes(p))).filter((x) => x.length);
};
// o vídeo é do artista: o nome dele (ou de um dos artistas juntos) no canal ou no título
export function doMesmoArtista(v, artista) {
  const nomes = nomesDoArtista(artista);
  if (!nomes.length) return true;
  const onde = new Set(palavrasDe(`${v?.canal || ''} ${v?.titulo || ''}`));
  const ondeJunto = juntas(`${v?.canal || ''} ${v?.titulo || ''}`);
  return nomes.some((n) => n.every((p) => onde.has(p)) || (n.join('').length >= 5 && ondeJunto.includes(n.join(''))));
}
// O vídeo vem de uma fonte oficial da música: a faixa do YouTube Music, o canal do próprio artista (o nome dele no
// canal, "Artista - Topic", o VEVO dele), o mesmo canal do clipe da música (o canal oficial que a pessoa está vendo) ou
// o canal de uma gravadora. O vídeo que alguém subiu no próprio canal com o nome do artista só no título — o "Odres
// Novos - Gerados Pela Imaculada" de um fã — não é: podia ser outra gravação, cortada, com outro som. Sem o artista,
// não há como conferir, e vale
export function fonteOficial(v, artista = '', canalDoClipe = '') {
  if (!nomesDoArtista(artista).length) return true;
  if (v?.tipo === 'music') return true;
  if (!normal(v?.canal)) return false;
  if (canalDoClipe && normal(v.canal) === normal(canalDoClipe)) return true;
  return canalOficial(v.canal, artista);
}
// o título do vídeo é o da música: tirando o que vai entre parênteses, os participantes, o nome do artista e as palavras
// de sempre ("Official Audio", "Lyric Video", "Topic"), sobra só o título — nenhuma palavra a mais
export function mesmoTitulo(v, titulo, artista = '') {
  const t = palavrasDe(String(titulo || '').replace(/[([{][^)\]}]*[)\]}]/g, ' ').replace(/\s*(?:\(|\[)?\b(?:feat\.?|ft\.?|featuring|part\.?)\s.*$/i, ''));
  if (!t.length) return false;
  const doTitulo = new Set(t);
  const doArtista = new Set(nomesDoArtista(artista).flat());
  const sobra = (ps) => ps.filter((p) => !doTitulo.has(p) && !doArtista.has(p) && !PALAVRAS_DO_NOME.has(p) && !/^(19|20)\d\d$/.test(p));
  const semParenteses = String(v?.titulo || '').replace(/[([{][^)\]}]*[)\]}]/g, ' ');
  const nome = palavrasDe(semParenteses.replace(/\s(?:feat\.?|ft\.?|featuring|part\.?)\s.*$/i, ' '));
  if (!` ${nome.join(' ')} `.includes(` ${t.join(' ')} `)) return false;
  if (!sobra(nome).length) return true;
  // "Bruno Mars, Anderson .Paak, Silk Sonic - Leave the Door Open": dos lados do traço (ou da barra), um é o dos
  // artistas (todos, com quem participa) e o outro é o título; basta o do título ser exato
  const lados = semParenteses.split(/\s[-–—|]\s/).map((x) => palavrasDe(x.replace(/\s(?:feat\.?|ft\.?|featuring|part\.?)\s.*$/i, ' ')));
  return lados.length > 1 && lados.some((l) => ` ${l.join(' ')} `.includes(` ${t.join(' ')} `) && !sobra(l).length);
}

// Entre os vídeos achados no YouTube ({ id, titulo, canal, segundos }), o áudio oficial da gravação: o mesmo título,
// a duração aproximada da gravação do LRCLIB e, de preferência, do canal do artista
// YouTube Music são o áudio puro). null se nenhum servir
// canal: o canal do clipe da música (o oficial que a pessoa abriu): o áudio desse mesmo canal vale como oficial
export function escolherAudio(videos, { titulo = '', artista = '', duracao = 0, evitar = '', canal: canalDoClipe = '' } = {}) {
  const t = normal(titulo).replace(/\b(feat|ft)\b.*$/, '').trim();
  const a = normal(artista);
  if (!t) return null;
  let melhor = null;
  let nota = -Infinity;
  // Quando o LRCLIB devolve a duração do curta/clipe (ex.: Remember the Time, 9:15),
  // a faixa musical correta é descartada pelo filtro estrito. Nessa situação fazemos
  // uma segunda seleção por identidade/título, sem aceitar vídeos longos como áudio.
  const duracaoSuspeita = duracao >= 7 * 60;
  for (const v of videos || []) {
    // Para durações confiáveis, mantém a correspondência estreita com a gravação.
    const tolerancia = Math.max(8, duracao * 0.025);
    if (!v?.id || v.id === evitar || !(v.segundos > 0)) continue;
    const semDuracao = !(duracao > 0);
    // Sem LRCLIB, a faixa ainda pode ser identificada pelo título, artista e type=music.
    // Não aceitar clipes longos nem vídeos muito curtos como áudio musical.
    if (duracaoSuspeita ? (v.segundos < 120 || v.segundos > 7 * 60)
      : semDuracao ? (v.segundos < 120 || v.segundos > 8 * 60)
        : Math.abs(v.segundos - duracao) > Math.max(12, duracao * 0.04)) continue;
    const nome = normal(v.titulo);
    if (!` ${nome} `.includes(` ${t} `) || CLIPE.test(nome) || (OUTRA_GRAVACAO.test(nome) && !OUTRA_GRAVACAO.test(t))) continue;
    // (a mesma música: do artista certo e com o título exato, sem outra música ou pot-pourri em volta)
    if (!doMesmoArtista(v, artista) || !mesmoTitulo(v, titulo, artista)) continue;
    // (e de uma fonte oficial: não o vídeo que alguém subiu no próprio canal)
    if (!fonteOficial(v, artista, canalDoClipe)) continue;
    // (a instrumental tem a mesma duração da gravação: só o nome diz que ela não tem a voz)
    if (SEM_VOZ.test(nome) && !SEM_VOZ.test(t)) continue;
    const canal = normal(v.canal);
    if (CANAL_SEM_VOZ.test(canal) && !CANAL_SEM_VOZ.test(a)) continue;
    let n = 0;
    // O filtro music_songs do YouTube Music retorna type=music. Esse sinal é mais confiável
    // que o título: um stream pode ser o videoclipe mesmo quando o nome parece uma faixa.
    if (v.tipo === 'music') n += 12;
    if (a && (canal === a || canal.startsWith(`${a} `) || ` ${a} `.includes(` ${canal} `))) n += 3;
    if (/\b(audio|official audio|audio oficial)\b/.test(nome)) n += 3;
    if (/\b(lyrics?|letra|lyric video)\b/.test(nome)) n -= 2;
    // Sem duração confiável, favorece uma faixa normal (perto de 4 min), sem descartar
    // gravações legítimas mais curtas ou mais longas dentro da faixa permitida.
    n -= duracaoSuspeita || semDuracao ? Math.abs(v.segundos - 210) / 90 : Math.abs(v.segundos - duracao) / 2;
    if (n > nota) { nota = n; melhor = v; }
  }
  return melhor;
}

// os pares pelas duas sincronias da mesma letra (as linhas do áudio e as do vídeo, na mesma ordem)
export function paresDasSincronias(doAudio, doVideo) {
  if (!doAudio?.length || doAudio.length !== doVideo?.length) return null;
  const pares = doAudio.map((x, i) => [x.inicio, doVideo[i].inicio]).filter(([a, v]) => Number.isFinite(a) && Number.isFinite(v));
  return pares.length ? pares : null;
}

// sem saber onde a música está no clipe: a diferença de duração é a cena antes da música (como nos clipes com uma
// introdução de filme); com o clipe mais curto, o mesmo começo
export const paresPelaDuracao = (durVideo, durAudio) => [[0, durVideo > durAudio && durAudio > 0 ? Math.round((durVideo - durAudio) * 10) / 10 : 0]];

// Os pares de um trecho achado no lugar errado (o refrão que se repete casado com a outra vez dele no clipe, num clipe
// longo como Speed Demon): o deslocamento (clipe − áudio) muda de repente e depois volta ao de antes. Uma cena inserida
// ou um corte mudam o deslocamento e ele fica; esses pares ficam. Os que saem: os que se afastam mais de 1,5 s do
// deslocamento de antes e, até 60 s depois, voltam a ele. A troca ali caía no lugar errado (às vezes certa, às vezes não)
export function semPicos(pares) {
  const ord = (pares || []).filter((p) => Number.isFinite(p?.[0]) && Number.isFinite(p?.[1])).map((p) => [p[0], p[1]])
    .sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  if (ord.length < 3) return ord;
  const d = (p) => p[1] - p[0];
  const ficam = [ord[0]];
  for (let i = 1; i < ord.length;) {
    const base = d(ficam[ficam.length - 1]);
    if (Math.abs(d(ord[i]) - base) <= 1.5) { ficam.push(ord[i]); i++; continue; }
    let j = i;
    while (j < ord.length && Math.abs(d(ord[j]) - base) > 1.5 && ord[j][0] - ord[i][0] <= 60) j++;
    // (voltou ao deslocamento de antes: o trecho do meio estava no lugar errado)
    if (j < ord.length && Math.abs(d(ord[j]) - base) <= 1.5 && ord[j][0] - ord[i][0] <= 60 && ord[j][0] > ord[i][0]) { i = j; continue; }
    ficam.push(ord[i]);
    i++;
  }
  return ficam;
}

// o tempo no outro lado: cada trecho anda junto com o par de antes (uma cena no meio do clipe muda o deslocamento dali
// em diante; antes do primeiro par, vale o deslocamento dele)
function converter(pares, t, de, para) {
  if (!pares?.length) return Math.max(0, t);
  const ordem = semPicos(pares)
    .filter((p) => Number.isFinite(p?.[de]) && Number.isFinite(p?.[para]))
    .map((p) => [p[0], p[1]])
    .sort((x, y) => x[de] - y[de] || x[para] - y[para]);
  if (!ordem.length) return Math.max(0, t);
  const primeiro = ordem[0];
  if (t < primeiro[de]) return Math.max(0, t + primeiro[para] - primeiro[de]);
  let i = 0;
  // Em âncoras com o mesmo instante de origem, a última é o ponto depois da cena/corte.
  while (i + 1 < ordem.length && ordem[i + 1][de] <= t + 0.01) i++;
  const p = ordem[i];
  const q = ordem[i + 1];
  if (!q || q[de] <= p[de] + 0.01) return Math.max(0, t + p[para] - p[de]);
  // Cena inserida no vídeo: o vídeo avança, mas o áudio fica parado no mesmo instante.
  if (Math.abs(q[para] - p[para]) <= 0.05) return Math.max(0, p[para]);
  const deslocamentoP = p[para] - p[de];
  const deslocamentoQ = q[para] - q[de];
  // Pequenas diferenças de relógio/velocidade são corrigidas gradualmente entre âncoras.
  if (Math.abs(deslocamentoQ - deslocamentoP) <= 2) {
    const fracao = (t - p[de]) / (q[de] - p[de]);
    return Math.max(0, p[para] + fracao * (q[para] - p[para]));
  }
  // Corte ou cena: não inventa uma transição gradual pelo trecho que não corresponde à música.
  return Math.max(0, t + deslocamentoP);
}
export const tempoNoVideo = (pares, tAudio) => converter(pares, tAudio, 0, 1);
export const tempoNoAudio = (pares, tVideo) => converter(pares, tVideo, 1, 0);

// Os pares pelas letras sincronizadas das duas versões (a do áudio oficial e a feita para o clipe, as duas do LRCLIB),
// sem precisar baixar nada: cada frase igual nas duas, na mesma ordem, diz onde aquele trecho cantado está em cada uma.
// As letras podem ter linhas a mais ou a menos (o refrão repetido, uma fala no clipe): as frases são casadas pela maior
// sequência em comum, e os pares que andam para trás ou mudam de deslocamento sozinhos (uma frase repetida casada no
// lugar errado) saem. null com menos de 4 frases casadas
const frase = (t) => normal(t).replace(/\b(oh|ah|uh|yeah|ooh|hey)\b/g, ' ').replace(/\s+/g, ' ').trim();
export function paresPelasLetras(doAudio, doVideo) {
  const A = (doAudio?.linhas || []).map(frase);
  const V = (doVideo?.linhas || []).map(frase);
  const ta = doAudio?.tempos || [];
  const tv = doVideo?.tempos || [];
  if (A.length < 4 || V.length < 4) return null;
  // maior sequência em comum (LCS) das frases
  const n = A.length;
  const m = V.length;
  const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    L[i][j] = A[i] && A[i] === V[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const casadas = [];
  for (let i = 0, j = 0; i < n && j < m;) {
    if (A[i] && A[i] === V[j]) { casadas.push([i, j]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++;
  }
  let pares = casadas.map(([i, j]) => [ta[i]?.inicio, tv[j]?.inicio]).filter(([a, v]) => Number.isFinite(a) && Number.isFinite(v));
  // deslocamento de cada par; o que foge muito da mediana dos vizinhos (uma frase casada no refrão errado) sai
  const desl = pares.map(([a, v]) => v - a);
  pares = pares.filter((_, k) => {
    const viz = desl.slice(Math.max(0, k - 2), k + 3).sort((x, y) => x - y);
    return Math.abs(desl[k] - viz[Math.floor(viz.length / 2)]) <= 1.5;
  }).filter((p, k, l) => !k || (p[0] > l[k - 1][0] && p[1] > l[k - 1][1]));
  if (pares.length < 4) return null;
  return pares.map(([a, v]) => [Math.round(a * 100) / 100, Math.round(v * 100) / 100]);
}

// Os pares pelas legendas do clipe (as automáticas do YouTube, que trazem o que se canta com o tempo) e a letra
// sincronizada do áudio oficial: cada linha da letra é procurada nas legendas pelas palavras em comum, na ordem (a
// maior soma de parecença, sem voltar no tempo); os pares que fogem do deslocamento dos vizinhos saem. A legenda
// automática erra palavras, mas as linhas certas bastam: dezenas de pares ao longo da música. null com menos de 4
const palavras = (t) => frase(t).split(' ').filter((p) => p.length >= 3);
export function paresPelaLegenda(doAudio, cues) {
  const L = (doAudio?.linhas || []).map(palavras);
  const ta = doAudio?.tempos || [];
  const C = (cues || []).map((c) => palavras(c.texto));
  if (L.length < 4 || C.length < 4) return null;
  // parecença de uma linha da letra com uma legenda (e com a legenda junto da seguinte: a linha pode estar partida)
  const nota = (i, j) => {
    const l = L[i];
    if (l.length < 2) return 0;
    const propria = new Set(C[j]);
    const junto = new Set([...C[j], ...(C[j + 1] || [])]);
    // (a legenda que começa a linha vale mais que a de antes, que só a alcança somando a seguinte)
    return (l.filter((p) => junto.has(p)).length + l.filter((p) => propria.has(p)).length) / (2 * l.length);
  };
  // programação dinâmica: melhor soma, linhas e legendas em ordem (cada linha casa com uma legenda ou fica sem)
  const n = L.length;
  const m = C.length;
  const D = Array.from({ length: n + 1 }, () => new Float32Array(m + 1));
  const de = Array.from({ length: n + 1 }, () => new Uint8Array(m + 1));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const v = nota(i - 1, j - 1);
    let melhor = D[i - 1][j]; let d = 1;
    if (D[i][j - 1] > melhor) { melhor = D[i][j - 1]; d = 2; }
    if (v >= 0.5 && D[i - 1][j - 1] + v > melhor) { melhor = D[i - 1][j - 1] + v; d = 3; }
    D[i][j] = melhor; de[i][j] = d;
  }
  const casadas = [];
  for (let i = n, j = m; i > 0 && j > 0;) {
    const d = de[i][j];
    if (d === 3) { casadas.push([i - 1, j - 1]); i--; j--; } else if (d === 1) i--; else j--;
  }
  casadas.reverse();
  let pares = casadas.map(([i, j]) => [ta[i]?.inicio, cues[j].inicio]).filter(([a, v]) => Number.isFinite(a) && Number.isFinite(v));
  const desl = pares.map(([a, v]) => v - a);
  pares = pares.filter((_, k) => {
    const viz = desl.slice(Math.max(0, k - 3), k + 4).sort((x, y) => x - y);
    return Math.abs(desl[k] - viz[Math.floor(viz.length / 2)]) <= 2.5;
  }).filter((p, k, l) => !k || (p[0] > l[k - 1][0] && p[1] > l[k - 1][1]));
  if (pares.length < 4) return null;
  // (cada legenda começa num ponto um pouco diferente da linha: o deslocamento de cada par vira a mediana dos vizinhos,
  // que é o deslocamento daquele trecho do clipe; um corte ou uma cena no meio muda a mediana dali em diante)
  const d2 = pares.map(([a, v]) => v - a);
  return pares.map(([a], k) => {
    const viz = d2.slice(Math.max(0, k - 2), k + 3).sort((x, y) => x - y);
    const d = viz[Math.floor(viz.length / 2)];
    return [Math.round(a * 100) / 100, Math.round((a + d) * 100) / 100];
  });
}

// O vídeo é só o áudio (sem as cenas do clipe): o "Nome - Topic" do YouTube Music, o "Official Audio", o vídeo com a
// letra ou o visualizer. Baixar a música em "Áudio e vídeo" com ele trazia só a capa parada: o app procura o clipe
export function pareceSoAudio({ titulo = '', canal = '' } = {}) {
  if (/ - Topic$/i.test(String(canal || '').trim())) return true;
  const nome = normal(titulo);
  if (CLIPE.test(nome)) return false;
  return /\b(official audio|audio oficial|audio|lyrics?|lyric video|letra|visualizer|visualiser)\b/.test(nome);
}

// os vídeos sobre o clipe, que não são ele: os bastidores, o teaser, a reação, a coreografia
const SOBRE_O_CLIPE = /\b(behind the scenes|making of|bastidores|teaser|trailer|reaction|react|reage|tutorial|dance (practice|tutorial)|choreography|coreografia|shorts|interview|entrevista|explica|breakdown|4k 60 ?fps|upscaled?|remastered by)\b/;
// O videoclipe oficial da música entre os vídeos achados: o mesmo título, do canal do artista (ou o VEVO dele) e, sem
// ele, com "official video" / "music video" / "clipe" no nome; nunca o áudio, a letra, a versão ao vivo, o cover, o
// karaokê ou os bastidores. O canal do artista vale mais que o nome: as cópias de outros canais também se dizem
// "Official Video". null se nenhum servir
export function escolherClipe(videos, { titulo = '', artista = '', evitar = '' } = {}) {
  const t = normal(titulo).replace(/\b(feat|ft)\b.*$/, '').trim();
  const a = normal(artista).replace(/\b(feat|ft)\b.*$/, '').trim();
  if (!t) return null;
  let melhor = null;
  let nota = -Infinity;
  for (const v of videos || []) {
    if (!v?.id || v.id === evitar || v.tipo === 'music') continue;
    if (v.segundos > 0 && (v.segundos < 90 || v.segundos > 15 * 60)) continue;
    const nome = normal(v.titulo);
    const canal = normal(v.canal);
    if (!` ${nome} `.includes(` ${t} `)) continue;
    if (pareceSoAudio({ titulo: v.titulo, canal: v.canal })) continue;
    if ((OUTRA_GRAVACAO.test(nome) && !OUTRA_GRAVACAO.test(t)) || (SEM_VOZ.test(nome) && !SEM_VOZ.test(t)) || CANAL_SEM_VOZ.test(canal)) continue;
    if (SOBRE_O_CLIPE.test(nome) && !SOBRE_O_CLIPE.test(t)) continue;
    if (!doMesmoArtista(v, artista) || !mesmoTitulo(v, titulo, artista)) continue;
    const doArtista = a && (canal === a || canal.startsWith(`${a} `) || canal === `${a.replace(/ /g, '')}vevo` || canal.replace(/ /g, '') === `${a.replace(/ /g, '')}vevo`);
    const temNome = CLIPE.test(nome);
    // (só de canal oficial: o do artista, o VEVO ou a gravadora com "official video" no nome; não o de um fã)
    if (!doArtista && !(temNome && canalOficial(v.canal, artista))) continue;
    let n = 0;
    if (doArtista) n += 10;
    if (temNome) n += 4;
    if (doArtista && /vevo$/.test(canal.replace(/ /g, ''))) n += 2;
    if (a && ` ${nome} `.includes(` ${a} `)) n += 2;
    if (n > nota) { nota = n; melhor = v; }
  }
  return melhor;
}

// O canal é oficial: o do próprio artista (ou de um dos artistas juntos), o VEVO dele ou o de uma gravadora — não o de
// um fã, de letras ou de covers, mesmo que o vídeo se diga "Music Video"
// (no K-pop o clipe sai no canal da empresa — HYBE LABELS, SMTOWN, JYP, YG, 1theK… — e não no do artista)
const GRAVADORA = /\b(vevo|labels?|entertainment|ent|records?|recordings|music group|hybe|big ?hit( music)?|bangtantv|smtown|sm town|jyp|yg|stone music|1thek|mnet|kq|starship|cube|rbw|pledis|source music|belift|koz|ador|woollim|fnc|wakeone|the black label|p nation|kakao|genie|dingo|som livre|sony music|universal music|warner music|warner records|atlantic|emi|island|columbia|interscope|republic|rca|def jam|capitol|epic|kondzilla|gr6|onerpm|deckdisc|mk music|graca music|cancao nova|paulinas|paulus|central gospel|todah|musile|sentimental|virgin)\b/;
export function canalOficial(canal, artista = '') {
  const c = normal(canal).replace(/\s+topic$/, '');
  if (!c) return false;
  if (GRAVADORA.test(c) || /vevo$/.test(c.replace(/ /g, ''))) return true;
  return Boolean(artista) && doMesmoArtista({ canal: c }, artista);
}

// O vídeo é só a capa parada (o "Art Track", a capa do disco o vídeo inteiro)? O YouTube publica três quadros de cada
// vídeo, de 25%, 50% e 75% dele (1.jpg, 2.jpg e 3.jpg): num clipe eles mudam; num vídeo que é só a capa, são iguais.
// quadros: os pixels RGBA dos três (do mesmo tamanho). Parado quando a diferença média entre eles é bem pequena
export function quadrosParados(quadros, limiar = 6) {
  const qs = (quadros || []).filter((q) => q?.length);
  if (qs.length < 2 || qs.some((q) => q.length !== qs[0].length)) return null;
  let maior = 0;
  for (let a = 0; a < qs.length; a++) {
    for (let b = a + 1; b < qs.length; b++) {
      let soma = 0;
      let n = 0;
      for (let i = 0; i < qs[a].length; i += 4) {
        soma += Math.abs(qs[a][i] - qs[b][i]) + Math.abs(qs[a][i + 1] - qs[b][i + 1]) + Math.abs(qs[a][i + 2] - qs[b][i + 2]);
        n += 3;
      }
      maior = Math.max(maior, soma / n);
    }
  }
  return maior < limiar;
}
