"""O karaokê da música (como o "Sing" do Apple Music): a voz e a banda da gravação separadas, em estéreo e na qualidade
cheia (44,1 kHz), num arquivo só de 4 canais (AAC em M4A, o que o Android, o computador e o iPhone tocam):

    canais 1 e 2: a banda (a gravação menos a voz), esquerda e direita
    canais 3 e 4: a voz, esquerda e direita

O app toca esse arquivo e escolhe o volume da voz na hora, de 0 a 100%, com o controle deslizante do microfone. Como os
quatro canais estão no mesmo arquivo, a voz e a banda nunca se desencontram (nem um instante: são as mesmas amostras).
E a banda é a gravação menos a voz, então banda + voz é exatamente a gravação: com a voz em 100% o som é o original.

Só o cantor principal sai: o back vocal, o coro e a plateia ficam na banda (veja voz_principal). Na placa de vídeo (a
função "karaoke" do Modal, modal_app.py) a separação é pelos RoFormer, os modelos mais precisos; no processador, pelo
Demucs (htdemucs, em estéreo e a 44,1 kHz, de 60 em 60 s com 5 s de sobra de cada lado, cruzados na emenda) e pelos
modelos UVR mais leves.
"""

from __future__ import annotations

import logging
import os
import shutil
import subprocess
import tempfile
import threading

import numpy as np

import transcricao

log = logging.getLogger("songbook-ia")

SR = 44100
# O formato do arquivo (o app guarda junto da música). Mudou a separação ou o arquivo de um jeito que vale refazer os
# karaokês já prontos: suba este número (o app pede de novo os de número menor)
# 2: só o cantor principal sai (o back vocal fica), a plateia das gravações ao vivo não engana a separação e sem o
# chiado nas emendas dos pedaços
VERSAO = 2
CANAIS = ["banda-esquerda", "banda-direita", "voz-esquerda", "voz-direita"]
BLOCO = 60  # segundos de música por vez no Demucs
SOBRA = 5  # segundos a mais de cada lado do bloco, cruzados com o bloco vizinho
TAXA = os.environ.get("IA_KARAOKE_TAXA") or "384k"  # os 4 canais juntos (192 kb/s por par: menos chiado onde a voz saiu)
# o karaokê pronto de cada vídeo fica guardado (outro aparelho, ou a mesma música de novo, recebe na hora)
GUARDAR = int(os.environ.get("IA_KARAOKE_MAX") or 20)
_trava = threading.Lock()


def disponivel() -> bool:
    """O servidor separa a voz (Demucs ou RoFormer) e tem o ffmpeg para ler e gravar o áudio."""
    return transcricao.tem_separacao() and shutil.which("ffmpeg") is not None


