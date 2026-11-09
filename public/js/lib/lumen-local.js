// O Lúmen no próprio celular (o APK): a mesma conversa do servidor (servidor-ia/duvidas.py), sem o Codespace. O app
// procura os trechos do acervo no aparelho (o índice das dúvidas, com o texto dos PDFs do acervo), monta o pedido e
// chama o Gemini pelo plugin do APK (a chave vai no app, travada ao pacote br.ecoa.app, e não passa por aqui). Este
// arquivo só monta o pedido e lê a resposta: chamar(caminho, corpo) é quem fala com o Gemini.

// (os textos do Lúmen são os mesmos do servidor: servidor-ia/duvidas.py, SISTEMA, SISTEMA_VOZ e SISTEMA_ANEXO)
export const SISTEMA = "Você é o Lumen, o assistente do app Songbook Litúrgico. Você é um assistente de verdade, livre: responde o que a pessoa perguntar, sobre qualquer assunto (liturgia, música, canto, teoria musical, ensaio, a Bíblia, a fé, o app, ou qualquer outra coisa do dia a dia), com o que você sabe e com a busca na web quando precisar de algo atual. Você conhece muito bem a liturgia católica e ajuda ministérios de música (cantores, instrumentistas, equipes de liturgia), mas não se limita a isso. Responda em português do Brasil, claro e direto, como quem conversa com um amigo do grupo. Use listas curtas quando ajudarem; nada de enrolação.\n\nO MAIS IMPORTANTE: responda exatamente ao que foi perguntado. Não puxe assunto que a pessoa não pediu, não fale do acervo, da biblioteca ou da liturgia do dia se a pergunta não é sobre isso, e não termine com \"no acervo há…\".\n\nA mensagem pode trazer, em <app>, o que está no app de quem pergunta: a data de hoje, a liturgia do dia pedido (CNBB), as músicas da biblioteca e os repertórios. Use isso só quando a pergunta for sobre \"hoje\", \"domingo\", \"minhas músicas\", \"meu repertório\" etc.\n\nA mensagem também traz, em <acervo>, trechos do acervo litúrgico do grupo (arquivos do Google Drive: hinários e subsídios da CNBB, cantos, documentos), achados por uma busca automática de palavras: MUITOS NÃO TÊM NADA A VER com a pergunta. Eles são material de consulta, não o assunto da conversa. Use um trecho só quando ele responde de fato ao que foi perguntado e, aí, cite-o com o número entre colchetes, como [2]. Ignore em silêncio os que não têm relação (não diga que não achou no acervo, não comente os trechos). Quando a pessoa pergunta do acervo (\"tem algo no acervo sobre X?\", \"tem o PDF de…?\"), aí sim: os trechos trazem os NOMES dos arquivos e das pastas (PDFs, áudios, cifras); liste os que tratam de X, citando cada um.\n\nPara o que não está nos trechos, responda pelo seu conhecimento e, quando precisar (fatos atuais, datas, documentos), pela busca na web; nas questões de liturgia, prefira fontes da Igreja (CNBB, Vaticano, Instrução Geral do Missal Romano) e diga quando algo veio da internet. Só diga que não sabe quando nem o seu conhecimento nem a web trazem a resposta. Não invente referências.\n\nNa liturgia você responde dúvidas como: quando não há missa (Sexta-feira Santa, Sábado Santo antes da Vigília), como é a missa de Finados ou do Tríduo Pascal, o que se canta em cada parte da missa, cores e tempos litúrgicos, solenidades e festas. Para a liturgia de uma data (leituras, salmo, evangelho), use a que vem em <app>; se ela não veio, procure na web (liturgia diária da CNBB, Canção Nova, Paulus) e diga a fonte. Para cantos de uma celebração (casamento, batismo, exéquias, crisma…), prefira os do acervo e explique em que parte da celebração cada um entra.\n\nVocê também MEXE NO APP. Quando a pessoa pedir uma ação, responda curto confirmando e ponha no fim da resposta o comando, exatamente assim (o app executa e tira o comando do texto):\n- tocar uma música da biblioteca: [[tocar: título exato da música, como está na biblioteca em <app>]]\n- pausar a música: [[pausar]]; continuar: [[continuar]]; a próxima: [[proxima]]; a anterior: [[anterior]]\n- abrir uma tela: [[abrir: liturgia]] (ou biblioteca, repertorios, busca, inicio, ajustes, partituras, oracoes)\nUse a lista de músicas e de repertórios de <app> para responder sobre a biblioteca e os repertórios e para achar a música pedida mesmo com o nome dito de outro jeito (\"aquela do Justice\"). Se a música não estiver na biblioteca, diga isso e não ponha o comando.";
export const SISTEMA_VOZ = "\n\nA resposta será LIDA EM VOZ ALTA numa conversa ao vivo. Responda como numa conversa: de 2 a 6 frases curtas, sem listas, sem títulos, sem negrito, sem citações entre colchetes e sem endereços de sites. Se for uma lista de cantos ou leituras, diga os principais numa frase. Se pedirem uma estrutura ou um passo a passo (os ritos de uma celebração), diga as etapas em ordem, numa sequência falada (\"primeiro…, depois…, por fim…\"), em até 8 frases. Se a resposta veio da internet, diga só o nome da fonte (\"segundo a CNBB…\").";
export const SISTEMA_ANEXO = "\n\nA pessoa enviou um ou mais arquivos (PDF, foto, vídeo, áudio ou texto) junto com a pergunta. Leia, veja ou ouça o arquivo com atenção e responda com base nele primeiro (cite a página ou o trecho quando der). Se a pergunta for só \"o que é isso?\" ou vier vazia, resuma o arquivo e diga o que dá para fazer com ele na liturgia.";

