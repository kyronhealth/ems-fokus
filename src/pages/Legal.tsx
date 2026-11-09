import { LEGAL_DRAFT, OPERATOR } from '../lib/legal';
import { PASS_VALID_UNTIL } from '../lib/ems';
import { fmtLong } from '../lib/format';

const Draft = () => (LEGAL_DRAFT ? <p className="notice warn">Entwurf: Dieser Text wird vor dem Start geprüft.</p> : null);

export function Impressum() {
  return (
    <div className="stack view legal">
      <h1>Impressum</h1><Draft />
      <p>{OPERATOR.name}<br />{OPERATOR.address}<br />E-Mail: {OPERATOR.email}{OPERATOR.uid && <><br />UID: {OPERATOR.uid}</>}</p>
      <p>EMS Fokus ist ein unabhängiges Übungsangebot und nicht mit swissuniversities oder dem Zentrum für Testentwicklung der Universität Freiburg verbunden. Die Übungsaufgaben sind eigene Aufgaben im Stil des EMS.</p>
    </div>
  );
}

export function Datenschutz() {
  return (
    <div className="stack view legal">
      <h1>Datenschutzerklärung</h1><Draft />
      <p>Verantwortlich: {OPERATOR.name}, {OPERATOR.address}, {OPERATOR.email}.</p>
      <h2>Welche Daten wir bearbeiten</h2>
      <ul>
        <li>E-Mail-Adresse für die Anmeldung</li>
        <li>Lerneinstellungen (Studienrichtung, Lernzeit) und deine Antworten und Ergebnisse</li>
        <li>Bei einem Kauf: Zahlungsbestätigung von Stripe (keine Karten- oder TWINT-Daten)</li>
        <li>Fragen an den Tutor werden zur Beantwortung an den KI-Anbieter übermittelt und bei uns nicht gespeichert</li>
      </ul>
      <h2>Wo die Daten liegen</h2>
      <ul>
        <li>Datenbank und Anmeldung: Supabase, Rechenzentrum in Zürich</li>
        <li>Zahlungen: Stripe Payments Europe (Irland)</li>
        <li>Tutor: Anthropic (USA)</li>
        <li>Website-Auslieferung: Cloudflare</li>
      </ul>
      <h2>Deine Rechte</h2>
      <p>Du kannst Auskunft, Berichtigung und Löschung verlangen. Dein Konto und alle Ergebnisse löschst du jederzeit selbst unter «Konto». Fragen an {OPERATOR.email}.</p>
      <p>Ohne Anmeldung speichert die Diagnose dein Ergebnis nur in deinem Browser.</p>
    </div>
  );
}

export function AGB() {
  return (
    <div className="stack view legal">
      <h1>Allgemeine Geschäftsbedingungen</h1><Draft />
      <h2>Angebot</h2>
      <p>EMS Fokus bietet Übungsaufgaben, einen Lernplan und einen KI-Tutor zur Vorbereitung auf den Eignungstest für das Medizinstudium (EMS). Ein bestimmtes Testergebnis oder ein Studienplatz wird nicht zugesichert.</p>
      <h2>Saisonpass</h2>
      <p>Der Saisonpass wird einmalig bezahlt und gilt bis {fmtLong.format(PASS_VALID_UNTIL)}. Er verlängert sich nicht automatisch. Der Pass ist persönlich.</p>
      <h2>Rückerstattung</h2>
      <p>[Deine Regel, zum Beispiel: volle Rückerstattung innerhalb von 14 Tagen nach dem Kauf auf Anfrage per E-Mail.]</p>
      <h2>Verfügbarkeit und Inhalte</h2>
      <p>Neue Übungssets werden laufend ergänzt. Wir bemühen uns um fehlerfreie Aufgaben und korrigieren gemeldete Fehler rasch.</p>
      <h2>Recht und Gerichtsstand</h2>
      <p>Es gilt Schweizer Recht. Gerichtsstand ist [Ort].</p>
    </div>
  );
}
