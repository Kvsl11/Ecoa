package br.ecoa.app;

import android.Manifest;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;

import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.google.firebase.FirebaseApp;
import com.google.firebase.appcheck.FirebaseAppCheck;
import com.google.firebase.appcheck.AppCheckProviderFactory;
import com.google.firebase.appcheck.playintegrity.PlayIntegrityAppCheckProviderFactory;

import android.os.Handler;
import android.os.Looper;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

// A tela do Ecoa: o site (https://kvsl11.github.io/Ecoa/) num WebView, com o plugin "Ecoa" para o que só o
// Android faz: o widget da tela inicial, o aviso de "tocando" com os botões, o login do Google pelo próprio Android
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(EcoaPlugin.class);
        super.onCreate(savedInstanceState);

        // Firebase AI Logic: App Check é ativado antes de qualquer chamada ao Gemini.
        // Em builds de desenvolvimento usa o provedor debug; no APK release usa Play Integrity.
        FirebaseApp.initializeApp(this);
        FirebaseAppCheck appCheck = FirebaseAppCheck.getInstance();
        if (BuildConfig.DEBUG) {
            // A dependência do provedor de depuração existe apenas no build debug. A resolução por reflexão
            // evita que a compilação release tente carregar uma classe que não faz parte dela.
            try {
                Class<?> tipo = Class.forName("com.google.firebase.appcheck.debug.DebugAppCheckProviderFactory");
                AppCheckProviderFactory provedor = (AppCheckProviderFactory) tipo.getMethod("getInstance").invoke(null);
                appCheck.installAppCheckProviderFactory(provedor);
            } catch (Exception erro) {
                throw new IllegalStateException("Não foi possível iniciar o App Check de depuração.", erro);
            }
        } else {
            appCheck.installAppCheckProviderFactory(PlayIntegrityAppCheckProviderFactory.getInstance());
        }

        // Esta montagem publica um APK novo com a versão Android incrementada no GitHub Actions.
        // Edge-to-edge: o WebView ocupa também as áreas das barras do Android.
        // As barras transparentes deixam aparecer o fundo do app; os ícones permanecem claros.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            getWindow().setStatusBarContrastEnforced(false);
            getWindow().setNavigationBarContrastEnforced(false);
        }
        WindowInsetsControllerCompat barras = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        barras.setAppearanceLightStatusBars(false);
        barras.setAppearanceLightNavigationBars(false);

        Acoes.daIntent(getIntent());
        abrirLink(getIntent());
        pedirNotificacoes();
        // O texto do mesmo tamanho do site no Chrome: o WebView aumenta o texto pelo "Tamanho da fonte" do Android, e no
        // app tudo ficava maior, com textos quebrados, sobrepostos e telas espremidas (o site é feito para o tamanho normal)
        if (getBridge() != null && getBridge().getWebView() != null) getBridge().getWebView().getSettings().setTextZoom(100);
        // Sem o zoom de página do WebView (os dois dedos e os dois toques): o app não amplia como um site
        if (getBridge() != null && getBridge().getWebView() != null) {
            android.webkit.WebSettings ajustes = getBridge().getWebView().getSettings();
            ajustes.setSupportZoom(false);
            ajustes.setBuiltInZoomControls(false);
            ajustes.setDisplayZoomControls(false);
        }
        protegerDaTelaCinza();
        tratarOVoltar();
    }

    // ---- o voltar do Android (o gesto de arrastar da borda ou o botão)
    // Sem isto, o voltar fechava o app inteiro, em qualquer tela. Agora ele faz o que faz no navegador: a página fecha
    // primeiro o que estiver aberto por cima (uma janela, uma folha, o menu: window.ecoaVoltar), senão volta para a tela
    // anterior do app (o histórico do WebView: as telas cheias, como o Tocando agora, também saem assim). Na primeira
    // tela, o app vai para o segundo plano, sem fechar (a música continua tocando)
    private void tratarOVoltar() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView w = getBridge() == null ? null : getBridge().getWebView();
                if (w == null) { moveTaskToBack(true); return; }
                try {
                    w.evaluateJavascript("(function(){try{return window.ecoaVoltar?String(window.ecoaVoltar()):'false'}catch(e){return 'false'}})()", (r) -> {
                        if (r != null && r.contains("true")) return; // (a página fechou o que estava aberto)
                        if (w.canGoBack()) w.goBack();
                        else moveTaskToBack(true);
                    });
                } catch (Exception e) {
                    if (w.canGoBack()) w.goBack(); else moveTaskToBack(true);
                }
            }
        });
    }

    // ---- a tela cinza ao voltar ao app
    // Minimizado, o Android pode matar o processo que desenha a página (para liberar memória). Sem tratar isso, ao voltar
    // ficava a tela cinza para sempre: agora a tela é refeita sozinha. E o processo da página fica com prioridade alta,
    // para o Android só matar em último caso
    private final Handler principal = new Handler(Looper.getMainLooper());
    private boolean refazendo = false;

    private void protegerDaTelaCinza() {
        if (getBridge() == null) return;
        WebView w = getBridge().getWebView();
        if (w != null && Build.VERSION.SDK_INT >= 26) {
            try { w.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false); } catch (Exception e) { /* segue com a padrão */ }
        }
        getBridge().addWebViewListener(new WebViewListener() {
            @Override
            public boolean onRenderProcessGone(WebView webView, RenderProcessGoneDetail detail) {
                refazerATela();
                return true; // (tratado: sem isto, o Android fecha o app)
            }

            @Override
            public void onPageLoaded(WebView webView) {
                avisarTema();
            }
        });
    }

    private void refazerATela() {
        if (refazendo) return;
        refazendo = true;
        principal.post(() -> {
            try { recreate(); } catch (Exception e) { finish(); startActivity(new Intent(this, MainActivity.class)); }
        });
    }

    // Ao voltar: a página responde? Se em 10 s não responder (travou) ou voltar sem nada desenhado, a tela é refeita
    private int conferencia = 0;
    // "ok": o app terminou de abrir (window.__songbookOk, do app.js); senão, quantas coisas a página tem
    private static final String SITUACAO = "(function(){return window.__songbookOk ? 'ok' : (document.body ? document.body.children.length : 0)})()";
    // (no máximo 2 recargas seguidas sem o app abrir: depois, a tela é refeita de vez, sem ficar recarregando em ciclo)
    private int recargas = 0;

    private void recarregar(WebView w) {
        if (++recargas > 2) { recargas = 0; refazerATela(); return; }
        try { w.reload(); } catch (Exception e) { refazerATela(); }
    }

    // ---- o modo escuro ou claro do aparelho, para o tema "Automático" do app
    // O WebView não responde ao prefers-color-scheme pelo aparelho, e sim pelo tema do app (e a tela não é refeita quando
    // o modo do Android muda: uiMode está em configChanges), então o automático caía no claro com o aparelho no escuro.
    // O Android diz o modo de verdade à página (window.ecoaTemaDoSistema e o evento "ecoa:tema") ao abrir, ao voltar ao
    // app e quando o modo muda; a página guarda o último para o começo da próxima abertura (index.html)
    private void avisarTema() {
        WebView w = getBridge() == null ? null : getBridge().getWebView();
        if (w == null) return;
        boolean escuro = (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
        String t = escuro ? "dark" : "light";
        String js = "(function(){window.ecoaTemaDoSistema='" + t + "';try{localStorage.setItem('songbook.temaSistema','" + t
            + "')}catch(e){}try{window.dispatchEvent(new Event('ecoa:tema'))}catch(e){}})()";
        principal.post(() -> { try { w.evaluateJavascript(js, null); } catch (Exception e) { /* a página ainda não abriu */ } });
    }

    @Override
    public void onConfigurationChanged(Configuration nova) {
        super.onConfigurationChanged(nova);
        avisarTema();
    }

    @Override
    public void onResume() {
        super.onResume();
        avisarTema();
        if (getBridge() == null || getBridge().getWebView() == null) return;
        final int esta = ++conferencia;
        final boolean[] respondeu = { false };
        principal.postDelayed(() -> {
            WebView w = getBridge() == null ? null : getBridge().getWebView();
            if (w == null || esta != conferencia) return;
            try {
                w.evaluateJavascript(SITUACAO, (r) -> {
                    respondeu[0] = true;
                    // (a página sem nada: carrega de novo)
                    if ("0".equals(r) || "null".equals(r)) { recarregar(w); return; }
                    if ("\"ok\"".equals(r)) { recargas = 0; return; }
                    // A página responde, mas o app não terminou de abrir (ficou esperando algo da internet que não veio, com
                    // a tela vazia): mais um tempo e, ainda sem abrir, carrega de novo. Antes só se conferia se a página
                    // tinha alguma coisa dentro, e ela tinha, então a tela ficava cinza para sempre
                    principal.postDelayed(() -> {
                        if (esta != conferencia) return;
                        try {
                            w.evaluateJavascript(SITUACAO, (r2) -> { if (!"\"ok\"".equals(r2)) recarregar(w); else recargas = 0; });
                        } catch (Exception e) { refazerATela(); }
                    }, 8000);
                });
            } catch (Exception e) {
                refazerATela();
                return;
            }
            principal.postDelayed(() -> { if (esta == conferencia && !respondeu[0] && !isFinishing()) refazerATela(); }, 10000);
        }, 1200);
    }

    @Override
    public void onPause() {
        conferencia++; // (saiu antes da conferência: ela não vale)
        super.onPause();
    }

    // As notificações (os downloads e o player) com a pergunta do próprio Android, uma vez, ao abrir o app pela primeira
    // vez. Depois, quem quiser muda em Configurações → Apps → Ecoa → Notificações (o Android não deixa perguntar de novo)
    private void pedirNotificacoes() {
        if (Build.VERSION.SDK_INT < 33) return;
        if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) return;
        SharedPreferences p = getSharedPreferences(EcoaPlugin.PREFS, MODE_PRIVATE);
        if (p.getBoolean("pediuAvisos", false)) return;
        p.edit().putBoolean("pediuAvisos", true).apply();
        requestPermissions(new String[] { Manifest.permission.POST_NOTIFICATIONS }, 7);
    }

    // (o app já aberto, e um botão do widget ou do aviso trouxe ele para a frente com uma ação)
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        Acoes.daIntent(intent);
        abrirLink(intent);
    }

    // O link de uma música compartilhada que abriu o app: https://kvsl11.github.io/Ecoa/#/ouvir/<nome>/<artista> ou
    // ecoa://ouvir/<nome>/<artista>. A página vai para a tela da música (a rota "#/ouvir/..."). Com o app abrindo
    // agora, a página ainda não carregou: tenta de novo a cada meio segundo, por até 30 s. O endereço é trocado assim
    // que a página existe, sem esperar o app carregar: quem não entrou vê a tela da prévia já (o index.html a mostra), e
    // não a tela de entrada até o app terminar de abrir; com o app pronto, o endereço é conferido de novo.
    private void abrirLink(Intent intent) {
        if (intent == null || !Intent.ACTION_VIEW.equals(intent.getAction()) || intent.getData() == null) return;
        android.net.Uri uri = intent.getData();
        String rota = null;
        if ("ecoa".equals(uri.getScheme()) && "ouvir".equals(uri.getHost())) {
            String caminho = uri.getEncodedPath();
            if (caminho != null && caminho.length() > 1) rota = "#/ouvir" + caminho;
        } else if ("https".equals(uri.getScheme()) && "kvsl11.github.io".equals(uri.getHost())) {
            String parte = uri.getEncodedFragment();
            if (parte != null && parte.startsWith("/ouvir/")) rota = "#" + parte;
        }
        // (o link foi atendido: girar a tela ou voltar ao app não o abre de novo)
        intent.setData(null);
        if (rota == null) return;
        final String js = "(function(){if(!document.body)return 'nao';var r=" + org.json.JSONObject.quote(rota)
            + ";if(location.hash!==r)location.hash=r;if(window.__conviteInicial)window.__conviteInicial();"
            + "return window.__songbookOk?'ok':'nao'})()";
        final int[] tentativas = { 0 };
        final Runnable[] tentar = new Runnable[1];
        tentar[0] = () -> {
            WebView w = getBridge() == null ? null : getBridge().getWebView();
            if (w == null) { if (tentativas[0]++ < 60) principal.postDelayed(tentar[0], 500); return; }
            try {
                w.evaluateJavascript(js, (r) -> { if (!"\"ok\"".equals(r) && tentativas[0]++ < 60) principal.postDelayed(tentar[0], 500); });
            } catch (Exception e) {
                if (tentativas[0]++ < 60) principal.postDelayed(tentar[0], 500);
            }
        };
        principal.post(tentar[0]);
    }
}
