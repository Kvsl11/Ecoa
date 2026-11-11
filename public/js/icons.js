// Ícones SVG em traço (24x24), herdam a cor do texto.
const P = {
  // mudar de posição (o ≡ das filas): três tracinhos curtos
  reordenar: '<path d="M7 8.5h10M7 12h10M7 15.5h10"/>',
  // a ordem da biblioteca (as duas setas, para cima e para baixo) e o "ver em lista" (os tracinhos com bolinhas)
  // o Mix da playlist (as músicas se emendam): duas ondas que se cruzam
  mix: '<path d="M3 17c4 0 5-10 9-10s5 10 9 10M3 7c4 0 5 10 9 10s5-10 9-10"/>',
  ordenar: '<path d="M7.5 20V4M3.5 8l4-4 4 4M16.5 4v16M12.5 16l4 4 4-4"/>',
  emLista: '<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4" cy="6" r="1.3" fill="currentColor"/><circle cx="4" cy="12" r="1.3" fill="currentColor"/><circle cx="4" cy="18" r="1.3" fill="currentColor"/>',
  grip: '<circle cx="9" cy="6" r="1.4" fill="currentColor"/><circle cx="15" cy="6" r="1.4" fill="currentColor"/><circle cx="9" cy="12" r="1.4" fill="currentColor"/><circle cx="15" cy="12" r="1.4" fill="currentColor"/><circle cx="9" cy="18" r="1.4" fill="currentColor"/><circle cx="15" cy="18" r="1.4" fill="currentColor"/>',
  // aleatório, repetir, voltar, pular, play e pause no desenho do Spotify (as setas cruzadas, o laço arredondado, os
  // triângulos cheios com a barra)
  shuffle: '<path d="M2.5 6.5h2.8c1.9 0 3.6.9 4.6 2.5l4.2 6.4c1 1.6 2.7 2.6 4.6 2.6h2.3"/><path d="M2.5 17.5h2.8c1.9 0 3.6-.9 4.6-2.5l.3-.5"/><path d="M13.8 9.5l.3-.5c1-1.6 2.7-2.5 4.6-2.5h2.3"/><path d="M18.5 3.5l3 3-3 3"/><path d="M18.5 15l3 3-3 3"/>',
  repeat: '<path d="M6 17.5H5.5a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3h13a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-6"/><path d="M15 14.5l-3 3 3 3"/>',
  skipBack: '<rect x="4" y="4" width="2.8" height="16" rx="1" fill="currentColor" stroke="none"/><path d="M20 4.8v14.4a1 1 0 0 1-1.55.83L8.9 12.83a1 1 0 0 1 0-1.66l9.55-7.2A1 1 0 0 1 20 4.8z" fill="currentColor" stroke="none"/>',
  skipFwd: '<rect x="17.2" y="4" width="2.8" height="16" rx="1" fill="currentColor" stroke="none"/><path d="M4 4.8v14.4a1 1 0 0 0 1.55.83l9.55-7.2a1 1 0 0 0 0-1.66L5.55 3.97A1 1 0 0 0 4 4.8z" fill="currentColor" stroke="none"/>',
  // a fila (como a do Spotify: a música de agora num quadro e as próximas embaixo)
  queue: '<rect x="3" y="3.5" width="18" height="6.5" rx="1.6"/><path d="M3 15h18M3 20h18"/>',
  shrink: '<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  share: '<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.7l7.4-4.3M8.3 13.3l7.4 4.3"/>',
  // ouvir em outro aparelho (como o do Spotify): o celular atrás, só a borda da esquerda e um tracinho embaixo, e a caixa
  // de som na frente, com o alto-falante grande e o pequeno, separada do celular por um vão
  aparelhos: '<path d="M9 4H5A1.5 1.5 0 0 0 3.5 5.5v8A1.5 1.5 0 0 0 5 15h4"/><path d="M5.5 19h2"/><rect x="12.5" y="3" width="8.5" height="18" rx="2"/><circle cx="16.75" cy="14.5" r="2.5"/><circle cx="16.75" cy="7.8" r="1.1"/>',
  maisCirculo: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  menosCirculo: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
  pessoa: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  // sair da conta: a porta aberta com a flecha saindo (o ícone padrão de "logout")
  sair: '<path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21H14"/><path d="M17 16l4-4-4-4"/><path d="M21 12H10"/>',
  // sincronizar com a conta: as duas setas em volta
  sincronizar: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 3.5V8h4.5"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 20.5V16h-4.5"/>',
  // compartilhar o app: a seta saindo da caixa
  enviarApp: '<path d="M12 15V3"/><path d="M7.5 7.5L12 3l4.5 4.5"/><path d="M8 10H6.5A1.5 1.5 0 0 0 5 11.5v8A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-8a1.5 1.5 0 0 0-1.5-1.5H16"/>',
  // o artista sem foto (como o do Spotify): a pessoa, com a nota musical no lugar do ombro direito
  artistaSemFoto: '<path d="M8.4 12.6a4.3 4.3 0 1 1 5.6-.2"/><path d="M8.4 12.6C5.4 13.5 3.3 15.6 3.3 18.3V20h9.4"/><path d="M14 12.4l1.9 1"/><path d="M19.9 11.6v7.4"/><circle cx="17.8" cy="19" r="2.1"/>',
  imagem: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  celular: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18h2"/>',
  computador: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/>',
  tablet: '<rect x="4" y="2.5" width="16" height="19" rx="2"/><path d="M11 18.5h2"/>',
  tv: '<rect x="2.5" y="5" width="19" height="12" rx="1.5"/><path d="M8 21h8M2.5 14.5a6 6 0 0 1 4 3M2.5 11.5a9 9 0 0 1 7 6"/>',
  bluetooth: '<path d="M7 7l10 10-5 4V3l5 4L7 17"/>',
  // o fone (como o do Spotify): o arco por cima e as duas conchas arredondadas
  fone: '<path d="M3.5 17v-4.5a8.5 8.5 0 0 1 17 0V17"/><path d="M3.5 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2zM20.5 15a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2z"/>',
  // o painel ao lado (o "Tocando agora" do Spotify: o quadro com a coluna e a setinha)
  sidebar: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M9 4v16"/><path d="M15.5 9.5L13 12l2.5 2.5"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.6 0-.9-.7-1.4-.7-2.3 0-1 .8-1.6 1.8-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor"/><circle cx="10.5" cy="7.5" r="1.2" fill="currentColor"/><circle cx="15" cy="7.5" r="1.2" fill="currentColor"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-2"/>',
  redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h2"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  home: '<path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  library: '<path d="M4 3v18M9 3v18"/><path d="M14 4l5 16"/>',
  external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14L21 3"/>',
  video: '<rect x="2" y="5" width="15" height="14" rx="2"/><path d="M17 10l5-3v10l-5-3z"/>',
  // o vídeo da segunda linha das fichas (como o do Spotify: um quadro com o play dentro)
  videoclipe: '<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M10 9.2v5.6l4.6-2.8z" fill="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
  lumen: '<path d="M7.25 3A2.25 2.25 0 0 1 9.5 5.25V15.5H17.25A2.25 2.25 0 0 1 17.25 20H7.25A2.25 2.25 0 0 1 5 17.75V5.25A2.25 2.25 0 0 1 7.25 3Z" fill="currentColor" stroke="none"/><path d="M15.75 2.5C16.05 5.8 17.45 7.2 20.75 7.5 17.45 7.8 16.05 9.2 15.75 12.5 15.45 9.2 14.05 7.8 10.75 7.5 14.05 7.2 15.45 5.8 15.75 2.5Z" fill="currentColor" stroke="none"/>',
  onda: '<path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4"/>',
  enviar: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5"/>',
  legenda: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 11h4M13 11h4M7 15h7M16 15h1"/>',
  legendaOff: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 11h4M13 11h4M7 15h7M16 15h1"/><path d="M3 3l18 18"/>',
  more: '<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>',
  maisEmPe: '<circle cx="12" cy="5" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="19" r="1.6" fill="currentColor"/>',
  // o desenho de um acorde: o braço do violão de frente (pestana em cima, 4 cordas, 3 casas) com dois dedos
  diagrama: '<path d="M4 4.5h16" stroke-width="2.6"/><path d="M4 4.5V20M7.2 4.5V20M10.4 4.5V20M13.6 4.5V20M16.8 4.5V20M20 4.5V20M4 9.67h16M4 14.83h16M4 20h16" stroke-width="1.2"/><circle cx="16.8" cy="7.1" r="1.75" fill="currentColor" stroke="none"/><circle cx="10.4" cy="12.25" r="1.75" fill="currentColor" stroke="none"/><circle cx="13.6" cy="12.25" r="1.75" fill="currentColor" stroke="none"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  rows: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  // as Estatísticas (a linha que sobe nos eixos), os Recentes (o relógio com a seta de voltar) e as Novidades (o megafone)
  grafico: '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-6"/>',
  historico: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
  megafone: '<path d="M3 10v4a1 1 0 0 0 1 1h3l6 4V5L7 9H4a1 1 0 0 0-1 1z"/><path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  disc: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
  cross: '<path d="M12 2v20M6 8h12"/>',
  // os momentos da missa (nas capas dos cantos que não têm capa): a porta da entrada, o coração do ato penitencial, a
  // estrela do Glória, a lira do salmo, o cálice das oferendas e a hóstia sobre o cálice da comunhão
  porta: '<path d="M5 21V10a7 7 0 0 1 14 0v11"/><path d="M3 21h18"/><path d="M12 3.5V21"/>',
  fixado: '<path d="M14.6 3.2l6.2 6.2-2.4 1.2-3.7 3.7.3 4.6-1.6 1.6-4-4-4.9 4.9-1.2-1.2 4.9-4.9-4-4 1.6-1.6 4.6.3 3.7-3.7z" fill="currentColor" stroke="none"/>',
  coracao: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.1a4.2 4.2 0 0 1 7.5 2.7C19.5 15.4 12 20 12 20z"/>',
  estrela: '<path d="M12 3l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.6l-5.3 2.9 1.1-6-4.4-4.2 6-.8z"/>',
  lira: '<path d="M7.5 3.5C5 6.5 5 12.5 7.5 16.5h9c2.5-4 2.5-10 0-13"/><path d="M10 6.5v10M14 6.5v10"/><path d="M12 16.5V21M8.5 21h7"/>',
  calice: '<path d="M7 3h10l-.7 5.4A4.4 4.4 0 0 1 12 12.3a4.4 4.4 0 0 1-4.3-3.9z"/><path d="M12 12.3V19M8.5 21h7"/>',
  hostia: '<circle cx="12" cy="5.8" r="3"/><path d="M8 11h8l-.6 3.2A3.5 3.5 0 0 1 12 17a3.5 3.5 0 0 1-3.4-2.8z"/><path d="M12 17v2.5M9.5 21h5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  next: '<path d="M9 18l6-6-6-6"/>',
  up: '<path d="M18 15l-6-6-6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/>',
  // baixar para ouvir sem internet (como no Spotify): a seta no círculo; baixada, o círculo cheio
  baixar: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7.5v8.5M8.2 12.4l3.8 3.8 3.8-3.8"/>',
  baixada: '<circle cx="12" cy="12" r="10.5" fill="currentColor" stroke="none"/><path d="M12 7.5v8.5M8.2 12.4l3.8 3.8 3.8-3.8" style="stroke: var(--on-accent, #000)" stroke-width="2.4"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
  trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  expand: '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
  // (o triângulo um pouco à direita do meio, como no Spotify: centrado pelo "peso" ele parecia torto para a direita)
  play: '<path d="M5.8 4.6v14.8a1.1 1.1 0 0 0 1.66.94l12.2-7.4a1.1 1.1 0 0 0 0-1.88L7.46 3.66A1.1 1.1 0 0 0 5.8 4.6z" fill="currentColor" stroke="none"/>',
  pause: '<rect x="5.5" y="3.5" width="4.4" height="17" rx="1.2" fill="currentColor" stroke="none"/><rect x="14.1" y="3.5" width="4.4" height="17" rx="1.2" fill="currentColor" stroke="none"/>',
  som: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19.5 5.5a9 9 0 0 1 0 13"/>',
  mudo: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9.5l5 5M22 9.5l-5 5"/>',
  columns: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/>',
  chord: '<path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/>',
  text: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  // violão em traço (como o símbolo do Cifra Club), na cor do app
  violao: '<path d="M13.2 9.4c-1.6-1.3-3.8-1.4-5 0-.8.9-.9 2-1.9 2.6-1 .6-2.4.4-3.4 1.6-1.9 2.2-1.2 5.8 1.2 7.9 2.1 2.4 5.7 3.1 7.9 1.2 1.2-1 1-2.4 1.6-3.4.6-1 1.7-1.1 2.6-1.9 1.4-1.2 1.3-3.4 0-5"/><circle cx="9.2" cy="15.4" r="2.1"/><path d="M11.6 12.9 20.6 3.9M13.4 14.7 22.2 5.9"/>',
  book: '<path d="M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2zM22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z"/>',
  youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z" fill="currentColor"/>',
  score: '<path d="M3 6h18M3 10h18M3 14h18M3 18h18" opacity=".45"/><path d="M14 16V5l5 1.5"/><ellipse cx="11.5" cy="16.5" rx="2.6" ry="2" fill="currentColor" transform="rotate(-20 11.5 16.5)"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  // os destinos do compartilhamento da música: o balão do WhatsApp e a câmera do Instagram
  whatsapp: '<path d="M3.5 20.5l1.3-4.4A8.5 8.5 0 1 1 8 19.3z"/><path d="M9 8.7c0 3.2 2.6 5.8 5.8 5.8l1.3-1.6-2-1-1 .9c-.9-.4-1.6-1.1-2-2l.9-1-1-2z"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.2 6.8h.01"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  // os ícones dos Ajustes: o backup (a caixa de arquivo), o avançado (a chave de boca), as permissões (o escudo com o
  // visto), a apresentação (o quadro), a sessão privada (o olho riscado) e a economia de dados (a folha)
  backup: '<rect x="2.5" y="3.5" width="19" height="5" rx="1"/><path d="M4.5 8.5V19a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V8.5"/><path d="M10 12.5h4"/>',
  ferramenta: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
  escudo: '<path d="M12 21.5s7.5-3.6 7.5-9.5V5.5L12 2.5l-7.5 3V12c0 5.9 7.5 9.5 7.5 9.5z"/><path d="M8.8 11.8l2.3 2.3 4.2-4.2"/>',
  apresentacao: '<path d="M2 3.5h20"/><path d="M20.5 3.5V14a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 14V3.5"/><path d="M7.5 21l4.5-5.5 4.5 5.5"/>',
  privada: '<path d="M9.9 4.2A10.4 10.4 0 0 1 12 4c6.5 0 10 8 10 8a17.6 17.6 0 0 1-2.2 3.2"/><path d="M6.6 6.6C3.9 8.4 2 12 2 12s3.5 8 10 8a10.6 10.6 0 0 0 5.4-1.6"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/><path d="M3 3l18 18"/>',
  folha: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.7-4 3-9 3s-9-1.3-9-3M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  alerta: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  capo: '<path d="M4 8h16M4 16h16M8 4v16"/>',
  gauge: '<path d="M12 14l4-4"/><path d="M3.3 19a10 10 0 1 1 17.4 0"/>',
};

