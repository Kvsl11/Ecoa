// Sincronia da biblioteca com a conta Google (Firestore): a parte que só faz contas, sem rede (testada no Node).
// Cada música, repertório e a lista das tocadas recentemente é um item ("m_<id>", "r_<id>", "recentes") guardado
// como texto JSON. O aparelho lembra o resumo (hash) de cada item como estava na última sincronia (a "base"): assim
// sabe o que mudou aqui, o que mudou na nuvem e o que foi apagado de um lado ou do outro.

// o que é só deste aparelho (os arquivos baixados, o áudio escolhido do celular, o karaokê feito aqui): não vai para a
// nuvem e, quando a música chega de outro aparelho, fica como estava aqui
export const LOCAIS = ['baixado', 'rebaixar', 'audioProprio', 'karaoke'];

export function semLocais(song) {
  const c = { ...song };
  for (const k of LOCAIS) delete c[k];
  return c;
}

// cyrb53: resumo de 53 bits do texto (rápido e sem colisões na prática para uma biblioteca)
export function hash(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

// os itens da biblioteca deste aparelho, como vão para a nuvem
export function itensLocais({ songs = [], sets = [], recent = [] }) {
  const m = new Map();
  for (const s of songs) m.set('m_' + s.id, JSON.stringify(semLocais(s)));
  for (const s of sets) m.set('r_' + s.id, JSON.stringify(s));
  m.set('recentes', JSON.stringify(recent || []));
  return m;
}

// locais: Map item -> JSON (o que está no aparelho); remotos: Map item -> JSON ou null (apagado) com o que mudou na
// nuvem desde a última vez; base: { item: hash } da última sincronia.
// Devolve o que aplicar no aparelho, o que subir para a nuvem (null = apagar lá) e a base nova.
// Quando o mesmo item mudou dos dois lados, fica a versão deste aparelho; o que foi apagado aqui mas mudou em outro
// aparelho volta (não se perde uma edição)
export function planejar(locais, remotos, base = {}) {
  const nova = { ...base };
  const aplicar = new Map();
  const subir = new Map();
  const resolvidas = new Set();
  for (const [k, r] of remotos) {
    const l = locais.has(k) ? locais.get(k) : null;
    const hl = l != null ? hash(l) : null;
    const hr = r != null ? hash(r) : null;
    if (hr === hl) { // já iguais (ou apagados dos dois lados)
      if (hr) nova[k] = hr; else delete nova[k];
      resolvidas.add(k);
      continue;
    }
    if (hr != null && hr === base[k]) continue; // a nuvem não mudou (é o que este aparelho mesmo mandou)
    const mudouAqui = l != null && hl !== base[k];
    if (mudouAqui) continue; // mudou dos dois lados: fica a deste aparelho (sobe abaixo)
    aplicar.set(k, r);
    if (hr) nova[k] = hr; else delete nova[k];
    resolvidas.add(k);
  }
  for (const [k, l] of locais) {
    if (resolvidas.has(k)) continue;
    const h = hash(l);
    if (h !== nova[k]) { subir.set(k, l); nova[k] = h; }
  }
  for (const k of Object.keys(nova)) {
    if (!locais.has(k) && !resolvidas.has(k)) { subir.set(k, null); delete nova[k]; }
  }
  return { aplicar, subir, base: nova };
}
