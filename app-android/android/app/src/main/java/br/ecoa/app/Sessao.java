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
            @Override public void onPlay() { if (!tocando(app)) Acoes.fazer(app, Acoes.ALTERNAR); }
            @Override public void onPause() { if (tocando(app)) Acoes.fazer(app, Acoes.ALTERNAR); }
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

    // a música, a capa, a duração e o ponto (o Android anda com a barra sozinho enquanto toca)
    static void atualizar(Context ctx) {
        MediaSessionCompat s = de(ctx);
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
