# EMS Fokus: going live, step by step

Do the steps in this order. Each one is about 5 to 15 minutes. Start everything in test mode; nothing costs money until real students pay.

You will collect a few keys along the way. Paste each one only into the place named in the step (GitHub, Supabase or Cloudflare settings), never into a chat or an e-mail.


## Step 1: GitHub (the code)

1. Sign in at github.com (or create a free account).
2. Create a new repository.
   Name: ems-fokus
   Visibility: Private
   Do not add a README or licence (the repository must be empty).
3. Connect GitHub to Claude so Claude can push the code: claude.ai > Settings > Connectors > GitHub.
4. Tell Claude "repo is ready". Claude pushes the code.


## Step 2: Supabase (database, logins, server functions)

1. Go to supabase.com and sign up with "Continue with GitHub" (your kyronhealth account).
2. Create an organisation when asked.
   Name: Kyron Health (or any name)
   Plan: Free
3. New project.
   Name: ems-fokus
   Database password: click Generate, then save it in your password manager
   Region: choose the specific region "Central Europe (Zurich)", not the general "Europe" option (that one can place the project in Frankfurt or London)
4. Wait about two minutes until the project is ready.
5. Note these four values (Project settings > API keys, and Project settings > General):
   Project URL: looks like https://abcdefgh.supabase.co
   Project ID: the part before .supabase.co (abcdefgh)
   Publishable key: starts with sb_publishable_
   Secret key: starts with sb_secret_ (click to reveal)
   If you only see "anon" and "service_role" keys, click "Create new API keys" first.
6. Create a deployment token: click your avatar > Account > Access tokens > Generate new token.
   Name: github-deploy
7. In GitHub open kyronhealth/ems-fokus > Settings > Secrets and variables > Actions > New repository secret, and add these five, one by one:
   SUPABASE_ACCESS_TOKEN = the token from point 6
   SUPABASE_PROJECT_ID = the Project ID
   SUPABASE_DB_PASSWORD = the database password
   SUPABASE_URL = the Project URL
   SUPABASE_SECRET_KEY = the secret key
8. In GitHub > Actions, open "Deploy Supabase" and click "Run workflow". When it is green, do the same for "Import content".
9. After step 3 (once you have the website address), come back to Supabase for the login settings:
   Authentication > URL configuration > Site URL: your website address (for example https://ems-fokus.pages.dev)
   Authentication > URL configuration > Redirect URLs: the same address followed by /auth
   Authentication > Emails: switch the "Magic link" and "Confirm signup" e-mails to German (texts below)

German e-mail texts (copy as they are; keep {{ .ConfirmationURL }} unchanged):

Magic link, subject:
Dein Anmeldelink für EMS Fokus
Magic link, body:
<h2>Anmelden bei EMS Fokus</h2><p>Klicke auf den Link, um dich anzumelden:</p><p><a href="{{ .ConfirmationURL }}">Jetzt anmelden</a></p><p>Der Link ist eine Stunde gültig. Wenn du dich nicht anmelden wolltest, kannst du diese E-Mail ignorieren.</p>

Confirm signup, subject:
Willkommen bei EMS Fokus
Confirm signup, body:
<h2>Willkommen bei EMS Fokus</h2><p>Bestätige deine E-Mail-Adresse und melde dich an:</p><p><a href="{{ .ConfirmationURL }}">E-Mail bestätigen und anmelden</a></p><p>Wenn du dich nicht registriert hast, kannst du diese E-Mail ignorieren.</p>


## Step 3: Cloudflare Pages (the website)

Cloudflare's free plan allows commercial use. (Vercel's free plan does not.)

1. Use your existing Cloudflare account (the one hosting kyron.ch). No new account is needed; the free plan allows several sites.
2. Workers & Pages > Create > Pages > Connect to Git > choose kyronhealth/ems-fokus. If Cloudflare only shows the kyron site repository, click "Configure GitHub" and give it access to ems-fokus as well.
3. Build settings:
   Framework preset: None
   Build command: npm run build
   Build output directory: dist
4. Environment variables (Production):
   VITE_SUPABASE_URL = the Project URL
   VITE_SUPABASE_PUBLISHABLE_KEY = the publishable key
   VITE_PRICE_LABEL = CHF 49 (or your price)
   NODE_VERSION = 22
5. Save and deploy. Your address will be something like https://ems-fokus.pages.dev. Now do step 2, point 9.


## Step 4: Stripe (payments)

1. Create an account at stripe.com and stay in Test mode for now.
2. Product catalogue > Add product.
   Name: Saisonpass EMS 2027
   Price: one-off, in CHF (for example 49.00)
   Copy the price ID (starts with price_).
3. Settings > Payment methods: switch on Cards and TWINT. TWINT needs a short merchant check by Stripe before it goes live.
4. Developers > Webhooks > Add endpoint.
   Endpoint URL: https://YOUR-PROJECT-ID.supabase.co/functions/v1/stripe-webhook
   Events: checkout.session.completed and checkout.session.async_payment_succeeded
   Copy the signing secret (starts with whsec_).
5. Developers > API keys: copy the Secret key (starts with sk_test_ in test mode).


## Step 5: Claude API (the tutor)

1. Create an account at platform.claude.com.
2. Add a payment method and set a monthly spending limit (for example 20 USD).
3. API keys > Create key. Copy it.


## Step 6: Server secrets in Supabase

Supabase > Edge Functions > Secrets > add:
   STRIPE_SECRET_KEY = from step 4, point 5
   STRIPE_PRICE_ID = from step 4, point 2
   STRIPE_WEBHOOK_SECRET = from step 4, point 4
   APP_URL = your app address, without a slash at the end
   ANTHROPIC_API_KEY = from step 5
Optional:
   TUTOR_DAILY_CAP = 20
   PASS_VALID_UNTIL = 2027-07-31T21:59:59Z


## Step 7: Test the whole flow (test mode)

1. Open the app, do the diagnostic, sign in with your e-mail.
2. Go to Kaufen and pay with Stripe's test card 4242 4242 4242 4242 (any future date, any CVC).
3. You should land on "Dein Saisonpass ist aktiv". Open a result and press "Tutor fragen".
4. In Supabase > Table editor > entitlements you should see your pass.


## Before real students pay

1. Fill in your name, address and e-mail in src/lib/legal.ts and decide your refund rule in the AGB. Have the three legal pages checked, then set LEGAL_DRAFT to false.
2. Set up a custom e-mail sender in Supabase (Authentication > SMTP). The built-in sender only allows a few e-mails per hour. A free Resend or Postmark account is enough.
3. Switch Stripe to live mode: new secret key, new price ID, new webhook secret, then update the three Stripe secrets in Supabase.
4. Optional: your own domain in Cloudflare Pages (Custom domains). Then update APP_URL and the Supabase URLs.


## Running costs at the start

Supabase: free tier while you build (it pauses after 7 days without activity); Pro at 25 USD a month once students use it
Cloudflare Pages: free
GitHub: free
Stripe: per payment only (Swiss cards 2.9% + CHF 0.30)
Claude API: a few francs a month at test volumes; the spending limit caps it
Domain: about CHF 15 a year, optional
