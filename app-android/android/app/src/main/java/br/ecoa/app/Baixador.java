package br.ecoa.app;

import android.content.Context;
import android.content.SharedPreferences;

import com.yausername.ffmpeg.FFmpeg;
import com.yausername.youtubedl_android.YoutubeDL;
import com.yausername.youtubedl_android.YoutubeDLRequest;
import com.yausername.youtubedl_android.YoutubeDLResponse;

import java.io.File;
import java.util.Locale;
import java.util.regex.Pattern;

// Os downloads do YouTube no próprio celular, sem o servidor Python (servidor-ia/youtube.py): o mesmo yt-dlp, com o
// Python, o ffmpeg (que junta a imagem e o som do clipe) e o QuickJS (que resolve os desafios em JavaScript do
// YouTube) empacotados no APK pela biblioteca youtubedl-android. Os formatos e as qualidades são os mesmos do servidor
// (normal, alta, muito alta), para o arquivo baixado no APK ser igual ao que vinha de lá.
//
// O YouTube muda sempre: uma vez por dia o yt-dlp do aparelho é atualizado sozinho (sem precisar de APK novo).
final class Baixador {
    private Baixador() {}

    static final int MAX_VIDEO = 1800; // não baixa vídeo de mais de 30 min (o mesmo limite do servidor)
    private static final Pattern ID = Pattern.compile("^[A-Za-z0-9_-]{11}$");
    private static final Pattern PEDACO = Pattern.compile("\\.f\\d+\\.");
    private static final String PREFS = "ecoa_baixador";
    private static final long DIA = 24L * 3600 * 1000;

    private static volatile boolean pronto;
    private static volatile String erroAoPreparar;

    // Prepara o yt-dlp (na primeira vez, o Android extrai o Python e o ffmpeg: alguns segundos). Pode ser chamado de
    // várias threads: só uma prepara
    static synchronized void preparar(Context ctx) throws Exception {
        if (pronto) return;
        try {
            YoutubeDL.getInstance().init(ctx);
            FFmpeg.getInstance().init(ctx);
            pronto = true;
            erroAoPreparar = null;
        } catch (Exception e) {
            erroAoPreparar = e.getMessage();
            throw e;
        }
    }

    static boolean pronto() { return pronto; }
    static String erroAoPreparar() { return erroAoPreparar; }

    static String versao(Context ctx) {
        try { return YoutubeDL.getInstance().version(ctx); } catch (Exception e) { return null; }
    }

    // o yt-dlp mais novo (uma vez por dia; força: agora). Devolve o estado ("atualizado", "já estava", "erro: …")
    static String atualizar(Context ctx, boolean forcar) {
        SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        long ultima = p.getLong("atualizado_em", 0);
        if (!forcar && System.currentTimeMillis() - ultima < DIA) return "conferido hoje";
        try {
            preparar(ctx);
            YoutubeDL.UpdateStatus st = YoutubeDL.getInstance().updateYoutubeDL(ctx, YoutubeDL.UpdateChannel._STABLE);
            p.edit().putLong("atualizado_em", System.currentTimeMillis()).apply();
            return st == YoutubeDL.UpdateStatus.DONE ? "atualizado" : "já estava";
        } catch (Exception e) {
            return "erro: " + e.getMessage();
        }
    }

    // ---- os formatos (os mesmos de servidor-ia/youtube.py) ----
    static String qualidade(String q) {
        return "normal".equals(q) || "muito-alta".equals(q) ? q : "alta";
    }

    static int alturaDoVideo(String q) {
        switch (qualidade(q)) {
            case "normal": return 480;
            case "muito-alta": return 1080;
            default: return 720;
        }
    }

    static String formatoAudio(String q) {
        switch (qualidade(q)) {
            case "normal": return "bestaudio[ext=m4a][abr<=64]/worstaudio[ext=m4a]/bestaudio[ext=m4a]/bestaudio/best";
            // (o Opus toca no Android; no iPhone não, mas o APK é só do Android)
            case "muito-alta": return "bestaudio[acodec=opus]/bestaudio[ext=m4a]/bestaudio/best";
            default: return "bestaudio[ext=m4a][abr>64]/bestaudio[ext=m4a]/bestaudio[acodec^=mp4a]/bestaudio/best";
        }
    }

    static String formatoVideo(String q) {
        int h = alturaDoVideo(q);
        String som = "normal".equals(qualidade(q)) ? "bestaudio[ext=m4a][abr<=64]" : "bestaudio[ext=m4a]";
        return "bestvideo[height<=" + h + "][vcodec^=avc1]+" + som
            + "/bestvideo[height<=" + h + "][vcodec^=avc1]+bestaudio[ext=m4a]"
            + "/bestvideo[height<=" + h + "][ext=mp4]+bestaudio[ext=m4a]"
            + "/best[ext=mp4][height<=" + h + "][vcodec!=none][acodec!=none]"
            + "/18/best[ext=mp4]/best";
    }

