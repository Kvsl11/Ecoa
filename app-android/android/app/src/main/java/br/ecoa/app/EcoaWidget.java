package br.ecoa.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.os.Build;
import android.os.Bundle;
import android.util.SizeF;
import android.widget.RemoteViews;

import java.util.HashMap;
import java.util.Map;

// O widget da tela inicial: a capa, o nome e o artista da última música tocada, e voltar, tocar/pausar e pular. Tocar
// na capa ou no nome abre o app. Tem três formatos, conforme o tamanho que a pessoa deixa: uma linha (widget_ecoa_pequeno),
// o padrão de duas linhas (widget_ecoa) e o grande, com a capa em cima (widget_ecoa_grande). No Android 12 ou mais novo
// o próprio Android troca o formato ao redimensionar; nos anteriores, o formato é escolhido pela altura de cada widget.
// A capa vai com os cantos arredondados e o fundo leva a cor dela, escurecida (Capas.paraWidget, Capas.corDoFundo)
public class EcoaWidget extends AppWidgetProvider {
    // a altura (em dp) a partir da qual vale cada formato
    private static final int ALTURA_MEDIO = 100;
    private static final int ALTURA_GRANDE = 230;
    private static final int COR_PADRAO = 0xFF1C1C22;

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        atualizar(ctx, mgr, ids);
    }

    // (o widget mudou de tamanho: nos Androids sem a troca automática, o formato é escolhido de novo)
    @Override
    public void onAppWidgetOptionsChanged(Context ctx, AppWidgetManager mgr, int id, Bundle opcoes) {
        atualizar(ctx, mgr, new int[] { id });
    }

    static void atualizarTodos(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, EcoaWidget.class));
        if (ids.length > 0) atualizar(ctx, mgr, ids);
    }

    private static void atualizar(Context ctx, AppWidgetManager mgr, int[] ids) {
        Bitmap capa = Capas.paraWidget(ctx);
        int cor = capa == null ? COR_PADRAO : Capas.corDoFundo(capa, COR_PADRAO);
        for (int id : ids) {
            try {
                mgr.updateAppWidget(id, montar(ctx, mgr, id, capa, cor));
            } catch (Exception e) {
                // (a capa não coube na memória que o Android dá ao widget: vai sem ela, com a logo)
                try { mgr.updateAppWidget(id, montar(ctx, mgr, id, null, COR_PADRAO)); } catch (Exception e2) { /* o widget fica como estava */ }
            }
        }
    }

    private static RemoteViews montar(Context ctx, AppWidgetManager mgr, int id, Bitmap capa, int cor) {
        if (Build.VERSION.SDK_INT >= 31) {
            // (o Android escolhe, entre os três, o maior formato que cabe no tamanho do widget)
            Map<SizeF, RemoteViews> porTamanho = new HashMap<>();
            porTamanho.put(new SizeF(160f, 40f), formato(ctx, R.layout.widget_ecoa_pequeno, capa, cor));
            porTamanho.put(new SizeF(220f, ALTURA_MEDIO), formato(ctx, R.layout.widget_ecoa, capa, cor));
            porTamanho.put(new SizeF(180f, ALTURA_GRANDE), formato(ctx, R.layout.widget_ecoa_grande, capa, cor));
            return new RemoteViews(porTamanho);
        }
        Bundle opcoes = mgr.getAppWidgetOptions(id);
        // (em pé, a altura do widget é a máxima informada; sem a informação, o formato padrão)
        int altura = opcoes == null ? 0 : opcoes.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0);
        int layout = altura <= 0 ? R.layout.widget_ecoa : altura < ALTURA_MEDIO ? R.layout.widget_ecoa_pequeno
            : altura >= ALTURA_GRANDE ? R.layout.widget_ecoa_grande : R.layout.widget_ecoa;
        return formato(ctx, layout, capa, cor);
    }

    // um dos formatos, com a música de agora (os três têm as mesmas peças, com os mesmos nomes)
    private static RemoteViews formato(Context ctx, int layout, Bitmap capa, int cor) {
        SharedPreferences p = ctx.getSharedPreferences(EcoaPlugin.PREFS, Context.MODE_PRIVATE);
        String titulo = p.getString("titulo", "");
        boolean tocando = p.getBoolean("tocando", false);
        RemoteViews v = new RemoteViews(ctx.getPackageName(), layout);
        v.setTextViewText(R.id.w_titulo, titulo.isEmpty() ? "Ecoa" : titulo);
        String artista = p.getString("artista", "");
        v.setTextViewText(R.id.w_artista, titulo.isEmpty() ? "Toque para abrir" : artista);
        // (sem o artista, a linha dele some e o nome fica no meio)
        v.setViewVisibility(R.id.w_artista, !titulo.isEmpty() && artista.isEmpty() ? android.view.View.GONE : android.view.View.VISIBLE);
        if (capa != null) v.setImageViewBitmap(R.id.w_capa, capa); else v.setImageViewResource(R.id.w_capa, R.drawable.widget_sem_capa);
        v.setInt(R.id.w_fundo, "setColorFilter", cor);
        v.setImageViewResource(R.id.w_tocar, tocando ? R.drawable.ic_pausar : R.drawable.ic_tocar);
        v.setContentDescription(R.id.w_tocar, tocando ? "Pausar" : "Tocar");
        v.setOnClickPendingIntent(R.id.w_anterior, botao(ctx, Acoes.ANTERIOR, 1));
        v.setOnClickPendingIntent(R.id.w_tocar, botao(ctx, Acoes.ALTERNAR, 2));
        v.setOnClickPendingIntent(R.id.w_proxima, botao(ctx, Acoes.PROXIMA, 3));
        v.setOnClickPendingIntent(R.id.w_capa, abrirApp(ctx));
        v.setOnClickPendingIntent(R.id.w_textos, abrirApp(ctx));
        return v;
    }

    static PendingIntent botao(Context ctx, String acao, int codigo) {
        // O toque abre a AcaoActivity (invisível), que entrega o comando e se fecha: a tela do app não vem mais para a
        // frente só para pausar ou pular, e a página é acordada antes de receber o comando (Acoes.fazer).
        Intent i = new Intent(ctx, AcaoActivity.class)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_NO_ANIMATION | Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS)
            .putExtra(Acoes.EXTRA, acao);
        return PendingIntent.getActivity(ctx, codigo, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    // o aviso de "tocando" dispensado com o dedo: fecha o serviço e a sessão (não precisa de tela)
    static PendingIntent aoDispensar(Context ctx) {
        Intent i = new Intent(ctx, AcoesReceiver.class).putExtra(Acoes.EXTRA, Acoes.FECHAR);
        return PendingIntent.getBroadcast(ctx, 30, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static PendingIntent abrirApp(Context ctx) {
        Intent i = new Intent(ctx, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(ctx, 10, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
