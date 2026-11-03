#!/usr/bin/env bash
# Liga o servidor da IA cada vez que o Codespace liga (o postStartCommand do devcontainer.json). Tudo sozinho: a versão
# nova do GitHub, os pacotes, o servidor, o endereço público e o endereço no site (ver servidor.sh e
# servidor-ia/codespace.py). O que ele faz fica em servidor-ia/dados/servidor.log
# (no Terminal: tail -f servidor-ia/dados/servidor.log)
cd "$(dirname "$0")/../servidor-ia" || exit 1
mkdir -p dados
# as chaves da IA (os secrets do Codespaces: GEMINI_API_KEY, ANTHROPIC_API_KEY) para o servidor que já está ligado:
# ele lê este arquivo a cada pergunta, então a chave gravada depois vale sem religar (duvidas.segredo)
# (só regrava quando há alguma chave aqui: rodado sem os secrets, fica a que já estava)
(
  umask 077
  novo=$(for nome in GEMINI_API_KEY GOOGLE_API_KEY ANTHROPIC_API_KEY; do
    [ -n "${!nome}" ] && printf '%s=%s\n' "$nome" "${!nome}"
  done)
  if [ -n "$novo" ]; then printf '%s\n' "$novo" > dados/chaves.env; fi
)
# já ligado (o ligar.sh rodado de novo à mão): não liga outro
if pgrep -f "^bash \.\./\.devcontainer/servidor\.sh" >/dev/null 2>&1; then
  # ligado, mas o ajudante do endereço público parou (ou é de uma versão antiga): só ele liga de novo
  if ! pgrep -f "^python codespace\.py" >/dev/null 2>&1 && [ ! -s dados/endereco.txt ]; then
    echo "ligar.sh: o servidor está ligado; ligando de novo o endereço público ($(date '+%d/%m %H:%M:%S'))" >> dados/servidor.log
    nohup setsid python codespace.py >> dados/servidor.log 2>&1 < /dev/null &
    disown 2>/dev/null || true
    echo "O servidor já está ligado; o endereço público está sendo publicado. Log: servidor-ia/dados/servidor.log"
    exit 0
  fi
  echo "O servidor da IA já está ligado. O que ele está fazendo: tail -f servidor-ia/dados/servidor.log"
  exit 0
fi
# um servidor ligado pelo script antigo (antes do servidor.sh): sai, para os dois não brigarem pela porta 7860
pkill -f "python iniciar_pc.py" >/dev/null 2>&1 && sleep 2
: > dados/servidor.log  # o log começa limpo a cada vez que liga
rm -f dados/endereco.txt  # o endereço da vez anterior (o túnel muda): o codespace.py grava o novo
echo "ligar.sh: ligando o servidor ($(date '+%d/%m %H:%M:%S'))" >> dados/servidor.log
# nohup + setsid + disown: o servidor fica de pé depois que este comando termina. Só com o setsid, o Codespace
# derrubava o servidor junto quando o comando de início (postStartCommand) acabava, e o log ficava vazio
nohup setsid bash ../.devcontainer/servidor.sh >> dados/servidor.log 2>&1 < /dev/null &
disown 2>/dev/null || true
sleep 2  # deixa o servidor.sh sair do grupo do comando de início antes de ele terminar
echo "Servidor da IA ligando (uns segundos; com pacotes novos, eles instalam por trás). Log: servidor-ia/dados/servidor.log"
