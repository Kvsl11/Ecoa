// O que a pessoa ouviu, dia a dia: a base das Estatísticas (minutos ouvidos, artistas e músicas mais ouvidos) e dos
// Recentes (agrupados por dia). Fica só neste aparelho. Funções puras: o app guarda o registro e chama estas contas.
//
// registro: { 'AAAA-MM-DD': { [chave]: { tipo: 'musica' | 'repertorio', id, t, a, c, s, m, u } } }
//   chave: 'm:<id da música>' ou 'r:<id do repertório>' (as músicas tocadas pelo repertório ficam juntas nele)
//   t: título, a: artista, c: capa, s: segundos ouvidos, m: { [id da música]: { t, a, c, s } }, u: quando tocou por último
export const DIAS_GUARDADOS = 400;

// soma os segundos ouvidos de uma música no dia (e cria a linha dela, com 0 segundos, quando ela começa a tocar)
export function registrar(registro, dia, item, segundos = 0, agora = Date.now()) {
  if (!item?.titulo) return registro;
  const musica = item.songId || `t:${item.titulo}|${item.artista || ''}`;
  const tipo = item.setId ? 'repertorio' : 'musica';
  const chave = item.setId ? `r:${item.setId}` : `m:${musica}`;
  const doDia = (registro[dia] ||= {});
  const linha = (doDia[chave] ||= { tipo, id: item.setId || item.songId || '', t: item.setId ? item.repertorio || 'Repertório' : item.titulo, a: item.setId ? '' : item.artista || '', c: item.capa || '', s: 0, m: {} });
  if (item.setId && item.repertorio) linha.t = item.repertorio;
  const m = (linha.m[musica] ||= { t: item.titulo, a: item.artista || '', c: item.capa || '', s: 0 });
  if (item.capa) { m.c = item.capa; if (!item.setId || !linha.c) linha.c = item.capa; }
  m.s += segundos;
  linha.s += segundos;
  linha.u = agora;
  return registro;
}

// tira os dias mais antigos
export function podar(registro, hoje, dias = DIAS_GUARDADOS) {
  const limite = somarDias(hoje, -dias);
  for (const d of Object.keys(registro)) if (d < limite) delete registro[d];
  return registro;
}

export function somarDias(iso, n) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// a semana (de domingo a sábado) em que o dia está
export function semanaDe(iso) {
  const dow = new Date(`${iso}T12:00:00Z`).getUTCDay();
  const inicio = somarDias(iso, -dow);
  return { inicio, fim: somarDias(inicio, 6) };
}

// "2–8 de nov." (ou "26 de out. – 1 de nov." quando passa de um mês para o outro)
const MESES = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
export const MESES_EXTENSO = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export function rotuloDoPeriodo({ inicio, fim }) {
  const [, m1, d1] = inicio.split('-').map(Number);
  const [, m2, d2] = fim.split('-').map(Number);
  return m1 === m2 ? `${d1}–${d2} de ${MESES[m1 - 1]}` : `${d1} de ${MESES[m1 - 1]} – ${d2} de ${MESES[m2 - 1]}`;
}

// as músicas ouvidas no período (de inicio a fim, inclusive), cada uma com os segundos somados
function musicasDoPeriodo(registro, { inicio, fim }) {
  const porMusica = new Map();
  for (const [dia, linhas] of Object.entries(registro)) {
    if (dia < inicio || dia > fim) continue;
    for (const linha of Object.values(linhas)) {
      for (const [id, m] of Object.entries(linha.m || {})) {
        const x = porMusica.get(id) || { id: id.startsWith('t:') ? '' : id, t: m.t, a: m.a, c: m.c, s: 0 };
        x.s += m.s || 0;
        if (m.c) x.c = m.c;
        porMusica.set(id, x);
      }
    }
  }
  return [...porMusica.values()];
}

export const minutos = (segundos) => Math.floor((segundos || 0) / 60);

export function resumoDoPeriodo(registro, periodo) {
  const musicas = musicasDoPeriodo(registro, periodo).filter((m) => m.s > 0).sort((a, b) => b.s - a.s);
  const porArtista = new Map();
  for (const m of musicas) {
    if (!m.a) continue;
    const chave = m.a.toLocaleLowerCase('pt-BR');
    const x = porArtista.get(chave) || { nome: m.a, s: 0, musicas: [] };
    x.s += m.s;
    x.musicas.push(m);
    porArtista.set(chave, x);
  }
  const artistas = [...porArtista.values()].sort((a, b) => b.s - a.s);
  return { segundos: musicas.reduce((n, m) => n + m.s, 0), musicas, artistas };
}

// os segundos de cada dia do período (para o gráfico da semana)
export function segundosPorDia(registro, { inicio, fim }) {
  const dias = [];
  for (let d = inicio; d <= fim; d = somarDias(d, 1)) {
    dias.push({ dia: d, s: Object.values(registro[d] || {}).reduce((n, l) => n + (l.s || 0), 0) });
  }
  return dias;
}

// os meses já fechados com algo ouvido (o mais novo primeiro), com os minutos e a música mais ouvida
export function mesesFechados(registro, hoje, quantos = 6) {
  const mesAtual = hoje.slice(0, 7);
  const meses = [...new Set(Object.keys(registro).map((d) => d.slice(0, 7)))].filter((m) => m < mesAtual).sort().reverse();
  const saida = [];
  for (const mes of meses) {
    const r = resumoDoPeriodo(registro, { inicio: `${mes}-01`, fim: `${mes}-31` });
    if (r.segundos < 60) continue;
    saida.push({ mes, nome: MESES_EXTENSO[Number(mes.slice(5)) - 1], segundos: r.segundos, musica: r.musicas[0] || null, artista: r.artistas[0] || null });
    if (saida.length >= quantos) break;
  }
  return saida;
}

// os Recentes: os dias (o mais novo primeiro), cada um com o que tocou (o mais recente primeiro)
export function recentesPorDia(registro, { tipo = '' } = {}) {
  return Object.keys(registro).sort().reverse().map((dia) => ({
    dia,
    itens: Object.entries(registro[dia]).map(([chave, l]) => ({ chave, ...l, quantas: Object.keys(l.m || {}).length }))
      .filter((l) => !tipo || l.tipo === tipo).sort((a, b) => (b.u || 0) - (a.u || 0)),
  })).filter((d) => d.itens.length);
}

// "Hoje", "Ontem" ou "ter., 3 de nov. de 2026"
const SEMANA = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'];
export function rotuloDoDia(dia, hoje) {
  if (dia === hoje) return 'Hoje';
  if (dia === somarDias(hoje, -1)) return 'Ontem';
  const [a, m, d] = dia.split('-').map(Number);
  const dow = new Date(`${dia}T12:00:00Z`).getUTCDay();
  return `${SEMANA[dow]}, ${d} de ${MESES[m - 1]}${a === Number(hoje.slice(0, 4)) ? '' : ` de ${a}`}`;
}
