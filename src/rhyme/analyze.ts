import { rhymeClass, vowelsRhyme, type Syllable } from './syllables';
import { prepareVerse } from './pronunciation';

/** Only a safety limit: a rhyme may run through a whole verse ("flow co te brawa…" ~ "fonope stawia…"). */
const MAX_RHYME_LENGTH = 40;

export interface Segment {
  text: string;
  color?: number;
  groupId?: number;
}

export interface AnalyzedVerse {
  text: string;
  syllableCount: number;
  segments: Segment[];
}

export interface RhymeGroup {
  id: number;
  length: number;
  /** 1–2 syllables = single, 3–4 = double, 5–6 = triple, … */
  multiplicity: number;
  /** One palette index per chunk (one or two syllables), ordered from the start of the rhyme. */
  colors: number[];
  chunks: string[][];
  occurrences: { verse: number; text: string; length: number }[];
}

export interface Analysis {
  verses: AnalyzedVerse[];
  groups: RhymeGroup[];
}

export const multiplicityOf = (length: number): number => Math.ceil(length / 2);

interface Item {
  index: number;
  pos: number;
}

interface Span {
  verse: number;
  /** Rhyming syllables in reading order. A skipped syllable leaves a gap in positions. */
  items: Item[];
}

interface Candidate {
  a: Item[];
  b: Item[];
  verseA: number;
  verseB: number;
  score: number;
}

/**
 * An end rhyme may skip one gap after two matched syllables: a non-rhyming syllable on both sides
 * ("Czipsy kranczips" ~ "Krzysztof Krawczyk") or one or two extra syllables on one side
 * ("worek rok" ~ "chowaj pałer pojnt"). The rhyme must resume on a stressed syllable. Gaps get no color.
 */
const GAPS: [number, number][] = [
  [1, 1],
  [0, 1],
  [1, 0],
  [0, 2],
  [2, 0],
];
const MIN_MATCH_BEFORE_GAP = 2;
const GAP_PENALTY = 0.75;

const first = (s: Span) => s.items[0]!.index;
const last = (s: Span) => s.items[s.items.length - 1]!.index;
const spanKey = (s: Span) => `${s.verse}:${s.items.map((i) => i.index).join(',')}`;
const toSpan = (verse: number, fromEnd: Item[]): Span => ({ verse, items: [...fromEnd].reverse() });

const spanText = (verse: string, sylls: Syllable[], span: Span) =>
  verse.slice(sylls[first(span)]!.start, sylls[last(span)]!.end);

/** Walks back from two word-final syllables while vowels rhyme, allowing one gap (see GAPS). */
function extend(A: Syllable[], B: Syllable[], p: number, q: number, sameVerse: boolean, gapAllowed: boolean) {
  const fitsB = (k: number) => k >= 0 && (!sameVerse || k > p);
  const same = (x: number, y: number) => x >= 0 && fitsB(y) && vowelsRhyme(A[x]!.vowel, B[y]!.vowel);
  /** Rappers line up stressed syllables: "wó-rek" ~ "chó-waj", not the unstressed "za" ~ "pá-łer". */
  const stressedPairs = (a: Item[], b: Item[]) =>
    a.filter((item, k) => A[item.index]!.stressed && B[b[k]!.index]!.stressed).length;

  const walk = (ia: number, ib: number, a: Item[], b: Item[], gapAllowed: boolean) => {
    a = [...a];
    b = [...b];
    while (a.length < MAX_RHYME_LENGTH && same(ia, ib)) {
      a.push({ index: ia--, pos: a.length });
      b.push({ index: ib--, pos: b.length });
    }
    let best = { a, b, gap: false };
    if (!gapAllowed || a.length < MIN_MATCH_BEFORE_GAP) return best;

    // Among gaps, the longest rhyme wins, then the one with more stressed syllables aligned, then the order of GAPS.
    let bestRank = [a.length, -1];
    for (const [ga, gb] of GAPS) {
      if (!same(ia - ga, ib - gb)) continue;
      const stressedA = A[ia - ga]!.stressed;
      const stressedB = B[ib - gb]!.stressed;
      if (Math.max(ga, gb) === 2 ? !(stressedA && stressedB) : !(stressedA || stressedB)) continue;
      const next = walk(ia - ga, ib - gb, a, b, false);
      const rank = [next.a.length, stressedPairs(next.a, next.b)];
      if (rank[0]! > bestRank[0]! || (rank[0] === bestRank[0] && rank[1]! > bestRank[1]!)) {
        best = { ...next, gap: true };
        bestRank = rank;
      }
    }
    return best;
  };

  return walk(p, q, [], [], gapAllowed);
}

const startsWord = (sylls: Syllable[], k: number) => k === 0 || sylls[k - 1]!.wordIndex !== sylls[k]!.wordIndex;

