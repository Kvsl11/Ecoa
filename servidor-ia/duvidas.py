"""Tirar dúvidas (como o NotebookLM): a pergunta é respondida primeiro pelos arquivos do acervo litúrgico (os do
Google Drive que o app já leu) e, se eles não trazem a resposta, por uma busca na internet.

1. busca: os trechos do acervo que mais têm as palavras da pergunta (BM25, sem acentos, sem as palavras vazias);
2. resposta: o Claude lê esses trechos e responde em português, citando os arquivos [1], [2]…; se os trechos não
   bastam, ele busca na web (ferramenta de busca do próprio Claude) e diz que a resposta veio de lá.

Os textos vêm de public/data (cantos.json, hinario.json, acervo.json: letras, títulos, pastas) e, quando existe, de
textos-acervo.jsonl (o texto inteiro dos PDFs do acervo: python indexar_acervo.py).
Precisa de uma chave de IA: ANTHROPIC_API_KEY (o Claude, o padrão) ou GEMINI_API_KEY (o Gemini, com a busca do
Google). Com as duas, vale o Claude (IA_PROVEDOR=gemini troca).
"""

from __future__ import annotations

import json
import math
import os
import re
import threading
import unicodedata
from collections import Counter
from dataclasses import dataclass

PASTA = os.path.dirname(os.path.abspath(__file__))
DADOS = os.environ.get("IA_DADOS") or os.path.join(PASTA, "..", "public", "data")
TEXTOS = os.environ.get("IA_TEXTOS") or os.path.join(PASTA, "textos-acervo.jsonl")
# o Sonnet: responde bem citando o acervo, por uma fração do preço do Opus (dá para trocar com IA_MODELO)
MODELO = os.environ.get("IA_MODELO", "claude-sonnet-5-5")
# o Gemini 3.6 Flash, o escolhido para o Lumen (IA_GEMINI_MODELO troca; vazio = o Flash da versão mais alta). Se ele
# não responder, o servidor tenta os outros Flash que a chave pode usar, do mais novo para o mais velho (o nome fixo
# de antes, gemini-2.5-flash, foi desligado pelo Google e o Lumen ficou sem IA)
MODELO_GEMINI = os.environ.get("IA_GEMINI_MODELO", "gemini-3.6-flash")
API_GEMINI = "https://generativelanguage.googleapis.com/v1beta"


def chave_gemini() -> str:
    return os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or ""


def provedor() -> str | None:
    """Qual IA responde: "claude", "gemini" ou None (sem chave nenhuma)."""
    tem_claude, tem_gemini = bool(os.environ.get("ANTHROPIC_API_KEY")), bool(chave_gemini())
    if tem_gemini and (not tem_claude or os.environ.get("IA_PROVEDOR", "").lower() == "gemini"):
        return "gemini"
    return "claude" if tem_claude else None
# sem a pasta public/data ao lado (o servidor publicado sozinho, no Modal): os mesmos arquivos, do app no ar
DADOS_URL = os.environ.get("IA_DADOS_URL", "https://kvsl11.github.io/Songbook/data/")

VAZIAS = set("""a o e os as um uma uns umas de do da dos das no na nos nas em por para pra com sem que se ao aos à às
é ser foi são era como mais mas ou eu tu ele ela nós vós eles elas me te lhe nos vos seu sua seus suas meu minha
qual quais quando onde quem porque porquê isso isto esse essa este esta aquele aquela num numa pelo pela pelos pelas
ja já tem ter há sobre entre até também muito muita qual hora vez
preciso precisa precisava quero queria gostaria voce você vc voces vocês diga dizer diz fala falar fale algo alguma
coisa coisas referente referentes respeito relacionado relacionada relacionados acerca acervo arquivos arquivo
documentos saber sabe sei encontre encontrar encontra ache achar acha procure procurar procura busque buscar busca
traga trazer traz mostre mostrar mostra poderia poderiam consegue conseguir favor lumen ai aí entao então tipo assim
ne né mim nosso nossa nossos nossas la lá aqui ali tudo todo toda todos todas existe existem tenho temos tinha
oi ola olá bom boa dia tarde noite obrigado obrigada gentileza""".split())

# os sinônimos do assunto: "casamento" acha o Ritual do Matrimônio, "enterro" as exéquias (o mesmo do app)
SINONIMOS = [
    "casamento casamentos matrimonio nupcias nupcial noivos noiva casal esponsais bodas",
    "batismo batizado batizar batismal",
    "crisma confirmacao crismandos",
    "enterro funeral velorio exequias defuntos falecidos finados sepultamento",
    "comunhao eucaristia eucaristica eucaristico",
    "salmo salmos salmista responsorial",
    "canto cantos musica musicas hino hinos cancao cancoes",
    "natal natalino nascimento",
    "pascoa pascal ressurreicao",
    "quaresma quaresmal cinzas",
    "ofertorio oferendas ofertas",
    "final envio saida despedida",
    "penitencia confissao reconciliacao",
    "uncao enfermos doentes",
    "ordenacao sacerdotal diaconal",
    "partitura partituras notacao cifra cifras",
]
_SINONIMO: dict[str, set[str]] = {}
for _g in SINONIMOS:
    _ps = set(_g.split())
    for _p in _ps:
        _SINONIMO.setdefault(_p, set()).update(_ps)


