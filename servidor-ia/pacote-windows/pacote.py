"""O pacote pronto do servidor para Windows: liga o servidor sem instalar nada (o "Ligar servidor.bat" chama este arquivo).

O pacote é uma pasta com tudo dentro: o Python portátil, os pacotes, os modelos de IA, o ffmpeg e o túnel da
Cloudflare. Ele é montado pelo GitHub (.github/workflows/pacote-windows.yml, montar.py) e publicado em
https://github.com/Kvsl11/Songbook/releases/tag/servidor-windows em partes de até 2 GB:

- Ecoa-Servidor.zip: a parte principal (pequena): o Python, o servidor e os botões. É só ela que se descompacta à mão;
- Ecoa-Servidor-<nome>.zip: as outras (os pacotes, o torch, os modelos, o yt-dlp). Este arquivo as acha na pasta
  Downloads (baixadas pelo navegador) ou as baixa sozinho, e as descompacta no lugar certo.

Cada parte deixa a marca .partes/<nome>.hash (o conteúdo dela) e .partes/<nome>.lista (os arquivos dela): assim se sabe
o que já está aqui e, numa versão nova, só a parte que mudou é trocada (o yt-dlp, que o YouTube obriga a atualizar
sempre, é uma parte pequena só dele).

Ao ligar, com internet: troca as partes que mudaram no GitHub e atualiza o código do servidor (os .py, poucos KB) pela
versão nova do projeto, sem baixar o pacote de novo. Sem internet, liga com o que tem. Só usa a biblioteca padrão do
Python (roda antes de os pacotes estarem aqui).

    ECOA_SEM_ATUALIZAR=1  não procura versão nova (o teste da montagem usa)
"""

from __future__ import annotations

import hashlib
import json
import os
import shutil
import ssl
import sys
import time
import urllib.error
import urllib.request
import zipfile

AQUI = os.path.dirname(os.path.abspath(__file__))
SERVIDOR = os.path.dirname(AQUI)
RAIZ = os.path.dirname(SERVIDOR)
MARCAS = os.path.join(RAIZ, ".partes")
MANIFESTO = os.path.join(RAIZ, "partes.json")
REPO = "Kvsl11/Songbook"
TAG = "servidor-windows"
RELEASE = f"https://github.com/{REPO}/releases/download/{TAG}/"
PAGINA = f"https://github.com/{REPO}/releases/tag/{TAG}"
PREFIXO = "Ecoa-Servidor/"  # a pasta de cima dentro de cada zip
PERGUNTAR_ACIMA = 300 * 1024 * 1024  # atualização maior que isso: pergunta antes de baixar


def contexto() -> ssl.SSLContext:
    """Os certificados do Windows (que já confiam no da rede da empresa), sem a checagem estrita do Python novo."""
    ctx = ssl.create_default_context()
    ctx.verify_flags &= ~getattr(ssl, "VERIFY_X509_STRICT", 0)
    return ctx


def abrir(url: str, tempo: float = 15, cabecalhos: dict | None = None):
    pedido = urllib.request.Request(url, headers={"User-Agent": "ecoa-servidor-windows", **(cabecalhos or {})})
    return urllib.request.urlopen(pedido, timeout=tempo, context=contexto())


def ler_json(url: str, tempo: float = 10):
    with abrir(url, tempo, {"Accept": "application/vnd.github+json"}) as r:
        return json.load(r)


def tamanho(n: float) -> str:
    return f"{n / 1024 ** 3:.1f} GB" if n >= 1024 ** 3 else f"{n / 1024 ** 2:.0f} MB"


