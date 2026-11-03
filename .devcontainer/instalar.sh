#!/usr/bin/env bash
# Instala o servidor da IA no Codespace: quando ele é criado (uns 10 minutos) e quando uma versão nova pede pacotes
# novos (o servidor.sh roda de novo, por trás, com o servidor já ligado). Só os pacotes podem falhar a instalação: os
# modelos que não baixarem agora baixam na primeira vez que forem usados.
set -e
cd "$(dirname "$0")/../servidor-ia"
if ! command -v ffmpeg >/dev/null || ! ldconfig -p 2>/dev/null | grep -q libsndfile; then
  sudo apt-get update -q && sudo apt-get install -y -q --no-install-recommends ffmpeg libsndfile1
fi
pip install -q -U pip
# o torchvision junto, do mesmo índice (CPU): o audio-separator o pede (pelo onnx2torch) e, sem ele aqui, o pip ia buscar
# no PyPI o torch com CUDA (vários GB) no lugar deste
pip install -q torch torchaudio torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -q -r requirements.txt
# o Codespace não tem placa de vídeo: os pacotes da CUDA (vários GB) que uma instalação anterior baixou sem querer saem
pip list --format=freeze 2>/dev/null | grep -iE '^(nvidia-|cuda-)' | cut -d= -f1 | xargs -r pip uninstall -y -q || true
pip install -q --no-deps basic-pitch==0.4.0
# os pacotes estão instalados: o servidor.sh não instala de novo enquanto o requirements.txt não mudar
mkdir -p dados
sha256sum requirements.txt > dados/.requisitos
set +e
echo "Baixando os modelos de IA..."
python -c "from demucs.pretrained import get_model; get_model('htdemucs')" || echo "Aviso: o Demucs não baixou agora (baixa na primeira vez que for usado)."
python -c "from faster_whisper import WhisperModel; WhisperModel('small', device='cpu', compute_type='int8')" || echo "Aviso: o Whisper não baixou agora (baixa na primeira vez que for usado)."
# o alinhador da letra (MMS_FA, uns 1,2 GB): encaixa a letra na voz, para a letra sincronizada
python -c "from torchaudio.pipelines import MMS_FA; MMS_FA.get_model(with_star=False)" || echo "Aviso: o alinhador da letra não baixou agora (baixa na primeira vez que for usado)."
# os modelos da partitura mais precisa: as batidas (Beat This!) e o solista longe do backing vocal (o karaokê)
python -c "from beat_this.inference import load_model; load_model('final0')" || echo "Aviso: o Beat This! não baixou agora (baixa na primeira vez que for usado)."
export IA_MODELOS_SEPARACAO="$PWD/dados/modelos-separacao"
python -c "import os; from audio_separator.separator import Separator; Separator(model_file_dir=os.environ['IA_MODELOS_SEPARACAO']).load_model('UVR_MDXNET_KARA_2.onnx')" || echo "Aviso: o modelo do solista não baixou agora (baixa na primeira vez que for usado)."
echo "Servidor da IA instalado."
