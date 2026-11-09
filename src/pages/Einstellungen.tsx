import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import * as api from '../lib/api';
import { fmtLong } from '../lib/format';
import PlanForm from '../components/PlanForm';
import { Footer } from '../components/Layout';

export default function Einstellungen() {
  const { user, profile, setProfile, access, accessUntil, signOut } = useAuth();
  const nav = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [err, setErr] = useState('');
  return (
    <div className="stack view">
      <h1>Konto</h1>
      <section className="card stack">
        <p>Angemeldet als <b>{user?.email}</b></p>
        <p className="small">{access ? `Saisonpass aktiv${accessUntil ? ` bis ${fmtLong.format(new Date(accessUntil))}` : ''}.` : <>Kein Saisonpass. <Link to="/kaufen">Ansehen</Link></>}</p>
        <button className="btn" onClick={async () => { await signOut(); nav('/'); }}>Abmelden</button>
      </section>
      <h2>Lernplan</h2>
      <PlanForm initial={profile} submitLabel="Speichern" onSubmit={async p => { await api.saveProfile(user!.id, p); setProfile(p); }} />
      <section className="card stack">
        <h2>Konto löschen</h2>
        <p className="small">Löscht dein Konto, deine Ergebnisse und deinen Lernplan endgültig. Ein bezahlter Pass verfällt dabei.</p>
        {err && <p className="notice warn" role="alert">{err}</p>}
        <button className="btn danger" onClick={async () => {
          if (!confirm) { setConfirm(true); return; }
          try { await api.deleteAccount(); await signOut(); nav('/'); } catch (x) { setErr((x as Error).message); }
        }}>{confirm ? 'Endgültig löschen' : 'Konto löschen'}</button>
      </section>
      <Footer />
    </div>
  );
}
