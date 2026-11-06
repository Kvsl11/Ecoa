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

    // as capas já baixadas, uma por endereço: a música que já tocou (ou foi baixada) mostra a capa certa também sem
    // internet. Ficam as MAX_GUARDADAS mais recentes
    static final int MAX_GUARDADAS = 400;
    static File pasta(Context ctx) { return new File(ctx.getFilesDir(), "capas"); }

    static File guardada(Context ctx, String url) {
        try {
            byte[] d = java.security.MessageDigest.getInstance("SHA-1").digest(url.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 10; i++) sb.append(String.format("%02x", d[i]));
            return new File(pasta(ctx), sb + ".jpg");
        } catch (Exception e) {
            return new File(pasta(ctx), Integer.toHexString(url.hashCode()) + ".jpg");
        }
    }

    // A capa da música que começou a tocar. A de antes sai NA HORA (sem a nova, o aviso e o widget ficam com o desenho
    // do app, e não com a capa de outra música: antes, sem internet ou com o download falhando, ficava a capa da
    // música anterior). A guardada vale na hora; senão, é baixada (e guardada)
    static void baixar(Context ctx, String url, Runnable depois) {
        final Context app = ctx.getApplicationContext();
        fila.execute(() -> {
            File f = arquivo(app);
            //noinspection ResultOfMethodCallIgnored
            f.delete();
            if (url == null || !url.startsWith("http")) { depois.run(); return; }
            File g = guardada(app, url);
            if (!g.isFile() && !buscar(url, g)) { depois.run(); return; }
            if (copiar(g, f)) {
                //noinspection ResultOfMethodCallIgnored
                g.setLastModified(System.currentTimeMillis());
            }
            depois.run();
        });
    }

    // Guarda de antemão as capas destas músicas (as baixadas: tocam sem internet, e a capa tem de vir junto)
    static void guardarTodas(Context ctx, java.util.List<String> urls) {
        final Context app = ctx.getApplicationContext();
        fila.execute(() -> {
            int novas = 0;
            for (String url : urls) {
                if (url == null || !url.startsWith("http")) continue;
                File g = guardada(app, url);
                if (g.isFile()) continue;
                if (buscar(url, g) && ++novas >= 60) break; // (um tanto por vez: o resto na próxima)
            }
            limparVelhas(app);
        });
    }

    // baixa a capa, quadrada, pequena e sem a borda clara, em destino. false: sem internet ou imagem estragada
    static boolean buscar(String url, File destino) {
        HttpURLConnection c = null;
        try {
            c = (HttpURLConnection) new URL(url).openConnection();
            c.setConnectTimeout(10000);
            c.setReadTimeout(15000);
            Bitmap b;
            try (InputStream in = c.getInputStream()) { b = BitmapFactory.decodeStream(in); }
            // (a imagem cinza de 120x90 com o "play" que o YouTube devolve quando não tem a miniatura: não é capa)
            if (b == null || (b.getWidth() <= 120 && b.getHeight() <= 90)) return false;
            // (pequena: o widget recebe a imagem inteira e tem limite de tamanho)
            int lado = 360;
            // (sem a borda fina clara que muitas capas trazem: com o canto arredondado do Android, ela aparecia
            // como pontas brancas cortadas no aviso e na tela de bloqueio)
            int[] r = semBorda(b);
            int w = r[2] - r[0];
            int h = r[3] - r[1];
            int q = Math.min(w, h);
            Bitmap quadrada = Bitmap.createBitmap(b, r[0] + (w - q) / 2, r[1] + (h - q) / 2, q, q);
            Bitmap menor = Bitmap.createScaledBitmap(quadrada, lado, lado, true);
            //noinspection ResultOfMethodCallIgnored
            destino.getParentFile().mkdirs();
            File tmp = new File(destino.getPath() + ".tmp");
            try (FileOutputStream out = new FileOutputStream(tmp)) { menor.compress(Bitmap.CompressFormat.JPEG, 88, out); }
            return tmp.renameTo(destino);
        } catch (Exception e) {
            return false;
        } finally {
            if (c != null) c.disconnect();
        }
    }

    static boolean copiar(File de, File para) {
        File tmp = new File(para.getPath() + ".tmp");
        try (InputStream in = new java.io.FileInputStream(de); FileOutputStream out = new FileOutputStream(tmp)) {
            byte[] buf = new byte[16384];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
        } catch (Exception e) {
            return false;
        }
        return tmp.renameTo(para);
    }

    static void limparVelhas(Context ctx) {
        File[] fs = pasta(ctx).listFiles();
        if (fs == null || fs.length <= MAX_GUARDADAS) return;
        java.util.Arrays.sort(fs, (a, b) -> Long.compare(b.lastModified(), a.lastModified()));
        for (int i = MAX_GUARDADAS; i < fs.length; i++) //noinspection ResultOfMethodCallIgnored
            fs[i].delete();
    }

    // o retângulo da capa sem a borda: de cada lado, tira as linhas claras e quase iguais (até 6% do lado). Devolve
    // { esquerda, topo, direita, base }
    static int[] semBorda(Bitmap b) {
        int w = b.getWidth(), h = b.getHeight();
        int maxX = Math.max(1, w * 6 / 100), maxY = Math.max(1, h * 6 / 100);
        int esq = 0, topo = 0, dir = w, base = h;
        while (topo < maxY && linhaDeBorda(b, topo, true)) topo++;
        while (h - base < maxY && linhaDeBorda(b, base - 1, true)) base--;
        while (esq < maxX && linhaDeBorda(b, esq, false)) esq++;
        while (w - dir < maxX && linhaDeBorda(b, dir - 1, false)) dir--;
        // (e mais uma linha: a de transição entre a borda e a imagem, meio clara por causa da compressão)
        if (topo > 0) topo = Math.min(maxY + 1, topo + 1);
        if (base < h) base = Math.max(h - maxY - 1, base - 1);
        if (esq > 0) esq = Math.min(maxX + 1, esq + 1);
        if (dir < w) dir = Math.max(w - maxX - 1, dir - 1);
        // (se a imagem inteira é clara, como uma capa branca, fica como está)
        if (dir - esq < w / 2 || base - topo < h / 2) return new int[] { 0, 0, w, h };
        return new int[] { esq, topo, dir, base };
    }

    // a linha (ou a coluna) é de borda: clara e quase sem variação
    private static boolean linhaDeBorda(Bitmap b, int i, boolean linha) {
        int n = linha ? b.getWidth() : b.getHeight();
        int passo = Math.max(1, n / 48);
        int min = 255, max = 0, soma = 0, k = 0;
        for (int j = 0; j < n; j += passo) {
            int c = linha ? b.getPixel(j, i) : b.getPixel(i, j);
            int l = (android.graphics.Color.red(c) * 299 + android.graphics.Color.green(c) * 587 + android.graphics.Color.blue(c) * 114) / 1000;
            min = Math.min(min, l);
            max = Math.max(max, l);
            soma += l;
            k++;
        }
        return k > 0 && soma / k >= 200 && max - min <= 40;
    }

    static Bitmap ler(Context ctx) {
        File f = arquivo(ctx);
        return f.exists() ? BitmapFactory.decodeFile(f.getAbsolutePath()) : null;
    }
}
