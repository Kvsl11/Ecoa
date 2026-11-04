"""O karaokê da música (como o "Sing" do Apple Music): a voz e a banda da gravação separadas, em estéreo e na qualidade
cheia (44,1 kHz), num arquivo só de 4 canais (AAC em M4A, o que o Android, o computador e o iPhone tocam):

    canais 1 e 2: a banda (a gravação menos a voz), esquerda e direita
    canais 3 e 4: a voz, esquerda e direita

O app toca esse arquivo e escolhe o volume da voz na hora, de 0 a 100%, com o controle deslizante do microfone. Como os
quatro canais estão no mesmo arquivo, a voz e a banda nunca se desencontram (nem um instante: são as mesmas amostras).
E a banda é a gravação menos a voz, então banda + voz é exatamente a gravação: com a voz em 100% o som é o original.

A voz sai do Demucs (htdemucs, o mesmo da partitura, mas aqui em estéreo e a 44,1 kHz, sem reduzir para mono), de 60 em
60 s com 5 s de sobra de cada lado, cruzados na emenda: a porcentagem anda na tela e a memória não estoura numa música
longa. Com placa de vídeo (a função "karaoke" do Modal, modal_app.py), o Demucs roda nela: de 1 a 3 minutos no
processador para uns 15 a 30 segundos. Com IA_SEPARADOR=roformer (o PC com placa de vídeo), a voz sai do Mel-Band RoFormer, mais limpa.
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
VERSAO = 1
CANAIS = ["banda-esquerda", "banda-direita", "voz-esquerda", "voz-direita"]
BLOCO = 60  # segundos de música por vez no Demucs
SOBRA = 5  # segundos a mais de cada lado do bloco, cruzados com o bloco vizinho
TAXA = os.environ.get("IA_KARAOKE_TAXA") or "320k"  # os 4 canais juntos (160 kb/s por par: menos chiado onde a voz saiu)
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


def voz_roformer(x: np.ndarray) -> np.ndarray:
    """A voz (2, amostras) pelo modelo do audio-separator (IA_SEPARADOR=roformer), em estéreo."""
    import soundfile as sf
    from audio_separator.separator import Separator

    modelo = transcricao.separador()
    with tempfile.TemporaryDirectory(prefix="songbook-karaoke-sep-") as pasta:
        entrada = os.path.join(pasta, "entrada.wav")
        sf.write(entrada, x.T, SR, subtype="FLOAT")
        with transcricao._trava_sep:
            sep = transcricao._separadores.get(modelo)
            if sep is None:
                sep = Separator(output_dir=pasta, model_file_dir=os.environ.get("IA_MODELOS_SEPARACAO", "/tmp/audio-separator-models/"),
                                log_level=logging.WARNING)
                sep.load_model(modelo)
                transcricao._separadores[modelo] = sep
            sep.output_dir = pasta
            if getattr(sep, "model_instance", None) is not None:
                sep.model_instance.output_dir = pasta
            saidas = sep.separate(entrada)
        caminhos = [s if os.path.isabs(s) else os.path.join(pasta, s) for s in saidas]
        voz = next((c for c in caminhos if "(vocals)" in os.path.basename(c).lower()), None)
        if not voz:
            raise RuntimeError(f"saídas inesperadas do {modelo}: {saidas}")
        v = ler(voz)
    n = x.shape[1]
    return np.pad(v, ((0, 0), (0, max(0, n - v.shape[1]))))[:, :n]


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
    if transcricao.separador() != "htdemucs":
        voz = voz_roformer(x)
    else:
        voz = voz_demucs(x, lambda p: etapa("separando", p))
    etapa("separando", 1.0)
    etapa("gravando")
    gravar(quatro_canais(x, voz), saida)
    return {"duracao": round(x.shape[1] / SR, 2), "separador": transcricao.separador()}


# ------------------------------------------------------------------ guardado por vídeo

def _pasta() -> str:
    return os.path.join(transcricao.CACHE, "karaoke")


def _arquivo(video: str) -> str:
    return os.path.join(_pasta(), f"{video}-v{VERSAO}-{transcricao.separador().split('.')[0]}.m4a")


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
