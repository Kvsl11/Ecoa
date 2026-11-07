// As faixas de um álbum do Cifra Club conferidas com as do mesmo álbum no Deezer.
//
// Em discos de versões (remixes e regravações com outro nome, como o Reanimation do Linkin Park), o Cifra Club lista a
// faixa com o nome da música original e liga ela à cifra da original: "My December" no lugar de "My<Dsmbr", "Points Of
// Authority" no lugar de "Pts.Of.Athrty", "Crawling" no lugar de "Krwlng". A faixa abria a cifra, a letra e o vídeo da
// música original, que é outra. O Deezer tem o nome de verdade: a faixa cujo nome lá é outro (o mesmo esqueleto, mas
// com outras letras, e não só outra pontuação) é uma versão, fica com o nome, o remixador e as participações do Deezer
// e é procurada por esse nome (sem a cifra da original).

// só as letras e os números, sem acento nem pontuação: "Nobody's Listening" e "Nobodys Listening" são o mesmo nome
const chave = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/æ/g, 'ae').replace(/[^a-z0-9]+/g, '');
// o nome sem o que vem entre parênteses ou colchetes (o remixador, o "feat.", a edição)
export const nomeSemExtras = (t) => String(t || '').replace(/\s*[([].*?[)\]]\s*/g, ' ').replace(/\s+/g, ' ').trim();

// O esqueleto do nome: as consoantes, na ordem, com a escrita "estilizada" desfeita (4 = for, 1 = one, 3 = e, @ = a,
// k = c…). "My<Dsmbr" e "My December" ficam quase iguais; "Krwlng" e "Crawling", iguais
const LEET = { 4: ' for ', 1: ' one ', 3: 'e', 0: 'o', 5: 's', 7: 't', '@': 'a', $: 's' };
export function esqueletoDoTitulo(t) {
  return nomeSemExtras(t).replace(/[413057@$]/g, (c) => LEET[c])
    .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/æ/g, 'ae')
    .replace(/ph/g, 'f').replace(/[kq]/g, 'c').replace(/z/g, 's')
    .replace(/[^a-z]/g, '').replace(/[aeiouy]/g, '').replace(/(.)\1+/g, '$1');
}

function distancia(a, b) {
  const linha = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let antes = linha[0];
    linha[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const guardado = linha[j];
      linha[j] = Math.min(linha[j] + 1, linha[j - 1] + 1, antes + (a[i - 1] === b[j - 1] ? 0 : 1));
      antes = guardado;
    }
  }
  return linha[b.length];
}
// 0 a 1: quanto os esqueletos dos dois nomes se parecem
export function semelhancaDosTitulos(a, b) {
  const x = esqueletoDoTitulo(a);
  const y = esqueletoDoTitulo(b);
  if (x.length < 3 || y.length < 3) return x === y && x ? 1 : 0;
  return 1 - distancia(x, y) / Math.max(x.length, y.length);
}

// as participações escritas no nome do Deezer: "My<Dsmbr (Mickey P. Reanimation) [feat. Kelli Ali]" → "Kelli Ali"
export const participacoesDoTitulo = (t) => (/[([]\s*(?:feat\.?|ft\.?|featuring)\s+([^)\]]+)[)\]]/i.exec(String(t || '')) || [])[1]?.trim() || '';
// o nome para mostrar: o do Deezer sem as participações (elas vão para o artista)
export const tituloSemParticipacoes = (t) => String(t || '').replace(/\s*[([]\s*(?:feat\.?|ft\.?|featuring)\s+[^)\]]+[)\]]/gi, '').replace(/\s+/g, ' ').trim();

// Para cada faixa do Cifra Club, null (o mesmo nome no Deezer) ou { titulo, participacoes } (outra versão, com o nome
// de verdade). Primeiro os nomes iguais; depois, das que sobram, a do Deezer com o esqueleto mais parecido (70% ou mais,
// e os mesmos números, quando os dois nomes têm números: "Part 1" não vira "Part 2")
// (a gravação ao vivo, a demo, o remix, a remasterizada… marcada no que vem entre parênteses ou depois do traço: é a
// mesma música com o mesmo nome, mas não é a faixa sem a marca — o Reanimation tem, no fim, "My December (Live …)", e
// a "My December" do Cifra Club é a "My<Dsmbr")
const MARCA = /\b(live|ao vivo|demo|remix|mix|acoustic|acustic[oa]|instrumental|karaoke|edit|version|versao|remaster(ed)?|mono|tour)\b/;
const extras = (t) => (String(t || '').match(/[([][^)\]]*[)\]]|\s[–—-]\s.*$/g) || []).join(' ');
const marcada = (t) => MARCA.test(extras(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase());
export function faixasPeloDeezer(faixas, titulosDeezer, { minimo = 0.7 } = {}) {
  const dz = (titulosDeezer || []).map((t, j) => ({ j, t, k: chave(nomeSemExtras(t)), marcada: marcada(t) })).filter((x) => x.k);
  const usados = new Set();
  const resultado = (faixas || []).map(() => null);
  const pendentes = [];
  (faixas || []).forEach((f, i) => {
    const k = chave(nomeSemExtras(f?.titulo));
    const comMarca = marcada(f?.titulo);
    const igual = k && dz.find((x) => !usados.has(x.j) && x.k === k && x.marcada === comMarca);
    if (igual) usados.add(igual.j);
    else if (k) pendentes.push(i);
  });
  const numeros = (t) => (nomeSemExtras(t).match(/\d+/g) || []).join(',');
  for (const i of pendentes) {
    const titulo = faixas[i].titulo;
    const k = chave(nomeSemExtras(titulo));
    let melhor = null;
    for (const x of dz) {
      // (a de mesmo nome com outra marca é a mesma música em outra gravação: não troca o nome por ela)
      if (usados.has(x.j) || x.k === k) continue;
      const a = numeros(titulo);
      const b = numeros(x.t);
      if (a && b && a !== b) continue;
      const s = semelhancaDosTitulos(titulo, x.t);
      if (s >= minimo && (!melhor || s > melhor.s)) melhor = { x, s };
    }
    if (!melhor) continue;
    usados.add(melhor.x.j);
    resultado[i] = { titulo: tituloSemParticipacoes(melhor.x.t), participacoes: participacoesDoTitulo(melhor.x.t) };
  }
  return resultado;
}