def ler(caminho: str, maximo: float | None = None) -> np.ndarray:
    """O áudio em estéreo, 44,1 kHz, float32: (2, amostras). Mono vira os dois lados iguais."""
    cmd = ["ffmpeg", "-v", "error", "-nostdin", "-i", caminho]
    if maximo:
        cmd += ["-t", str(maximo)]
    cmd += ["-f", "f32le", "-acodec", "pcm_f32le", "-ac", "2", "-ar", str(SR), "-"]
    r = subprocess.run(cmd, capture_output=True, check=False)
    if r.returncode != 0:
        raise ValueError("não consegui abrir este áudio (" + r.stderr.decode(errors="replace").strip()[-160:] + ")")
    x = np.frombuffer(r.stdout, dtype="<f4")
    if len(x) < 2 * SR:  # menos de 1 s
        raise ValueError("áudio curto demais ou sem som")
    return x[: len(x) // 2 * 2].reshape(-1, 2).T.copy()


def pesos(n: int, inicios: list[int], passo: int, sobra: int) -> list[tuple[int, int, np.ndarray]]:
    """Para cada bloco: (de, até, peso de cada amostra). Na emenda, um bloco desce de 1 a 0 enquanto o seguinte sobe de 0
    a 1, no mesmo trecho de 2 × sobra: somados, os pesos dão 1 em toda a música (nada fica mais alto nem mais baixo)."""
    saida = []
    for k, ini in enumerate(inicios):
        a, b = max(0, ini - sobra), min(n, ini + passo + sobra)
        t = np.arange(a, b, dtype=np.float64)
        w = np.ones(b - a)
        if k > 0:
            w *= np.clip((t - (ini - sobra)) / (2 * sobra), 0, 1)
        if k + 1 < len(inicios):
            w *= np.clip(((ini + passo + sobra) - t) / (2 * sobra), 0, 1)
        saida.append((a, b, w.astype(np.float32)))
    return saida


def voz_demucs(x: np.ndarray, progresso=lambda p: None) -> np.ndarray:
    """A voz (2, amostras) pelo Demucs, de bloco em bloco."""
    import torch
    from demucs.apply import apply_model

    m = transcricao.modelo_demucs()
    # (com placa de vídeo, o Demucs roda nela; a música fica na memória comum e vai em pedaços)
    aparelho = "cuda" if torch.cuda.is_available() else "cpu"
    if m.samplerate != SR:
        raise RuntimeError(f"o Demucs carregado ouve a {m.samplerate} Hz, e o karaokê é a {SR} Hz")
    iv = m.sources.index("vocals")
    n = x.shape[1]
    ref = x.mean(0)
    media, desvio = float(ref.mean()), float(ref.std()) + 1e-8
    passo, sobra = BLOCO * SR, SOBRA * SR
    inicios = list(range(0, n, passo))
    voz = np.zeros_like(x)
    blocos = pesos(n, inicios, passo, sobra)
    for k, (a, b, w) in enumerate(blocos):
        t = torch.from_numpy((x[:, a:b] - media) / desvio)[None]
        with torch.no_grad():
            fontes = apply_model(m, t, shifts=1, split=True, overlap=0.25, progress=False, device=aparelho)[0]
        voz[:, a:b] += (fontes[iv].cpu().numpy() * desvio + media) * w
        progresso((k + 1) / len(blocos))
    return voz


# ------------------------------------------------------------------ a voz principal (só ela sai)
# O karaokê tira só o cantor principal: o back vocal e o coro ficam na banda (como no "Sing" do Apple Music). São três
# passos, cada um num modelo do audio-separator:
#   1. a voz inteira da gravação (o cantor, o back vocal e o coro juntos);
#   2. só nas gravações ao vivo: a plateia (os gritos, as palmas, o povo cantando junto) sai dessa voz, para o passo 3
#      não confundir a plateia com o cantor. Ela fica na banda;
#   3. o modelo "karaokê" separa, dessa voz, o cantor principal do back vocal.
# A banda é a gravação menos o cantor principal: o back vocal, a plateia e os instrumentos ficam exatamente como na
# gravação (sem passar por modelo nenhum, sem perder qualidade).
# Na placa de vídeo (o Modal): os RoFormer, os melhores (a voz do BS-RoFormer 1297, SDR 11,8 contra 9,9 do htdemucs; o
# cantor do Mel-RoFormer Karaoke, SDR 8,4 contra 5,4 do UVR Karaoke 2). No processador, para não levar 10 minutos por
# música: o Demucs (ou o RoFormer de IA_SEPARADOR), o UVR Karaoke 2 e o UVR Crowd, bem mais leves.
# IA_KARAOKE_VOZ, IA_KARAOKE_PLATEIA e IA_KARAOKE_SOLISTA trocam o modelo de cada passo ("0" desliga o passo; com o
# solista desligado, sai a voz inteira, como no karaokê de antes)
VOZ_GPU = "model_bs_roformer_ep_317_sdr_12.9755.ckpt"
PLATEIA_GPU = "mel_band_roformer_crowd_aufr33_viperx_sdr_8.7144.ckpt"
SOLISTA_GPU = "mel_band_roformer_karaoke_aufr33_viperx_sdr_10.1956.ckpt"
PLATEIA_CPU = "UVR-MDX-NET_Crowd_HQ_1.onnx"
SOLISTA_CPU = "UVR_MDXNET_KARA_2.onnx"
# a plateia só sai da voz quando é de verdade parte dela (o modelo, numa gravação de estúdio, ainda acha um pouquinho
# de "plateia" na respiração e no eco; tirar isso estragaria o cantor): a partir de 3% da energia da voz
PLATEIA_MINIMA = 0.03


def _desligado(v: str) -> bool:
    return v.strip().lower() in ("0", "nao", "não", "off")


def com_placa() -> bool:
    try:
        import torch

        return bool(torch.cuda.is_available())
    except ImportError:
        return False


def modelos() -> dict:
    """Os modelos de cada passo: {"voz": nome ou "demucs", "plateia": nome ou None, "solista": nome ou None}."""
    tem = transcricao._tem_audio_separator()
    gpu = com_placa()
    voz = (os.environ.get("IA_KARAOKE_VOZ") or "").strip()
    if not voz:
        voz = VOZ_GPU if gpu and tem else ("demucs" if transcricao.separador() == "htdemucs" else transcricao.separador())
    if not tem:
        voz = "demucs"

    def passo(env: str, gpu_modelo: str, cpu_modelo: str):
        pedido = (os.environ.get(env) or "").strip()
        if not tem or _desligado(pedido):
            return None
        return pedido or (gpu_modelo if gpu else cpu_modelo)

    return {"voz": voz, "plateia": passo("IA_KARAOKE_PLATEIA", PLATEIA_GPU, PLATEIA_CPU),
            "solista": passo("IA_KARAOKE_SOLISTA", SOLISTA_GPU, SOLISTA_CPU)}


def nome_dos_modelos() -> str:
    """O que fez o karaokê (vai no nome do arquivo guardado: outro jeito de separar, outro arquivo)."""
    m = modelos()
    curto = lambda x: (x or "nao").split(".")[0][:24]  # noqa: E731
    return f"{curto(m['voz'])}+{curto(m['plateia'])}+{curto(m['solista'])}"


_separadores: dict = {}


def _ajustar(v: np.ndarray, n: int) -> np.ndarray:
    """(2, n) float32, do jeito que vier do modelo ((n, 2), mais curto ou mais longo)."""
    v = np.asarray(v, dtype=np.float32)
    if v.ndim == 1:
        v = np.stack([v, v])
    if v.shape[0] != 2 and v.shape[-1] == 2:
        v = v.T
    return np.pad(v, ((0, 0), (0, max(0, n - v.shape[1]))))[:, :n]


def separar_com(modelo: str, x: np.ndarray) -> dict[str, np.ndarray]:
    """Um modelo do audio-separator no áudio (2, amostras) a 44,1 kHz: {nome da faixa (minúsculo): (2, amostras)}, as
    duas faixas do modelo (a que ele não dá é a gravação menos a outra), na mesma escala da entrada.
    Direto na memória: pelo arquivo, o audio-separator mudava o volume das faixas (para o pico ficar em 0,9) e as gravava
    em 16 bits, e a banda (a gravação menos a voz) ficava com sobra da voz e chiado."""
    from audio_separator.separator import Separator

    transcricao._threads_do_torch()
    n = x.shape[1]
    with transcricao._trava_sep:
        sep = _separadores.get(modelo)
        if sep is None:
            sep = Separator(output_dir=tempfile.gettempdir(), log_level=logging.WARNING,
                            model_file_dir=os.environ.get("IA_MODELOS_SEPARACAO", "/tmp/audio-separator-models/"),
                            normalization_threshold=1e9, use_autocast=com_placa(),
                            mdx_params={"hop_length": 1024, "segment_size": 256, "overlap": 0.5, "batch_size": 1, "enable_denoise": False})
            sep.load_model(modelo)
            m = sep.model_instance
            # Os RoFormer ouvem a música em pedaços de uns 8 s e, no padrão, andam 8 s por vez: sem sobreposição, a
            # janela de cada pedaço quase zera nas bordas, e a emenda (a cada 8 s) chiava. Andando meio pedaço por vez,
            # as janelas somam por igual em toda a música
            cfg = getattr(m, "model_data_cfgdict", None)
            if getattr(m, "is_roformer", False) and cfg is not None:
                pedaco = cfg.audio.hop_length * (cfg.inference.dim_t - 1) / cfg.audio.sample_rate
                m.overlap = max(1.0, pedaco / 2)
            _separadores[modelo] = sep
        m = sep.model_instance
        r = m.demix(np.ascontiguousarray(x, dtype=np.float32))
    if isinstance(r, dict):
        faixas = {str(k).lower(): _ajustar(v, n) for k, v in r.items()}
    else:
        # (a faixa única: a que o modelo tem como alvo; sem alvo, a principal dele)
        cfg = getattr(m, "model_data_cfgdict", None)
        alvo = getattr(getattr(cfg, "training", None), "target_instrument", None) if getattr(m, "is_roformer", False) else None
        faixas = {str(alvo or m.primary_stem_name).lower(): _ajustar(r, n)}
    if len(faixas) == 1:
        (nome, v), = faixas.items()
        outro = str(m.secondary_stem_name).lower()
        if outro == nome:
            outro = "resto"
        faixas[outro] = (x - v).astype(np.float32)
    return faixas


def _faixa(faixas: dict[str, np.ndarray], *nomes: str) -> np.ndarray:
    for nome in nomes:
        for k, v in faixas.items():
            if k == nome:
                return v
    raise RuntimeError(f"o modelo não devolveu {' nem '.join(nomes)}: {sorted(faixas)}")


def energia(v: np.ndarray) -> float:
    return float(np.mean(np.square(v, dtype=np.float64)))


def tirar_plateia(voz: np.ndarray, plateia: np.ndarray) -> tuple[np.ndarray, float]:
    """A voz sem a plateia, se ela é mesmo parte da voz (PLATEIA_MINIMA); senão, a voz como veio. E quanto da energia da
    voz era plateia."""
    parte = energia(plateia) / (energia(voz) + 1e-12)
    if parte < PLATEIA_MINIMA:
        return voz, parte
    return (voz - plateia).astype(np.float32), parte


def voz_principal(x: np.ndarray, progresso=lambda p: None) -> tuple[np.ndarray, dict]:
    """O cantor principal (2, amostras) da gravação x, e o que foi feito (os modelos, a plateia)."""
    m = modelos()
    info: dict = {"modelos": m}
    # 1. a voz inteira
    voz = None
    if m["voz"] != "demucs":
        try:
            voz = _faixa(separar_com(m["voz"], x), "vocals", "vocal")
        except Exception:  # o modelo não baixou ou não abriu: o Demucs, como antes
            log.warning("karaokê: %s falhou, separando com o Demucs", m["voz"], exc_info=True)
            info["modelos"] = {**m, "voz": "demucs"}
    if voz is None:
        voz = voz_demucs(x, lambda p: progresso(0.5 * p))
    progresso(0.5)
    # 2. a plateia (ao vivo)
    if m["plateia"]:
        try:
            faixas = separar_com(m["plateia"], voz)
            voz, parte = tirar_plateia(voz, _faixa(faixas, "crowd"))
            info["plateia"] = round(parte, 3)
        except Exception:  # sem o modelo (não baixou): segue com a voz como veio
            log.warning("karaokê: não deu para tirar a plateia", exc_info=True)
    progresso(0.65)
    # 3. o cantor principal (o back vocal fica na banda)
    if m["solista"]:
        try:
            faixas = separar_com(m["solista"], voz)
            voz = _faixa(faixas, "vocals", "vocal", "lead vocals")
            info["solista"] = True
        except Exception:  # sem o modelo: sai a voz inteira, como antes
            log.warning("karaokê: não deu para separar o cantor do back vocal", exc_info=True)
            info["solista"] = False
    progresso(1.0)
    return voz, info


def quatro_canais(x: np.ndarray, voz: np.ndarray) -> np.ndarray:
    """(4, amostras): a banda (a gravação menos a voz) e a voz. banda + voz = a gravação, amostra por amostra."""
    voz = voz[:, : x.shape[1]]
    return np.concatenate([x - voz, voz]).astype(np.float32)


def gravar(canais: np.ndarray, caminho: str) -> None:
    """Os 4 canais num M4A (AAC) com o arranjo "quad", na ordem dos CANAIS (o app confere a ordem num arquivo de teste
    gravado do mesmo jeito: public/karaoke-teste.m4a)."""
    cmd = ["ffmpeg", "-v", "error", "-nostdin", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "4", "-i", "-",
           # (o ffmpeg chamaria 4 canais crus de "4.0", com um canal central que o AAC trata de outro jeito: o channelmap
           # diz que são os 4 do "quad", um a um, sem misturar nada)
           "-af", "channelmap=map=0|1|2|3:channel_layout=quad", "-c:a", "aac", "-b:a", TAXA,
           "-movflags", "+faststart", caminho]
    r = subprocess.run(cmd, input=np.ascontiguousarray(canais.T).astype("<f4").tobytes(), capture_output=True, check=False)
    if r.returncode != 0 or not os.path.isfile(caminho):
        raise RuntimeError("o ffmpeg não gravou o karaokê: " + r.stderr.decode(errors="replace").strip()[-200:])


def fazer(entrada: str, saida: str, etapa=lambda nome, progresso=None: None) -> dict:
    """Do áudio da música (qualquer formato que o ffmpeg abre) ao karaokê em saida (.m4a)."""
    x = ler(entrada, transcricao.MAX_SEGUNDOS_VIDEO)
    etapa("separando", 0)
    voz, info = voz_principal(x, lambda p: etapa("separando", p))
    etapa("gravando")
    gravar(quatro_canais(x, voz), saida)
    return {"duracao": round(x.shape[1] / SR, 2), "separador": nome_dos_modelos(),
            **({"plateia": info["plateia"]} if "plateia" in info else {}), "solista": bool(info.get("solista"))}


# ------------------------------------------------------------------ guardado por vídeo

def _pasta() -> str:
    return os.path.join(transcricao.CACHE, "karaoke")


def _arquivo(video: str) -> str:
    return os.path.join(_pasta(), f"{video}-v{VERSAO}-{nome_dos_modelos()}.m4a")


def guardado(video: str, destino: str) -> bool:
    """Copia para destino o karaokê já feito deste vídeo (se houver). True se copiou."""
    origem = _arquivo(video)
    try:
        with _trava:
            if not os.path.isfile(origem):
                return False
            shutil.copyfile(origem, destino)
            os.utime(origem)  # usado agora: é dos últimos a sair
        return True
    except OSError:
        return False


def guardar(video: str, caminho: str) -> None:
    """Guarda uma cópia do karaokê feito (ficam os GUARDAR mais recentes)."""
    try:
        with _trava:
            os.makedirs(_pasta(), exist_ok=True)
            tmp = os.path.join(_pasta(), f".{video}.{threading.get_ident()}.m4a")
            shutil.copyfile(caminho, tmp)
            os.replace(tmp, _arquivo(video))
            prontos = sorted((os.path.join(_pasta(), f) for f in os.listdir(_pasta()) if f.endswith(".m4a") and not f.startswith(".")),
                             key=os.path.getmtime, reverse=True)
            for f in prontos[GUARDAR:]:
                os.remove(f)
    except OSError:  # sem espaço ou sem permissão: segue sem guardar
        log.warning("não consegui guardar o karaokê de %s", video, exc_info=True)
