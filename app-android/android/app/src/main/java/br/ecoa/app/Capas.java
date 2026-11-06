package br.ecoa.app;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

// a capa da música tocando, baixada uma vez e guardada no aparelho (o widget mostra ela mesmo com o app fechado)
final class Capas {
    private static final ExecutorService fila = Executors.newSingleThreadExecutor();

    private Capas() {}

    static File arquivo(Context ctx) { return new File(ctx.getFilesDir(), "capa-widget.jpg"); }

    static void baixar(Context ctx, String url, Runnable depois) {
        final Context app = ctx.getApplicationContext();
        fila.execute(() -> {
            File f = arquivo(app);
            if (url == null || !url.startsWith("http")) { f.delete(); depois.run(); return; }
            HttpURLConnection c = null;
            try {
                c = (HttpURLConnection) new URL(url).openConnection();
                c.setConnectTimeout(10000);
                c.setReadTimeout(15000);
                Bitmap b;
                try (InputStream in = c.getInputStream()) { b = BitmapFactory.decodeStream(in); }
                if (b == null) return;
                // (pequena: o widget recebe a imagem inteira e tem limite de tamanho)
                int lado = 360;
                int w = b.getWidth();
                int h = b.getHeight();
                int q = Math.min(w, h);
                Bitmap quadrada = Bitmap.createBitmap(b, (w - q) / 2, (h - q) / 2, q, q);
                Bitmap menor = Bitmap.createScaledBitmap(quadrada, lado, lado, true);
                try (FileOutputStream out = new FileOutputStream(f)) { menor.compress(Bitmap.CompressFormat.JPEG, 88, out); }
                depois.run();
            } catch (Exception e) {
                // sem a capa: fica a de antes (ou o desenho do app)
            } finally {
                if (c != null) c.disconnect();
            }
        });
    }

    static Bitmap ler(Context ctx) {
        File f = arquivo(ctx);
        return f.exists() ? BitmapFactory.decodeFile(f.getAbsolutePath()) : null;
    }
}
