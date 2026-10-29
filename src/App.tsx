import { useEffect, useMemo, useState } from 'react';
import { analyze } from './rhyme/analyze';
import { VerseEditor } from './components/VerseEditor';
import { RhymeView } from './components/RhymeView';

const STORAGE_KEY = 'doryma.verses';

const SAMPLE = [
  'Nocą to miasto zasypia jak dziecko',
  'Ja piszę te wersy i płynę tak lekko',
  'W mojej głowie bity, w twojej mowie strach',
  'Wszystko co miałem zostawiłem na schodach',
  'Każdy dzień to walka, każdy krok to próba',
  'Ale wiem, że jutro wstanę i znowu się uda',
  'Ekipa jest ze mną, wezwij nas, gdy trzeba',
  'Bo nikt nam nie dał tego chleba z nieba',
];

function splitIntoVerses(text: string): string[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const verses = lines.filter((line, i) => line !== '' || (i > 0 && lines[i - 1] !== ''));
  while (verses.length > 1 && verses[verses.length - 1] === '') verses.pop();
  return verses.length > 0 ? verses : [''];
}

function loadVerses(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as unknown;
    if (Array.isArray(saved) && saved.length > 0 && saved.every((v) => typeof v === 'string')) return saved;
  } catch {
  }
  return [''];
}

export function App() {
  const [verses, setVerses] = useState<string[]>(loadVerses);
  const [mode, setMode] = useState<'edit' | 'paste' | 'view'>('edit');
  const [pasted, setPasted] = useState('');
  const [run, setRun] = useState(0);
  // A whole song takes a moment to analyze, so it runs only when the rhymes are shown, not on every keystroke.
  const analysis = useMemo(() => (mode === 'view' ? analyze(verses) : null), [mode, verses]);
  const hasText = verses.some((v) => v.trim().length > 0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(verses));
    } catch {
      // Saving the draft is only a convenience.
    }
  }, [verses]);

  const openPaste = () => {
    setPasted(verses.join('\n'));
    setMode('paste');
  };
  const applyPaste = () => {
    setVerses(splitIntoVerses(pasted));
    setMode('edit');
  };

  const showRhymes = () => {
    setRun((r) => r + 1);
    setMode('view');
  };

  return (
    <div className="app">
      <header className="top">
        <h1>
          Do<span>Ryma</span>
        </h1>
        <p className="tagline">Kolorowanie rymów wielokrotnych w tekstach rapowych</p>
      </header>

      <main>
        {mode === 'paste' && (
          <section className="paste" aria-label="Wklej tekst">
            <label htmlFor="paste-text" className="hint">
              Wklej cały tekst: każda linia to jeden wers, pusta linia oddziela zwrotki.
            </label>
            <textarea
              id="paste-text"
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              spellCheck={false}
              autoFocus
            />
            <div className="paste-actions">
              <button type="button" className="ghost" onClick={() => setMode('edit')}>
                Anuluj
              </button>
              <button type="button" className="primary" onClick={applyPaste} disabled={pasted.trim() === ''}>
                Podziel na wersy
              </button>
            </div>
          </section>
        )}
        {mode === 'edit' && (
          <>
            <div className="toolbar">
              <button type="button" className="ghost" onClick={openPaste}>
                Wklej tekst
              </button>
              <button type="button" className="ghost" onClick={() => setVerses(SAMPLE)}>
                Wstaw przykład
              </button>
              <button type="button" className="ghost" onClick={() => setVerses([''])} disabled={!hasText}>
                Wyczyść
              </button>
            </div>
            <VerseEditor verses={verses} onChange={setVerses} />
            <p className="hint">
              Enter = nowy wers, pusty wers oddziela zwrotki. Rymów szukamy w całym tekście.
              <br />
              Wymowę wpisz w gwiazdkach po wyrazach: <code>power point *pałer pojnt*</code>. Gwiazdki zastępują tyle
              poprzednich wyrazów, ile same zawierają.
            </p>
          </>
        )}
        {mode === 'view' && analysis && <RhymeView key={run} analysis={analysis} />}
      </main>

      <footer className="actions">
        {mode === 'edit' && (
          <button type="button" className="primary" onClick={showRhymes} disabled={!hasText}>
            Pokoloruj rymy
          </button>
        )}
        {mode === 'view' && (
          <>
            <button type="button" className="ghost" onClick={() => setMode('edit')}>
              Edytuj tekst
            </button>
            <button type="button" className="primary" onClick={() => setRun((r) => r + 1)}>
              Odtwórz animację
            </button>
          </>
        )}
      </footer>
    </div>
  );
}
