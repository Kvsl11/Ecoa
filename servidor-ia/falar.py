"""Síntese de fala para respostas do Gemini, com uma única voz padrão no servidor.

Usa a voz do Gemini quando disponível e uma voz neural de reserva quando necessário.
A escolha da voz é interna; a interface não oferece personagens nem opções de gênero.
"""

from __future__ import annotations

import os
import re

VOZ_PADRAO = os.environ.get("IA_VOZ", "pt-BR-FranciscaNeural")
MAX_CARACTERES = 2500
VOZ_GEMINI_PADRAO = os.environ.get("IA_VOZ_GEMINI", "Kore")
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


async def falar(texto: str, velocidade: str = "+4%") -> bytes:
    import edge_tts

    texto = limpar(texto)
    if not texto:
        raise ValueError("nada para falar")
    nome = VOZ_PADRAO
    erro: Exception | None = None
    for _ in range(2):  # (o serviço da Microsoft às vezes corta a ligação: uma segunda tentativa costuma passar)
        audio = bytearray()
        try:
            async for parte in edge_tts.Communicate(texto, nome, rate=velocidade).stream():
                if parte.get("type") == "audio":
                    audio.extend(parte["data"])
        except Exception as e:
            erro = e
            continue
        if audio:
            return bytes(audio)
    raise RuntimeError(f"a voz não respondeu ({erro})" if erro else "a voz não respondeu")


def wav(pcm: bytes, taxa: int = 24000) -> bytes:
    """O áudio cru do Gemini (PCM 16 bits, mono) num arquivo WAV que o navegador toca."""
    import struct

    return (b"RIFF" + struct.pack("<I", 36 + len(pcm)) + b"WAVEfmt " + struct.pack("<IHHIIHH", 16, 1, 1, taxa, taxa * 2, 2, 16)
            + b"data" + struct.pack("<I", len(pcm)) + pcm)


def falar_gemini(texto: str) -> bytes:
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
            "prebuiltVoiceConfig": {"voiceName": VOZ_GEMINI_PADRAO}}}},
    }
    try:
        # (poucos modelos, sem esperar e com prazo curto: se a voz do Gemini não vem logo, a de reserva ainda chega a
        # tempo; antes o servidor passava de 40 s tentando e o app desistia e falava com a voz robótica do aparelho)
        dados, _ = duvidas.chamar_gemini(corpo, "voz", timeout=18, modelos=2, esperar=False)
    except duvidas.ErroGemini as e:
        if e.status == 429:
            # (o limite do dia não volta em 10 minutos: aí a reserva fica por 1 hora)
            _gemini_sem_ate = time.time() + (3600 if re.search(r"PerDay|per day|limit: 0", str(e), re.I) else 600)
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