def manifesto_local() -> dict:
    try:
        with open(MANIFESTO, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {"partes": []}


def instalada(parte: dict) -> bool:
    try:
        with open(os.path.join(MARCAS, parte["nome"] + ".hash"), encoding="utf-8") as f:
            return f.read().strip() == parte["hash"]
    except OSError:
        return False


def hash_do_zip(arquivo: str, nome: str) -> str:
    """O conteúdo que o zip traz (a marca .hash dentro dele), sem descompactar."""
    try:
        with zipfile.ZipFile(arquivo) as z:
            return z.read(f"{PREFIXO}.partes/{nome}.hash").decode().strip()
    except (OSError, KeyError, zipfile.BadZipFile):
        return ""


def achar_zip(parte: dict) -> str | None:
    """O zip desta parte já baixado pelo navegador: nesta pasta, na de cima ou em Downloads."""
    perfil = os.environ.get("USERPROFILE") or os.path.expanduser("~")
    lugares = [RAIZ, os.path.dirname(RAIZ), os.path.join(perfil, "Downloads"), os.path.join(perfil, "OneDrive", "Downloads")]
    for pasta in dict.fromkeys(lugares):
        arquivo = os.path.join(pasta, parte["arquivo"])
        if os.path.isfile(arquivo) and hash_do_zip(arquivo, parte["nome"]) == parte["hash"]:
            return arquivo
    return None


def baixar(parte: dict) -> str:
    """Baixa a parte do GitHub, continuando de onde parou se a conexão cair."""
    pasta = os.path.join(RAIZ, ".baixando")
    os.makedirs(pasta, exist_ok=True)
    destino = os.path.join(pasta, parte["arquivo"])
    parcial = destino + ".parcial"
    total = parte.get("bytes") or 0
    for tentativa in range(1, 9):
        ja = os.path.getsize(parcial) if os.path.isfile(parcial) else 0
        if total and ja >= total:
            break
        try:
            with abrir(RELEASE + parte["arquivo"], 60, {"Range": f"bytes={ja}-"} if ja else None) as r:
                if ja and r.status != 206:  # o servidor não continuou: começa de novo
                    ja = 0
                with open(parcial, "ab" if ja else "wb") as f:
                    feito, mostrado = ja, -1
                    while True:
                        bloco = r.read(1024 * 1024)
                        if not bloco:
                            break
                        f.write(bloco)
                        feito += len(bloco)
                        pct = int(feito * 100 / total) if total else 0
                        if pct != mostrado and (pct % 5 == 0 or not total):
                            mostrado = pct
                            print(f"\r  {parte['arquivo']}: {tamanho(feito)}" + (f" de {tamanho(total)} ({pct}%)" if total else ""),
                                  end="", flush=True)
            print(flush=True)
            if not total or os.path.getsize(parcial) >= total:
                break
        except (OSError, urllib.error.URLError) as e:
            print(f"\n  A conexão caiu ({e}). Tentando de novo ({tentativa}/8)…", flush=True)
            time.sleep(min(30, 2 ** tentativa))
    else:
        raise RuntimeError(f"não consegui baixar {parte['arquivo']}")
    os.replace(parcial, destino)
    return destino


def descompactar(arquivo: str, parte: dict) -> None:
    """Tira os arquivos da versão antiga desta parte e põe os da nova (a marca .hash por último: se parar no meio, a
    parte fica como não instalada e é refeita da próxima vez)."""
    print(f"  Descompactando {parte['arquivo']}…", flush=True)
    try:
        with open(os.path.join(MARCAS, parte["nome"] + ".lista"), encoding="utf-8") as f:
            antigos = [l.strip() for l in f if l.strip()]
    except OSError:
        antigos = []
    try:
        os.remove(os.path.join(MARCAS, parte["nome"] + ".hash"))
    except OSError:
        pass
    for rel in antigos:
        try:
            os.remove(os.path.join(RAIZ, rel))
        except OSError:
            pass
    with zipfile.ZipFile(arquivo) as z:
        membros = [m for m in z.infolist() if m.filename.startswith(PREFIXO) and not m.is_dir()]
        membros.sort(key=lambda m: m.filename.endswith(".hash"))
        for i, m in enumerate(membros, 1):
            rel = m.filename[len(PREFIXO):]
            destino = os.path.normpath(os.path.join(RAIZ, rel))
            if not destino.startswith(os.path.normpath(RAIZ) + os.sep):
                continue  # (nada fora da pasta do pacote)
            os.makedirs(os.path.dirname(destino), exist_ok=True)
            with z.open(m) as origem, open(destino, "wb") as f:
                shutil.copyfileobj(origem, f, 1024 * 1024)
            if i % 2000 == 0:
                print(f"    {i} de {len(membros)} arquivos", flush=True)


def instalar(partes: list[dict], perguntar: bool) -> bool:
    """Põe aqui as partes que faltam ou mudaram: o zip já baixado pelo navegador ou baixado agora."""
    faltam = [p for p in partes if not p.get("principal") and not instalada(p)]
    if not faltam:
        return True
    achados = {p["nome"]: achar_zip(p) for p in faltam}
    a_baixar = sum(p.get("bytes") or 0 for p in faltam if not achados[p["nome"]])
    if perguntar and a_baixar > PERGUNTAR_ACIMA:
        resp = input(f"Há uma versão nova dos pacotes ({tamanho(a_baixar)}). Baixar agora? [S/n] ").strip().lower()
        if resp.startswith("n"):
            return False
    for p in faltam:
        arquivo = achados[p["nome"]]
        if not arquivo:
            print(f"Baixando {p['arquivo']} ({tamanho(p.get('bytes') or 0)})…", flush=True)
            arquivo = baixar(p)
        descompactar(arquivo, p)
        if os.path.dirname(arquivo) == os.path.join(RAIZ, ".baixando"):
            os.remove(arquivo)
    shutil.rmtree(os.path.join(RAIZ, ".baixando"), ignore_errors=True)
    return True


def blob_sha(caminho: str) -> str:
    """O "sha" que o GitHub dá a um arquivo (o do git), para saber se o daqui é igual sem baixar."""
    with open(caminho, "rb") as f:
        dados = f.read()
    return hashlib.sha1(b"blob %d\0" % len(dados) + dados).hexdigest()


def atualizar_codigo(manifesto: dict) -> None:
    """Os .py do servidor na versão nova do projeto (só os que mudaram). Quando os pacotes do servidor mudaram
    (requirements.txt), espera o pacote novo: o código novo pode precisar de um pacote que ainda não está aqui."""
    repo = ler_json(f"https://api.github.com/repos/{REPO}")
    ramo = repo.get("default_branch") or "main"
    trocados = 0
    for sub, local in (("servidor-ia", SERVIDOR), ("servidor-ia/pacote-windows", AQUI)):
        itens = ler_json(f"https://api.github.com/repos/{REPO}/contents/{sub}?ref={ramo}")
        if sub == "servidor-ia":
            req = next((i for i in itens if i.get("name") == "requirements.txt"), None)
            if req and manifesto.get("requisitos") and req.get("sha") != manifesto["requisitos"]:
                print("Os pacotes do servidor mudaram: o código novo vem junto com o pacote novo (em breve).", flush=True)
                return
        for item in itens:
            nome = item.get("name") or ""
            if item.get("type") != "file" or not nome.endswith(".py") or not item.get("download_url"):
                continue
            destino = os.path.join(local, nome)
            if os.path.isfile(destino) and blob_sha(destino) == item.get("sha"):
                continue
            with abrir(item["download_url"], 20) as r:
                dados = r.read()
            with open(destino + ".novo", "wb") as f:
                f.write(dados)
            os.replace(destino + ".novo", destino)
            trocados += 1
    if trocados:
        print(f"Servidor atualizado ({trocados} arquivo(s) novo(s)).", flush=True)


def procurar_versao_nova(manifesto: dict) -> dict:
    """O manifesto publicado: as partes que mudaram vêm agora (o yt-dlp quase sempre é só alguns MB)."""
    try:
        novo = ler_json(RELEASE + "partes.json")
    except Exception:
        return manifesto  # (sem internet, ou o GitHub publicando agora: fica com o que tem)
    if novo.get("hash") == manifesto.get("hash"):
        return manifesto
    if not instalar(novo.get("partes", []), perguntar=True):
        return manifesto
    with open(MANIFESTO + ".novo", "w", encoding="utf-8") as f:
        json.dump(novo, f, ensure_ascii=False, indent=1)
    os.replace(MANIFESTO + ".novo", MANIFESTO)
    print(f"Pacote atualizado para a versão {novo.get('versao', '?')}.", flush=True)
    return novo


def main() -> None:
    manifesto = manifesto_local()
    if not manifesto.get("partes"):
        sys.exit("Não achei o partes.json. Descompacte o Ecoa-Servidor.zip inteiro e rode de novo.")
    faltando = [p for p in manifesto["partes"] if not p.get("principal") and not instalada(p)]
    if faltando:
        total = sum(p.get("bytes") or 0 for p in faltando if not achar_zip(p))
        print("Primeira vez: montando o servidor (só desta vez).", flush=True)
        if total:
            print(f"Vou baixar {tamanho(total)} do GitHub. Se preferir baixar pelo navegador, baixe os arquivos de\n"
                  f"{PAGINA}\npara a pasta Downloads e rode de novo (eu acho eles lá).\n", flush=True)
        instalar(manifesto["partes"], perguntar=False)
        print("Pronto: servidor montado.\n", flush=True)
    if not os.environ.get("ECOA_SEM_ATUALIZAR"):
        try:
            manifesto = procurar_versao_nova(manifesto)
        except Exception as e:
            print(f"Aviso: não consegui atualizar os pacotes ({e}). Ligando com o que tenho.", flush=True)
        try:
            atualizar_codigo(manifesto)
        except Exception as e:
            print(f"Aviso: não consegui procurar o código novo ({type(e).__name__}). Ligando com o que tenho.", flush=True)
    # os programas que vêm nos pacotes ficam ao alcance: o deno, que o yt-dlp usa para o YouTube (o executável de
    # verdade, dentro do pacote dele: os atalhos de python\Scripts guardam o caminho da máquina onde o pacote foi montado)
    pastas = []
    site = os.path.join(RAIZ, "python", "Lib", "site-packages")
    for pasta, _, arquivos in os.walk(os.path.join(site, "deno")):
        if "deno.exe" in arquivos or "deno" in arquivos:
            pastas.append(pasta)
    os.environ["PATH"] = os.pathsep.join(pastas + [os.path.join(RAIZ, "python", "Scripts"), os.environ.get("PATH", "")])
    sys.path.insert(0, SERVIDOR)
    import iniciar_pc  # noqa: E402 (depois da atualização: carrega o código novo)

    iniciar_pc.main()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        pass
    except SystemExit:
        raise
    except Exception as e:
        print(f"\nDeu erro: {e}\nRode de novo (ele continua de onde parou). Se não resolver, mande um print desta janela.")
        sys.exit(1)
