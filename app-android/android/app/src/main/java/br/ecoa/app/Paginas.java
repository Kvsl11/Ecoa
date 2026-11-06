package br.ecoa.app;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.Iterator;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.getcapacitor.JSObject;

// As páginas da internet lidas pela parte nativa (o buscarPagina do plugin): o navegador não deixa a página ler outro
// site (CORS) e por isso o site usa serviços públicos que abrem a página por ele, que falham e limitam muito. No APK, o
// Android lê direto. Só GET, só http(s), até 12 MB, com um User-Agent de navegador (alguns sites recusam o do Android)
final class Paginas {
    private Paginas() {}

    static final int MAX = 12 << 20;
    static final String UA = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Mobile Safari/537.36";
    private static final Pattern CHARSET = Pattern.compile("charset=([\\w.-]+)", Pattern.CASE_INSENSITIVE);

    static final class Resposta {
        int status;
        String texto = "";
        String tipo = "";
    }

    static Resposta buscar(String endereco, JSObject cabecalhos, int tempo) {
        Resposta r = new Resposta();
        HttpURLConnection c = null;
        try {
            String atual = endereco;
            for (int pulos = 0; pulos < 6; pulos++) {
                if (!atual.matches("(?i)^https?://.+")) throw new IllegalArgumentException("endereço inválido");
                c = (HttpURLConnection) new URL(atual).openConnection();
                c.setInstanceFollowRedirects(false);
                c.setConnectTimeout(Math.min(tempo, 15000));
                c.setReadTimeout(tempo);
                c.setRequestProperty("User-Agent", UA);
                c.setRequestProperty("Accept-Language", "pt-BR,pt;q=0.9,en;q=0.8");
                if (cabecalhos != null) {
                    Iterator<String> it = cabecalhos.keys();
                    while (it.hasNext()) {
                        String k = it.next();
                        String v = cabecalhos.optString(k, null);
                        if (v != null && !k.equalsIgnoreCase("host") && !k.equalsIgnoreCase("content-length")) c.setRequestProperty(k, v);
                    }
                }
                int st = c.getResponseCode();
                // (o Java não segue o redirecionamento de http para https: segue aqui)
                if (st >= 300 && st < 400 && c.getHeaderField("Location") != null) {
                    atual = new URL(new URL(atual), c.getHeaderField("Location")).toString();
                    c.disconnect();
                    c = null;
                    continue;
                }
                r.status = st;
                r.tipo = c.getContentType() == null ? "" : c.getContentType();
                InputStream in = st >= 400 ? c.getErrorStream() : c.getInputStream();
                r.texto = ler(in, charset(r.tipo));
                return r;
            }
            throw new IllegalStateException("redirecionamentos demais");
        } catch (Exception e) {
            r.status = 0;
            r.texto = e.getClass().getSimpleName() + ": " + e.getMessage();
            return r;
        } finally {
            if (c != null) c.disconnect();
        }
    }

    static Charset charset(String tipo) {
        Matcher m = CHARSET.matcher(tipo == null ? "" : tipo);
        try { return m.find() ? Charset.forName(m.group(1).toUpperCase(Locale.ROOT)) : Charset.forName("UTF-8"); } catch (Exception e) { return Charset.forName("UTF-8"); }
    }

    static String ler(InputStream in, Charset cs) throws Exception {
        if (in == null) return "";
        try (InputStream i = in; ByteArrayOutputStream o = new ByteArrayOutputStream()) {
            byte[] buf = new byte[16384];
            int n, total = 0;
            while ((n = i.read(buf)) > 0) {
                total += n;
                if (total > MAX) throw new IllegalStateException("página grande demais");
                o.write(buf, 0, n);
            }
            return new String(o.toByteArray(), cs);
        }
    }
}
