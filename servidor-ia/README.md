# Servidor da IA da partitura (Python)

Transforma áudio em notas para a partitura do Songbook, com mais fidelidade que o modelo que roda no celular:

- **Demucs** separa a voz dos instrumentos: a voz é ouvida sozinha e a banda à parte (sem vozes emboladas);
- **Basic Pitch** (Spotify) ouve a música inteira de uma vez (sem as emendas de 5 s do aparelho);
- **CREPE** confere a afinação cantada (nota meio tom ou uma oitava fora vai para a altura certa);
- limpeza: tira o eco (harmônico) das notas graves, junta a nota longa partida pelo vibrato sem juntar a mesma nota
  cantada de novo (outra sílaba) e tira os estalos;
- **YouTube**: cole o link; o **yt-dlp** baixa só o áudio (WAV temporário, apagado assim que a partitura sai). Vídeo
  com restrição de idade: ponha um `cookies.txt` (formato Netscape, exportado do navegador logado) nesta pasta;
- **Letra sincronizada** (`/letra`): o **MMS_FA** (alinhador da Meta, aberto, roda no próprio servidor) encaixa a letra
  na voz separada, letra por letra, e cada linha ganha o instante em que é cantada no vídeo (introdução, solos e
  trechos falados ficam de fora). Sem ele, o **Whisper** ouve e as palavras são casadas com a letra. Com a letra da
  internet (LRCLIB) e um vídeo mais longo, o servidor só acha onde a música começa e a devolve no lugar certo.

- **Karaokê** (`/karaoke` com o link do YouTube, `/karaoke/arquivo` com o áudio enviado): sai **só o cantor
  principal**; o back vocal, o coro e a plateia ficam na banda. Três passos (`karaoke.py`): a voz inteira, a plateia
  tirada dela (só nas gravações ao vivo, quando passa de 3% da energia da voz) e o modelo karaokê, que separa o cantor do
  back vocal. A banda é a gravação menos o cantor, sem passar por modelo nenhum. Os modelos rodam direto na memória (sem
  a normalização e os 16 bits dos arquivos do audio-separator) e os RoFormer andam meio pedaço por vez (sem chiado nas
  emendas). O ffmpeg grava um M4A (AAC, 384 kb/s) de 4 canais, no arranjo "quad": banda esquerda e direita, cantor
  esquerda e direita. O app escolhe o volume da voz na hora. Fica guardado por vídeo (`IA_KARAOKE_MAX`, padrão 20).
  No Modal, o karaokê roda numa **placa de vídeo** (a função `karaoke` de `modal_app.py`, T4) com os RoFormer: a voz
  pelo BS-RoFormer 1297, a plateia pelo Mel-RoFormer Crowd e o cantor pelo Mel-RoFormer Karaoke (1 a 2 minutos por
  música). No processador: o Demucs (ou o RoFormer de `IA_SEPARADOR`), o UVR Crowd HQ e o UVR Karaoke 2.
  `IA_KARAOKE_VOZ`, `IA_KARAOKE_PLATEIA` e `IA_KARAOKE_SOLISTA` trocam o modelo de cada passo (`0` desliga; com o
  solista desligado sai a voz inteira, como antes). O site publica o endereço da placa (`karaoke` em
  `data/servidor-ia.json`) e o app manda só o karaokê para lá; sem ela, o karaokê vai para o servidor de sempre.
  `/karaoke/atualizar` recebe um karaokê de antes (o que tirava a voz inteira) e só separa o cantor da voz que já está
  nele (os passos 2 e 3): sem baixar a música e sem o passo mais pesado. O app atualiza assim os que já tinha.

Medido em 11 trechos de músicas reais (MUSDB18, voz isolada como gabarito): a melodia certa passou de **34%** do
tempo (a música inteira junta, como no celular) para **70%** (voz separada + limpeza).

## No seu computador, de graça (recomendado)

Sem crédito para acabar e sem fila de ninguém: o servidor roda no seu PC e um túnel grátis da Cloudflare (sem conta)
dá o endereço https que o celular alcança de qualquer lugar. De quebra, o YouTube quase não bloqueia a internet de casa.

