import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { prepareVerse } from '../rhyme/pronunciation';

interface Props {
  verses: string[];
  onChange: (verses: string[]) => void;
}

const splitLines = (text: string) => text.split(/\r?\n/).map((l, i) => (i === 0 ? l.trimEnd() : l.trim()));

export function VerseEditor({ verses, onChange }: Props) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const focusTarget = useRef<{ index: number; caret: 'start' | 'end' } | null>(null);

  useEffect(() => {
    const target = focusTarget.current;
    if (!target) return;
    const input = inputs.current[target.index];
    if (input) {
      input.focus();
      const pos = target.caret === 'start' ? 0 : input.value.length;
      input.setSelectionRange(pos, pos);
    }
    focusTarget.current = null;
  });

  const update = (next: string[], focus?: { index: number; caret: 'start' | 'end' }) => {
    focusTarget.current = focus ?? null;
    onChange(next);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const caret = input.selectionStart ?? 0;
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = verses[index]!;
      const next = [...verses];
      next.splice(index, 1, value.slice(0, caret).trimEnd(), value.slice(caret).trimStart());
      update(next, { index: index + 1, caret: 'start' });
    } else if (e.key === 'Backspace' && caret === 0 && input.selectionEnd === 0 && index > 0) {
      e.preventDefault();
      const next = [...verses];
      const previous = next[index - 1]!;
      next.splice(index - 1, 2, previous + verses[index]!);
      focusTarget.current = { index: index - 1, caret: 'end' };
      onChange(next);
      requestAnimationFrame(() => inputs.current[index - 1]?.setSelectionRange(previous.length, previous.length));
    } else if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      inputs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowDown' && index < verses.length - 1) {
      e.preventDefault();
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (!/\r?\n/.test(text)) return;
    e.preventDefault();
    const input = e.currentTarget;
    const value = verses[index]!;
    const before = value.slice(0, input.selectionStart ?? value.length);
    const after = value.slice(input.selectionEnd ?? value.length);
    const lines = splitLines(text).filter((l, i, all) => l.length > 0 || (i > 0 && i < all.length - 1));
    lines[0] = before + (lines[0] ?? '');
    const lastIndex = index + lines.length - 1;
    lines[lines.length - 1] = lines[lines.length - 1]! + after;
    const next = [...verses];
    next.splice(index, 1, ...lines);
    update(next, { index: lastIndex, caret: 'end' });
  };

  return (
    <ol className="editor" aria-label="Wersy">
      {verses.map((verse, i) => {
        const syllables = prepareVerse(verse).syllables.length;
        return (
          <li key={i} className="verse">
            <span className="verse-number" aria-hidden="true">
              {i + 1}
            </span>
            <input
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={verse}
              aria-label={`Wers ${i + 1}`}
              placeholder={i === 0 ? 'Wpisz pierwszy wers i naciśnij Enter…' : ''}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => update(verses.map((v, k) => (k === i ? e.target.value : v)))}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={(e) => handlePaste(i, e)}
            />
            <span className="syllable-count" title="Liczba sylab">
              {syllables || ''}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
