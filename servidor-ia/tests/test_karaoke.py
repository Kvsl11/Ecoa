import os
import shutil
import subprocess
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import numpy as np  # noqa: E402
import pytest  # noqa: E402

import karaoke  # noqa: E402

tem_ffmpeg = pytest.mark.skipif(shutil.which("ffmpeg") is None, reason="sem o ffmpeg")


def test_os_pesos_dos_blocos_somam_1_em_toda_a_musica():
    # (nas emendas um bloco desce enquanto o outro sobe: nada fica mais alto nem mais baixo)
    for n in (10, 100, 101, 250, 1000):
        soma = np.zeros(n)
        for a, b, w in karaoke.pesos(n, list(range(0, n, 100)), 100, 7):
            soma[a:b] += w
        assert np.allclose(soma, 1), n


def test_banda_mais_voz_e_a_gravacao():
    rng = np.random.default_rng(1)
    x = rng.uniform(-0.8, 0.8, (2, 1000)).astype(np.float32)
    voz = (x * 0.4).astype(np.float32)
    q = karaoke.quatro_canais(x, voz)
    assert q.shape == (4, 1000)
    assert np.allclose(q[0] + q[2], x[0]) and np.allclose(q[1] + q[3], x[1])
    assert np.allclose(q[2:], voz)


