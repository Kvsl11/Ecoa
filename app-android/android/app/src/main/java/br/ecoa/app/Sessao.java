package br.ecoa.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.os.SystemClock;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;

// A sessão de mídia do Android (como a do YouTube Music e a do Spotify): é ela que faz o aviso de "tocando" virar o
// player do Android, com a capa, a barra do tempo e os botões, nas notificações, na tela de bloqueio e nos botões do
// fone. Os botões dela fazem o mesmo que os do widget
final class Sessao {
    private static MediaSessionCompat sessao;

    private Sessao() {}

    static synchronized MediaSessionCompat de(Context ctx) {
        if (sessao != null) return sessao;
        final Context app = ctx.getApplicationContext();
        sessao = new MediaSessionCompat(app, "Ecoa");
        sessao.setCallback(new MediaSessionCompat.Callback() {
            // (tocar e pausar explícitos: com "alternar", o comando repetido ou atrasado invertia o estado — pausava o
            // que devia tocar)
            @Override public void onPlay() { Acoes.fazer(app, Acoes.TOCAR); }
            @Override public void onPause() { Acoes.fazer(app, Acoes.PAUSAR); }
            @Override public void onStop() { Acoes.fazer(app, Acoes.PAUSAR); }
            @Override public void onSkipToNext() { Acoes.fazer(app, Acoes.PROXIMA); }
            @Override public void onSkipToPrevious() { Acoes.fazer(app, Acoes.ANTERIOR); }
            @Override public void onSeekTo(long pos) { Acoes.fazer(app, Acoes.IR + (pos / 1000.0)); }
        });
        sessao.setActive(true);
        return sessao;
    }

    private static boolean tocando(Context ctx) {
        return ctx.getSharedPreferences(EcoaPlugin.PREFS, Context.MODE_PRIVATE).getBoolean("tocando", false);
    }

    // o aviso de "tocando" foi dispensado (ou o player fechou): a sessão sai do player do Android até a música tocar
    // de novo
    static synchronized void parar(Context ctx) {
        if (sessao == null) return;
        try {
            sessao.setPlaybackState(new PlaybackStateCompat.Builder().setState(PlaybackStateCompat.STATE_STOPPED, 0, 0f).build());
            sessao.setActive(false);
        } catch (Exception e) { /* a sessão já tinha saído */ }
    }

    // a música, a capa, a duração e o ponto (o Android anda com a barra sozinho enquanto toca)
    static void atualizar(Context ctx) {
        MediaSessionCompat s = de(ctx);
        // (dispensada pausada, a sessão só volta quando a música tocar; a atualização da capa não a traz de volta)
        if (!s.isActive()) {
            if (!tocando(ctx)) return;
            s.setActive(true);
        }
        SharedPreferences p = ctx.getSharedPreferences(EcoaPlugin.PREFS, Context.MODE_PRIVATE);
        boolean toca = p.getBoolean("tocando", false);
        long duracao = Math.round(p.getFloat("duracao", 0) * 1000);
        long ponto = Math.round(p.getFloat("tempo", 0) * 1000);
        long quando = p.getLong("quando", SystemClock.elapsedRealtime());
        MediaMetadataCompat.Builder m = new MediaMetadataCompat.Builder()
            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, p.getString("titulo", "Ecoa"))
            .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, p.getString("artista", ""));
        if (duracao > 0) m.putLong(MediaMetadataCompat.METADATA_KEY_DURATION, duracao);
        Bitmap capa = Capas.ler(ctx);
        if (capa != null) m.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, capa);
        s.setMetadata(m.build());
        s.setPlaybackState(new PlaybackStateCompat.Builder()
            .setActions(PlaybackStateCompat.ACTION_PLAY | PlaybackStateCompat.ACTION_PAUSE | PlaybackStateCompat.ACTION_PLAY_PAUSE
                | PlaybackStateCompat.ACTION_SKIP_TO_NEXT | PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS | PlaybackStateCompat.ACTION_SEEK_TO)
            .setState(toca ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED, ponto, toca ? 1f : 0f, quando)
            .build());
    }
}
