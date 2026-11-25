import { describe, expect, it } from 'vitest';
import { addPronunciation, prepareVerse } from './pronunciation';
import { analyze } from './analyze';

const pieces = (raw: string) => {
  const { text, syllables } = prepareVerse(raw);
  return syllables.map((s) => text.slice(s.start, s.end));
};

describe('prepareVerse', () => {
  it('P-01: leaves verses without annotations unchanged', () => {
    expect(prepareVerse('chowaj pałer pojnt').text).toBe('chowaj pałer pojnt');
    expect(pieces('chowaj pałer pojnt')).toEqual(['cho', 'waj', 'pa', 'łer', 'pojnt']);
  });

  it('P-01, P-02: hides the annotation and maps pronounced syllables onto the written words', () => {
    const { text, syllables } = prepareVerse('chowaj power point *pałer pojnt*');
    expect(text).toBe('chowaj power point');
    expect(syllables.map((s) => s.vowel).join('')).toBe('oaaeo');
    expect(pieces('chowaj power point *pałer pojnt*')).toEqual(['cho', 'waj', 'po', 'wer', 'point']);
  });

  it('P-01: replaces as many preceding words as the annotation has', () => {
    expect(pieces('mam nowy laptop *leptop*, serio')).toEqual(['mam', 'no', 'wy', 'lap', 'top', 'se', 'rio']);
    expect(prepareVerse('mam nowy laptop *leptop*, serio').syllables.map((s) => s.vowel).join('')).toBe('aoyeoeo');
  });

  it('P-02: maps a pronunciation with more words than precede it over the whole range', () => {
    const { text, syllables } = prepareVerse('OK *o kej* i jazda');
    expect(text).toBe('OK i jazda');
    expect(syllables.map((s) => s.vowel).join('')).toBe('oeiaa');
    expect(syllables.every((s) => s.end > s.start)).toBe(true);
  });

  it('P-03: keeps an unclosed asterisk as text', () => {
    expect(prepareVerse('gwiazdka * bez pary').text).toBe('gwiazdka * bez pary');
  });

  it('P-04: reads numbers aloud and keeps the digits on screen', () => {
    const { text, syllables, readings } = prepareVerse('rocznik 97, mam 100%');
    expect(text).toBe('rocznik 97, mam 100%');
    expect(syllables.map((s) => s.vowel).join('')).toBe('oieeeoeeaooe');
    expect(readings).toEqual([
      { start: 8, end: 10, rawStart: 8, rawEnd: 10, spoken: 'dziewięćdziesiąt siedem', source: 'number' },
      { start: 16, end: 20, rawStart: 16, rawEnd: 20, spoken: 'sto procent', source: 'number' },
    ]);
    expect(syllables.every((s, k) => k === 0 || s.start >= syllables[k - 1]!.end)).toBe(true);
    expect(syllables.filter((s) => s.start >= 8 && s.end <= 10 && s.end > s.start)).toHaveLength(2);
  });

  it('P-06: an annotation right after a number replaces the whole number', () => {
    const { text, syllables, readings } = prepareVerse('w 2005 *dwa tysiące piątym* i 2pac *tupak*');
    expect(text).toBe('w 2005 i 2pac');
    expect(syllables.map((s) => s.vowel).join('')).toBe('ayoeoyiua');
    expect(readings.map((r) => [text.slice(r.start, r.end), r.source])).toEqual([
      ['2005', 'annotation'],
      ['2pac', 'annotation'],
    ]);
  });
});

describe('analyze with pronunciation', () => {
  it('P-01, R-04: rhymes by pronunciation and colors the written words', () => {
    const { verses, groups } = analyze([
      'a kiedyś prawie przyklepali mi za worek rok',
      'wszystko wam zaprezentuję chowaj power point *pałer pojnt*',
    ]);
    expect(verses[1]!.text).toBe('wszystko wam zaprezentuję chowaj power point');
    const group = groups.find((g) => g.occurrences.some((o) => o.text === 'worek rok'));
    expect(group?.occurrences.map((o) => o.text)).toEqual(['worek rok', 'chowaj power point']);
    const colored = verses[1]!.segments.filter((s) => s.color !== undefined).map((s) => s.text);
    expect(colored.slice(-3)).toEqual(['cho', 'wer', 'point']);
  });

  it('P-04: rhymes numbers by how they are read and marks the reading', () => {
    const { verses, groups } = analyze(['na liczniku znowu 300', 'a na koncie wciąż mam trzysta']);
    const group = groups.find((g) => g.occurrences.some((o) => o.text.endsWith('300')));
    expect(group?.occurrences.some((o) => o.text.endsWith('trzysta'))).toBe(true);
    const digits = verses[0]!.segments.filter((s) => s.reading !== undefined);
    expect(digits.map((s) => s.text).join('')).toBe('300');
    expect(digits.every((s) => s.reading === 'trzysta')).toBe(true);
  });
});

describe('addPronunciation', () => {
  const numberIn = (verse: string) => prepareVerse(verse.trim()).readings.find((r) => r.source === 'number')!;

  it('P-06: writes the pronunciation as an annotation right after the number', () => {
    const verse = 'mam 2 dziewczyny na osiedlu';
    expect(addPronunciation(verse, numberIn(verse), 'dwie')).toBe('mam 2 *dwie* dziewczyny na osiedlu');
  });

  it('P-06: finds the number in the raw verse past earlier annotations and indentation', () => {
    const verse = '  power point *pałer pojnt* i 2005';
    const result = addPronunciation(verse, numberIn(verse), 'dwa tysiące piątym');
    expect(result).toBe('  power point *pałer pojnt* i 2005 *dwa tysiące piątym*');
    expect(prepareVerse(result.trim()).text).toBe('power point i 2005');
  });

  it('P-06: ignores an empty, letterless or unchanged pronunciation and strips asterisks', () => {
    const verse = 'mam 300';
    const reading = numberIn(verse);
    expect(addPronunciation(verse, reading, '  ')).toBe(verse);
    expect(addPronunciation(verse, reading, '123')).toBe(verse);
    expect(addPronunciation(verse, reading, 'Trzysta')).toBe(verse);
    expect(addPronunciation(verse, reading, '*trzy sta*')).toBe('mam 300 *trzy sta*');
  });
});
