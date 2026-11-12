package br.ecoa.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;

import androidx.core.app.NotificationCompat;
import androidx.core.app.ServiceCompat;

// O aviso de "tocando" (com a capa, o nome e os botões), enquanto o Ecoa toca: com ele, o Android não fecha o app em
// segundo plano no meio da música. Some quando o player fecha
public class TocandoService extends Service {
    static final String CANAL = "tocando";
    static final int ID = 7;
    private static boolean ligado;

    private static TocandoService instancia;

    private static boolean tocando(Context ctx) {
        return ctx.getSharedPreferences(EcoaPlugin.PREFS, Context.MODE_PRIVATE).getBoolean("tocando", false);
    }

    // (o aviso é redesenhado também quando o serviço começa: com o serviço já ligado, o Android pode recusar o primeiro
    // plano em segundo plano, e aí o aviso ficava com o botão de antes — "tocar" com a música tocando e a barra andando)
    static void ligar(Context ctx) {
        try {
            androidx.core.content.ContextCompat.startForegroundService(ctx, new Intent(ctx, TocandoService.class));
        } catch (Exception e) {
            // (o Android não deixou começar agora, com o app em segundo plano: o aviso que já existe é só atualizado)
        }
        atualizar(ctx);
    }

    // A música mudou, pausou ou voltou. O serviço fica em primeiro plano só enquanto toca: pausado, ele solta o aviso
    // (que continua na tela, com os botões) e o aviso pode ser dispensado com o dedo. Antes ficava preso até fechar o
    // player, mesmo com a música pausada
    // Com o serviço encerrado pelo Android (pausado em segundo plano, ele pode ser fechado depois de um tempo), o aviso
    // continua sendo atualizado: antes ficava parado no último estado, às vezes em "tocando" e sem poder ser dispensado.
    // O aviso dispensado (ou o player fechado) não volta sozinho com a música pausada: só quando ela tocar de novo
    static void atualizar(Context ctx) {
        SharedPreferences p = ctx.getSharedPreferences(EcoaPlugin.PREFS, Context.MODE_PRIVATE);
        if (!ligado && p.getBoolean("dispensado", false) && !tocando(ctx)) return;
        TocandoService s = instancia;
        if (s != null) {
            if (tocando(ctx)) s.paraFrente();
            else { try { ServiceCompat.stopForeground(s, ServiceCompat.STOP_FOREGROUND_DETACH); } catch (Exception e) { /* já estava solto */ } }
        }
        try {
            ((NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE)).notify(ID, aviso(ctx));
        } catch (Exception e) { /* sem a permissão de avisos */ }
    }

    static void desligar(Context ctx) {
        ctx.getSharedPreferences(EcoaPlugin.PREFS, Context.MODE_PRIVATE).edit().putBoolean("dispensado", true).apply();
        ctx.stopService(new Intent(ctx, TocandoService.class));
        // (solto do serviço, o aviso não some sozinho com ele)
        try { ((NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE)).cancel(ID); } catch (Exception e) { /* nada a tirar */ }
    }

    private void paraFrente() {
        int tipo = Build.VERSION.SDK_INT >= 29 ? ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK : 0;
        try {
            ServiceCompat.startForeground(this, ID, aviso(this), tipo);
        } catch (Exception e) { /* em segundo plano o Android pode recusar: o aviso segue, sem o primeiro plano */ }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        criarCanal(this);
        instancia = this;
        ligado = true;
        // (o Android exige o primeiro plano logo depois de startForegroundService; pausado, ele é solto em seguida)
        paraFrente();
        if (!tocando(this)) { try { ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_DETACH); } catch (Exception e) { /* já solto */ } }
        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        ligado = false;
        if (instancia == this) instancia = null;
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }

    private static void criarCanal(Context ctx) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationChannel c = new NotificationChannel(CANAL, ctx.getString(R.string.canal_tocando), NotificationManager.IMPORTANCE_LOW);
        c.setDescription(ctx.getString(R.string.canal_tocando_desc));
        c.setShowBadge(false);
        ((NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE)).createNotificationChannel(c);
    }

    private static Notification aviso(Context ctx) {
        criarCanal(ctx);
        SharedPreferences p = ctx.getSharedPreferences(EcoaPlugin.PREFS, Context.MODE_PRIVATE);
        boolean tocando = p.getBoolean("tocando", false);
        NotificationCompat.Builder b = new NotificationCompat.Builder(ctx, CANAL)
            .setSmallIcon(R.drawable.ic_ecoa) // (a logo do Ecoa ao lado da capa, e não uma nota)
            .setColor(0xFF0891B2)
            .setContentTitle(p.getString("titulo", "Ecoa"))
            .setContentText(p.getString("artista", ""))
            .setLargeIcon(Capas.ler(ctx))
            .setContentIntent(EcoaWidget.abrirApp(ctx))
            .setDeleteIntent(EcoaWidget.aoDispensar(ctx))
            .setOngoing(tocando)
            .setSilent(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .addAction(R.drawable.ic_anterior, ctx.getString(R.string.acao_voltar), EcoaWidget.botao(ctx, Acoes.ANTERIOR, 21))
            .addAction(tocando ? R.drawable.ic_pausar : R.drawable.ic_tocar, ctx.getString(tocando ? R.string.acao_pausar : R.string.acao_tocar), EcoaWidget.botao(ctx, tocando ? Acoes.PAUSAR : Acoes.TOCAR, 22)) // (explícito: o que o botão mostra é o que ele faz)
            .addAction(R.drawable.ic_proxima, ctx.getString(R.string.acao_pular), EcoaWidget.botao(ctx, Acoes.PROXIMA, 23));
        // (sem botão de fechar: pausada, o aviso deixa de ser fixo e é dispensado arrastando para o lado, como nos
        // outros players; o dedo passa pelo setDeleteIntent, que pausa e tira o aviso e o player do Android)
        b.setStyle(new androidx.media.app.NotificationCompat.MediaStyle()
                // (com a sessão de mídia, o aviso vira o player do Android: a capa, a barra do tempo, a tela de bloqueio)
                .setMediaSession(Sessao.de(ctx).getSessionToken())
                .setShowActionsInCompactView(0, 1, 2));
        return b.build();
    }
}
