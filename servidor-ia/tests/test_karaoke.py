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
