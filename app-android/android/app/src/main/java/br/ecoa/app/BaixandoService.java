package br.ecoa.app;

import android.app.Notification;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;

import androidx.core.app.ServiceCompat;
import androidx.core.content.ContextCompat;

// Enquanto há música baixando (ou esperando na fila), a notificação do download fica presa: a pessoa não apaga sem
// querer (no Android 14 em diante, só a notificação de um serviço em primeiro plano não sai ao arrastar). E o Android
// não para o download com o app minimizado. Quando a fila acaba, o serviço sai e a última notificação (concluído, o
// erro ou o resumo) fica como uma comum, que dá para apagar
public class BaixandoService extends Service {
    private static volatile BaixandoService ativo;
    private static volatile Notification pendente;
    private static volatile int idPendente;

    // começa (ou atualiza) o serviço com esta notificação. false: o Android não deixou (o app em segundo plano, num
    // Android novo): aí quem chama mostra a notificação comum, presa como der
    static boolean mostrar(Context ctx, int id, Notification n) {
        idPendente = id;
        pendente = n;
        BaixandoService s = ativo;
        if (s != null) { s.colocar(); return true; }
        try {
            ContextCompat.startForegroundService(ctx, new Intent(ctx, BaixandoService.class));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // a fila acabou: o serviço sai e a notificação dele fica (soltar) ou some
    static void parar(boolean manterNotificacao) {
        BaixandoService s = ativo;
        if (s == null) return;
        ServiceCompat.stopForeground(s, manterNotificacao ? ServiceCompat.STOP_FOREGROUND_DETACH : ServiceCompat.STOP_FOREGROUND_REMOVE);
        s.stopSelf();
        ativo = null;
    }

    static boolean rodando() { return ativo != null; }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        ativo = this;
        colocar();
        return START_NOT_STICKY;
    }

    private void colocar() {
        Notification n = pendente;
        if (n == null) return;
        int tipo = Build.VERSION.SDK_INT >= 29 ? ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC : 0;
        try {
            ServiceCompat.startForeground(this, idPendente, n, tipo);
        } catch (Exception e) {
            stopSelf();
            ativo = null;
        }
    }

    @Override
    public void onDestroy() {
        if (ativo == this) ativo = null;
        super.onDestroy();
    }

    // (o sistema pede para parar o serviço de sincronização depois de muito tempo: para, e a notificação fica)
    @Override
    public void onTimeout(int startId) {
        parar(true);
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }
}
