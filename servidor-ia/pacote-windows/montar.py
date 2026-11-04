"""Monta o pacote pronto do servidor para Windows (roda no GitHub, .github/workflows/pacote-windows.yml).

    python montar.py <pasta de trabalho> <pasta dos zips>

Monta <pasta de trabalho>/Ecoa-Servidor com tudo dentro (o Python 3.11 portátil, os pacotes, os modelos de IA já
baixados, o ffmpeg e o cloudflared) e divide em zips de até ~1,8 GB (o GitHub aceita até 2 GB por arquivo), agrupados
pelo que muda junto: a parte principal (o Python, o servidor e os botões), o yt-dlp (muda toda semana), o torch, os
outros pacotes e os modelos. Uma parte que não mudou tem o mesmo hash da versão anterior: quem já tem o pacote só
baixa a que mudou (pacote.py).
"""

from __future__ import annotations

import datetime
import hashlib
import json
import os
import shutil
import subprocess
import sys
import urllib.request
import zipfile

AQUI = os.path.dirname(os.path.abspath(__file__))
SERVIDOR_IA = os.path.dirname(AQUI)
PYTHON_ZIP = "https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip"
GET_PIP = "https://bootstrap.pypa.io/get-pip.py"
CLOUDFLARED = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
PREFIXO = "Ecoa-Servidor/"
LIMITE = int(1.8 * 1024 ** 3)  # por zip (sem compactar: o zip sai menor ou igual)
GUARDAR_SEM_COMPACTAR = (".pt", ".pth", ".th", ".ckpt", ".onnx", ".bin", ".safetensors", ".zip", ".pyd", ".dll", ".exe")
SITE = "python/Lib/site-packages/"


def rodar(*cmd: str, env: dict | None = None) -> None:
    print("+", " ".join(cmd), flush=True)
    subprocess.run(cmd, check=True, env={**os.environ, **(env or {})})


def baixar(url: str, destino: str) -> None:
    print("baixando", url, flush=True)
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    with urllib.request.urlopen(url) as r, open(destino, "wb") as f:
        shutil.copyfileobj(r, f)


def ambiente(raiz: str) -> dict:
    """Onde os modelos ficam: dentro do pacote (o "Ligar servidor.bat" aponta para os mesmos lugares)."""
    return {
        "TORCH_HOME": os.path.join(raiz, "modelos", "torch"),
        "HF_HOME": os.path.join(raiz, "modelos", "huggingface"),
        "XDG_CACHE_HOME": os.path.join(raiz, "modelos", "cache"),
        "IA_MODELOS_SEPARACAO": os.path.join(raiz, "modelos", "separacao"),
        "PYTHONUTF8": "1",
    }


