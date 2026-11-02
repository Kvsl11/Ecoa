"""A voz do Lumen na conversa ao vivo: o texto vira áudio (MP3) com uma voz neural realista, no lugar da voz robótica
do navegador.

Usa as vozes neurais da Microsoft (as mesmas do "Ler em voz alta" do Edge) pelo pacote edge-tts: de graça, sem chave.
As vozes em português do Brasil: Francisca (feminina, a padrão) e Antonio (masculina); IA_VOZ troca a padrão.
"""

from __future__ import annotations

import os
import re

VOZES = {
    "feminina": os.environ.get("IA_VOZ", "pt-BR-FranciscaNeural"),
    "masculina": os.environ.get("IA_VOZ_MASCULINA", "pt-BR-AntonioNeural"),
}
MAX_CARACTERES = 2500


def tem_voz() -> bool:
    try:
        import edge_tts  # noqa: F401
    except ImportError:
        return False
    return True


def limpar(texto: str) -> str:
    """O texto como se fala: sem as citações [1], sem a marcação (**, #, listas) e sem os endereços da internet."""
    t = re.sub(r"\s*\[\d+\]", "", str(texto or ""))
    t = re.sub(r"https?://\S+", "", t)
    t = re.sub(r"\*\*|__|`", "", t)
    t = re.sub(r"^\s*(#+|[-*•]|\d+[.)])\s+", "", t, flags=re.M)
    t = re.sub(r"\s+", " ", t).strip()
    return t[:MAX_CARACTERES]


async def falar(texto: str, voz: str = "feminina", velocidade: str = "+4%") -> bytes:
    import edge_tts

    texto = limpar(texto)
    if not texto:
        raise ValueError("nada para falar")
    nome = VOZES.get(voz, voz if re.fullmatch(r"[a-z]{2}-[A-Z]{2}-\w+Neural", voz or "") else VOZES["feminina"])
    audio = bytearray()
    async for parte in edge_tts.Communicate(texto, nome, rate=velocidade).stream():
        if parte.get("type") == "audio":
            audio.extend(parte["data"])
    if not audio:
        raise RuntimeError("a voz não respondeu")
    return bytes(audio)