export function sistemaDoGenero(genero) {
  if (genero === 'masculina') {
    return '\n\nVocê fala com a voz masculina (Antônio): você é O Lumen. Fale de si no masculino ("eu sou o Lumen", "fico contente", "estou pronto", "obrigado").';
  }
  return '\n\nVocê fala com a voz feminina (Francisca): você é A Lumen. Fale de si no feminino ("eu sou a Lumen", "sua assistente litúrgica", "estou pronta", "obrigada"). Nunca diga "o Lumen" falando de si.';
}

// ---- o texto dos PDFs do acervo (data/textos-acervo.jsonl.gz, publicado no site): em pedaços, para a busca
// o texto tirado do PDF arrumado: a palavra cortada no fim da linha volta inteira, a linha quebrada no meio da frase
// vira uma só, os espaços repetidos e os números de página soltos saem (o mesmo de limpar_texto_pdf no servidor)
export function limparTextoPdf(texto) {
  let t = String(texto || '').replace(/\r/g, '\n').replace(/­/g, '');
  t = t.replace(/([\p{L}\p{N}_])-\n\s*([\p{L}\p{N}_])/gu, '$1$2');
  t = t.replace(/[ \t\f\v]+/g, ' ');
  t = t.replace(/^[ \t]*\d{1,4}[ \t]*(\n|$)/gm, '');
  t = t.replace(/(?<![.!?:;])\s*\n\s*(?=[a-zà-ú0-9("“])/g, ' ');
  t = t.replace(/\n{3,}/g, '\n\n');
  return t.replace(/ *\n */g, '\n').trim();
}

// o texto em pedaços de ~1200 letras (quebrando em parágrafo), com um pouco do anterior para não cortar a ideia
export function pedacos(texto, tamanho = 1200, sobra = 200) {
  if (texto.length <= tamanho) return [texto];
  const out = [];
  let ini = 0;
  while (ini < texto.length) {
    let fim = Math.min(texto.length, ini + tamanho);
    const quebra = texto.lastIndexOf('\n', fim - 1);
    if (fim < texto.length && quebra >= ini + Math.floor(tamanho / 2)) fim = quebra;
    out.push(texto.slice(ini, fim).trim());
    if (fim >= texto.length) break;
    ini = Math.max(fim - sobra, ini + 1);
  }
  return out.filter(Boolean);
}

// as linhas do textos-acervo.jsonl ({ id, titulo, caminho, texto }) viram os trechos do índice das dúvidas
export function trechosDosPdfs(jsonl) {
  const out = [];
  for (const linha of String(jsonl || '').split('\n')) {
    if (!linha.trim()) continue;
    let d;
    try { d = JSON.parse(linha); } catch { continue; }
    for (const p of pedacos(limparTextoPdf(d.texto || ''))) out.push({ titulo: d.titulo || '', caminho: d.caminho || '', texto: p, id: d.id || '', tipo: 'documento' });
  }
  return out;
}

// ---- o pedido
// só os trechos que pesam perto do melhor (os de uma palavra solta em comum com a pergunta ficam de fora)
export function trechosQueImportam(achados, fracao = 0.35, quantos = 10) {
  if (!achados?.length) return [];
  const corte = achados[0].nota * fracao;
  return achados.filter((a) => a.nota >= corte).slice(0, quantos);
}

export function montarPergunta(pergunta, achados, contexto = '') {
  const blocos = achados.map((t, k) => `[${k + 1}] ${t.titulo} — ${t.caminho}\n${t.texto}`);
  const acervo = blocos.length ? blocos.join('\n\n') : '(nenhum trecho do acervo tem as palavras da pergunta)';
  const app = String(contexto || '').trim() ? `<app>\n${String(contexto).trim()}\n</app>\n\n` : '';
  return `${app}<acervo>\n(trechos achados pela busca de palavras; use só os que respondem à pergunta)\n${acervo}\n</acervo>\n\nPergunta: ${pergunta}`;
}

const TEXTO_DE_ANEXO = /^text\/|\.(txt|md|cho|chordpro|csv|json|html?)$/i;
// o corpo do generateContent: a conversa, o sistema, a busca do Google e os arquivos enviados (PDF, foto, vídeo e
// áudio vão inteiros, em inline_data; texto vai como texto)
export function corpoDoGemini(mensagens, sistema, arquivos = []) {
  const corpo = {
    system_instruction: { parts: [{ text: sistema }] },
    contents: mensagens.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
    tools: [{ google_search: {} }],
  };
  if (arquivos.length) {
    const partes = arquivos.map((a) => (a.texto != null
      ? { text: `<arquivo nome="${a.nome}">\n${String(a.texto).slice(0, 60000)}\n</arquivo>` }
      : { inline_data: { mime_type: a.tipo, data: a.dados } }));
    corpo.contents[corpo.contents.length - 1].parts = [...partes, ...corpo.contents[corpo.contents.length - 1].parts];
  }
  return corpo;
}

export function lerRespostaGemini(dados) {
  const cand = dados?.candidates?.[0] || {};
  if (['SAFETY', 'PROHIBITED_CONTENT', 'BLOCKLIST'].includes(cand.finishReason)) throw new Error('não consegui responder a essa pergunta');
  const texto = (cand.content?.parts || []).map((p) => p.text || '').join('').trim();
  const meta = cand.groundingMetadata || {};
  const web = [];
  const vistos = new Set();
  for (const c of meta.groundingChunks || []) {
    const w = c.web || {};
    if (w.uri && !vistos.has(w.uri)) { vistos.add(w.uri); web.push({ titulo: w.title || w.uri, url: w.uri }); }
  }
  return { texto, web, usouWeb: Boolean(meta.webSearchQueries?.length) };
}

// ---- os modelos: o Flash mais novo, depois os de reserva (como candidatos_gemini no servidor)
export const MODELO_PREFERIDO = 'gemini-3.6-flash';
const versaoDe = (n) => { const m = /gemini-(\d+)(?:\.(\d+))?/.exec(n); return m ? [Number(m[1]), Number(m[2] || 0)] : [0, 0]; };
const compararVersao = (a, b) => (versaoDe(b)[0] - versaoDe(a)[0]) || (versaoDe(b)[1] - versaoDe(a)[1]) || (Number(!b.includes('preview')) - Number(!a.includes('preview')));
export function candidatosGemini(modelos = [], preferido = MODELO_PREFERIDO) {
  const nomes = modelos.filter((m) => (m.supportedGenerationMethods || []).includes('generateContent')).map((m) => String(m.name || '').replace(/^models\//, ''));
  const fora = /tts|image|live|audio|embedding|vision|learnlm|gemma|robotics|computer|thinking|exp|8b/;
  const texto = nomes.filter((n) => n.startsWith('gemini') && n.includes('flash') && !fora.test(n));
  const flash = texto.filter((n) => !n.includes('lite')).sort(compararVersao);
  const lites = texto.filter((n) => n.includes('lite')).sort(compararVersao);
  const semLista = nomes.length === 0;
  const ordem = [
    ...(nomes.includes(preferido) || semLista ? [preferido] : []),
    ...flash.slice(0, 4),
    ...(semLista ? ['gemini-flash-latest'] : []),
    ...lites.slice(0, 2),
    ...(semLista ? ['gemini-flash-lite-latest'] : []),
  ];
  return [...new Set(ordem.filter(Boolean))];
}

export class ErroGemini extends Error {
  constructor(status, mensagem) { super(mensagem); this.status = status; }
}
const mensagemDoGoogle = (texto) => {
  try {
    const e = JSON.parse(texto).error || {};
    let msg = String(e.message || '');
    for (const d of e.details || []) if (d.retryDelay) msg += ` "retryDelay": "${String(d.retryDelay).replace(/s$/, '')}s"`;
    return msg.replace(/\s+/g, ' ').slice(0, 400) || String(texto).slice(0, 300);
  } catch { return String(texto || '').slice(0, 300); }
};
const SEM_PENSAR = { thinkingConfig: { thinkingBudget: 0 } };

// generateContent no melhor modelo que responder; se um não existe mais (404), está ocupado (429/503) ou não aceita a
// ferramenta, tenta o próximo. chamar(caminho, corpo?) → { status, texto }. estado: o que ficou sabido entre as
// perguntas ({ bom, pensaSempre, semBuscaAte, modelos })
export async function chamarGemini(chamar, corpo, estado = {}, { modelos = 7, esperar = (ms) => new Promise((ok) => setTimeout(ok, ms)), agora = Date.now } = {}) {
  estado.pensaSempre ||= new Set();
  if (!estado.lista) {
    try {
      const r = await chamar('models?pageSize=1000');
      if (r.status === 0) throw new ErroGemini(0, r.texto || 'sem conexão com o Google');
      // 401/403 são falhas de chave, API ou restrição do app: tentar vários modelos só repetiria o mesmo bloqueio.
      if (r.status === 401 || r.status === 403) throw new ErroGemini(r.status, mensagemDoGoogle(r.texto));
      estado.lista = r.status === 200 ? (JSON.parse(r.texto).models || []) : [];
    } catch (e) {
      if (e instanceof ErroGemini) throw e;
      estado.lista = [];
    }
  }
  const lista = candidatosGemini(estado.lista);
  if (estado.bom && lista.includes(estado.bom)) lista.splice(0, 0, ...lista.splice(lista.indexOf(estado.bom), 1));
  if (corpo.tools && agora() < (estado.semBuscaAte || 0)) { corpo = { ...corpo }; delete corpo.tools; }
  let ultimo = null;
  const erros = [];
  for (const modelo of lista.slice(0, modelos)) {
    let tentativa = { ...corpo };
    if (!tentativa.generationConfig && !estado.pensaSempre.has(modelo)) tentativa.generationConfig = SEM_PENSAR;
    let esperou = false;
    for (let volta = 0; volta < 4; volta++) {
      const r = await chamar(`models/${modelo}:generateContent`, tentativa);
      if (r.status === 200) { estado.bom = modelo; return JSON.parse(r.texto); }
      if (!r.status) throw new ErroGemini(0, r.texto || 'sem conexão com a IA');
      ultimo = new ErroGemini(r.status, mensagemDoGoogle(r.texto));
      const msg = ultimo.message;
      if (r.status === 400 && tentativa.generationConfig === SEM_PENSAR && /think|budget/i.test(msg)) {
        estado.pensaSempre.add(modelo);
        tentativa = { ...tentativa }; delete tentativa.generationConfig; continue;
      }
      if (r.status === 400 && tentativa.tools && /tool|search|grounding/i.test(msg)) { tentativa = { ...tentativa }; delete tentativa.tools; continue; }
      if (r.status === 429 && tentativa.tools) {
        estado.semBuscaAte = agora() + 3600e3;
        corpo = { ...corpo }; delete corpo.tools;
        tentativa = { ...tentativa }; delete tentativa.tools; continue;
      }
      const m = /retry in ([\d.]+)s|"retryDelay": ?"(\d+)/.exec(msg);
      const segundos = m ? Number(m[1] || m[2]) : 0;
      if (r.status === 429 && !esperou && segundos > 0 && segundos <= 8 && !msg.includes('limit: 0') && !msg.includes('PerDay')) {
        esperou = true;
        await esperar((segundos + 0.3) * 1000);
        continue;
      }
      break;
    }
    erros.push(`${modelo}: ${ultimo.status} ${ultimo.message.slice(0, 160)}`);
    if (![400, 404, 429, 500, 503].includes(ultimo.status)) break;
  }
  if (ultimo) throw new ErroGemini(ultimo.status, erros.join(' | ') || ultimo.message);
  throw new ErroGemini(0, 'nenhum modelo do Gemini disponível');
}

// A resposta do Lúmen, como a do servidor ({ resposta, fontes, web, usouWeb }). achados: os trechos do acervo que a
// busca no aparelho achou ({ titulo, caminho, texto, id, tipo, nota }); anexos: [{ nome, tipo, dados (base64), texto? }]
export async function responderNoAparelho({ pergunta, historico = [], contexto = '', voz = false, genero = 'feminina', anexos = [], achados = [] }, chamar, estado = {}) {
  pergunta = String(pergunta || '').trim().slice(0, 1000);
  if (!pergunta) throw new Error('escreva a pergunta');
  const usados = trechosQueImportam(achados);
  const mensagens = historico.slice(-6).filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  mensagens.push({ role: 'user', content: montarPergunta(pergunta, usados, String(contexto || '').slice(0, 20000)) });
  const arquivos = anexos.slice(0, 3).map(arquivoParaOGemini);
  const sistema = SISTEMA + sistemaDoGenero(genero) + (voz ? SISTEMA_VOZ : '') + (arquivos.length ? SISTEMA_ANEXO : '');
  const dados = await chamarGemini(chamar, corpoDoGemini(mensagens, sistema, arquivos), estado);
  const { texto, web, usouWeb } = lerRespostaGemini(dados);
  if (!texto) throw new ErroGemini(502, 'a IA não mandou resposta');
  const citados = new Set([...texto.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])));
  const fontes = usados.map((t, k) => ({ n: k + 1, titulo: t.titulo, caminho: t.caminho, id: t.id, tipo: t.tipo })).filter((f) => citados.has(f.n));
  return { resposta: texto, fontes, web, usouWeb };
}

// o Gemini lê PDF, foto, vídeo e áudio inteiros; o texto vai como texto; o resto (o Word) vai com o texto que o app
// conseguiu tirar (a.texto) ou só com o nome
const LE_INTEIRO = /^(image|video|audio)\/|^application\/pdf$/;
export function arquivoParaOGemini(a) {
  if (a.texto != null) return { nome: a.nome, tipo: a.tipo, texto: a.texto };
  if (LE_INTEIRO.test(a.tipo || '')) return { nome: a.nome, tipo: a.tipo, dados: a.dados };
  if (TEXTO_DE_ANEXO.test(a.tipo || '') || TEXTO_DE_ANEXO.test(a.nome || '')) return { nome: a.nome, tipo: a.tipo, texto: textoDeBase64(a.dados) };
  return { nome: a.nome, tipo: a.tipo, texto: '(não consegui ler o texto deste arquivo aqui no celular)' };
}

function textoDeBase64(b64) {
  try {
    const bin = atob(String(b64 || ''));
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  } catch { return ''; }
}
