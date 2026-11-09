package br.ecoa.app;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.os.Build;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.json.JSONObject;

// O Lúmen no próprio celular: a chamada à API do Gemini, sem o servidor Python. A chave vem na montagem do APK (o
// segredo GEMINI_API_KEY do GitHub, em BuildConfig) e nunca passa para a página. Junto vão o pacote e a impressão
// digital SHA-1 da chave que assinou o APK: com a chave restrita a "Apps Android" (br.ecoa.app + essa SHA-1) no Google
// Cloud, ela só vale vinda deste app (veja app-android/LEIA-ME.md). O pedido e a resposta são o JSON do generateContent,
// montados e lidos pela página (public/js/lib/lumen-local.js)
final class Gemini {
    private Gemini() {}

    static final String API = "https://generativelanguage.googleapis.com/v1beta/";
    private static String sha1;

    static boolean temChave() {
        return BuildConfig.GEMINI_CHAVE != null && !BuildConfig.GEMINI_CHAVE.trim().isEmpty();
    }

    // Extrai a mensagem do Google sem expor a chave, que nunca faz parte do corpo da resposta.
    static String mensagem(Resposta r) {
        if (r == null) return "A API Gemini não devolveu uma resposta.";
        if (r.status == 0) return (r.texto == null || r.texto.trim().isEmpty())
            ? "Não foi possível conectar ao Google." : r.texto.trim();
        try {
            JSONObject erro = new JSONObject(r.texto == null ? "" : r.texto).optJSONObject("error");
            if (erro != null) {
                String msg = erro.optString("message", "").replaceAll("\\s+", " ").trim();
                if (!msg.isEmpty()) return msg.length() > 420 ? msg.substring(0, 420) : msg;
            }
        } catch (Exception ignorado) { /* usa o texto recebido */ }
        String texto = r.texto == null ? "" : r.texto.replaceAll("\\s+", " ").trim();
        return texto.length() > 420 ? texto.substring(0, 420) : (texto.isEmpty() ? "Resposta vazia do Google." : texto);
    }

    // só os caminhos da API do Gemini (a página não manda a chave para outro lugar)
    static boolean caminhoValido(String caminho) {
        return caminho != null && caminho.matches("^models(\\?[A-Za-z0-9=&_-]*|/[A-Za-z0-9._-]+:(generateContent|countTokens))$");
    }

    // a impressão digital SHA-1 da chave que assinou este APK, em hexadecimal maiúsculo, sem dois-pontos
    static synchronized String impressaoDigital(Context ctx) {
        if (sha1 != null) return sha1;
        try {
            PackageManager pm = ctx.getPackageManager();
            Signature[] assinaturas;
            if (Build.VERSION.SDK_INT >= 28) {
                PackageInfo pi = pm.getPackageInfo(ctx.getPackageName(), PackageManager.GET_SIGNING_CERTIFICATES);
                assinaturas = pi.signingInfo.hasMultipleSigners() ? pi.signingInfo.getApkContentsSigners() : pi.signingInfo.getSigningCertificateHistory();
            } else {
                @SuppressWarnings("deprecation")
                PackageInfo pi = pm.getPackageInfo(ctx.getPackageName(), PackageManager.GET_SIGNATURES);
                assinaturas = pi.signatures;
            }
            if (assinaturas == null || assinaturas.length == 0 || assinaturas[0] == null) {
                sha1 = "";
                return sha1;
            }
            byte[] d = MessageDigest.getInstance("SHA-1").digest(assinaturas[0].toByteArray());
            sha1 = hex(d);
        } catch (Exception e) {
            sha1 = "";
        }
        return sha1;
    }

    static String hex(byte[] d) {
        StringBuilder sb = new StringBuilder();
        for (byte b : d) sb.append(String.format("%02X", b));
        return sb.toString();
    }

    static final class Resposta {
        int status;
        String texto;
    }

    // GET (corpo nulo) ou POST do JSON. status 0: nem chegou ao Google (sem internet)
    static Resposta chamar(Context ctx, String caminho, String corpo, int tempoMs) {
        Resposta r = new Resposta();
        HttpURLConnection c = null;
        try {
            c = (HttpURLConnection) new URL(API + caminho).openConnection();
            c.setConnectTimeout(20000);
            c.setReadTimeout(tempoMs);
            c.setUseCaches(false);
            c.setInstanceFollowRedirects(true);
            c.setRequestProperty("Accept", "application/json");
            c.setRequestProperty("x-goog-api-key", BuildConfig.GEMINI_CHAVE);
            c.setRequestProperty("X-Android-Package", ctx.getPackageName());
            c.setRequestProperty("X-Android-Cert", impressaoDigital(ctx));
            if (corpo != null) {
                c.setRequestMethod("POST");
                c.setDoOutput(true);
                c.setRequestProperty("Content-Type", "application/json; charset=utf-8");
                byte[] b = corpo.getBytes(StandardCharsets.UTF_8);
                c.setFixedLengthStreamingMode(b.length);
                try (OutputStream o = c.getOutputStream()) { o.write(b); }
            }
            r.status = c.getResponseCode();
            try {
                InputStream in = r.status >= 400 ? c.getErrorStream() : c.getInputStream();
                r.texto = ler(in);
            } catch (Exception leitura) {
                // Não descarte o HTTP 401/403/429 se a leitura do corpo de erro também falhar.
                r.texto = "Não foi possível ler o corpo da resposta HTTP " + r.status
                    + " (" + leitura.getClass().getSimpleName() + ")";
            }
        } catch (Exception e) {
            if (r.status == 0) {
                String detalhe = e.getMessage() == null ? "" : ": " + e.getMessage();
                r.texto = "sem conexão com o Google (" + e.getClass().getSimpleName() + detalhe + ")";
            } else if (r.texto == null) {
                r.texto = "falha ao consultar o Google (" + e.getClass().getSimpleName() + ")";
            }
        } finally {
            if (c != null) c.disconnect();
        }
        return r;
    }

    private static String ler(InputStream in) throws Exception {
        if (in == null) return "";
        try (InputStream i = in; ByteArrayOutputStream o = new ByteArrayOutputStream()) {
            byte[] buf = new byte[16384];
            int n;
            while ((n = i.read(buf)) > 0) o.write(buf, 0, n);
            return o.toString("UTF-8");
        }
    }
}
