import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { Analysis, AnalyzedVerse, RhymeGroup, Segment } from '../rhyme/analyze';
import type { Reading } from '../rhyme/pronunciation';
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

const NUMBER_RULE =
  'Liczby czytamy automatycznie jako liczebnik główny w mianowniku. Jeśli w tekście brzmią inaczej, dodaj wymowę.';

type Piece = { segments: Segment[]; reading?: Reading };

/** Consecutive segments of one automatically read number form one piece, so it gets one infotip and one icon. */
function piecesOf(verse: AnalyzedVerse): Piece[] {
  const pieces: Piece[] = [];
  let offset = 0;
  for (const segment of verse.segments) {
    const reading = verse.readings.find((r) => r.start <= offset && offset < r.end);
    const last = pieces[pieces.length - 1];
    if (reading && last?.reading === reading) last.segments.push(segment);
    else pieces.push({ segments: [segment], reading });
    offset += segment.text.length;
  }
  return pieces;
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25Zm17.7-10.2a1 1 0 0 0 0-1.42l-2.33-2.33a1 1 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83Z"
      />
    </svg>
  );
}

interface Editing {
  verse: number;
  reading: Reading;
}

interface Props {
  analysis: Analysis;
  legend?: boolean;
  /** When given, automatically read numbers get an icon to change their pronunciation. */
  onPronounce?: (verse: number, reading: Reading, spoken: string) => void;
}

/** Colors the verses one after another; each rhyme chunk fades in shortly after the previous one. */
export function RhymeView({ analysis, legend = true, onPronounce }: Props) {
  const verseDelay = Math.min(VERSE_DELAY_MS, TOTAL_DELAY_MS / Math.max(1, analysis.verses.length));
  const [editing, setEditing] = useState<Editing | null>(null);
  // After an edit the text is already shown, so changed verses must not wait for the opening animation again.
  const [settled, setSettled] = useState(false);
  const editButtons = useRef(new Map<string, HTMLButtonElement>());
  const returnFocus = useRef<string | null>(null);

  useEffect(() => {
    if (editing || !returnFocus.current) return;
    editButtons.current.get(returnFocus.current)?.focus();
    returnFocus.current = null;
  }, [editing]);

  const keyOf = (verse: number, reading: Reading) => `${verse}:${reading.start}`;
  const close = (restoreFocus: boolean) => {
    if (restoreFocus && editing) returnFocus.current = keyOf(editing.verse, editing.reading);
    setEditing(null);
  };

  return (
    <div className={settled ? 'result settled' : 'result'}>
      <div className="lyrics">
        {analysis.verses.map((verse, v) => {
          if (verse.text.trim() === '') return <div key={v} className="stanza-break" aria-hidden="true" />;
          let colored = 0;
          const renderSegment = (segment: Segment, s: number): ReactNode =>
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
            );

          return (
            <div key={v} className="verse-block">
              <p className="lyric" style={{ '--verse-delay': `${v * verseDelay}ms` } as CSSProperties}>
                {piecesOf(verse).map((piece, p) => {
                  if (!piece.reading) return piece.segments.map((segment, s) => renderSegment(segment, p * 1000 + s));
                  const reading = piece.reading;
                  const written = piece.segments.map((segment) => segment.text).join('');
                  const tipId = `reading-${v}-${reading.start}`;
                  const key = keyOf(v, reading);
                  return (
                    <span key={p} className="reading">
                      <span className="reading-number" tabIndex={0} aria-describedby={tipId}>
                        {piece.segments.map((segment, s) => renderSegment(segment, s))}
                      </span>
                      <span role="tooltip" id={tipId} className="infotip">
                        Czytane jako „{reading.spoken}”. {NUMBER_RULE}
                      </span>
                      {onPronounce && (
                        <button
                          type="button"
                          className="reading-edit"
                          aria-label={`Dodaj wymowę: ${written}`}
                          aria-expanded={editing !== null && keyOf(editing.verse, editing.reading) === key}
                          ref={(el) => {
                            if (el) editButtons.current.set(key, el);
                            else editButtons.current.delete(key);
                          }}
                          onClick={() => setEditing({ verse: v, reading })}
                        >
                          <PencilIcon />
                        </button>
                      )}
                    </span>
                  );
                })}
              </p>
              {editing?.verse === v && onPronounce && (
                <ReadingForm
                  key={editing.reading.start}
                  written={verse.text.slice(editing.reading.start, editing.reading.end)}
                  reading={editing.reading}
                  onCancel={() => close(true)}
                  onSave={(spoken) => {
                    setSettled(true);
                    onPronounce(v, editing.reading, spoken);
                    close(false);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {legend && analysis.groups.length > 0 && (
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

interface FormProps {
  written: string;
  reading: Reading;
  onSave: (spoken: string) => void;
  onCancel: () => void;
}

function ReadingForm({ written, reading, onSave, onCancel }: FormProps) {
  const [value, setValue] = useState(reading.spoken);
  const id = `pronounce-${reading.start}`;
  return (
    <form
      className="reading-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(value);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
      }}
    >
      <label htmlFor={id}>Jak brzmi „{written}” w tym wersie?</label>
      <input
        id={id}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="off"
        spellCheck={false}
        autoFocus
        onFocus={(e) => e.currentTarget.select()}
      />
      <p className="hint">{NUMBER_RULE} Np. „2 dziewczyny” to „dwie”, „w 2005” to „dwa tysiące piątym”.</p>
      <div className="reading-form-actions">
        <button type="button" className="ghost" onClick={onCancel}>
          Anuluj
        </button>
        <button type="submit" className="primary">
          Zapisz
        </button>
      </div>
    </form>
  );
}
