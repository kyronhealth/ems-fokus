# Prompts for new questions

Use these in a Claude chat (or ask Claude to run them). Every batch goes through all three steps before it enters content/bank.json.

## 1. Write a batch

```
Write 6 new practice questions in German (Swiss spelling: always "ss", never "ß") in the style of the EMS task group "{GROUP}". Each has an optional short stem, one question and five options (A–E), with exactly one correct. Solve each one step by step before giving the key, and give a 1–3 sentence explanation that names the typical trap. Do not copy or paraphrase any published EMS question. Return JSON objects with the fields: id, group, stem, question, options, correct (0–4), explanation.
```

For "Quantitative und formale Probleme": numbers must work without a calculator in about 2½ minutes.
For "Textverständnis": write one original text of about 600 words first, then 6 questions that can only be answered from the text.
For "Diagramme und Tabellen": include the table or chart data as an "exhibit" field (same format as in bank.json).

## 2. Check numbers in code

Ask Claude to recompute every quantitative key in Python and to confirm no other option has the same value.

## 3. Independent solve

Start a fresh chat (or a separate agent) and give it the questions without the keys:

```
Solve these questions without an answer key. For each, give your answer and the calculation, and say if the question is ambiguous, has more than one defensible answer, contains a factual error, or uses "ß".
```

Fix or drop every question where the independent answer differs from the key or a problem is flagged. Then add the batch to content/bank.json, put it in a set (free: false for paid sets) and push. The "Import content" workflow loads it into the database.
