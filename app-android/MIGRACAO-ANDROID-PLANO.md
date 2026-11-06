# Migração Android nativa — plano de execução

Esta branch concentra a migração do APK. A versão Web publicada não deve perder nem alterar seus fluxos.

## Estado confirmado no código-base

- O APK copia `public/` para `app-android/www/` por `scripts/preparar-web.mjs`; o Capacitor usa `webDir: "www"`. Portanto, a interface empacotada não precisa ser reconstruída a partir do zero.
- O plugin `EcoaPlugin` já fornece integrações Android para widget/player, login Google, notificações, atualização do APK e consulta de armazenamento.
- Downloads de mídia ainda chamam `POST /baixar` no servidor Python. A API usa `yt-dlp` para obter áudio/vídeo e entrega o arquivo em `GET /baixar/{id}`. O app recebe os bytes como `Blob` e os guarda via `guardarAudio` em IndexedDB (`public/js/audios.js`); o fluxo de downloads está em `public/js/app.js` (`tentarBaixar`/`baixarAgora`).
- O karaokê chama `POST /karaoke`; a implementação Python usa modelos de separação de áudio (Demucs/RoFormer) e FFmpeg. O roteamento pode usar um serviço separado de GPU/Modal.
- O Lúmen possui busca local no acervo em JavaScript (`public/js/lib/duvidas.js`), mas a resposta generativa usa `POST /duvida` e provedor externo.
- O módulo `public/js/lib/servidor-ia.js` contém as chamadas HTTP e o acompanhamento das tarefas remotas.

## Regras obrigatórias

1. Não modificar o comportamento da versão Web. Todo desvio nativo deve ser condicionado à execução Android e testado para não alterar o caminho Web.
2. Não remover endpoints Python até que exista substituto local testado.
3. Não marcar download como concluído até validar separadamente todos os arquivos solicitados (áudio e, quando aplicável, vídeo).
4. Não embutir modelos grandes no APK sem medir tamanho, memória, bateria, latência e compatibilidade.
5. Distinguir recursos offline reais de recursos que ainda precisam de internet. Não exibir "nativo/offline" quando houver dependência remota.
6. Para fontes de mídia com restrições próprias, usar somente fluxos permitidos pelo serviço e não contornar autenticação, DRM ou controles de acesso.

## Etapas e critérios de aceite

### 1. Downloads e armazenamento Android
- Mapear a rotina JS que inicia e finaliza downloads e o formato de metadados já armazenado.
- Implementar serviço Android com fila persistente, cancelamento, progresso, retomada quando suportada e gravação atômica (arquivo temporário → arquivo final).
- Persistir áudio e vídeo como itens independentes; validar existência, tamanho e abertura antes de marcar cada um como concluído.
- Adaptar apenas o caminho Android para usar a ponte nativa; manter o fluxo Web atual.
- Critério: teste Android confirma áudio e vídeo, falhas/rede interrompida, retomada, cancelamento, reinício do app e estado correto da biblioteca.

**Limite técnico:** a transferência nativa de uma URL direta não substitui a resolução/obtenção de mídia que hoje é feita por `yt-dlp` no servidor. A migração completa do download só pode ser declarada quando houver uma fonte Android local e compatível com os termos do serviço para cada tipo de mídia. Não fingir que trocar o transporte remove essa dependência.

### 2. Lúmen
- Manter local a indexação e a busca do acervo já implementadas.
- Separar respostas determinísticas locais das respostas generativas.
- Avaliar runtime e modelo pequeno on-device como componente opcional, baixado sob demanda; testar qualidade, memória e desempenho em aparelhos reais.
- Critério: indicar claramente o que funciona offline e não depender de chave/API remota para o modo local.

### 3. Karaokê
- Manter local o player e o gerenciamento das faixas prontas.
- Avaliar runtime Android e modelos compactos para separação de voz; medir tamanho do modelo, RAM, bateria, latência e qualidade.
- Não declarar separação offline até concluir testes em aparelhos Android de referência.
- Critério: separar uma faixa de teste inteiramente no aparelho e reproduzir/armazenar o resultado sem rede.

### 4. Demais funções Python
- Inventariar cada rota chamada pelo app (partitura/OMR, transcrição, sincronização, fala, processamento e integrações).
- Classificar como: portável para Android, substituível por lógica JS local, precisa de serviço online ou inviável em aparelho comum.
- Migrar por função, com testes equivalentes e fallback claramente identificado.

