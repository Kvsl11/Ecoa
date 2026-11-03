import base64
import json
import os
import subprocess
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import codespace  # noqa: E402


class Gh:
    """O gh falso: a porta pública dá certo ou não; o arquivo do endereço no GitHub tem "antes"."""

    def __init__(self, porta_ok: bool, antes: str = "https://velho.exemplo"):
        self.porta_ok, self.antes, self.chamadas = porta_ok, antes, []

    def __call__(self, *args, token=None, entrada=None):
        self.chamadas.append(args)
        ok = lambda out="": subprocess.CompletedProcess(args, 0, out, "")  # noqa: E731
        if args[:2] == ("codespace", "ports"):
            return ok() if self.porta_ok else subprocess.CompletedProcess(args, 1, "", "HTTP 403: Resource not accessible by integration")
        if args[:2] == ("api", "-X"):
            return ok()
        if args[0] == "api":
            return ok(json.dumps({"sha": "abc", "content": base64.b64encode((self.antes + "\n").encode()).decode()}))
        return ok()

    def gravado(self):
        put = [a for a in self.chamadas if a[:2] == ("api", "-X")]
        if not put:
            return None
        conteudo = next(x for x in put[0] if x.startswith("content="))[len("content="):]
        return base64.b64decode(conteudo).decode().strip()


def preparar(monkeypatch, tmp_path, gh, publico):
    monkeypatch.setenv("CODESPACE_NAME", "meu-cs")
    monkeypatch.setenv("GITHUB_REPOSITORY", "kvsl11/songbook")
    monkeypatch.setenv("GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN", "app.github.dev")
    monkeypatch.setattr(codespace, "ARQUIVO", str(tmp_path / "dados" / "endereco.txt"))
    monkeypatch.setattr(codespace, "gh", gh)
    monkeypatch.setattr(codespace, "esperar_servidor", lambda limite=0: True)
    monkeypatch.setattr(codespace.time, "sleep", lambda s: None)
    monkeypatch.setattr(codespace, "responde", lambda url, tempo=10: publico(url))


def test_porta_publica_publica_o_endereco_do_codespace(monkeypatch, tmp_path):
    gh = Gh(porta_ok=True)
    preparar(monkeypatch, tmp_path, gh, lambda url: "app.github.dev" in url)
    monkeypatch.setattr(codespace, "tunel", lambda: (_ for _ in ()).throw(AssertionError("não devia abrir o túnel")))
    codespace.main()
    assert gh.gravado() == "https://meu-cs-7860.app.github.dev"
    assert (tmp_path / "dados" / "endereco.txt").read_text().strip() == "https://meu-cs-7860.app.github.dev"


def test_sem_porta_publica_abre_o_tunel_e_publica_ele(monkeypatch, tmp_path):
    gh = Gh(porta_ok=False)
    preparar(monkeypatch, tmp_path, gh, lambda url: False)

    class Proc:
        esperou = False

        def wait(self):
            Proc.esperou = True

    monkeypatch.setattr(codespace, "tunel", lambda: ("https://abc-def.trycloudflare.com", Proc()))
    codespace.main()
    assert gh.gravado() == "https://abc-def.trycloudflare.com"
    assert Proc.esperou  # segura o túnel
    assert sum(1 for a in gh.chamadas if a[:2] == ("codespace", "ports")) >= 1


def test_o_mesmo_endereco_nao_vira_commit(monkeypatch, tmp_path):
    gh = Gh(porta_ok=True, antes="https://meu-cs-7860.app.github.dev")
    preparar(monkeypatch, tmp_path, gh, lambda url: True)
    codespace.main()
    assert gh.gravado() is None


def test_fora_do_codespace_nao_faz_nada(monkeypatch):
    monkeypatch.delenv("CODESPACE_NAME", raising=False)
    monkeypatch.setattr(codespace, "esperar_servidor", lambda limite=0: (_ for _ in ()).throw(AssertionError("não devia esperar")))
    codespace.main()