    static String tipoDoArquivo(String nome, boolean comVideo) {
        String n = nome.toLowerCase(Locale.ROOT);
        if (n.endsWith(".mp4")) return "video/mp4";
        if (n.endsWith(".m4a")) return "audio/mp4";
        if (n.endsWith(".webm")) return comVideo ? "video/webm" : "audio/webm";
        if (n.endsWith(".mp3")) return "audio/mpeg";
        if (n.endsWith(".opus") || n.endsWith(".ogg")) return "audio/ogg";
        if (n.endsWith(".aac")) return "audio/aac";
        if (n.endsWith(".mkv")) return "video/x-matroska";
        return comVideo ? "video/mp4" : "audio/mp4";
    }

    // o arquivo final na pasta: audio.<ext>, nunca um pedaço (audio.f137.mp4) nem o que está pela metade (.part)
    static File arquivoFinal(File pasta, boolean comVideo) {
        File[] fs = pasta.listFiles();
        if (fs == null) return null;
        File melhor = null;
        for (File f : fs) {
            String n = f.getName().toLowerCase(Locale.ROOT);
            if (!f.isFile() || !n.startsWith("audio.") || n.endsWith(".part") || n.endsWith(".ytdl") || PEDACO.matcher(n).find()) continue;
            boolean ehVideo = n.endsWith(".mp4") || n.endsWith(".webm") || n.endsWith(".mkv") || n.endsWith(".mov");
            boolean ehAudio = n.endsWith(".m4a") || n.endsWith(".mp3") || n.endsWith(".opus") || n.endsWith(".ogg") || n.endsWith(".aac") || n.endsWith(".webm");
            if (comVideo ? !ehVideo : !ehAudio) continue;
            if (melhor == null || f.length() > melhor.length()) melhor = f;
        }
        return melhor;
    }

    static boolean pedeLogin(String msg) {
        String m = msg == null ? "" : msg.toLowerCase(Locale.ROOT);
        return m.contains("sign in") || m.contains("age-restricted") || m.contains("confirm your age") || m.contains("cookies")
            || m.contains("login") || m.contains("not a bot");
    }

    interface Andamento { void em(float fracao); }

    static final class Resultado {
        File arquivo;
        String tipo;
        Integer altura;
        String titulo;
        Double duracao;
    }

    // Baixa o áudio (ou o clipe com o som) para pasta/audio.<ext>. processo: o nome para cancelar no meio
    // (cancelar(processo)). Como o servidor, se o YouTube pede login, tenta pelos outros "clientes" dele
    static Resultado baixar(Context ctx, String video, boolean comVideo, String qualidade, File pasta, String processo, Andamento andamento) throws Exception {
        if (video == null || !ID.matcher(video).matches()) throw new IllegalArgumentException("link do YouTube inválido");
        preparar(ctx);
        String[][] clientes = { null, { "tv" }, { "android_vr" }, { "web_safari" }, { "mweb" } };
        Exception ultimo = null;
        Exception primeiroQueNaoPedeLogin = null;
        for (String[] cliente : clientes) {
            limpar(pasta);
            pasta.mkdirs();
            YoutubeDLRequest req = new YoutubeDLRequest("https://www.youtube.com/watch?v=" + video);
            req.addOption("-f", comVideo ? formatoVideo(qualidade) : formatoAudio(qualidade));
            req.addOption("-o", new File(pasta, "audio.%(ext)s").getAbsolutePath());
            req.addOption("--no-playlist");
            req.addOption("--no-mtime");
            req.addOption("--no-part");
            req.addOption("--newline");
            req.addOption("--match-filter", "duration <= " + MAX_VIDEO);
            req.addOption("--concurrent-fragments", 4);
            // (em pedaços de 10 MB o YouTube entrega na velocidade da internet, e não na de tocar)
            req.addOption("--http-chunk-size", "10M");
            req.addOption("--socket-timeout", 30);
            req.addOption("--retries", 6);
            req.addOption("--fragment-retries", 6);
            req.addOption("--extractor-retries", 5);
            if (comVideo) req.addOption("--merge-output-format", "mp4");
            if (cliente != null) req.addOption("--extractor-args", "youtube:player_client=" + String.join(",", cliente));
            // (as informações do vídeo baixado, numa linha que começa com ECOA| no fim)
            req.addOption("--print", "after_move:ECOA|%(height)s|%(duration)s|%(title)s");
            req.addOption("--no-simulate");
            req.addOption("--progress");
            final float[] ultimoPct = { -1 };
            try {
                YoutubeDLResponse r = YoutubeDL.getInstance().execute(req, processo, (pct, eta, linha) -> {
                    if (pct != null && pct >= 0 && pct > ultimoPct[0]) {
                        ultimoPct[0] = pct;
                        try { andamento.em(Math.min(1f, pct / 100f)); } catch (Exception ignorado) { /* quem ouve não derruba o download */ }
                    }
                    return kotlin.Unit.INSTANCE;
                });
                File f = arquivoFinal(pasta, comVideo);
                if (f == null || f.length() < 10000) {
                    throw new IllegalStateException(r.getOut() != null && r.getOut().contains("does not pass filter")
                        ? "vídeo longo demais (mais de " + (MAX_VIDEO / 60) + " min)"
                        : "o YouTube não entregou um arquivo de mídia válido");
                }
                Resultado res = new Resultado();
                res.arquivo = f;
                res.tipo = tipoDoArquivo(f.getName(), comVideo);
                if (comVideo && !res.tipo.startsWith("video/")) throw new IllegalStateException("veio só o áudio, não o videoclipe");
                lerInformacoes(r.getOut(), res);
                return res;
            } catch (YoutubeDL.CanceledException e) {
                limpar(pasta);
                throw e;
            } catch (Exception e) {
                ultimo = e;
                if (!pedeLogin(e.getMessage())) {
                    if (primeiroQueNaoPedeLogin == null) primeiroQueNaoPedeLogin = e;
                    // (erro de rede ou de formato: o yt-dlp já tentou por dentro; os outros clientes ajudam pouco, mas
                    // o "tv" e o "android_vr" às vezes entregam o que o padrão não entrega: segue tentando)
                }
            }
        }
        limpar(pasta);
        Exception e = primeiroQueNaoPedeLogin != null ? primeiroQueNaoPedeLogin : ultimo;
        throw new Exception(explicar(e));
    }

