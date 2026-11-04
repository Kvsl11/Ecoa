"""O servidor da IA no Modal (modal.com): US$ 30 de uso grátis por mês, endereço https, liga só quando alguém usa.

    modal deploy modal_app.py

O endereço fica https://<sua-conta>--songbook-ia-web.modal.run. Quem publica é o GitHub
(.github/workflows/servidor-ia.yml), com os secrets MODAL_TOKEN_ID e MODAL_TOKEN_SECRET.
"""

import os

import modal

PASTA = os.path.dirname(os.path.abspath(__file__))

def montar(torch_de: str | None):
    """A imagem do servidor: o torch de torch_de (o de processador) ou, com None, o do PyPI, que já vem com o CUDA (a
    placa de vídeo do karaokê)."""
    return (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg", "libsndfile1")
    # o torchvision junto (o audio-separator o pede): sem ele, o pip trocava este torch pelo com CUDA, de vários GB
    .pip_install("torch", "torchaudio", "torchvision", **({"index_url": torch_de} if torch_de else {}))
    .pip_install_from_requirements(os.path.join(PASTA, "requirements.txt"))
    .run_commands(
        "pip install --no-deps basic-pitch==0.4.0",
        # os modelos já baixados na montagem: a primeira música não espera o download
        "python -c \"from demucs.pretrained import get_model; get_model('htdemucs')\"",
        # o Beat This! (as batidas) e o karaokê (o solista longe do backing vocal)
        "python -c \"from beat_this.inference import load_model; load_model('final0')\"",
        "python -c \"from audio_separator.separator import Separator; Separator(model_file_dir='/root/modelos-separacao').load_model('UVR_MDXNET_KARA_2.onnx')\"",
        "python -c \"from faster_whisper import WhisperModel; WhisperModel('small', device='cpu', compute_type='int8')\"",
        # o "medium", do "sincronizar de novo" (mais preciso)
        "python -c \"from faster_whisper import WhisperModel; WhisperModel('medium', device='cpu', compute_type='int8')\"",
    )
    .env({"IA_WHISPER": "small", "PYTHONUNBUFFERED": "1", "IA_MODELOS_SEPARACAO": "/root/modelos-separacao"})
    .add_local_dir(PASTA, remote_path="/root/app", ignore=["tests", "**/__pycache__", ".pytest_cache", "Dockerfile"])
    )


imagem = montar("https://download.pytorch.org/whl/cpu")
# o karaokê na placa de vídeo: o torch com CUDA
imagem_gpu = montar(None)

app = modal.App("songbook-ia")

# o áudio e a voz separada de cada vídeo ficam guardados aqui (transcricao.guardar): a letra sincronizada e a
# partitura da mesma música não baixam nem separam duas vezes, mesmo em máquinas diferentes
guardados = modal.Volume.from_name("songbook-ia-cache", create_if_missing=True)
NUCLEOS = 8


# a chave da IA do "Tirar dúvidas" e o cookies.txt do YouTube vêm do secret "songbook-ia" (o workflow o cria)
# 8 núcleos: o Demucs, o CREPE e o Whisper dividem o trabalho entre eles, e a música sai várias vezes mais rápido pelo
# mesmo custo de núcleo-segundo.
# Modo econômico (o crédito grátis de US$ 30/mês acabava e o Modal desativava a conta): uma música por vez e uma
# máquina só (a segunda espera na fila em vez de ligar outra), 8 GB de memória (antes 16, para duas músicas) e desliga
# 1 minuto depois do último uso (antes 5: o tempo parado também é cobrado)
@app.function(image=imagem, cpu=float(NUCLEOS), memory=8192, timeout=900, scaledown_window=60, max_containers=1,
              secrets=[modal.Secret.from_name("songbook-ia")], volumes={"/cache": guardados},
              env={"IA_THREADS": str(NUCLEOS), "IA_TAREFAS": "1", "IA_CACHE": "/cache", "IA_CREPE": "full"})
@modal.concurrent(max_inputs=4)
@modal.asgi_app()
def web():
    import sys

    sys.path.insert(0, "/root/app")
    os.chdir("/root/app")
    from app import app as api

    return api


# o Lumen (o "Tirar dúvidas" com IA, rota /duvida) numa máquina pequena, separada: a pergunta só lê o acervo e chama
# o Claude, não precisa dos 8 núcleos da partitura; assim cada pergunta não liga a máquina grande (que gasta o crédito
# do Modal por núcleo-segundo) nem espera na fila de uma música sendo gerada. O endereço vai em data/servidor-ia.json
# ("lumen"), gravado pela publicação do app.
@app.function(image=imagem, cpu=1.0, memory=4096, timeout=300, scaledown_window=120, max_containers=2,
              secrets=[modal.Secret.from_name("songbook-ia")])
@modal.concurrent(max_inputs=8)
@modal.asgi_app()
def lumen():
    import sys

    sys.path.insert(0, "/root/app")
    os.chdir("/root/app")
    from app import app as api

    return api


# O karaokê (rotas /karaoke, /tarefa e /baixar) numa placa de vídeo (T4): o Demucs separa a voz de uma música em uns 15 a
# 30 segundos, em vez de 1 a 3 minutos no processador, por menos de 1 centavo de dólar. O endereço vai em
# data/servidor-ia.json ("karaoke") e o app manda só o karaokê para cá (o resto fica no Codespace). Uma máquina só (o
# arquivo pronto e o andamento ficam na memória dela) e desliga 2 minutos depois do último uso
@app.function(image=imagem_gpu, gpu="T4", cpu=4.0, memory=16384, timeout=900, scaledown_window=120, max_containers=1,
              secrets=[modal.Secret.from_name("songbook-ia")], volumes={"/cache": guardados},
              env={"IA_THREADS": "4", "IA_TAREFAS": "1", "IA_CACHE": "/cache"})
@modal.concurrent(max_inputs=8)
@modal.asgi_app()
def karaoke():
    import sys

    sys.path.insert(0, "/root/app")
    os.chdir("/root/app")
    from app import app as api

    return api