const wordLength = (sylls: Syllable[], k: number) => sylls.filter((s) => s.wordIndex === sylls[k]!.wordIndex).length;

const isWholeWord = (sylls: Syllable[], s: Span) =>
  startsWord(sylls, first(s)) && sylls[last(s)]!.wordFinal && s.items.length >= 2 && s.items.length === wordLength(sylls, last(s));

/**
 * Rhymes between verses beat rhymes inside one verse, the more so the closer they sit to the same
 * place in their verses ("się piekli" ~ "cie biednym" rather than "Nic mnie" ~ "bycie").
 */
const SAME_VERSE_PENALTY = 0.5;
const MATCHING_PLACE_BONUS = 0.75;
const placeInVerse = (sylls: Syllable[], k: number) => (sylls.length > 1 ? k / (sylls.length - 1) : 1);
const VERSE_START_BONUS = 1.5;
const WORD_START_BONUS = 0.5;
const INSIDE_WORD_PENALTY = 0.25;

/**
 * A rhyme is a run of syllables whose vowels match another run anywhere in the text; the further apart
 * the verses, the weaker the candidate. A run may end inside a word only if the other is a whole word ("li wy" ~ "Niby").
 */
function findCandidates(block: { verse: number; sylls: Syllable[]; text: string }[]): Candidate[] {
  const candidates: Candidate[] = [];
  for (let i = 0; i < block.length; i++) {
    for (let j = i; j < block.length; j++) {
      const A = block[i]!;
      const B = block[j]!;
      for (const p of A.sylls) {
        for (const q of B.sylls) {
          if (i === j && q.index <= p.index) continue;
          const insideWord = p.wordFinal !== q.wordFinal;
          if (!p.wordFinal && !q.wordFinal) continue;

          const aLineEnd = p.index === A.sylls.length - 1;
          const bLineEnd = q.index === B.sylls.length - 1;
          let { a, b, gap } = extend(A.sylls, B.sylls, p.index, q.index, i === j, !insideWord && aLineEnd && bLineEnd);
          if (insideWord) {
            const length = p.wordFinal ? wordLength(A.sylls, p.index) : wordLength(B.sylls, q.index);
            if (length < 2 || a.length < length) continue;
            a = a.slice(0, length);
            b = b.slice(0, length);
          }
          if (a.length === 0) continue;

          const sameCoda = p.coda === q.coda;
          const startA = a[a.length - 1]!.index;
          const startB = b[b.length - 1]!.index;
          const bonus =
            (aLineEnd ? 0.75 : 0) +
            (bLineEnd ? 0.75 : 0) +
            (sameCoda ? 0.5 : 0) +
            (startA === 0 && startB === 0 ? VERSE_START_BONUS : 0) +
            (startsWord(A.sylls, startA) && startsWord(B.sylls, startB) ? WORD_START_BONUS : 0);
          candidates.push({
            a,
            b,
            verseA: A.verse,
            verseB: B.verse,
            score:
              a.length +
              bonus -
              (gap ? GAP_PENALTY : 0) -
              (insideWord ? INSIDE_WORD_PENALTY : 0) +
              (i === j
                ? -SAME_VERSE_PENALTY
                : MATCHING_PLACE_BONUS * (1 - Math.abs(placeInVerse(A.sylls, p.index) - placeInVerse(B.sylls, q.index))) -
                  (j - i) * 0.1),
          });
        }
      }
    }
  }
  return candidates.sort((x, y) => y.score - x.score);
}

/** Short matches are everywhere in Polish, so they need extra evidence to count as a rhyme. */
function isAcceptable(a: Span, b: Span, data: Map<number, { sylls: Syllable[]; text: string }>): boolean {
  const A = data.get(a.verse)!;
  const B = data.get(b.verse)!;
  const textA = spanText(A.text, A.sylls, a).toLowerCase();
  const textB = spanText(B.text, B.sylls, b).toLowerCase();
  if (textA === textB) return false;

  const length = a.items.length;
  const aWordEnd = A.sylls[last(a)]!.wordFinal;
  const bWordEnd = B.sylls[last(b)]!.wordFinal;
  // A run ending inside a word only rhymes with a whole word.
  if (!aWordEnd && !isWholeWord(B.sylls, b)) return false;
  if (!bWordEnd && !isWholeWord(A.sylls, a)) return false;

  const aLineEnd = last(a) === A.sylls.length - 1;
  const bLineEnd = last(b) === B.sylls.length - 1;
  const sameCoda = A.sylls[last(a)]!.coda === B.sylls[last(b)]!.coda;

  if (length >= 3) return true;
  if (aLineEnd && bLineEnd) return length === 2 || sameCoda;
  if (length === 2 && first(a) === 0 && first(b) === 0 && a.verse !== b.verse) return true;
  // A short rhyme inside a verse is easy to hit by chance; it counts when stressed syllables line up
  // or when one side is a whole word ("Niby" ~ "li wy").
  const stressAligned = a.items.some((item, k) => A.sylls[item.index]!.stressed && B.sylls[b.items[k]!.index]!.stressed);
  const wholeWord = isWholeWord(A.sylls, a) || isWholeWord(B.sylls, b);
  if (length === 2) return sameCoda && (stressAligned || wholeWord);
  return aLineEnd && bLineEnd && sameCoda && a.verse !== b.verse;
}

