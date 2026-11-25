const UNITS = ['zero', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć'];
const TEENS = [
  'dziesięć', 'jedenaście', 'dwanaście', 'trzynaście', 'czternaście',
  'piętnaście', 'szesnaście', 'siedemnaście', 'osiemnaście', 'dziewiętnaście',
];
const TENS = [
  '', '', 'dwadzieścia', 'trzydzieści', 'czterdzieści',
  'pięćdziesiąt', 'sześćdziesiąt', 'siedemdziesiąt', 'osiemdziesiąt', 'dziewięćdziesiąt',
];
const HUNDREDS = ['', 'sto', 'dwieście', 'trzysta', 'czterysta', 'pięćset', 'sześćset', 'siedemset', 'osiemset', 'dziewięćset'];
const SCALES: [string, string, string][] = [
  ['tysiąc', 'tysiące', 'tysięcy'],
  ['milion', 'miliony', 'milionów'],
  ['miliard', 'miliardy', 'miliardów'],
];
const HOURS = [
  'zero', 'pierwsza', 'druga', 'trzecia', 'czwarta', 'piąta', 'szósta', 'siódma', 'ósma', 'dziewiąta', 'dziesiąta',
  'jedenasta', 'dwunasta', 'trzynasta', 'czternasta', 'piętnasta', 'szesnasta', 'siedemnasta', 'osiemnasta',
  'dziewiętnasta', 'dwudziesta', 'dwudziesta pierwsza', 'dwudziesta druga', 'dwudziesta trzecia',
];
const ZLOTY: [string, string, string] = ['złoty', 'złote', 'złotych'];
const MAX_DIGITS = 12;

/** Polish plural after a number: 1 złoty, 2–4 złote (but 12–14 złotych), 5+ złotych. */
const pluralForm = (n: number, [one, few, many]: [string, string, string]): string => {
  if (n === 1) return one;
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  return lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14) ? few : many;
};

function below1000(n: number): string[] {
  const words = [HUNDREDS[Math.floor(n / 100)]!];
  const rest = n % 100;
  if (rest >= 10 && rest < 20) words.push(TEENS[rest - 10]!);
  else {
    words.push(TENS[Math.floor(rest / 10)]!);
    if (rest % 10 > 0) words.push(UNITS[rest % 10]!);
  }
  return words.filter((w) => w !== '');
}

/** Cardinal number in the nominative, the form used when counting: 2005 → "dwa tysiące pięć". */
export function cardinal(n: number): string {
  if (n === 0) return UNITS[0]!;
  const words: string[] = [];
  for (let scale = SCALES.length; scale >= 0; scale--) {
    const group = Math.floor(n / 1000 ** scale) % 1000;
    if (group === 0) continue;
    if (scale === 0) words.push(...below1000(group));
    else if (group === 1) words.push(SCALES[scale - 1]![0]);
    else words.push(...below1000(group), pluralForm(group, SCALES[scale - 1]!));
  }
  return words.join(' ');
}

/** Leading zeros ("007") and very long numbers (phone numbers) are read digit by digit. */
function readDigits(digits: string): string {
  if ((digits.length > 1 && digits.startsWith('0')) || digits.length > MAX_DIGITS) {
    return [...digits].map((d) => UNITS[Number(d)]!).join(' ');
  }
  return cardinal(Number(digits));
}

/**
 * A number standing on its own (not glued to letters, like "2pac" or "S500"), optionally with "%" or "zł":
 * "1 000 000", "16:30", "2,5", "100%", "20 zł".
 */
export const NUMBER =
  /(?<![\p{L}\p{N},.:])(?:(\d{1,3}(?:[  ]\d{3})+)|(\d{1,2}):(\d{2})|(\d+),(\d+)|(\d+))(?:\s?(%|zł(?!\p{L})))?(?![\p{L}\p{N}]|[,.:]\d)/gu;

/** How a match of NUMBER is read aloud. */
export function readNumber(match: RegExpMatchArray): string {
  const [, grouped, hour, minute, whole, fraction, plain, unit] = match;
  let words: string;
  let amount: number | undefined;
  if (hour !== undefined && minute !== undefined) {
    const h = Number(hour);
    const m = Number(minute);
    if (h > 23 || m > 59) {
      words = `${readDigits(hour)} ${readDigits(minute)}`;
    } else {
      const minutes = m === 0 ? '' : minute.startsWith('0') ? ` zero ${UNITS[m]}` : ` ${cardinal(m)}`;
      words = HOURS[h]! + minutes;
    }
  } else if (whole !== undefined && fraction !== undefined) {
    if (unit === 'zł') {
      return `${readDigits(whole)} ${pluralForm(Number(whole), ZLOTY)} ${readDigits(fraction)}`;
    }
    words = `${readDigits(whole)} przecinek ${readDigits(fraction)}`;
  } else {
    const digits = (grouped ?? plain)!.replace(/[  ]/g, '');
    words = readDigits(digits);
    amount = Number(digits);
  }
  if (unit === '%') return `${words} procent`;
  if (unit === 'zł') return `${words} ${amount === undefined ? ZLOTY[2] : pluralForm(amount, ZLOTY)}`;
  return words;
}
