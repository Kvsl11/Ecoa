package br.ecoa.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

// recebe o toque nos botões do widget e do aviso de "tocando"
public class AcoesReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context ctx, Intent intent) {
        String acao = intent.getStringExtra(Acoes.EXTRA);
        if (acao != null) Acoes.fazer(ctx, acao);
    }
}
