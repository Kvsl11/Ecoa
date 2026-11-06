package br.ecoa.app;

import android.Manifest;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
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
        pedirNotificacoes();
    }

    // As notificações (os downloads e o player) com a pergunta do próprio Android, uma vez, ao abrir o app pela primeira
    // vez. Depois, quem quiser muda em Configurações → Apps → Ecoa → Notificações (o Android não deixa perguntar de novo)
    private void pedirNotificacoes() {
        if (Build.VERSION.SDK_INT < 33) return;
        if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) return;
        SharedPreferences p = getSharedPreferences(EcoaPlugin.PREFS, MODE_PRIVATE);
        if (p.getBoolean("pediuAvisos", false)) return;
        p.edit().putBoolean("pediuAvisos", true).apply();
        requestPermissions(new String[] { Manifest.permission.POST_NOTIFICATIONS }, 7);
    }

    // (o app já aberto, e um botão do widget ou do aviso trouxe ele para a frente com uma ação)
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        Acoes.daIntent(intent);
    }
}
