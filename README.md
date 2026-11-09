# EMS Fokus

Preparation app for the Swiss EMS (Eignungstest für das Medizinstudium): free diagnostic, study plan to test day, timed practice sets with explanations, AI tutor, one-off season pass via Stripe (TWINT and cards).

## How it fits together

- **Website** (`src/`): React + TypeScript, built with Vite, hosted on Cloudflare Pages. Phone-first, German.
- **Database and logins** (`supabase/migrations/`): Supabase, Zurich region. E-mail magic link, no passwords. Row-level security: paid questions are only readable with a valid pass.
- **Server functions** (`supabase/functions/`):
  - `create-checkout`: starts a Stripe Checkout payment (CHF, one-off)
  - `stripe-webhook`: grants the season pass after payment
  - `tutor`: Claude (`claude-haiku-5-5`) explains one question, using the checked explanation; pass required, daily cap
  - `delete-account`: deletes a student's account and data
- **Question bank** (`content/bank.json`): the only source of questions. Never bundled into the website; imported into the database by `npm run import-content` or the "Import content" workflow.

## Commands

```
npm install           # once
npm run dev           # local preview at http://localhost:5173 (works without Supabase, using content/bank.json)
npm test              # unit tests (study plan, dates, scoring)
npm run check-content # validates the question bank
npm run build         # production build into dist/
```

## Going live

See `docs/SETUP.md`. Writing new questions: `docs/content-prompts.md` and `content/README.md`.

## Facts to update each year

`src/lib/ems.ts`: test date, key dates, pass end date. Check them against swissuniversities.
