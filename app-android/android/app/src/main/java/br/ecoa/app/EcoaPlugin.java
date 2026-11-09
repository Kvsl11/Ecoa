package br.ecoa.app;

import android.Manifest;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.CancellationSignal;
import android.os.Environment;
import android.os.StatFs;

import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.CustomCredential;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.ClearCredentialStateRequest;
import androidx.credentials.exceptions.ClearCredentialException;
import androidx.credentials.exceptions.GetCredentialCancellationException;
import androidx.credentials.exceptions.GetCredentialException;
import androidx.credentials.exceptions.NoCredentialException;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;
import androidx.core.content.ContextCompat;

import java.io.File;
import java.util.concurrent.Executors;

// O que o site faz no Android pelo "window.Capacitor.Plugins.Ecoa":
//  - musica({ titulo, artista, capa, tocando }): a música do player, para o widget e o aviso de "tocando"
//  - entrarComGoogle(): o login do Google pelo próprio Android (o do site não abre dentro de um app) → { idToken }
//  - armazenamento(): o espaço do celular → { total, livre, app } em bytes (app: tudo o que o Ecoa guarda, downloads inclusos)
//  - avisar({ titulo, texto, tag, href, silenciosa, imagem }): uma notificação do Android (os downloads)
//  - versao() → { codigo, nome }; atualizar({ url }): baixa o APK novo e abre a instalação (evento "atualizacao": { pct })
//  - sairDoGoogle(): esquece a conta escolhida (na próxima entrada, o Android pergunta de novo)
//  - saidaDeSom() → { fone, tipo, saidas: [{ nome, tipo }], aparelho, modelo, fabricante }: por onde o som sai (o fone
//    ou a caixa com o nome dele) e o nome deste celular; evento "saida" (o mesmo) ao conectar ou desconectar um fone
//  - abrirBluetooth(): abre as configurações de Bluetooth do Android
//  - evento "acao" ({ acao: 'anterior' | 'alternar' | 'proxima' }): um botão do widget ou do aviso foi tocado
//  - baixarLocal({ video, comVideo, qualidade, processo }): baixa do YouTube no próprio celular (o yt-dlp do APK, sem
//    o servidor) → { caminho, tipo, tamanho, altura, titulo, duracao, qualidade }; evento "baixando" ({ processo, pct })
//    a cada 1%. O arquivo fica em caminho até o site guardar e chamar apagarLocal({ caminho })
//  - cancelarLocal({ processo }): para o download no meio (a pessoa pausou)
//  - baixadorLocal({ atualizar }) → { pronto, versao, erro }: prepara o yt-dlp e, uma vez por dia, atualiza
//  - karaokeLocal({ dados (base64) | video, nome, processo }) → { caminho, tipo, tamanho, duracao }: o karaokê feito no
//    próprio celular (Karaoke.java: o UVR no ONNX Runtime); evento "karaoke" ({ processo, etapa, pct }). O arquivo fica em
//    caminho até o site guardar e chamar apagarLocal({ caminho })
//  - karaokeDisponivel() → { tem, modelo }: se o celular faz karaokê (e se o modelo de 30 MB já foi baixado)
//  - capasOffline({ urls }): guarda de antemão as capas destas músicas (as baixadas), para o aviso de "tocando" e o
//    widget mostrarem a capa certa sem internet
//  - buscarPagina({ url, cabecalhos, tempo }) → { status, texto, tipo }: uma página da internet lida direto (sem a trava
//    de CORS do navegador; Paginas.java). status 0: nem chegou ao site
//  - avisar({ …, fixa, pct }): fixa = a notificação do download em andamento, que não sai ao arrastar (BaixandoService);
//    pct = a barra; soltarAviso(): ela sai (pausou tudo)
//  - rede() → { online, kbps, lenta }: a conexão vista pelo Android; evento "rede" (o mesmo) a cada mudança
//  - geminiDisponivel() → { tem }: se este APK foi montado com a chave do Gemini (o Lúmen no próprio celular)
//  - gemini({ caminho, corpo, tempo }) → { status, texto }: a API do Gemini (só os caminhos models…), com a chave do APK
//  - converterAudio({ dados (base64), nome }) → { dados (base64), tipo }: o áudio importado num formato que a WebView não
//    toca (WMA, AIFF, AMR, APE, ALAC…) convertido para M4A pelo ffmpeg do APK
@CapacitorPlugin(name = "Ecoa", permissions = {
    @Permission(alias = "avisos", strings = { Manifest.permission.POST_NOTIFICATIONS }),
    @Permission(alias = "microfone", strings = { Manifest.permission.RECORD_AUDIO })
})
public class EcoaPlugin extends Plugin {
    // o id do cliente web do login Google do projeto do Firebase (é público: vai no endereço de login do site)
    static final String CLIENTE_GOOGLE = "286830451197-skc9t7g9hqui9laem4tsaouir33kab6m.apps.googleusercontent.com";
    static final String PREFS = "ecoa_widget";

    private static EcoaPlugin ativo;
    // (o callback da rede, guardado para sair junto com o plugin)
    private static final class ConnectivityManager_ {
        final android.net.ConnectivityManager.NetworkCallback cb;
        ConnectivityManager_(android.net.ConnectivityManager.NetworkCallback cb) { this.cb = cb; }
    }
    private static String pendente; // a ação que chegou antes de o site ficar pronto

