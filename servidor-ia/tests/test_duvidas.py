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


def test_busca_entende_a_conversa_e_os_sinonimos(monkeypatch):
    ix = Indice([Trecho("RITUAL DO MATRIMÔNIO - CNBB.pdf", "COLETÂNEA RITUAIS CNBB", "COLETÂNEA RITUAIS CNBB / RITUAL DO MATRIMÔNIO - CNBB.pdf", "m1", "arquivo"),
                 Trecho("Glória", "x", "Glória a Deus nas alturas", "g1", "canto"),
                 Trecho("Ritual de Bênçãos", "y", "Bênção de objetos", "b1", "arquivo")])
    monkeypatch.setattr(duvidas, "indice", lambda: ix)
    q = "Preciso que você me diga se tem algo no acervo referente a casamento"
    assert palavras(q) == ["casamento"]
    achados = duvidas.buscar_trechos(q)
    assert achados and achados[0]["titulo"].startswith("RITUAL DO MATRIMÔNIO")


def test_anexo_vai_para_a_ia_e_o_texto_sai_sem_ia(monkeypatch):
    import base64
    import json as _json

    assert duvidas.texto_do_anexo("roteiro.txt", "text/plain", "Salmo 127".encode()) == "Salmo 127"
    assert duvidas.texto_do_anexo("foto.jpg", "image/jpeg", b"\xff\xd8") == ""
    enviado = {}

    class Resp:
        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False

        def read(self):
            return _json.dumps({"candidates": [{"content": {"parts": [{"text": "É o Salmo 127."}]}}]}).encode()

    def abrir(pedido, timeout=0):
        enviado.update(_json.loads(pedido.data))
        return Resp()

    import urllib.request
    monkeypatch.setattr(urllib.request, "urlopen", abrir)
    monkeypatch.setenv("GEMINI_API_KEY", "x")
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.setattr(duvidas, "indice", lambda: Indice([]))
    r = duvidas.responder("qual o salmo?", anexos=[{"nome": "foto.jpg", "tipo": "image/jpeg", "dados": base64.b64encode(b"\xff\xd8").decode()}])
    assert r["resposta"] == "É o Salmo 127."
    assert enviado["contents"][-1]["parts"][0]["inline_data"]["mime_type"] == "image/jpeg"


def test_texto_do_pdf_limpo_e_o_pdf_do_acervo_para_a_ia(monkeypatch):
    sujo = "A cele-\nbração do matri-\nmônio começa\ncom a acolhida dos noivos.\n12\nRITOS INICIAIS"
    assert duvidas.limpar_texto_pdf(sujo) == "A celebração do matrimônio começa com a acolhida dos noivos.\nRITOS INICIAIS"
    achados = [(9.0, Trecho("O casal foi unido por Deus.pdf", "OUTROS SUBSÍDIOS DE MÚSICA LITÚRGICA/0. Cantos de Comunhão", "x", "c1", "arquivo")),
               (8.0, Trecho("RITUAL DO MATRIMÔNIO - CNBB.pdf", "COLETÂNEA RITUAIS CNBB", "x", "m1", "arquivo"))]
    k, t = duvidas.pdf_do_acervo("qual a estrutura da cerimônia de um casamento católico", achados)
    assert (k, t.id) == (2, "m1")
    assert duvidas.pdf_do_acervo("o que é liturgia", achados) is None


def test_o_genero_da_voz_vai_para_a_ia():
    assert "A Lumen" in duvidas.sistema_do_genero("feminina")
    assert "O Lumen" in duvidas.sistema_do_genero("masculina")


def test_escolhe_o_flash_mais_novo_e_troca_quando_um_sumiu(monkeypatch):
    import json as _json
    import urllib.error
    import urllib.request

    gera = ["generateContent"]
    lista = {"models": [{"name": f"models/{n}", "supportedGenerationMethods": gera} for n in
                        ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.8-flash-preview",
                         "gemini-3.8-flash-tts", "gemini-embedding-001"]]}
    monkeypatch.setattr(duvidas, "_modelos", {"em": 0.0, "lista": []})
    monkeypatch.setattr(duvidas, "_modelo_bom", {})
    monkeypatch.setattr(duvidas, "MODELO_GEMINI", "")
    monkeypatch.setenv("GEMINI_API_KEY", "x")
    pedidos = []

    class Resp:
        def __init__(self, corpo):
            self.corpo = corpo

        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False

        def read(self):
            return _json.dumps(self.corpo).encode()

    def abrir(pedido, timeout=0):
        url = pedido.full_url if hasattr(pedido, "full_url") else pedido
        if "/models?" in url:
            return Resp(lista)
        pedidos.append(url.split("/models/")[1].split(":")[0])
        if "gemini-3.5-flash:" in url:  # o primeiro sumiu (404): vai para o próximo
            raise urllib.error.HTTPError(url, 404, "não existe", {}, None)
        return Resp({"candidates": [{"content": {"parts": [{"text": "ok"}]}}]})

    monkeypatch.setattr(urllib.request, "urlopen", abrir)
    assert duvidas.candidatos_gemini("texto")[:3] == ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-3.8-flash-preview"]
    assert duvidas.candidatos_gemini("voz")[0] == "gemini-3.8-flash-tts"
    dados, modelo = duvidas.chamar_gemini({"contents": []})
    assert modelo == "gemini-2.5-flash" and pedidos == ["gemini-3.5-flash", "gemini-2.5-flash"]


def test_wav_do_audio_do_gemini():
    import falar

    w = falar.wav(b"\x00\x01" * 10)
    assert w[:4] == b"RIFF" and w[8:12] == b"WAVE" and len(w) == 44 + 20
