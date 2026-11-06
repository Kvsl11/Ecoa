package br.ecoa.app;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

// A STFT do karaokê: o espectro que entra no modelo, devolvido sem mudar, volta a ser o mesmo som (no meio do pedaço,
// que é o que o karaokê usa). E os tamanhos dos pedaços batem com os do UVR
public class KaraokeTest {
    @Test public void tamanhos() {
        assertEquals(261120, Karaoke.CHUNK);
        assertEquals(256000, Karaoke.GEN);
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

    @Test public void fftDeCincoVezesDoisConfereComADft() {
        int n = 5120;
        double[] re = new double[n], im = new double[n];
        java.util.Random rnd = new java.util.Random(1);
        double[] x = new double[n];
        for (int i = 0; i < n; i++) { x[i] = rnd.nextGaussian(); re[i] = x[i]; }
        Karaoke.fft(re, im, false);
        for (int k : new int[] { 0, 1, 7, 1023, 1024, 2560, 5119 }) {
            double ar = 0, ai = 0;
            for (int i = 0; i < n; i++) { ar += x[i] * Math.cos(-2 * Math.PI * k * i / n); ai += x[i] * Math.sin(-2 * Math.PI * k * i / n); }
            assertEquals(ar, re[k], 1e-6);
            assertEquals(ai, im[k], 1e-6);
        }
        // (a inversa traz de volta, dividindo por n)
        Karaoke.fft(re, im, true);
        for (int i = 0; i < n; i += 97) assertEquals(x[i], re[i] / n, 1e-9);
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