1. Instale o [Docker Desktop](https://www.docker.com/products/docker-desktop/) (grátis para uso pessoal) e abra-o.
   O PC precisa de uns 8 GB de memória livre.
2. Baixe o projeto (no GitHub: **Code → Download ZIP**) e descompacte.
3. Na pasta `servidor-ia`: dois cliques em **`iniciar-windows.bat`** (Windows) ou rode `./iniciar.sh` (Mac/Linux).
   A primeira vez monta tudo e leva uns 15 minutos; as outras, segundos.
4. Abre a página <http://localhost:7860> com um QR code: leia com a câmera do celular. O Songbook abre já usando o PC
   (fica em **Ajustes → Servidor no seu computador**).

**Sem o Docker** (não instala, ou o PC não tem virtualização), no Windows: com qualquer Python instalado (marque
"Add python.exe to PATH"), dê dois cliques em **`iniciar-windows-sem-docker.bat`**. O servidor precisa do 3.11: se o
seu for outro (3.12, 3.13, 3.14…), `preparar_python.py` baixa o Python 3.11 portátil (o zip "embeddable" oficial do
python.org) para `servidor-ia\python311`, sem instalar nada e sem administrador (serve no notebook corporativo). A primeira vez instala tudo na pasta `.venv` (uns 15 minutos e
5 GB); depois abre a mesma página com o QR code. Deixe a janela preta aberta enquanto usa (fechar desliga o servidor).
No Mac/Linux, o mesmo com `python3.11 iniciar_pc.py` depois da instalação de "Rodar no seu computador" (abaixo).

### Na nuvem do GitHub (Codespaces): sem instalar nada no computador

Bom para o notebook da empresa, onde o antivírus bloqueia: o servidor roda num computador do GitHub, aberto pelo
navegador. A conta pessoal do GitHub tem horas grátis todo mês (a máquina de 4 núcleos gasta 2 horas da cota a cada
hora ligada); parado 30 minutos, ele desliga sozinho.

1. No GitHub do projeto: **Code → Codespaces → Create codespace on …** (o ramo principal). Abre um VS Code no
   navegador; a primeira vez instala tudo sozinha (uns 10 minutos, aparece "Servidor da IA instalado").
2. Embaixo, na aba **Portas**: a porta **7860** tem de estar **Pública** (botão direito → Visibilidade da porta →
   Pública; o Codespace já tenta mudar sozinho). Clique no globo do endereço: abre a página com o QR code.
3. Pronto: não precisa ler QR code nem colar endereço. Cada vez que o Codespace liga, ele puxa a versão nova, liga o
   servidor (os pacotes novos instalam por trás), deixa a porta 7860 pública (ou, se o GitHub não deixar, abre o túnel
   da Cloudflare) e publica o endereço no site, e os aparelhos acham o servidor sozinhos em uns 2 minutos
   (`.devcontainer/servidor.sh` e `servidor-ia/codespace.py`). Opcional: para a porta pública valer sempre (endereço que
   não muda), crie um token pessoal com o escopo `codespace` e guarde nos secrets do Codespaces como `CODESPACE_TOKEN`.
4. Para o site achar este servidor em **qualquer aparelho** (sem ler o QR code em cada um): no GitHub do projeto,
   **Settings → Secrets and variables → Actions → Variables → New repository variable**, nome `SERVIDOR_IA_URL`,
   valor o endereço do Codespace (`https://<nome>-7860.app.github.dev`; ele aparece em `servidor-ia/dados/endereco.txt`
   e no `servidor.log`). Normalmente não precisa: ao ligar, o Codespace grava o endereço sozinho em
   `.devcontainer/endereco.txt` (um commit pela API do GitHub), e a publicação do app que esse commit dispara já leva o
   endereço. A variável só é preciso se o `servidor.log` disser que não conseguiu.
5. O Lumen com IA no Codespace: a chave vai nos secrets **do Codespaces** (não nos do Actions): **Settings → Secrets and
   variables → Codespaces → New repository secret**, `GEMINI_API_KEY` (ou `ANTHROPIC_API_KEY`). Depois, pare e ligue o
   Codespace de novo. O texto dos PDFs do acervo, o servidor baixa do site (`data/textos-acervo.jsonl.gz`, lido toda
   semana pelo workflow **Publicar o servidor da IA**).

Até 3 músicas são ouvidas ao mesmo tempo no Codespaces (`IA_TAREFAS`): abrir várias em seguida põe todas para
sincronizar juntas, e cada uma fica pronta quando termina.

Deu **404** ou não abre? O servidor ainda está ligando (ou instalando). No **Terminal** do Codespace, veja o que ele
está fazendo com `tail -f servidor-ia/dados/servidor.log` (pronto quando aparece `Uvicorn running`). Se não houver
nada rodando, ligue à mão: `bash .devcontainer/ligar.sh`.

Das outras vezes: o endereço não muda, então não precisa ler o QR code de novo. Só ligue o Codespace: em
<https://github.com/codespaces> (dá até pelo celular), toque nele e espere uns 2 minutos; o servidor liga junto. Na
tela Importar o áudio, com ele desligado, aparecem os botões **Ligar no GitHub** e **Já liguei**. Para ele demorar mais
a dormir: <https://github.com/settings/codespaces> → **Default idle timeout** (até 240 minutos; gasta mais da cota). O que o servidor está fazendo: `servidor-ia/dados/servidor.log`.

### Sempre ligado, sozinho: o Codespace e o Modal de reserva

O app usa o **Codespace** quando ele está de pé. Desligado, o **Modal** (o servidor de reserva) atende na hora e manda
o GitHub ligar o Codespace (`POST /codespace/ligar`, `ligar_codespace.py`), que assume em uns 2 minutos; sem nenhum
Codespace do projeto, ele cria um. Sem a cota do mês no Codespace, tudo fica no Modal (o app só pergunta de novo meia
hora depois). Ninguém liga nada, lê QR code ou cola endereço. Para isso, uma vez, nos **secrets das Actions** (Settings
→ Secrets and variables → **Actions** → New repository secret):

- `MODAL_TOKEN_ID` e `MODAL_TOKEN_SECRET` (o token do Modal, veja "Publicar no Modal" abaixo);
- `CODESPACE_TOKEN`: um token clássico do GitHub (<https://github.com/settings/tokens/new>, **Generate new token
  (classic)**) com o escopo **codespace** e sem data de validade (ou renove quando vencer). Ele fica só no Modal (vai no
  secret `songbook-ia` de lá como `IA_GITHUB_TOKEN`), nunca no site.

O workflow **Publicar o servidor da IA** publica o Modal sozinho a cada mudança em `servidor-ia/` e toda semana, e a
publicação do site grava os dois endereços em `data/servidor-ia.json` (`url`, o Codespace; `reserva` e
`reservaLumen`, o Modal). Ajustes → Avançado → Servidor da IA mostra qual dos dois atende e por quê.

### No notebook da empresa, pelo VS Code (sem administrador)

1. Abra a pasta do projeto no VS Code. Precisa de algum Python instalado (o da loja da empresa ou o do python.org
   "só para mim" serve; o 3.11 portátil é baixado sozinho).
2. **Terminal → Executar tarefa → Ligar o servidor da IA (partitura e letra)** (a tarefa está em `.vscode/tasks.json`
   e chama o `iniciar-windows-sem-docker.bat`). A primeira vez instala tudo em `servidor-ia\.venv` (uns 15 minutos).
3. Se o QR code aparecer em <http://localhost:7860>, leia com o celular e pronto.
4. Se não aparecer (a rede da empresa bloqueia o túnel da Cloudflare): na aba **Portas** do VS Code (ao lado do
   Terminal), **Encaminhar uma porta** → `7860`, entre com a conta do GitHub, clique com o botão direito na porta →
   **Visibilidade da porta → Pública** e abra o endereço `https://…devtunnels.ms` que aparece: é a mesma página, com
   o QR code apontando para ele. Há também a tarefa "… só com as Portas do VS Code (sem Cloudflare)", que nem tenta
   o túnel da Cloudflare.

Com o servidor do computador ligado, a tela **Importar o áudio** manda o arquivo (ou o link do YouTube) para ele, sem
gastar crédito de ninguém; se ele não responder, o celular faz a partitura sozinho.

Deixe o PC ligado enquanto usa. O servidor volta sozinho quando o Docker Desktop abre, mas o endereço do túnel muda a
cada vez: abra <http://localhost:7860> e leia o QR code de novo. Com o PC desligado, o app volta para o servidor da
nuvem (abaixo), se houver. Parar: `docker compose down` nesta pasta. Ver o que está fazendo: `docker compose logs -f ia`.

## Publicar no Modal (o servidor de reserva)

O servidor principal é o do Codespaces (acima). O [Modal](https://modal.com) (US$ 30 de uso grátis por mês, https,
liga só quando alguém usa) é a reserva: o workflow `.github/workflows/servidor-ia.yml` publica lá sozinho a cada mudança
no servidor e toda semana (e à mão: **Actions → Publicar o servidor da IA → Run workflow**). Para isso, uma vez:

1. Entre em <https://modal.com/signup> com a conta do GitHub.
2. Crie um token em <https://modal.com/settings/tokens> → **New token** (aparecem dois valores: ID e Secret).
3. No GitHub do app: **Settings → Secrets and variables → Actions → New repository secret**:
   `MODAL_TOKEN_ID` (o ID) e `MODAL_TOKEN_SECRET` (o Secret). Opcionais: `ANTHROPIC_API_KEY` ("Tirar dúvidas") e
   `YT_COOKIES` (o conteúdo do cookies.txt).
4. Em **Actions**, rode **Publicar o servidor da IA** (a primeira montagem leva uns 15 minutos). A publicação do site
   que vem em seguida grava o endereço do Modal como a reserva (`data/servidor-ia.json`): não precisa da variável
   `SERVIDOR_IA_URL` (ela é só para fixar o endereço do Codespace).

### Lumen com IA (`ANTHROPIC_API_KEY`)

Com a chave da API da Anthropic (<https://console.anthropic.com> → **API Keys**, paga por uso) no secret
`ANTHROPIC_API_KEY`, o Lumen (o assistente do app) passa a responder com IA: o Claude Sonnet lê o acervo do Drive
(cantos, Hinário, nomes dos arquivos e o texto dos PDFs), o que o app manda junto (a liturgia do dia, os cantos
sugeridos, a biblioteca e os repertórios de quem pergunta) e, se precisar, a internet, e cita de onde tirou cada coisa.
Roda no servidor do Codespaces (a chave nos secrets do Codespaces, ver acima). O workflow **Publicar o servidor da IA**
lê o texto dos PDFs do acervo (`indexar_acervo.py`, até 800 arquivos novos por vez, guardados entre uma vez e outra)
toda segunda-feira, e a publicação do app o põe no site, de onde o servidor baixa. Sem a chave, o Lumen continua com a busca gratuita no aparelho.

**Ou o Gemini (`GEMINI_API_KEY`)**: com a chave do Google AI Studio (<https://aistudio.google.com/apikey>, tem uso
grátis) no secret `GEMINI_API_KEY` (do Codespaces), o Lumen responde pelo Gemini (`gemini-2.5-flash`, troque com `IA_GEMINI_MODELO`),
com a busca do Google para o que não está no acervo. Com as duas chaves vale o Claude (`IA_PROVEDOR=gemini` troca).

**A voz do Lumen ao vivo (`/falar`)**: a conversa ao vivo fala com uma voz neural realista (as vozes da Microsoft do
"Ler em voz alta" do Edge, pelo pacote `edge-tts`: de graça, sem chave). Francisca (feminina) e Antonio (masculina);
`IA_VOZ` e `IA_VOZ_MASCULINA` trocam. Sem o servidor, o app usa a voz mais natural do aparelho.

## Rodar no seu computador

```bash
cd servidor-ia
python3.11 -m venv .venv && . .venv/bin/activate
pip install torch torchaudio torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
pip install --no-deps basic-pitch==0.4.0
uvicorn app:app --host 0.0.0.0 --port 8000
```

Precisa do `ffmpeg` instalado. No app: **Ajustes → IA da partitura**, cole o endereço (ex.: `https://meu-servidor:8000`).

| Rota | |
|---|---|
| `GET /saude` | o que o servidor tem (separação, Whisper, cookies) |
| `POST /transcrever` | `arquivo` (multipart) → notas |
| `POST /youtube` | `{"url": "..."}` → notas |
| `POST /letra` | `{"url": "...", "linhas": [...]}` → início e fim de cada linha |

Variáveis: `IA_ORIGENS` (CORS), `IA_CHAVE` (senha, cabeçalho `X-Chave`), `IA_TAREFAS`, `IA_MAX_MB`, `IA_COOKIES`,
`IA_WHISPER` (small), `IA_CREPE` (full: mais lento e mais preciso, acha as notas que o Basic Pitch perde; `tiny` é o rápido), `IA_SOLISTA` (o modelo karaokê que separa o solista do backing vocal; `0` desliga), `IA_SEPARADOR` (`roformer`: a voz pelo Mel-Band RoFormer, bem mais limpa e ~6x mais lenta no processador; o padrão é o Demucs), `IA_SEM_BEAT_THIS` (as batidas pelo librosa em vez do Beat This!), `IA_MODELOS_SEPARACAO` (a pasta dos modelos do audio-separator), `IA_THREADS` (núcleos por modelo), `IA_MAX_AUDIO_VIDEO` (quanto do vídeo a letra ouve, em segundos; padrão 900), `IA_CACHE` (onde ficam o áudio e a voz separada de cada vídeo, para a letra e a partitura não baixarem nem separarem duas vezes). Testes: `python -m pytest tests`.