    static void lerInformacoes(String saida, Resultado res) {
        if (saida == null) return;
        for (String linha : saida.split("\n")) {
            if (!linha.startsWith("ECOA|")) continue;
            String[] p = linha.split("\\|", 4);
            try { if (p.length > 1 && !"NA".equals(p[1])) res.altura = Integer.parseInt(p[1].trim()); } catch (Exception ignorado) { /* sem altura */ }
            try { if (p.length > 2 && !"NA".equals(p[2])) res.duracao = Double.parseDouble(p[2].trim()); } catch (Exception ignorado) { /* sem duração */ }
            if (p.length > 3) res.titulo = p[3].trim();
        }
    }

    // o erro do yt-dlp em português (a última linha, sem o "ERROR: [youtube] id:")
    static String explicar(Exception e) {
        String msg = e == null || e.getMessage() == null ? "" : e.getMessage().trim();
        if (pedeLogin(msg)) return "o YouTube pediu login para baixar este vídeo";
        String[] linhas = msg.split("\n");
        String ultima = "";
        for (int i = linhas.length - 1; i >= 0; i--) {
            if (linhas[i].contains("ERROR")) { ultima = linhas[i]; break; }
        }
        if (ultima.isEmpty() && linhas.length > 0) ultima = linhas[linhas.length - 1];
        ultima = ultima.replaceAll("^(ERROR:\\s*)?(\\[[^\\]]+\\]\\s*)?([\\w-]{11}:\\s*)?", "").trim();
        if (ultima.startsWith("vídeo longo") || ultima.startsWith("o YouTube") || ultima.startsWith("veio só")) return ultima;
        return "não consegui baixar este vídeo" + (ultima.isEmpty() ? "" : " (" + (ultima.length() > 160 ? ultima.substring(0, 160) : ultima) + ")");
    }

    static boolean cancelar(String processo) {
        try { return YoutubeDL.getInstance().destroyProcessById(processo); } catch (Exception e) { return false; }
    }

    static void limpar(File f) {
        if (f == null || !f.exists()) return;
        File[] filhos = f.listFiles();
        if (filhos != null) for (File c : filhos) {
            if (c.isDirectory()) limpar(c);
            //noinspection ResultOfMethodCallIgnored
            c.delete();
        }
    }

    // a pasta dos downloads em andamento (o arquivo sai dela assim que o site guarda a música)
    static File pastaDe(Context ctx, String processo) {
        return new File(new File(ctx.getCacheDir(), "baixar"), processo.replaceAll("[^A-Za-z0-9_-]", "_"));
    }

    // os downloads de antes que ficaram pela metade (o app fechou no meio): saem ao abrir
    static void limparSobras(Context ctx) {
        File raiz = new File(ctx.getCacheDir(), "baixar");
        limpar(raiz);
    }
}