def normalizar(texto: str) -> str:
    s = unicodedata.normalize("NFD", texto.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def palavras(texto: str) -> list[str]:
    return [p for p in re.findall(r"[a-z0-9]+", normalizar(texto)) if (len(p) > 1 or p.isdigit()) and p not in VAZIAS]


def sem_cifra(chordpro: str) -> str:
    linhas = []
    for l in chordpro.splitlines():
        d = re.match(r"^\s*\{\s*(\w+)\s*:\s*(.*?)\s*\}\s*$", l)
        if d:
            if d.group(1) in ("title", "subtitle", "artist", "comment", "c"):
                linhas.append(d.group(2))
            continue
        linhas.append(re.sub(r"\[[^\]]*\]", "", l))
    return re.sub(r"\n{3,}", "\n\n", "\n".join(linhas)).strip()


@dataclass
class Trecho:
    titulo: str
    caminho: str
    texto: str
    id: str = ""  # o arquivo no Drive
    tipo: str = "acervo"


def pedacos(texto: str, tamanho: int = 1200, sobra: int = 200) -> list[str]:
    """O texto em pedaços de ~1200 letras (quebrando em parágrafo), com um pouco do anterior para não cortar a ideia."""
    if len(texto) <= tamanho:
        return [texto]
    out, ini = [], 0
    while ini < len(texto):
        fim = min(len(texto), ini + tamanho)
        quebra = texto.rfind("\n", ini + tamanho // 2, fim)
        if fim < len(texto) and quebra > 0:
            fim = quebra
        out.append(texto[ini:fim].strip())
        if fim >= len(texto):
            break
        ini = max(fim - sobra, ini + 1)
    return [p for p in out if p]


def _ler_dados(nome: str):
    caminho = os.path.join(DADOS, nome)
    if os.path.isfile(caminho):
        return json.load(open(caminho, encoding="utf-8"))
    import urllib.request

    try:
        with urllib.request.urlopen(DADOS_URL + nome, timeout=60) as r:
            return json.loads(r.read().decode("utf-8"))
    except Exception as e:  # sem internet ou endereço errado: fica sem esses textos
        raise FileNotFoundError(nome) from e


def limpar_texto_pdf(texto: str) -> str:
    """O texto tirado do PDF arrumado: a palavra cortada no fim da linha volta inteira ("cele-\nbração"), a linha
    quebrada no meio da frase vira uma linha só, os espaços repetidos somem e os números de página soltos saem."""
    t = (texto or "").replace("\r", "\n").replace("\u00ad", "")
    t = re.sub(r"(\w)-\n\s*(\w)", r"\1\2", t)
    t = re.sub(r"[ \t\f\v]+", " ", t)
    t = re.sub(r"(?m)^[ \t]*\d{1,4}[ \t]*(\n|$)", "", t)  # número de página sozinho na linha
    # a quebra no meio da frase (a linha seguinte começa minúscula ou a anterior não termina a frase)
    t = re.sub(r"(?<![.!?:;])\s*\n\s*(?=[a-zà-ú0-9(\"“])", " ", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return re.sub(r" *\n *", "\n", t).strip()


def _frase_boa(f: str) -> bool:
    """Frase que dá para ler em voz alta: com tamanho de frase e que não é um título em maiúsculas."""
    letras = [c for c in f if c.isalpha()]
    return len(f) >= 30 and len(letras) >= 20 and sum(c.isupper() for c in letras) / len(letras) < 0.5


def carregar_trechos() -> list[Trecho]:
    trechos: list[Trecho] = []
    ler = _ler_dados
    try:
        for c in ler("cantos.json")["cantos"]:
            caminho = " / ".join(c.get("caminho") or [])
            texto = sem_cifra(c.get("chordpro") or "")
            for p in pedacos(texto):
                trechos.append(Trecho(c.get("titulo") or c.get("arquivo", ""), f"{caminho} / {c.get('arquivo', '')}", p,
                                      c.get("id", ""), "canto"))
    except FileNotFoundError:
        pass
    try:
        for cad in ler("hinario.json")["cadernos"]:
            for c in cad.get("cantos", []):
                texto = f"{c.get('parte', '')}\n{sem_cifra(c.get('chordpro') or '')}"
                trechos.append(Trecho(c.get("titulo", ""), f"Hinário Litúrgico CNBB / {cad.get('nome', '')}", texto,
                                      cad.get("id", ""), "hinario"))
    except FileNotFoundError:
        pass
    try:
        acervo = ler("acervo.json")
        pastas = acervo.get("pastas", [])
        # os nomes dos arquivos e das pastas também respondem ("tem canto de comunhão para o Advento?")
        for nome, ip, fid, tipo in acervo.get("itens", []):
            if tipo == "pasta":
                continue
            pasta = pastas[ip] if isinstance(ip, int) and ip < len(pastas) else ""
            trechos.append(Trecho(nome, pasta, f"{pasta} / {nome}", fid, "arquivo"))
    except FileNotFoundError:
        pass
    if os.path.isfile(TEXTOS):
        with open(TEXTOS, encoding="utf-8") as f:
            for linha in f:
                d = json.loads(linha)
                for p in pedacos(limpar_texto_pdf(d.get("texto", ""))):
                    trechos.append(Trecho(d.get("titulo", ""), d.get("caminho", ""), p, d.get("id", ""), "documento"))
    return trechos


class Indice:
    """BM25: pesa a palavra rara (que diz mais sobre o trecho) acima da comum; trecho longo não ganha só por ser longo."""

    def __init__(self, trechos: list[Trecho], k1: float = 1.4, b: float = 0.75):
        self.trechos = trechos
        self.k1, self.b = k1, b
        self.contas = [Counter(palavras(f"{t.titulo} {t.titulo} {t.texto}")) for t in trechos]
        self.tam = [sum(c.values()) for c in self.contas]
        self.media = (sum(self.tam) / len(self.tam)) if self.tam else 1.0
        df: Counter = Counter()
        for c in self.contas:
            df.update(c.keys())
        n = len(trechos)
        self.idf = {p: math.log(1 + (n - d + 0.5) / (d + 0.5)) for p, d in df.items()}

    def buscar(self, pergunta: str, quantos: int = 8) -> list[tuple[float, Trecho]]:
        # cada palavra da pergunta vale pela melhor forma achada: ela mesma ou um sinônimo (este um pouco menos)
        grupos, vistos_p = [], set()
        for p in palavras(pergunta):
            if p in vistos_p:
                continue
            g = [p] + sorted(_SINONIMO.get(p, set()) - {p})
            vistos_p.update(g)
            grupos.append(g)
        notas = []
        for i, c in enumerate(self.contas):
            s = 0.0
            for g in grupos:
                melhor = 0.0
                for k, p in enumerate(g):
                    f = c.get(p)
                    if f:
                        v = self.idf[p] * f * (self.k1 + 1) / (f + self.k1 * (1 - self.b + self.b * self.tam[i] / self.media))
                        melhor = max(melhor, v * (0.85 if k else 1.0))
                s += melhor
            if s > 0:
                notas.append((s, i))
        notas.sort(reverse=True)
        vistos, out = set(), []
        for s, i in notas:
            t = self.trechos[i]
            chave = (t.id, t.texto[:80])
            if chave in vistos:
                continue
            vistos.add(chave)
            out.append((s, t))
            if len(out) >= quantos:
                break
        return out


_trava = threading.Lock()
_indice: Indice | None = None


def indice() -> Indice:
    global _indice
    with _trava:
        if _indice is None:
            _indice = Indice(carregar_trechos())
        return _indice


def buscar_trechos(pergunta: str, quantos: int = 8) -> list[dict]:
    """A busca no acervo inteiro (letras, Hinário, nomes dos arquivos e o texto dos PDFs), sem IA: o Lumen usa quando o
    servidor não tem a chave da IA. Cada achado vem com as frases que mais respondem."""
    pergunta = (pergunta or "").strip()[:1000]
    if not palavras(pergunta):
        return []
    termos = set(palavras(pergunta))
    for p in list(termos):
        termos |= _SINONIMO.get(p, set())
    out = []
    for nota, t in indice().buscar(pergunta, quantos * 2):
        texto = limpar_texto_pdf(t.texto) if t.tipo == "documento" else t.texto
        frases = [f.strip() for f in re.split(r"(?<=[.!?;])\s+|\n+", texto) if len(f.strip()) > 3]
        if t.tipo == "documento":
            frases = [f for f in frases if _frase_boa(f)]
        boas = sorted(((len(set(palavras(f)) & termos), i, f) for i, f in enumerate(frases)), key=lambda x: (-x[0], x[1]))
        escolhidas = [f for n, i, f in sorted((b for b in boas[:3] if b[0] > 0), key=lambda x: x[1])]
        out.append({"titulo": t.titulo, "caminho": t.caminho, "id": t.id, "tipo": t.tipo, "nota": round(nota, 3),
                    "frases": [f[:400] for f in escolhidas] or [t.texto[:300]]})
        if len(out) >= quantos:
            break
    return out


SISTEMA = """Você é o Lumen, o assistente do app Songbook Litúrgico inteiro: as músicas da biblioteca, os repertórios, o \
player, a liturgia, o acervo litúrgico e o que mais a pessoa precisar (e a internet, quando o app não tem). Você ajuda \
ministérios de música católica (cantores, instrumentistas, equipes de liturgia) com liturgia, canto litúrgico, a \
missa e o próprio app. \
Responda em português do Brasil, claro e direto, como quem explica para o grupo antes do ensaio. Use listas curtas \
quando ajudarem; nada de enrolação.

A mensagem pode trazer, em <app>, o que está no app de quem pergunta: a data de hoje, a liturgia do dia pedido \
(CNBB), as músicas da biblioteca e os repertórios. Use isso para responder sobre "hoje", "domingo", "minhas \
músicas", "meu repertório" etc.

Primeiro use os trechos do acervo litúrgico do grupo que vêm na mensagem (arquivos do Google Drive: hinários e \
subsídios da CNBB, cantos, documentos). Cite cada informação tirada deles com o número do trecho entre colchetes, \
como [2]. Se os trechos não respondem à pergunta (ou só em parte), use a busca na web, prefira fontes da Igreja \
(CNBB, Vaticano, Instrução Geral do Missal Romano, documentos litúrgicos) e diga com clareza que essa parte veio da \
internet. Os trechos também trazem os NOMES dos arquivos e das pastas do acervo (PDFs, áudios, cifras): quando a \
pessoa pergunta "tem algo no acervo sobre X?", liste os arquivos que tratam de X, citando cada um. Seja útil de \
verdade: antes de dizer que não achou, procure na web e use o que você sabe da liturgia; só diga que não achou \
quando nem o acervo, nem a web, nem o seu conhecimento trazem a resposta. Não invente referências.

Você conhece bem a liturgia católica (Missal Romano, IGMR, Ano Litúrgico, Liturgia das Horas, o Diretório da CNBB) e \
responde dúvidas como: quando não há missa (Sexta-feira Santa, Sábado Santo antes da Vigília), como é a missa de \
Finados ou do Tríduo Pascal, o que se canta em cada parte da missa, cores e tempos litúrgicos, solenidades e festas. \
Para a liturgia de uma data (leituras, salmo, evangelho), use a que vem em <app>; se ela não veio, procure na web \
(liturgia diária da CNBB, Canção Nova, Paulus) e diga a fonte. Para cantos de uma celebração (casamento, batismo, \
exéquias, crisma…), prefira os do acervo e explique em que parte da celebração cada um entra.

Você também MEXE NO APP. Quando a pessoa pedir uma ação, responda curto confirmando e ponha no fim da resposta o \
comando, exatamente assim (o app executa e tira o comando do texto):
- tocar uma música da biblioteca: [[tocar: título exato da música, como está na biblioteca em <app>]]
- pausar a música: [[pausar]]; continuar: [[continuar]]; a próxima: [[proxima]]; a anterior: [[anterior]]
- abrir uma tela: [[abrir: liturgia]] (ou biblioteca, repertorios, busca, inicio, ajustes, partituras, oracoes)
Use a lista de músicas e de repertórios de <app> para responder sobre a biblioteca e os repertórios e para achar a \
música pedida mesmo com o nome dito de outro jeito ("aquela do Justice"). Se a música não estiver na biblioteca, \
diga isso e não ponha o comando."""

# na conversa ao vivo a resposta é falada: curta, em frases, sem lista nem marcação
SISTEMA_VOZ = """

A resposta será LIDA EM VOZ ALTA numa conversa ao vivo. Responda como numa conversa: de 2 a 6 frases curtas, sem \
listas, sem títulos, sem negrito, sem citações entre colchetes e sem endereços de sites. Se for uma lista de cantos \
ou leituras, diga os principais numa frase. Se pedirem uma estrutura ou um passo a passo (os ritos de uma \
celebração), diga as etapas em ordem, numa sequência falada ("primeiro…, depois…, por fim…"), em até 8 frases. Se a resposta veio da internet, diga só o nome da fonte ("segundo a \
CNBB…")."""


def montar_pergunta(pergunta: str, achados: list[tuple[float, Trecho]], contexto: str = "") -> str:
    blocos = [f"[{k}] {t.titulo} — {t.caminho}\n{t.texto}" for k, (_, t) in enumerate(achados, 1)]
    acervo = "\n\n".join(blocos) if blocos else "(nenhum trecho do acervo tem as palavras da pergunta)"
    app = f"<app>\n{contexto.strip()}\n</app>\n\n" if contexto.strip() else ""
    return f"{app}<acervo>\n{acervo}\n</acervo>\n\nPergunta: {pergunta}"


# ---- arquivos enviados pela pessoa (PDF, foto, vídeo, áudio, texto): a IA lê junto com a pergunta
MAX_ANEXO = 18 << 20


def texto_do_anexo(nome: str, tipo: str, dados: bytes) -> str:
    """O texto de um arquivo enviado (PDF, Word, texto), sem IA; foto, vídeo e áudio não têm: ""."""
    import io
    import zipfile

    nome, tipo = (nome or "").lower(), (tipo or "").lower()
    try:
        if tipo == "application/pdf" or nome.endswith(".pdf"):
            from pypdf import PdfReader

            return limpar_texto_pdf("\n".join((p.extract_text() or "") for p in PdfReader(io.BytesIO(dados)).pages[:300]))
        if nome.endswith(".docx"):
            with zipfile.ZipFile(io.BytesIO(dados)) as z:
                xml = z.read("word/document.xml").decode("utf-8", "ignore")
            return re.sub(r"<[^>]+>", "", re.sub(r"</w:p>", "\n", xml))
        if tipo.startswith("text/") or nome.endswith((".txt", ".md", ".cho", ".chordpro", ".csv", ".json", ".html", ".htm")):
            return dados.decode("utf-8", "ignore")
    except Exception:  # arquivo estragado: fica sem texto
        return ""
    return ""


def _decodificar(anexos: list[dict] | None) -> list[dict]:
    import base64

    out, total = [], 0
    for a in (anexos or [])[:3]:
        try:
            dados = base64.b64decode(a.get("dados") or "")
        except Exception:
            continue
        total += len(dados)
        if not dados or total > MAX_ANEXO:
            continue
        out.append({"nome": str(a.get("nome") or "arquivo")[:200], "tipo": str(a.get("tipo") or "application/octet-stream"), "dados": dados})
    return out


SISTEMA_ANEXO = """

A pessoa enviou um ou mais arquivos (PDF, foto, vídeo, áudio ou texto) junto com a pergunta. Leia, veja ou ouça o \
arquivo com atenção e responda com base nele primeiro (cite a página ou o trecho quando der). Se a pergunta for só \
"o que é isso?" ou vier vazia, resuma o arquivo e diga o que dá para fazer com ele na liturgia."""


# ---- o PDF do acervo que trata do assunto (o Ritual do Matrimônio para "a estrutura do casamento"): baixado do Drive
# e entregue inteiro à IA, que lê o que está escrito nele (os trechos da busca são só pedaços soltos)
GENERICAS = set("""liturgia liturgica liturgico liturgicos catolica catolico igreja missa missas celebracao cerimonia
canto cantos musica musicas cnbb estrutura parte partes como fazer ordem rito ritos texto livro""".split())
PASTAS_DE_MUSICA = re.compile(r"cifra|canto|partitura|hinario|album|audio|musica|salmos responsoriais|melodia")
_pdfs: dict[str, bytes] = {}


def pdf_do_acervo(pergunta: str, achados: list[tuple[float, Trecho]]) -> tuple[int, Trecho] | None:
    """O arquivo PDF (o número dele nos achados e o trecho) cujo nome fala do assunto da pergunta; None se não há."""
    grupos = []
    for p in palavras(pergunta):
        if p in GENERICAS:
            continue
        grupos.append({p} | _SINONIMO.get(p, set()))
    if not grupos:
        return None
    quer_canto = bool(re.search(r"\b(canto|cantos|musica|musicas|hino|cifra|partitura)\b", normalizar(pergunta)))
    melhor, nota_melhor = None, 0.0
    for k, (_, t) in enumerate(achados, 1):
        if t.tipo not in ("arquivo", "documento") or not t.id or not t.titulo.lower().endswith(".pdf"):
            continue
        # (os PDFs de canto — cifras, partituras, salmos musicados — só quando a pergunta é sobre canto: "estrutura
        # perfeita" não é "A lei do Senhor é perfeita")
        lugar = normalizar(f"{t.caminho} {t.titulo}")
        if PASTAS_DE_MUSICA.search(lugar) and not quer_canto:
            continue
        nome = set(palavras(t.titulo))
        nota = sum(1 for g in grupos if g & nome)
        if not nota:
            continue
        if re.search(r"ritua|document|lecion|missal|cerimonial|diretorio|instrucao", lugar):
            nota += 0.5
        if nota > nota_melhor:
            melhor, nota_melhor = (k, t), nota
    return melhor if nota_melhor >= 1 else None


def baixar_pdf(fid: str) -> bytes | None:
    if fid in _pdfs:
        return _pdfs[fid]
    import urllib.request

    url = f"https://drive.usercontent.google.com/download?id={fid}&export=download&confirm=t"
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Songbook/1.0"}), timeout=30) as r:
            dados = r.read(MAX_ANEXO + 1)
    except Exception:
        return None
    if len(dados) > MAX_ANEXO or not dados.startswith(b"%PDF"):
        return None
    if len(_pdfs) >= 4:
        _pdfs.pop(next(iter(_pdfs)))
    _pdfs[fid] = dados
    return dados


def sistema_do_genero(genero: str) -> str:
    """A voz escolhida no app dá o gênero do Lumen: a Francisca é "a Lumen", o Antônio é "o Lumen"."""
    if genero == "masculina":
        return ("\n\nVocê fala com a voz masculina (Antônio): você é O Lumen. Fale de si no masculino (\"eu sou o "
                "Lumen\", \"fico contente\", \"estou pronto\", \"obrigado\").")
    return ("\n\nVocê fala com a voz feminina (Francisca): você é A Lumen. Fale de si no feminino (\"eu sou a Lumen\", "
            "\"sua assistente litúrgica\", \"estou pronta\", \"obrigada\"). Nunca diga \"o Lumen\" falando de si.")


def responder(pergunta: str, historico: list[dict] | None = None, contexto: str = "", voz: bool = False,
              anexos: list[dict] | None = None, genero: str = "feminina") -> dict:
    pergunta = pergunta.strip()[:1000]
    if not pergunta:
        raise ValueError("escreva a pergunta")
    achados = indice().buscar(pergunta, 14)
    mensagens = []
    for m in (historico or [])[-6:]:  # as últimas perguntas e respostas: dá para perguntar "e no ofertório?"
        if m.get("role") in ("user", "assistant") and isinstance(m.get("content"), str):
            mensagens.append({"role": m["role"], "content": m["content"][:4000]})
    # o contexto do app (liturgia, biblioteca) vem do aparelho: limitado, para a conta não crescer sem controle
    mensagens.append({"role": "user", "content": montar_pergunta(pergunta, achados, (contexto or "")[:20000])})
    arquivos = _decodificar(anexos)
    pdf_junto = False
    sistema = SISTEMA + sistema_do_genero(genero) + (SISTEMA_VOZ if voz else "") + (SISTEMA_ANEXO if arquivos else "")
    # sem arquivo da pessoa: o PDF do acervo que trata do assunto vai inteiro (a IA lê o que ele diz de verdade)
    if not arquivos and os.environ.get("IA_PDF_DO_ACERVO", "1") != "0":
        escolhido = pdf_do_acervo(pergunta, achados)
        dados = escolhido and baixar_pdf(escolhido[1].id)
        if dados:
            k, t = escolhido
            arquivos = [{"nome": t.titulo, "tipo": "application/pdf", "dados": dados}]
            pdf_junto = True
            sistema += (f"\n\nVai junto, inteiro, o arquivo do acervo [{k}] \"{t.titulo}\". Se ele trata da pergunta, "
                        f"responda pelo que está ESCRITO nele (a ordem, os ritos, as palavras), citando [{k}]; não "
                        "resuma de memória o que o arquivo diz de outro jeito.")
    if provedor() == "gemini":
        try:
            texto, web, usou_web = _gemini(mensagens, sistema, arquivos)
        except ErroGemini:
            if not pdf_junto:
                raise
            # (o PDF inteiro do acervo deixou o pedido grande demais para o limite: vai só com os trechos)
            texto, web, usou_web = _gemini(mensagens, sistema, [])
    else:
        texto, web, usou_web = _claude(mensagens, sistema, voz, arquivos)
    usados = {int(n) for n in re.findall(r"\[(\d+)\]", texto)}
    fontes = [{"n": k, "titulo": t.titulo, "caminho": t.caminho, "id": t.id, "tipo": t.tipo}
              for k, (_, t) in enumerate(achados, 1) if k in usados]
    return {"resposta": texto, "fontes": fontes, "web": web, "usouWeb": usou_web}


def _claude(mensagens: list[dict], sistema: str, voz: bool, arquivos: list[dict] | None = None) -> tuple[str, list[dict], bool]:
    import base64

    import anthropic

    if arquivos:
        # o Claude lê PDF e foto direto; Word e texto vão como texto; vídeo e áudio ele não abre (fica o aviso)
        blocos = []
        for a in arquivos:
            b64 = base64.b64encode(a["dados"]).decode()
            if a["tipo"] == "application/pdf":
                blocos.append({"type": "document", "source": {"type": "base64", "media_type": "application/pdf", "data": b64}, "title": a["nome"]})
            elif a["tipo"] in ("image/jpeg", "image/png", "image/gif", "image/webp"):
                blocos.append({"type": "image", "source": {"type": "base64", "media_type": a["tipo"], "data": b64}})
            else:
                t = texto_do_anexo(a["nome"], a["tipo"], a["dados"])
                blocos.append({"type": "text", "text": f"<arquivo nome=\"{a['nome']}\">\n{t[:60000]}\n</arquivo>" if t
                               else f"(a pessoa enviou {a['nome']} ({a['tipo']}), que não consigo abrir: diga isso a ela)"})
        ultima = mensagens[-1]
        mensagens = mensagens[:-1] + [{"role": "user", "content": blocos + [{"type": "text", "text": ultima["content"]}]}]

    cliente = anthropic.Anthropic()
    ferramentas = [{"type": "web_search_20260209", "name": "web_search", "max_uses": 4}]
    conteudo = []
    for _ in range(4):  # a busca na web pode pausar a resposta (pause_turn): continua de onde parou
        r = cliente.beta.messages.create(
            model=MODELO, max_tokens=16000, system=sistema, messages=mensagens, tools=ferramentas,
            output_config={"effort": "low" if voz else "medium"},
            betas=["server-side-fallback-2026-07-01"], fallbacks="default",
        )
        conteudo.extend(r.content)
        if r.stop_reason != "pause_turn":
            break
        mensagens.append({"role": "assistant", "content": r.content})
    if r.stop_reason == "refusal":
        raise ValueError("não consegui responder a essa pergunta")
    texto = "".join(b.text for b in conteudo if b.type == "text").strip()
    web, vistos = [], set()
    for b in conteudo:
        if b.type == "text":
            for c in getattr(b, "citations", None) or []:
                url = getattr(c, "url", None)
                if url and url not in vistos:
                    vistos.add(url)
                    web.append({"titulo": getattr(c, "title", None) or url, "url": url})
    return texto, web, any(b.type == "server_tool_use" for b in conteudo)


class ErroGemini(RuntimeError):
    def __init__(self, status: int, mensagem: str):
        super().__init__(mensagem)
        self.status = status


# ---- os modelos do Gemini que a chave pode usar (a lista do próprio Google, guardada por 1 hora)
_modelos = {"em": 0.0, "lista": []}
_modelo_bom: dict[str, str] = {}
# a busca do Google (grounding) tem cota própria, pequena no plano grátis: quando ela acaba, o Gemini responde 429 a
# toda pergunta que pede a busca (e o pedido sem ela passa). Aí as perguntas vão sem a busca por um tempo
_sem_busca_ate = {"t": 0.0}


def modelos_gemini(forcar: bool = False) -> list[dict]:
    import time
    import urllib.request

    if not forcar and _modelos["lista"] and time.time() - _modelos["em"] < 3600:
        return _modelos["lista"]
    lista, pagina = [], ""
    try:
        for _ in range(5):
            url = f"{API_GEMINI}/models?pageSize=1000" + (f"&pageToken={pagina}" if pagina else "")
            req = urllib.request.Request(url, headers={"x-goog-api-key": chave_gemini()})
            with urllib.request.urlopen(req, timeout=15) as r:
                dados = json.loads(r.read().decode())
            lista += dados.get("models") or []
            pagina = dados.get("nextPageToken") or ""
            if not pagina:
                break
    except Exception:  # sem internet ou chave errada: fica a lista de antes (ou os nomes de reserva)
        return _modelos["lista"]
    _modelos.update(em=time.time(), lista=lista)
    return lista


def _versao(nome: str) -> tuple:
    m = re.match(r"gemini-(\d+)(?:\.(\d+))?", nome)
    return (int(m.group(1)), int(m.group(2) or 0)) if m else (0, 0)


def candidatos_gemini(tipo: str = "texto") -> list[str]:
    """Os modelos para tentar, do melhor para o de reserva: "texto" (o Flash mais novo, depois o Flash-Lite) ou "voz"
    (os de fala, TTS)."""
    nomes = [m.get("name", "").removeprefix("models/") for m in modelos_gemini()
             if "generateContent" in (m.get("supportedGenerationMethods") or [])]
    if tipo == "voz":
        voz = sorted((n for n in nomes if "tts" in n), key=lambda n: (_versao(n), "flash" in n, "preview" not in n), reverse=True)
        fixo = os.environ.get("IA_GEMINI_VOZ_MODELO", "")
        return ([fixo] if fixo else []) + voz or ["gemini-flash-latest-tts"]
    fora = re.compile(r"tts|image|live|audio|embedding|vision|learnlm|gemma|robotics|computer|thinking|exp|8b")
    texto = [n for n in nomes if n.startswith("gemini") and "flash" in n and not fora.search(n)]
    # o Flash da versão mais alta, mesmo que ainda seja prévia (na mesma versão, o estável antes); depois o anterior,
    # o "gemini-flash-latest" e o Flash-Lite mais novo, de reserva
    flash = sorted((n for n in texto if "lite" not in n and not n.endswith("-latest")),
                   key=lambda n: (_versao(n), "preview" not in n), reverse=True)
    lites = sorted((n for n in texto if "lite" in n and not n.endswith("-latest")), key=lambda n: (_versao(n), "preview" not in n), reverse=True)
    # (de reserva também os Flash-Lite: no plano grátis eles têm mais cota, e o Flash às vezes não tem nenhuma)
    ordem = ([MODELO_GEMINI] if MODELO_GEMINI else []) + flash[:3] \
        + (["gemini-flash-latest"] if "gemini-flash-latest" in nomes or not nomes else []) + lites[:2] \
        + (["gemini-flash-lite-latest"] if "gemini-flash-lite-latest" in nomes else [])
    vistos: list[str] = []
    for n in ordem:
        if n and n not in vistos:
            vistos.append(n)
    return vistos


def chamar_gemini(corpo: dict, tipo: str = "texto", timeout: int = 120) -> tuple[dict, str]:
    """generateContent no melhor modelo que responder: o que deu certo da última vez primeiro; se um não existe mais
    (404), está ocupado (429/503) ou não aceita a ferramenta, tenta o próximo. Devolve (resposta, modelo)."""
    import urllib.error
    import urllib.request

    lista = candidatos_gemini(tipo)
    if _modelo_bom.get(tipo) in lista:
        lista.remove(_modelo_bom[tipo])
        lista.insert(0, _modelo_bom[tipo])
    import time

    ultimo: ErroGemini | None = None
    erros: list[str] = []
    if "tools" in corpo and time.time() < _sem_busca_ate["t"]:
        corpo = {c: v for c, v in corpo.items() if c != "tools"}
    for k, modelo in enumerate(lista[:7]):
        tentativa = dict(corpo)
        esperou = False
        for _ in range(3):  # (de novo sem a busca do Google, se o modelo não aceitar a ferramenta; ou depois da espera)
            pedido = urllib.request.Request(f"{API_GEMINI}/models/{modelo}:generateContent", data=json.dumps(tentativa).encode(),
                                            method="POST", headers={"Content-Type": "application/json", "x-goog-api-key": chave_gemini()})
            try:
                with urllib.request.urlopen(pedido, timeout=timeout) as r:
                    _modelo_bom[tipo] = modelo
                    return json.loads(r.read().decode()), modelo
            except urllib.error.HTTPError as e:
                ultimo = ErroGemini(e.code, mensagem_do_google(e.read().decode(errors="replace")))
            except urllib.error.URLError as e:
                raise ErroGemini(0, str(e.reason)) from e
            if ultimo.status == 400 and "tools" in tentativa and re.search(r"tool|search|grounding", str(ultimo), re.I):
                tentativa = {c: v for c, v in tentativa.items() if c != "tools"}
                continue
            # a cota acabou com a busca do Google junto: o mesmo modelo de novo, sem a busca (e sem ela por 1 hora)
            if ultimo.status == 429 and "tools" in tentativa:
                _sem_busca_ate["t"] = time.time() + 3600
                corpo = {c: v for c, v in corpo.items() if c != "tools"}
                tentativa = dict(corpo)
                continue
            # o limite por minuto: espera o que o Google pede (até 8 s) e tenta de novo, uma vez; o limite do dia (ou o
            # modelo fora do plano grátis, "limit: 0"): vai direto para o próximo modelo
            espera = re.search(r"retry in ([\d.]+)s|\"retryDelay\": ?\"(\d+)", str(ultimo))
            segundos = float(next(g for g in espera.groups() if g)) if espera else 0
            if ultimo.status == 429 and not esperou and 0 < segundos <= 8 and "limit: 0" not in str(ultimo) and "PerDay" not in str(ultimo):
                esperou = True
                time.sleep(segundos + 0.3)
                continue
            break
        erros.append(f"{modelo}: {ultimo.status} {str(ultimo)[:160]}")
        if ultimo.status == 404 and k == 0:
            modelos_gemini(forcar=True)  # (a lista guardada estava velha)
        if ultimo.status not in (400, 404, 429, 500, 503):
            break
    if ultimo:
        raise ErroGemini(ultimo.status, " | ".join(erros) or str(ultimo))
    raise ErroGemini(0, "nenhum modelo do Gemini disponível")


def mensagem_do_google(corpo: str) -> str:
    """A mensagem de erro do Google, curta (sem a chave): o que diz por que o pedido não passou."""
    try:
        erro = json.loads(corpo).get("error") or {}
        msg = str(erro.get("message") or "")
        for d in erro.get("details") or []:
            if d.get("retryDelay"):
                msg += f' "retryDelay": "{d["retryDelay"].rstrip("s")}s"'
        return re.sub(r"\s+", " ", msg)[:400] or corpo[:300]
    except Exception:
        return corpo[:300]


def testar_gemini() -> list[dict]:
    """Um pedido pequeno a cada modelo da lista: mostra quais respondem com a chave (e o motivo dos que não)."""
    import urllib.error
    import urllib.request

    out = []
    for modelo in candidatos_gemini("texto")[:7] + candidatos_gemini("voz")[:1]:
        corpo = {"contents": [{"role": "user", "parts": [{"text": "Responda só: ok"}]}]}
        if "tts" in modelo:
            corpo = {"contents": [{"parts": [{"text": "ok"}]}], "generationConfig": {"responseModalities": ["AUDIO"]}}
        pedido = urllib.request.Request(f"{API_GEMINI}/models/{modelo}:generateContent", data=json.dumps(corpo).encode(), method="POST",
                                        headers={"Content-Type": "application/json", "x-goog-api-key": chave_gemini()})
        try:
            with urllib.request.urlopen(pedido, timeout=40):
                out.append({"modelo": modelo, "ok": True})
        except urllib.error.HTTPError as e:
            out.append({"modelo": modelo, "ok": False, "status": e.code, "motivo": mensagem_do_google(e.read().decode(errors="replace"))[:300]})
        except Exception as e:
            out.append({"modelo": modelo, "ok": False, "motivo": str(e)[:200]})
    return out


def nome_do_modelo() -> str:
    """O modelo do Gemini que está respondendo (o último que deu certo, ou o primeiro da lista)."""
    try:
        return _modelo_bom.get("texto") or (candidatos_gemini("texto") or [""])[0]
    except Exception:
        return ""


def _gemini(mensagens: list[dict], sistema: str, arquivos: list[dict] | None = None) -> tuple[str, list[dict], bool]:
    """O Gemini pela API REST (sem pacote a mais), com a busca do Google para o que não está no acervo. Ele lê PDF,
    foto, vídeo e áudio direto (inline_data)."""
    import base64
    import urllib.error
    import urllib.request

    corpo = {
        "system_instruction": {"parts": [{"text": sistema}]},
        "contents": [{"role": "model" if m["role"] == "assistant" else "user", "parts": [{"text": m["content"]}]} for m in mensagens],
        "tools": [{"google_search": {}}],
    }
    if arquivos:
        partes = []
        for a in arquivos:
            t = "" if a["tipo"].split("/")[0] in ("image", "video", "audio") or a["tipo"] == "application/pdf" else texto_do_anexo(a["nome"], a["tipo"], a["dados"])
            partes.append({"text": f"<arquivo nome=\"{a['nome']}\">\n{t[:60000]}\n</arquivo>"} if t
                          else {"inline_data": {"mime_type": a["tipo"], "data": base64.b64encode(a["dados"]).decode()}})
        corpo["contents"][-1]["parts"] = partes + corpo["contents"][-1]["parts"]
    dados, _ = chamar_gemini(corpo, "texto")
    cand = (dados.get("candidates") or [{}])[0]
    if cand.get("finishReason") in ("SAFETY", "PROHIBITED_CONTENT", "BLOCKLIST"):
        raise ValueError("não consegui responder a essa pergunta")
    texto = "".join(p.get("text", "") for p in (cand.get("content") or {}).get("parts", [])).strip()
    meta = cand.get("groundingMetadata") or {}
    web, vistos = [], set()
    for c in meta.get("groundingChunks") or []:
        w = c.get("web") or {}
        if w.get("uri") and w["uri"] not in vistos:
            vistos.add(w["uri"])
            web.append({"titulo": w.get("title") or w["uri"], "url": w["uri"]})
    return texto, web, bool(meta.get("webSearchQueries"))