// Ícones do menu no estilo Spotify (desenhos próprios): contorno quando normal, preenchido na aba selecionada.
const CASA = 'M12 2.8 2.9 10.1a1.2 1.2 0 0 0-.4.9v9.8c0 .7.5 1.2 1.2 1.2H9V15.5c0-.4.3-.7.7-.7h4.6c.4 0 .7.3.7.7V22h5.3c.7 0 1.2-.5 1.2-1.2V11a1.2 1.2 0 0 0-.4-.9z';
const CRUZ = 'M10.6 2h2.8c.5 0 .8.4.8.8V7h3.9c.5 0 .8.4.8.8v2.4c0 .5-.4.8-.8.8h-3.9v10.2c0 .5-.4.8-.8.8h-2.8c-.5 0-.8-.4-.8-.8V11H5.9c-.5 0-.8-.4-.8-.8V7.8c0-.5.4-.8.8-.8h3.9V2.8c0-.5.4-.8.8-.8z';
const LIVRO = 'M12 6.2C10.3 4.8 7.6 4 3.8 4H2.5v15.5h1.3c3.6 0 6.3.8 8.2 2.3 1.9-1.5 4.6-2.3 8.2-2.3h1.3V4h-1.3c-3.8 0-6.5.8-8.2 2.2z';
const MENU = {
  home: { off: `<path d="${CASA}" stroke-width="1.9"/>`, on: `<path d="${CASA}" fill="currentColor" stroke-width="1.2"/>` },
  search: {
    off: '<circle cx="10.5" cy="10.5" r="7.2" stroke-width="2"/><path d="m16 16 5.5 5.5" stroke-width="2"/>',
    on: '<circle cx="10.5" cy="10.5" r="7" stroke-width="3.4"/><path d="m16 16 5.3 5.3" stroke-width="3.4"/>',
  },
  library: {
    off: '<path d="M3.5 3v18M8.5 3v18" stroke-width="2"/><rect x="13.2" y="3.2" width="4.6" height="17.8" rx="1" transform="rotate(-14 15.5 12.1)" stroke-width="1.9"/>',
    on: '<rect x="2.4" y="2.5" width="2.6" height="19" rx="1" fill="currentColor" stroke="none"/><rect x="7.2" y="2.5" width="2.6" height="19" rx="1" fill="currentColor" stroke="none"/><rect x="13" y="3" width="5" height="18.2" rx="1" transform="rotate(-14 15.5 12.1)" fill="currentColor" stroke="none"/>',
  },
  partitura: {
    off: '<ellipse cx="8" cy="17.5" rx="4.2" ry="3.2" transform="rotate(-20 8 17.5)" stroke-width="1.9"/><path d="M12 16.5V3.2c2.6 1.4 6.5 2.7 6.5 7.3" stroke-width="1.9"/>',
    on: '<ellipse cx="8" cy="17.5" rx="4.2" ry="3.2" transform="rotate(-20 8 17.5)" fill="currentColor" stroke-width="1.6"/><path d="M12 16.5V3.2c2.6 1.4 6.5 2.7 6.5 7.3" stroke-width="2.8"/>',
  },
  cross: { off: `<path d="${CRUZ}" stroke-width="1.8"/>`, on: `<path d="${CRUZ}" fill="currentColor" stroke-width="1"/>` },
  book: { off: `<path d="${LIVRO}" stroke-width="1.9"/><path d="M12 6.2v15.6" stroke-width="1.9"/>`, on: `<path d="${LIVRO}" fill="currentColor" stroke-width="1.2"/><path d="M12 7v14" stroke="var(--bg, #121212)" stroke-width="1.4"/>` },
};
const svgMenu = (conteudo, size) => `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${conteudo}</svg>`;
export function iconeMenu(name, size = 24) {
  const m = MENU[name];
  return m ? `<span class="ic-off">${svgMenu(m.off, size)}</span><span class="ic-on">${svgMenu(m.on, size)}</span>` : icon(name, size);
}

