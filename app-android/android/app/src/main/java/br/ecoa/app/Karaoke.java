package br.ecoa.app;

import android.content.Context;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtSession;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.RandomAccessFile;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.FloatBuffer;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

// O karaokê feito no próprio celular, sem o servidor: a banda separada da voz pelo UVR MDX-Net Inst HQ 4 (o modelo de
// 59 MB que o app baixa na primeira vez) rodando no ONNX Runtime. Medido no MUSDB18 (8 músicas com a voz e a banda
// gravadas à parte): a banda sai com 15,6 dB de SDR e a voz com 11,3 dB, contra 11,3 e 7,6 dB do UVR 9482 de antes (que
// deixava a voz chiando no fundo e levava instrumentos junto). Custa mais tempo: cerca do dobro, e o arquivo gravado como o do servidor
// (servidor-ia/karaoke.py): um M4A (AAC) de 4 canais "quad", 44,1 kHz — banda esquerda/direita (a gravação menos a voz)
// e voz esquerda/direita. Banda + voz = a gravação, amostra por amostra.
//
// O UVR tira a voz inteira (o back vocal sai junto com o cantor): o do servidor separa só o cantor principal, com
// modelos grandes demais para o celular. O ffmpeg é o que já vem no APK (o do yt-dlp, Baixador)
final class Karaoke {
    private Karaoke() {}

    static final String MODELO = "UVR-MDX-NET-Inst_HQ_4.onnx";
    static final String MODELO_URL = "https://github.com/k2-fsa/sherpa-onnx/releases/download/source-separation-models/" + MODELO;
    static final long MODELO_TAMANHO = 59074650L;
    static final String MODELO_VELHO = "UVR_MDXNET_9482.onnx"; // (o de antes: sai do aparelho)

    // os parâmetros do modelo (gravados nele: n_fft 5120, hop 1024, dim_f 2560, dim_t 256, dim_c 4). A saída é a BANDA
    static final int SR = 44100;
    static final int NFFT = 5120;
    static final int HOP = 1024;
    static final int DF = 2560;
    static final int DT = 256;
    static final int CHUNK = HOP * (DT - 1);   // 261120 amostras por pedaço
    static final int TRIM = NFFT / 2;          // a sobra de cada lado (descartada)
    static final int GEN = CHUNK - 2 * TRIM;   // o que cada pedaço entrega (256000)
    static final int MAX_SEGUNDOS = 1800;

    interface Andamento { void em(String etapa, float fracao); }

    // O karaokê que a pessoa pediu (tocou no microfone) passa na frente: os feitos em segundo plano (os das músicas
    // baixadas, os refeitos pela revisão) esperam, entre um pedaço e outro, enquanto houver um pedido dela andando.
    // Antes era uma fila só, e o pedido dela ficava parado no começo, atrás dos de segundo plano
    static final java.util.concurrent.atomic.AtomicInteger PEDIDOS = new java.util.concurrent.atomic.AtomicInteger();

    static void esperarAVez(boolean prioridade, Andamento andamento) throws InterruptedException {
        if (prioridade) return;
        boolean avisou = false;
        while (PEDIDOS.get() > 0) {
            if (!avisou) { andamento.em("esperando", 0); avisou = true; }
            Thread.sleep(500);
        }
    }

    // ---- o modelo: baixado na primeira vez (30 MB), conferido pelo tamanho
    static File arquivoDoModelo(Context ctx) {
        return new File(new File(ctx.getFilesDir(), "karaoke"), MODELO);
    }

    static boolean temModelo(Context ctx) {
        File f = arquivoDoModelo(ctx);
        return f.isFile() && f.length() == MODELO_TAMANHO;
    }

