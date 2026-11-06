package br.ecoa.app;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

// A atualização do próprio APK (Ajustes → Sobre → Atualização do app): baixa o Ecoa.apk novo do site para o cache e
// abre a tela de instalar do Android, que sempre pergunta antes (nenhum app instala outro sem a pessoa confirmar).
// Na primeira vez, o Android pede para permitir que o Ecoa instale apps ("instalar apps desconhecidos")
final class Atualizacao {
    interface Andamento { void pct(int pct); }

    private Atualizacao() {}

    static boolean podeInstalar(Context ctx) {
        return Build.VERSION.SDK_INT < 26 || ctx.getPackageManager().canRequestPackageInstalls();
    }

    // a tela do Android para permitir o Ecoa instalar apps
    static void abrirPermissao(Activity a) {
        if (Build.VERSION.SDK_INT < 26) return;
        Intent i = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + a.getPackageName()));
        a.startActivity(i);
    }

    static File baixar(Context ctx, String endereco, Andamento andamento) throws Exception {
        File pasta = new File(ctx.getCacheDir(), "atualizacao");
        if (!pasta.exists() && !pasta.mkdirs()) throw new Exception("Não deu para criar a pasta da atualização.");
        File destino = new File(pasta, "Ecoa.apk");
        File parcial = new File(pasta, "Ecoa.apk.parte");
        HttpURLConnection con = (HttpURLConnection) new URL(endereco).openConnection();
        con.setConnectTimeout(15000);
        con.setReadTimeout(30000);
        con.setUseCaches(false);
        try {
            if (con.getResponseCode() != 200) throw new Exception("O site respondeu " + con.getResponseCode() + ".");
            long total = con.getContentLengthLong();
            long feito = 0;
            int ultimo = -1;
            try (InputStream in = con.getInputStream(); OutputStream out = new FileOutputStream(parcial)) {
                byte[] buf = new byte[64 * 1024];
                int n;
                while ((n = in.read(buf)) > 0) {
                    out.write(buf, 0, n);
                    feito += n;
                    int pct = total > 0 ? (int) (feito * 100 / total) : -1;
                    if (pct != ultimo) { ultimo = pct; andamento.pct(pct); }
                }
            }
            if (total > 0 && feito != total) throw new Exception("O download veio pela metade.");
        } finally {
            con.disconnect();
        }
        if (destino.exists()) destino.delete();
        if (!parcial.renameTo(destino)) throw new Exception("Não deu para guardar a atualização.");
        return destino;
    }

    static void instalar(Activity a, File apk) {
        Uri uri = FileProvider.getUriForFile(a, a.getPackageName() + ".fileprovider", apk);
        Intent i = new Intent(Intent.ACTION_VIEW);
        i.setDataAndType(uri, "application/vnd.android.package-archive");
        i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        a.startActivity(i);
    }
}
