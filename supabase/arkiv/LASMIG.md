# Arkiv: edge-funktioner som inte längre är i drift

Källkoden här är hämtad ur produktion (`supabase functions download`) innan funktionen togs bort eller ersattes. Ingenting här driftsätts. Mappen ligger utanför `supabase/functions` så att CLI:t inte ser den.

| Mapp | Vad | Datum | Varför |
| --- | --- | --- | --- |
| `match-jobs-ALL-MUNICIPALITIES/` | Äldre kopia av matchningen. Togs bort ur produktion. | 2026-11-21 | Ingen anropare, saknade källkod i repot, tog användarens id ur anropets innehåll och läste `cv_analysis_jobs.result` med service role. |
| `Kompetensutveckling-driftsatt-fore-2026-11-21/` | Versionen som låg i drift innan spärren "pausad" lades in. Skilde sig från `supabase/functions/kompetensutveckling`. | 2026-11-21 | Sparad för att kunna jämföra när funktionen väcks igen. |

Återställa: kopiera mappen till `supabase/functions/<namn>/` och driftsätt. Rätta först det som står i kolumnen Varför.
