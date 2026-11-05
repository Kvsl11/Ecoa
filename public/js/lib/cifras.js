// A cifra é da música? A busca do Cifra Club traz de tudo com o mesmo nome: a música certa, outra música com o mesmo
// título, a mesma música de outro artista com outra letra. A letra diz: a da cifra tem que ser a da música (a do Letras
// ou a do LRCLIB). Funções puras: o app traz as cifras e as letras e escolhe com estas contas.

const normal = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9\s]+/g, ' ');

// os pares de palavras seguidas da letra (sem as diretivas e os acordes do ChordPro, sem as palavras curtas)
function paresDePalavras(texto) {
  const linhas = String(texto || '').split('\n')
    .filter((l) => !/^\s*\{[^}]*\}\s*$/.test(l))
    .map((l) => normal(l.replace(/\[[^\]]*\]/g, '')).split(/\s+/).filter((p) => p.length >= 3));
  const pares = new Set();
  for (const ps of linhas) for (let i = 0; i + 1 < ps.length; i++) pares.add(`${ps[i]} ${ps[i + 1]}`);
  return pares;
}

// Quanto da letra da música está na letra da cifra (0 a 1), pelos pares de palavras seguidas: a ordem conta, e o
// refrão repetido não pesa mais. null quando uma das duas não tem letra bastante para comparar
export function parecencaDaLetra(cifra, letra) {
  const a = paresDePalavras(cifra);
  const b = paresDePalavras(letra);
  if (a.size < 6 || b.size < 6) return null;
  let comuns = 0;
  for (const p of b) if (a.has(p)) comuns++;
  return Math.round((comuns / Math.min(a.size, b.size)) * 100) / 100;
}

// Entre as cifras achadas ([{ ..., chordpro }]), a da música: a primeira cuja letra é a da música (≥ 0,5); sem
// nenhuma assim, a que mais parece, se passar de 0,3; sem a letra da música para comparar, a primeira. null: nenhuma
// é desta música (é melhor ficar só com a letra do que com a cifra de outra)
export function escolherCifra(cifras, letra) {
  const lista = (cifras || []).filter((c) => c?.chordpro);
  if (!lista.length) return null;
  if (!String(letra || '').trim()) return lista[0];
  let melhor = null;
  let nota = -1;
  for (const c of lista) {
    const p = parecencaDaLetra(c.chordpro, letra);
    if (p === null) continue;
    if (p >= 0.5) return c;
    if (p > nota) { nota = p; melhor = c; }
  }
  if (nota < 0) return lista[0]; // (nenhuma dava para comparar: fica a primeira, como antes)
  return nota >= 0.3 ? melhor : null;
}
