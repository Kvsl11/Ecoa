# Migração nativa do Ecoa para Android

## Objetivo

Evoluir somente o APK Android para reduzir a dependência do servidor. A versão Web publicada em GitHub Pages deve permanecer com o comportamento e os arquivos atuais.

## Arquitetura atual confirmada

- O APK é um invólucro Capacitor 8 que aponta para `https://kvsl11.github.io/Songbook/` por meio de `server.url`.
- O código de interface e os scripts são servidos pelo site; por isso, hoje o APK não contém uma cópia autônoma do aplicativo.
- Já existe um plugin Android `EcoaPlugin` com integração para player/widget, notificações, login Google, armazenamento, atualização do APK e informações de saída de áudio.
- O módulo `public/js/lib/servidor-ia.js` conversa com a API remota para tarefas pesadas. O karaokê no servidor usa modelos de separação de áudio que não devem ser empacotados indiscriminadamente no APK.
- Há lógica local reaproveitável em JavaScript, por exemplo pesquisa no acervo e recursos de ensaio; é necessário mapear dependências e acessos de rede antes de declarar cada recurso offline.

## Regras para a migração

1. Não alterar a versão Web nem publicar mudanças em `public/` para esta migração.
2. Isolar código, dependências e recursos exclusivos do Android em `app-android/` e no código nativo Android.
3. Não remover nem desligar os endpoints remotos enquanto a alternativa local não tiver testes equivalentes.
4. Preservar compatibilidade com os dados locais existentes e com a assinatura do APK.
5. Não incluir modelos grandes no APK sem medir tamanho, memória, tempo de execução e compatibilidade com aparelhos Android comuns.
6. Quando uma tarefa não puder ser executada offline, explicar isso na interface e manter a opção online disponível.

## Etapas de implementação

### Fase 1 — APK independente do site em tempo de execução
- Preparar a montagem do APK para copiar os arquivos da aplicação para os assets locais do Capacitor.
- Remover a dependência de carregar a interface inicial diretamente do GitHub Pages somente depois de validar rotas, autenticação, service worker, cache, atualizações e recursos relativos.
- Manter a Web hospedada sem alterações.

### Fase 2 — Serviços Android reutilizáveis
- Implementar armazenamento persistente e indexação local dos downloads.
- Implementar fila de downloads Android com estados reais por arquivo (áudio e vídeo separados), retomada e validação antes de marcar como concluído.
- Expor as operações ao JavaScript por métodos explícitos do plugin Capacitor.

### Fase 3 — Lúmen
- Manter a interface do Lúmen no APK e migrar primeiro as funções determinísticas e a busca no acervo para execução local.
- Avaliar um modelo pequeno de linguagem no dispositivo, como recurso opcional e baixado sob demanda; preservar o servidor como fallback para respostas que exijam modelos maiores ou dados online.
- Não prometer conversa generativa offline antes de validar desempenho e qualidade em aparelhos reais.

### Fase 4 — Karaokê e processamento de áudio
- Migrar primeiro reprodução, seleção de faixas já processadas, sincronização e gerenciamento local dos arquivos.
- Avaliar separação de voz/instrumental e demais modelos em Android separadamente, com testes de memória, bateria, latência e tamanho.
- Manter no servidor, por enquanto, os modelos GPU e operações que não tenham substituto local validado.

### Fase 5 — Verificação e publicação
- Criar testes unitários para a lógica migrada e testes de integração do plugin.
- Montar APK de teste em branch isolada e verificar login, reprodução, downloads, Lúmen, karaokê e atualização.
- Só publicar no canal de atualização do APK depois que a montagem e os testes passarem.

## Critério de conclusão

A migração será considerada pronta por recurso, não por aparência: cada função deverá demonstrar que funciona sem conexão, listar claramente suas dependências online e não regredir na versão Web.
