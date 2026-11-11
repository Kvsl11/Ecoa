package br.ecoa.app;

import android.content.Context;
import android.util.AttributeSet;
import android.view.View;

import com.getcapacitor.CapacitorWebView;

// O WebView do Ecoa: enquanto a música toca, a página continua "visível" com o app minimizado ou a tela apagada.
// Escondida, o WebView e o player do YouTube pausam a música (o YouTube pausa a página escondida no celular). Parada a
// música, a página passa a saber a visibilidade de verdade (escondida, ela não gasta bateria desenhando a capa animada)
public class EcoaWebView extends CapacitorWebView {
    private static volatile boolean tocando = false;
    private static EcoaWebView atual;
    private static volatile long acordadaAte = 0; // (SystemClock.uptimeMillis)
    private int real = View.VISIBLE;

    private static boolean visivel() { return tocando || android.os.SystemClock.uptimeMillis() < acordadaAte; }

    public EcoaWebView(Context context, AttributeSet attrs) {
        super(context, attrs);
        atual = this;
    }

    @Override
    protected void onWindowVisibilityChanged(int visibilidade) {
        real = visibilidade;
        super.onWindowVisibilityChanged(visivel() ? View.VISIBLE : visibilidade);
    }

    private void aplicar() {
        super.onWindowVisibilityChanged(visivel() ? View.VISIBLE : real);
    }

    // Um comando do aviso de "tocando", do widget ou do fone chegou com o app em segundo plano: a página, que estava
    // escondida (pausada, ela não fica "visível"), passa a contar como visível por alguns segundos, com os temporizadores
    // ligados, para atender o comando na hora. Antes o comando ficava esperando o app voltar para a frente: o "tocar" e
    // o "pular" com a música pausada não faziam nada. Se a música voltar a tocar, a página continua visível por ela
    static void acordar() {
        EcoaWebView w = atual;
        if (w == null) return;
        w.post(() -> {
            acordadaAte = android.os.SystemClock.uptimeMillis() + 12000;
            try { w.resumeTimers(); w.onResume(); } catch (Exception e) { /* segue: a visibilidade já ajuda */ }
            w.aplicar();
            w.postDelayed(w::aplicar, 12500);
        });
    }

    // a música começou ou parou (o site avisa pelo plugin)
    static void definirTocando(boolean t) {
        if (tocando == t) return;
        tocando = t;
        EcoaWebView w = atual;
        if (w != null) w.post(w::aplicar);
    }
}
