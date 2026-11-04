// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 482, data: '2026-11-04', titulo: 'A foto certa do artista',
    itens: [
      { tipo: 'correcao', texto: 'Alguns artistas apareciam com uma foto que não era deles. O Justice, por exemplo, vinha com uma estátua da Justiça. Quando não achava a foto em outro lugar, o app pegava a da página da Wikipédia com o mesmo nome, e "Justice" é a página do conceito de justiça. Agora só vale a página que é mesmo do artista, como "Justice (band)", e as fotos do "Sobre o artista" vêm dela. As músicas já salvas com a foto errada ganham a foto certa sozinhas.' },
    ],
  },
  {
    versao: 481, data: '2026-11-04', titulo: 'A letra sem atraso',
    itens: [
      { tipo: 'correcao', texto: 'Em algumas músicas, a letra sincronizada vinha uns segundos atrasada, como em "Club Tropicana" (Wham!), uns 4,5 s. O LRCLIB tem edições da mesma música feitas para gravações um pouco diferentes (o áudio oficial tem 266 s, e a maioria das edições, 268 a 270 s), e o app ficava com a mais repetida. Agora, assim que o app sabe a duração do áudio que toca, ele usa a edição feita para ela. As músicas já salvas são corrigidas sozinhas; a letra que você sincronizou à mão fica como está.' },
    ],
  },
  {
    versao: 480, data: '2026-11-04', titulo: 'A letra no tempo certo em mais músicas',
    itens: [
      { tipo: 'correcao', texto: 'Em algumas músicas, uma linha da letra sincronizada aparecia bem antes de ser cantada. Em "Club Tropicana" (Wham!), a primeira frase acendia uns 40 s antes da hora; em "Everything She Wants", o "Ah, ha-ha" e "Some people work for a living" chegavam adiantados. O LRCLIB tem várias edições da mesma letra, e as mais repetidas traziam essa linha errada. Agora o app compara as edições: a linha fora do lugar vai para onde as outras concordam que ela é cantada, sem precisar do servidor da IA.' },
      { tipo: 'correcao', texto: 'As músicas já salvas são corrigidas sozinhas, em segundo plano. A letra que você sincronizou à mão fica como está.' },
    ],
  },
  {
    versao: 479, data: '2026-11-04', titulo: 'O microfone do karaokê nas listas',
    itens: [
      { tipo: 'novo', texto: 'Nas listas de músicas (Músicas curtidas, a Biblioteca, os repertórios), o microfone com as estrelinhas aparece ao lado da setinha verde nas músicas que já têm o karaokê pronto no aparelho. Ele aparece assim que o karaokê fica pronto e some se você apagar o karaokê.' },
    ],
  },
  {
    versao: 478, data: '2026-11-04', titulo: 'O microfone do karaokê no ⋮',
    itens: [
      { tipo: 'melhoria', texto: 'No ⋮ do Tocando agora, a opção "Karaokê (tirar a voz)" agora tem o mesmo microfone com as estrelinhas do botão de karaokê da letra, em vez do microfone simples.' },
    ],
  },
  {
    versao: 477, data: '2026-11-04', titulo: 'Ícone de importar para cima',
    itens: [
      { tipo: 'melhoria', texto: 'O botão de importar da Busca (e o "Cole aqui", o "Colar copiado" e o "Trazer da internet" do editor) agora tem a seta para cima, como o importar da Biblioteca e dos Ajustes. Antes a seta apontava para baixo, como a de baixar.' },
    ],
  },
  {
    versao: 476, data: '2026-11-04', titulo: 'Servidor da IA mais claro',
    itens: [
      { tipo: 'melhoria', texto: 'A tela do Servidor da IA não fala mais em "sem a cota do mês" quando o Codespace está ligado: o app acha o Codespace sozinho, sem QR code, e o aviso de cota de antes some assim que ele responde.' },
    ],
  },
  {
    versao: 475, data: '2026-11-04', titulo: 'Codespace achado sozinho e letra no tempo certo',
    itens: [
      { tipo: 'correcao', texto: 'O app acha o Codespace sozinho, sem QR code: o endereço publicado no site e, se ele ainda não foi atualizado, o último Codespace que funcionou neste aparelho. Um endereço velho de QR code guardado não atrapalha mais (sai sozinho). E o Modal (a reserva) só é usado se responder de verdade: desativado por falta de crédito, o app continua tentando o Codespace, e o Servidor da IA, nos Ajustes, diz o que está acontecendo.' },
      { tipo: 'correcao', texto: 'Algumas músicas tinham a letra sincronizada fora do tempo, como "Club Tropicana" e "Everything She Wants" do Wham!. A letra vem do LRCLIB, que tem várias edições da mesma música com a mesma duração, mas com a primeira frase em tempos bem diferentes (em "Club Tropicana", de 10 s a 52 s), e o app escolhia uma pela duração. Agora, quando as edições discordam, o servidor da IA ouve o áudio e acerta a letra no ponto em que ela é cantada. As músicas já salvas são conferidas sozinhas (só as que estão nesse caso).' },
    ],
  },
  {
    versao: 474, data: '2026-11-04', titulo: 'Sem a linha no Tocando agora',
    itens: [
      { tipo: 'correcao', texto: 'A linha clara que ainda aparecia no degradê do Tocando agora, logo acima do cartão da letra, sumiu de vez (no celular e no tablet). Eram os quadros do clipe, no fundo, aparecendo por baixo do degradê bem na borda.' },
      { tipo: 'melhoria', texto: 'Trocar a capa: o contorno da capa escolhida aparece inteiro, e no tablet a tela sobe do rodapé, como os menus do ⋮, em vez de ficar flutuando.' },
    ],
  },
  {
    versao: 473, data: '2026-11-04', titulo: 'Ícones certos no ⋮ da música',
    itens: [
      { tipo: 'melhoria', texto: 'No ⋮ da música, cada opção tem o seu ícone: "Trocar música" com as setas de trocar, "Abrir a música" com a seta de abrir (antes as duas tinham a mesma nota musical) e "Criar partitura" com o ícone de partitura, a pauta com a nota (antes eram umas estrelinhas).' },
    ],
  },
];

// A primeira versão de cada mês. O número mostrado ("2026.10.31-383") é a data da versão e quantas versões o mês já
// teve: recomeça do 1 quando o mês vira. O número de verdade (o do sw.js, que atualiza o app) continua subindo sempre.
// Ao publicar a primeira versão de um mês novo, acrescente aqui o mês com o número dela (um teste confere).
// (outubro de 2026: o app começou nele, na versão 1; novembro começou na 384)
export const PRIMEIRA_DO_MES = { '2026-10': 1, '2026-11': 384 };
export function versaoMostrada(versao, data) {
  const d = String(data || '');
  const primeira = PRIMEIRA_DO_MES[d.slice(0, 7)] ?? 1;
  return `${d.replaceAll('-', '.')}-${Number(versao) - primeira + 1}`;
}
// a versão do app como aparece nos Ajustes e nas Novidades
export const APP_VERSAO = versaoMostrada(NOVIDADES[0].versao, NOVIDADES[0].data);

// as versões que a pessoa ainda não viu (mais nova primeiro); sem nenhuma vista ainda, só a atual
export function novidadesNaoVistas(vista) {
  const v = Number(vista) || 0;
  if (!v) return NOVIDADES.slice(0, 1);
  return NOVIDADES.filter((n) => n.versao > v);
}
