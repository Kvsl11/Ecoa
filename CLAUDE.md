# Songbook — regras do projeto

## Correções que valem para as músicas já salvas e baixadas
Quem usa não deve precisar tirar a música, apagar o download e baixar de novo para receber uma correção.

Quando uma correção muda algo que fica **guardado na música** (a letra sincronizada, as versões de áudio e clipe, o
tipo dos quadros, os arquivos baixados, o conteúdo da cifra), acrescente uma revisão no fim de `REVISOES`
(`public/js/app.js`, seção "revisão das músicas salvas"), dizendo o que refazer (`letra`, `versoes`, `arquivos`,
`rebaixar` e, se a correção só vale para algumas músicas, `quais(song)`). Se nenhuma dessas opções cobre a correção,
crie a opção nova em `revisarMusica`. As músicas que já estavam no aparelho passam pela revisão sozinhas, em segundo
plano. Nunca mexa no que a pessoa escolheu à mão (por exemplo, a sincronia com `fonte` diferente de `'lrclib'`).

Correções só de comportamento da tela (o que não fica guardado) não precisam de revisão.

## Idioma do aparelho (português, inglês e espanhol)
O app segue o idioma do aparelho: português do Brasil, inglês e espanhol; qualquer outro idioma fica em inglês
(`public/js/lib/i18n.js`). O texto do código continua em português, e a tradução é trocada na tela pelos dicionários
`public/js/lib/i18n-en.js` e `public/js/lib/i18n-es.js`, que têm o texto em português como chave.

- Todo texto novo que aparece para a pessoa (tela, menu, aviso, cartão, PDF) entra nos dois dicionários, na mesma
  versão. Um trecho que muda vira `{}` na chave (`{n}` quando é sempre número); no valor, `{1}`, `{2}`… são esses
  trechos e `{1|um|vários}` escolhe a palavra pelo número.
- Nunca traduza o que a pessoa escreveu ou o que veio de fora (nomes de música, artista e playlist, letra, cifra,
  liturgia). Onde esses nomes aparecem, use `translate="no"` no elemento; um rótulo do app no meio deles leva a
  classe `ui`.
- O texto que não passa pela tela (aviso do sistema, texto desenhado em canvas, texto de compartilhar) é trocado com
  `t('…')`, importado de `lib/i18n.js`. Datas e números usam `LOCALE`, não `'pt-BR'`.
- Escolha traduções do tamanho do texto em português e confira a tela em 390 px nos dois idiomas: nada pode passar da
  largura, quebrar no meio da palavra nem ficar por cima de outro elemento.
- Os textos nativos do Android ficam em `res/values` (inglês, o padrão), `res/values-pt` e `res/values-es`.

## A cada versão
- Suba `VERSION` em `public/sw.js` (o número sempre sobe).
- Escreva o que mudou em `public/js/lib/novidades.js`, com a data do Brasil (a primeira entrada é a versão atual; ficam
  só as 10 últimas). A versão mostrada no app (`APP_VERSAO`) sai dali: a data e o número da versão no mês. Na primeira
  versão de um mês novo, acrescente o mês em `PRIMEIRA_DO_MES`.
- O texto das Novidades (o título e cada item) é escrito em registro técnico e formal, como uma nota de versão: a
  causa do problema, o que foi alterado e o efeito obtido, com os números medidos quando houver; impessoal ("passou a",
  "foi corrigido"), sem gíria nem tom de conversa. O que só chega com o APK novo termina com "Disponível mediante
  atualização do aplicativo."
- O título e cada item da nota da versão entram também nos dois dicionários (`i18n-en.js` e `i18n-es.js`), com o
  mesmo registro técnico: a tela Novidades aparece no idioma do aparelho (um teste confere).
- `npm test` precisa passar.
- A nota da versão deve descrever apenas o que realmente foi entregue. Recursos ainda sem ligação visual, teste ou publicação devem ser identificados como pendentes, nunca como concluídos.
- O APK recebe `versionCode` e `versionName` automaticamente pelo número da execução do workflow Android; não fixe nem reutilize manualmente esses valores. O workflow gera `Ecoa-versao.json` a partir de `NOVIDADES`, e as notas da Release Android devem incluir a última nota técnica. Antes de encerrar uma atualização, confira que a versão do `sw.js`, a primeira entrada de `NOVIDADES` e o JSON do APK correspondem entre si.
