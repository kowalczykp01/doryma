import type { CSSProperties } from 'react';
import type { Analysis, RhymeGroup } from '../rhyme/analyze';
import { paletteColor } from './palette';

const VERSE_DELAY_MS = 550;
const TOTAL_DELAY_MS = 20000;
const SEGMENT_DELAY_MS = 90;

const MULTIPLICITY_NAMES = ['pojedynczy', 'podwójny', 'potrójny', 'poczwórny', 'pięciokrotny', 'sześciokrotny'];
export const multiplicityName = (m: number) => MULTIPLICITY_NAMES[m - 1] ?? `${m}-krotny`;

const syllableRange = (group: RhymeGroup) => {
  const shortest = Math.min(...group.occurrences.map((o) => o.length));
  return shortest === group.length ? `${group.length}` : `${shortest}–${group.length}`;
};

export function RhymeView({ analysis }: { analysis: Analysis }) {
  const verseDelay = Math.min(VERSE_DELAY_MS, TOTAL_DELAY_MS / Math.max(1, analysis.verses.length));
  return (
    <div className="result">
      <div className="lyrics">
        {analysis.verses.map((verse, v) => {
          if (verse.text.trim() === '') return <div key={v} className="stanza-break" aria-hidden="true" />;
          let colored = 0;
          return (
            <p key={v} className="lyric" style={{ '--verse-delay': `${v * verseDelay}ms` } as CSSProperties}>
              {verse.segments.map((segment, s) =>
                segment.color === undefined ? (
                  <span key={s}>{segment.text}</span>
                ) : (
                  <mark
                    key={s}
                    className="rhyme"
                    style={
                      {
                        '--c': paletteColor(segment.color),
                        '--delay': `${v * verseDelay + colored++ * SEGMENT_DELAY_MS}ms`,
                      } as CSSProperties
                    }
                  >
                    {segment.text}
                  </mark>
                ),
              )}
            </p>
          );
        })}
      </div>

      {analysis.groups.length > 0 && (
        <section className="legend" aria-label="Znalezione rymy">
          <h2>Rymy</h2>
          <ul>
            {analysis.groups.map((group) => (
              <li key={group.id}>
                <span className="chips" aria-hidden="true">
                  {group.colors.map((color, k) => (
                    <span key={k} className="chip" style={{ '--c': paletteColor(color) } as CSSProperties}>
                      {group.chunks[k]!.join('-')}
                    </span>
                  ))}
                </span>
                <span className="legend-text">
                  <strong>
                    Rym {multiplicityName(group.multiplicity)} ({syllableRange(group)} syl.)
                  </strong>
                  <span className="occurrences">{group.occurrences.map((o) => o.text).join(' / ')}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
