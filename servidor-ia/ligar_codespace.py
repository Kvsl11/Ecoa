"""Liga o Codespace do projeto sozinho, pela API do GitHub (o servidor de reserva, no Modal, faz isto quando o app não
acha o Codespace ligado). Assim ninguém precisa ir ao GitHub ligar o servidor: o app usa o Codespace quando ele está de
pé e, enquanto ele liga (uns 2 minutos) ou quando a cota do mês acabou, usa o Modal.

Precisa de um token pessoal do GitHub (clássico) com o escopo "codespace", no secret CODESPACE_TOKEN das Actions (o
workflow "Publicar o servidor da IA" o põe no servidor do Modal como IA_GITHUB_TOKEN), e do repositório (IA_REPO,
dono/nome). Sem o token, o Codespace só liga à mão, como antes.

O que faz, nesta ordem:
1. acha o Codespace do projeto (o do endereço que o app conhece, ou o usado mais recentemente);
2. ligado: diz que está ligado; ligando: espera; desligado: manda ligar;
3. sem nenhum Codespace do projeto (o GitHub apaga os parados há muito tempo): cria um novo (ele se instala sozinho e
   publica o endereço no site);
4. o GitHub recusou por causa da cota ou do limite de gasto: "sem-cota" (o app fica no Modal e não insiste por um tempo).

Cada pedido é respondido com no máximo uma consulta ao GitHub por minuto (os aparelhos que abrem o app ao mesmo tempo
não multiplicam as chamadas, nem alguém de fora consegue ficar ligando o Codespace à toa).
"""

from __future__ import annotations

import json
import logging
import os
import re
import threading
import time
import urllib.error
import urllib.request

log = logging.getLogger("songbook-ia")

API = "https://api.github.com"
INTERVALO = 60  # segundos entre duas consultas ao GitHub (no meio, vale a resposta de antes)
SEM_COTA_POR = 30 * 60  # depois de "sem cota", só tenta de novo daqui a 30 minutos
LIGANDO = {"Queued", "Provisioning", "Awaiting", "Starting", "Rebuilding", "Updating", "Created", "Exporting"}
_trava = threading.Lock()
_ultimo: dict = {"em": 0.0, "resposta": None}


def token() -> str:
    return (os.environ.get("IA_GITHUB_TOKEN") or "").strip()


def repositorio() -> str:
    return (os.environ.get("IA_REPO") or "").strip()


def disponivel() -> bool:
    return bool(token() and repositorio())


def endereco(nome: str) -> str:
    return f"https://{nome}-7860.app.github.dev"


def nome_do_endereco(url: str) -> str:
    """O nome do Codespace pelo endereço dele (https://<nome>-7860.app.github.dev); '' se não é de um Codespace."""
    m = re.match(r"^https?://([a-z0-9-]+?)-7860\.app\.github\.dev/?$", (url or "").strip(), re.I)
    return m.group(1) if m else ""


class ErroGitHub(Exception):
    def __init__(self, status: int, mensagem: str):
        super().__init__(f"{status}: {mensagem}")
        self.status = status
        self.mensagem = mensagem


def github(metodo: str, caminho: str, corpo: dict | None = None):
    pedido = urllib.request.Request(API + caminho, method=metodo, data=json.dumps(corpo).encode() if corpo is not None else None,
                                    headers={"Authorization": f"Bearer {token()}", "Accept": "application/vnd.github+json",
                                             "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "songbook-servidor-ia",
                                             **({"Content-Type": "application/json"} if corpo is not None else {})})
    try:
        with urllib.request.urlopen(pedido, timeout=20) as r:
            texto = r.read().decode() or "{}"
            return json.loads(texto)
    except urllib.error.HTTPError as e:
        texto = e.read().decode(errors="replace")
        try:
            mensagem = json.loads(texto).get("message") or texto
        except ValueError:
            mensagem = texto
        raise ErroGitHub(e.code, str(mensagem)[:300]) from None


