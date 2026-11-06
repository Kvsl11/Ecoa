package br.ecoa.app;

import android.Manifest;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.CancellationSignal;
import android.os.Environment;
import android.os.StatFs;

import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.CustomCredential;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.ClearCredentialStateRequest;
import androidx.credentials.exceptions.ClearCredentialException;
import androidx.credentials.exceptions.GetCredentialCancellationException;
import androidx.credentials.exceptions.GetCredentialException;
import androidx.credentials.exceptions.NoCredentialException;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;

import java.io.File;
import java.util.concurrent.Executors;

// O que o site faz no Android pelo "window.Capacitor.Plugins.Ecoa":
//  - musica({ titulo, artista, capa, tocando }): a música do player, para o widget e o aviso de "tocando"
//  - entrarComGoogle(): o login do Google pelo próprio Android (o do site não abre dentro de um app) → { idToken }
//  - armazenamento(): o espaço do celular → { total, livre, app } em bytes (app: tudo o que o Ecoa guarda, downloads inclusos)
//  - avisar({ titulo, texto, tag, href, silenciosa, imagem }): uma notificação do Android (os downloads)
//  - sairDoGoogle(): esquece a conta escolhida (na próxima entrada, o Android pergunta de novo)
//  - evento "acao" ({ acao: 'anterior' | 'alternar' | 'proxima' }): um botão do widget ou do aviso foi tocado
@CapacitorPlugin(name = "Ecoa", permissions = { @Permission(alias = "avisos", strings = { Manifest.permission.POST_NOTIFICATIONS }) })
public class EcoaPlugin extends Plugin {
    // o id do cliente web do login Google do projeto do Firebase (é público: vai no endereço de login do site)
    static final String CLIENTE_GOOGLE = "286830451197-skc9t7g9hqui9laem4tsaouir33kab6m.apps.googleusercontent.com";
    static final String PREFS = "ecoa_widget";

    private static EcoaPlugin ativo;
    private static String pendente; // a ação que chegou antes de o site ficar pronto

    @Override
    public void load() {
        ativo = this;
    }

    @Override
    protected void handleOnDestroy() {
        if (ativo == this) ativo = null;
    }

    // entrega a ação ao site; false se o app não está aberto (aí ele é aberto com a ação)
    static boolean entregar(String acao) {
        EcoaPlugin p = ativo;
        if (p == null || p.getBridge() == null) { pendente = acao; return false; }
        JSObject dados = new JSObject();
        dados.put("acao", acao);
        // (guardada até o site ouvir: com o app abrindo, o ouvinte ainda não existe)
        p.notifyListeners("acao", dados, true);
        return true;
    }

    // uma notificação do site (os downloads): { titulo, texto, tag, href, silenciosa, imagem }
    @PluginMethod
    public void avisar(PluginCall call) {
        Avisos.mostrar(getContext(), call.getString("titulo", "Ecoa"), call.getString("texto", ""), call.getString("tag", ""),
            call.getString("href", ""), Boolean.TRUE.equals(call.getBoolean("silenciosa", false)), call.getString("imagem", ""));
        call.resolve();
    }

    @PluginMethod
    public void armazenamento(PluginCall call) {
        Executors.newSingleThreadExecutor().execute(() -> {
            try {
                StatFs fs = new StatFs(Environment.getDataDirectory().getPath());
                JSObject r = new JSObject();
                r.put("total", fs.getTotalBytes());
                r.put("livre", fs.getAvailableBytes());
                // a pasta do app inteira: o WebView (os downloads no IndexedDB, o cache), os arquivos e as preferências
                Context ctx = getContext();
                long app = tamanho(ctx.getDataDir());
                File ext = ctx.getExternalCacheDir();
                if (ext != null) app += tamanho(ext.getParentFile());
                r.put("app", app);
                call.resolve(r);
            } catch (Exception e) {
                call.reject(e.getMessage());
            }
        });
    }

    private static long tamanho(File f) {
        if (f == null || !f.exists()) return 0;
        if (f.isFile()) return f.length();
        long t = 0;
        File[] filhos = f.listFiles();
        if (filhos != null) for (File c : filhos) {
            try {
                if (!c.getCanonicalPath().startsWith(f.getCanonicalPath())) continue; // não segue os atalhos para fora
            } catch (Exception e) { continue; }
            t += tamanho(c);
        }
        return t;
    }

