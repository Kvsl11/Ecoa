"""O pacote pronto para Windows: as partes saem do montar.py e o pacote.py as põe no lugar (sem o Windows nem a
internet: o Python, os pacotes e os modelos são de mentira)."""

import importlib
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "pacote-windows"))

import montar  # noqa: E402


def escrever(raiz, rel, texto):
    caminho = os.path.join(raiz, rel)
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(texto)


def pacote_de_mentira(raiz, versao_ytdlp="1"):
    escrever(raiz, "python/python.exe", "py")
    escrever(raiz, "servidor/app.py", "app")
    escrever(raiz, "Ligar servidor.bat", "bat")
    escrever(raiz, "python/Lib/site-packages/yt_dlp/__init__.py", "yt " + versao_ytdlp)
    escrever(raiz, f"python/Lib/site-packages/yt_dlp-{versao_ytdlp}.dist-info/METADATA", "meta")
    escrever(raiz, "python/Lib/site-packages/torch/__init__.py", "torch")
    escrever(raiz, "python/Lib/site-packages/numpy/__init__.py", "numpy")
    escrever(raiz, "python/Scripts/deno.exe", "deno")
    escrever(raiz, "modelos/torch/hub/htdemucs.th", "modelo")


def montar_em(tmp, nome, versao_ytdlp="1"):
    raiz = os.path.join(tmp, nome, "Ecoa-Servidor")
    pacote_de_mentira(raiz, versao_ytdlp)
    saida = os.path.join(tmp, nome + "-zips")
    montar.zipar(raiz, saida, montar.dividir(raiz))
    with open(os.path.join(saida, "partes.json"), encoding="utf-8") as f:
        return saida, json.load(f)


def test_partes_agrupam_o_que_muda_junto(tmp_path):
    raiz = os.path.join(tmp_path, "Ecoa-Servidor")
    pacote_de_mentira(raiz)
    partes = {p["nome"]: p["arquivos"] for p in montar.dividir(raiz)}
    assert set(partes) == {"principal", "yt-dlp", "pacotes", "torch", "modelos"}
    assert "python/python.exe" in partes["principal"] and "servidor/app.py" in partes["principal"]
    assert len(partes["yt-dlp"]) == 2
    assert "python/Scripts/deno.exe" in partes["pacotes"]


def test_parte_grande_e_dividida(tmp_path, monkeypatch):
    raiz = os.path.join(tmp_path, "Ecoa-Servidor")
    pacote_de_mentira(raiz)
    for i in range(3):
        escrever(raiz, f"modelos/m{i}.bin", "x" * 100)
    monkeypatch.setattr(montar, "LIMITE", 150)
    nomes = [p["nome"] for p in montar.dividir(raiz)]
    assert [n for n in nomes if n.startswith("modelos")] == ["modelos-1", "modelos-2", "modelos-3"]


def test_primeira_vez_e_atualizacao_so_da_parte_que_mudou(tmp_path, monkeypatch):
    zips1, manifesto1 = montar_em(tmp_path, "v1")
    zips2, manifesto2 = montar_em(tmp_path, "v2", versao_ytdlp="2")
    hashes1 = {p["nome"]: p["hash"] for p in manifesto1["partes"]}
    mudou = [p["nome"] for p in manifesto2["partes"] if p["hash"] != hashes1[p["nome"]]]
    assert mudou == ["yt-dlp"]

    # quem usa descompacta só a principal; as outras estão em Downloads (baixadas pelo navegador)
    import zipfile

    casa = os.path.join(tmp_path, "casa")
    downloads = os.path.join(casa, "Downloads")
    os.makedirs(downloads)
    for p in manifesto1["partes"]:
        if not p["principal"]:
            os.rename(os.path.join(zips1, p["arquivo"]), os.path.join(downloads, p["arquivo"]))
    with zipfile.ZipFile(os.path.join(zips1, "Ecoa-Servidor.zip")) as z:
        z.extractall(os.path.join(casa, "Documentos"))
    raiz = os.path.join(casa, "Documentos", "Ecoa-Servidor")
    assert not os.path.exists(os.path.join(raiz, "modelos"))

    monkeypatch.setenv("USERPROFILE", casa)
    escrever(raiz, "servidor/pacote-windows/x", "")
    import pacote

    monkeypatch.setattr(pacote, "RAIZ", raiz)
    monkeypatch.setattr(pacote, "MARCAS", os.path.join(raiz, ".partes"))
    monkeypatch.setattr(pacote, "MANIFESTO", os.path.join(raiz, "partes.json"))
    manifesto = pacote.manifesto_local()
    assert pacote.instalar(manifesto["partes"], perguntar=False)
    with open(os.path.join(raiz, "python/Lib/site-packages/yt_dlp/__init__.py"), encoding="utf-8") as f:
        assert f.read() == "yt 1"
    assert os.path.isfile(os.path.join(raiz, "modelos/torch/hub/htdemucs.th"))
    assert all(pacote.instalada(p) for p in manifesto["partes"] if not p["principal"])

    # versão nova publicada: só o yt-dlp é baixado; o arquivo da versão antiga sai
    baixados = []

    def baixar(parte):
        baixados.append(parte["nome"])
        return os.path.join(zips2, parte["arquivo"])

    monkeypatch.setattr(pacote, "baixar", baixar)
    monkeypatch.setattr(pacote, "ler_json", lambda url, tempo=10: manifesto2)
    novo = pacote.procurar_versao_nova(manifesto)
    assert baixados == ["yt-dlp"] and novo["hash"] == manifesto2["hash"]
    site = os.path.join(raiz, "python/Lib/site-packages")
    assert os.path.isfile(os.path.join(site, "yt_dlp-2.dist-info/METADATA"))
    assert not os.path.exists(os.path.join(site, "yt_dlp-1.dist-info/METADATA"))
    assert pacote.manifesto_local()["hash"] == manifesto2["hash"]
    # (de novo: nada a fazer)
    baixados.clear()
    pacote.procurar_versao_nova(pacote.manifesto_local())
    assert baixados == []
    importlib.reload(pacote)


def test_blob_sha_igual_ao_do_git(tmp_path):
    import pacote

    caminho = os.path.join(tmp_path, "a.txt")
    with open(caminho, "wb") as f:
        f.write(b"oi\n")
    # git hash-object a.txt
    assert pacote.blob_sha(caminho) == "c09fc3cf1b3b73ae5210ed9a224034a409287dd4"
