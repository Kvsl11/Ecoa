import os
import sys

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import transcricao  # noqa: E402
from transcricao import Nota  # noqa: E402

SR = transcricao.SR


def test_andamento_pelas_batidas_e_os_primeiros_tempos():
    batidas = [0.5 + i * 0.6 for i in range(20)]  # 100 bpm
    primeiros = [batidas[i] + 0.01 for i in range(1, 20, 4)] + [3.33]  # o 3,33 não cai em batida nenhuma
    bpm, b, p = transcricao.andamento_pelas_batidas(batidas, primeiros)
    assert bpm == 100.0 and len(b) == 20 and len(p) == 5
    # batidas de menos: não dá
    assert transcricao.andamento_pelas_batidas(batidas[:5]) is None


def test_beat_this_falhando_vai_o_librosa(monkeypatch):
    monkeypatch.setattr(transcricao, "tem_beat_this", lambda: True)

    def quebra():
        raise RuntimeError("sem memória")

    monkeypatch.setattr(transcricao, "modelo_beat_this", quebra)
    assert transcricao.batidas_beat_this(np.zeros(SR, dtype=np.float32)) is None


def test_separador_padrao_e_o_demucs_e_o_roformer_so_pedido(monkeypatch):
    monkeypatch.delenv("IA_SEPARADOR", raising=False)
    assert transcricao.separador() == "htdemucs"
    monkeypatch.setenv("IA_SEPARADOR", "roformer")
    monkeypatch.setattr(transcricao, "_tem_audio_separator", lambda: True)
    assert transcricao.separador() == transcricao.ROFORMER
    # sem o pacote, o pedido não vale
    monkeypatch.setattr(transcricao, "_tem_audio_separator", lambda: False)
    assert transcricao.separador() == "htdemucs"


def test_solista_desligado_ou_sem_pacote(monkeypatch):
    monkeypatch.setattr(transcricao, "_tem_audio_separator", lambda: True)
    monkeypatch.setenv("IA_SOLISTA", "0")
    assert transcricao.modelo_solista() is None
    monkeypatch.delenv("IA_SOLISTA")
    assert transcricao.modelo_solista() == transcricao.KARAOKE
    monkeypatch.setattr(transcricao, "_tem_audio_separator", lambda: False)
    assert transcricao.modelo_solista() is None


def test_a_voz_separada_com_outro_separador_e_refeita(monkeypatch, tmp_path):
    monkeypatch.setattr(transcricao, "CACHE", str(tmp_path))
    y = np.linspace(-0.5, 0.5, 1000).astype(np.float32)
    feitas = []
    monkeypatch.setattr(transcricao, "separar", lambda a: feitas.append(transcricao.separador()) or (a * 0.5, a * 0.25))
    # a de antes (sem o nome do separador): é do Demucs
    transcricao.guardar("vid00000002", voz=y * 0.5, banda=y * 0.25)
    transcricao.separar_guardado(y, "vid00000002")
    assert feitas == []
    monkeypatch.setattr(transcricao, "separador", lambda: transcricao.ROFORMER)
    transcricao.separar_guardado(y, "vid00000002")
    transcricao.separar_guardado(y, "vid00000002")
    assert feitas == [transcricao.ROFORMER]


def test_o_solista_e_guardado(monkeypatch, tmp_path):
    monkeypatch.setattr(transcricao, "CACHE", str(tmp_path))
    monkeypatch.setattr(transcricao, "modelo_solista", lambda: "kara.onnx")
    feitas = []
    monkeypatch.setattr(transcricao, "separar_solista", lambda v, m: feitas.append(m) or (v * 0.8, v * 0.2))
    voz = np.linspace(-0.5, 0.5, 1000).astype(np.float32)
    a = transcricao.solista_guardado(voz, "vid00000003")
    b = transcricao.solista_guardado(voz, "vid00000003")
    assert feitas == ["kara.onnx"] and np.allclose(a[0], b[0], atol=1e-3) and np.allclose(b[1], voz * 0.2, atol=1e-3)


