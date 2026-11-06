package br.ecoa.app;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.os.Build;

import com.getcapacitor.JSObject;

// A conexão vista pelo próprio Android (o WebView nem sempre avisa a página quando a internet cai ou volta: o aviso
// "Você está offline" não aparecia no app). online: há rede com internet que funciona (validada pelo Android); kbps: a
// velocidade de descida que o Android estima; lenta: abaixo de ~300 kb/s
final class Rede {
    private Rede() {}

    static final int LENTA_KBPS = 300;

    interface Ouvinte { void mudou(JSObject estado); }

    static JSObject estado(Context ctx) {
        JSObject r = new JSObject();
        boolean online = false;
        int kbps = -1;
        try {
            ConnectivityManager cm = (ConnectivityManager) ctx.getSystemService(Context.CONNECTIVITY_SERVICE);
            Network n = cm == null ? null : cm.getActiveNetwork();
            NetworkCapabilities c = n == null ? null : cm.getNetworkCapabilities(n);
            if (c != null) {
                online = c.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                    && (Build.VERSION.SDK_INT < 23 || c.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED));
                kbps = c.getLinkDownstreamBandwidthKbps();
            }
        } catch (Exception e) { online = true; } // (sem saber: não diz que está offline à toa)
        r.put("online", online);
        r.put("kbps", kbps);
        r.put("lenta", online && kbps > 0 && kbps < LENTA_KBPS);
        return r;
    }

    // avisa a cada mudança (a rede caiu, voltou, trocou, ficou lenta)
    static ConnectivityManager.NetworkCallback ouvir(Context ctx, Ouvinte o) {
        ConnectivityManager cm = (ConnectivityManager) ctx.getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm == null) return null;
        ConnectivityManager.NetworkCallback cb = new ConnectivityManager.NetworkCallback() {
            @Override public void onAvailable(Network n) { o.mudou(estado(ctx)); }
            @Override public void onLost(Network n) {
                JSObject e = estado(ctx);
                // (logo depois de cair, o Android ainda pode dar a rede perdida como a ativa)
                try { if (n.equals(cm.getActiveNetwork()) || cm.getActiveNetwork() == null) { e.put("online", false); e.put("lenta", false); } } catch (Exception ignorado) { /* fica o estado lido */ }
                o.mudou(e);
            }
            @Override public void onCapabilitiesChanged(Network n, NetworkCapabilities c) { o.mudou(estado(ctx)); }
            @Override public void onUnavailable() { o.mudou(estado(ctx)); }
        };
        try { cm.registerDefaultNetworkCallback(cb); return cb; } catch (Exception e) { return null; }
    }

    static void parar(Context ctx, ConnectivityManager.NetworkCallback cb) {
        if (cb == null) return;
        try { ((ConnectivityManager) ctx.getSystemService(Context.CONNECTIVITY_SERVICE)).unregisterNetworkCallback(cb); } catch (Exception e) { /* já saiu */ }
    }
}