export function analyze(rawVerses: string[]): Analysis {
  const prepared = rawVerses.map((v) => prepareVerse(v.trim()));
  const verses = prepared.map((v) => v.text);
  const syllables = prepared.map((v) => v.syllables);
  const groups: RhymeGroup[] = [];
  const colorsByVerse: (number | undefined)[][] = verses.map((v) => new Array(v.length).fill(undefined));
  const groupByVerse: (number | undefined)[][] = verses.map((v) => new Array(v.length).fill(undefined));
  {
    const block = verses
      .map((text, verse) => ({ verse, text, sylls: syllables[verse]! }))
      .filter((v) => v.sylls.length > 0);
    const data = new Map(block.map((v) => [v.verse, v]));
    // A color stands for a vowel pattern in the whole text ("ziomki" ~ "worki" share "o-i").
    const colorOfPattern = new Map<string, number>();
    const colorFor = (vowels: string[]) => {
      const key = vowels.map(rhymeClass).join('-');
      if (!colorOfPattern.has(key)) colorOfPattern.set(key, colorOfPattern.size);
      return colorOfPattern.get(key)!;
    };

    // Union-find over accepted spans; each syllable belongs to at most one span.
    const spans = new Map<number, Span>();
    const idOfKey = new Map<string, number>();
    const owner = new Map<string, number>(); // "verse:syllable" -> span id
    const parent = new Map<number, number>();
    const find = (id: number): number => {
      while (parent.get(id) !== id) id = parent.get(id)!;
      return id;
    };
    const ownerOf = (verse: number, index: number) => owner.get(`${verse}:${index}`);

    /**
     * Where a run fits among accepted rhymes: the id of the span it joins (the same span, or a
     * longer one containing it, e.g. "niejące" in "nieistniejące", "worki" in "worki parę stów"),
     * null when the syllables are still free, or false when it cuts across another rhyme.
     */
    const locate = (s: Span): number | null | false => {
      const exact = idOfKey.get(spanKey(s));
      if (exact !== undefined) return exact;
      const lastOwner = ownerOf(s.verse, last(s));
      if (lastOwner !== undefined) {
        const existing = spans.get(lastOwner)!;
        return s.items.every((i) => existing.items.some((e) => e.index === i.index)) ? lastOwner : false;
      }
      return s.items.some((i) => ownerOf(s.verse, i.index) !== undefined) ? false : null;
    };
    /** A new run joining part of an accepted one takes over that part's positions, so colors line up. */
    const alignTo = (run: Span, partner: Span, partnerId: number): Span => {
      const existing = spans.get(partnerId)!;
      return {
        ...run,
        items: run.items.map((item, k) => ({
          ...item,
          pos: existing.items.find((e) => e.index === partner.items[k]!.index)!.pos,
        })),
      };
    };
    const claim = (s: Span) => {
      const known = idOfKey.get(spanKey(s));
      if (known !== undefined) return known;
      const id = spans.size === 0 ? 0 : Math.max(...spans.keys()) + 1;
      spans.set(id, s);
      idOfKey.set(spanKey(s), id);
      parent.set(id, id);
      for (const i of s.items) owner.set(`${s.verse}:${i.index}`, id);
      return id;
    };
    for (const c of findCandidates(block)) {
      for (let length = c.a.length; length >= 1; length--) {
        const a = toSpan(c.verseA, c.a.slice(0, length));
        const b = toSpan(c.verseB, c.b.slice(0, length));
        const atA = locate(a);
        const atB = locate(b);
        if (atA === false || atB === false) continue;
        // Two formed rhymes are never merged: their vowels would end up sharing colors ("parę" ~ "mamy").
        if (atA !== null && atB !== null && find(atA) !== find(atB)) break;
        if (isAcceptable(a, b, data)) {
          const newA = atB !== null && atA === null ? alignTo(a, b, atB) : a;
          const newB = atA !== null && atB === null ? alignTo(b, a, atA) : b;
          parent.set(find(atB ?? claim(newB)), find(atA ?? claim(newA)));
        }
        break;
      }
    }

    const members = new Map<number, Span[]>();
    for (const [id, span] of spans) {
      const root = find(id);
      members.set(root, [...(members.get(root) ?? []), span]);
    }
    const ordered = [...members.values()]
      .map((list) => list.sort((x, y) => x.verse - y.verse || first(x) - first(y)))
      .sort((x, y) => x[0]!.verse - y[0]!.verse || first(x[0]!) - first(y[0]!));

    for (const list of ordered) {
      // Colors follow the position from the end of the rhyme, so shorter members line up with longer ones.
      const positions = Math.max(...list.flatMap((s) => s.items.map((i) => i.pos))) + 1;
      const chunkOf = chunkByWords(list, positions, syllables);
      const multiplicity = Math.max(...chunkOf) + 1;
      const vowelAt = new Map<number, string>();
      for (const span of list)
        for (const i of span.items) if (!vowelAt.has(i.pos)) vowelAt.set(i.pos, syllables[span.verse]![i.index]!.vowel);
      const chunks = Array.from({ length: multiplicity }, (_, k) => {
        const chunkFromEnd = multiplicity - 1 - k;
        return [...chunkOf.keys()]
          .filter((pos) => chunkOf[pos] === chunkFromEnd)
          .reverse()
          .flatMap((pos) => vowelAt.get(pos) ?? []);
      });
      const colors = chunks.map(colorFor);
      const colorAt = (pos: number) => colors[multiplicity - 1 - chunkOf[pos]!]!;

      const group: RhymeGroup = {
        id: groups.length,
        length: Math.max(...list.map((s) => s.items.length)),
        multiplicity,
        colors,
        chunks,
        occurrences: list.map((s) => ({
          verse: s.verse,
          text: spanText(verses[s.verse]!, syllables[s.verse]!, s),
          length: s.items.length,
        })),
      };
      groups.push(group);

      for (const span of list) {
        const sylls = syllables[span.verse]!;
        span.items.forEach((item, k) => {
          const prev = span.items[k - 1];
          const s = sylls[item.index]!;
          const joined = prev && prev.index === item.index - 1 && chunkOf[prev.pos] === chunkOf[item.pos];
          const from = joined ? sylls[prev.index]!.end : s.start;
          for (let ch = from; ch < s.end; ch++) {
            colorsByVerse[span.verse]![ch] = colorAt(item.pos);
            groupByVerse[span.verse]![ch] = group.id;
          }
        });
      }
    }
  }

  return {
    groups,
    verses: verses.map((text, v) => ({
      text,
      syllableCount: syllables[v]!.length,
      segments: toSegments(text, colorsByVerse[v]!, groupByVerse[v]!),
    })),
  };
}

