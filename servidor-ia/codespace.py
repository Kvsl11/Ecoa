"""O servidor do Codespace alcançável de qualquer aparelho, sem passo manual (o .devcontainer/servidor.sh roda isto).

1. Espera o servidor responder aqui dentro (na primeira vez ele pode estar instalando).
2. Tenta deixar a porta 7860 pública (gh codespace ports visibility). O token que o Codespace recebe nem sempre tem
   essa permissão: com o secret CODESPACE_TOKEN (um token pessoal com o escopo "codespace", opcional) ela vale sempre.
3. Confere de fora (sem login) se o endereço do Codespace responde. Se não, abre o túnel grátis da Cloudflare, que
   não precisa de permissão nenhuma (o endereço dele muda a cada vez que o Codespace liga).
4. Publica o endereço que funcionou no site: grava .devcontainer/endereco.txt pela API do GitHub (só quando mudou),
   e esse commit publica o app de novo, que entrega o endereço a todos os aparelhos.

O endereço também fica em dados/endereco.txt (a página do QR code mostra ele). Com o túnel, este processo fica de pé
segurando o túnel até o Codespace desligar.
"""

from __future__ import annotations

import base64
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request

PASTA = os.path.dirname(os.path.abspath(__file__))
PORTA = int(os.environ.get("PORT", 7860))
METRICAS = "127.0.0.1:20242"
ARQUIVO = os.path.join(PASTA, "dados", "endereco.txt")


def dizer(msg: str) -> None:
    print(f"[endereço] {msg}", flush=True)


def responde(url: str, tempo: float = 10) -> bool:
    """O servidor responde em url/saude, sem login (a porta privada do Codespace manda para a página de login)?"""
    try:
        pedido = urllib.request.Request(url.rstrip("/") + "/saude", headers={"X-Tunnel-Skip-AntiPhishing-Page": "true"})
        with urllib.request.urlopen(pedido, timeout=tempo) as r:
            return r.status == 200 and bool(json.loads(r.read().decode("utf-8", "replace")).get("ok"))
    except Exception:
        return False


def esperar_servidor(limite: float = 40 * 60) -> bool:
    fim = time.time() + limite
    while time.time() < fim:
        if responde(f"http://127.0.0.1:{PORTA}", 5):
            return True
        time.sleep(5)
    return False


def gh(*args: str, token: str | None = None, entrada: str | None = None) -> subprocess.CompletedProcess:
    """O gh (o programa do GitHub). A imagem do Codespace nem sempre o tem: sem ele, volta como erro (não quebra)."""
    env = dict(os.environ)
    if token:
        env["GH_TOKEN"] = token
    try:
        return subprocess.run(["gh", *args], env=env, capture_output=True, text=True, input=entrada, timeout=60)
    except (OSError, subprocess.TimeoutExpired) as e:
        return subprocess.CompletedProcess(["gh", *args], 127, "", f"gh: {e}")


def api(metodo: str, caminho: str, dados: dict | None = None) -> tuple[int, dict]:
    """A API do GitHub direto (sem o gh), com o token que o Codespace já tem (GITHUB_TOKEN): (status, resposta)."""
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN") or ""
    pedido = urllib.request.Request(
        "https://api.github.com/" + caminho.lstrip("/"), method=metodo,
        data=json.dumps(dados).encode() if dados is not None else None,
        headers={"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28",
                 "User-Agent": "songbook-codespace", **({"Authorization": f"Bearer {token}"} if token else {})})
    try:
        with urllib.request.urlopen(pedido, timeout=30) as r:
            return r.status, json.loads(r.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode() or "{}")
        except Exception:
            return e.code, {}
    except Exception as e:
        return 0, {"message": str(e)}


def porta_publica(nome: str) -> None:
    """Pede a porta pública (algumas vezes: a porta só aparece encaminhada uns segundos depois de o servidor ligar)."""
    # o token pessoal (se houver) primeiro; depois o do próprio Codespace
    tokens = list(dict.fromkeys([os.environ.get("CODESPACE_TOKEN") or None, None]))
    erro = ""
    for tentativa in range(6):
        for token in tokens:
            r = gh("codespace", "ports", "visibility", f"{PORTA}:public", "-c", nome, token=token)
            if r.returncode == 0:
                return
            erro = ((r.stderr or r.stdout).strip().splitlines() or [""])[-1]
        if tentativa == 0:
            dizer(f"não consegui deixar a porta pública ainda ({erro[:120]})")
        time.sleep(10)


