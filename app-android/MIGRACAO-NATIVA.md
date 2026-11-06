# Migração nativa do Ecoa para Android

## Objetivo

Evoluir somente o APK Android para reduzir a dependência do servidor. A versão Web publicada em GitHub Pages deve permanecer com o comportamento e os arquivos atuais.

## Arquitetura atual confirmada

- O APK é um invólucro Capacitor 8 que aponta para `https://kvsl11.github.io/Songbook/` por meio de `server.url`.
- O código de interface e os scripts são servidos pelo site; por isso, hoje o APK não contém uma cópia autônoma do aplicativo.
- Já existe um plugin Android `EcoaPlugin` com integração para player/widget, notificações, login Google, armazenamento, atualização do APK e informações de saída de áudio.
- O módulo `public/js/lib/servidor-ia.js` conversa com a API remota para tarefas pesadas. O karaokê no servidor usa modelos de separação de áudio que não devem ser empacotados indiscriminadamente no APK.
- Há lógica local reaproveitável em JavaScript, por exemplo pesquisa no acervo e recursos de ensaio; é necessário mapear dependências e acessos de rede antes de declarar cada recurso offline.

## Inventário: o que cada script Python faz e onde fica no APK

O APK conversa com o servidor Python (`servidor-ia/`, que roda no Codespace, no Modal ou no computador) por estas
rotas. A coluna "No APK" diz o estado atual; a versão Web não muda em nenhum caso.

| Script / rota | O que faz | Dependências pesadas | No APK |
| --- | --- | --- | --- |
| `youtube.py` · `/baixar` | Baixa o áudio (M4A/Opus) e o videoclipe (MP4, imagem + som juntos) para tocar offline | yt-dlp, Deno, ffmpeg | **Migrado.** `Baixador.java` roda o mesmo yt-dlp no celular (biblioteca youtubedl-android: Python, ffmpeg e QuickJS dentro do APK), com os mesmos formatos e qualidades. Atualiza o yt-dlp sozinho uma vez por dia. O servidor só é usado se já estiver conectado e o celular falhar |
| `versoes.py` · `/versoes`, `/croma` | Casa o áudio oficial com o videoclipe pelo som (croma + DTW) | librosa | **Já local.** `public/js/lib/casamento.js` faz a mesma conta; com os dois arquivos baixados no celular, o app usa ela (`casarNoAparelho`) |
| `letra.py`, `alinhador.py` · `/letra` | Letra sincronizada ouvindo a voz (Whisper / MMS_FA) | Demucs, faster-whisper, torch | **Pendente.** A sincronia principal já vem da LRCLIB, direto do celular; o Whisper fica como reserva no servidor. Candidato: whisper.cpp (modelo tiny/base, baixado sob demanda) |
| `karaoke.py` · `/karaoke` | Separa voz e banda em 4 canais | Demucs / audio-separator (GPU T4) | **Migrado.** `Karaoke.java`: o UVR MDX-Net Inst HQ 4 (59 MB, baixado na primeira vez) no ONNX Runtime (com o XNNPACK quando o aparelho tem), a mesma STFT do UVR (FFT de 5120 pontos, 5 × 1024) e o mesmo arquivo do servidor (M4A AAC 4 canais quad, pelo ffmpeg do APK). Medido no MUSDB18 (8 músicas): banda 15,6 dB e voz 11,3 dB de SDR (o UVR 9482 de antes: 11,3 e 7,6 dB; a versão int8 do HQ 4 piorou para 8,9 dB e foi descartada). O caminho Java confere com o numpy (121 dB). Tempo no computador: ~0,6× a duração da música com 4 núcleos; no celular, a medir. O back vocal sai junto com o cantor |
| `transcricao.py` · `/transcrever`, `/youtube` | Áudio → partitura (Basic Pitch + CREPE + Beat This!) | onnxruntime, torch | **Parcial.** A partitura já é feita no aparelho com o Basic Pitch do navegador; o servidor só dá a versão mais fiel (voz separada) |
| `duvidas.py`, `indexar_acervo.py` · `/duvida`, `/buscar-acervo`, `/ler-anexo` | Lúmen: busca no acervo (BM25) e resposta pela IA | API do Claude/Gemini | **Migrado.** `public/js/lib/lumen-local.js` faz o mesmo pedido (os mesmos textos do sistema, os trechos do acervo — com o texto dos PDFs, guardado no celular por uma semana —, a busca do Google e os modelos de reserva) e `Gemini.java` chama a API com a chave do APK, travada ao pacote e à SHA-1. Fica de fora: o PDF inteiro do acervo junto (o servidor baixava do Drive) e o Word enviado (vai só o nome) |
| `falar.py` · `/falar` | Voz neural do Lúmen ao vivo | edge-tts | **Pendente.** Alternativa local: o TextToSpeech do Android |
| `codespace.py`, `ligar_codespace.py`, `modal_app.py`, `pc.py`, `iniciar_pc.py`, `preparar_python.py`, `pacote-windows/` | Ligar e expor o servidor (Codespace, Modal, PC) | — | **Não se aplica.** Infraestrutura do servidor; o APK deixa de precisar dela à medida que as rotas acima migram |
| `youtube.py` · `/youtube/conectar` | Guarda os cookies da conta do YouTube no servidor | — | **Não necessário para o download no celular**: o YouTube costuma bloquear servidores na nuvem, não celulares. Vídeos com restrição de idade ainda não baixam pelo celular |

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
- **Feito:** downloads do YouTube (áudio e videoclipe) no próprio celular, pelo yt-dlp empacotado (`Baixador.java`,
  métodos `baixarLocal`, `cancelarLocal`, `apagarLocal` e `baixadorLocal` do plugin). O APK passou a ter ~50 MB a mais por
  causa do Python, do ffmpeg e do QuickJS (só para os processadores de celular, 64 e 32 bits).
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
