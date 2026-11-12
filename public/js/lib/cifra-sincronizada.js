// A cifra nas linhas da letra sincronizada: os acordes da cifra (ChordPro) passam para as frases da letra com os tempos,
// uma linha da cifra por frase cantada. Assim, na tela da música com a cifra, a frase cantada acende como na letra sem
// cifra (antes cada frase era ligada a uma linha da cifra do site, que junta várias frases numa linha só e às vezes tem
// outro arranjo: o destaque ficava parado num bloco grande, atrasava e pulava para trás nos refrões repetidos).
import { parseChordPro } from '../chordpro.js';

const norm = (w) => String(w || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
// "Ooohhh" na cifra e "Ooh-ooh-ooh-ooh" na letra: as vocalizações (só vogais e h) valem umas pelas outras
const vocal = (w) => w.length >= 3 && /h/.test(w) && /^[aeiouyh]+$/.test(w);
const parecidasComuns = (a, b) => a === b || (vocal(a) && vocal(b)) || (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a)) && Math.abs(a.length - b.length) <= 2);
// ---- letra em coreano e cifra romanizada ----
// Os sites de cifra escrevem a letra coreana com o nosso alfabeto ("Nae nalkeun gitareul deureo"), e a letra
// sincronizada vem em hangul ("내 낡은 기타를 들어"): palavra por palavra, nada casava, e a cifra ficava com a letra
// romanizada, sem acompanhar o canto. O hangul é escrito por sílabas montadas de letras fixas, então dá para
// romanizar por conta (a Romanização Revisada do coreano) e comparar pelo som.
const INICIAIS = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
const VOGAIS = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
// a consoante do fim da sílaba: como soa parada ali e como soa quando a sílaba seguinte começa por vogal
const FINAIS = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];
const FINAIS_LIGADAS = ['', 'g', 'kk', 'ks', 'n', 'nj', 'n', 'd', 'r', 'lg', 'lm', 'lb', 'ls', 'lt', 'lp', 'r', 'm', 'b', 'bs', 's', 'ss', 'ng', 'j', 'ch', 'k', 't', 'p', ''];
const HANGUL = /[\uac00-\ud7a3]/;
export const temHangul = (texto) => HANGUL.test(String(texto || ''));
// "낡은" -> "nalgeun" (o que não é hangul passa como está)
export function romanizar(texto) {
  const letras = [...String(texto || '')];
  let saida = '';
  letras.forEach((ch, i) => {
    const c = ch.charCodeAt(0) - 0xac00;
    if (ch.length !== 1 || c < 0 || c > 11171) { saida += ch; return; }
    const fim = c % 28;
    const prox = (letras[i + 1] || '').charCodeAt(0) - 0xac00;
    const ligada = prox >= 0 && prox <= 11171 && Math.floor(prox / 588) === 11; // a próxima sílaba começa por vogal
    saida += INICIAIS[Math.floor(c / 588)] + VOGAIS[Math.floor((c % 588) / 28)] + (ligada ? FINAIS_LIGADAS[fim] : FINAIS[fim]);
  });
  return saida;
}
// O som da palavra romanizada, sem o que muda de um jeito de escrever para outro ("nalkeun" e "nalgeun", "cheok" e
// "chuk", "sarang" e "salang"): as consoantes de mesma família e as vogais parecidas viram uma letra só
function somCoreano(palavra) {
  return norm(romanizar(palavra))
    .replace(/ch|jj/g, 'j').replace(/sh|ss/g, 's').replace(/kk|[kcq]/g, 'g').replace(/tt|t/g, 'd').replace(/pp|p/g, 'b').replace(/l/g, 'r')
    .replace(/eo|eu/g, (v) => (v === 'eo' ? 'o' : 'u')).replace(/ae/g, 'e').replace(/oo|ou/g, 'u').replace(/ee/g, 'i')
    .replace(/(.)\1+/g, '$1');
}
// quantas letras trocar, pôr ou tirar para uma virar a outra (até o limite; acima dele, devolve limite + 1)
function distancia(a, b, limite) {
  if (Math.abs(a.length - b.length) > limite) return limite + 1;
  let antes = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const linha = [i];
    let menor = i;
    for (let j = 1; j <= b.length; j++) {
      linha[j] = Math.min(antes[j] + 1, linha[j - 1] + 1, antes[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (linha[j] < menor) menor = linha[j];
    }
    if (menor > limite) return limite + 1;
    antes = linha;
  }
  return antes[b.length];
}
// no coreano, as palavras valem uma pela outra com uma letra de diferença (duas, nas compridas)
const parecidasNoSom = (a, b) => a === b || (a.length >= 3 && b.length >= 3 && distancia(a, b, a.length >= 7 && b.length >= 7 ? 2 : 1) <= (a.length >= 7 && b.length >= 7 ? 2 : 1));

// palavras de um texto, com a posição de cada uma
const palavrasDe = (texto, chave = norm) => [...String(texto).matchAll(/\S+/g)].map((m) => ({ texto: m[0], ini: m.index, n: chave(m[0]) })).filter((p) => p.n);

// as palavras cantadas da cifra, na ordem (o refrão repetido com {chorus} entra de novo), cada uma com os acordes
// que caem nela ({ acorde, desloc } — o deslocamento dentro da palavra) e a seção de onde veio
function palavrasDaCifra(content, chave = norm) {
  const { meta, sections } = parseChordPro(content);
  const lista = [];
  sections.forEach((sec, s) => {
    for (const linha of sec.lines) {
      if (linha.kind === 'comment') { for (const p of palavrasDe(linha.text.replace(/^\((.*)\)$/, '$1'), chave)) lista.push({ n: p.n, acordes: [], sec: s, tam: p.texto.length }); continue; }
      if (linha.kind !== 'lyrics') continue;
      let texto = '';
      const acordes = [];
      for (const seg of linha.segments) {
        if (seg.chord) acordes.push({ acorde: seg.chord, pos: texto.length });
        texto += seg.text;
      }
      const ps = palavrasDe(texto, chave);
      if (!ps.length) continue; // linha só de acordes (parte instrumental): fica de fora
      const itens = ps.map((p) => ({ n: p.n, acordes: [], sec: s, tam: p.texto.length }));
      for (const { acorde, pos } of acordes) {
        // a palavra em que o acorde cai (ou a seguinte, se ele está no espaço entre duas)
        let i = ps.findIndex((p) => pos < p.ini + p.texto.length);
        if (i < 0) i = ps.length - 1;
        itens[i].acordes.push({ acorde, desloc: Math.max(0, Math.min(pos - ps[i].ini, ps[i].texto.length - 1)) });
      }
      lista.push(...itens);
    }
  });
  return { meta, sections, lista };
}

// alinhamento das duas sequências de palavras (a maior subsequência em comum): índice da cifra -> índice da letra
function alinhar(a, b, parecidas = parecidasComuns) {
  const n = a.length;
  const m = b.length;
  const w = m + 1;
  const t = new Uint16Array((n + 1) * w);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      t[i * w + j] = parecidas(a[i], b[j]) ? t[(i + 1) * w + j + 1] + 1 : Math.max(t[(i + 1) * w + j], t[i * w + j + 1]);
    }
  }
  const par = new Int32Array(n).fill(-1);
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (parecidas(a[i], b[j]) && t[i * w + j] === t[(i + 1) * w + j + 1] + 1) { par[i] = j; i++; j++; } else if (t[(i + 1) * w + j] >= t[i * w + j + 1]) i++;
    else j++;
  }
  return par;
}