def montar(raiz: str) -> None:
    py_dir = os.path.join(raiz, "python")
    py = os.path.join(py_dir, "python.exe")
    # 1. o Python portátil (o zip oficial "embeddable"), com o pip
    arquivo = os.path.join(raiz, "..", "python.zip")
    baixar(PYTHON_ZIP, arquivo)
    with zipfile.ZipFile(arquivo) as z:
        z.extractall(py_dir)
    os.remove(arquivo)
    with open(os.path.join(py_dir, "python311._pth"), "w", encoding="utf-8") as f:
        f.write("python311.zip\n.\nLib\\site-packages\nimport site\n")
    baixar(GET_PIP, os.path.join(raiz, "..", "get-pip.py"))
    rodar(py, os.path.join(raiz, "..", "get-pip.py"), "--no-warn-script-location")

    # 2. os pacotes (os mesmos do iniciar-windows-sem-docker.bat)
    pip = [py, "-m", "pip", "install", "--no-cache-dir", "--no-warn-script-location"]
    rodar(*pip, "torch", "torchaudio", "torchvision", "--index-url", "https://download.pytorch.org/whl/cpu")
    rodar(*pip, "-r", os.path.join(SERVIDOR_IA, "requirements.txt"), "static-ffmpeg", "uvicorn", "truststore")
    rodar(*pip, "--no-deps", "basic-pitch==0.4.0")

    # 3. o servidor e os botões
    servidor = os.path.join(raiz, "servidor")
    shutil.copytree(SERVIDOR_IA, servidor, ignore=shutil.ignore_patterns(
        "tests", "Dockerfile", "docker-compose.yml", ".venv", "python311", "dados", "bin", "__pycache__", ".pytest_cache",
        "cookies.txt", "textos-acervo.jsonl", "pronto.txt", "*.bat"))
    for nome in ("Ligar servidor.bat", "Desligar servidor.bat", "LEIA-ME.txt"):
        shutil.copy(os.path.join(AQUI, nome), os.path.join(raiz, nome))
    baixar(CLOUDFLARED, os.path.join(servidor, "bin", "cloudflared.exe"))

    # 4. os modelos de IA já baixados (a primeira música não espera nada)
    rodar(py, "-c", "; ".join([
        "import static_ffmpeg; static_ffmpeg.add_paths()",
        "from demucs.pretrained import get_model; get_model('htdemucs')",
        "from faster_whisper import WhisperModel; WhisperModel('small', device='cpu', compute_type='int8')",
        "from torchaudio.pipelines import MMS_FA; MMS_FA.get_model(with_star=False)",
        "from beat_this.inference import load_model; load_model('final0')",
        "import os; from audio_separator.separator import Separator",
        "[Separator(model_file_dir=os.environ['IA_MODELOS_SEPARACAO']).load_model(m) for m in "
        "('UVR_MDXNET_KARA_2.onnx', 'UVR-MDX-NET_Crowd_HQ_1.onnx')]",
        "print('modelos prontos')",
    ]), env=ambiente(raiz))
    shutil.rmtree(os.path.join(servidor, "__pycache__"), ignore_errors=True)


def categoria(rel: str) -> str:
    """Em que parte o arquivo vai: as coisas que mudam juntas ficam juntas."""
    if rel.startswith("modelos/"):
        return "modelos"
    if rel.startswith(SITE):
        topo = rel[len(SITE):].split("/", 1)[0].lower()
        if topo.startswith(("yt_dlp", "yt-dlp")):
            return "yt-dlp"
        if topo.startswith(("torch", "functorch")):
            return "torch"
        return "pacotes"
    if rel.startswith("python/Scripts/"):
        return "pacotes"
    return "principal"


def sha_arquivo(caminho: str) -> str:
    h = hashlib.sha256()
    with open(caminho, "rb") as f:
        for bloco in iter(lambda: f.read(1024 * 1024), b""):
            h.update(bloco)
    return h.hexdigest()


def dividir(raiz: str) -> list[dict]:
    """As partes: cada categoria, dividida em pedaços de até LIMITE (na ordem dos caminhos, sempre a mesma)."""
    grupos: dict[str, list[str]] = {}
    for pasta, _, arquivos in os.walk(raiz):
        for a in arquivos:
            rel = os.path.relpath(os.path.join(pasta, a), raiz).replace(os.sep, "/")
            if rel.startswith(".partes/") or rel == "partes.json":
                continue
            grupos.setdefault(categoria(rel), []).append(rel)
    partes = []
    for cat in ("principal", "yt-dlp", "pacotes", "torch", "modelos"):
        pedacos, atual, soma = [], [], 0
        for rel in sorted(grupos.get(cat, [])):
            t = os.path.getsize(os.path.join(raiz, rel))
            if atual and soma + t > LIMITE:
                pedacos.append(atual)
                atual, soma = [], 0
            atual.append(rel)
            soma += t
        if atual:
            pedacos.append(atual)
        for i, arquivos in enumerate(pedacos, 1):
            nome = cat if len(pedacos) == 1 else f"{cat}-{i}"
            h = hashlib.sha256()
            for rel in arquivos:
                h.update(rel.encode() + b"\0" + sha_arquivo(os.path.join(raiz, rel)).encode() + b"\n")
            partes.append({
                "nome": nome,
                "arquivo": "Ecoa-Servidor.zip" if cat == "principal" else f"Ecoa-Servidor-{nome}.zip",
                "hash": h.hexdigest(),
                "principal": cat == "principal",
                "arquivos": arquivos,
            })
    return partes