export function icon(name, size = 20, extra = '') {
  return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${P[name] || ''}</svg>`;
}

// Logo do Lumen (o assistente litúrgico): o monograma L, arredondado, com a estrela de luz (lumen = luz, em latim)
// no canto livre, ao lado da haste, no degradê azul → roxo → rosa → dourado; a estrela tem o centro aceso. O mesmo
// desenho em public/lumen.svg.
let nLumen = 0;
export function logoLumen(size = 32) {
  const id = 'gm' + ++nLumen;
  // Símbolo em estrela multicolorida para identificar visualmente a integração Gemini.
  return `<svg class="logo-lumen logo-gemini" width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true">
    <defs><linearGradient id="${id}g" x1="7" y1="4" x2="41" y2="44" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#4285f4"/><stop offset=".34" stop-color="#9b72cb"/><stop offset=".68" stop-color="#d96570"/><stop offset="1" stop-color="#f9ab00"/>
    </linearGradient></defs>
    <path fill="url(#${id}g)" d="M24 2.5C26.7 14.1 31.1 18.1 45.5 24 31.1 29.9 26.7 33.9 24 45.5 21.3 33.9 16.9 29.9 2.5 24 16.9 18.1 21.3 14.1 24 2.5Z"/>
  </svg>`;
}

// Logo do Ecoa: um "e" redondo com duas ondas de eco saindo dele (o som que ecoa), em branco sobre o degradê
// ciano → azul do app. O mesmo desenho em public/icon.svg (e nos PNGs gerados a partir dele).
let nLogo = 0;
export function logo(size = 32) {
  const id = 'ec' + ++nLogo;
  return `<svg class="logo" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
  <defs><linearGradient id="${id}" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#22d3ee"/><stop offset=".55" stop-color="#0891b2"/><stop offset="1" stop-color="#1e3a8a"/></linearGradient></defs>
  <rect width="64" height="64" rx="15" fill="url(#${id})"/>
  <g fill="none" stroke="#fff" stroke-linecap="round">
    <path d="M14.5 32H39.5A12.5 12.5 0 1 0 36.29 40.36" stroke-width="6.4"/>
    <path d="M43.15 19.38A20.5 20.5 0 0 1 43.15 44.62" stroke-width="4.2" opacity=".7"/>
    <path d="M50.75 17.16A28 28 0 0 1 50.75 46.84" stroke-width="3.6" opacity=".38"/>
  </g>
  </svg>`;
}

// Símbolo no estilo do Cifra Club (violão branco saindo pelas bordas), na cor de destaque do app
let nCc = 0;
export function logoCifraClub(size = 48) {
  const id = 'cc' + ++nCc;
  return `<svg class="logo-cc" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
    <defs><clipPath id="${id}r"><rect width="64" height="64" rx="15"/></clipPath>
      <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent-deep)"/></linearGradient></defs>
    <g clip-path="url(#${id}r)"><rect width="64" height="64" fill="url(#${id}g)"/>
      <g fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M-6 37c9 0 11-9 16-14 5-5 13-5 17 0 3 4 2 8 6 11s9 3 11 8c2 5-2 10-7 13-5 3-8 3-10 8-2 4-3 7-4 10"/>
        <circle cx="24" cy="41" r="6.5"/>
        <path d="M28.5 34.5 60 3M33 39 64 8"/></g></g></svg>`;
}
