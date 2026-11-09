import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import { LOCAL } from '../lib/supabase';

const TABS = [
  ['/heute', 'Heute'],
  ['/lernplan', 'Lernplan'],
  ['/uebungen', 'Üben'],
  ['/fortschritt', 'Fortschritt'],
  ['/einstellungen', 'Konto'],
] as const;

export default function Layout() {
  const { user } = useAuth();
  const loc = useLocation();
  return (
    <>
      <header className="top">
        <div className="bar">
          <Link to={user ? '/heute' : '/'} className="brand">EMS Fokus {LOCAL && <span className="pill">Vorschau</span>}</Link>
          {!user && loc.pathname !== '/anmelden' && <Link className="btn small-btn" to="/anmelden">Anmelden</Link>}
        </div>
      </header>
      <main className={`wrap ${user ? 'with-tabs' : ''}`}><Outlet /></main>
      {user && (
        <nav className="tabs" aria-label="Hauptnavigation">
          {TABS.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
        </nav>
      )}
    </>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <p>Die Übungsfragen sind eigene Aufgaben im Stil des EMS, keine offiziellen Testaufgaben. EMS Fokus ist nicht mit swissuniversities oder dem Zentrum für Testentwicklung verbunden.</p>
      <p><Link to="/impressum">Impressum</Link> · <Link to="/datenschutz">Datenschutz</Link> · <Link to="/agb">AGB</Link></p>
    </footer>
  );
}
