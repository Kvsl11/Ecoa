import { processarMusicaImportada } from './importacao-musical.js';

const android = () => Boolean(globalThis.Capacitor?.isNativePlatform?.() || /EcoaAndroid|Android/i.test(navigator.userAgent));
if (android()) {
  const estilo = document.createElement('style');
  estilo.textContent = `
    #eco-musica-abrir{position:fixed;z-index:1200;right:18px;bottom:calc(22px + env(safe-area-inset-bottom));border:0;border-radius:999px;padding:13px 18px;background:var(--accent,#8b7cf6);color:#fff;font:600 14px system-ui;box-shadow:0 5px 24px #0005}
    #eco-musica-fundo{position:fixed;inset:0;z-index:1300;background:#000b;display:none;align-items:center;justify-content:center;padding:16px}
    #eco-musica-fundo.aberto{display:flex}
    #eco-musica-painel{width:min(720px,100%);max-height:90dvh;overflow:auto;background:var(--panel,#202124);color:var(--text,#fff);border:1px solid var(--border,#5556);border-radius:18px;padding:20px;box-shadow:0 20px 60px #0008}
    #eco-musica-painel h2{font-size:20px;margin:0 0 8px}
    #eco-musica-painel p{color:var(--muted,#aaa);font-size:13px;line-height:1.5}
    #eco-musica-painel label{display:block;font-size:12px;color:var(--muted,#aaa);margin:12px 0 5px}
    #eco-musica-painel input,#eco-musica-painel textarea{box-sizing:border-box;width:100%;border:1px solid var(--border,#5558);border-radius:10px;padding:10px;background:var(--surface,#151515);color:inherit;font:14px system-ui}
    #eco-musica-painel textarea{min-height:130px;resize:vertical;white-space:pre-wrap}
    #eco-musica-acoes{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
    #eco-musica-acoes button{border:1px solid var(--border,#5558);border-radius:10px;padding:10px 13px;background:var(--surface,#333);color:inherit;font:600 13px system-ui}
    #eco-musica-acoes button.principal{background:var(--accent,#8b7cf6);color:white;border:0}
    #eco-musica-status{padding:10px 12px;border-radius:10px;background:var(--surface,#151515);font-size:13px;margin-top:12px;white-space:pre-wrap}
    #eco-musica-resultado{display:none;margin-top:16px}
    #eco-musica-resumo{font-size:13px;line-height:1.6;margin:10px 0}
    @media(max-width:600px){#eco-musica-abrir{right:12px;bottom:calc(88px + env(safe-area-inset-bottom));padding:12px 14px}#eco-musica-painel{padding:16px}}
  `;
  document.head.appendChild(estilo);

  const abrir = document.createElement('button');
  abrir.id = 'eco-musica-abrir';
  abrir.type = 'button';
  abrir.textContent = '♫ Gerar letra + cifra';
  abrir.setAttribute('aria-haspopup', 'dialog');

  const fundo = document.createElement('div');
  fundo.id = 'eco-musica-fundo';
  fundo.innerHTML = `
    <section id="eco-musica-painel" role="dialog" aria-modal="true" aria-labelledby="eco-musica-titulo">
      <h2 id="eco-musica-titulo">Gerar letra e cifra da música</h2>
      <p>Escolha um áudio. O Gemini transcreve a letra com os tempos; o tom, o BPM e os acordes são analisados no próprio celular. Não precisa ligar seu servidor.</p>
      <label for="eco-musica-arquivo">Arquivo de áudio</label>
      <input id="eco-musica-arquivo" type="file" accept="audio/*,.mp3,.m4a,.mp4,.wav,.ogg,.opus,.aac,.flac,.wma,.aif,.aiff,.amr,.3gp,.ape,.alac,.ac3,.mka,.webm">
      <label for="eco-musica-titulo-input">Título (opcional)</label>
      <input id="eco-musica-titulo-input" type="text" placeholder="Nome da música">
      <label for="eco-musica-artista">Artista (opcional)</label>
      <input id="eco-musica-artista" type="text" placeholder="Nome do artista">
      <div id="eco-musica-status" role="status">Selecione uma música para começar.</div>
      <div id="eco-musica-resultado">
        <div id="eco-musica-resumo"></div>
        <label for="eco-musica-lrc">Letra sincronizada (LRC)</label>
        <textarea id="eco-musica-lrc" readonly></textarea>
        <label for="eco-musica-cho">Cifra com acordes sincronizados (ChordPro)</label>
        <textarea id="eco-musica-cho" readonly></textarea>
        <div id="eco-musica-acoes">
          <button type="button" id="eco-musica-baixar-lrc">Salvar letra .lrc</button>
          <button type="button" id="eco-musica-baixar-cho">Salvar cifra .cho</button>
        </div>
      </div>
      <div id="eco-musica-acoes">
        <button type="button" id="eco-musica-fechar">Fechar</button>
        <button type="button" class="principal" id="eco-musica-gerar">Gerar agora</button>
      </div>
      <p>Os arquivos LRC e ChordPro podem ser importados no app. A geração não altera automaticamente uma música já salva na biblioteca.</p>
    </section>`;
  document.body.append(abrir, fundo);

  const el = (id) => document.getElementById(id);
  const status = (s) => { el('eco-musica-status').textContent = s; };
  const fechar = () => fundo.classList.remove('aberto');
  abrir.addEventListener('click', () => fundo.classList.add('aberto'));
  el('eco-musica-fechar').addEventListener('click', fechar);
  fundo.addEventListener('click', (e) => { if (e.target === fundo) fechar(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && fundo.classList.contains('aberto')) fechar(); });

  let resultado = null;
  const baixar = (nome, conteudo, tipo) => {
    const url = URL.createObjectURL(new Blob([conteudo], { type }));
    const a = document.createElement('a');
    a.href = url; a.download = nome; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };
  el('eco-musica-baixar-lrc').addEventListener('click', () => {
    if (resultado) baixar((resultado.titulo || 'musica') + '.lrc', resultado.lrc, 'text/plain;charset=utf-8');
  });
  el('eco-musica-baixar-cho').addEventListener('click', () => {
    if (resultado) baixar((resultado.titulo || 'musica') + '.cho', resultado.cifra, 'text/plain;charset=utf-8');
  });
  el('eco-musica-gerar').addEventListener('click', async () => {
    const arquivo = el('eco-musica-arquivo').files?.[0];
    if (!arquivo) { status('Escolha um arquivo de áudio primeiro.'); return; }
    const botao = el('eco-musica-gerar');
    botao.disabled = true;
    resultado = null;
    el('eco-musica-resultado').style.display = 'none';
    try {
      const r = await processarMusicaImportada(arquivo, {
        titulo: el('eco-musica-titulo-input').value,
        artista: el('eco-musica-artista').value,
        aoProgresso: status,
      });
      resultado = r;
      el('eco-musica-lrc').value = r.lrc;
      el('eco-musica-cho').value = r.cifra;
      const tom = r.tom?.nome || 'não identificado';
      const bpm = r.bpm ? r.bpm + ' BPM' : 'andamento não identificado';
      el('eco-musica-resumo').textContent = r.linhas.length + ' linhas transcritas · Tom ' + tom + ' · ' + bpm + ' · ' + Math.round(r.duracao) + ' s';
      el('eco-musica-resultado').style.display = 'block';
      status('Concluído. Confira a letra e a cifra antes de salvar.');
    } catch (e) {
      status('Não foi possível gerar: ' + (e?.message || e));
    } finally {
      botao.disabled = false;
    }
  });
}
