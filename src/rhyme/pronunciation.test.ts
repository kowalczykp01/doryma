import { describe, expect, it } from 'vitest';
import { prepareVerse } from './pronunciation';
import { analyze } from './analyze';

const pieces = (raw: string) => {
  const { text, syllables } = prepareVerse(raw);
  return syllables.map((s) => text.slice(s.start, s.end));
};

describe('prepareVerse', () => {
  it('leaves verses without annotations unchanged', () => {
    expect(prepareVerse('chowaj pałer pojnt').text).toBe('chowaj pałer pojnt');
    expect(pieces('chowaj pałer pojnt')).toEqual(['cho', 'waj', 'pa', 'łer', 'pojnt']);
  });

  it('hides the annotation and maps pronounced syllables onto the written words', () => {
    const { text, syllables } = prepareVerse('chowaj power point *pałer pojnt*');
    expect(text).toBe('chowaj power point');
    expect(syllables.map((s) => s.vowel).join('')).toBe('oaaeo');
    expect(pieces('chowaj power point *pałer pojnt*')).toEqual(['cho', 'waj', 'po', 'wer', 'point']);
  });

  it('replaces as many preceding words as the annotation has', () => {
    expect(pieces('mam nowy laptop *leptop*, serio')).toEqual(['mam', 'no', 'wy', 'lap', 'top', 'se', 'rio']);
    expect(prepareVerse('mam nowy laptop *leptop*, serio').syllables.map((s) => s.vowel).join('')).toBe('aoyeoeo');
  });

  it('maps a pronunciation with more words than precede it over the whole range', () => {
    const { text, syllables } = prepareVerse('OK *o kej* i jazda');
    expect(text).toBe('OK i jazda');
    expect(syllables.map((s) => s.vowel).join('')).toBe('oeiaa');
    expect(syllables.every((s) => s.end > s.start)).toBe(true);
  });

  it('keeps an unclosed asterisk as text', () => {
    expect(prepareVerse('gwiazdka * bez pary').text).toBe('gwiazdka * bez pary');
  });
});

describe('analyze with pronunciation', () => {
  it('rhymes by pronunciation and colors the written words', () => {
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
});