const TIPOS = { chorus: 'chorus', bridge: 'bridge', verse: 'verse' };

// Devolve { content } com uma linha por frase de `linhas` (na mesma ordem), os acordes da cifra em cima das palavras e
// as seções da cifra (Refrão, Ponte…); null quando a cifra não bate com a letra (outra versão, outra língua)
export function cifraNasLinhas(content, linhas) {
  const frases = (linhas || []).map((l) => String(l ?? ''));
  if (!content || !frases.length) return null;
  // a letra em coreano (hangul) e a cifra romanizada: as palavras são comparadas pelo som
  const coreano = frases.some(temHangul);
  const som = coreano ? somCoreano : norm;
  const { meta, sections, lista } = palavrasDaCifra(content, som);
  const totalAcordes = lista.reduce((s, p) => s + p.acordes.length, 0);
  if (!totalAcordes) return null;
  const daLetra = [];
  const porLinha = frases.map((f, k) => palavrasDe(f, som).map((p) => { const x = { ...p, linha: k, acordes: [], sec: -1 }; daLetra.push(x); return x; }));
  if (!daLetra.length) return null;
  const visto = new Map();
  const noSom = (x, y) => { const k = `${x} ${y}`; if (!visto.has(k)) visto.set(k, parecidasNoSom(x, y)); return visto.get(k); };
  const par = alinhar(lista.map((p) => p.n), daLetra.map((p) => p.n), coreano ? noSom : parecidasComuns);
  const casadas = par.reduce((s, j) => s + (j >= 0 ? 1 : 0), 0);
  // os acordes de cada palavra da cifra vão para a palavra da letra que casou com ela; os de uma palavra que não casou,
  // para a próxima que casou (sem passar de uma palavra da letra que já tem acorde)
  let colocados = 0;
  let pendentes = [];
  lista.forEach((p, i) => {
    const j = par[i];
    if (j < 0) { pendentes.push(...p.acordes.map((a) => ({ ...a, desloc: 0 }))); return; }
    const alvo = daLetra[j];
    alvo.sec = p.sec;
    const novos = [...pendentes, ...p.acordes];
    pendentes = [];
    for (const a of novos) {
      // (a palavra em hangul tem menos letras que a romanizada: o acorde fica na mesma altura da palavra)
      const desloc = Math.min(coreano && p.tam > 1 ? Math.round(a.desloc * (alvo.texto.length - 1) / (p.tam - 1)) : a.desloc, alvo.texto.length - 1);
      if (alvo.acordes.some((x) => x.desloc === desloc)) continue;
      alvo.acordes.push({ acorde: a.acorde, desloc });
      colocados++;
    }
  });
  if (casadas < daLetra.length * 0.5 || colocados < totalAcordes * 0.5) return null;
  // a frase repetida que ficou sem acordes (o refrão que a cifra escreve uma vez só) leva os da mesma frase com acordes
  const chave = (k) => porLinha[k].map((p) => p.n).join(' ');
  const modelo = new Map();
  porLinha.forEach((ps, k) => { if (ps.length >= 2 && ps.some((p) => p.acordes.length) && !modelo.has(chave(k))) modelo.set(chave(k), k); });
  porLinha.forEach((ps, k) => {
    if (ps.some((p) => p.acordes.length) || !modelo.has(chave(k))) return;
    porLinha[modelo.get(chave(k))].forEach((p, i) => { ps[i].acordes = p.acordes.map((a) => ({ ...a })); });
  });
  // monta o ChordPro: as frases na ordem, cada uma numa linha; uma seção nova da cifra abre a seção na letra também
  const saida = [];
  if (meta.key) saida.push(`{key: ${meta.key}}`);
  let secAtual = -1;
  let aberta = '';
  porLinha.forEach((ps, k) => {
    const s = ps.find((p) => p.sec >= 0)?.sec ?? secAtual;
    if (s !== secAtual && s >= 0) {
      if (aberta) saida.push(`{end_of_${aberta}}`);
      aberta = '';
      saida.push('');
      const sec = sections[s];
      const tipo = TIPOS[sec.type];
      if (tipo && (sec.label || tipo !== 'verse')) { aberta = tipo; saida.push(`{start_of_${tipo}${sec.label ? `: ${sec.label}` : ''}}`); }
      secAtual = s;
    }
    let texto = frases[k].replace(/[[\]{}]/g, '').trim() || '♪';
    // os acordes de trás para a frente, para as posições não mudarem
    const acordes = ps.flatMap((p) => p.acordes.map((a) => ({ pos: p.ini + a.desloc, acorde: a.acorde }))).sort((a, b) => b.pos - a.pos);
    const original = frases[k];
    const desvio = original.length - original.trimStart().length;
    for (const { pos, acorde } of acordes) {
      const p = Math.max(0, Math.min(texto.length, pos - desvio));
      texto = `${texto.slice(0, p)}[${acorde}]${texto.slice(p)}`;
    }
    saida.push(texto);
  });
  if (aberta) saida.push(`{end_of_${aberta}}`);
  return { content: saida.join('\n').trim() };
}
