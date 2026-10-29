import { syllabify, type Syllable } from './syllables';

export interface PreparedVerse {
  text: string;
  syllables: Syllable[];
}

/** "power point *pałer pojnt*": the starred words are how the preceding words are pronounced. */
const ANNOTATION = /\s*\*([^*]*)\*/g;
const WORD = /\p{L}+/gu;

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
  const appendText = (chunk: string) => {
    for (let k = 0; k < chunk.length; k++) toText.push(text.length + k);
    spoken += chunk;
    text += chunk;
  };

  let lastEnd = 0;
  for (const match of raw.matchAll(ANNOTATION)) {
    const chunk = raw.slice(lastEnd, match.index);
    const annotation = match[1]!.trim();
    const count = wordsOf(annotation).length;
    const words = wordsOf(chunk).slice(-count);
    lastEnd = match.index + match[0].length;

    if (count === 0 || words.length === 0) {
      appendText(chunk);
      continue;
    }
    const from = words[0]!.start;
    const to = words[words.length - 1]!.end;
    appendText(chunk.slice(0, from));
    const base = text.length;
    for (const index of mapSpoken(
      annotation,
      words.map((w) => ({ start: base + w.start - from, end: base + w.end - from })),
      base,
      base + to - from,
    )) {
      toText.push(index);
    }
    spoken += annotation;
    text += chunk.slice(from, to);
    appendText(chunk.slice(to));
  }
  appendText(raw.slice(lastEnd));

  // Syllables keep their order on screen even when a long pronunciation maps onto a short word.
  let previousEnd = 0;
  const syllables = syllabify(spoken).map((s) => {
    const start = Math.max(toText[s.start]!, previousEnd);
    const end = Math.max(toText[s.end - 1]! + 1, start);
    previousEnd = end;
    return { ...s, start, end };
  });
  return { text, syllables };
}
