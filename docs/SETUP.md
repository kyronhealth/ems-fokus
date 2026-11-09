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

1. Create a free account at supabase.com.
2. New project.
   Name: ems-fokus
   Region: Central Europe (Zurich)
   Database password: generate one and save it in your password manager.
3. When the project is ready, open Project settings > API and note:
   Project URL
   anon public key
   service_role key (secret)
   Project ID (the short code in the URL)
4. Authentication > URL configuration:
   Site URL: your app address from step 3 (for example https://ems-fokus.pages.dev)
   Redirect URLs: add the same address followed by /auth
5. Authentication > Providers > Email: keep "Email" on, turn "Confirm email" on.
6. Authentication > Email templates > Magic link: translate the subject and text into German. Suggested subject: Dein Anmeldelink für EMS Fokus
7. Create an access token for deployments: supabase.com > Account > Access tokens > Generate.
8. In GitHub, open the repository > Settings > Secrets and variables > Actions > New repository secret, and add:
   SUPABASE_ACCESS_TOKEN = the access token from point 7
   SUPABASE_PROJECT_ID = the Project ID
   SUPABASE_DB_PASSWORD = the database password
   SUPABASE_URL = the Project URL
   SUPABASE_SERVICE_ROLE_KEY = the service_role key
9. In GitHub > Actions, run "Deploy Supabase" and then "Import content" (button "Run workflow"). Both should turn green.


## Step 3: Cloudflare Pages (the website)

Cloudflare's free plan allows commercial use. (Vercel's free plan does not.)

1. Create a free account at cloudflare.com.
2. Workers & Pages > Create > Pages > Connect to Git > choose ems-fokus.
3. Build settings:
   Framework preset: None
   Build command: npm run build
   Build output directory: dist
4. Environment variables (Production):
   VITE_SUPABASE_URL = the Project URL
   VITE_SUPABASE_ANON_KEY = the anon public key
   VITE_PRICE_LABEL = CHF 49 (or your price)
   NODE_VERSION = 22
5. Save and deploy. Your address will be something like https://ems-fokus.pages.dev. Put it into Supabase (step 2, point 4) if you have not yet.


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

Supabase: free tier (the project pauses after a week without visitors; the paid tier is needed once you are live)
Cloudflare Pages: free
GitHub: free
Stripe: per payment only (Swiss cards 2.9% + CHF 0.30)
Claude API: a few francs a month at test volumes; the spending limit caps it
Domain: about CHF 15 a year, optional
