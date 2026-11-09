import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import * as api from '../lib/api';
import PlanForm from '../components/PlanForm';

export default function Setup() {
  const { user, profile, setProfile } = useAuth();
  const nav = useNavigate();
  return (
    <div className="stack view">
      <h1>Dein Lernplan</h1>
      <p className="muted">Wie viel Zeit hast du bis zum Test? Du kannst das jederzeit ändern.</p>
      <PlanForm initial={profile} submitLabel="Plan erstellen" onSubmit={async p => { await api.saveProfile(user!.id, p); setProfile(p); nav('/heute'); }} />
    </div>
  );
}
