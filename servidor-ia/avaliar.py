"""Mede o quanto a partitura pela IA acerta, com músicas de gabarito: para cada áudio da pasta, um MIDI com o mesmo
nome (a melodia certa: a trilha mais aguda ou a de nome "voz"/"melodia"/"soprano").

    python avaliar.py pasta/                      # a configuração atual
    IA_SOLISTA=0 IA_SEM_BEAT_THIS=1 python avaliar.py pasta/   # o jeito de antes, para comparar

Para cada música (e na média), a nota certa no lugar certo (F1 das notas do mir_eval, com o começo a até 50 ms e a
altura a até meio semitom: "notas"), a mesma conta sem olhar o fim da nota ("começos") e, se o MIDI tiver as batidas
(o andamento e as mudanças dele), o F1 das batidas. O gabarito pode estar uma oitava acima ou abaixo (a voz de
homem escrita na clave de sol): conta a oitava que mais acerta.
"""

from __future__ import annotations

import json
import os
import sys

import numpy as np

AUDIOS = (".wav", ".mp3", ".m4a", ".flac", ".ogg", ".opus", ".webm")


def melodia_do_midi(caminho: str):
    """(intervalos [n×2] em s, alturas em Hz, batidas em s) da melodia do MIDI de gabarito."""
    import pretty_midi

    pm = pretty_midi.PrettyMIDI(caminho)
    instrumentos = [i for i in pm.instruments if not i.is_drum and i.notes]
    if not instrumentos:
        raise ValueError(f"{caminho}: sem notas")
    nomeada = [i for i in instrumentos if any(x in (i.name or "").lower() for x in ("voz", "melod", "soprano", "vocal", "lead"))]
    trilha = nomeada[0] if nomeada else max(instrumentos, key=lambda i: np.mean([n.pitch for n in i.notes]))
    notas = sorted(trilha.notes, key=lambda n: n.start)
    intervalos = np.array([[n.start, n.end] for n in notas])
    alturas = np.array([pretty_midi.note_number_to_hz(n.pitch) for n in notas])
    return intervalos, alturas, pm.get_beats()


def notas_da_ia(r: dict, fonte: str = "voz"):
    sel = [n for n in r["notas"] if n.get("fonte") == fonte] or r["notas"]
    intervalos = np.array([[n["startTimeSeconds"], n["startTimeSeconds"] + n["durationSeconds"]] for n in sel]).reshape(-1, 2)
    alturas = np.array([440.0 * 2 ** ((n["pitchMidi"] - 69) / 12) for n in sel])
    return intervalos, alturas


def medir(ref, est, batidas_ref=None, batidas_est=None) -> dict:
    import mir_eval

    ri, ra, = ref
    ei, ea = est
    if not len(ei):
        return {"notas": 0.0, "começos": 0.0, "batidas": None}
    melhor = None
    for oitava in (-1, 0, 1):
        ea2 = ea * 2.0 ** oitava
        _, _, f, _ = mir_eval.transcription.precision_recall_f1_overlap(ri, ra, ei, ea2, onset_tolerance=0.05, pitch_tolerance=50)
        _, _, f0, _ = mir_eval.transcription.precision_recall_f1_overlap(ri, ra, ei, ea2, onset_tolerance=0.05, pitch_tolerance=50, offset_ratio=None)
        if melhor is None or f0 > melhor["começos"]:
            melhor = {"notas": round(f, 3), "começos": round(f0, 3), "oitava": oitava}
    if batidas_ref is not None and len(batidas_ref) and batidas_est:
        melhor["batidas"] = round(float(mir_eval.beat.f_measure(np.asarray(batidas_ref), np.asarray(batidas_est))), 3)
    else:
        melhor["batidas"] = None
    return melhor


def main(pasta: str) -> None:
    import transcricao

    resultados = []
    for nome in sorted(os.listdir(pasta)):
        base, ext = os.path.splitext(nome)
        midi = next((os.path.join(pasta, base + e) for e in (".mid", ".midi") if os.path.exists(os.path.join(pasta, base + e))), None)
        if ext.lower() not in AUDIOS or not midi:
            continue
        ri, ra, br = melodia_do_midi(midi)
        r = transcricao.transcrever(os.path.join(pasta, nome))
        m = medir((ri, ra), notas_da_ia(r), br, r.get("batidas"))
        m.update(musica=base, solista=r.get("solista"), batidasPor=r.get("batidasPor"), vozes=r.get("vozes"))
        resultados.append(m)
        print(json.dumps(m, ensure_ascii=False), flush=True)
    if not resultados:
        print("Nenhum par áudio + MIDI na pasta.")
        return
    media = lambda k: round(float(np.mean([x[k] for x in resultados if x.get(k) is not None] or [np.nan])), 3)  # noqa: E731
    print(json.dumps({"media": True, "notas": media("notas"), "começos": media("começos"), "batidas": media("batidas"),
                      "musicas": len(resultados)}, ensure_ascii=False))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1])
