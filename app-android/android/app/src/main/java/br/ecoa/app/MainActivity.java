package br.ecoa.app;

import android.content.Intent;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

// A tela do Ecoa: o site (https://kvsl11.github.io/Songbook/) num WebView, com o plugin "Ecoa" para o que só o
// Android faz: o widget da tela inicial, o aviso de "tocando" com os botões, o login do Google pelo próprio Android
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(EcoaPlugin.class);
        super.onCreate(savedInstanceState);
        Acoes.daIntent(getIntent());
    }

    // (o app já aberto, e um botão do widget ou do aviso trouxe ele para a frente com uma ação)
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        Acoes.daIntent(intent);
    }
}
