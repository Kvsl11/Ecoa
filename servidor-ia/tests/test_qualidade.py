import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import youtube  # noqa: E402


def test_cada_qualidade_pede_a_altura_e_o_som_dela():
    assert "height<=480" in youtube.formato_video("normal")
    assert "height<=720" in youtube.formato_video("alta")
    assert "height<=1080" in youtube.formato_video("muito-alta")
    # a imagem em H.264 com o som em M4A (o celular toca sem converter), e o MP4 já junto como reserva
    assert youtube.formato_video("muito-alta").startswith("bestvideo[height<=1080][vcodec^=avc1]+bestaudio[ext=m4a]")
    assert youtube.formato_video("alta").endswith("/18/best[ext=mp4]/best")


def test_som_normal_alto_e_muito_alto():
    assert youtube.formato_audio("normal").startswith("bestaudio[ext=m4a][abr<=64]")
    assert youtube.formato_audio("alta").startswith("bestaudio[ext=m4a][abr>64]")
    assert youtube.formato_audio("muito-alta").startswith("bestaudio[acodec=opus]/")


def test_qualidade_desconhecida_fica_na_alta():
    assert youtube.formato_video("xyz") == youtube.formato_video("alta")
    assert youtube.formato_audio("") == youtube.formato_audio("alta")


def test_2k_e_4k_pedem_a_altura_deles_em_vp9_e_o_360p_fica_por_ultimo():
    assert youtube.formato_video("4k").startswith("bestvideo[height<=2160][vcodec^=vp09]+bestaudio[ext=m4a]")
    assert "height<=1440" in youtube.formato_video("2k")
    # (qualquer imagem até a altura antes do MP4 pronto de 360p, que fazia o vídeo sair em 360p)
    for q in ("alta", "muito-alta", "4k"):
        f = youtube.formato_video(q)
        assert f.index("bestvideo[height<=") < f.index("/18/")


def test_audio_maximo():
    assert youtube.formato_audio("maxima").startswith("bestaudio[ext=m4a][abr>=200]/")
