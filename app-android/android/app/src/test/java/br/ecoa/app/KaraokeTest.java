package br.ecoa.app;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

// A STFT do karaokê: o espectro que entra no modelo, devolvido sem mudar, volta a ser o mesmo som (no meio do pedaço,
// que é o que o karaokê usa). E os tamanhos dos pedaços batem com os do UVR
public class KaraokeTest {
    @Test public void tamanhos() {
        assertEquals(261120, Karaoke.CHUNK);
        assertEquals(257024, Karaoke.GEN);
    }

    @Test public void idaEVolta() {
        float[] x = new float[Karaoke.CHUNK];
        for (int i = 0; i < x.length; i++) {
            x[i] = (float) (0.4 * Math.sin(2 * Math.PI * 220 * i / 44100.0) + 0.2 * Math.sin(2 * Math.PI * 3150 * i / 44100.0 + 1)
                + 0.1 * Math.sin(2 * Math.PI * 9000 * i / 44100.0));
        }
        float[] espectro = new float[4 * Karaoke.DF * Karaoke.DT];
        Karaoke.stft(x, espectro, 0);
        Karaoke.stft(x, espectro, 2);
        float[] y = Karaoke.istft(espectro, 0);
        float[] z = Karaoke.istft(espectro, 2);
        double erro = 0, energia = 0;
        for (int i = Karaoke.TRIM; i < Karaoke.CHUNK - Karaoke.TRIM; i++) {
            erro += (x[i] - y[i]) * (x[i] - y[i]);
            energia += x[i] * x[i];
            assertEquals(y[i], z[i], 0f);
        }
        double sdr = 10 * Math.log10(energia / erro);
        assertTrue("SDR da ida e volta: " + sdr, sdr > 60);
    }

    @Test public void fftConfereComADft() {
        double[] re = new double[Karaoke.NFFT], im = new double[Karaoke.NFFT];
        for (int i = 0; i < re.length; i++) re[i] = Math.cos(2 * Math.PI * 5 * i / Karaoke.NFFT);
        Karaoke.fft(re, im, false);
        assertEquals(Karaoke.NFFT / 2.0, re[5], 1e-6);
        assertEquals(Karaoke.NFFT / 2.0, re[Karaoke.NFFT - 5], 1e-6);
        assertEquals(0, re[6], 1e-6);
    }
}
