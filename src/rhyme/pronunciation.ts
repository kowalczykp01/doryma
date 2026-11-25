import { NUMBER, readNumber } from './numbers';
import { syllabify, type Syllable } from './syllables';

/** A range of the displayed text that is pronounced differently than written. */
export interface Reading {
  start: number;
  end: number;
  /** The same range in the raw verse, which still contains the annotations. */
  rawStart: number;
  rawEnd: number;
  spoken: string;
  source: 'annotation' | 'number';
}

export interface PreparedVerse {
  text: string;
  syllables: Syllable[];
  readings: Reading[];
}

/** "power point *pałer pojnt*": the starred words are how the preceding words are pronounced. */
const ANNOTATION = /\s*\*([^*]*)\*/g;
const WORD = /[\p{L}\p{N}]+/gu;

interface Word {
  start: number;
  end: number;
}

const wordsOf = (text: string): Word[] =>
  [...text.matchAll(WORD)].map((m) => ({ start: m.index, end: m.index + m[0].length }));

/**
 * Maps every character of `spoken` onto the display range [from, to). Word by word when the counts
 * match ("pa|łer" onto "po|wer"), otherwise proportionally over the whole range.
 */
function mapSpoken(spoken: string, displayWords: Word[], from: number, to: number): number[] {
  const spokenWords = wordsOf(spoken);
  const proportional = (k: number, s: Word, d: Word) =>
    d.start + Math.min(d.end - d.start - 1, Math.floor(((k - s.start) * (d.end - d.start)) / (s.end - s.start)));

  if (spokenWords.length !== displayWords.length) {
    return [...spoken].map((_, k) => proportional(k, { start: 0, end: spoken.length }, { start: from, end: to }));
  }
  let current = 0;
  return [...spoken].map((_, k) => {
    while (current < spokenWords.length - 1 && k >= spokenWords[current]!.end) current++;
    const s = spokenWords[current]!;
    const d = displayWords[current]!;
    if (k < s.start) return d.start;
    if (k >= s.end) return d.end - 1;
    return proportional(k, s, d);
  });
}

export function prepareVerse(raw: string): PreparedVerse {
  let text = '';
  let spoken = '';
  const toText: number[] = [];
  const readings: Reading[] = [];
  const appendPlain = (chunk: string) => {
    for (let k = 0; k < chunk.length; k++) toText.push(text.length + k);
    spoken += chunk;
    text += chunk;
  };
  const appendReading = (written: string, said: string, source: Reading['source'], rawStart: number) => {
    const base = text.length;
    const words = wordsOf(written).map((w) => ({ start: base + w.start, end: base + w.end }));
    toText.push(...mapSpoken(said, words, base, base + written.length));
    readings.push({
      start: base,
      end: base + written.length,
      rawStart,
      rawEnd: rawStart + written.length,
      spoken: said,
      source,
    });
    spoken += said;
    text += written;
  };
  const appendText = (chunk: string, rawOffset: number) => {
    let last = 0;
    for (const match of chunk.matchAll(NUMBER)) {
      appendPlain(chunk.slice(last, match.index));
      appendReading(match[0], readNumber(match), 'number', rawOffset + match.index);
      last = match.index + match[0].length;
    }
    appendPlain(chunk.slice(last));
  };

  let lastEnd = 0;
  for (const match of raw.matchAll(ANNOTATION)) {
    const chunkStart = lastEnd;
    const chunk = raw.slice(chunkStart, match.index);
    const annotation = match[1]!.trim();
    const count = wordsOf(annotation).length;
    lastEnd = match.index + match[0].length;

    // An annotation right after a number replaces that number, however many words it has.
    const lastNumber = [...chunk.matchAll(NUMBER)].pop();
    const words = wordsOf(chunk).slice(-count);
    const range =
      lastNumber && lastNumber.index + lastNumber[0].length === chunk.length
        ? { from: lastNumber.index, to: chunk.length }
        : words.length > 0
          ? { from: words[0]!.start, to: words[words.length - 1]!.end }
          : undefined;
    if (count === 0 || !range) {
      appendText(chunk, chunkStart);
      continue;
    }
    appendText(chunk.slice(0, range.from), chunkStart);
    appendReading(chunk.slice(range.from, range.to), annotation, 'annotation', chunkStart + range.from);
    appendText(chunk.slice(range.to), chunkStart + range.to);
  }
  appendText(raw.slice(lastEnd), lastEnd);

  // Syllables keep their order on screen even when a long pronunciation maps onto a short word.
  let previousEnd = 0;
  const syllables = syllabify(spoken).map((s) => {
    const start = Math.max(toText[s.start]!, previousEnd);
    const end = Math.max(toText[s.end - 1]! + 1, start);
    previousEnd = end;
    return { ...s, start, end };
  });
  return { text, syllables, readings };
}

/**
 * Adds a pronunciation for an automatically read number by writing an annotation right after it (P-06).
 * Returns the verse unchanged when the pronunciation is empty, has no letters or matches the automatic one.
 */
export function addPronunciation(verse: string, reading: Reading, spoken: string): string {
  const said = spoken.replace(/\*/g, ' ').replace(/\s+/g, ' ').trim();
  if (!/\p{L}/u.test(said) || said.toLowerCase() === reading.spoken.toLowerCase()) return verse;
  const at = verse.length - verse.trimStart().length + reading.rawEnd;
  return `${verse.slice(0, at)} *${said}*${verse.slice(at)}`;
}
