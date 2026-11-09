import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { Footer } from '../components/Layout';
import { KEY_DATES, TEST_DATE } from '../lib/ems';
import { fmtLong, mmss } from '../lib/format';
import { daysLeft } from '../lib/plan';

const PRICE = (import.meta.env.VITE_PRICE_LABEL as string | undefined) ?? 'CHF 49';
const PARTS: [string, number | null, number][] = [
  ['Med.-nat. Grundverständnis', 3, 450], ['Quantitative Probleme', 3, 450], ['Fakten lernen: einprägen', null, 120],
  ['Textverständnis', 3, 450], ['Fakten lernen: abfragen', 3, 60], ['Diagramme und Tabellen', 3, 450],
];

export default function Landing() {
  const { user } = useAuth();
  const mins = Math.round(PARTS.reduce((s, p) => s + p[2], 0) / 60);
  return (
    <div className="stack view">
      <section className="hero">
        <h1>Wo stehst du für den EMS 2027?</h1>
        <p className="muted">15 Fragen aus fünf Aufgabengruppen, im echten Tempo von 2½ Minuten pro Frage. Danach siehst du deine Stärken, deine Lücken und einen Lernplan bis zum Testtag.</p>
      </section>
      <div className="card count"><span className="big">{daysLeft(new Date())}</span><span>Tage bis zum EMS am {fmtLong.format(TEST_DATE)}</span></div>
      <section className="card stack">
        <h2>Gratis-Diagnose · ca. {mins} Minuten</h2>
        <ul className="plan-sections">{PARTS.map(p => <li key={p[0]}><span>{p[0]}{p[1] ? ` · ${p[1]} Fragen` : ''}</span><span className="t">{mmss(p[2])}</span></li>)}</ul>
        <p className="small muted">Die Reihenfolge entspricht dem echten Test. Ohne Anmeldung.</p>
        <Link className="btn primary wide" to="/diagnose">Diagnose starten</Link>
        {user && <Link className="btn wide" to="/heute">Zu deinem Lernplan</Link>}
      </section>
      <section className="card stack">
        <h2>Saisonpass bis zum Test · {PRICE}</h2>
        <ul className="ticks">
          <li>Übungssets zu allen Aufgabengruppen mit Text und Zahlen, laufend neue</li>
          <li>Lernplan, der deine schwächsten Gruppen zuerst trainiert</li>
          <li>Erklärung zu jeder Aufgabe und ein Tutor für Rückfragen</li>
          <li>Einmal bezahlen mit TWINT oder Karte, kein Abo</li>
        </ul>
        <Link className="btn wide" to="/kaufen">Mehr zum Saisonpass</Link>
      </section>
      <section className="card stack">
        <h2>Wichtige Termine</h2>
        <ul className="dates">{KEY_DATES.map(d => <li key={d.date}><span className="d">{d.date}</span><span>{d.label}</span></li>)}</ul>
        <p className="small muted">Verbindlich sind die Angaben von swissuniversities.</p>
      </section>
      <Footer />
    </div>
  );
}
