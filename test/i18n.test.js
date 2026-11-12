import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { criarTradutor, idiomaDe, t } from '../public/js/lib/i18n.js';
import en from '../public/js/lib/i18n-en.js';
import es from '../public/js/lib/i18n-es.js';
import { NOVIDADES } from '../public/js/lib/novidades.js';

// o app segue o idioma do aparelho: português, inglês e espanhol; qualquer outro idioma fica em inglês
test('idioma: o do aparelho, com o inglês para os que o app não tem', () => {
  assert.equal(idiomaDe(['pt-BR', 'en-US']), 'pt');
  assert.equal(idiomaDe(['pt-PT']), 'pt');
  assert.equal(idiomaDe(['en-US', 'pt-BR']), 'en');
  assert.equal(idiomaDe(['es-MX']), 'es');
  assert.equal(idiomaDe(['es-419']), 'es');
  assert.equal(idiomaDe(['fr-FR', 'pt-BR']), 'en'); // (vale o primeiro: o idioma do aparelho)
  assert.equal(idiomaDe(['ko-KR']), 'en');
  assert.equal(idiomaDe([]), 'en');
  assert.equal(idiomaDe('es'), 'es');
});

test('idioma: fora do navegador (os testes, o servidor) os textos ficam em português', () => {
  assert.equal(t('Salvar'), 'Salvar');
});

test('tradução: texto inteiro, trecho que muda, número e plural', () => {
  const tr = criarTradutor({
    Salvar: 'Save',
    'Excluir {}?': 'Delete {1}?',
    'o repertório': 'the setlist',
    '{n} músicas': '{1} {1|song|songs}',
    '{} de {n}': '{1} {2}',
    março: 'March',
    '“{}” será apagada.': '“{1}” will be deleted.',
    Hoje: 'Today',
    'Músicas curtidas': 'Liked songs',
  });
  assert.equal(tr('Salvar'), 'Save');
  assert.equal(tr('Outra coisa'), null);
  assert.equal(tr('Excluir o repertório?'), 'Delete the setlist?'); // (o trecho também é texto do app)
  assert.equal(tr('1 músicas'), '1 song');
  assert.equal(tr('28 músicas'), '28 songs');
  assert.equal(tr('1.234 músicas'), '1.234 songs');
  assert.equal(tr('março de 2026'), 'March 2026');
  assert.equal(tr('Coração de Jesus'), null); // (o segundo trecho é só número: um nome não casa)
  assert.equal(tr('“Hoje” será apagada.'), '“Hoje” will be deleted.'); // (um nome entre aspas fica como está)
  assert.equal(tr('Músicas curtidas · 28 músicas'), 'Liked songs · 28 songs'); // (vários textos numa linha)
});

test('tradução: o nome de uma música nunca é trocado', () => {
  const tr = criarTradutor({ Hoje: 'Today', 'Cifra própria': 'Own chords', 'Missa de {}': 'Mass of {1}', Vídeo: 'Video', '{n} músicas': '{1} songs', 'Nada encontrado com esse nome.': 'Nothing found with that name.' },
    { ehDado: (s) => s === 'Missa de domingo' });
  // onde fica o nome da música (modo "dado"): texto curto fica; uma frase do app é trocada
  assert.equal(tr('Hoje', 'dado'), null);
  assert.equal(tr('Missa de sábado', 'dado'), null);
  assert.equal(tr('Nada encontrado com esse nome.', 'dado'), 'Nothing found with that name.');
  assert.equal(tr('3 músicas', 'dado'), '3 songs'); // (só número: é sempre do app)
  // ao lado do nome do artista (modo "partes"): uma palavra sozinha fica; os pedaços de uma linha são trocados
  assert.equal(tr('Hoje', 'partes'), null);
  assert.equal(tr('Cifra própria', 'partes'), 'Own chords');
  assert.equal(tr('Vídeo · 3 músicas', 'partes'), 'Video · 3 songs');
  // um nome guardado na biblioteca não é trocado em lugar nenhum
  assert.equal(tr('Missa de domingo'), null);
  assert.equal(tr('Missa de sábado'), 'Mass of sábado');
});

