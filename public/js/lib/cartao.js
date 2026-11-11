// O cartão para compartilhar uma música ou um trecho da letra (o botão de compartilhar do player, da letra e dos ⋮ da
// música): uma imagem 4:5 com a capa, o nome e o artista ("Música") ou com os versos escolhidos ("Letra"), na cor da
// música ou em outra das cores oferecidas, ou com o quadro do videoclipe ("Vídeo"), e o texto que vai junto na mensagem.
import { fonte, retangulo } from './convite.js';

// o tamanho de cada cartão: a música em pé (como um story), a letra quadrada e o vídeo deitado
export const TAMANHOS_DO_CARTAO = { musica: { l: 1080, a: 1920 }, letra: { l: 1080, a: 1080 }, video: { l: 1080, a: 920 } };
export const tamanhoDoCartao = (modo) => TAMANHOS_DO_CARTAO[modo] || TAMANHOS_DO_CARTAO.musica;
// os estilos do texto da letra (a tela "Personalizar") e os alinhamentos
export const ESTILOS_DO_TEXTO = [['classico', 'Clássico'], ['largo', 'Largo'], ['estreito', 'Estreito'], ['inclinado', 'Inclinado']];
export const proximoDe = (lista, atual) => lista[(lista.indexOf(atual) + 1) % lista.length];
// "4:03" a partir dos segundos; '' sem a duração
export const duracaoDoCartao = (s) => (Number(s) > 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '');
export const MAXIMO_DE_VERSOS = 5;

