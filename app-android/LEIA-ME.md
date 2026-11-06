# Ecoa para Android (o APK)

O mesmo Ecoa do site, dentro de um app de Android, com o que o navegador não deixa fazer:

- **Widget da tela inicial**: a capa, o nome e o artista da última música tocada, com voltar, tocar/pausar e pular.
- **Aviso de "tocando"** nas notificações, com os mesmos botões: com ele, o Android não fecha o app em segundo plano no
  meio da música.
- **Login do Google pelo próprio Android** (o login do site não abre dentro de um app).
- **As músicas baixadas ficam no armazenamento do app**, e não no do navegador (limpar os dados do navegador não apaga).

O app abre o site publicado (`https://kvsl11.github.io/Songbook/`), então as novidades do Ecoa chegam sozinhas, sem
instalar de novo. O APK só muda quando esta pasta muda.

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