// os dois dicionários: cada tradução só usa os trechos que a chave tem
test('dicionários: inglês e espanhol bem formados', () => {
  for (const [nome, dic] of [['en', en], ['es', es]]) {
    const chaves = Object.keys(dic);
    assert.ok(chaves.length > 2000, `${nome}: ${chaves.length} textos`);
    for (const [chave, valor] of Object.entries(dic)) {
      assert.equal(typeof valor, 'string');
      assert.ok(valor.trim(), `${nome}: tradução vazia de "${chave}"`);
      assert.equal(chave, chave.replace(/\s+/g, ' ').trim(), `${nome}: a chave "${chave}" tem espaço sobrando`);
      const trechos = (chave.match(/\{n?\}/g) || []).length;
      for (const [, k] of valor.matchAll(/\{(\d+)(?:\|[^}]*)?\}/g)) assert.ok(Number(k) >= 1 && Number(k) <= trechos, `${nome}: "${chave}" não tem o trecho {${k}}`);
    }
    criarTradutor(dic); // (os padrões montam sem erro)
  }
});

test('dicionários: os textos mais vistos do app', () => {
  const ingles = criarTradutor(en);
  const espanhol = criarTradutor(es);
  assert.equal(ingles('Biblioteca'), 'Library');
  assert.equal(espanhol('Buscar'), null); // (igual nos dois idiomas: não entra no dicionário e fica como está)
  assert.equal(espanhol('Salvar'), 'Guardar');
  assert.equal(ingles('Tocando agora'), 'Now playing');
  assert.equal(espanhol('Tocando agora'), 'Reproduciendo');
  assert.equal(ingles('Playlist • 3 músicas'), 'Playlist • 3 songs');
  assert.equal(espanhol('Playlist • 1 música'), 'Playlist • 1 canción');
  assert.equal(espanhol('28 músicas'), '28 canciones');
  assert.equal(ingles('8–14 de nov.'), 'Nov 8–14');
  assert.equal(ingles('Baixando 37%'), 'Downloading 37%');
  // os botões que mudam de texto enquanto trabalham (a atualização do app, a limpeza do cache)
  assert.equal(ingles('Baixando…'), 'Downloading…');
  assert.equal(ingles('Baixando… 42%'), 'Downloading… 42%');
  assert.equal(ingles('Instalando…'), 'Installing…');
  assert.equal(ingles('Limpando…'), 'Clearing…');
  assert.equal(espanhol('Limpando…'), 'Borrando…');
  assert.equal(espanhol('Baixando…'), 'Descargando…');
  // um texto conhecido com reticências ou dois-pontos no fim, mesmo sem entrada própria
  assert.equal(ingles('Preparando…'), 'Preparing…');
  assert.equal(ingles('Artista:'), 'Artist:');
});

// a nota da versão aparece no idioma do aparelho: o título e cada item entram nos dois dicionários
test('dicionários: a nota de cada versão (da 655 em diante) em inglês e espanhol', () => {
  for (const n of NOVIDADES.filter((x) => x.versao >= 655)) {
    for (const texto of [n.titulo, ...n.itens.map((i) => i.texto)]) {
      assert.ok(en[texto], `versão ${n.versao}: falta em i18n-en.js: "${texto.slice(0, 60)}…"`);
      assert.ok(es[texto], `versão ${n.versao}: falta em i18n-es.js: "${texto.slice(0, 60)}…"`);
    }
  }
});

test('dicionários: vão no pacote que funciona sem internet', async () => {
  const sw = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
  for (const f of ['js/lib/i18n.js', 'js/lib/i18n-en.js', 'js/lib/i18n-es.js']) assert.ok(sw.includes(`'${f}'`), `${f} fora do SHELL do sw.js`);
});