@tem_ffmpeg
def test_fazer_grava_4_canais_na_ordem_banda_e_voz(tmp_path, monkeypatch):
    sr = karaoke.SR
    t = np.arange(sr * 3) / sr
    # a "gravação": à esquerda 300 Hz de banda e 1200 Hz de voz; à direita 600 Hz de banda e 2400 Hz de voz
    voz = np.stack([0.3 * np.sin(2 * np.pi * 1200 * t), 0.3 * np.sin(2 * np.pi * 2400 * t)]).astype(np.float32)
    banda = np.stack([0.3 * np.sin(2 * np.pi * 300 * t), 0.3 * np.sin(2 * np.pi * 600 * t)]).astype(np.float32)
    entrada = tmp_path / "musica.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(sr), "-ac", "2", "-i", "-", str(entrada)],
                   input=np.ascontiguousarray((voz + banda).T).astype("<f4").tobytes(), check=True)
    etapas = []
    # (o Demucs de mentira: acha a voz perfeita)
    monkeypatch.setattr(karaoke, "voz_demucs", lambda x, progresso: (progresso(1.0), voz[:, : x.shape[1]].copy())[1])
    monkeypatch.setattr(karaoke.transcricao, "separador", lambda: "htdemucs")
    monkeypatch.setattr(karaoke, "modelos", lambda: {"voz": "demucs", "plateia": None, "solista": None})
    saida = tmp_path / "k.m4a"
    info = karaoke.fazer(str(entrada), str(saida), lambda nome, p=None: etapas.append(nome))
    assert info["duracao"] == pytest.approx(3, abs=0.05)
    assert etapas[0] == "separando" and etapas[-1] == "gravando"
    sonda = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=channels,channel_layout,codec_name", "-of",
                            "csv=p=0", str(saida)], capture_output=True, text=True).stdout.strip()
    assert sonda == "aac,4,quad"
    bruto = subprocess.run(["ffmpeg", "-v", "error", "-i", str(saida), "-f", "f32le", "-"], capture_output=True).stdout
    c = np.frombuffer(bruto, dtype="<f4").reshape(-1, 4).T[:, sr // 2: sr * 2]
    pico = [int(np.argmax(np.abs(np.fft.rfft(canal)))) * sr / canal.shape[0] for canal in c]
    assert pico == pytest.approx([300, 600, 1200, 2400], abs=3)


def test_guardado_por_video(tmp_path, monkeypatch):
    monkeypatch.setattr(karaoke.transcricao, "CACHE", str(tmp_path))
    monkeypatch.setattr(karaoke.transcricao, "separador", lambda: "htdemucs")
    monkeypatch.setattr(karaoke, "GUARDAR", 2)
    feito = tmp_path / "feito.m4a"
    feito.write_bytes(b"abc")
    destino = tmp_path / "d.m4a"
    assert not karaoke.guardado("aaaaaaaaaaa", str(destino))
    for v in ("aaaaaaaaaaa", "bbbbbbbbbbb", "ccccccccccc"):
        karaoke.guardar(v, str(feito))
        os.utime(karaoke._arquivo(v), (0, {"aaaaaaaaaaa": 1, "bbbbbbbbbbb": 2, "ccccccccccc": 3}[v]))
    karaoke.guardar("ccccccccccc", str(feito))  # (o terceiro passa do limite: sai o mais antigo)
    assert not karaoke.guardado("aaaaaaaaaaa", str(destino))
    assert karaoke.guardado("bbbbbbbbbbb", str(destino)) and destino.read_bytes() == b"abc"


def test_rota_do_karaoke(monkeypatch, tmp_path):
    import app
    import youtube
    from fastapi.testclient import TestClient

    monkeypatch.setattr(karaoke.transcricao, "CACHE", str(tmp_path))
    monkeypatch.setattr(karaoke.transcricao, "separador", lambda: "htdemucs")
    monkeypatch.setattr(karaoke, "disponivel", lambda: True)
    baixados = []

    def baixar_midia(video, pasta, progresso=lambda p: None, com_video=False, qualidade="alta"):
        baixados.append((video, com_video, qualidade))
        progresso(1.0)
        caminho = os.path.join(pasta, "audio.webm")
        open(caminho, "wb").write(b"som")
        return {"caminho": caminho, "tipo": "audio/webm", "titulo": "t", "duracao": 10}

    def fazer(entrada, saida, etapa):
        etapa("separando", 0.5)
        open(saida, "wb").write(b"KARAOKE")
        return {"duracao": 10.0, "separador": "htdemucs"}

    monkeypatch.setattr(youtube, "baixar_midia", baixar_midia)
    monkeypatch.setattr(karaoke, "fazer", fazer)
    c = TestClient(app.app)
    r = c.post("/karaoke?etapas=1", json={"url": "https://youtu.be/abcdefghijk"})
    linhas = [l for l in r.text.strip().split("\n") if '"vivo"' not in l]
    assert '{"etapa": "separando", "progresso": 0.5}' in linhas
    import json
    res = json.loads(linhas[-1])["resultado"]
    assert res["tipo"] == "audio/mp4" and res["canais"][:3] == ["banda-esquerda", "banda-direita", "voz-esquerda"]
    assert res["video"] == "abcdefghijk" and res["tamanho"] == 7 and res["versao"] == karaoke.VERSAO
    assert baixados == [("abcdefghijk", False, "muito-alta")]
    arq = c.get(f"/baixar/{res['arquivo']}")
    assert arq.status_code == 200 and arq.content == b"KARAOKE"
    # a segunda vez (outro aparelho) vem do guardado: nem baixa nem separa
    monkeypatch.setattr(karaoke, "fazer", lambda *a, **k: (_ for _ in ()).throw(AssertionError("separou de novo")))
    res2 = c.post("/karaoke", json={"url": "abcdefghijk"}).json()
    assert c.get(f"/baixar/{res2['arquivo']}").content == b"KARAOKE" and len(baixados) == 1
    assert c.post("/karaoke", json={"url": "nada"}).status_code == 400
    monkeypatch.setattr(karaoke, "disponivel", lambda: False)
    assert c.post("/karaoke", json={"url": "abcdefghijk"}).status_code == 501


def test_karaoke_do_arquivo_enviado(monkeypatch, tmp_path):
    import app
    from fastapi.testclient import TestClient

    monkeypatch.setattr(karaoke, "disponivel", lambda: True)
    recebido = []

    def fazer(entrada, saida, etapa):
        recebido.append(open(entrada, "rb").read())
        open(saida, "wb").write(b"K4")
        return {"duracao": 1.0, "separador": "htdemucs"}

    monkeypatch.setattr(karaoke, "fazer", fazer)
    c = TestClient(app.app)
    res = c.post("/karaoke/arquivo", files={"arquivo": ("ensaio.mp3", b"MP3", "audio/mpeg")}).json()
    assert recebido == [b"MP3"] and res["video"] is None and c.get(f"/baixar/{res['arquivo']}").content == b"K4"


# ------------------------------------------------------------------ só o cantor principal sai

def _tom(hz, n, amp=0.2, lado=0.0):
    t = np.arange(n) / karaoke.SR
    s = amp * np.sin(2 * np.pi * hz * t)
    return np.stack([s * (1 - lado), s * (1 + lado)]).astype(np.float32)


def test_so_o_cantor_principal_sai_e_o_back_vocal_e_a_plateia_ficam_na_banda(monkeypatch):
    n = karaoke.SR
    instrumentos, cantor, back, plateia = _tom(110, n), _tom(440, n), _tom(660, n, 0.1), _tom(3000, n, 0.08)
    x = instrumentos + cantor + back + plateia
    chamados = []

    # (os modelos de mentira, perfeitos: a voz inteira tem o cantor, o back vocal e o povo cantando junto)
    def separar_com(modelo, entrada):
        chamados.append(modelo)
        if modelo == "voz":
            return {"vocals": cantor + back + plateia, "instrumental": instrumentos}
        if modelo == "plateia":
            return {"crowd": plateia, "other": entrada - plateia}
        assert np.allclose(entrada, cantor + back, atol=1e-5), "o modelo karaokê ouviu a plateia"
        return {"vocals": cantor, "instrumental": back}

    monkeypatch.setattr(karaoke, "separar_com", separar_com)
    monkeypatch.setattr(karaoke, "modelos", lambda: {"voz": "voz", "plateia": "plateia", "solista": "solista"})
    passos = []
    voz, info = karaoke.voz_principal(x, passos.append)
    assert chamados == ["voz", "plateia", "solista"]
    assert np.allclose(voz, cantor, atol=1e-5)
    q = karaoke.quatro_canais(x, voz)
    assert np.allclose(q[:2], instrumentos + back + plateia, atol=1e-5)  # a banda: tudo menos o cantor
    assert info["solista"] is True and info["plateia"] > karaoke.PLATEIA_MINIMA
    assert passos[-1] == 1.0 and passos == sorted(passos)


def test_sem_o_modelo_do_cantor_sai_a_voz_inteira_como_antes(monkeypatch):
    n = karaoke.SR // 2
    vozes = _tom(440, n)

    def separar_com(modelo, entrada):
        if modelo == "solista":
            raise RuntimeError("não baixou")
        return {"vocals": vozes, "instrumental": entrada - vozes}

    monkeypatch.setattr(karaoke, "separar_com", separar_com)
    monkeypatch.setattr(karaoke, "modelos", lambda: {"voz": "voz", "plateia": None, "solista": "solista"})
    voz, info = karaoke.voz_principal(vozes + _tom(110, n))
    assert np.allclose(voz, vozes) and info["solista"] is False


def test_a_voz_cai_no_demucs_se_o_roformer_falhar(monkeypatch):
    n = karaoke.SR // 2
    vozes = _tom(440, n)
    monkeypatch.setattr(karaoke, "separar_com", lambda modelo, entrada: (_ for _ in ()).throw(RuntimeError("sem placa")))
    monkeypatch.setattr(karaoke, "voz_demucs", lambda x, progresso: vozes)
    monkeypatch.setattr(karaoke, "modelos", lambda: {"voz": "roformer", "plateia": None, "solista": None})
    voz, info = karaoke.voz_principal(vozes + _tom(110, n))
    assert np.allclose(voz, vozes) and info["modelos"]["voz"] == "demucs"


def test_a_plateia_so_sai_quando_e_parte_de_verdade_da_voz():
    n = karaoke.SR // 2
    voz = _tom(440, n, 0.3)
    quase_nada = _tom(3000, n, 0.01)  # (o eco e a respiração que o modelo acha numa gravação de estúdio)
    igual, parte = karaoke.tirar_plateia(voz + quase_nada, quase_nada)
    assert parte < karaoke.PLATEIA_MINIMA and np.allclose(igual, voz + quase_nada)
    plateia = _tom(3000, n, 0.15)
    limpa, parte = karaoke.tirar_plateia(voz + plateia, plateia)
    assert parte > karaoke.PLATEIA_MINIMA and np.allclose(limpa, voz, atol=1e-5)


def test_os_modelos_na_placa_de_video_e_no_processador(monkeypatch):
    for v in ("IA_KARAOKE_VOZ", "IA_KARAOKE_PLATEIA", "IA_KARAOKE_SOLISTA"):
        monkeypatch.delenv(v, raising=False)
    monkeypatch.setattr(karaoke.transcricao, "_tem_audio_separator", lambda: True)
    monkeypatch.setattr(karaoke.transcricao, "separador", lambda: "htdemucs")
    monkeypatch.setattr(karaoke, "com_placa", lambda: True)
    assert karaoke.modelos() == {"voz": karaoke.VOZ_GPU, "plateia": karaoke.PLATEIA_GPU, "solista": karaoke.SOLISTA_GPU}
    monkeypatch.setattr(karaoke, "com_placa", lambda: False)
    assert karaoke.modelos() == {"voz": "demucs", "plateia": karaoke.PLATEIA_CPU, "solista": karaoke.SOLISTA_CPU}
    monkeypatch.setenv("IA_KARAOKE_SOLISTA", "0")
    monkeypatch.setenv("IA_KARAOKE_VOZ", "outro.ckpt")
    assert karaoke.modelos() == {"voz": "outro.ckpt", "plateia": karaoke.PLATEIA_CPU, "solista": None}
    # sem o audio-separator: o Demucs, a voz inteira (o karaokê de antes)
    monkeypatch.setattr(karaoke.transcricao, "_tem_audio_separator", lambda: False)
    assert karaoke.modelos() == {"voz": "demucs", "plateia": None, "solista": None}


class _Cfg:
    def __init__(self, **k):
        self.__dict__.update({a: (_Cfg(**v) if isinstance(v, dict) else v) for a, v in k.items()})


def _separador_de_mentira(monkeypatch, instancia):
    import sys
    import types

    criados = []

    class Separator:
        def __init__(self, **opcoes):
            self.opcoes = opcoes
            criados.append(self)

        def load_model(self, nome):
            self.model_instance = instancia

    pacote = types.ModuleType("audio_separator")
    modulo = types.ModuleType("audio_separator.separator")
    modulo.Separator = Separator
    monkeypatch.setitem(sys.modules, "audio_separator", pacote)
    monkeypatch.setitem(sys.modules, "audio_separator.separator", modulo)
    monkeypatch.setattr(karaoke, "_separadores", {})
    return criados


def test_separar_com_mdx_a_outra_faixa_e_a_gravacao_menos_a_dada(monkeypatch):
    # (o UVR Karaoke 2 devolve só o "instrumental", com o back vocal: o cantor é o resto)
    n = 1000
    rng = np.random.default_rng(3)
    x = rng.uniform(-1.5, 1.5, (2, n)).astype(np.float32)  # (passa de 1: nada é normalizado nem cortado)

    class Mdx:
        primary_stem_name = "Instrumental"
        secondary_stem_name = "Vocals"

        def demix(self, mix):
            return (mix * 0.25).T  # (às vezes vem deitado: (amostras, 2))

    criados = _separador_de_mentira(monkeypatch, Mdx())
    f = karaoke.separar_com("UVR_MDXNET_KARA_2.onnx", x)
    assert set(f) == {"instrumental", "vocals"}
    assert np.allclose(f["instrumental"], x * 0.25) and np.allclose(f["vocals"], x * 0.75)
    assert criados[0].opcoes["normalization_threshold"] >= 1e6  # (o volume das faixas não muda)
    karaoke.separar_com("UVR_MDXNET_KARA_2.onnx", x)
    assert len(criados) == 1  # (o modelo fica aberto)


def test_separar_com_roformer_anda_meio_pedaco_por_vez(monkeypatch):
    n = 500

    class Roformer:
        is_roformer = True
        overlap = 8
        primary_stem_name = "crowd"
        secondary_stem_name = "other"
        model_data_cfgdict = _Cfg(audio={"hop_length": 441, "sample_rate": 44100}, inference={"dim_t": 801},
                                  training={"target_instrument": "crowd"})

        def demix(self, mix):
            return mix[:, : n - 10] * 0.5  # (um pouco mais curto: completa com silêncio)

    r = Roformer()
    _separador_de_mentira(monkeypatch, r)
    x = np.ones((2, n), dtype=np.float32)
    f = karaoke.separar_com("crowd.ckpt", x)
    assert r.overlap == pytest.approx(4.0)  # (o pedaço de 8 s, andando 4 s por vez)
    assert f["crowd"].shape == (2, n) and np.allclose(f["crowd"][:, : n - 10], 0.5) and np.allclose(f["crowd"][:, n - 10:], 0)
    assert np.allclose(f["other"], x - f["crowd"])
