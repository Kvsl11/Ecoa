# Migração Android nativa — plano de execução

Esta branch concentra a migração do APK. A versão Web publicada não deve perder nem alterar seus fluxos.

## Estado confirmado no código-base

- O APK copia `public/` para `app-android/www/` por `scripts/preparar-web.mjs`; o Capacitor usa `webDir: "www"`. Portanto, a interface empacotada não precisa ser reconstruída a partir do zero.
- O plugin `EcoaPlugin` já fornece integrações Android para widget/player, login Google, notificações, atualização do APK e consulta de armazenamento.
- Downloads de mídia ainda chamam `POST /baixar` no servidor Python. A API usa `yt-dlp` para obter áudio/vídeo e entrega o arquivo em `GET /baixar/{id}`.
- O karaokê chama `POST /karaoke`; a implementação Python usa modelos de separação de áudio (Demucs/RoFormer) e FFmpeg.
- O Lúmen possui busca local no acervo em JavaScript, mas a resposta generativa usa `POST /duvida` e provedor externo.
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

O primeiro trabalho de implementação é integrar o serviço Android de downloads ao fluxo real do app. Antes disso, é necessário localizar e mapear a rotina JS de download completa, pois o arquivo principal do app é grande e a API GitHub não retornou seu conteúdo integral na leitura inicial. Não criar uma ponte nativa desconectada do fluxo e chamá-la de funcional.