def sem_cota(e: ErroGitHub) -> bool:
    """A recusa é por falta de cota, de limite de gasto ou de cobrança (não adianta insistir agora)."""
    return e.status == 402 or bool(re.search(r"quota|spending|billing|payment|limit|exceeded|usage", e.mensagem, re.I))


def escolher(codespaces: list[dict], preferido: str = "") -> dict | None:
    """O Codespace do projeto: o do endereço que o app conhece ou, sem ele, o usado mais recentemente."""
    repo = repositorio().lower()
    do_projeto = [c for c in codespaces if str((c.get("repository") or {}).get("full_name", "")).lower() == repo
                  and c.get("state") not in ("Deleted", "Archived", "Moved")]
    if preferido:
        for c in do_projeto:
            if c.get("name") == preferido:
                return c
    do_projeto.sort(key=lambda c: c.get("last_used_at") or c.get("updated_at") or "", reverse=True)
    return do_projeto[0] if do_projeto else None


def _ligar(preferido: str) -> dict:
    lista = github("GET", "/user/codespaces?per_page=100").get("codespaces") or []
    c = escolher(lista, preferido)
    if c is None:
        # (nenhum do projeto: o GitHub apaga os que ficam parados por muito tempo) cria um, que se instala sozinho
        if os.environ.get("IA_CODESPACE_CRIAR", "1") in ("0", "nao", "não", "off"):
            return {"estado": "sem-codespace", "mensagem": "não há Codespace do projeto"}
        corpo = {k: v for k, v in {"machine": os.environ.get("IA_CODESPACE_MAQUINA")}.items() if v}
        novo = github("POST", f"/repos/{repositorio()}/codespaces", corpo)
        log.warning("Codespace novo criado: %s", novo.get("name"))
        return {"estado": "criando", "nome": novo.get("name", ""), "endereco": endereco(novo.get("name", ""))}
    nome, estado = c.get("name", ""), c.get("state", "")
    if estado == "Available":
        return {"estado": "ligado", "nome": nome, "endereco": endereco(nome)}
    if estado in LIGANDO:
        return {"estado": "ligando", "nome": nome, "endereco": endereco(nome)}
    github("POST", f"/user/codespaces/{nome}/start")
    log.warning("Codespace %s ligando (estava %s)", nome, estado)
    return {"estado": "ligando", "nome": nome, "endereco": endereco(nome)}


def ligar(preferido: str = "") -> dict:
    """{"estado": "ligado" | "ligando" | "criando" | "sem-cota" | "sem-token" | "sem-codespace" | "erro", "nome",
    "endereco", "mensagem"}. preferido: o nome (ou o endereço) do Codespace que o app conhece."""
    if not disponivel():
        return {"estado": "sem-token", "mensagem": "sem o CODESPACE_TOKEN, o Codespace só liga à mão"}
    preferido = nome_do_endereco(preferido) or re.sub(r"[^a-z0-9-]", "", (preferido or "").lower())
    with _trava:
        agora = time.time()
        antes = _ultimo["resposta"]
        espera = SEM_COTA_POR if antes and antes.get("estado") == "sem-cota" else INTERVALO
        if antes and agora - _ultimo["em"] < espera:
            return {**antes, "guardada": True}
        try:
            resposta = _ligar(preferido)
        except ErroGitHub as e:
            if sem_cota(e):
                log.warning("Codespace sem cota: %s", e.mensagem)
                resposta = {"estado": "sem-cota", "mensagem": e.mensagem}
            else:
                log.warning("não consegui ligar o Codespace: %s", e)
                resposta = {"estado": "erro", "mensagem": e.mensagem}
        except (urllib.error.URLError, TimeoutError, ValueError) as e:
            resposta = {"estado": "erro", "mensagem": f"o GitHub não respondeu ({type(e).__name__})"}
        _ultimo.update(em=agora, resposta=resposta)
        return resposta