/**
 * Splits rhyme positions into color chunks of one or two syllables without cutting words
 * ("ziomki | mamy", not "ziom | ki ma"); returns the chunk index of each position from the end.
 */
function chunkByWords(list: Span[], positions: number, syllables: Syllable[][]): number[] {
  const cutCost = new Array<number>(positions).fill(0);
  for (const span of list) {
    const at = new Map(span.items.map((i) => [i.pos, syllables[span.verse]![i.index]!]));
    for (let pos = 0; pos < positions - 1; pos++) {
      const right = at.get(pos);
      const left = at.get(pos + 1);
      if (right && left && right.wordIndex === left.wordIndex) cutCost[pos]!++;
    }
  }

  const best: [number, number, number][] = [[0, 0, 0]];
  for (let n = 1; n <= positions; n++) {
    let choice: [number, number, number] | undefined;
    // On a tie the two-syllable chunk wins, which pairs syllables from the start of the rhyme ("flow co" ~ "fono").
    for (const size of [2, 1]) {
      const before = best[n - size];
      if (!before) continue;
      const cost = before[0] + (n - size > 0 ? cutCost[n - size - 1]! : 0);
      const option: [number, number, number] = [cost, before[1] + 1, size];
      if (!choice || option[0] < choice[0] || (option[0] === choice[0] && option[1] < choice[1])) choice = option;
    }
    best.push(choice!);
  }

  const chunkOf = new Array<number>(positions);
  const sizes: number[] = [];
  for (let n = positions; n > 0; n -= best[n]![2]) sizes.unshift(best[n]![2]);
  let pos = 0;
  sizes.forEach((size, chunk) => {
    for (let k = 0; k < size; k++) chunkOf[pos++] = chunk;
  });
  return chunkOf;
}

function toSegments(text: string, colors: (number | undefined)[], groupIds: (number | undefined)[]): Segment[] {
  const segments: Segment[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = segments[segments.length - 1];
    if (last && last.color === colors[i] && last.groupId === groupIds[i]) {
      last.text += text[i];
    } else {
      segments.push({ text: text[i]!, color: colors[i], groupId: groupIds[i] });
    }
  }
  return segments;
}