### 5. Publicação
- Executar testes unitários existentes e testes Android de integração.
- Gerar APK de teste nesta branch; não publicar automaticamente como versão estável.
- Só atualizar o canal de APK após aprovação dos testes e verificação de instalação/atualização sobre a versão instalada.

## Próximo trabalho de código

O primeiro trabalho de implementação é integrar o serviço Android de downloads ao fluxo real do app. A rotina completa já foi localizada no blob de `public/js/app.js`: `tentarBaixar` chama `/baixar` e `baixarAgora` recebe o arquivo como Blob e grava via `guardarAudio` (IndexedDB). A implementação nativa deve preservar esse contrato de armazenamento/leitura ou migrar os consumidores juntos; não basta adicionar um método Java desconectado. O ponto crítico que ainda exige solução é a obtenção/resolução da mídia do YouTube: hoje isso é feito por `yt-dlp` no servidor. Uma transferência Android nativa sozinha não elimina essa dependência.


## Arquitetura híbrida desejada e impacto nas cotas

A regra é executar no aparelho tudo que já tem entrada e saída local e reservar o Codespace para operações que realmente precisam de serviço remoto. A versão Web mantém o comportamento atual.

| Operação | APK Android | Codespace/serviço |
| --- | --- | --- |
| Interface, navegação, player, notificações e controles | Executa localmente | Não participa |
| Biblioteca, metadados e reprodução de arquivos já baixados | Executa localmente | Não participa |
| Receber e guardar o arquivo final | Já é feito no aparelho (Blob → IndexedDB) | Entrega o resultado preparado |
| Resolver ID de vídeo e preparar áudio/vídeo com yt-dlp | Não substitui hoje o backend | Continua sendo a etapa pesada do fluxo atual |
| Importar arquivo que a pessoa já possui no aparelho | Deve ser nativo/local | Não participa |
| Busca no acervo e respostas determinísticas do Lúmen | Executa localmente quando possível | Não participa |
| Resposta generativa do Lúmen | Modelo local apenas após avaliação de compatibilidade | Provedor remoto quando o modo local não estiver disponível |
| Separação de voz para karaokê | Só migrar após provar qualidade e desempenho em aparelhos reais | Fallback para o processamento atual |

**Importante sobre economia:** o recebimento do arquivo e o armazenamento já acontecem no APK. Reescrever essa parte em Java/Kotlin não reduz, por si só, o tempo de CPU do Codespace. O consumo de computação ocorre principalmente durante a resolução e a preparação da mídia com yt-dlp (e nos modelos de karaokê/IA). A redução real virá de mover operações independentes para o aparelho, reutilizar resultados já preparados e não iniciar tarefas remotas quando o conteúdo já estiver disponível localmente.

### Política de acionamento do Codespace

- Não consultar nem acordar o serviço ao abrir telas que funcionam com dados locais.
- Só iniciar uma chamada remota após ação explícita que precise dela.
- Verificar primeiro cache/biblioteca local e evitar repetir processamento já concluído.
- Manter fila limitada e cancelar tarefas remotas quando a pessoa cancelar a operação.
- Mostrar claramente quando uma função precisa que o Codespace esteja ligado; não simular funcionamento offline.
- Se o Codespace for usado manualmente, desligá-lo quando terminar. A simples redução de chamadas não elimina o consumo de horas enquanto o ambiente permanece ligado.

### Ordem de implementação da arquitetura híbrida

1. Instrumentar/classificar chamadas remotas por funcionalidade e confirmar que telas e reprodução locais não fazem chamadas desnecessárias.
2. Implementar importação local de áudio/vídeo no Android, com seleção de arquivos do aparelho e integração com a biblioteca, sem tocar no fluxo Web.
3. Revisar o fluxo de download para garantir que só solicita ao servidor arquivos realmente ausentes e que cada áudio/vídeo é validado separadamente antes de concluir.
4. Migrar operações determinísticas do Lúmen e processamento de áudio compatível para módulos locais, mantendo fallback remoto explícito.
5. Avaliar separação de voz e modelo generativo local com testes de memória, bateria, tempo e qualidade em aparelhos reais.

Nenhuma etapa será considerada concluída apenas por adicionar uma classe nativa: precisa estar ligada à interface, ao armazenamento e aos consumidores reais do recurso, e ter teste de integração.