    static synchronized File modelo(Context ctx, Andamento andamento) throws Exception {
        File f = arquivoDoModelo(ctx);
        //noinspection ResultOfMethodCallIgnored
        new File(f.getParentFile(), MODELO_VELHO).delete();
        if (f.isFile() && f.length() == MODELO_TAMANHO) return f;
        //noinspection ResultOfMethodCallIgnored
        f.getParentFile().mkdirs();
        File parcial = new File(f.getPath() + ".parcial");
        HttpURLConnection c = (HttpURLConnection) new URL(MODELO_URL).openConnection();
        c.setInstanceFollowRedirects(true);
        c.setConnectTimeout(20000);
        c.setReadTimeout(60000);
        try (InputStream in = c.getInputStream(); OutputStream out = new FileOutputStream(parcial)) {
            byte[] buf = new byte[1 << 16];
            long recebido = 0;
            int n;
            while ((n = in.read(buf)) > 0) {
                out.write(buf, 0, n);
                recebido += n;
                andamento.em("modelo", Math.min(1f, recebido / (float) MODELO_TAMANHO));
            }
        } finally {
            c.disconnect();
        }
        if (parcial.length() != MODELO_TAMANHO) {
            //noinspection ResultOfMethodCallIgnored
            parcial.delete();
            throw new IllegalStateException("o modelo do karaokê chegou incompleto: tente de novo");
        }
        if (!parcial.renameTo(f)) throw new IllegalStateException("não consegui guardar o modelo do karaokê");
        return f;
    }

    // ---- o ffmpeg do APK (o mesmo que o yt-dlp usa)
    static List<String> ffmpeg(Context ctx, String... args) {
        List<String> cmd = new ArrayList<>();
        cmd.add(new File(ctx.getApplicationInfo().nativeLibraryDir, "libffmpeg.so").getAbsolutePath());
        Collections.addAll(cmd, args);
        return cmd;
    }

    static ProcessBuilder processo(Context ctx, List<String> cmd) {
        ProcessBuilder pb = new ProcessBuilder(cmd);
        File pacotes = new File(ctx.getNoBackupFilesDir(), "youtubedl-android/packages");
        pb.environment().put("LD_LIBRARY_PATH", new File(pacotes, "ffmpeg/usr/lib").getAbsolutePath() + ":"
            + new File(pacotes, "python/usr/lib").getAbsolutePath());
        return pb;
    }

    static String lerTexto(File f) {
        try (InputStream in = new java.io.FileInputStream(f)) {
            byte[] b = new byte[(int) Math.min(f.length(), 4000)];
            int n = in.read(b);
            return n > 0 ? new String(b, 0, n, "UTF-8").trim() : "";
        } catch (Exception e) { return ""; }
    }

    // ---- a STFT do modelo (janela de Hann periódica, center=True com reflexo, como o torch.stft)
    static final float[] JANELA = new float[NFFT];
    static {
        for (int i = 0; i < NFFT; i++) JANELA[i] = (float) (0.5 - 0.5 * Math.cos(2 * Math.PI * i / NFFT));
    }

    // FFT complexa de n pontos, no lugar (inversa: o conjugado, sem dividir; quem chama divide). n = 2^k ou 5 × 2^k (o
    // n_fft 5120 do modelo): o de 5 × 2^k são 5 FFTs de 2^k (as amostras de 5 em 5) juntadas por uma borboleta de 5
    static void fft(double[] re, double[] im, boolean inversa) {
        int n = re.length;
        if ((n & (n - 1)) == 0) { fft2(re, im, inversa); return; }
        if (n % 5 != 0 || ((n / 5) & (n / 5 - 1)) != 0) throw new IllegalArgumentException("tamanho da FFT: " + n);
        int m = n / 5;
        double[][] sr = new double[5][m], si = new double[5][m];
        for (int r = 0; r < 5; r++) {
            for (int k = 0; k < m; k++) { sr[r][k] = re[5 * k + r]; si[r][k] = im[5 * k + r]; }
            fft2(sr[r], si[r], inversa);
        }
        double[][] w = giro(n);
        double sinal = inversa ? 1 : -1;
        for (int k = 0; k < n; k++) {
            double ar = 0, ai = 0;
            int km = k % m;
            for (int r = 0; r < 5; r++) {
                int t = (int) ((long) r * k % n);
                double c = w[0][t], sn = sinal * w[1][t];
                ar += sr[r][km] * c - si[r][km] * sn;
                ai += sr[r][km] * sn + si[r][km] * c;
            }
            re[k] = ar;
            im[k] = ai;
        }
    }

