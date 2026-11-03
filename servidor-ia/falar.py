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
# as vozes do próprio Gemini (as da conversa ao vivo do app do Gemini), quando o servidor tem a chave do Gemini
VOZES_GEMINI = {
    "feminina": os.environ.get("IA_VOZ_GEMINI", "Aoede"),
    "masculina": os.environ.get("IA_VOZ_GEMINI_MASCULINA", "Charon"),
}
# (o limite grátis do Gemini para a fala acabou: volta a tentar depois de 10 minutos; antes disso, a voz de reserva)
_gemini_sem_ate = 0.0


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


def wav(pcm: bytes, taxa: int = 24000) -> bytes:
    """O áudio cru do Gemini (PCM 16 bits, mono) num arquivo WAV que o navegador toca."""
    import struct

    return (b"RIFF" + struct.pack("<I", 36 + len(pcm)) + b"WAVEfmt " + struct.pack("<IHHIIHH", 16, 1, 1, taxa, taxa * 2, 2, 16)
            + b"data" + struct.pack("<I", len(pcm)) + pcm)


def falar_gemini(texto: str, voz: str = "feminina") -> bytes:
    """A fala na voz do Gemini (o modelo de fala, TTS, que a chave pode usar). Erro se não der: quem chama usa a reserva."""
    import base64
    import time

    import duvidas

    global _gemini_sem_ate
    if time.time() < _gemini_sem_ate:
        raise RuntimeError("a voz do Gemini está no limite agora")
    texto = limpar(texto)
    if not texto:
        raise ValueError("nada para falar")
    corpo = {
        "contents": [{"parts": [{"text": texto}]}],
        "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {"voiceConfig": {
            "prebuiltVoiceConfig": {"voiceName": VOZES_GEMINI.get(voz, VOZES_GEMINI["feminina"])}}}},
    }
    try:
        dados, _ = duvidas.chamar_gemini(corpo, "voz", timeout=40)
    except duvidas.ErroGemini as e:
        if e.status == 429:
            _gemini_sem_ate = time.time() + 600
        raise
    for parte in ((dados.get("candidates") or [{}])[0].get("content") or {}).get("parts") or []:
        dado = parte.get("inlineData") or parte.get("inline_data")
        if dado and dado.get("data"):
            bruto = base64.b64decode(dado["data"])
            tipo = dado.get("mimeType") or dado.get("mime_type") or ""
            if bruto[:4] == b"RIFF":
                return bruto
            taxa = re.search(r"rate=(\d+)", tipo)
            return wav(bruto, int(taxa.group(1)) if taxa else 24000)
    raise RuntimeError("o Gemini não devolveu o áudio")
