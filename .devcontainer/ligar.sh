#!/usr/bin/env bash
# Liga o servidor da IA cada vez que o Codespace liga. O celular chega nele pelo endereço da porta 7860, que precisa
# ser Pública (sem isso o GitHub pede login e o app não entra). O que ele faz fica em servidor-ia/dados/servidor.log
# (no Terminal: tail -f servidor-ia/dados/servidor.log)
cd "$(dirname "$0")/../servidor-ia"
mkdir -p dados
# a porta pública: pelo gh do próprio Codespace (se não der, a pessoa muda na aba Portas)
(sleep 20; gh codespace ports visibility 7860:public -c "$CODESPACE_NAME" >/dev/null 2>&1) &
# setsid: o servidor fica de pé depois que este comando termina (sem ele, o Codespace derrubava o servidor junto).
# Antes de ligar:
# 1. a versão nova do GitHub: o Codespace guarda o código de quando foi criado, e o que entrava no GitHub depois
#    (um merge) nunca chegava ao servidor. Puxa o ramo, se não há mudança feita à mão aqui;
# 2. os pacotes: se a instalação da criação não terminou, ou se a versão nova pede pacotes novos (requirements.txt
#    mudou desde a última instalação), instala antes de ligar.
setsid bash -c '
  if git -C .. diff --quiet && git -C .. diff --cached --quiet; then
    git -C .. pull -q --ff-only && echo "Código atualizado: $(git -C .. log -1 --format="%h %s")" \
      || echo "Aviso: não consegui atualizar o código (segue com o que já tem)."
  else
    echo "Aviso: há mudanças feitas aqui no Codespace; o código não foi atualizado."
  fi
  if ! python -c "import uvicorn, fastapi, demucs" 2>/dev/null || ! sha256sum -c --status dados/.requisitos 2>/dev/null; then
    bash ../.devcontainer/instalar.sh || echo "Aviso: a instalação dos pacotes falhou; o servidor liga com o que já tem."
  fi
  IA_SEM_TUNEL=1 IA_THREADS=$(nproc) IA_TAREFAS=3 exec python iniciar_pc.py
' > dados/servidor.log 2>&1 < /dev/null &
echo "Servidor da IA ligando (uns segundos; na primeira vez, até 15 minutos): aba Portas → 7860 → globo."
