package br.ecoa.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.widget.RemoteViews;

// O widget da tela inicial (como o do Spotify): a capa, o nome e o artista da última música tocada, e voltar,
// tocar/pausar e pular. Tocar na capa ou no nome abre o app
public class EcoaWidget extends AppWidgetProvider {
    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) mgr.updateAppWidget(id, montar(ctx));
    }

    static void atualizarTodos(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, EcoaWidget.class));
        if (ids.length == 0) return;
        RemoteViews v = montar(ctx);
        for (int id : ids) mgr.updateAppWidget(id, v);
    }

    static PendingIntent botao(Context ctx, String acao, int codigo) {
        Intent i = new Intent(ctx, AcoesReceiver.class).putExtra(Acoes.EXTRA, acao);
        return PendingIntent.getBroadcast(ctx, codigo, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static PendingIntent abrirApp(Context ctx) {
        Intent i = new Intent(ctx, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(ctx, 10, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static RemoteViews montar(Context ctx) {
        SharedPreferences p = ctx.getSharedPreferences(EcoaPlugin.PREFS, Context.MODE_PRIVATE);
        String titulo = p.getString("titulo", "");
        boolean tocando = p.getBoolean("tocando", false);
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_ecoa);
        v.setTextViewText(R.id.w_titulo, titulo.isEmpty() ? "Ecoa" : titulo);
        v.setTextViewText(R.id.w_artista, titulo.isEmpty() ? "Toque para abrir" : p.getString("artista", ""));
        Bitmap capa = Capas.ler(ctx);
        if (capa != null) v.setImageViewBitmap(R.id.w_capa, capa); else v.setImageViewResource(R.id.w_capa, R.mipmap.ic_launcher);
        v.setImageViewResource(R.id.w_tocar, tocando ? R.drawable.ic_pausar : R.drawable.ic_tocar);
        v.setContentDescription(R.id.w_tocar, tocando ? "Pausar" : "Tocar");
        v.setOnClickPendingIntent(R.id.w_anterior, botao(ctx, Acoes.ANTERIOR, 1));
        v.setOnClickPendingIntent(R.id.w_tocar, botao(ctx, Acoes.ALTERNAR, 2));
        v.setOnClickPendingIntent(R.id.w_proxima, botao(ctx, Acoes.PROXIMA, 3));
        v.setOnClickPendingIntent(R.id.w_capa, abrirApp(ctx));
        v.setOnClickPendingIntent(R.id.w_textos, abrirApp(ctx));
        return v;
    }
}
