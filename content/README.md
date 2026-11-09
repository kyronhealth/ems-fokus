# Content (question bank)

`bank.json` is the single source of truth for all questions and sets. It is NOT shipped to the public website:
`npm run import-content` copies it into the Supabase database, where paid sets are only readable with an active pass.

Rules for every question:
- exactly 5 options, exactly one correct (`correct` is 0–4)
- an `explanation` that says why the key is right and names the typical trap
- original wording only, never copied from published EMS material
- Swiss spelling: "ss", never "ß"

Workflow for new questions:
1. Generate a batch with Claude (prompt in docs/content-prompts.md).
2. Check numbers in code; let a second model solve the batch without the key; fix or drop every disagreement.
3. Add to `bank.json`, run `npm run check-content`, then `npm run import-content`.

A set with `"free": false` is only visible to students with a season pass.
