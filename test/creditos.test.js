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