def tunel() -> tuple[str | None, subprocess.Popen | None]:
    """O túnel da Cloudflare para o servidor: (endereço, processo) ou (None, None)."""
    sys.path.insert(0, PASTA)
    try:
        from iniciar_pc import cloudflared

        proc = subprocess.Popen([cloudflared(), "tunnel", "--no-autoupdate", "--metrics", METRICAS,
                                 "--url", f"http://127.0.0.1:{PORTA}"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except (OSError, SystemExit) as e:
        dizer(f"não consegui ligar o túnel da Cloudflare ({e})")
        return None, None
    fim = time.time() + 90
    while time.time() < fim and proc.poll() is None:
        try:
            with urllib.request.urlopen(f"http://{METRICAS}/quicktunnel", timeout=3) as r:
                host = json.load(r).get("hostname")
            if host and responde(f"https://{host}", 10):
                return f"https://{host}", proc
        except Exception:
            pass
        time.sleep(3)
    proc.terminate()
    return None, None


def publicar(url: str) -> None:
    """Grava o endereço em .devcontainer/endereco.txt no GitHub (o commit publica o site de novo), se mudou."""
    repo = os.environ.get("GITHUB_REPOSITORY") or gh("repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner").stdout.strip()
    if not repo:
        dizer("não sei qual é o repositório: o endereço não foi para o site")
        return
    caminho = f"repos/{repo}/contents/.devcontainer/endereco.txt"
    status, atual = api("GET", caminho)
    sha, antes = None, ""
    if status == 200:
        sha = atual.get("sha")
        try:
            antes = base64.b64decode(atual.get("content", "")).decode().strip()
        except Exception:
            pass
    if antes == url:
        dizer(f"o site já tem este endereço ({url})")
        return
    dados = {"message": "Servidor da IA: o endereço do Codespace", "content": base64.b64encode((url + "\n").encode()).decode()}
    if sha:
        dados["sha"] = sha
    status, r = api("PUT", caminho, dados)
    if status in (200, 201):
        dizer(f"endereço publicado no site ({url}): em uns 2 minutos os aparelhos acham este servidor sozinhos")
    else:
        dizer(f"não consegui publicar o endereço no site ({status} {str(r.get('message', ''))[:160]}). Grave uma vez a "
              f"variável SERVIDOR_IA_URL = {url} (GitHub → Settings → Secrets and variables → Actions → Variables)")


def main() -> None:
    nome = os.environ.get("CODESPACE_NAME")
    dominio = os.environ.get("GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN") or "app.github.dev"
    if not nome:
        return
    dizer("esperando o servidor ligar…")
    if not esperar_servidor():
        dizer("o servidor não respondeu: veja o que aconteceu acima neste log")
        return
    url, proc = f"https://{nome}-{PORTA}.{dominio}", None
    if not responde(url):  # já pública (a pessoa mudou na aba Portas, ou de uma vez anterior): nem pede
        porta_publica(nome)
    for _ in range(6):  # a porta pública demora uns segundos para valer
        if responde(url):
            break
        time.sleep(5)
    else:
        dizer("a porta do Codespace não ficou pública: abrindo o túnel da Cloudflare")
        url, proc = tunel()
        if not url:
            dizer("sem endereço público: mude a porta 7860 para Pública na aba Portas do Codespace")
            return
    os.makedirs(os.path.dirname(ARQUIVO), exist_ok=True)
    with open(ARQUIVO, "w", encoding="utf-8") as f:
        f.write(url + "\n")
    dizer(f"servidor no ar em {url}")
    publicar(url)
    if proc:
        proc.wait()  # segura o túnel enquanto o Codespace estiver ligado


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # o servidor segue ligado; o log diz o que faltou
        dizer(f"parou com um erro ({type(e).__name__}: {e}): mude a porta 7860 para Pública na aba Portas do Codespace")
        raise
