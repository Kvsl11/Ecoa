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
    private int real = View.VISIBLE;

    public EcoaWebView(Context context, AttributeSet attrs) {
        super(context, attrs);
        atual = this;
    }

    @Override
    protected void onWindowVisibilityChanged(int visibilidade) {
        real = visibilidade;
        super.onWindowVisibilityChanged(tocando ? View.VISIBLE : visibilidade);
    }

    private void aplicar() {
        super.onWindowVisibilityChanged(tocando ? View.VISIBLE : real);
    }

    // a música começou ou parou (o site avisa pelo plugin)
    static void definirTocando(boolean t) {
        if (tocando == t) return;
        tocando = t;
        EcoaWebView w = atual;
        if (w != null) w.post(w::aplicar);
    }
}
