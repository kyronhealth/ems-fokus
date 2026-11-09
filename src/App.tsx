import type { ReactElement } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Landing from './pages/Landing';
import Diagnose from './pages/Diagnose';
import Ergebnis from './pages/Ergebnis';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Setup from './pages/Setup';
import Heute from './pages/Heute';
import Lernplan from './pages/Lernplan';
import Uebungen from './pages/Uebungen';
import SetRunner from './pages/SetRunner';
import Auswertung from './pages/Auswertung';
import Tutor from './pages/Tutor';
import Fortschritt from './pages/Fortschritt';
import Kaufen from './pages/Kaufen';
import Danke from './pages/Danke';
import Einstellungen from './pages/Einstellungen';
import { AGB, Datenschutz, Impressum } from './pages/Legal';

const auth = (el: ReactElement) => <RequireAuth>{el}</RequireAuth>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* full-screen test views */}
          <Route path="/diagnose" element={<Diagnose />} />
          <Route path="/set/:id" element={auth(<SetRunner />)} />
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/ergebnis" element={<Ergebnis />} />
            <Route path="/anmelden" element={<Login />} />
            <Route path="/auth" element={<AuthCallback />} />
            <Route path="/kaufen" element={<Kaufen />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            <Route path="/agb" element={<AGB />} />
            <Route path="/einrichten" element={auth(<Setup />)} />
            <Route path="/heute" element={auth(<Heute />)} />
            <Route path="/lernplan" element={auth(<Lernplan />)} />
            <Route path="/uebungen" element={auth(<Uebungen />)} />
            <Route path="/auswertung/:id" element={auth(<Auswertung />)} />
            <Route path="/tutor/:itemId" element={auth(<Tutor />)} />
            <Route path="/fortschritt" element={auth(<Fortschritt />)} />
            <Route path="/danke" element={auth(<Danke />)} />
            <Route path="/einstellungen" element={auth(<Einstellungen />)} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