    @PluginMethod
    public void pronto(PluginCall call) {
        String p = pendente;
        pendente = null;
        if (p != null) entregar(p);
        call.resolve();
    }

    @PluginMethod
    public void musica(PluginCall call) {
        Context ctx = getContext();
        String titulo = call.getString("titulo", "");
        String artista = call.getString("artista", "");
        String capa = call.getString("capa", "");
        boolean tocando = Boolean.TRUE.equals(call.getBoolean("tocando", false));
        Double duracao = call.getDouble("duracao", 0.0);
        Double tempo = call.getDouble("tempo", 0.0);
        SharedPreferences.Editor e = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit();
        e.putString("titulo", titulo).putString("artista", artista).putBoolean("tocando", tocando)
            .putFloat("duracao", duracao == null ? 0f : duracao.floatValue()).putFloat("tempo", tempo == null ? 0f : tempo.floatValue())
            .putLong("quando", android.os.SystemClock.elapsedRealtime());
        boolean capaNova = !capa.equals(ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("capa", ""));
        e.putString("capa", capa).apply();
        if (capaNova) Capas.baixar(ctx, capa, () -> { EcoaWidget.atualizarTodos(ctx); Sessao.atualizar(ctx); TocandoService.atualizar(ctx); });
        EcoaWidget.atualizarTodos(ctx);
        Sessao.atualizar(ctx);
        // (o aviso de "tocando" mantém o app vivo em segundo plano enquanto toca)
        if (tocando) {
            if (Build.VERSION.SDK_INT >= 33 && getPermissionState("avisos") == PermissionState.PROMPT) {
                requestPermissionForAlias("avisos", call, "depoisDaPermissao");
                return;
            }
            TocandoService.ligar(ctx);
        } else TocandoService.atualizar(ctx);
        call.resolve();
    }

    @PermissionCallback
    private void depoisDaPermissao(PluginCall call) {
        TocandoService.ligar(getContext());
        call.resolve();
    }

    @PluginMethod
    public void parou(PluginCall call) {
        TocandoService.desligar(getContext());
        call.resolve();
    }

    @PluginMethod
    public void entrarComGoogle(PluginCall call) {
        Context ctx = getActivity();
        CredentialManager cm = CredentialManager.create(ctx);
        GetSignInWithGoogleOption opcao = new GetSignInWithGoogleOption.Builder(CLIENTE_GOOGLE).build();
        GetCredentialRequest pedido = new GetCredentialRequest.Builder().addCredentialOption(opcao).build();
        cm.getCredentialAsync(ctx, pedido, new CancellationSignal(), Executors.newSingleThreadExecutor(),
            new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                @Override
                public void onResult(GetCredentialResponse r) {
                    Credential c = r.getCredential();
                    if (c instanceof CustomCredential && GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(c.getType())) {
                        GoogleIdTokenCredential g = GoogleIdTokenCredential.createFrom(((CustomCredential) c).getData());
                        JSObject res = new JSObject();
                        res.put("idToken", g.getIdToken());
                        res.put("email", g.getId());
                        res.put("nome", g.getDisplayName());
                        call.resolve(res);
                    } else call.reject("O Google não devolveu a conta.", "sem-conta");
                }

                @Override
                public void onError(GetCredentialException e) {
                    if (e instanceof GetCredentialCancellationException) call.reject("Cancelado.", "cancelado");
                    else if (e instanceof NoCredentialException) call.reject("Nenhuma conta Google neste aparelho.", "sem-conta");
                    else call.reject(String.valueOf(e.getMessage()), "erro");
                }
            });
    }

    @PluginMethod
    public void sairDoGoogle(PluginCall call) {
        CredentialManager cm = CredentialManager.create(getContext());
        cm.clearCredentialStateAsync(new ClearCredentialStateRequest(), new CancellationSignal(), Executors.newSingleThreadExecutor(),
            new CredentialManagerCallback<Void, ClearCredentialException>() {
                @Override public void onResult(Void v) { call.resolve(); }
                @Override public void onError(ClearCredentialException e) { call.resolve(); }
            });
    }
}
