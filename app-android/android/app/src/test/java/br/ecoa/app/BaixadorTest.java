package br.ecoa.app;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertFalse;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

import java.io.File;
import java.io.FileOutputStream;

// O baixador do APK escolhe os mesmos formatos do servidor (servidor-ia/youtube.py) e nunca entrega um pedaço
public class BaixadorTest {
    @Rule public TemporaryFolder pasta = new TemporaryFolder();

    private File arquivo(String nome, int tamanho) throws Exception {
        File f = pasta.newFile(nome);
        try (FileOutputStream o = new FileOutputStream(f)) { o.write(new byte[tamanho]); }
        return f;
    }

    @Test public void qualidades() {
        assertEquals("alta", Baixador.qualidade(null));
        assertEquals("alta", Baixador.qualidade("qualquer"));
        assertEquals("normal", Baixador.qualidade("normal"));
        assertEquals(480, Baixador.alturaDoVideo("normal"));
        assertEquals(720, Baixador.alturaDoVideo("alta"));
        assertEquals(1080, Baixador.alturaDoVideo("muito-alta"));
    }

    @Test public void formatosIguaisAosDoServidor() {
        assertEquals("bestaudio[ext=m4a][abr>64]/bestaudio[ext=m4a]/bestaudio[acodec^=mp4a]/bestaudio/best", Baixador.formatoAudio("alta"));
        assertEquals("bestvideo[height<=720][vcodec^=avc1]+bestaudio[ext=m4a]/bestvideo[height<=720][vcodec^=avc1]+bestaudio[ext=m4a]"
            + "/bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4][height<=720][vcodec!=none][acodec!=none]/18/best[ext=mp4]/best",
            Baixador.formatoVideo("alta"));
        assertTrue(Baixador.formatoVideo("normal").startsWith("bestvideo[height<=480][vcodec^=avc1]+bestaudio[ext=m4a][abr<=64]/"));
    }

    @Test public void tipos() {
        assertEquals("video/mp4", Baixador.tipoDoArquivo("audio.mp4", true));
        assertEquals("audio/mp4", Baixador.tipoDoArquivo("audio.m4a", false));
        assertEquals("audio/webm", Baixador.tipoDoArquivo("audio.webm", false));
        assertEquals("video/webm", Baixador.tipoDoArquivo("audio.webm", true));
    }

    @Test public void arquivoFinalNuncaEUmPedaco() throws Exception {
        arquivo("audio.f137.mp4", 900);
        arquivo("audio.f140.m4a", 800);
        arquivo("audio.mp4.part", 950);
        File junto = arquivo("audio.mp4", 500);
        assertEquals(junto, Baixador.arquivoFinal(pasta.getRoot(), true));
        // (pedido só o som, o mp4 do clipe não vale)
        assertNull(Baixador.arquivoFinal(pasta.getRoot(), false));
        File som = arquivo("audio.m4a", 300);
        assertEquals(som, Baixador.arquivoFinal(pasta.getRoot(), false));
    }

    @Test public void informacoesDoVideo() {
        Baixador.Resultado r = new Baixador.Resultado();
        Baixador.lerInformacoes("[download] 100%\nECOA|720|215.0|Música | com barra\n", r);
        assertEquals(Integer.valueOf(720), r.altura);
        assertEquals(215.0, r.duracao, 0.001);
        assertEquals("Música | com barra", r.titulo);
        Baixador.Resultado s = new Baixador.Resultado();
        Baixador.lerInformacoes("ECOA|NA|NA|Só som", s);
        assertNull(s.altura);
        assertNull(s.duracao);
    }

    @Test public void errosEmPortugues() {
        assertTrue(Baixador.pedeLogin("ERROR: [youtube] abc: Sign in to confirm you're not a bot"));
        assertFalse(Baixador.pedeLogin("HTTP Error 403: Forbidden"));
        assertEquals("o YouTube pediu login para baixar este vídeo", Baixador.explicar(new Exception("Sign in to confirm you’re not a bot")));
        assertEquals("não consegui baixar este vídeo (HTTP Error 403: Forbidden)",
            Baixador.explicar(new Exception("WARNING: x\nERROR: [youtube] dQw4w9WgXcQ: HTTP Error 403: Forbidden")));
        assertEquals("vídeo longo demais (mais de 30 min)", Baixador.explicar(new Exception("vídeo longo demais (mais de 30 min)")));
    }
}
