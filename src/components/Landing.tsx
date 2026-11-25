import { useMemo, useRef, useState, type CSSProperties } from 'react';
import { analyze, type AnalyzedVerse } from '../rhyme/analyze';
import { RhymeView } from './RhymeView';
import { paletteColor } from './palette';

const DEMO = [
  'Nocą to miasto zasypia jak dziecko',
  'Ja piszę te wersy i płynę tak lekko',
  'W mojej głowie bity, w twojej mowie strach',
  'Wszystko co miałem zostawiłem na schodach',
];

const STEPS = [
  { title: 'Wpisz albo wklej tekst', text: 'Każda linia to wers, pusta linia oddziela zwrotki.' },
  {
    title: 'DoRyma słucha samogłosek',
    text: 'Dzieli wersy na sylaby i porównuje samogłoski w każdej czwórce wersów: na końcach, na początkach i w środku, pilnując akcentów.',
  },
  {
    title: 'Kolory pokazują rymy',
    text: 'Ten sam kolor to ten sam układ samogłosek. Legenda podaje, ile sylab ma każdy rym.',
  },
];

const FEATURES = [
  { title: 'Rymy wielokrotne', text: 'Od pojedynczych po potrójne i dłuższe, także przez cały wers.' },
  {
    title: 'Rymy niedokładne',
    text: '„i” rymuje się z „y”, „ó” z „u”, a niepasująca sylaba w środku nie psuje rymu.',
  },
  { title: 'Wymowa w gwiazdkach', text: 'power point *pałer pojnt*: rymujemy to, co słychać, nie to, co napisane.' },
  { title: 'Liczby', text: '300 czytamy jako „trzysta”. Inną wymowę dodasz jednym kliknięciem.' },
  {
    title: 'Podpowiedzi',
    text: 'Ostrzeżenie, gdy tekst nie wygląda na polski, i lista wyrazów, których wymowę warto sprawdzić.',
  },
  { title: 'Prywatnie i offline', text: 'Działa w przeglądarce, bez konta. Możesz zainstalować ją na telefonie.' },
];

const MULTIPLICITY = [
  { syllables: '1–2 sylaby', name: 'pojedynczy', pair: ['wracam na blok', 'robię ten krok'] },
  { syllables: '3–4 sylaby', name: 'podwójny', pair: ['w mojej głowie', 'w twojej mowie'] },
  { syllables: '5–6 sylab', name: 'potrójny', pair: ['mamy nowe bity', 'damy nowe hity'] },
];

/** A verse colored by the analyzer, without animation. */
function StaticVerse({ verse }: { verse: AnalyzedVerse }) {
  return (
    <span className="static-verse">
      {verse.segments.map((segment, k) =>
        segment.color === undefined ? (
          <span key={k}>{segment.text}</span>
        ) : (
          <mark key={k} className="rhyme static" style={{ '--c': paletteColor(segment.color) } as CSSProperties}>
            {segment.text}
          </mark>
        ),
      )}
    </span>
  );
}

export function Landing({ onStart }: { onStart: () => void }) {
  const demo = useMemo(() => analyze(DEMO), []);
  const examples = useMemo(() => MULTIPLICITY.map((row) => analyze(row.pair)), []);
  const [run, setRun] = useState(0);
  const demoRef = useRef<HTMLElement>(null);

  const showExample = () => {
    demoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setRun((r) => r + 1);
  };

  return (
    <div className="landing">
      <section className="hero">
        <p className="eyebrow">Rymy wielokrotne w polskim rapie</p>
        <h1>Zobacz, co się rymuje.</h1>
        <p className="lead">
          Wklej tekst albo pisz wers po wersie, a DoRyma pokoloruje sylaby, które się rymują. Ten sam układ samogłosek
          ma ten sam kolor, więc od razu widać rymy podwójne, potrójne i te ukryte w środku wersu.
        </p>
        <div className="cta">
          <button type="button" className="primary" onClick={onStart}>
            Pokoloruj swój tekst
          </button>
          <button type="button" className="ghost" onClick={showExample}>
            Zobacz przykład
          </button>
        </div>
        <p className="hint">Za darmo, bez konta. Tekst nie opuszcza Twojego urządzenia.</p>
      </section>

      <section className="demo" ref={demoRef} aria-label="Przykład pokolorowanego tekstu">
        <RhymeView key={run} analysis={demo} legend={false} />
      </section>

      <section className="section" aria-labelledby="how">
        <h2 id="how">Jak to działa</h2>
        <ol className="steps">
          {STEPS.map((step, k) => (
            <li key={step.title}>
              <span className="step-number" aria-hidden="true">
                {k + 1}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="section" aria-labelledby="features">
        <h2 id="features">Co potrafi</h2>
        <ul className="features">
          {FEATURES.map((feature) => (
            <li key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="multiplicity">
        <h2 id="multiplicity">Krotność rymu</h2>
        <p className="section-lead">Liczymy sylaby, które się rymują: każde dwie to jeden kolor.</p>
        <ul className="multiplicity">
          {MULTIPLICITY.map((row, k) => (
            <li key={row.name}>
              <span className="multiplicity-name">
                <strong>Rym {row.name}</strong>
                <span>{row.syllables}</span>
              </span>
              <span className="multiplicity-example">
                {examples[k]!.verses.map((verse, v) => (
                  <StaticVerse key={v} verse={verse} />
                ))}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="closing">
        <h2>Masz tekst? Sprawdź go.</h2>
        <button type="button" className="primary" onClick={onStart}>
          Pokoloruj swój tekst
        </button>
      </section>
    </div>
  );
}
