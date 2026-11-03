#!/usr/bin/env bash
# Liga o servidor da IA cada vez que o Codespace liga (o postStartCommand do devcontainer.json). Tudo sozinho: a versão
# nova do GitHub, os pacotes, o servidor, o endereço público e o endereço no site (ver servidor.sh e
# servidor-ia/codespace.py). O que ele faz fica em servidor-ia/dados/servidor.log
# (no Terminal: tail -f servidor-ia/dados/servidor.log)
cd "$(dirname "$0")/../servidor-ia" || exit 1
mkdir -p dados
# já ligado (o ligar.sh rodado de novo à mão): não liga outro
if pgrep -f "devcontainer/servidor.sh" >/dev/null 2>&1; then
  echo "O servidor da IA já está ligado. O que ele está fazendo: tail -f servidor-ia/dados/servidor.log"
  exit 0
fi
# um servidor ligado pelo script antigo (antes do servidor.sh): sai, para os dois não brigarem pela porta 7860
pkill -f "python iniciar_pc.py" >/dev/null 2>&1 && sleep 2
: > dados/servidor.log  # o log começa limpo a cada vez que liga
# setsid: o servidor fica de pé depois que este comando termina (sem ele, o Codespace derrubava o servidor junto)
setsid bash ../.devcontainer/servidor.sh >> dados/servidor.log 2>&1 < /dev/null &
echo "Servidor da IA ligando (uns segundos; com pacotes novos, eles instalam por trás). Log: servidor-ia/dados/servidor.log"
