import { describe, expect, it } from 'vitest';
import { checkText } from './language';

const POLISH = [
  'Nocą to miasto zasypia jak dziecko',
  'Ja piszę te wersy i płynę tak lekko',
  'W mojej głowie bity, w twojej mowie strach',
  'Wszystko co miałem zostawiłem na schodach',
];

describe('checkText', () => {
  it('L-01: recognizes Polish, also typed without diacritics', () => {
    expect(checkText(POLISH).language).toBe('polish');
    expect(checkText(['nie wiem co mam robic ze soba', 'mam to w glowie ale nie mam slow']).language).toBe('polish');
  });

  it('L-01: recognizes text that is not Polish', () => {
    expect(checkText(['I got the money in my pocket and the city never sleeps', 'We ride all night until the morning comes']).language).toBe('other');
    expect(checkText(['Ich bin auf der Straße und die Nacht ist kalt', 'Wir machen das für unsere Leute hier']).language).toBe('other');
  });

  it('L-01: gives no verdict for a very short text', () => {
    expect(checkText(['yeah yeah', 'okej']).language).toBe('unknown');
  });

  it('L-02: hints at words that need a pronunciation, once each', () => {
    const { hints } = checkText([
      'mam flow i label, słucham 2pac z DJ',
      'flow jak power point *pałer pojnt*, w 2005 roku',
    ]);
    expect(hints).toEqual([
      { verse: 0, word: 'flow', reason: 'foreign' },
      { verse: 0, word: '2pac', reason: 'mixed' },
      { verse: 0, word: 'DJ', reason: 'silent' },
    ]);
  });

  it('L-02: gives no hints for plain Polish', () => {
    expect(checkText(POLISH).hints).toEqual([]);
  });
});