def _transcrever_com(monkeypatch, tmp_path, solista_rms, coro_rms, rede=None):
    """transcrever() com os modelos trocados por falsos: a voz separada, o solista e o coro com a força pedida."""
    monkeypatch.setattr(transcricao, "CACHE", str(tmp_path))
    n = SR * 4
    t = np.arange(n) / SR
    y = (0.3 * np.sin(2 * np.pi * 220 * t)).astype(np.float32)
    voz = y * 1.0
    monkeypatch.setattr(transcricao, "tem_separacao", lambda: True)
    monkeypatch.setattr(transcricao, "separar_guardado", lambda a, v=None: (voz, y * 0.5))
    unidade = voz / float(np.sqrt(np.mean(voz ** 2)))
    monkeypatch.setattr(transcricao, "solista_guardado", lambda v, video=None: (unidade * solista_rms, unidade * coro_rms))
    ouvidos = []

    def ouvir(sinal, pasta, nome, fonte, **op):
        ouvidos.append((nome, float(np.sqrt(np.mean(sinal ** 2)))))
        alt = {"voz": 69, "coro": 64, "banda": 45}[nome]
        return [Nota(0.5, 1.5, alt, 0.8, fonte), Nota(1.6, 2.6, alt + 2, 0.7, fonte)], None

    monkeypatch.setattr(transcricao, "ouvir", ouvir)
    monkeypatch.setattr(transcricao, "afinacao_da_voz", lambda v: None)
    monkeypatch.setattr(transcricao, "ataques_da_voz", lambda v: None)
    monkeypatch.setattr(transcricao, "batidas_beat_this", lambda a: rede)
    monkeypatch.setattr(transcricao, "andamento", lambda a, b=None: (90.0, [0.5, 1.17]))
    r = transcricao.transcrever(None, audio=(y, False))
    return r, ouvidos


def test_com_backing_o_solista_vai_sozinho_e_o_backing_vira_coro(monkeypatch, tmp_path):
    r, ouvidos = _transcrever_com(monkeypatch, tmp_path, solista_rms=0.2, coro_rms=0.1)
    nomes = [x[0] for x in ouvidos]
    assert nomes == ["voz", "banda", "coro"]
    # a voz ouvida é a do solista (a força dele), não a voz inteira
    assert abs(ouvidos[0][1] - 0.2) < 0.01
    assert r["solista"] and r["coro"] == 2 and r["vozes"] == "solo"
    fontes = {x["fonte"] for x in r["notas"]}
    assert fontes == {"voz", "coro", "banda"}
    # a força: voz > coro > banda (o app escolhe a melodia pela força)
    forca = {f: max(x["amplitude"] for x in r["notas"] if x["fonte"] == f) for f in fontes}
    assert forca["voz"] > forca["coro"] > forca["banda"]
    assert r["batidasPor"] == "librosa" and r["primeirosTempos"] == []


def test_sem_backing_de_verdade_nao_ha_coro(monkeypatch, tmp_path):
    r, ouvidos = _transcrever_com(monkeypatch, tmp_path, solista_rms=0.2, coro_rms=0.01)
    assert [x[0] for x in ouvidos] == ["voz", "banda"] and r["solista"] and r["coro"] == 0


def test_o_karaoke_que_tira_quase_toda_a_voz_nao_vale(monkeypatch, tmp_path):
    # um coral de verdade (tudo "backing" para o karaokê): fica a voz inteira
    r, ouvidos = _transcrever_com(monkeypatch, tmp_path, solista_rms=0.02, coro_rms=0.2)
    assert [x[0] for x in ouvidos] == ["voz", "banda"] and not r["solista"]
    assert abs(ouvidos[0][1] - 0.3 / np.sqrt(2)) < 0.01


def test_as_batidas_do_beat_this_vao_para_o_app(monkeypatch, tmp_path):
    rede = (100.0, [0.5 + i * 0.6 for i in range(10)], [0.5, 2.9])
    r, _ = _transcrever_com(monkeypatch, tmp_path, solista_rms=0.2, coro_rms=0.01, rede=rede)
    assert r["andamento"] == 100.0 and r["primeirosTempos"] == [0.5, 2.9]
    assert r["batidasDaBanda"] and r["batidasPor"] == "beat_this"
