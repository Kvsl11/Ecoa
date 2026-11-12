package br.ecoa.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

// As notificações do site no app (os downloads: "Download iniciado", "baixada", "Downloads concluídos"). No WebView
// não existe a notificação do navegador, então o site pede ao Android. A mesma "tag" troca a notificação anterior;
// tocar nela abre o app na página certa (a ação "abrir:#/musica/…")
final class Avisos {
    static final String CANAL = "downloads";
    private static final ExecutorService fila = Executors.newSingleThreadExecutor();

    private Avisos() {}

    static boolean ligados(Context ctx) {
        return NotificationManagerCompat.from(ctx).areNotificationsEnabled();
    }

    static void mostrar(Context ctx, String titulo, String texto, String tag, String href, boolean silenciosa, String imagem) {
        mostrar(ctx, titulo, texto, tag, href, silenciosa, imagem, false, -1);
    }

    // fixa: a notificação do download em andamento (não sai ao arrastar: fica no BaixandoService); pct: a barra (0–100),
    // ou -1 sem barra
    static void mostrar(Context ctx, String titulo, String texto, String tag, String href, boolean silenciosa, String imagem, boolean fixa, int pct) {
        Context app = ctx.getApplicationContext();
        fila.execute(() -> {
            try {
                canal(app);
                Intent abrir = new Intent(app, MainActivity.class);
                abrir.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                if (href != null && !href.isEmpty()) abrir.putExtra(Acoes.EXTRA, Acoes.ABRIR_EM + href);
                int id = tag == null || tag.isEmpty() ? (int) (System.currentTimeMillis() & 0xffffff) : tag.hashCode();
                PendingIntent toque = PendingIntent.getActivity(app, id, abrir, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                NotificationCompat.Builder b = new NotificationCompat.Builder(app, CANAL)
                    .setSmallIcon(R.drawable.ic_ecoa)
                    .setContentTitle(titulo == null || titulo.isEmpty() ? "Ecoa" : titulo)
                    .setContentText(texto == null || texto.isEmpty() ? app.getString(R.string.aviso_download) : texto)
                    .setSubText(app.getString(R.string.canal_downloads))
                    .setStyle(new NotificationCompat.BigTextStyle()
                        .setBigContentTitle(titulo == null || titulo.isEmpty() ? "Ecoa" : titulo)
                        .bigText(texto == null || texto.isEmpty() ? app.getString(R.string.aviso_download) : texto))
                    .setContentIntent(toque)
                    .setAutoCancel(!fixa)
                    .setOngoing(fixa)
                    .setOnlyAlertOnce(silenciosa)
                    .setSilent(silenciosa)
                    .setPriority(NotificationCompat.PRIORITY_LOW);
                if (pct >= 0 && pct <= 100) b.setProgress(100, pct, false);
                else if (fixa) b.setProgress(0, 0, true);
                Bitmap capa = capaGuardada(imagem);
                if (capa != null) b.setLargeIcon(capa);
                if (!ligados(app)) return;
                // (presa: a notificação é a do serviço; solta: o serviço sai e a notificação comum toma o lugar, com o
                // mesmo número, e dá para apagar)
                if (fixa && BaixandoService.mostrar(app, id, b.build())) return;
                if (!fixa) BaixandoService.parar(false);
                NotificationManagerCompat.from(app).notify(id, b.build());
            } catch (SecurityException ignorada) {
                // (o aviso foi bloqueado no Android)
            }
        });
    }

    private static void canal(Context ctx) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = ctx.getSystemService(NotificationManager.class);
        // (criado de novo a cada vez: o nome e a descrição acompanham o idioma do aparelho; o resto do canal não muda)
        NotificationChannel c = new NotificationChannel(CANAL, ctx.getString(R.string.canal_downloads), NotificationManager.IMPORTANCE_LOW);
        c.setDescription(ctx.getString(R.string.canal_downloads_desc));
        nm.createNotificationChannel(c);
    }

    // a capa da notificação: baixada uma vez por endereço (a notificação do andamento é refeita a cada 1%, e antes cada
    // uma baixava a capa de novo)
    private static String capaUrl;
    private static Bitmap capaBmp;
    private static Bitmap capaGuardada(String url) {
        if (url == null || url.isEmpty()) return null;
        if (url.equals(capaUrl)) return capaBmp;
        Bitmap b = baixar(url);
        capaUrl = url;
        capaBmp = b;
        return b;
    }

    // a notificação presa do download sai (a pessoa pausou tudo): o serviço para e ela some
    static void soltar() {
        fila.execute(() -> BaixandoService.parar(false));
    }

    private static Bitmap baixar(String url) {
        if (url == null || !url.startsWith("http")) return null;
        try {
            HttpURLConnection con = (HttpURLConnection) new URL(url).openConnection();
            con.setConnectTimeout(6000);
            con.setReadTimeout(8000);
            try (InputStream in = con.getInputStream()) {
                Bitmap b = BitmapFactory.decodeStream(in);
                if (b == null) return null;
                int lado = Math.min(b.getWidth(), b.getHeight());
                Bitmap q = Bitmap.createBitmap(b, (b.getWidth() - lado) / 2, (b.getHeight() - lado) / 2, lado, lado);
                return Bitmap.createScaledBitmap(q, 256, 256, true);
            } finally {
                con.disconnect();
            }
        } catch (Exception e) {
            return null;
        }
    }
}