// "hsl(210 60% 40%)" (o formato de lib/cores.js) -> { h, s, l }; null se não for
export function lerHsl(cor) {
  const m = /hsla?\(\s*(-?[\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%/i.exec(String(cor || ''));
  return m ? { h: Number(m[1]), s: Number(m[2]), l: Number(m[3]) } : null;
}
// As cores oferecidas para o cartão: a da música (com o brilho limitado, para a letra branca ler bem), a mesma bem
// escura, o preto e o claro. Cada uma: { nome, fundo, fundo2 (o pé do degradê), texto, suave (o texto secundário) }
export function coresDoCartao(corDaMusica) {
  const { h, s } = lerHsl(corDaMusica) || { h: 190, s: 60 };
  const sat = Math.min(72, Math.max(28, s));
  return [
    { nome: 'Cor da música', fundo: `hsl(${h} ${sat}% 36%)`, fundo2: `hsl(${h} ${sat}% 24%)`, texto: '#fff', suave: 'rgba(255,255,255,0.74)' },
    { nome: 'Escura', fundo: `hsl(${h} ${Math.round(sat * 0.6)}% 16%)`, fundo2: `hsl(${h} ${Math.round(sat * 0.6)}% 9%)`, texto: '#fff', suave: 'rgba(255,255,255,0.7)' },
    { nome: 'Preta', fundo: '#18181b', fundo2: '#09090b', texto: '#fff', suave: 'rgba(255,255,255,0.68)' },
    { nome: 'Clara', fundo: '#fafaf9', fundo2: '#e7e5e4', texto: '#111', suave: 'rgba(17,17,17,0.66)' },
  ];
}

// As linhas da letra que podem ir no cartão: sem as vazias, as marcas de parte ("[Refrão]") e as repetidas em seguida
export function linhasParaEscolher(linhas) {
  const saida = [];
  for (const bruta of linhas || []) {
    const t = String(typeof bruta === 'string' ? bruta : bruta?.texto || '').replace(/\s+/g, ' ').trim();
    if (!t || /^[[(][^\])]*[\])]$/.test(t) || /^[♪♫\s.…-]+$/.test(t)) continue;
    saida.push(t);
  }
  return saida;
}
// Os versos que entram marcados ao abrir: a partir da linha que está sendo cantada (ou do começo), até 4 seguidos
export function versosIniciais(linhas, atual = -1, quantos = 4) {
  if (!linhas?.length) return [];
  const i = Math.max(0, Math.min(atual >= 0 ? atual : 0, linhas.length - 1));
  const ini = Math.min(i, Math.max(0, linhas.length - quantos));
  return Array.from({ length: Math.min(quantos, linhas.length - ini) }, (_, k) => ini + k);
}
// marca ou desmarca um verso (os índices ficam em ordem; no máximo MAXIMO_DE_VERSOS: além disso, não entra)
export function alternarVerso(marcados, i) {
  if (marcados.includes(i)) return marcados.filter((x) => x !== i);
  if (marcados.length >= MAXIMO_DE_VERSOS) return marcados;
  return [...marcados, i].sort((a, b) => a - b);
}

// O texto que vai na mensagem, junto com a imagem: os versos entre aspas (no cartão da letra), o nome e o artista, e
// o endereço para ouvir
export function textoDoCartao({ titulo = '', artista = '', url = '', versos = [] } = {}) {
  const nome = [titulo, artista].filter(Boolean).join(' — ');
  const trecho = versos.length ? `“${versos.join('\n')}”` : '';
  return [trecho, [nome, url].filter(Boolean).join('\n')].filter(Boolean).join('\n\n');
}

// O endereço da música no Ecoa, para o link compartilhado: abre o app (ou o site) na música, procurada pelo nome e pelo
// artista — a biblioteca é de cada pessoa, então o link não leva o número da música de quem enviou. '' sem o nome.
// (os parênteses, o "!", o "'" e o "*" também vão codificados: os aplicativos de mensagem cortam o link neles)
export const ENDERECO_DO_ECOA = 'https://kvsl11.github.io/Ecoa/';
const parteDoLink = (t) => encodeURIComponent(String(t || '').replace(/\s+/g, ' ').trim()).replace(/[!'()*]/g, (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
// video: o identificador do vídeo no YouTube (11 caracteres) da música de quem envia — quem abre recebe a mesma
// gravação, e não outra de mesmo nome. Sem o artista e com o vídeo, o lugar do artista leva "-"
export function linkDaMusicaNoEcoa(titulo, artista = '', video = '') {
  const t = parteDoLink(titulo);
  if (!t) return '';
  const a = parteDoLink(artista);
  const v = /^[\w-]{11}$/.test(video || '') ? video : '';
  return `${ENDERECO_DO_ECOA}#/ouvir/${t}${a || v ? `/${a || '-'}` : ''}${v ? `/${v}` : ''}`;
}
// as partes do endereço (já decodificadas) -> { titulo, artista, video }
export function musicaDoLink(titulo = '', artista = '', video = '') {
  return { titulo: String(titulo || '').trim(), artista: artista === '-' ? '' : String(artista || '').trim(), video: /^[\w-]{11}$/.test(video || '') ? video : '' };
}
// o mesmo, para abrir o aplicativo Android a partir do navegador (o Chrome entrega ao app instalado; sem ele, abre o site)
export function linkParaAbrirNoAplicativo(titulo, artista = '', video = '') {
  const web = linkDaMusicaNoEcoa(titulo, artista, video);
  if (!web) return '';
  return `intent://ouvir/${web.split('#/ouvir/')[1]}#Intent;scheme=ecoa;package=br.ecoa.app;S.browser_fallback_url=${encodeURIComponent(web)};end`;
}

// Quebra o texto em linhas que cabem na largura (medir: texto -> largura). A palavra maior que a linha fica sozinha
export function quebrarTexto(medir, texto, largura) {
  const linhas = [];
  let atual = '';
  for (const palavra of String(texto || '').split(/\s+/).filter(Boolean)) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra;
    if (atual && medir(tentativa) > largura) { linhas.push(atual); atual = palavra; } else atual = tentativa;
  }
  if (atual) linhas.push(atual);
  return linhas;
}
// no máximo n linhas: a última termina com reticências quando sobra texto
export function limitarLinhas(medir, linhas, n, largura) {
  if (linhas.length <= n) return linhas;
  const saida = linhas.slice(0, n);
  let ultima = saida[n - 1];
  while (ultima && medir(`${ultima}…`) > largura) ultima = ultima.slice(0, -1).trimEnd();
  saida[n - 1] = `${ultima}…`;
  return saida;
}

// o texto numa linha só: inteiro se cabe; senão cortado, com reticências
export function umaLinha(medir, texto, largura) {
  let t = String(texto || '').replace(/\s+/g, ' ').trim();
  if (medir(t) <= largura) return t;
  while (t && medir(`${t}…`) > largura) t = t.slice(0, -1).trimEnd();
  return `${t}…`;
}

// uma imagem já carregada cortada para caber no retângulo (como o object-fit: cover), com os cantos arredondados; sem
// ela, um quadro com a nota
function desenharImagem(c, img, x, y, l, a, raio, cor) {
  c.save();
  retangulo(c, x, y, l, a, raio);
  c.clip();
  if (img) {
    const escala = Math.max(l / img.width, a / img.height);
    const sl = l / escala; const sa = a / escala;
    c.drawImage(img, (img.width - sl) / 2, (img.height - sa) / 2, sl, sa, x, y, l, a);
  } else {
    c.fillStyle = cor.texto === '#fff' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)';
    c.fillRect(x, y, l, a);
    c.fillStyle = cor.suave;
    c.font = fonte(700, Math.min(l, a) * 0.42);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('♪', x + l / 2, y + a / 2);
    c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  }
  c.restore();
}
// a marca do Ecoa (o símbolo e o nome), com a base em y: numa cor só, a do texto do cartão — o "e" e as duas ondas do
// símbolo, sem o quadrado azul atrás, e o nome ao lado
function marca(c, x, y, cor, lado = 56) {
  c.save();
  c.translate(x - lado * 0.16, y - lado);
  c.scale(lado / 64, lado / 64);
  c.strokeStyle = cor.texto;
  c.lineCap = 'round';
  const traco = (d, largura, opacidade) => { c.globalAlpha = opacidade; c.lineWidth = largura; c.stroke(new Path2D(d)); };
  traco('M14.5 32H39.5A12.5 12.5 0 1 0 36.29 40.36', 6.4, 1);
  traco('M43.15 19.38A20.5 20.5 0 0 1 43.15 44.62', 4.2, 0.8);
  traco('M50.75 17.16A28 28 0 0 1 50.75 46.84', 3.6, 0.55);
  c.restore();
  c.fillStyle = cor.texto;
  c.font = fonte(800, lado * 0.68);
  c.textAlign = 'left';
  c.fillText('Ecoa', x + lado * 0.86, y - lado * 0.27);
}

// Os fundos animados do cartão (a tela "Personalizar"): desenhados por cima da cor (ou da imagem de fundo), na cor do
// texto do cartão, bem transparentes — servem a qualquer uma das cores. O cartão animado sai como vídeo, e o movimento
// se repete a cada DURACAO_DA_ANIMACAO segundos: tudo anda um número inteiro de voltas nesse tempo, e o fim do vídeo
// emenda no começo
export const FUNDOS_ANIMADOS = [['eco', 'Eco'], ['ondas', 'Ondas'], ['aurora', 'Aurora'], ['bolhas', 'Bolhas'], ['brilhos', 'Brilhos']];
export const DURACAO_DA_ANIMACAO = 6;
// um número entre 0 e 1 tirado de dois inteiros (sempre o mesmo: as bolhas e os brilhos não mudam de lugar a cada quadro)
export const acaso = (i, k = 0) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
// a volta da animação no instante t: de 0 a 1, e de novo
export const voltaDaAnimacao = (t) => { const v = (Number(t) || 0) / DURACAO_DA_ANIMACAO; return v - Math.floor(v); };
export function desenharFundoAnimado(c, L, A, tinta, qual, t = 0) {
  const v = voltaDaAnimacao(t);
  const DOIS_PI = Math.PI * 2;
  c.save();
  c.fillStyle = tinta; c.strokeStyle = tinta;
  if (qual === 'eco') {
    // os anéis do eco saindo do meio do cartão, apagando conforme crescem
    const raio = Math.hypot(L, A) * 0.62; const n = 6;
    for (let i = 0; i < n; i++) {
      const p = (v + i / n) % 1;
      c.globalAlpha = 0.2 * (1 - p) ** 1.4;
      c.lineWidth = 10 + 26 * p;
      c.beginPath(); c.arc(L / 2, A / 2, 30 + p * raio, 0, DOIS_PI); c.stroke();
    }
  } else if (qual === 'ondas') {
    // quatro ondas no pé do cartão, cada uma num passo
    for (let i = 0; i < 4; i++) {
      const base = A * (0.52 + i * 0.12); const alto = A * (0.035 - i * 0.004); const fase = DOIS_PI * v * (i % 2 ? -1 : 1) * (1 + (i >> 1)) + i * 1.7;
      c.globalAlpha = 0.07 + i * 0.02;
      c.beginPath(); c.moveTo(0, A);
      for (let x = 0; x <= L; x += 24) c.lineTo(x, base + Math.sin((x / L) * DOIS_PI * (1.2 + i * 0.35) + fase) * alto + Math.sin((x / L) * DOIS_PI * 2.6 - fase) * alto * 0.35);
      c.lineTo(L, A); c.closePath(); c.fill();
    }
  } else if (qual === 'aurora') {
    // três clarões grandes passeando devagar
    for (let i = 0; i < 3; i++) {
      const a = DOIS_PI * (v + i / 3);
      const x = L * (0.5 + 0.34 * Math.cos(a * (i === 1 ? -1 : 1) + i)); const y = A * (0.5 + 0.36 * Math.sin(a + i * 2.1));
      const r = Math.max(L, A) * (0.42 + 0.06 * Math.sin(a * 2 + i));
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, tinta); g.addColorStop(1, tinta === '#fff' ? 'rgba(255,255,255,0)' : 'rgba(17,17,17,0)');
      c.globalAlpha = 0.2;
      c.fillStyle = g;
      c.fillRect(0, 0, L, A);
    }
  } else if (qual === 'bolhas') {
    // as bolhas subindo, cada uma no seu tamanho e na sua velocidade (uma ou duas subidas por volta)
    for (let i = 0; i < 26; i++) {
      const r = 14 + acaso(i, 1) * 58; const vezes = 1 + Math.floor(acaso(i, 2) * 2);
      const p = (v * vezes + acaso(i, 3)) % 1;
      const x = acaso(i, 4) * L + Math.sin(DOIS_PI * (v * vezes + acaso(i, 5))) * 30;
      const y = A + r - p * (A + 2 * r);
      c.globalAlpha = (0.06 + acaso(i, 6) * 0.12) * Math.min(1, p * 6, (1 - p) * 6);
      c.beginPath(); c.arc(x, y, r, 0, DOIS_PI); c.fill();
    }
  } else if (qual === 'brilhos') {
    // os pontos de luz piscando
    for (let i = 0; i < 70; i++) {
      const vezes = 1 + Math.floor(acaso(i, 1) * 3);
      const pisca = Math.sin(Math.PI * ((v * vezes + acaso(i, 2)) % 1)) ** 2;
      const r = (2.5 + acaso(i, 3) * 6) * (0.6 + 0.4 * pisca);
      c.globalAlpha = 0.55 * pisca;
      c.beginPath(); c.arc(acaso(i, 4) * L, acaso(i, 5) * A, r, 0, DOIS_PI); c.fill();
    }
  }
  c.restore();
}

