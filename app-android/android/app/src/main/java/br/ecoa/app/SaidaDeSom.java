package br.ecoa.app;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioDeviceInfo;
import android.media.AudioManager;
import android.os.Build;
import android.provider.Settings;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;

import java.util.List;

// Por onde o som está saindo, pelo próprio Android (o navegador só diz "Bluetooth headset", e só com o microfone
// liberado): o fone ou a caixa com o nome dele ("JBL Tour Pro 3"), o tipo (bluetooth, com fio, USB…), as outras saídas
// conectadas e o nome deste celular ("Galaxy S23 do Kaio")
final class SaidaDeSom {
    private SaidaDeSom() {}

    // { fone, tipo, saidas: [{ nome, tipo }], aparelho, modelo, fabricante }
    static JSObject ler(Context ctx) {
        JSObject r = new JSObject();
        JSArray saidas = new JSArray();
        String fone = "", tipoFone = "";
        int prioridade = -1;
        AudioManager am = (AudioManager) ctx.getSystemService(Context.AUDIO_SERVICE);
        // (no Android 13 em diante, o próprio Android diz por onde a música sai agora)
        AudioDeviceInfo rota = null;
        if (am != null && Build.VERSION.SDK_INT >= 33) {
            try {
                AudioAttributes musica = new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build();
                List<android.media.AudioDeviceAttributes> ds = am.getAudioDevicesForAttributes(musica);
                if (ds != null && !ds.isEmpty()) {
                    android.media.AudioDeviceAttributes a = ds.get(0);
                    for (AudioDeviceInfo d : am.getDevices(AudioManager.GET_DEVICES_OUTPUTS)) {
                        if (d.getType() == a.getType() && (a.getAddress().isEmpty() || a.getAddress().equals(d.getAddress()))) { rota = d; break; }
                    }
                }
            } catch (Exception e) { rota = null; }
        }
        java.util.HashSet<String> vistos = new java.util.HashSet<>();
        if (am != null) for (AudioDeviceInfo d : am.getDevices(AudioManager.GET_DEVICES_OUTPUTS)) {
            String tipo = tipo(d.getType());
            if (tipo == null) continue; // (o alto-falante e o fone de ligação do próprio celular, e os internos)
            String nome = nome(d, tipo);
            // (o mesmo fone Bluetooth aparece duas vezes: o da música e o das ligações)
            if (!vistos.add(nome + "|" + tipo)) continue;
            JSObject s = new JSObject();
            s.put("nome", nome);
            s.put("tipo", tipo);
            saidas.put(s);
            int p = rota != null ? (rota.getId() == d.getId() || (rota.getType() == d.getType() && nome.equals(nome(rota, tipo))) ? 100 : 0) : prioridade(d.getType());
            if (p > prioridade) { prioridade = p; fone = nome; tipoFone = tipo; }
        }
        // (com a música saindo pelo alto-falante do celular, mesmo com um fone conectado, não há fone tocando)
        if (rota != null && tipo(rota.getType()) == null) { fone = ""; tipoFone = ""; }
        r.put("fone", fone);
        r.put("tipo", tipoFone);
        r.put("saidas", saidas);
        r.put("aparelho", nomeDoAparelho(ctx));
        r.put("modelo", Build.MODEL);
        r.put("fabricante", Build.MANUFACTURER);
        return r;
    }

