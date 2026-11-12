package br.ecoa.app;

import android.content.Context;
import android.content.Intent;

// As ações dos botões do widget e do aviso de "tocando" (voltar, tocar/pausar, pular): vão para o app, que as faz no
// player. Com o app fechado, ele abre e a ação espera o app ficar pronto (EcoaPlugin.pendente)
public final class Acoes {
    public static final String EXTRA = "br.ecoa.app.ACAO";
    public static final String ANTERIOR = "anterior";
    public static final String ALTERNAR = "alternar";
    public static final String PROXIMA = "proxima";
    public static final String TOCAR = "tocar";   // (do player do Android e do fone: tocar, e não alternar)
    public static final String PAUSAR = "pausar";
    public static final String FECHAR = "fechar"; // o aviso de "tocando" foi dispensado (não vai para a página)
    public static final String ABRIR = "abrir";
    public static final String ABRIR_EM = "abrir:"; // abrir o app numa página do site (tocar numa notificação): "abrir:#/musica/…"
    public static final String IR = "ir:"; // ir a um ponto da música (a barra do tempo do player do Android): "ir:83.5"

    private Acoes() {}

    // a ação que veio no Intent que abriu (ou trouxe para a frente) a tela
    static void daIntent(Intent intent) {
        if (intent == null) return;
        String acao = intent.getStringExtra(EXTRA);
        if (acao == null || ABRIR.equals(acao)) return;
        intent.removeExtra(EXTRA);
        EcoaPlugin.entregar(acao);
    }

    // O comando chega como Intent à Activity, em vez de depender de um evento JS enviado a um WebView
    // suspenso em segundo plano. O Android retoma a tela e onNewIntent entrega a ação ao player.
    static void fazer(Context ctx, String acao) {
        android.content.SharedPreferences p = ctx.getSharedPreferences(EcoaPlugin.PREFS, Context.MODE_PRIVATE);
        boolean tocando = p.getBoolean("tocando", false);
        // O aviso dispensado (o dedo ou o botão Fechar): a música pausa e o aviso e o player do Android saem. Antes só o
        // aviso saía, e a música podia seguir tocando
        if (FECHAR.equals(acao)) {
            marcarPausado(ctx, p, tocando);
            p.edit().putBoolean("dispensado", true).apply();
            EcoaWebView.acordar();
            EcoaPlugin.entregar(PAUSAR);
            EcoaWebView.rodar("window.ecoaComando&&window.ecoaComando('pausar')");
            TocandoService.desligar(ctx);
            Sessao.parar(ctx);
            EcoaWidget.atualizarTodos(ctx);
            return;
        }
        // O pausar vale na hora para o aviso e o player do Android: eles passam a "pausado" (e o aviso pode ser
        // dispensado) sem esperar a página responder. Antes ficavam em "tocando" até a página confirmar — com ela
        // adormecida em segundo plano, a confirmação não vinha, e o aviso ficava preso. O "alternar" com a música tocando
        // vira um pausar explícito: o comando não inverte o estado se a página estiver com outro
        if (ALTERNAR.equals(acao) && tocando) acao = PAUSAR;
        if (PAUSAR.equals(acao)) {
            marcarPausado(ctx, p, tocando);
            Sessao.atualizar(ctx);
            TocandoService.atualizar(ctx);
            EcoaWidget.atualizarTodos(ctx);
        }
        // (pausar e ir a um ponto não precisam de tela; tocar e pular precisam quando a música vem do YouTube, que não
        // toca com a página escondida)
        boolean semTela = p.getBoolean("doAparelho", false) || PAUSAR.equals(acao) || (ALTERNAR.equals(acao) && tocando) || acao.startsWith(IR);
        // Com o player já carregado, a página é acordada e recebe o comando direto: não traz a Activity para a frente
        // nem recria a tela só para pausar ou trocar de faixa.
        EcoaWebView.acordar();
        // (o pausar vai também direto para a página, sem passar pelo aviso do plugin, que atrasava com ela adormecida)
        if (PAUSAR.equals(acao)) EcoaWebView.rodar("window.ecoaComando&&window.ecoaComando('pausar')");
        if (EcoaPlugin.entregar(acao)) {
            if (!semTela) trazerParaFrente(ctx, null);
            return;
        }
        trazerParaFrente(ctx, acao);
    }

    // a música passa a pausada para o aviso, o widget e o player do Android, no ponto em que estava
    private static void marcarPausado(Context ctx, android.content.SharedPreferences p, boolean tocando) {
        long agora = android.os.SystemClock.elapsedRealtime();
        float tempo = p.getFloat("tempo", 0f);
        if (tocando) tempo += Math.max(0, agora - p.getLong("quando", agora)) / 1000f;
        p.edit().putBoolean("tocando", false).putFloat("tempo", tempo).putLong("quando", agora).apply();
        EcoaWebView.definirTocando(false);
    }

    // abre (ou traz para a frente) o app; com a ação, ela é feita quando a tela estiver pronta
    private static void trazerParaFrente(Context ctx, String acao) {
        try {
            Intent abrir = new Intent(ctx, MainActivity.class);
            abrir.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            if (acao != null) abrir.putExtra(EXTRA, acao);
            ctx.startActivity(abrir);
        } catch (Exception e) { /* o Android não deixou abrir a tela agora: o comando já foi (ou fica pendente) */ }
    }
}
