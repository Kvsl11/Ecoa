// O que mudou em cada versão do app, em palavras de quem usa. A primeira da lista é a versão atual (a mesma do
// VERSION do sw.js: um teste confere). As mudanças ficam disponíveis na tela Novidades.
// Cada item: { tipo: 'novo' | 'melhoria' | 'correcao', texto }. Ficam só as 10 últimas versões (um teste confere):
// ao escrever uma nova, apague a mais antiga. A data é a do Brasil (horário de Brasília), não a do servidor.
export const NOVIDADES = [
  {
    versao: 455, data: '2026-11-03', titulo: 'O servidor da IA é o do Codespace',
    itens: [
      { tipo: 'melhoria', texto: 'Tudo o que usava o servidor do Modal agora usa o servidor do Codespace do GitHub: a partitura pela IA, a letra sincronizada e o Lumen. Com o endereço do Codespace gravado no site, qualquer aparelho acha o servidor sozinho, sem ler o QR code. Com o Codespace desligado, a tela avisa para ligá-lo, e a partitura sai no próprio aparelho enquanto isso.' },
      { tipo: 'melhoria', texto: 'Sem passo manual: o Codespace publica o próprio endereço no site quando liga, e o app acha o servidor sozinho em qualquer aparelho. A conexão do YouTube também volta sozinha: se o servidor perdeu a conexão (um Codespace novo, por exemplo), o app manda de novo a que está guardada no aparelho. Só quando o YouTube recusa a conta (os cookies venceram) é preciso conectar outra vez.' },
    ],
  },
  {
    versao: 454, data: '2026-11-03', titulo: 'Coral pela IA com vozes de verdade',
    itens: [
      { tipo: 'melhoria', texto: 'No coral feito pela IA, o Contralto, o Tenor e o Baixo agora são escritos pela cifra da música, como num hinário: cada voz canta uma nota do acorde, sem cruzar com as outras, perto da nota de antes e no mesmo ritmo e com a mesma letra do Soprano. Antes essas vozes saíam das notas do violão e do teclado, e ficavam emboladas. Se a gravação tem mesmo as 4 vozes, escolha “Coral do áudio” em Ajustar → Vozes.' },
      { tipo: 'melhoria', texto: 'O servidor separa o cantor principal do backing vocal: a melodia sai só da voz do solista, conferida pela afinação (antes o backing fazia a voz parecer um coral e essa conferência ficava de fora). E as batidas e o primeiro tempo de cada compasso agora são ouvidos por uma rede treinada para isso, então o compasso e a anacruse acertam mais.' },
    ],
  },
  {
    versao: 453, data: '2026-11-03', titulo: 'Partitura pela IA sem notas perdidas',
    itens: [
      { tipo: 'melhoria', texto: 'A partitura pela IA não perde mais notas cantadas: onde a voz canta firme e a IA não tinha marcado nota, ela entra pela afinação da voz. A afinação agora é ouvida com o modelo maior (mais lento, uns minutos a mais, e mais preciso), que acerta melhor onde há voz e em que nota.' },
    ],
  },
  {
    versao: 452, data: '2026-11-03', titulo: 'Partitura pela IA mais precisa',
    itens: [
      { tipo: 'melhoria', texto: 'A partitura feita pela IA erra menos o tempo das notas: o servidor ouve as batidas na banda (bateria, violão), sem a voz, e a partitura usa essas batidas como a grade dos tempos. O cantor que adianta ou atrasa um pouco não faz mais a nota cair na figura errada.' },
      { tipo: 'melhoria', texto: 'E erra menos as notas: a altura de cada nota é medida na parte firme dela (sem o deslize da voz chegando na nota), as duas notas ligadas que a IA ouvia como uma só são separadas, e o começo de cada nota vai para o ataque de verdade da voz.' },
    ],
  },
  {
    versao: 451, data: '2026-11-03', titulo: 'Partitura com a barra arrumada',
    itens: [
      { tipo: 'melhoria', texto: 'A barra do alto da partitura ficou mais limpa: à esquerda o Editar e a lixeira, à direita o tom e o tamanho, numa linha só. No celular estreito, o Editar vira só o lápis.' },
      { tipo: 'melhoria', texto: 'Saiu o botão “Cores do app / Preto e branco”: a partitura fica sempre nas cores do app.' },
    ],
  },
  {
    versao: 450, data: '2026-11-03', titulo: 'Lumen ao vivo já começa ouvindo',
    itens: [
      { tipo: 'melhoria', texto: 'Abrindo o Lumen ao vivo, ele não diz mais “Olá, eu sou a Lumen”: já começa ouvindo, e você pode perguntar na hora.' },
    ],
  },
  {
    versao: 449, data: '2026-11-03', titulo: 'Lumen mais livre e sem a voz robótica',
    itens: [
      { tipo: 'melhoria', texto: 'O Lumen responde ao que você perguntou, sobre qualquer assunto, sem puxar coisas do acervo que você não pediu. O acervo continua lá: perguntando dele (“tem algo no acervo sobre…?”) ou quando um documento responde de fato à pergunta, ele usa e mostra a fonte.' },
      { tipo: 'correcao', texto: 'No ao vivo, a voz às vezes trocava no meio da resposta pela voz robótica do aparelho. Agora, quando a voz do Gemini demora ou está no limite do dia, entra logo a voz neural de reserva, e um tropeço da internet faz o app tentar de novo antes de usar a voz do aparelho.' },
    ],
  },
  {
    versao: 448, data: '2026-11-03', titulo: 'Ecoa de logo nova',
    itens: [
      { tipo: 'melhoria', texto: 'O Ecoa ganhou uma logo nova: um “e” com as ondas de eco saindo dele, em branco sobre o degradê ciano e azul do app. Ela aparece no menu, nos Ajustes, no ícone da tela inicial e nas notificações.' },
    ],
  },
  {
    versao: 447, data: '2026-11-03', titulo: 'Permissões: notificações e microfone num lugar só',
    itens: [
      { tipo: 'novo', texto: 'Ajustes → Permissões mostra se as notificações e o microfone estão permitidos, ainda não pedidos ou bloqueados. Dá para permitir dali, e, quando o navegador bloqueou, a tela explica como liberar. Com as notificações ligadas, o botão “Testar” manda uma notificação de teste.' },
      { tipo: 'melhoria', texto: 'O app não pede mais as notificações no primeiro toque na tela, sem explicar nada. Agora um cartão no Início conta para que servem (os avisos dos downloads) e pergunta uma vez; “Agora não” não pergunta de novo, e dá para permitir depois em Ajustes → Permissões.' },
    ],
  },
  {
    versao: 446, data: '2026-11-02', titulo: 'Lumen: voz do Gemini desde o “olá” e a música na tela',
    itens: [
      { tipo: 'correcao', texto: 'A saudação do Lumen saía numa voz robótica (a do aparelho) na primeira vez. Agora ela espera a voz do Gemini, que o app já prepara quando abre e guarda no aparelho. A voz do aparelho só entra se o servidor estiver fora do ar.' },
      { tipo: 'melhoria', texto: 'Pedindo para o Lumen tocar uma música, ela toca e a tela da música abre, como quando você toca nela na lista.' },
      { tipo: 'correcao', texto: 'As perguntas faladas ganham o ponto de interrogação também quando começam chamando o Lumen (“Lumen, você pode…?”, “Olá Lumen, no que você pode me ajudar?”), e o “?” já aparece enquanto você fala.' },
      { tipo: 'melhoria', texto: 'O Lumen entende melhor o nome da música mesmo quando o reconhecimento de voz escreve errado: “never hinder” e “never ranger” acham “Neverender”.' },
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