    // o tipo da saída; null para as do próprio celular
    private static String tipo(int t) {
        switch (t) {
            case AudioDeviceInfo.TYPE_BLUETOOTH_A2DP:
            case AudioDeviceInfo.TYPE_BLUETOOTH_SCO:
            case 26: // TYPE_BLE_HEADSET
            case 27: // TYPE_BLE_SPEAKER
            case 30: // TYPE_BLE_BROADCAST
                return "bluetooth";
            case 23: // TYPE_HEARING_AID
                return "aparelho-auditivo";
            case AudioDeviceInfo.TYPE_WIRED_HEADSET:
            case AudioDeviceInfo.TYPE_WIRED_HEADPHONES:
                return "fio";
            case AudioDeviceInfo.TYPE_USB_HEADSET:
            case AudioDeviceInfo.TYPE_USB_DEVICE:
            case AudioDeviceInfo.TYPE_USB_ACCESSORY:
                return "usb";
            case AudioDeviceInfo.TYPE_HDMI:
            case AudioDeviceInfo.TYPE_HDMI_ARC:
            case 29: // TYPE_HDMI_EARC
                return "hdmi";
            case AudioDeviceInfo.TYPE_LINE_ANALOG:
            case AudioDeviceInfo.TYPE_LINE_DIGITAL:
            case AudioDeviceInfo.TYPE_AUX_LINE:
                return "linha";
            case AudioDeviceInfo.TYPE_DOCK:
            case 31: // TYPE_DOCK_ANALOG
                return "dock";
            default:
                return null;
        }
    }

    // sem saber a rota (antes do Android 13): o Android toca no último conectado, e os fones vêm antes das caixas
    private static int prioridade(int t) {
        switch (t) {
            case AudioDeviceInfo.TYPE_BLUETOOTH_A2DP: case 26: case 27: case 23: return 50;
            case AudioDeviceInfo.TYPE_USB_HEADSET: case AudioDeviceInfo.TYPE_USB_DEVICE: return 40;
            case AudioDeviceInfo.TYPE_WIRED_HEADSET: case AudioDeviceInfo.TYPE_WIRED_HEADPHONES: return 35;
            case AudioDeviceInfo.TYPE_HDMI: case AudioDeviceInfo.TYPE_HDMI_ARC: case 29: return 20;
            case AudioDeviceInfo.TYPE_BLUETOOTH_SCO: return 10; // (só o das ligações: a música não sai por ele)
            default: return 5;
        }
    }

    // o nome do fone: o Bluetooth diz o nome dele (o mesmo das configurações); o com fio não tem nome (o Android dá o do
    // próprio celular), então fica "Fone com fio"
    private static String nome(AudioDeviceInfo d, String tipo) {
        CharSequence cs = d.getProductName();
        String n = cs == null ? "" : cs.toString().trim();
        boolean semNome = n.isEmpty() || n.equalsIgnoreCase(Build.MODEL) || n.equalsIgnoreCase(Build.DEVICE) || n.equalsIgnoreCase(Build.PRODUCT);
        if (!semNome) return n;
        switch (tipo) {
            case "bluetooth": return "Fone Bluetooth";
            case "fio": return d.getType() == AudioDeviceInfo.TYPE_WIRED_HEADSET ? "Fone com fio" : "Fone de ouvido com fio";
            case "usb": return "Fone USB";
            case "hdmi": return "TV (HDMI)";
            case "aparelho-auditivo": return "Aparelho auditivo";
            case "dock": return "Base de som";
            default: return "Saída de som";
        }
    }

    // o nome deste celular: o que a pessoa vê em Configurações → Sobre ("Galaxy S23 do Kaio"), ou o modelo
    static String nomeDoAparelho(Context ctx) {
        String n = null;
        try { if (Build.VERSION.SDK_INT >= 25) n = Settings.Global.getString(ctx.getContentResolver(), Settings.Global.DEVICE_NAME); } catch (Exception e) { n = null; }
        if (n == null || n.trim().isEmpty()) {
            try { n = Settings.Secure.getString(ctx.getContentResolver(), "bluetooth_name"); } catch (Exception e) { n = null; }
        }
        if (n != null && !n.trim().isEmpty()) return n.trim();
        String fab = Build.MANUFACTURER == null ? "" : Build.MANUFACTURER;
        String mod = Build.MODEL == null ? "" : Build.MODEL;
        if (!fab.isEmpty() && !mod.toLowerCase().startsWith(fab.toLowerCase())) mod = Character.toUpperCase(fab.charAt(0)) + fab.substring(1) + " " + mod;
        return mod.trim();
    }
}
