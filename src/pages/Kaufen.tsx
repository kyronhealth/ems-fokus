import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import * as api from '../lib/api';
import { PASS_VALID_UNTIL } from '../lib/ems';
import { fmtLong } from '../lib/format';

const PRICE = (import.meta.env.VITE_PRICE_LABEL as string | undefined) ?? 'CHF 49';

export default function Kaufen() {
  const { user, access, accessUntil } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  return (
    <div className="stack view">
      <h1>Saisonpass EMS 2027</h1>
      <p className="price">{PRICE} <span className="muted small">einmalig, gültig bis {fmtLong.format(PASS_VALID_UNTIL)}</span></p>
      <section className="card">
        <ul className="ticks">
          <li>Alle Übungssets zu den Aufgabengruppen mit Text und Zahlen, laufend neue</li>
          <li>Lernmodus mit geprüfter Erklärung zu jeder Aufgabe</li>
          <li>Tutor für Rückfragen zu jeder Aufgabe, bis zu 20 Fragen pro Tag</li>
          <li>Lernplan und Fortschritt pro Aufgabengruppe</li>
          <li>Probetests in echter Reihenfolge und Zeit, sobald verfügbar</li>
        </ul>
      </section>
      {access ? (
        <p className="notice">Du hast den Saisonpass{accessUntil ? ` bis ${fmtLong.format(new Date(accessUntil))}` : ''}. <Link to="/uebungen">Zu den Übungssets</Link></p>
      ) : (
        <>
          {err && <p className="notice warn" role="alert">{err}</p>}
          <button className="btn primary wide" disabled={busy} onClick={async () => {
            if (!user) { nav('/anmelden?next=/kaufen'); return; }
            setBusy(true); setErr('');
            try { await api.startCheckout(); } catch (x) { setErr((x as Error).message); setBusy(false); }
          }}>{busy ? 'Weiterleitung zur Zahlung …' : user ? 'Mit TWINT oder Karte bezahlen' : 'Anmelden und kaufen'}</button>
          <p className="small muted">Die Zahlung läuft über Stripe. Kein Abo: Der Pass endet automatisch. Es gelten die <Link to="/agb">AGB</Link>.</p>
        </>
      )}
    </div>
  );
}
