import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creditosDaFicha, nomesDaFicha, creditosDaWikipedia } from '../public/js/lib/web.js';

const PAGINA = `{{Short description|2023 song by Jungkook}}
{{Infobox song
| name       = Standing Next to You
| cover      = Jungkook - Golden.png
| type       = [[Single (music)|single]]
| artist     = [[Jungkook]]
| album      = [[Golden (Jungkook album)|Golden]]
| released   = {{Start date|2023|11|3}}
| genre      = {{hlist|[[Funk]]|[[pop music|pop]]}}
| label      = [[Big Hit Music|Big Hit]]
| writer     = {{flatlist|
* [[Andrew Watt (record producer)|Andrew Watt]]
* [[Cirkut (record producer)|Henry Walter]]
* [[Ali Tamposi]]
* [[Jon Bellion]]<ref>{{cite web|title=x}}</ref>
}}
| producer   = {{hlist|Andrew Watt|[[Cirkut (record producer)|Cirkut]]}}
}}
'''"Standing Next to You"''' is a song...`;

test('a ficha da música na Wikipédia: quem compôs, quem produziu, o selo e o ano', () => {
  const c = creditosDaFicha(PAGINA);
  assert.equal(c.titulo, 'Standing Next to You');
  assert.equal(c.artista, 'Jungkook');
  assert.deepEqual(c.compositores, ['Andrew Watt', 'Henry Walter', 'Ali Tamposi', 'Jon Bellion']);
  assert.deepEqual(c.letristas, c.compositores);
  assert.deepEqual(c.produtores, ['Andrew Watt', 'Cirkut']);
  assert.deepEqual(c.selos, ['Big Hit']);
  assert.equal(c.ano, '2023');
  assert.equal(creditosDaFicha('sem ficha'), null);
  assert.deepEqual(nomesDaFicha('[[Max Martin]], [[Shellback]] and Ali Payami<br />Oscar Holter'), ['Max Martin', 'Shellback', 'Ali Payami', 'Oscar Holter']);
});

test('a página da Wikipédia só vale com o mesmo título e o mesmo artista', async () => {
  const resposta = (paginas) => async () => ({ ok: true, json: async () => ({ query: { pages: paginas } }) });
  const pg = (title, texto, index) => ({ title, index, revisions: [{ slots: { main: { '*': texto } } }] });
  const outra = PAGINA.replace('[[Jungkook]]', '[[Kidz Bop Kids]]');
  const r = await creditosDaWikipedia({ titulo: 'Standing Next to You', artista: 'Jung Kook' }, { fetchImpl: resposta({ 1: pg('Standing Next to You (cover)', outra, 1), 2: pg('Standing Next to You', PAGINA, 2) }) });
  assert.deepEqual(r.produtores, ['Andrew Watt', 'Cirkut']);
  assert.match(r.url, /Standing_Next_to_You$/);
  const nada = await creditosDaWikipedia({ titulo: 'Seven', artista: 'Jung Kook' }, { fetchImpl: resposta({ 2: pg('Standing Next to You', PAGINA, 2) }) });
  assert.equal(nada, null);
});

test('o nome da música e o artista certos nos vídeos do artista (o canal da empresa não é o artista)', async () => {
  const { nomesDoVideoDoArtista: n } = await import('../public/js/lib/web.js');
  assert.deepEqual(n("정국 (Jung Kook) 'Seven (feat. Latto)' Official MV", 'Jung Kook'), { titulo: 'Seven (feat. Latto)', artista: 'Jung Kook', musica: true });
  assert.equal(n("정국 (Jung Kook) 'Standing Next to You' Official MV", 'Jung Kook').titulo, 'Standing Next to You');
  assert.equal(n('Charlie Puth - Left and Right (feat. Jung Kook of BTS) [Official Video]', 'Charlie Puth').titulo, 'Left and Right (feat. Jung Kook of BTS)');
  assert.equal(n('Dreamers | Jung Kook', 'Jung Kook').titulo, 'Dreamers');
  assert.equal(n('Bruno Mars - Die With A Smile (Official Music Video)', 'Bruno Mars').titulo, 'Die With A Smile');
  // (o que não é música fica de fora)
  assert.equal(n('GRAFF, Jung Kook: I Wear GRAFF', 'Jung Kook').musica, false);
  assert.equal(n('Jung Kook interview on the new album', 'Jung Kook').musica, false);
  assert.equal(n('Some other artist - Song (Official Video)', 'Jung Kook').musica, false);
});

test('vídeos de fã ficam de fora e o título com várias partes fica só com a música', async () => {
  const { nomesDoVideoDoArtista: n } = await import('../public/js/lib/web.js');
  assert.equal(n('[FMV] JEON JUNGKOOK - KISS IT BETTER || FMV VIDEO', 'Jung Kook').musica, false);
  assert.equal(n('Jungkook  - Fading (2026 BTS Jungkook new song )FMV', 'Jung Kook').musica, false);
  assert.equal(n('정국 Jung Kook (of BTS) featuring Fahad Al Kubaisi - Dreamers | FIFA World Cup 2022 Soundtrack', 'Jung Kook').titulo, 'Dreamers');
});
