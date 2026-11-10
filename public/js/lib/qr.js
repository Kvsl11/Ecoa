// Código QR do convite do Ecoa (o endereço de download, para apontar a câmera). Sem dependências e sem DOM: devolve
// a matriz de módulos (true = escuro), e quem desenha é a tela.
// Cobre o que o convite precisa: modo byte, correção de erros L, versões 1 a 5 (até 106 bytes, um bloco só).
const DADOS = [19, 34, 55, 80, 108]; // palavras de dados por versão (nível L)
const CORRECAO = [7, 10, 15, 20, 26]; // palavras de correção por versão (nível L)

// o corpo de Galois GF(256) do QR (polinômio 0x11D)
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
for (let i = 0, x = 1; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
const vezes = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);

// as palavras de correção (Reed-Solomon) de um bloco
export function reedSolomon(dados, n) {
  const g = new Uint8Array(n); // o polinômio gerador, sem o termo de maior grau
  g[n - 1] = 1;
  for (let i = 0, raiz = 1; i < n; i++) {
    for (let j = 0; j < n; j++) { g[j] = vezes(g[j], raiz); if (j + 1 < n) g[j] ^= g[j + 1]; }
    raiz = vezes(raiz, 2);
  }
  const r = new Uint8Array(n);
  for (const b of dados) {
    const f = b ^ r[0];
    r.copyWithin(0, 1); r[n - 1] = 0;
    for (let j = 0; j < n; j++) r[j] ^= vezes(g[j], f);
  }
  return r;
}

const MASCARAS = [
  (x, y) => (x + y) % 2 === 0,
  (x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

// a nota de uma máscara (as 4 regras da norma): quanto menor, mais fácil de ler
function penalidade(m) {
  const n = m.length;
  let p = 0;
  const linha = (pega) => {
    let s = '';
    let cor = null; let seguidos = 0;
    for (let i = 0; i < n; i++) {
      const v = pega(i);
      s += v ? '1' : '0';
      if (v === cor) { seguidos++; if (seguidos === 5) p += 3; else if (seguidos > 5) p++; } else { cor = v; seguidos = 1; }
    }
    for (const padrao of ['10111010000', '00001011101']) for (let i = s.indexOf(padrao); i >= 0; i = s.indexOf(padrao, i + 1)) p += 40;
  };
  for (let a = 0; a < n; a++) { linha((i) => m[a][i]); linha((i) => m[i][a]); }
  let escuros = 0;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (m[y][x]) escuros++;
    if (x + 1 < n && y + 1 < n && m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) p += 3;
  }
  return p + Math.floor(Math.abs((escuros * 20) / (n * n) - 10)) * 10;
}

// a matriz do código QR do texto: linhas de booleanos (true = módulo escuro), sem a margem em volta
export function codigoQR(texto) {
  const bytes = [...new TextEncoder().encode(String(texto))];
  const versao = DADOS.findIndex((cabem) => bytes.length + 2 <= cabem) + 1;
  if (!versao) throw new Error('Texto longo demais para o código QR do convite.');
  const total = DADOS[versao - 1];

  // os dados: o modo (byte), o tamanho, os bytes, o fim e o enchimento
  const bits = [];
  const por = (valor, quantos) => { for (let i = quantos - 1; i >= 0; i--) bits.push((valor >>> i) & 1); };
  por(4, 4); por(bytes.length, 8);
  bytes.forEach((b) => por(b, 8));
  por(0, Math.min(4, total * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const dados = [];
  for (let i = 0; i < bits.length; i += 8) dados.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));
  for (let enche = 0xec; dados.length < total; enche ^= 0xec ^ 0x11) dados.push(enche);
  const palavras = [...dados, ...reedSolomon(dados, CORRECAO[versao - 1])];

  // os módulos fixos: os três cantos, as linhas de tempo, o alinhamento e o lugar do formato
  const n = 17 + 4 * versao;
  const m = Array.from({ length: n }, () => Array(n).fill(false));
  const fixo = Array.from({ length: n }, () => Array(n).fill(false));
  const fixar = (x, y, escuro) => { if (x >= 0 && y >= 0 && x < n && y < n) { m[y][x] = escuro; fixo[y][x] = true; } };
  for (let i = 0; i < n; i++) { fixar(i, 6, i % 2 === 0); fixar(6, i, i % 2 === 0); }
  for (const [cx, cy] of [[3, 3], [n - 4, 3], [3, n - 4]]) {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const d = Math.max(Math.abs(dx), Math.abs(dy));
      fixar(cx + dx, cy + dy, d !== 2 && d !== 4);
    }
  }
  if (versao > 1) {
    const c = n - 7;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) fixar(c + dx, c + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }
  const formato = (mascara) => {
    const d = (1 << 3) | mascara; // nível L
    let r = d;
    for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
    const f = ((d << 10) | r) ^ 0x5412;
    const bit = (i) => ((f >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i++) fixar(8, i, bit(i));
    fixar(8, 7, bit(6)); fixar(8, 8, bit(7)); fixar(7, 8, bit(8));
    for (let i = 9; i < 15; i++) fixar(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) fixar(n - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) fixar(8, n - 15 + i, bit(i));
    fixar(8, n - 8, true);
  };
  formato(0); // (reserva o lugar; o valor certo entra com a máscara escolhida)

  // as palavras em zigue-zague, de baixo para cima, a partir do canto de baixo à direita
  let i = 0;
  for (let direita = n - 1; direita >= 1; direita -= 2) {
    if (direita === 6) direita = 5;
    for (let v = 0; v < n; v++) for (let j = 0; j < 2; j++) {
      const x = direita - j;
      const y = ((direita + 1) & 2) === 0 ? n - 1 - v : v;
      if (!fixo[y][x] && i < palavras.length * 8) { m[y][x] = ((palavras[i >>> 3] >>> (7 - (i & 7))) & 1) === 1; i++; }
    }
  }

  // a máscara que deixa o código mais fácil de ler
  const mascarar = (k) => { for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!fixo[y][x] && MASCARAS[k](x, y)) m[y][x] = !m[y][x]; };
  let melhor = 0; let menor = Infinity;
  for (let k = 0; k < 8; k++) {
    mascarar(k); formato(k);
    const p = penalidade(m);
    if (p < menor) { menor = p; melhor = k; }
    mascarar(k); // (a máscara é um ou-exclusivo: aplicar de novo desfaz)
  }
  mascarar(melhor); formato(melhor);
  return m;
}
