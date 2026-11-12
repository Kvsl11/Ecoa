import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cifraNasLinhas } from '../public/js/lib/cifra-sincronizada.js';

// cifra com frases juntas numa linha só e o refrão escrito uma vez; a letra sincronizada com uma frase por linha
const CIFRA = `{key: G}
{start_of_verse: Verse 1}
[G]Vem cantar comigo [D]nesta manhã de sol e [Em]luz
[C]Abre o coração
{end_of_verse}
{start_of_chorus}
[G]Ohhh
[D]Canta, canta, canta
{end_of_chorus}`;

const LETRA = ['Vem cantar comigo', 'Nesta manhã de sol e luz', 'Abre o coração', 'Ooh-ooh', 'Canta, canta, canta', 'Canta, canta, canta'];

test('põe os acordes da cifra nas frases da letra sincronizada, uma linha por frase', () => {
  const r = cifraNasLinhas(CIFRA, LETRA);
  assert.ok(r);
  const linhas = r.content.split('\n').filter((l) => l && !/^\{/.test(l));
  assert.equal(linhas.length, LETRA.length);
  assert.deepEqual(linhas.slice(0, 5), ['[G]Vem cantar comigo', '[D]Nesta manhã de sol e [Em]luz', '[C]Abre o coração', '[G]Ooh-ooh', '[D]Canta, canta, canta']);
  // a frase repetida (o refrão escrito uma vez só) leva os mesmos acordes
  assert.equal(linhas[5], '[D]Canta, canta, canta');
  // as seções da cifra continuam
  assert.match(r.content, /\{start_of_verse: Verse 1\}/);
  assert.match(r.content, /\{start_of_chorus\}/);
});

test('cifra que não bate com a letra: fica como está (null)', () => {
  assert.equal(cifraNasLinhas(CIFRA, ['Uma letra toda diferente', 'sem nada em comum aqui']), null);
  assert.equal(cifraNasLinhas('Sem acordes nenhum', LETRA), null);
});

// música em coreano: a letra sincronizada vem em hangul e a cifra do site, romanizada. Os acordes vão para a letra em
// hangul (a mesma da aba Letra), comparando as palavras pelo som
test('coreano: a cifra romanizada vai para a letra em hangul', async () => {
  const { romanizar, temHangul } = await import('../public/js/lib/cifra-sincronizada.js');
  assert.equal(romanizar('내 낡은 기타를 들어'), 'nae nalgeun gitareul deureo');
  assert.equal(romanizar("그냥 들어요, I'll sing for you"), "geunyang deureoyo, I'll sing for you");
  assert.equal(temHangul('Sing for you'), false);
  assert.equal(temHangul('혹은 hey'), true);
  const cifra = `{key: Ab}
{start_of_verse: Verse 1}
[C7M]Nae nalkeun gitareul deureo
haji [Bm11]motan gobaegeul
[C7M]Hogeun gojipseure samkin
[Em9]iya[F#m7]gi[Fm7]reul
[C7M]Norae hana mandeun
Cheok jigeum [E7(4)]malharyeo
[E7]haeyo
Geunyang deu[Am9]reoyo I'll [D9(4)]sing for
[G]you
{end_of_verse}`;
  const letra = ['내 낡은 기타를 들어 하지 못한 고백을', '혹은 고집스레 삼킨 이야기를', '노래 하나 만든 척 지금 말하려 해요', "그냥 들어요, I'll sing for you"];
  const r = cifraNasLinhas(cifra, letra);
  assert.ok(r, 'a cifra romanizada casou com a letra em hangul');
  const linhas = r.content.split('\n').filter((l) => /[가-힣]/.test(l));
  assert.equal(linhas.length, 4);
  // a letra é a da música (hangul), e não a romanizada
  assert.deepEqual(linhas.map((l) => l.replace(/\[[^\]]*\]/g, '')), letra);
  assert.equal((r.content.match(/\[[^\]]+\]/g) || []).length, 12, 'os 12 acordes da cifra');
  assert.ok(linhas[0].startsWith('[C7M]내 낡은'));
  assert.ok(linhas[0].includes('[Bm11]못한'));
  assert.ok(linhas[3].endsWith('[G]you'));
  // outra música (letra em hangul que não é a da cifra): continua sem casar
  assert.equal(cifraNasLinhas(cifra, ['사랑해요 그대만을', '영원히 함께해요 우리', '오늘 밤 별이 빛나요', '꿈속에서 만나요']), null);
});