    // conectou ou desconectou um fone, uma caixa ou um cabo: avisa o site (evento "saida")
    private android.media.AudioDeviceCallback ouvinteDeSaida;
    private final android.os.Handler principal = new android.os.Handler(android.os.Looper.getMainLooper());
    private final Runnable lerSaida = () -> { if (getBridge() != null) notifyListeners("saida", SaidaDeSom.ler(getContext())); };

    // a conexão vista pelo Android (Rede.java): evento "rede" ({ online, kbps, lenta }) a cada mudança
    private ConnectivityManager_ ouvinteDeRede;
    private String ultimaRede = "";

    @PluginMethod
    public void rede(PluginCall call) {
        call.resolve(Rede.estado(getContext()));
    }

    @Override
    public void load() {
        ativo = this;
        ouvinteDeRede = new ConnectivityManager_(Rede.ouvir(getContext(), (estado) -> {
            String k = estado.toString();
            if (k.equals(ultimaRede)) return;
            ultimaRede = k;
            principal.post(() -> { if (getBridge() != null) notifyListeners("rede", estado); });
        }));
        // (os downloads que ficaram pela metade da última vez saem; o yt-dlp é preparado em segundo plano, para o
        // primeiro download não esperar o Android extrair o Python)
        Context ctxBaixador = getContext();
        preparando.execute(() -> {
            Baixador.limparSobras(ctxBaixador);
            try { Baixador.preparar(ctxBaixador); } catch (Exception e) { /* tenta de novo no primeiro download */ }
        });
        try {
            android.media.AudioManager am = (android.media.AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
            ouvinteDeSaida = new android.media.AudioDeviceCallback() {
                @Override public void onAudioDevicesAdded(android.media.AudioDeviceInfo[] d) { avisarSaida(); }
                @Override public void onAudioDevicesRemoved(android.media.AudioDeviceInfo[] d) { avisarSaida(); }
            };
            if (am != null) am.registerAudioDeviceCallback(ouvinteDeSaida, principal);
        } catch (Exception e) { ouvinteDeSaida = null; }
    }

    // (o Android troca a rota um instante depois de avisar: lê de novo logo depois)
    private void avisarSaida() {
        principal.removeCallbacks(lerSaida);
        principal.postDelayed(lerSaida, 400);
    }

    @Override
    protected void handleOnDestroy() {
        if (ativo == this) ativo = null;
        if (ouvinteDeRede != null) { Rede.parar(getContext(), ouvinteDeRede.cb); ouvinteDeRede = null; }
        principal.removeCallbacks(lerSaida);
        if (ouvinteDeSaida != null) {
            try {
                android.media.AudioManager am = (android.media.AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
                if (am != null) am.unregisterAudioDeviceCallback(ouvinteDeSaida);
            } catch (Exception e) { /* já saiu */ }
            ouvinteDeSaida = null;
        }
    }

    // abre as configurações de Bluetooth do Android (o botão "Bluetooth" da folha Conectar, como no Spotify)
    @PluginMethod
    public void abrirBluetooth(PluginCall call) {
        try {
            android.content.Intent i = new android.content.Intent(android.provider.Settings.ACTION_BLUETOOTH_SETTINGS);
            if (getActivity() != null) getActivity().startActivity(i);
            else { i.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK); getContext().startActivity(i); }
            call.resolve();
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    // por onde o som está saindo agora e o nome deste celular (ver SaidaDeSom)
    @PluginMethod
    public void saidaDeSom(PluginCall call) {
        try { call.resolve(SaidaDeSom.ler(getContext())); } catch (Exception e) { call.reject(String.valueOf(e.getMessage())); }
    }

    // entrega a ação ao site; false se o app não está aberto (aí ele é aberto com a ação)
    static boolean entregar(String acao) {
        EcoaPlugin p = ativo;
        if (p == null || p.getBridge() == null) { pendente = acao; return false; }
        // O Android já retomou a Activity antes de onNewIntent chamar este método.
        // Não acrescentar espera artificial: o evento fica retido pelo Capacitor até o JS ouvi-lo.
        p.principal.post(() -> {
            EcoaPlugin atual = ativo;
            if (atual == null || atual.getBridge() == null) { pendente = acao; return; }
            JSObject dados = new JSObject();
            dados.put("acao", acao);
            atual.notifyListeners("acao", dados, true);
        });
        return true;
    }

    // uma notificação do site (os downloads): { titulo, texto, tag, href, silenciosa, imagem }
    @PluginMethod
    public void avisar(PluginCall call) {
        // Android 13 ou mais novo exige permissão em tempo de execução. Antes, o APK só tentava
        // publicar o aviso e o Android descartava silenciosamente a notificação do download.
        if (Build.VERSION.SDK_INT >= 33 && getPermissionState("avisos") == PermissionState.PROMPT) {
            requestPermissionForAlias("avisos", call, "depoisDosAvisos");
            return;
        }
        mostrarAviso(call);
    }

    private void mostrarAviso(PluginCall call) {
        Avisos.mostrar(getContext(), call.getString("titulo", "Ecoa"), call.getString("texto", ""), call.getString("tag", ""),
            call.getString("href", ""), Boolean.TRUE.equals(call.getBoolean("silenciosa", false)), call.getString("imagem", ""),
            Boolean.TRUE.equals(call.getBoolean("fixa", false)), call.getInt("pct", -1));
        call.resolve();
    }

    // a notificação presa do download sai (pausou tudo, ou a fila acabou sem aviso final)
    @PluginMethod
    public void soltarAviso(PluginCall call) {
        Avisos.soltar();
        call.resolve();
    }

    @PermissionCallback
    private void depoisDosAvisos(PluginCall call) {
        if (getPermissionState("avisos") == PermissionState.GRANTED) mostrarAviso(call);
        else call.resolve(); // a pessoa pode continuar usando o app mesmo se não permitir avisos
    }

    // a versão deste APK instalado: { codigo, nome }
    @PluginMethod
    public void versao(PluginCall call) {
        try {
            android.content.pm.PackageInfo info = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            JSObject r = new JSObject();
            r.put("codigo", Build.VERSION.SDK_INT >= 28 ? info.getLongVersionCode() : info.versionCode);
            r.put("nome", info.versionName);
            call.resolve(r);
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    // baixa o APK novo ({ url }) e abre a tela de instalar do Android. O andamento vai no evento "atualizacao" ({ pct }).
    // Sem a permissão de instalar apps, abre a tela dela e devolve o erro "permitir" (a pessoa volta e toca de novo)
    @PluginMethod
    public void atualizar(PluginCall call) {
        String url = call.getString("url", "");
        if (url == null || !url.startsWith("https://")) { call.reject("Endereço da atualização inválido.", "erro"); return; }
        if (!Atualizacao.podeInstalar(getContext())) {
            Atualizacao.abrirPermissao(getActivity());
            call.reject("Permita que o Ecoa instale a atualização e toque em Atualizar de novo.", "permitir");
            return;
        }
        // (um download por vez: tocar em Atualizar de novo — no Sobre, no aviso de versão nova — acompanha o que já está
        // baixando. Antes cada toque começava outro download no mesmo arquivo, e as porcentagens dos dois se misturavam
        // na barra: 10, 20 e pouco, 5…)
        synchronized (ATUALIZANDO) {
            ATUALIZANDO.add(call);
            if (ATUALIZANDO.size() > 1) {
                if (ultimoPctAtualizacao >= 0) { JSObject d = new JSObject(); d.put("pct", ultimoPctAtualizacao); notifyListeners("atualizacao", d); }
                return;
            }
            ultimoPctAtualizacao = -1;
        }
        Executors.newSingleThreadExecutor().execute(() -> {
            File apk = null;
            String erro = null;
            try {
                apk = Atualizacao.baixar(getContext(), url, (pct) -> {
                    // (só para a frente)
                    if (pct <= ultimoPctAtualizacao) return;
                    ultimoPctAtualizacao = pct;
                    JSObject d = new JSObject();
                    d.put("pct", pct);
                    notifyListeners("atualizacao", d);
                });
                Atualizacao.instalar(getActivity(), apk);
            } catch (Exception e) {
                erro = String.valueOf(e.getMessage());
            }
            java.util.List<PluginCall> todos;
            synchronized (ATUALIZANDO) {
                todos = new java.util.ArrayList<>(ATUALIZANDO);
                ATUALIZANDO.clear();
                ultimoPctAtualizacao = -1;
            }
            for (PluginCall c : todos) {
                if (erro == null) c.resolve(); else c.reject(erro, "erro");
            }
        });
    }
    private static final java.util.List<PluginCall> ATUALIZANDO = new java.util.ArrayList<>();
    private static volatile int ultimoPctAtualizacao = -1;

    // a cor dos ícones da barra de status e da de navegação ({ escuros }): escuros no tema claro do site (fundo branco),
    // claros no escuro. O app vai de ponta a ponta, com as barras transparentes sobre o fundo do site
    @PluginMethod
    public void barras(PluginCall call) {
        boolean escuros = Boolean.TRUE.equals(call.getBoolean("escuros", false));
        getActivity().runOnUiThread(() -> {
            androidx.core.view.WindowInsetsControllerCompat c = androidx.core.view.WindowCompat.getInsetsController(getActivity().getWindow(), getActivity().getWindow().getDecorView());
            c.setAppearanceLightStatusBars(escuros);
            c.setAppearanceLightNavigationBars(escuros);
        });
        call.resolve();
    }

    @PluginMethod
    public void armazenamento(PluginCall call) {
        Executors.newSingleThreadExecutor().execute(() -> {
            try {
                Context ctx = getContext();
                JSObject r = new JSObject();
                long total = 0, livre = 0, app = 0;
                // os números das Configurações do Android (Armazenamento): o total do celular (os 128 GB da caixa) e o
                // livre, e o que o Ecoa ocupa (o app, os dados — os downloads no WebView — e o cache), pelo próprio
                // Android. Antes era só a partição de dados (menor que o total do celular) e a pasta do app medida à mão
                if (Build.VERSION.SDK_INT >= 26) {
                    try {
                        android.app.usage.StorageStatsManager ssm = ctx.getSystemService(android.app.usage.StorageStatsManager.class);
                        total = ssm.getTotalBytes(android.os.storage.StorageManager.UUID_DEFAULT);
                        livre = ssm.getFreeBytes(android.os.storage.StorageManager.UUID_DEFAULT);
                        try {
                            android.app.usage.StorageStats st = ssm.queryStatsForPackage(android.os.storage.StorageManager.UUID_DEFAULT, ctx.getPackageName(), android.os.Process.myUserHandle());
                            app = st.getAppBytes() + st.getDataBytes() + st.getCacheBytes();
                        } catch (Exception semApp) {
                            app = 0; // (medido à mão, abaixo)
                        }
                    } catch (Exception e) {
                        total = 0;
                    }
                }
                if (total <= 0) {
                    StatFs fs = new StatFs(Environment.getDataDirectory().getPath());
                    total = fs.getTotalBytes();
                    livre = fs.getAvailableBytes();
                }
                if (app <= 0) {
                    app = tamanho(ctx.getDataDir());
                    File ext = ctx.getExternalCacheDir();
                    if (ext != null) app += tamanho(ext.getParentFile());
                }
                r.put("total", total);
                r.put("livre", livre);
                r.put("app", app);
                call.resolve(r);
            } catch (Exception e) {
                call.reject(e.getMessage());
            }
        });
    }

    private static long tamanho(File f) {
        if (f == null || !f.exists()) return 0;
        if (f.isFile()) return f.length();
        long t = 0;
        File[] filhos = f.listFiles();
        if (filhos != null) for (File c : filhos) {
            try {
                if (!c.getCanonicalPath().startsWith(f.getCanonicalPath())) continue; // não segue os atalhos para fora
            } catch (Exception e) { continue; }
            t += tamanho(c);
        }
        return t;
    }

    // ---- os downloads do YouTube no próprio celular (Baixador: o yt-dlp do APK, sem o servidor Python) ----
    // (dois ao mesmo tempo: o som e o clipe da mesma música, como no servidor)
    private static final java.util.concurrent.ExecutorService baixando = Executors.newFixedThreadPool(2);
    private static final java.util.concurrent.ExecutorService preparando = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void baixadorLocal(PluginCall call) {
        Context ctx = getContext();
        boolean atualizar = Boolean.TRUE.equals(call.getBoolean("atualizar", false));
        boolean forcar = Boolean.TRUE.equals(call.getBoolean("forcar", false));
        preparando.execute(() -> {
            JSObject r = new JSObject();
            try {
                Baixador.preparar(ctx);
                if (atualizar || forcar) r.put("atualizacao", Baixador.atualizar(ctx, forcar));
                r.put("pronto", true);
                r.put("versao", Baixador.versao(ctx));
            } catch (Exception e) {
                r.put("pronto", false);
                r.put("erro", String.valueOf(e.getMessage()));
            }
            call.resolve(r);
        });
    }

    @PluginMethod
    public void baixarLocal(PluginCall call) {
        Context ctx = getContext();
        String video = call.getString("video", "");
        boolean comVideo = Boolean.TRUE.equals(call.getBoolean("comVideo", false));
        String qualidade = Baixador.qualidade(call.getString("qualidade", "alta"));
        String processo = call.getString("processo", video + (comVideo ? "-v" : "-a"));
        baixando.execute(() -> {
            java.io.File pasta = Baixador.pastaDe(ctx, processo);
            try {
                Baixador.Resultado res = Baixador.baixar(ctx, video, comVideo, qualidade, pasta, processo, (p) -> {
                    JSObject ev = new JSObject();
                    ev.put("processo", processo);
                    ev.put("pct", p);
                    if (getBridge() != null) notifyListeners("baixando", ev);
                });
                JSObject r = new JSObject();
                r.put("caminho", res.arquivo.getAbsolutePath());
                r.put("tipo", res.tipo);
                r.put("tamanho", res.arquivo.length());
                r.put("qualidade", qualidade);
                if (res.altura != null) r.put("altura", res.altura);
                if (res.titulo != null) r.put("titulo", res.titulo);
                if (res.duracao != null) r.put("duracao", res.duracao);
                call.resolve(r);
            } catch (com.yausername.youtubedl_android.YoutubeDL.CanceledException e) {
                call.reject("Cancelado", "cancelado");
            } catch (Exception e) {
                String msg = String.valueOf(e.getMessage());
                call.reject(msg, Baixador.pedeLogin(msg) ? "login" : "erro");
            }
        });
    }

    @PluginMethod
    public void cancelarLocal(PluginCall call) {
        String processo = call.getString("processo", "");
        JSObject r = new JSObject();
        r.put("cancelado", !processo.isEmpty() && Baixador.cancelar(processo));
        call.resolve(r);
    }

    // o arquivo baixado já guardado pelo site: sai da pasta temporária (só dentro dela: nada fora é apagado)
    @PluginMethod
    public void apagarLocal(PluginCall call) {
        String caminho = call.getString("caminho", "");
        try {
            java.io.File raiz = new java.io.File(getContext().getCacheDir(), "baixar").getCanonicalFile();
            java.io.File f = new java.io.File(caminho).getCanonicalFile();
            if (f.getPath().startsWith(raiz.getPath() + java.io.File.separator)) {
                java.io.File pasta = f.getParentFile();
                Baixador.limpar(pasta);
                if (pasta != null && !pasta.equals(raiz)) //noinspection ResultOfMethodCallIgnored
                    pasta.delete();
            }
        } catch (Exception e) { /* já saiu */ }
        call.resolve();
    }

    // ---- o karaokê no próprio celular (Karaoke.java): um por vez (a separação usa os núcleos do processador)
    private static final java.util.concurrent.ExecutorService separando = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void karaokeDisponivel(PluginCall call) {
        JSObject r = new JSObject();
        r.put("tem", true);
        r.put("modelo", Karaoke.temModelo(getContext()));
        call.resolve(r);
    }

    // o áudio da música chega em partes (base64 de até ~2 MB cada): antes ia inteiro numa chamada só, e um arquivo grande
    // travava a ponte entre a página e o Android
    @PluginMethod
    public void arquivoParte(PluginCall call) {
        String processo = call.getString("processo", "");
        String dados = call.getString("dados", "");
        boolean inicio = Boolean.TRUE.equals(call.getBoolean("inicio", false));
        try {
            java.io.File pasta = Baixador.pastaDe(getContext(), processo);
            if (inicio) { Baixador.limpar(pasta); }
            pasta.mkdirs();
            java.io.File f = new java.io.File(pasta, "entrada.bin");
            try (java.io.OutputStream o = new java.io.FileOutputStream(f, !inicio)) {
                o.write(android.util.Base64.decode(dados, android.util.Base64.DEFAULT));
            }
            JSObject r = new JSObject();
            r.put("tamanho", f.length());
            call.resolve(r);
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()), "erro");
        }
    }

    // o modelo do karaokê baixado de antemão (no Wi-Fi, ao abrir o app): o primeiro karaokê não espera os 59 MB
    @PluginMethod
    public void prepararKaraoke(PluginCall call) {
        Context ctx = getContext();
        preparandoModelo.execute(() -> {
            try { Karaoke.modelo(ctx, (e, p) -> { }); } catch (Exception e) { /* tenta de novo na próxima vez */ }
        });
        call.resolve();
    }
    private static final java.util.concurrent.ExecutorService preparandoModelo = Executors.newSingleThreadExecutor();
    // (os pedidos da pessoa num lugar à parte: não esperam os de segundo plano na fila)
    private static final java.util.concurrent.ExecutorService separandoPedido = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void karaokeLocal(PluginCall call) {
        Context ctx = getContext();
        String dados = call.getString("dados", null);
        boolean temArquivo = Boolean.TRUE.equals(call.getBoolean("temArquivo", false));
        boolean prioridade = Boolean.TRUE.equals(call.getBoolean("prioridade", false));
        String video = call.getString("video", "");
        String nome = call.getString("nome", "audio");
        String processo = call.getString("processo", "karaoke-" + System.currentTimeMillis());
        if (prioridade) Karaoke.PEDIDOS.incrementAndGet();
        (prioridade ? separandoPedido : separando).execute(() -> {
            java.io.File pasta = Baixador.pastaDe(ctx, processo);
            java.io.File trabalho = new java.io.File(pasta, "trabalho");
            Karaoke.Andamento andamento = (etapa, p) -> {
                JSObject ev = new JSObject();
                ev.put("processo", processo);
                ev.put("etapa", etapa);
                ev.put("pct", p);
                if (getBridge() != null) notifyListeners("karaoke", ev);
            };
            try {
                pasta.mkdirs();
                java.io.File entrada;
                String extensao = nome.toLowerCase(java.util.Locale.ROOT).replaceAll("^.*\\.", "");
                java.io.File recebido = new java.io.File(pasta, "entrada.bin");
                if (temArquivo && recebido.isFile()) {
                    // (o áudio que chegou em partes)
                    entrada = new java.io.File(pasta, "entrada." + (extensao.matches("[a-z0-9]{2,5}") ? extensao : "m4a"));
                    if (!recebido.renameTo(entrada)) entrada = recebido;
                } else if (dados != null && !dados.isEmpty()) {
                    String ext = nome.toLowerCase(java.util.Locale.ROOT).replaceAll("^.*\\.", "");
                    entrada = new java.io.File(pasta, "entrada." + (ext.matches("[a-z0-9]{2,5}") ? ext : "m4a"));
                    try (java.io.OutputStream o = new java.io.FileOutputStream(entrada)) {
                        o.write(android.util.Base64.decode(dados, android.util.Base64.DEFAULT));
                    }
                } else {
                    // (sem o áudio no aparelho: o próprio celular baixa a música do YouTube)
                    java.io.File pastaAudio = new java.io.File(pasta, "audio");
                    entrada = Baixador.baixar(ctx, video, false, "alta", pastaAudio, processo + "-audio",
                        (p) -> andamento.em("baixando", p)).arquivo;
                }
                java.io.File saida = new java.io.File(pasta, "karaoke.m4a");
                Karaoke.Resultado res = Karaoke.fazer(ctx, entrada, saida, trabalho, andamento, prioridade);
                //noinspection ResultOfMethodCallIgnored
                entrada.delete();
                Baixador.limpar(trabalho);
                JSObject r = new JSObject();
                r.put("caminho", saida.getAbsolutePath());
                r.put("tipo", "audio/mp4");
                r.put("tamanho", res.tamanho);
                r.put("duracao", res.duracao);
                call.resolve(r);
            } catch (Throwable e) {
                Baixador.limpar(pasta);
                String msg = e instanceof OutOfMemoryError ? "o celular ficou sem memória para separar a voz desta música" : String.valueOf(e.getMessage());
                call.reject(msg, "erro");
            } finally {
                if (prioridade) Karaoke.PEDIDOS.decrementAndGet();
            }
        });
    }

    // ---- a importação de áudio: o formato que a WebView não toca (WMA, AIFF, AMR, APE, ALAC, AC3, MKA…) vira M4A (AAC
    // estéreo, 192 kb/s) pelo ffmpeg do APK, para a música tocar, ter o karaokê e ser transcrita como as outras
    private static final java.util.concurrent.ExecutorService convertendo = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void converterAudio(PluginCall call) {
        Context ctx = getContext();
        String dados = call.getString("dados", null);
        String nome = call.getString("nome", "audio");
        if (dados == null || dados.isEmpty()) { call.reject("sem o arquivo", "entrada"); return; }
        convertendo.execute(() -> {
            java.io.File pasta = Baixador.pastaDe(ctx, "converter-" + System.currentTimeMillis());
            try {
                pasta.mkdirs();
                Baixador.preparar(ctx); // (o ffmpeg do APK extraído)
                String ext = nome.toLowerCase(java.util.Locale.ROOT).replaceAll("^.*\\.", "");
                java.io.File entrada = new java.io.File(pasta, "entrada." + (ext.matches("[a-z0-9]{2,5}") ? ext : "bin"));
                try (java.io.OutputStream o = new java.io.FileOutputStream(entrada)) {
                    o.write(android.util.Base64.decode(dados, android.util.Base64.DEFAULT));
                }
                java.io.File saida = new java.io.File(pasta, "audio.m4a");
                java.io.File log = new java.io.File(pasta, "ffmpeg.log");
                Process p = Karaoke.processo(ctx, Karaoke.ffmpeg(ctx, "-v", "error", "-nostdin", "-y", "-i", entrada.getAbsolutePath(),
                    "-vn", "-map", "0:a:0", "-ac", "2", "-ar", "44100", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
                    saida.getAbsolutePath())).redirectErrorStream(true).redirectOutput(log).start();
                if (p.waitFor() != 0 || !saida.isFile() || saida.length() == 0) {
                    String motivo = Karaoke.lerTexto(log);
                    throw new IllegalStateException("o ffmpeg não abriu este arquivo" + (motivo.isEmpty() ? "" : " (" + motivo.substring(0, Math.min(160, motivo.length())) + ")"));
                }
                byte[] b = new byte[(int) saida.length()];
                try (java.io.InputStream in = new java.io.FileInputStream(saida)) {
                    int lido = 0;
                    while (lido < b.length) { int n = in.read(b, lido, b.length - lido); if (n < 0) break; lido += n; }
                }
                JSObject r = new JSObject();
                r.put("dados", android.util.Base64.encodeToString(b, android.util.Base64.NO_WRAP));
                r.put("tipo", "audio/mp4");
                call.resolve(r);
            } catch (Throwable e) {
                call.reject(e instanceof OutOfMemoryError ? "o arquivo é grande demais para converter no celular" : String.valueOf(e.getMessage()), "erro");
            } finally {
                Baixador.limpar(pasta);
            }
        });
    }

    // ---- o Lúmen no próprio celular (Gemini.java): a chave não sai do APK para a página
    private static final java.util.concurrent.ExecutorService perguntando = Executors.newFixedThreadPool(2);

    // ---- conversa por voz em tempo real: Firebase AI Logic / Gemini Live, sem servidor próprio
    @PluginMethod
    public void lumenAoVivoIniciar(PluginCall call) {
        if (getPermissionState("microfone") != PermissionState.GRANTED) {
            requestPermissionForAlias("microfone", call, "depoisDoMicrofone");
            return;
        }
        iniciarLumenAoVivo(call);
    }

    @PermissionCallback
    private void depoisDoMicrofone(PluginCall call) {
        if (getPermissionState("microfone") == PermissionState.GRANTED) iniciarLumenAoVivo(call);
        else call.reject("Permita o acesso ao microfone para iniciar a conversa ao vivo.", "sem-microfone");
    }

    private void iniciarLumenAoVivo(PluginCall call) {
        String genero = call.getString("genero", "feminina");
        String instrucao = call.getString("instrucao",
            "Você é o Lúmen, assistente do Songbook Litúrgico. Responda em português do Brasil, naturalmente e com frases curtas.");
        GeminiLive.iniciar(genero, instrucao, ContextCompat.getMainExecutor(getContext()), new GeminiLive.Retorno() {
            @Override public void sucesso() {
                JSObject r = new JSObject();
                r.put("ativa", true);
                r.put("modelo", GeminiLive.MODELO);
                call.resolve(r);
            }
            @Override public void erro(Throwable erro) {
                call.reject("Não foi possível iniciar a conversa ao vivo: " + String.valueOf(erro.getMessage()), "gemini-live");
            }
        });
    }

    @PluginMethod
    public void lumenAoVivoParar(PluginCall call) {
        GeminiLive.parar(ContextCompat.getMainExecutor(getContext()), new GeminiLive.Retorno() {
            @Override public void sucesso() {
                JSObject r = new JSObject();
                r.put("ativa", false);
                call.resolve(r);
            }
            @Override public void erro(Throwable erro) {
                call.reject("Não foi possível encerrar a conversa: " + String.valueOf(erro.getMessage()), "gemini-live");
            }
        });
    }

    @PluginMethod
    public void lumenAoVivoStatus(PluginCall call) {
        JSObject r = new JSObject();
        r.put("ativa", GeminiLive.ativa());
        call.resolve(r);
    }

    // Transcrição de áudio pela ponte segura do Firebase AI Logic: nenhuma chave Gemini manual no APK.
    private static final java.util.concurrent.ExecutorService transcrevendoFirebase = Executors.newFixedThreadPool(2);

    @PluginMethod
    public void transcreverAudioFirebase(PluginCall call) {
        String dados = call.getString("dados", "");
        String prompt = call.getString("prompt", "");
        String mimeType = call.getString("mimeType", "audio/wav");
        if (dados == null || dados.isEmpty() || prompt == null || prompt.trim().isEmpty()) {
            call.reject("Áudio ou instrução de transcrição ausente.", "entrada");
            return;
        }
        // Os blocos de 88 s em PCM mono ficam abaixo do limite de entrada inline do Firebase AI Logic.
        if (dados.length() > 21000000) {
            call.reject("Este trecho de áudio ficou grande demais para enviar à IA.", "audio-grande");
            return;
        }
        transcrevendoFirebase.execute(() -> {
            try {
                byte[] audio = android.util.Base64.decode(dados, android.util.Base64.DEFAULT);
                if (audio.length == 0 || audio.length > 15 * 1024 * 1024) {
                    call.reject("O trecho de áudio está vazio ou excede o limite permitido.", "audio-grande");
                    return;
                }
                com.google.firebase.ai.GenerativeModel modelo = com.google.firebase.ai.FirebaseAI
                    .getInstance(com.google.firebase.ai.type.GenerativeBackend.googleAI())
                    .generativeModel("gemini-3.8-flash");
                com.google.firebase.ai.type.Content entrada = new com.google.firebase.ai.type.Content.Builder()
                    .addInlineData(audio, mimeType)
                    .addText(prompt)
                    .build();
                com.google.firebase.ai.java.GenerativeModelFutures futuro =
                    com.google.firebase.ai.java.GenerativeModelFutures.from(modelo);
                com.google.common.util.concurrent.ListenableFuture<com.google.firebase.ai.type.GenerateContentResponse> pedido =
                    futuro.generateContent(entrada);
                com.google.common.util.concurrent.Futures.addCallback(pedido,
                    new com.google.common.util.concurrent.FutureCallback<com.google.firebase.ai.type.GenerateContentResponse>() {
                        @Override public void onSuccess(com.google.firebase.ai.type.GenerateContentResponse resposta) {
                            String texto = resposta == null ? "" : resposta.getText();
                            if (texto == null || texto.trim().isEmpty()) {
                                call.reject("O Firebase AI Logic não retornou a transcrição deste trecho.", "sem-transcricao");
                                return;
                            }
                            JSObject resultado = new JSObject();
                            resultado.put("texto", texto);
                            resultado.put("modelo", "gemini-3.8-flash");
                            call.resolve(resultado);
                        }
                        @Override public void onFailure(Throwable erro) {
                            String mensagem = erro == null || erro.getMessage() == null
                                ? "falha ao processar o áudio" : erro.getMessage();
                            call.reject("Firebase AI Logic: " + mensagem, "firebase-ai");
                        }
                    }, ContextCompat.getMainExecutor(getContext()));
            } catch (Throwable erro) {
                String mensagem = erro == null || erro.getMessage() == null
                    ? "falha ao preparar o áudio" : erro.getMessage();
                call.reject("Não foi possível preparar a transcrição: " + mensagem, "firebase-ai");
            }
        });
    }

    @PluginMethod
    public void geminiDisponivel(PluginCall call) {
        JSObject r = new JSObject();
        r.put("tem", Gemini.temChave());
        call.resolve(r);
    }

    @PluginMethod
    public void gemini(PluginCall call) {
        String caminho = call.getString("caminho", "");
        String corpo = call.getString("corpo", null);
        int tempo = call.getInt("tempo", 150000);
        if (!Gemini.temChave()) { call.reject("Este app foi montado sem a chave do Gemini", "sem-chave"); return; }
        if (!Gemini.caminhoValido(caminho)) { call.reject("caminho inválido", "caminho"); return; }
        Context ctx = getContext();
        perguntando.execute(() -> {
            Gemini.Resposta g = Gemini.chamar(ctx, caminho, corpo, Math.max(10000, Math.min(tempo, 300000)));
            JSObject r = new JSObject();
            r.put("status", g.status);
            r.put("texto", g.texto);
            call.resolve(r);
        });
    }

    // (várias ao mesmo tempo: a tela do artista e a biblioteca pedem muitas de uma vez. Eram só 6: os pedidos parados
    // num servidor fora do ar, esperando o tempo limite, ocupavam a fila, e a foto dos artistas, o Deezer, o Cifra Club e
    // as letras esperavam atrás deles. As linhas que sobram são desfeitas depois de 30 s paradas)
    private static final java.util.concurrent.ThreadPoolExecutor lendoPaginas = new java.util.concurrent.ThreadPoolExecutor(
        24, 24, 30, java.util.concurrent.TimeUnit.SECONDS, new java.util.concurrent.LinkedBlockingQueue<>());
    static { lendoPaginas.allowCoreThreadTimeOut(true); }

    @PluginMethod
    public void buscarPagina(PluginCall call) {
        String url = call.getString("url", "");
        JSObject cab = call.getObject("cabecalhos", null);
        int tempo = Math.max(3000, Math.min(60000, call.getInt("tempo", 15000)));
        lendoPaginas.execute(() -> {
            Paginas.Resposta p = Paginas.buscar(url, cab, tempo);
            JSObject r = new JSObject();
            r.put("status", p.status);
            r.put("texto", p.texto);
            r.put("tipo", p.tipo);
            call.resolve(r);
        });
    }

    @PluginMethod
    public void capasOffline(PluginCall call) {
        java.util.List<String> urls = new java.util.ArrayList<>();
        try {
            com.getcapacitor.JSArray a = call.getArray("urls");
            if (a != null) for (int i = 0; i < a.length() && i < 1000; i++) urls.add(a.getString(i));
        } catch (Exception e) { /* lista estragada: nada */ }
        Capas.guardarTodas(getContext(), urls);
        call.resolve();
    }

    @PluginMethod
    public void pronto(PluginCall call) {
        String p = pendente;
        pendente = null;
        if (p != null) entregar(p);
        call.resolve();
    }

    @PluginMethod
    public void musica(PluginCall call) {
        Context ctx = getContext();
        String titulo = call.getString("titulo", "");
        String artista = call.getString("artista", "");
        String capa = call.getString("capa", "");
        boolean tocando = Boolean.TRUE.equals(call.getBoolean("tocando", false));
        Double duracao = call.getDouble("duracao", 0.0);
        Double tempo = call.getDouble("tempo", 0.0);
        SharedPreferences.Editor e = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit();
        e.putString("titulo", titulo).putString("artista", artista).putBoolean("tocando", tocando)
            .putFloat("duracao", duracao == null ? 0f : duracao.floatValue()).putFloat("tempo", tempo == null ? 0f : tempo.floatValue())
            .putLong("quando", android.os.SystemClock.elapsedRealtime());
        boolean capaNova = !capa.equals(ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("capa", ""));
        e.putString("capa", capa).apply();
        if (capaNova) Capas.baixar(ctx, capa, () -> { EcoaWidget.atualizarTodos(ctx); Sessao.atualizar(ctx); TocandoService.atualizar(ctx); });
        EcoaWidget.atualizarTodos(ctx);
        Sessao.atualizar(ctx);
        // (tocando do aparelho — a música baixada, o áudio da pessoa —, a página continua visível com o app minimizado e
        // a música não pausa. A do YouTube pausa escondida: é a regra do YouTube, que o app não contorna)
        EcoaWebView.definirTocando(tocando && Boolean.TRUE.equals(call.getBoolean("doAparelho", false)));
        // (o aviso de "tocando" mantém o app vivo em segundo plano enquanto toca)
        if (tocando) {
            if (Build.VERSION.SDK_INT >= 33 && getPermissionState("avisos") == PermissionState.PROMPT) {
                requestPermissionForAlias("avisos", call, "depoisDaPermissao");
                return;
            }
            TocandoService.ligar(ctx);
        } else TocandoService.atualizar(ctx);
        call.resolve();
    }

    @PermissionCallback
    private void depoisDaPermissao(PluginCall call) {
        TocandoService.ligar(getContext());
        call.resolve();
    }

    @PluginMethod
    public void parou(PluginCall call) {
        EcoaWebView.definirTocando(false);
        TocandoService.desligar(getContext());
        call.resolve();
    }

    @PluginMethod
    public void entrarComGoogle(PluginCall call) {
        Context ctx = getActivity();
        CredentialManager cm = CredentialManager.create(ctx);
        GetSignInWithGoogleOption opcao = new GetSignInWithGoogleOption.Builder(CLIENTE_GOOGLE).build();
        GetCredentialRequest pedido = new GetCredentialRequest.Builder().addCredentialOption(opcao).build();
        cm.getCredentialAsync(ctx, pedido, new CancellationSignal(), Executors.newSingleThreadExecutor(),
            new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                @Override
                public void onResult(GetCredentialResponse r) {
                    Credential c = r.getCredential();
                    if (c instanceof CustomCredential && GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(c.getType())) {
                        GoogleIdTokenCredential g = GoogleIdTokenCredential.createFrom(((CustomCredential) c).getData());
                        JSObject res = new JSObject();
                        res.put("idToken", g.getIdToken());
                        res.put("email", g.getId());
                        res.put("nome", g.getDisplayName());
                        call.resolve(res);
                    } else call.reject("O Google não devolveu a conta.", "sem-conta");
                }

                @Override
                public void onError(GetCredentialException e) {
                    if (e instanceof GetCredentialCancellationException) call.reject("Cancelado.", "cancelado");
                    else if (e instanceof NoCredentialException) call.reject("Nenhuma conta Google neste aparelho.", "sem-conta");
                    else call.reject(String.valueOf(e.getMessage()), "erro");
                }
            });
    }

    @PluginMethod
    public void sairDoGoogle(PluginCall call) {
        CredentialManager cm = CredentialManager.create(getContext());
        cm.clearCredentialStateAsync(new ClearCredentialStateRequest(), new CancellationSignal(), Executors.newSingleThreadExecutor(),
            new CredentialManagerCallback<Void, ClearCredentialException>() {
                @Override public void onResult(Void v) { call.resolve(); }
                @Override public void onError(ClearCredentialException e) { call.resolve(); }
            });
    }
}
