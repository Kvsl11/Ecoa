package br.ecoa.app;

import android.app.Activity;
import android.os.Bundle;

// Os botões do aviso de "tocando" e do widget abrem esta tela, que não mostra nada: ela entrega o comando (Acoes.fazer)
// e se fecha na hora. Antes os botões abriam a tela do app a cada toque (pausar na notificação trazia o Ecoa para a
// frente). Um botão de notificação não pode abrir uma tela a partir de um receiver (o Android 12 bloqueia), e por aqui
// pode: quando o comando precisa do app na frente (o app fechado, a música do YouTube), é daqui que ele abre
public class AcaoActivity extends Activity {
    @Override
    protected void onCreate(Bundle estado) {
        super.onCreate(estado);
        String acao = getIntent() == null ? null : getIntent().getStringExtra(Acoes.EXTRA);
        if (acao != null) Acoes.fazer(this, acao);
        finish();
        overridePendingTransition(0, 0);
    }
}