    // cos e sen de 2πt/n (a tabela de cada tamanho, feita uma vez)
    private static final java.util.Map<Integer, double[][]> GIROS = new java.util.concurrent.ConcurrentHashMap<>();
    static double[][] giro(int n) {
        return GIROS.computeIfAbsent(n, (x) -> {
            double[][] w = new double[2][x];
            for (int t = 0; t < x; t++) { w[0][t] = Math.cos(2 * Math.PI * t / x); w[1][t] = Math.sin(2 * Math.PI * t / x); }
            return w;
        });
    }

    // a FFT de potência de 2 (Cooley-Tukey, no lugar)
    static void fft2(double[] re, double[] im, boolean inversa) {
        int n = re.length;
        for (int i = 1, j = 0; i < n; i++) {
            int bit = n >> 1;
            for (; (j & bit) != 0; bit >>= 1) j ^= bit;
            j ^= bit;
            if (i < j) { double t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
        }
        double sinal = inversa ? 1 : -1;
        for (int len = 2; len <= n; len <<= 1) {
            double ang = sinal * 2 * Math.PI / len;
            double wr0 = Math.cos(ang), wi0 = Math.sin(ang);
            for (int i = 0; i < n; i += len) {
                double wr = 1, wi = 0;
                for (int k = 0; k < len / 2; k++) {
                    int a = i + k, b = i + k + len / 2;
                    double xr = re[b] * wr - im[b] * wi, xi = re[b] * wi + im[b] * wr;
                    re[b] = re[a] - xr; im[b] = im[a] - xi;
                    re[a] += xr; im[a] += xi;
                    double t = wr * wr0 - wi * wi0;
                    wi = wr * wi0 + wi * wr0;
                    wr = t;
                }
            }
        }
    }

    // o espectro de um pedaço (CHUNK amostras de um lado) nos canais c (real) e c+1 (imaginário) da entrada do modelo
    static void stft(float[] x, float[] entrada, int c) {
        double[] re = new double[NFFT], im = new double[NFFT];
        int meio = NFFT / 2;
        for (int t = 0; t < DT; t++) {
            int ini = t * HOP - meio;
            for (int i = 0; i < NFFT; i++) {
                int p = ini + i;
                if (p < 0) p = -p;                          // reflexo no começo
                else if (p >= x.length) p = 2 * (x.length - 1) - p; // e no fim
                re[i] = x[p] * JANELA[i];
                im[i] = 0;
            }
            fft(re, im, false);
            for (int f = 0; f < DF; f++) {
                entrada[(c * DF + f) * DT + t] = (float) re[f];
                entrada[((c + 1) * DF + f) * DT + t] = (float) im[f];
            }
        }
    }

    // o pedaço de volta ao som (as faixas acima de DF ficam zeradas), sobreposto e normalizado pela janela
    static float[] istft(float[] saida, int c) {
        int total = NFFT + HOP * (DT - 1);
        double[] som = new double[total];
        double[] peso = new double[total];
        double[] re = new double[NFFT], im = new double[NFFT];
        for (int t = 0; t < DT; t++) {
            java.util.Arrays.fill(re, 0);
            java.util.Arrays.fill(im, 0);
            for (int f = 0; f < DF; f++) {
                re[f] = saida[(c * DF + f) * DT + t];
                im[f] = saida[((c + 1) * DF + f) * DT + t];
            }
            // (o espectro de um sinal real: a metade de cima é o conjugado da de baixo)
            for (int f = 1; f < NFFT / 2; f++) { re[NFFT - f] = re[f]; im[NFFT - f] = -im[f]; }
            im[0] = 0;
            fft(re, im, true);
            int ini = t * HOP;
            for (int i = 0; i < NFFT; i++) {
                som[ini + i] += re[i] / NFFT * JANELA[i];
                peso[ini + i] += JANELA[i] * JANELA[i];
            }
        }
        float[] out = new float[CHUNK];
        int meio = NFFT / 2;
        for (int i = 0; i < CHUNK; i++) {
            double w = peso[meio + i];
            out[i] = (float) (w > 1e-8 ? som[meio + i] / w : 0);
        }
        return out;
    }

    static final class Resultado {
        double duracao;
        long tamanho;
    }

    // Do áudio da música (qualquer formato que o ffmpeg abre) ao karaokê em saida (.m4a). pasta: os arquivos de
    // trabalho (apagados no fim)
    static Resultado fazer(Context ctx, File entrada, File saida, File pasta, Andamento andamento) throws Exception {
        return fazer(ctx, entrada, saida, pasta, andamento, true);
    }

    static Resultado fazer(Context ctx, File entrada, File saida, File pasta, Andamento andamento, boolean prioridade) throws Exception {
        Baixador.preparar(ctx); // (o ffmpeg do APK extraído)
        File arqModelo = modelo(ctx, andamento);
        //noinspection ResultOfMethodCallIgnored
        pasta.mkdirs();
        File pcm = new File(pasta, "musica.pcm");
        File erroLer = new File(pasta, "ler.txt");
        andamento.em("lendo", 0);
        // 1. a música em estéreo, 44,1 kHz, 16 bits (metade do tamanho do float: cabe melhor no celular)
        Process ler = processo(ctx, ffmpeg(ctx, "-v", "error", "-nostdin", "-y", "-i", entrada.getAbsolutePath(), "-t", String.valueOf(MAX_SEGUNDOS),
            "-f", "s16le", "-acodec", "pcm_s16le", "-ac", "2", "-ar", String.valueOf(SR), pcm.getAbsolutePath()))
            .redirectErrorStream(true).redirectOutput(erroLer).start();
        if (ler.waitFor() != 0 || !pcm.isFile() || pcm.length() < 4L * SR) {
            throw new IllegalStateException("não consegui abrir este áudio" + (erroLer.isFile() ? " (" + ultimaLinha(lerTexto(erroLer)) + ")" : ""));
        }
        long n = pcm.length() / 4; // amostras por lado
        long pad = GEN - n % GEN;
        long pedacos = (n + pad) / GEN;

        // 2. o gravador (o ffmpeg recebe os 4 canais enquanto a separação anda: não precisa de um arquivo enorme)
        File erroGravar = new File(pasta, "gravar.txt");
        Process gravar = processo(ctx, ffmpeg(ctx, "-v", "error", "-nostdin", "-y", "-f", "f32le", "-ar", String.valueOf(SR), "-ac", "4", "-i", "-",
            "-af", "channelmap=map=0|1|2|3:channel_layout=quad", "-c:a", "aac", "-b:a", "384k", "-movflags", "+faststart", saida.getAbsolutePath()))
            .redirectErrorStream(true).redirectOutput(erroGravar).start();

        OrtEnvironment env = OrtEnvironment.getEnvironment();
        OrtSession.SessionOptions op = new OrtSession.SessionOptions();
        op.setIntraOpNumThreads(Math.max(1, Math.min(4, Runtime.getRuntime().availableProcessors())));
        op.setOptimizationLevel(OrtSession.SessionOptions.OptLevel.ALL_OPT);
        // (o XNNPACK, quando o aparelho tem: as convoluções do modelo bem mais rápidas no processador do celular)
        OrtSession sessaoCriada;
        try {
            OrtSession.SessionOptions rapido = new OrtSession.SessionOptions();
            rapido.setIntraOpNumThreads(1);
            rapido.setOptimizationLevel(OrtSession.SessionOptions.OptLevel.ALL_OPT);
            java.util.Map<String, String> xnn = new java.util.HashMap<>();
            xnn.put("intra_op_num_threads", String.valueOf(Math.max(1, Math.min(4, Runtime.getRuntime().availableProcessors()))));
            rapido.addXnnpack(xnn);
            sessaoCriada = env.createSession(arqModelo.getAbsolutePath(), rapido);
        } catch (Throwable semXnnpack) {
            sessaoCriada = env.createSession(arqModelo.getAbsolutePath(), op);
        }
        try (OrtSession sessao = sessaoCriada;
             RandomAccessFile musica = new RandomAccessFile(pcm, "r");
             OutputStream out = new BufferedOutputStream(gravar.getOutputStream(), 1 << 20)) {
            String nomeEntrada = sessao.getInputNames().iterator().next();
            float[] esquerda = new float[CHUNK], direita = new float[CHUNK];
            float[] espectro = new float[4 * DF * DT];
            byte[] bruto = new byte[CHUNK * 4];
            ByteBuffer saidaBytes = ByteBuffer.allocate(GEN * 16).order(ByteOrder.LITTLE_ENDIAN);
            andamento.em("separando", 0);
            for (long k = 0; k < pedacos; k++) {
                esperarAVez(prioridade, andamento);
                // o pedaço da música com a sobra de cada lado (antes do começo e depois do fim: silêncio)
                long inicio = k * GEN - TRIM;
                java.util.Arrays.fill(esquerda, 0);
                java.util.Arrays.fill(direita, 0);
                long de = Math.max(0, inicio), ate = Math.min(n, inicio + CHUNK);
                if (ate > de) {
                    musica.seek(de * 4);
                    int bytes = (int) ((ate - de) * 4);
                    musica.readFully(bruto, 0, bytes);
                    ByteBuffer bb = ByteBuffer.wrap(bruto, 0, bytes).order(ByteOrder.LITTLE_ENDIAN);
                    for (int i = 0; i < ate - de; i++) {
                        esquerda[(int) (de - inicio) + i] = bb.getShort() / 32768f;
                        direita[(int) (de - inicio) + i] = bb.getShort() / 32768f;
                    }
                }
                stft(esquerda, espectro, 0);
                stft(direita, espectro, 2);
                float[] banda;
                try (OnnxTensor t = OnnxTensor.createTensor(env, FloatBuffer.wrap(espectro), new long[] { 1, 4, DF, DT });
                     OrtSession.Result r = sessao.run(Collections.singletonMap(nomeEntrada, t))) {
                    FloatBuffer fb = ((OnnxTensor) r.get(0)).getFloatBuffer();
                    banda = new float[fb.remaining()];
                    fb.get(banda);
                }
                // (o modelo devolve a banda; a voz é a gravação menos a banda: banda + voz = a gravação)
                float[] bandaE = istft(banda, 0), bandaD = istft(banda, 2);
                // o que este pedaço entrega: GEN amostras do meio (no último, só até o fim da música)
                int quantas = (int) Math.min(GEN, n - k * GEN);
                saidaBytes.clear();
                for (int i = 0; i < quantas; i++) {
                    float be = bandaE[TRIM + i], bd = bandaD[TRIM + i];
                    saidaBytes.putFloat(be).putFloat(bd).putFloat(esquerda[TRIM + i] - be).putFloat(direita[TRIM + i] - bd);
                }
                out.write(saidaBytes.array(), 0, quantas * 16);
                andamento.em("separando", (k + 1) / (float) pedacos);
            }
        } catch (Exception e) {
            gravar.destroy();
            throw e;
        }
        andamento.em("gravando", 1);
        if (gravar.waitFor() != 0 || !saida.isFile() || saida.length() < 10000) {
            throw new IllegalStateException("não consegui gravar o karaokê (" + ultimaLinha(lerTexto(erroGravar)) + ")");
        }
        Resultado res = new Resultado();
        res.duracao = Math.round(n * 100.0 / SR) / 100.0;
        res.tamanho = saida.length();
        //noinspection ResultOfMethodCallIgnored
        pcm.delete();
        return res;
    }

    static String ultimaLinha(String s) {
        String[] l = s.trim().split("\n");
        String u = l.length > 0 ? l[l.length - 1].trim() : "";
        return u.length() > 160 ? u.substring(0, 160) : u;
    }
}
