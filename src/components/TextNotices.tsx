import type { PronunciationHint, TextCheck } from '../rhyme/language';

const MAX_HINTS = 8;

const REASONS: Record<PronunciationHint['reason'], string> = {
  foreign: 'wyraz obcy',
  mixed: 'cyfry z literami',
  silent: 'bez samogłoski',
};

/** Non-blocking notices: the analysis always runs, these only explain why it may be inaccurate. */
export function TextNotices({ check }: { check: TextCheck }) {
  const hints = check.hints.slice(0, MAX_HINTS);
  const more = check.hints.length - hints.length;
  if (check.language !== 'other' && hints.length === 0) return null;

  return (
    <div className="notices" role="status">
      {check.language === 'other' && (
        <p className="notice">
          Ten tekst nie wygląda na polski. DoRyma dzieli sylaby według zasad polskiej wymowy, więc rymy mogą być
          niedokładne.
        </p>
      )}
      {hints.length > 0 && (
        <p className="notice">
          Sprawdź wymowę:{' '}
          {hints.map((hint, k) => (
            <span key={hint.word}>
              {k > 0 && ', '}
              <strong>{hint.word}</strong> (wers {hint.verse + 1}, {REASONS[hint.reason]})
            </span>
          ))}
          {more > 0 && ` i ${more} więcej`}. Dopisz ją w gwiazdkach, np. <code>flow *flou*</code>.
        </p>
      )}
    </div>
  );
}
