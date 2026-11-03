import base64
import os
import subprocess
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import codespace  # noqa: E402


class Gh:
    """O gh falso (a porta pública dá certo, dá 403 ou o gh nem existe) e a API do GitHub falsa (o arquivo do
    endereço no GitHub tem "antes")."""

    def __init__(self, porta_ok: bool, antes: str = "https://velho.exemplo", sem_gh: bool = False):
        self.porta_ok, self.antes, self.sem_gh, self.chamadas, self.puts = porta_ok, antes, sem_gh, [], []

    def __call__(self, *args, token=None, entrada=None):
        self.chamadas.append(args)
        if self.sem_gh:
            return subprocess.CompletedProcess(args, 127, "", "gh: [Errno 2] No such file or directory: 'gh'")
        if args[:2] == ("codespace", "ports"):
            return subprocess.CompletedProcess(args, 0, "", "") if self.porta_ok else subprocess.CompletedProcess(args, 1, "", "HTTP 403: Resource not accessible by integration")
        return subprocess.CompletedProcess(args, 0, "", "")

    def api(self, metodo, caminho, dados=None):
        assert caminho == "repos/kvsl11/songbook/contents/.devcontainer/endereco.txt"
        if metodo == "GET":
            return 200, {"sha": "abc", "content": base64.b64encode((self.antes + "\n").encode()).decode()}
        self.puts.append(dados)
        return 200, {}

    def gravado(self):
        if not self.puts:
            return None
        assert self.puts[0]["sha"] == "abc"
        return base64.b64decode(self.puts[0]["content"]).decode().strip()


def preparar(monkeypatch, tmp_path, gh, publico):
    monkeypatch.setenv("CODESPACE_NAME", "meu-cs")
    monkeypatch.setenv("GITHUB_REPOSITORY", "kvsl11/songbook")
    monkeypatch.setenv("GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN", "app.github.dev")
    monkeypatch.setattr(codespace, "ARQUIVO", str(tmp_path / "dados" / "endereco.txt"))
    monkeypatch.setattr(codespace, "gh", gh)
    monkeypatch.setattr(codespace, "api", gh.api)
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


def test_sem_o_gh_vai_pelo_tunel_e_publica_pela_api(monkeypatch, tmp_path):
    gh = Gh(porta_ok=False, sem_gh=True)
    preparar(monkeypatch, tmp_path, gh, lambda url: False)
    monkeypatch.setattr(codespace, "tunel", lambda: ("https://xyz.trycloudflare.com", None))
    codespace.main()
    assert gh.gravado() == "https://xyz.trycloudflare.com"


def test_o_gh_que_nao_existe_vira_erro_e_nao_quebra(monkeypatch):
    monkeypatch.setenv("PATH", "/nao-existe")
    r = codespace.gh("codespace", "ports", "visibility", "7860:public")
    assert r.returncode != 0 and "gh" in r.stderr


def test_porta_ja_publica_nem_pede_de_novo(monkeypatch, tmp_path):
    gh = Gh(porta_ok=False)
    preparar(monkeypatch, tmp_path, gh, lambda url: "app.github.dev" in url)
    codespace.main()
    assert not any(a[:2] == ("codespace", "ports") for a in gh.chamadas)
    assert gh.gravado() == "https://meu-cs-7860.app.github.dev"
