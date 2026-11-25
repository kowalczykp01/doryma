import { prepareVerse } from './pronunciation';

export type Language = 'polish' | 'other' | 'unknown';

export interface PronunciationHint {
  verse: number;
  word: string;
  /** foreign: looks like a non-Polish word; mixed: digits glued to letters; silent: has no vowel to rhyme on. */
  reason: 'foreign' | 'mixed' | 'silent';
}

export interface TextCheck {
  language: Language;
  hints: PronunciationHint[];
}

/** Frequent Polish words that are rare in other languages (also typed without diacritics). */
const POLISH_WORDS = new Set([
  'nie', 'się', 'sie', 'że', 'ze', 'jest', 'jak', 'ale', 'tak', 'mnie', 'mam', 'ty', 'co', 'czy', 'już', 'juz',
  'tu', 'gdzie', 'kiedy', 'bo', 'od', 'dla', 'przez', 'są', 'sa', 'był', 'byl', 'była', 'będzie', 'tylko',
  'jeszcze', 'mój', 'moj', 'moje', 'twój', 'twoj', 'tym', 'ten', 'ta', 'też', 'tez', 'wszystko', 'nic', 'w', 'z',
  'na', 'mi', 'ci', 'cię', 'go', 'jej', 'ich', 'nas', 'was', 'wam', 'nam', 'to', 'jestem', 'jesteś',
  'mamy', 'masz', 'wiem', 'chcę', 'może', 'tutaj', 'teraz', 'zawsze', 'nigdy', 'bez', 'pod', 'nad', 'po',
]);
const POLISH_LETTERS = /[ąćęłńśźż]/;
/** Letters and spellings that Polish words do not use. */
const FOREIGN_SPELLING = /[qvx]|th|sh|ee|oo|ea|ph|ow$|^y|y[aeiou]/;
const NON_POLISH_LETTER = /[^a-ząćęłńóśźż]/;
const VOWEL = /[aąeęioóuy]/;
const MIN_WORDS = 8;
const MIN_POLISH_WORDS = 0.12;
const MIN_POLISH_LETTERS = 0.1;

/** L-01: is the text mostly Polish? Too short a text gets no verdict. */
export function detectLanguage(words: string[]): Language {
  if (words.length < MIN_WORDS) return 'unknown';
  const share = (test: (w: string) => boolean) => words.filter(test).length / words.length;
  const polishWords = share((w) => POLISH_WORDS.has(w));
  const polishLetters = share((w) => POLISH_LETTERS.test(w));
  return polishWords >= MIN_POLISH_WORDS || polishLetters >= MIN_POLISH_LETTERS ? 'polish' : 'other';
}

/** L-02: words that are probably read differently than Polish spelling suggests, unless already annotated. */
function hintFor(word: string): PronunciationHint['reason'] | undefined {
  const lower = word.toLowerCase();
  if (/\p{N}/u.test(word)) return /\p{L}/u.test(word) ? 'mixed' : undefined;
  if (NON_POLISH_LETTER.test(lower)) return 'foreign';
  if (!VOWEL.test(lower)) return lower.length >= 2 ? 'silent' : undefined;
  if (POLISH_LETTERS.test(lower)) return undefined;
  return FOREIGN_SPELLING.test(lower) ? 'foreign' : undefined;
}

export function checkText(rawVerses: string[]): TextCheck {
  const words: string[] = [];
  const hints: PronunciationHint[] = [];
  const seen = new Set<string>();
  rawVerses.forEach((raw, verse) => {
    const { text, readings } = prepareVerse(raw.trim());
    for (const match of text.matchAll(/[\p{L}\p{N}]+/gu)) {
      const word = match[0];
      if (/\p{L}/u.test(word)) words.push(word.toLowerCase());
      const end = match.index + word.length;
      if (readings.some((r) => r.start < end && match.index < r.end)) continue;
      const reason = hintFor(word);
      if (reason && !seen.has(word.toLowerCase())) {
        seen.add(word.toLowerCase());
        hints.push({ verse, word, reason });
      }
    }
  });
  return { language: detectLanguage(words), hints };
}
