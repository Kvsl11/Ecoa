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

    static void ligar(Context ctx) {
        try {
            androidx.core.content.ContextCompat.startForegroundService(ctx, new Intent(ctx, TocandoService.class));
        } catch (Exception e) {
            // (o Android não deixou começar agora, com o app em segundo plano: fica só o widget)
        }
    }

    static void atualizar(Context ctx) {
        if (!ligado) return;
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        nm.notify(ID, aviso(ctx));
    }

    static void desligar(Context ctx) {
        ctx.stopService(new Intent(ctx, TocandoService.class));
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        criarCanal(this);
        int tipo = Build.VERSION.SDK_INT >= 29 ? ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK : 0;
        ServiceCompat.startForeground(this, ID, aviso(this), tipo);
        ligado = true;
        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        ligado = false;
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }

    private static void criarCanal(Context ctx) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationChannel c = new NotificationChannel(CANAL, "Tocando agora", NotificationManager.IMPORTANCE_LOW);
        c.setDescription("A música tocando no Ecoa, com os botões");
        c.setShowBadge(false);
        ((NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE)).createNotificationChannel(c);
    }

    private static Notification aviso(Context ctx) {
        criarCanal(ctx);
        SharedPreferences p = ctx.getSharedPreferences(EcoaPlugin.PREFS, Context.MODE_PRIVATE);
        boolean tocando = p.getBoolean("tocando", false);
        NotificationCompat.Builder b = new NotificationCompat.Builder(ctx, CANAL)
            .setSmallIcon(R.drawable.ic_nota)
            .setContentTitle(p.getString("titulo", "Ecoa"))
            .setContentText(p.getString("artista", ""))
            .setLargeIcon(Capas.ler(ctx))
            .setContentIntent(EcoaWidget.abrirApp(ctx))
            .setOngoing(tocando)
            .setSilent(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .addAction(R.drawable.ic_anterior, "Voltar", EcoaWidget.botao(ctx, Acoes.ANTERIOR, 21))
            .addAction(tocando ? R.drawable.ic_pausar : R.drawable.ic_tocar, tocando ? "Pausar" : "Tocar", EcoaWidget.botao(ctx, Acoes.ALTERNAR, 22))
            .addAction(R.drawable.ic_proxima, "Pular", EcoaWidget.botao(ctx, Acoes.PROXIMA, 23))
            .setStyle(new androidx.media.app.NotificationCompat.MediaStyle()
                // (com a sessão de mídia, o aviso vira o player do Android: a capa, a barra do tempo, a tela de bloqueio)
                .setMediaSession(Sessao.de(ctx).getSessionToken())
                .setShowActionsInCompactView(0, 1, 2));
        return b.build();
    }
}
