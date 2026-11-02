import os
import sys
from types import SimpleNamespace as NS

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import duvidas  # noqa: E402
from duvidas import Indice, Trecho, palavras, pedacos  # noqa: E402


def test_palavras_sem_acento_e_sem_vazias():
    assert palavras("Qual a função do cantor na comunhão? 2º domingo") == ["funcao", "cantor", "comunhao", "2", "domingo"]


def test_busca_acha_o_trecho_certo():
    ix = Indice([Trecho("Salmo 23", "x", "O Senhor é o pastor que me conduz"),
                 Trecho("Comunhão", "y", "O canto de comunhão acompanha a procissão dos fiéis"),
                 Trecho("Entrada", "z", "Canto de entrada abre a celebração")])
    assert ix.buscar("o que acompanha a procissão da comunhão")[0][1].titulo == "Comunhão"


def test_pedacos_cobrem_o_texto():
    texto = "\n".join(f"linha {i} " * 10 for i in range(100))
    ps = pedacos(texto)
    assert len(ps) > 3 and ps[0].startswith("linha 0") and ps[-1].endswith(texto[-20:].strip())


def test_responder_usa_o_acervo_e_devolve_as_fontes(monkeypatch):
    ix = Indice([Trecho("Guia do salmista", "Subsídios", "O salmista canta o salmo do ambão", "id1", "documento")])
    monkeypatch.setattr(duvidas, "indice", lambda: ix)
    pedidos = []

    class Cliente:
        def __init__(self):
            self.beta = NS(messages=NS(create=self.create))

        def create(self, **kw):
            pedidos.append(kw)
            return NS(stop_reason="end_turn", content=[NS(type="text", text="Do ambão [1].", citations=None)])

    import anthropic
    monkeypatch.setattr(anthropic, "Anthropic", Cliente)
    r = duvidas.responder("onde o salmista canta?", contexto="Hoje: 22/10/2026\nSalmo do dia: Sl 32")
    assert r["resposta"] == "Do ambão [1]." and r["fontes"][0]["id"] == "id1" and not r["usouWeb"]
    kw = pedidos[0]
    assert kw["model"] == "claude-sonnet-5-5" and kw["fallbacks"] == "default"
    assert "Guia do salmista" in kw["messages"][-1]["content"]
    # o que está no app (liturgia do dia, biblioteca) vai junto, antes do acervo
    assert "<app>\nHoje: 22/10/2026\nSalmo do dia: Sl 32\n</app>" in kw["messages"][-1]["content"]
    assert kw["tools"][0]["type"] == "web_search_20260209"


def test_provedor_escolhe_a_ia_pela_chave(monkeypatch):
    for k in ("ANTHROPIC_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY", "IA_PROVEDOR"):
        monkeypatch.delenv(k, raising=False)
    assert duvidas.provedor() is None
    monkeypatch.setenv("GEMINI_API_KEY", "g")
    assert duvidas.provedor() == "gemini"
    monkeypatch.setenv("ANTHROPIC_API_KEY", "a")
    assert duvidas.provedor() == "claude"
    monkeypatch.setenv("IA_PROVEDOR", "gemini")
    assert duvidas.provedor() == "gemini"


def test_responder_pelo_gemini_com_as_fontes_da_busca(monkeypatch):
    import io
    import json
    import urllib.request

    for k in ("ANTHROPIC_API_KEY", "IA_PROVEDOR"):
        monkeypatch.delenv(k, raising=False)
    monkeypatch.setenv("GEMINI_API_KEY", "g")
    ix = Indice([Trecho("Guia do salmista", "Subsídios", "O salmista canta o salmo do ambão", "id1", "documento")])
    monkeypatch.setattr(duvidas, "indice", lambda: ix)
    pedidos = []

    class Resposta(io.BytesIO):
        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False

    def abrir(pedido, timeout=0):
        pedidos.append(json.loads(pedido.data))
        return Resposta(json.dumps({"candidates": [{"content": {"parts": [{"text": "Do ambão [1]."}]},
                                                    "groundingMetadata": {"webSearchQueries": ["salmista"],
                                                                          "groundingChunks": [{"web": {"uri": "https://cnbb.org.br", "title": "CNBB"}}]}}]}).encode())

    monkeypatch.setattr(urllib.request, "urlopen", abrir)
    r = duvidas.responder("onde o salmista canta?", voz=True)
    assert r["resposta"] == "Do ambão [1]." and r["fontes"][0]["id"] == "id1" and r["usouWeb"]
    assert r["web"] == [{"titulo": "CNBB", "url": "https://cnbb.org.br"}]
    corpo = pedidos[0]
    assert corpo["tools"] == [{"google_search": {}}]
    # na conversa ao vivo a resposta é falada: o pedido diz para ser curta
    assert "LIDA EM VOZ ALTA" in corpo["system_instruction"]["parts"][0]["text"]


def test_falar_limpa_o_texto_para_a_voz():
    import falar

    assert falar.limpar("**Salmo 22** [1]\n- O Senhor é meu pastor\nVeja https://cnbb.org.br") == "Salmo 22 O Senhor é meu pastor Veja"