def escrever_zip(raiz: str, destino: str, membros: list[str], extra: dict[str, str] | None = None) -> None:
    with zipfile.ZipFile(destino, "w", allowZip64=True) as z:
        for rel in membros:
            tipo = zipfile.ZIP_STORED if rel.lower().endswith(GUARDAR_SEM_COMPACTAR) else zipfile.ZIP_DEFLATED
            z.write(os.path.join(raiz, rel), PREFIXO + rel, compress_type=tipo, compresslevel=6)
        for rel, texto in (extra or {}).items():
            z.writestr(PREFIXO + rel, texto)


def zipar(raiz: str, saida: str, partes: list[dict]) -> None:
    """As outras partes primeiro (cada uma com a marca dela, a .hash por último); a principal no fim, com o
    partes.json já com o tamanho de cada zip."""
    os.makedirs(saida, exist_ok=True)
    marcas = os.path.join(raiz, ".partes")
    os.makedirs(marcas, exist_ok=True)
    for p in partes:
        if p["principal"]:
            continue
        with open(os.path.join(marcas, p["nome"] + ".lista"), "w", encoding="utf-8") as f:
            f.write("\n".join(p["arquivos"]) + "\n")
        with open(os.path.join(marcas, p["nome"] + ".hash"), "w", encoding="utf-8") as f:
            f.write(p["hash"] + "\n")
        destino = os.path.join(saida, p["arquivo"])
        escrever_zip(raiz, destino, p["arquivos"] + [f".partes/{p['nome']}.lista", f".partes/{p['nome']}.hash"])
        p["bytes"] = os.path.getsize(destino)
        print(f"{p['arquivo']}: {len(p['arquivos'])} arquivos, {p['bytes'] / 1024 ** 2:.0f} MB", flush=True)
    with open(os.path.join(SERVIDOR_IA, "requirements.txt"), "rb") as f:
        dados = f.read()
    manifesto = {
        "versao": datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime("%Y-%m-%d %H:%M"),
        "commit": os.environ.get("GITHUB_SHA", ""),
        # o "sha" do git do requirements.txt: o pacote.py só traz o código novo se os pacotes forem os mesmos
        "requisitos": hashlib.sha1(b"blob %d\0" % len(dados) + dados).hexdigest(),
        "hash": hashlib.sha256("".join(p["hash"] for p in partes if not p["principal"]).encode()).hexdigest(),
        "partes": [{k: v for k, v in p.items() if k != "arquivos"} for p in partes],
    }
    texto = json.dumps(manifesto, ensure_ascii=False, indent=1)
    # o partes.json: na pasta montada (o teste liga o servidor dela), solto na publicação (o pacote.py procura versão
    # nova nele) e dentro do zip principal
    for pasta in (raiz, saida):
        with open(os.path.join(pasta, "partes.json"), "w", encoding="utf-8") as f:
            f.write(texto)
    principal = next(p for p in partes if p["principal"])
    destino = os.path.join(saida, principal["arquivo"])
    escrever_zip(raiz, destino, principal["arquivos"], {"partes.json": texto})
    print(f"{principal['arquivo']}: {len(principal['arquivos'])} arquivos, {os.path.getsize(destino) / 1024 ** 2:.0f} MB",
          flush=True)


def main() -> None:
    trabalho, saida = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
    raiz = os.path.join(trabalho, "Ecoa-Servidor")
    os.makedirs(raiz, exist_ok=True)
    montar(raiz)
    zipar(raiz, saida, dividir(raiz))
    total = sum(os.path.getsize(os.path.join(saida, a)) for a in os.listdir(saida))
    print(f"pronto: {total / 1024 ** 3:.2f} GB em {saida}", flush=True)


if __name__ == "__main__":
    main()
