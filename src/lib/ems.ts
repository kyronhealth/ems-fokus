// Facts about the EMS. Check these against swissuniversities each year.
export const TEST_DATE = new Date(2027, 6, 9); // Friday 9 July 2027 (voraussichtlich)
export const PASS_VALID_UNTIL = new Date(2027, 6, 31);

export const KEY_DATES: { date: string; label: string }[] = [
  { date: '15.02.2027', label: 'Voranmeldung zum Medizinstudium bei swissuniversities' },
  { date: '25.05.2027', label: 'Letzter Tag für die Anmeldung zum EMS (Testgebühr bezahlt)' },
  { date: '09.07.2027', label: 'EMS, Freitag (voraussichtlich)' },
];

export type GroupId = 'mz' | 'mng' | 'oir' | 'qfp' | 'figuren' | 'fakten' | 'tv' | 'dt' | 'ksa';

export type GroupInfo = { id: GroupId; name: string; short: string; fixedWeight?: number; source: string };

// In test order. fixedWeight: groups the diagnostic does not cover.
export const GROUPS: GroupInfo[] = [
  { id: 'mz', name: 'Muster zuordnen', short: 'Muster zuordnen', fixedWeight: 1, source: 'Offizielle Originalversionen des EMS' },
  { id: 'mng', name: 'Medizinisch-naturwissenschaftliches Grundverständnis', short: 'Med.-nat. Grundverständnis', source: 'Übungssets in EMS Fokus' },
  { id: 'oir', name: 'Objekte im Raum', short: 'Objekte im Raum', fixedWeight: 1, source: 'Offizielle Beispielaufgaben (neu seit 2025)' },
  { id: 'qfp', name: 'Quantitative und formale Probleme', short: 'Quantitative Probleme', source: 'Übungssets in EMS Fokus' },
  { id: 'figuren', name: 'Figuren lernen', short: 'Figuren lernen', fixedWeight: 1, source: 'Offizielle Originalversionen des EMS' },
  { id: 'fakten', name: 'Fakten lernen', short: 'Fakten lernen', source: 'Übungssets in EMS Fokus' },
  { id: 'tv', name: 'Textverständnis', short: 'Textverständnis', source: 'Übungssets in EMS Fokus' },
  { id: 'dt', name: 'Diagramme und Tabellen', short: 'Diagramme und Tabellen', source: 'Übungssets in EMS Fokus' },
  { id: 'ksa', name: 'Konzentriertes und sorgfältiges Arbeiten', short: 'Konzentriertes Arbeiten', fixedWeight: 0.4, source: 'Wenig, aber regelmässig' },
];
export const groupName = (id: string) => GROUPS.find(g => g.id === id)?.name ?? id;
export const groupShort = (id: string) => GROUPS.find(g => g.id === id)?.short ?? id;

export const INTRO: Record<string, string> = {
  mng: 'Kurze Texte aus Biologie, Chemie und Physik. Du ziehst Schlüsse nur aus dem, was im Text steht. Vorwissen brauchst du nicht.',
  qfp: 'Rechenaufgaben mit medizinischem und naturwissenschaftlichem Hintergrund. Kein Taschenrechner, Notizpapier ist erlaubt.',
  learn: 'Präge dir die Patientinnen und Patienten ein: Name, Alter, Beruf, Diagnose und ein Merkmal. Die Fragen dazu kommen erst später.',
  tv: 'Ein Sachtext mit Fragen. Jede Antwort steht im Text oder folgt direkt daraus.',
  fakten: 'Jetzt kommen die Fragen zu den Patientinnen und Patienten von vorhin. Die Profile siehst du nicht mehr.',
  dt: 'Tabellen und Diagramme lesen und vergleichen. Achte genau auf Einheiten und Bezugsgrössen.',
};

export const SEC_PER_ITEM: Partial<Record<GroupId, number>> = { mng: 150, qfp: 150, tv: 150, dt: 150, fakten: 20, figuren: 17, mz: 53, oir: 33 };