// Desenha o cartão no canvas. dados: { modo: 'musica' | 'letra' | 'video', titulo, artista, capa (imagem carregada ou
// null), versos (os textos, no modo letra), cor (uma de coresDoCartao), estilo ('classico' | 'largo' | 'estreito' |
// 'inclinado'), alinhar ('esquerda' | 'centro'), fundo (uma imagem carregada — a capa ou uma foto do aparelho — que
// cobre o cartão, escurecida, no lugar da cor; null: a cor), quadro (a imagem do videoclipe), duracao (segundos),
// animacao (um dos FUNDOS_ANIMADOS, ou '': o fundo parado) e t (o instante da animação, em segundos) }
export function desenharCartao(canvas, { modo = 'musica', titulo = '', artista = '', capa = null, versos = [], cor: corPedida, estilo = 'classico', alinhar = 'esquerda', fundo = null, quadro = null, duracao = 0, animacao = '', t = 0 } = {}) {
  let cor = corPedida;
  if (modo === 'letra' && !versos.length) modo = 'musica';
  const { l: L, a: A } = tamanhoDoCartao(modo);
  // (o tamanho só é posto quando muda: pôr de novo a cada quadro apagaria o canvas que está sendo gravado em vídeo)
  if (canvas.width !== L || canvas.height !== A) { canvas.width = L; canvas.height = A; }
  const c = canvas.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = 1;
  const medir = (t) => c.measureText(t).width;
  const M = 72;
  c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  const degrade = c.createLinearGradient(0, 0, 0, A);
  degrade.addColorStop(0, cor.fundo); degrade.addColorStop(1, cor.fundo2);
  c.fillStyle = degrade;
  c.fillRect(0, 0, L, A);
  // (a imagem de fundo: cobre o cartão, escurecida, e o texto fica branco por cima)
  if (fundo) {
    desenharImagem(c, fundo, 0, 0, L, A, 0, cor);
    c.fillStyle = 'rgba(0,0,0,0.56)';
    c.fillRect(0, 0, L, A);
    cor = { ...cor, texto: '#fff', suave: 'rgba(255,255,255,0.78)' };
  }
  if (FUNDOS_ANIMADOS.some(([k]) => k === animacao)) desenharFundoAnimado(c, L, A, cor.texto, animacao, t);

  if (modo === 'letra') {
    const tinta = cor;
    // em cima: a capa pequena, o nome e "Música · artista"
    desenharImagem(c, capa, M, M, 112, 112, 18, tinta);
    const tx = M + 112 + 26; const tl = L - M - tx;
    c.fillStyle = tinta.texto;
    c.font = fonte(700, 40);
    c.fillText(umaLinha(medir, titulo, tl), tx, M + 50);
    c.fillStyle = tinta.suave;
    c.font = fonte(500, 32);
    c.fillText(umaLinha(medir, ['Música', artista].filter(Boolean).join(' · '), tl), tx, M + 96);
    marca(c, M, A - M, tinta);
    // os versos, na maior letra em que cabem, no estilo e no alinhamento escolhidos
    const topo = M + 112 + 56; const altura = A - M - 56 - 48 - topo;
    const aperto = estilo === 'estreito' ? 0.8 : 1; // (a letra estreita: o texto desenhado com a largura reduzida)
    const larg = (L - 2 * M) / aperto;
    const peso = estilo === 'largo' ? 700 : 800;
    const fonteDoVerso = (tam) => `${estilo === 'inclinado' ? 'italic ' : ''}${fonte(peso, tam)}`;
    if ('letterSpacing' in c) c.letterSpacing = estilo === 'largo' ? '5px' : estilo === 'estreito' ? '0px' : '-1.5px';
    const texto = (v) => (estilo === 'largo' ? String(v).toUpperCase() : v);
    let tamanho = 104; let blocos = []; let total = 0;
    const medirBlocos = () => {
      c.font = fonteDoVerso(tamanho);
      blocos = versos.map((v) => quebrarTexto(medir, texto(v), larg));
      total = blocos.reduce((n, b) => n + b.length, 0) * tamanho * 1.14 + (blocos.length - 1) * tamanho * 0.24;
    };
    for (medirBlocos(); total > altura && tamanho > 36; medirBlocos()) tamanho -= 4;
    const passo = tamanho * 1.14;
    c.fillStyle = tinta.texto;
    c.textAlign = alinhar === 'centro' ? 'center' : 'left';
    const x = alinhar === 'centro' ? L / 2 / aperto : M / aperto;
    let y = topo + Math.max(0, (altura - total) / 2) + tamanho * 0.9;
    c.save();
    c.scale(aperto, 1);
    for (const bloco of blocos) {
      for (const linha of bloco) { if (y > topo + altura + tamanho * 0.3) break; c.fillText(linha, x, y); y += passo; }
      y += tamanho * 0.24;
    }
    c.restore();
    c.textAlign = 'left';
    if ('letterSpacing' in c) c.letterSpacing = '0px';
    return canvas;
  }

  if (modo === 'video') {
    // o quadro do clipe em cima (16:9) e, embaixo, a capa pequena, o nome, o artista, a marca e a duração
    const ql = L - 2 * 44; const qa = Math.round(ql * 9 / 16);
    desenharImagem(c, quadro || capa, 44, 44, ql, qa, 30, cor);
    const y0 = 44 + qa + 44;
    desenharImagem(c, capa, M, y0, 120, 120, 18, cor);
    const tx = M + 120 + 28; const tl = L - M - tx;
    c.fillStyle = cor.texto;
    c.font = fonte(800, 44);
    c.fillText(umaLinha(medir, titulo, tl), tx, y0 + 54);
    c.fillStyle = cor.suave;
    c.font = fonte(500, 36);
    c.fillText(umaLinha(medir, artista, tl), tx, y0 + 104);
    marca(c, M, A - 52, cor, 52);
    const rotulo = ['Videoclipe', duracaoDoCartao(duracao)].filter(Boolean).join(' · ');
    c.fillStyle = cor.texto;
    c.font = fonte(700, 32);
    c.textAlign = 'right';
    c.fillText(rotulo, L - M, A - 68);
    // (o triângulo do play, antes do rótulo)
    const lr = medir(rotulo); const px = L - M - lr - 46; const py = A - 80;
    c.strokeStyle = cor.texto; c.lineWidth = 4;
    retangulo(c, px - 6, py - 18, 40, 34, 8); c.stroke();
    c.beginPath(); c.moveTo(px + 8, py - 9); c.lineTo(px + 22, py - 1); c.lineTo(px + 8, py + 7); c.closePath(); c.fill();
    c.textAlign = 'left';
    return canvas;
  }

  // a música: um painel escuro com a capa grande, o nome, o artista e a marca, no meio do cartão colorido
  const pl = L - 2 * 96; const px = 96;
  c.font = fonte(800, 60);
  const nomes = limitarLinhas(medir, quebrarTexto(medir, titulo, pl - 2 * 56), 2, pl - 2 * 56);
  const capaLado = pl - 2 * 56;
  const pa = 56 + capaLado + 56 + nomes.length * 72 + 62 + 64 + 56 + 44;
  const py = Math.round((A - pa) / 2);
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 70; c.shadowOffsetY = 30;
  c.fillStyle = 'rgba(12,12,14,0.86)';
  retangulo(c, px, py, pl, pa, 44); c.fill();
  c.restore();
  const claro = { ...cor, texto: '#fff', suave: 'rgba(255,255,255,0.72)' };
  desenharImagem(c, capa, px + 56, py + 56, capaLado, capaLado, 20, claro);
  let y = py + 56 + capaLado + 56 + 50;
  c.fillStyle = '#fff';
  c.font = fonte(800, 60);
  for (const linha of nomes) { c.fillText(linha, px + 56, y); y += 72; }
  c.fillStyle = claro.suave;
  c.font = fonte(500, 42);
  c.fillText(umaLinha(medir, artista, pl - 2 * 56), px + 56, y - 2);
  marca(c, px + 56, py + pa - 50, claro, 52);
  return canvas;
}
