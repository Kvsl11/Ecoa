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
        Intent abrir = new Intent(ctx, MainActivity.class);
        abrir.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        abrir.putExtra(EXTRA, acao);
        ctx.startActivity(abrir);
    }
}
