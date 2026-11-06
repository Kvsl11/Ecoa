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
                    .setSmallIcon(R.drawable.ic_nota)
                    .setContentTitle(titulo == null || titulo.isEmpty() ? "Ecoa" : titulo)
                    .setContentText(texto)
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(texto))
                    .setContentIntent(toque)
                    .setAutoCancel(true)
                    .setOnlyAlertOnce(silenciosa)
                    .setSilent(silenciosa)
                    .setPriority(NotificationCompat.PRIORITY_LOW);
                Bitmap capa = baixar(imagem);
                if (capa != null) b.setLargeIcon(capa);
                if (ligados(app)) NotificationManagerCompat.from(app).notify(tag == null ? null : tag, id, b.build());
            } catch (SecurityException ignorada) {
                // (o aviso foi bloqueado no Android)
            }
        });
    }

    private static void canal(Context ctx) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = ctx.getSystemService(NotificationManager.class);
        if (nm.getNotificationChannel(CANAL) != null) return;
        NotificationChannel c = new NotificationChannel(CANAL, "Downloads", NotificationManager.IMPORTANCE_LOW);
        c.setDescription("O andamento e o fim dos downloads das músicas");
        nm.createNotificationChannel(c);
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
