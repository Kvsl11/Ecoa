# Ecoa para Android (o APK)

O mesmo Ecoa do site, dentro de um app de Android, com o que o navegador não deixa fazer:

- **Widget da tela inicial**: a capa, o nome e o artista da última música tocada, com voltar, tocar/pausar e pular.
- **Aviso de "tocando"** nas notificações, com os mesmos botões: com ele, o Android não fecha o app em segundo plano no
  meio da música.
- **Login do Google pelo próprio Android** (o login do site não abre dentro de um app).
- **As músicas baixadas ficam no armazenamento do app**, e não no do navegador (limpar os dados do navegador não apaga).

O APK empacota uma cópia local da interface e dos arquivos estáticos de `public/`. Assim, a tela e os recursos que
não precisam de rede podem abrir mesmo sem conexão. A versão Web continua sendo publicada separadamente em
`https://kvsl11.github.io/Songbook/` e não é alterada por esta configuração.

**O Lúmen pensa no próprio celular**: o app procura no acervo (com o texto dos PDFs) e chama o Gemini direto, sem o
Codespace (veja "A chave do Gemini do Lúmen", abaixo).

**Os downloads de músicas e videoclipes são feitos no próprio celular**: o APK leva o yt-dlp (com o Python, o ffmpeg e
o QuickJS) e não precisa do Codespace nem do servidor Python para baixar. O yt-dlp se atualiza sozinho uma vez por dia.
O inventário do que já saiu do servidor e do que falta está em `MIGRACAO-NATIVA.md`.

Os recursos que ainda dependem de serviços externos (por exemplo, processamento pesado de karaokê e respostas
generativas do Lúmen) continuam usando esses serviços nesta primeira etapa. A migração offline deles será feita
separadamente, com modelos locais compatíveis e testes em aparelhos reais. Para receber alterações da interface no
APK, é necessário instalar uma nova versão do APK.

## Como o APK é montado

O robô do GitHub (`.github/workflows/android.yml`) monta o APK a cada mudança nesta pasta e publica em
**Releases → android** (`Ecoa.apk`). O botão **Baixar o app para Android**, na gaveta do perfil do site (só aparece no
Android, pelo navegador), baixa esse arquivo.

## O que fazer uma vez só (cerca de 5 minutos)

### 1. A senha da chave do APK

Todo APK é assinado com uma chave, e ela precisa ser sempre a mesma: senão a versão nova não instala por cima da anterior.
A chave fica no repositório **trancada** (`app-android/chave/ecoa.p12.enc`) e só abre com uma senha guardada nos
segredos do GitHub.

1. No GitHub: **Settings → Secrets and variables → Actions → New repository secret**.
2. Nome: `ECOA_CHAVE_SENHA`. Valor: uma senha forte, só sua (por exemplo, 5 palavras aleatórias).
3. **Guarde essa senha em lugar seguro.** Sem ela, não dá mais para publicar versões novas por cima do app instalado.
4. Em **Actions → App de Android → Run workflow**, rode o robô. Na primeira vez ele cria a chave e a guarda trancada.

### 2. O login do Google no Android (Firebase)

O Google só deixa o app entrar com a conta se souber a "impressão digital" da chave dele.

1. Abra o resumo da execução do robô (Actions → App de Android → a última execução) e copie a linha **SHA1**.
2. No [console do Firebase](https://console.firebase.google.com/project/ecoa-82a51/settings/general), em
   **Configurações do projeto → Seus apps → Adicionar app → Android**:
   - Nome do pacote: `br.ecoa.app`
   - Certificado de assinatura SHA-1: o que você copiou.
3. Salve. Não precisa baixar o arquivo `google-services.json`.

### 3. A chave do Gemini do Lúmen (travada ao app)

O Lúmen chama o Gemini direto do celular, sem servidor. A chave vai **dentro do APK**, que é público em Releases: por
isso ela precisa ser travada ao app, para não servir em outro lugar.

1. No [Google AI Studio](https://aistudio.google.com/apikey), crie uma chave **só para o app** (não use a mesma do
   servidor: travada ao Android, ela para de funcionar no Codespace/Modal).
2. No GitHub: **Settings → Secrets and variables → Actions → New repository secret**, nome `GEMINI_API_KEY_APK`, valor:
   a chave nova. (Sem esse segredo, o robô usa o `GEMINI_API_KEY` do servidor, sem trava.)
3. No [Google Cloud Console](https://console.cloud.google.com/apis/credentials), abra essa chave:
   - **Restrições de aplicativo → Apps Android → Adicionar**: pacote `br.ecoa.app` e a **SHA-1** do resumo do robô
     (a mesma do passo 2, do Firebase).
   - **Restrições de API → Restringir chave**: só a **Generative Language API**.
4. Rode o robô de novo (Actions → App de Android → Run workflow) e instale o APK novo.

O app manda o pacote e a impressão digital em cada pedido (cabeçalhos `X-Android-Package` e `X-Android-Cert`); com a
trava, a chave copiada do APK não funciona em outro programa que não mande os mesmos dados. Não é uma proteção
absoluta (quem souber o pacote e a impressão digital consegue imitar), mas impede o uso casual. Vale também pôr um
limite de cota por dia na chave.

## Para instalar

No celular, abra o site, toque na sua foto (a gaveta do perfil) → **Baixar o app para Android**, e abra o arquivo baixado.
Na primeira vez, o Android pede para permitir "instalar apps desconhecidos" para o navegador.

O widget: segure o dedo num espaço vazio da tela inicial → **Widgets** → **Ecoa**.

## Para montar aqui (quem for mexer no código)

```
cd app-android
npm ci
npx cap sync android
cd android && ./gradlew assembleDebug
```

O código de Android fica em `android/app/src/main/java/br/ecoa/app/` (o widget, o aviso de "tocando", os botões e o
login) e `android/app/src/main/res/` (o desenho do widget e os ícones). O site conversa com ele pelo plugin
`window.Capacitor.Plugins.Ecoa` (veja `ecoaNativo` em `public/js/app.js` e em `public/js/conta.js`).
