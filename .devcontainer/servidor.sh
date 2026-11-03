#!/usr/bin/env bash
# O servidor da IA no Codespace, de pé enquanto o Codespace estiver ligado (o ligar.sh roda isto em segundo plano).
# O que ele faz vai para servidor-ia/dados/servidor.log.
#
# 1. Puxa a versão nova do GitHub (se não há mudança feita à mão aqui): o Codespace guarda o código de quando foi
#    criado, e o que entrava no GitHub depois nunca chegava ao servidor.
# 2. Liga o servidor LOGO, com os pacotes que já tem. Antes ele instalava os pacotes novos primeiro (5 a 10 minutos) e
#    parecia que não ligava; e se um download falhava, tentava de novo a cada vez que o Codespace ligava.
# 3. Os pacotes novos (o requirements.txt mudou) instalam em segundo plano; terminando, o servidor liga de novo com eles.
# 4. O codespace.py deixa o servidor alcançável de fora (a porta pública ou o túnel da Cloudflare) e publica o
#    endereço no site, para todos os aparelhos acharem sozinhos.
# Se o servidor cair, liga de novo.
cd "$(dirname "$0")/../servidor-ia" || exit 1

if git -C .. diff --quiet && git -C .. diff --cached --quiet; then
  git -C .. pull -q --ff-only 2>/dev/null && echo "Código atualizado: $(git -C .. log -1 --format='%h %s')" \
    || echo "Aviso: não consegui atualizar o código (segue com o que já tem)."
else
  echo "Aviso: há mudanças feitas aqui no Codespace; o código não foi atualizado."
fi

# sem nem o básico (a primeira vez, ou a instalação da criação falhou): instala antes de ligar
if ! python -c "import uvicorn, fastapi, numpy" 2>/dev/null; then
  echo "Instalando o servidor (a primeira vez leva uns 10 minutos)…"
  bash ../.devcontainer/instalar.sh || echo "Aviso: a instalação falhou; tentando ligar com o que há."
fi

PID=""
ligar() {
  IA_SEM_TUNEL=1 IA_THREADS=$(nproc) IA_TAREFAS=3 python iniciar_pc.py &
  PID=$!
  echo "Servidor ligando (processo $PID)…"
}
ligar

# o endereço público (porta pública ou túnel) e o site
python codespace.py &

# os pacotes novos, sem parar o servidor
if ! sha256sum -c --status dados/.requisitos 2>/dev/null; then
  echo "Instalando os pacotes novos em segundo plano (o servidor já está ligado com os de antes)…"
  if bash ../.devcontainer/instalar.sh; then
    echo "Pacotes novos instalados: o servidor liga de novo com eles."
    kill "$PID" 2>/dev/null
    wait "$PID" 2>/dev/null
    ligar
  else
    echo "Aviso: a instalação dos pacotes novos falhou; o servidor segue com os de antes."
  fi
fi

# a versão nova do GitHub sem ninguém mexer: a cada 5 minutos procura; se mudou algo do servidor (servidor-ia/ ou
# .devcontainer/), atualiza e, quando nenhuma música está sendo ouvida, reinicia o servidor com o código novo (antes o
# código novo só valia quando o Codespace era desligado e ligado de novo). Pacotes novos instalam antes de reiniciar
(
  while sleep "${IA_ATUALIZAR_A_CADA:-300}"; do
    git -C .. diff --quiet && git -C .. diff --cached --quiet || continue
    antes=$(git -C .. rev-parse HEAD)
    git -C .. pull -q --ff-only 2>/dev/null || continue
    depois=$(git -C .. rev-parse HEAD)
    [ "$antes" = "$depois" ] && continue
    git -C .. diff --quiet "$antes" "$depois" -- servidor-ia .devcontainer && continue
    echo "Versão nova do GitHub: $(git -C .. log -1 --format='%h %s')"
    sha256sum -c --status dados/.requisitos 2>/dev/null || bash ../.devcontainer/instalar.sh
    for _ in $(seq 60); do  # espera as músicas que estão sendo ouvidas (até 30 minutos)
      curl -s -m 5 http://127.0.0.1:${PORT:-7860}/saude | grep -q '"ocupado": *0' && break
      sleep 30
    done
    echo "Reiniciando o servidor com a versão nova…"
    pkill -f "^python iniciar_pc\.py" 2>/dev/null
  done
) &

# se o servidor cair, liga de novo (no máximo 5 vezes seguidas em menos de um minuto)
quedas=0
while true; do
  inicio=$(date +%s)
  wait "$PID"
  echo "O servidor parou (código $?)."
  [ $(( $(date +%s) - inicio )) -gt 60 ] && quedas=0
  quedas=$((quedas + 1))
  [ "$quedas" -gt 5 ] && { echo "O servidor caiu várias vezes seguidas: veja o erro acima."; exit 1; }
  sleep 5
  ligar
done
