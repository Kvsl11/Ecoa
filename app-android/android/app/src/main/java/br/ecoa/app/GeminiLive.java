package br.ecoa.app;

import com.google.common.util.concurrent.FutureCallback;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.common.util.concurrent.MoreExecutors;
import com.google.firebase.ai.FirebaseAI;
import com.google.firebase.ai.LiveGenerativeModel;
import com.google.firebase.ai.java.LiveModelFutures;
import com.google.firebase.ai.java.LiveSessionFutures;
import com.google.firebase.ai.type.Content;
import com.google.firebase.ai.type.GenerativeBackend;
import com.google.firebase.ai.type.LiveGenerationConfig;
import com.google.firebase.ai.type.LiveSession;
import com.google.firebase.ai.type.ResponseModality;
import com.google.firebase.ai.type.SpeechConfig;
import com.google.firebase.ai.type.Voice;

import java.util.concurrent.Executor;

/**
 * Sessão de voz do Lúmen no próprio Android, usando Firebase AI Logic / Gemini Live.
 * Nenhuma chave Gemini é armazenada no APK e nenhum servidor próprio é necessário.
 */
final class GeminiLive {
    static final String MODELO = "gemini-3.1-flash-live-preview";
    private static LiveSessionFutures sessao;
    private static boolean iniciando;

    interface Retorno {
        void sucesso();
        void erro(Throwable erro);
    }

    private GeminiLive() {}

    static void iniciar(String genero, String instrucao, Executor executor, Retorno retorno) {
        synchronized (GeminiLive.class) {
            if (sessao != null || iniciando) {
                retorno.erro(new IllegalStateException("A conversa ao vivo já está iniciada."));
                return;
            }
            iniciando = true;
        }

        try {
            // Mapeia as identidades do Lúmen para vozes suportadas pelo Gemini Live.
            String voz = "masculina".equalsIgnoreCase(genero) ? "Charon" : "Aoede";
            Content sistema = new Content.Builder()
                .addText(instrucao == null || instrucao.trim().isEmpty()
                    ? "Você é o Lúmen, assistente do Songbook Litúrgico. Responda em português do Brasil, com naturalidade, clareza e frases curtas."
                    : instrucao)
                .build();

            LiveGenerationConfig config = new LiveGenerationConfig.Builder()
                .setResponseModality(ResponseModality.AUDIO)
                .setSpeechConfig(new SpeechConfig(new Voice(voz)))
                .build();

            LiveGenerativeModel modelo = FirebaseAI
                .getInstance(GenerativeBackend.googleAI())
                .liveModel(MODELO, config, null, sistema);

            LiveModelFutures modeloFuturo = LiveModelFutures.from(modelo);
            ListenableFuture<LiveSession> conexao = modeloFuturo.connect();

            Futures.addCallback(conexao, new FutureCallback<LiveSession>() {
                @Override public void onSuccess(LiveSession criada) {
                    LiveSessionFutures nova = LiveSessionFutures.from(criada);
                    synchronized (GeminiLive.class) {
                        sessao = nova;
                        iniciando = false;
                    }
                    // O SDK gerencia a captura do microfone e a reprodução do áudio de resposta.
                    ListenableFuture<?> inicio = nova.startAudioConversation();
                    Futures.addCallback(inicio, new FutureCallback<Object>() {
                        @Override public void onSuccess(Object ignorado) { retorno.sucesso(); }
                        @Override public void onFailure(Throwable erro) {
                            synchronized (GeminiLive.class) { sessao = null; }
                            retorno.erro(erro);
                        }
                    }, executor);
                }

                @Override public void onFailure(Throwable erro) {
                    synchronized (GeminiLive.class) { iniciando = false; sessao = null; }
                    retorno.erro(erro);
                }
            }, executor);
        } catch (Throwable erro) {
            synchronized (GeminiLive.class) { iniciando = false; sessao = null; }
            retorno.erro(erro);
        }
    }

    static void parar(Executor executor, Retorno retorno) {
        final LiveSessionFutures atual;
        synchronized (GeminiLive.class) {
            atual = sessao;
            sessao = null;
            iniciando = false;
        }
        if (atual == null) {
            retorno.sucesso();
            return;
        }
        try {
            ListenableFuture<?> parada = atual.stopAudioConversation();
            Futures.addCallback(parada, new FutureCallback<Object>() {
                @Override public void onSuccess(Object ignorado) { retorno.sucesso(); }
                @Override public void onFailure(Throwable erro) { retorno.erro(erro); }
            }, executor);
        } catch (Throwable erro) {
            retorno.erro(erro);
        }
    }

    static synchronized boolean ativa() { return sessao != null; }
}
