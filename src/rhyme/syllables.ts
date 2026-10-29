export interface Syllable {
  index: number;
  wordIndex: number;
  vowel: string;
  start: number;
  end: number;
  /** Letters after the vowel (normalized), used to compare single-syllable rhymes. */
  coda: string;
  wordFinal: boolean;
  /** Polish stress: the penultimate syllable, or a one-syllable word that is not a clitic. */
  stressed: boolean;
}

const VOWELS = new Set(['a', 'ą', 'e', 'ę', 'i', 'o', 'ó', 'u', 'y']);
const DIGRAPHS = ['ch', 'cz', 'dz', 'dź', 'dż', 'rz', 'sz'];
/** Clusters starting with a sibilant open the next syllable as a whole ("szczę-ście", "mia-sto"). */
const SIBILANTS = new Set(['s', 'ś', 'z', 'ź', 'ż', 'sz']);

/** One-syllable words usually spoken without stress (prepositions, conjunctions, short pronouns, particles). */
const CLITICS = new Set([
  'a', 'i', 'o', 'u', 'w', 'z', 'we', 'ze', 'za', 'na', 'do', 'od', 'po', 'przy', 'nad', 'pod', 'przed', 'bez', 'dla',
  'przez', 'że', 'by', 'bo', 'czy', 'się', 'mi', 'ci', 'cię', 'mu', 'go', 'ją', 'je', 'nie', 'no', 'już', 'też', 'to',
  'jak',
]);

const VOWEL_NORMALIZATION: Record<string, string> = { ó: 'u', ą: 'o', ę: 'e' };

const normalizeVowel = (v: string): string => VOWEL_NORMALIZATION[v] ?? v;

/** Inexact rhymes: "i" and "y" rhyme with each other ("Czi-psy" ~ "Krzy-sztof"). */
const RHYME_CLASS: Record<string, string> = { y: 'i' };

export const rhymeClass = (v: string): string => RHYME_CLASS[v] ?? v;

export const vowelsRhyme = (a: string, b: string): boolean => rhymeClass(a) === rhymeClass(b);

const normalizeCoda = (coda: string): string =>
  coda
    .replace(/ó/g, 'u')
    .replace(/rz/g, 'ż')
    .replace(/ch/g, 'h');

const isVowel = (ch: string | undefined): boolean => ch !== undefined && VOWELS.has(ch);

function consonantUnits(cluster: string): string[] {
  const units: string[] = [];
  let i = 0;
  while (i < cluster.length) {
    const pair = cluster.slice(i, i + 2);
    const step = DIGRAPHS.includes(pair) ? 2 : 1;
    units.push(cluster.slice(i, i + step));
    i += step;
  }
  return units;
}

interface Nucleus {
  start: number;
  end: number;
  vowel: string;
}

/**
 * Finds syllable nuclei in a lowercase word. An "i" between a consonant and a vowel
 * only softens the consonant ("nie", "pies"), so it joins the following vowel.
 */
function findNuclei(word: string): Nucleus[] {
  const nuclei: Nucleus[] = [];
  let i = 0;
  while (i < word.length) {
    const ch = word[i]!;
    if (!isVowel(ch)) {
      i++;
      continue;
    }
    const softener = ch === 'i' && i > 0 && !isVowel(word[i - 1]) && isVowel(word[i + 1]);
    if (softener) {
      nuclei.push({ start: i, end: i + 2, vowel: normalizeVowel(word[i + 1]!) });
      i += 2;
    } else {
      nuclei.push({ start: i, end: i + 1, vowel: normalizeVowel(ch) });
      i++;
    }
  }
  return nuclei;
}

export function syllabify(verse: string): Syllable[] {
  const result: Syllable[] = [];
  const lower = verse.toLowerCase();
  const wordPattern = /\p{L}+/gu;
  let wordIndex = 0;

  for (const match of lower.matchAll(wordPattern)) {
    const word = match[0];
    const offset = match.index;
    const nuclei = findNuclei(word);
    if (nuclei.length === 0) {
      wordIndex++;
      continue;
    }

    // Syllable boundaries: consonants between nuclei go to the next syllable,
    // except the first unit of a multi-consonant cluster, which closes the previous one.
    const bounds: number[] = [0];
    for (let k = 1; k < nuclei.length; k++) {
      const prevEnd = nuclei[k - 1]!.end;
      const units = consonantUnits(word.slice(prevEnd, nuclei[k]!.start));
      const keepTogether = units.length <= 1 || SIBILANTS.has(units[0]!);
      bounds.push(keepTogether ? prevEnd : prevEnd + units[0]!.length);
    }
    bounds.push(word.length);

    nuclei.forEach((nucleus, k) => {
      const start = bounds[k]!;
      const end = bounds[k + 1]!;
      result.push({
        index: result.length,
        wordIndex,
        vowel: nucleus.vowel,
        start: offset + start,
        end: offset + end,
        coda: normalizeCoda(word.slice(nucleus.end, end)),
        wordFinal: k === nuclei.length - 1,
        stressed: nuclei.length === 1 ? !CLITICS.has(word) : k === nuclei.length - 2,
      });
    });
    wordIndex++;
  }
  return result;
}
