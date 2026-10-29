import { describe, expect, it } from 'vitest';
import { syllabify } from './syllables';
import { analyze, multiplicityOf } from './analyze';

const vowels = (verse: string) => syllabify(verse).map((s) => s.vowel).join('');

describe('syllabify', () => {
  it('treats "i" before a vowel as softening', () => {
    expect(vowels('nie wiem')).toBe('ee');
    expect(vowels('pianino')).toBe('aio');
  });

  it('normalizes vowels that sound alike', () => {
    expect(vowels('góra są tę')).toBe('uaoe');
  });

  it('skips words without vowels', () => {
    expect(vowels('w domu z tobą')).toBe('ouoo');
  });

  it('splits consonant clusters and keeps digraphs together', () => {
    const verse = 'klatki szczęście';
    expect(syllabify(verse).map((s) => verse.slice(s.start, s.end))).toEqual(['klat', 'ki', 'szczę', 'ście']);
  });
});

describe('multiplicityOf', () => {
  it('maps syllable count to rhyme multiplicity', () => {
    expect([1, 2, 3, 4, 5, 6, 7].map(multiplicityOf)).toEqual([1, 1, 2, 2, 3, 3, 4]);
  });
});

describe('analyze', () => {
  it('finds a double rhyme at the end of verses', () => {
    const { groups } = analyze(['Ciągle mam to w mojej głowie', 'Nic nie mówię, ale w twojej mowie']);
    const group = groups.find((g) => g.occurrences.some((o) => o.text.endsWith('mojej głowie')));
    expect(group?.occurrences.some((o) => o.text.endsWith('twojej mowie'))).toBe(true);
    expect(group?.multiplicity).toBeGreaterThanOrEqual(2);
  });

  it('finds a rhyme at the end of one verse and the start of the next', () => {
    const { groups } = analyze(['Wszystko co mam to moja ekipa', 'Wezwij nas, gdy trzeba, będziemy w pobliżu']);
    const group = groups.find((g) => g.occurrences.some((o) => o.text === 'ekipa'));
    expect(group?.occurrences.map((o) => o.text)).toEqual(['ekipa', 'Wezwij nas']);
    expect(group?.multiplicity).toBe(2);
  });

  it('joins rhymes of different lengths that share an ending, skipping one extra syllable', () => {
    const { groups, verses } = analyze([
      'Ty, urodziłem się w Polsce',
      'Tu gdzie lata są nieistniejące, zimy nieistniejące',
      'A ładnie jest tu cztery miesiące',
      'Więc od ośmiu cię nie widzę, słońce',
    ]);
    const group = groups.find((g) => g.occurrences.some((o) => o.text.endsWith('się w Polsce')));
    const texts = group?.occurrences.map((o) => o.text) ?? [];
    expect(texts).toContain('nieistniejące');
    expect(texts.some((t) => t.endsWith('cztery miesiące'))).toBe(true);
    expect(texts.some((t) => t.endsWith('nie widzę, słońce'))).toBe(true);

    // "ry" ~ "istnie" since "y" rhymes with "i".
    const colorOf = (verse: number, text: string) => verses[verse]!.segments.find((s) => s.text.includes(text))?.color;
    expect(colorOf(2, 'czte')).toBeDefined();
    expect(colorOf(2, 'ry mie')).toBe(colorOf(1, 'istnie'));
  });

  it('rhymes "i" with "y" and allows a non-rhyming syllable in the middle of an end rhyme', () => {
    const { groups, verses } = analyze(['Czipsy kranczips', 'Krzysztof Krawczyk']);
    const group = groups.find((g) => g.occurrences.some((o) => o.text === 'Czipsy kranczips'));
    expect(group?.occurrences.map((o) => o.text)).toEqual(['Czipsy kranczips', 'Krzysztof Krawczyk']);
    expect(group?.length).toBe(3);
    expect(group?.multiplicity).toBe(2);

    const colorOf = (verse: number, text: string) => verses[verse]!.segments.find((s) => s.text === text)?.color;
    expect(colorOf(1, 'Krzy')).toBe(colorOf(0, 'Czip'));
    expect(colorOf(1, 'Krawczyk')).toBe(colorOf(0, 'kranczips'));
    expect(colorOf(0, 'Czip')).not.toBe(colorOf(0, 'kranczips'));
    expect(verses[1]!.segments.find((s) => s.text.includes('sztof'))?.color).toBeUndefined();
  });

  it('allows two extra syllables on one side and lines up stressed syllables', () => {
    const { groups, verses } = analyze([
      'a kiedyś prawie przyklepali mi za worek rok',
      'wszystko wam zaprezentuję chowaj pałer pojnt',
    ]);
    const group = groups.find((g) => g.occurrences.some((o) => o.text === 'worek rok'));
    expect(group?.occurrences.map((o) => o.text)).toEqual(['worek rok', 'chowaj pałer pojnt']);
    expect(group?.multiplicity).toBe(2);

    const colorOf = (verse: number, text: string) => verses[verse]!.segments.find((s) => s.text === text)?.color;
    // "worek" is one word, so it is one color; "cho" and "łer" around the gap share it.
    expect(colorOf(1, 'cho')).toBe(colorOf(0, 'worek'));
    expect(colorOf(1, 'łer')).toBe(colorOf(0, 'worek'));
    expect(colorOf(1, 'pojnt')).toBe(colorOf(0, 'rok'));
    expect(colorOf(0, 'za ')).toBeUndefined();
    expect(verses[1]!.segments.find((s) => s.text.includes('waj pa'))?.color).toBeUndefined();
  });

  it('finds the pattern of a quatrain without forcing unstressed fillers into it', () => {
    const { groups, verses } = analyze([
      'stylów na hitmana i nie robię szoł',
      'w międzyczasie piszę płyty swoim kolegom',
      'a kiedyś prawie przyklepali mi za worek rok',
      'wszystko wam zaprezentuję chowaj pałer pojnt',
    ]);
    const group = groups.find((g) => g.occurrences.some((o) => o.text.endsWith('robię szoł')));
    expect(group?.occurrences.map((o) => o.verse)).toEqual([0, 1, 2, 3]);
    expect(groups.some((g) => g.occurrences.some((o) => o.text === 'międzyczasie'))).toBe(true);

    // "mi" (i) must not share a color with "cho" (o).
    const colorOf = (verse: number, text: string) => verses[verse]!.segments.find((s) => s.text.includes(text))?.color;
    expect(colorOf(2, 'mi')).not.toBe(colorOf(3, 'cho'));
  });

  it('colors whole words and rhymes word-sized runs inside longer words', () => {
    const { verses } = analyze([
      'Niby wyleciałem z rapgry a to plotki są jak chuj',
      'Nadal dzwonili wydawcy, label ziomki mamy swój',
      'Zdejmij może z oczu klapki, palisz wrotki, a my susz',
      'Za dwa worki parę stów, kładę w portki parę sztuk',
    ]);
    const colorOf = (verse: number, text: string) => verses[verse]!.segments.find((s) => s.text === text)?.color;
    for (const [verse, text] of [[1, 'ziomki'], [1, 'mamy'], [1, 'swój'], [2, 'wrotki'], [2, 'a my'], [2, 'susz'], [3, 'worki'], [3, 'parę'], [3, 'stów']] as const) {
      expect(colorOf(verse, text), text).toBeDefined();
    }
    expect(colorOf(2, 'wrotki')).toBe(colorOf(1, 'ziomki'));
    expect(colorOf(2, 'a my')).toBe(colorOf(1, 'mamy'));
    expect(colorOf(2, 'susz')).toBe(colorOf(1, 'swój'));
    expect(colorOf(3, 'portki')).toBe(colorOf(3, 'worki'));
    expect(colorOf(1, 'li wy')).toBe(colorOf(0, 'Niby'));
    expect(colorOf(1, 'dzwoni')).toBe(colorOf(1, 'ziomki'));
    // Same vowels share a color across rhymes, different vowels never do.
    expect(colorOf(3, 'worki')).toBe(colorOf(1, 'ziomki'));
    expect(colorOf(3, 'stów')).toBe(colorOf(1, 'swój'));
    expect(colorOf(3, 'parę')).not.toBe(colorOf(1, 'mamy'));
    // Rhymes opening two verses count like end rhymes.
    expect(colorOf(1, 'Nadal')).toBeDefined();
    expect(colorOf(3, 'Za dwa')).toBe(colorOf(1, 'Nadal'));
  });

  it('prefers rhymes between verses at matching places over rhymes inside one verse', () => {
    const { verses } = analyze([
      'Nawet przyjaciel w kredki Ci nie daje',
      'Słów nie trzymasz za zębami, jesteś giętki to na razie',
      'Odyseja, wracam, kto się piekli go odpalę',
      'Nic mnie nie wzmocniło tak jak bycie biednym i na zwale',
    ]);
    const colorOf = (verse: number, text: string) => verses[verse]!.segments.find((s) => s.text === text)?.color;
    // "cie biednym i" ~ "ciel w kredki Ci", not "Nic mnie" ~ "bycie".
    expect(colorOf(3, 'cie')).toBe(colorOf(0, 'ciel'));
    expect(colorOf(3, 'biednym')).toBe(colorOf(0, 'kredki'));
    expect(colorOf(3, 'cie')).toBe(colorOf(2, 'się'));
    expect(colorOf(3, 'Nic mnie')).toBeUndefined();
    expect(colorOf(3, 'zwale')).toBe(colorOf(0, 'daje'));
  });

  it('keeps the o-e-o pattern of a quatrain in whole words', () => {
    const { verses } = analyze([
      'stylów na hitmana i nie robię szoł',
      'w międzyczasie piszę płyty swoim kolegom',
      'a kiedyś prawie przyklepali mi za worek rok',
      'wszystko wam zaprezentuję chowaj power point *pałer pojnt*',
    ]);
    expect(verses[1]!.segments.some((s) => s.text === 'kole' && s.color !== undefined)).toBe(true);
  });

  it('lets a rhyme run through a whole verse', () => {
    const { verses } = analyze([
      'Tu słyszysz ciągle drewno, marne gadki, wiesz jakie dziś rapsy',
      'Wmówili sobie że są gangsterami bez klamek #psychiatryk',
      'flow co te brawa tu rwie od ludzi rozwali nas',
      'fonope stawia tu grę do góry nogami, patrz',
    ]);
    const colorOf = (verse: number, text: string) => verses[verse]!.segments.find((s) => s.text === text)?.color;
    expect(colorOf(2, 'flow co')).toBeDefined();
    expect(colorOf(3, 'fono')).toBe(colorOf(2, 'flow co'));
  });

  it('finds rhymes across the whole text, past quatrains and stanza breaks', () => {
    const { verses, groups } = analyze([
      'Nocą to miasto zasypia jak dziecko',
      'b',
      'c',
      'd',
      '',
      'Ja piszę te wersy i płynę tak lekko',
    ]);
    expect(verses).toHaveLength(6);
    expect(verses[4]?.segments).toEqual([]);
    const group = groups.find((g) => g.occurrences.some((o) => o.text.endsWith('dziecko')));
    expect(group?.occurrences.map((o) => o.verse)).toEqual([0, 5]);
  });

  it('gives each vowel pattern its own color', () => {
    const { verses } = analyze(['Ciągle mam to w mojej głowie', 'Nic nie mówię, ale w twojej mowie']);
    const colored = verses[0]!.segments.filter((s) => s.color !== undefined);
    const mojej = colored.find((s) => s.text === 'mojej');
    const glowie = colored.find((s) => s.text === 'głowie');
    expect(mojej?.color).toBeDefined();
    expect(glowie?.color).toBeDefined();
    expect(mojej?.color).toBe(glowie?.color); // both "o-e"
    const ciagle = verses[0]!.segments.find((s) => s.text === 'Ciąg');
    expect(ciagle?.color).toBeUndefined();
  });

  it('does not treat repeated words as rhymes', () => {
    const { groups } = analyze(['robię to dla siebie', 'robię to dla siebie']);
    expect(groups.some((g) => g.occurrences.every((o) => o.text === g.occurrences[0]!.text))).toBe(false);
  });
});
