import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest  # noqa: E402

import ligar_codespace as lc  # noqa: E402


@pytest.fixture
def github(monkeypatch):
    """A API do GitHub de mentira: a lista de Codespaces e o que cada chamada faz."""
    monkeypatch.setenv("IA_GITHUB_TOKEN", "t")
    monkeypatch.setenv("IA_REPO", "Kvsl11/Songbook")
    lc._ultimo.update(em=0.0, resposta=None)
    estado = {"lista": [], "chamadas": [], "erro_start": None}

    def falso(metodo, caminho, corpo=None):
        estado["chamadas"].append((metodo, caminho))
        if metodo == "GET":
            return {"codespaces": estado["lista"]}
        if caminho.endswith("/start"):
            if estado["erro_start"]:
                raise estado["erro_start"]
            return {}
        if caminho.endswith("/codespaces"):
            return {"name": "novo-abc"}
        raise AssertionError(caminho)

    monkeypatch.setattr(lc, "github", falso)
    return estado


def cs(nome, estado, repo="Kvsl11/Songbook", usado="2026-11-01T00:00:00Z"):
    return {"name": nome, "state": estado, "repository": {"full_name": repo}, "last_used_at": usado}


def test_sem_token_nao_liga(monkeypatch):
    monkeypatch.delenv("IA_GITHUB_TOKEN", raising=False)
    assert lc.ligar()["estado"] == "sem-token"


def test_desligado_manda_ligar_o_do_endereco(github):
    github["lista"] = [cs("outro-repo", "Shutdown", repo="x/y"), cs("velho", "Shutdown", usado="2026-01-01T00:00:00Z"),
                       cs("upgraded-acorn-5g9r799v6j55c7g7r", "Shutdown", usado="2025-01-01T00:00:00Z")]
    r = lc.ligar("https://upgraded-acorn-5g9r799v6j55c7g7r-7860.app.github.dev")
    assert r == {"estado": "ligando", "nome": "upgraded-acorn-5g9r799v6j55c7g7r",
                 "endereco": "https://upgraded-acorn-5g9r799v6j55c7g7r-7860.app.github.dev"}
    assert ("POST", "/user/codespaces/upgraded-acorn-5g9r799v6j55c7g7r/start") in github["chamadas"]


def test_ligado_e_ligando_nao_mandam_de_novo(github):
    github["lista"] = [cs("a", "Available")]
    assert lc.ligar()["estado"] == "ligado"
    lc._ultimo.update(em=0.0, resposta=None)
    github["lista"] = [cs("a", "Starting")]
    assert lc.ligar()["estado"] == "ligando"
    assert not any(c[1].endswith("/start") for c in github["chamadas"])


def test_sem_codespace_do_projeto_cria_um(github):
    github["lista"] = [cs("de-outro", "Available", repo="x/y")]
    r = lc.ligar()
    assert r["estado"] == "criando" and r["nome"] == "novo-abc"
    assert ("POST", "/repos/Kvsl11/Songbook/codespaces") in github["chamadas"]


def test_sem_cota_e_nao_insiste(github):
    github["lista"] = [cs("a", "Shutdown")]
    github["erro_start"] = lc.ErroGitHub(402, "You have exceeded your Codespaces usage quota")
    assert lc.ligar()["estado"] == "sem-cota"
    n = len(github["chamadas"])
    # (outro aparelho logo depois: a mesma resposta, sem perguntar ao GitHub de novo)
    assert lc.ligar()["estado"] == "sem-cota" and len(github["chamadas"]) == n


def test_uma_consulta_por_minuto(github):
    github["lista"] = [cs("a", "Shutdown")]
    lc.ligar()
    lc.ligar()
    lc.ligar()
    assert sum(1 for c in github["chamadas"] if c[0] == "GET") == 1


def test_erro_qualquer_nao_e_sem_cota(github):
    github["lista"] = [cs("a", "Shutdown")]
    github["erro_start"] = lc.ErroGitHub(500, "Internal error")
    assert lc.ligar()["estado"] == "erro"


def test_rota(monkeypatch, github):
    import app
    from fastapi.testclient import TestClient

    github["lista"] = [cs("a", "Shutdown")]
    r = TestClient(app.app).post("/codespace/ligar", json={"codespace": "a"}).json()
    assert r["estado"] == "ligando" and r["endereco"] == "https://a-7860.app.github.dev"
