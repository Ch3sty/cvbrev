# QA: mallsatsningen steg 1 (2026-11-16)

Plan: `docs/plan-mallar-2026-11-15.md` avsnitt 0 (beslut 0), 6b (fas 0b) och fas 0 (tre textfel, mätning).

## Vad som ändrats

| Del | Ändring |
|---|---|
| Beslut 0 | `email_verified_at`-kontrollen borta ur `cv/generate-formatted` och `letters/download`. Spärren på permanent lagring (`cv/upload`, `letters`) står kvar. |
| Gratisräknaren | `free_cv_exports_used` skrevs med användarens klient men är skyddad kolumn sedan 2026-10-10 (`profiles_skyddade_kolumner_steg2`), så uppräkningen blockerades tyst. Skrivs nu med adminklienten. Utan den rättelsen hade spärren bort gett gratiskonton obegränsat med PDF:er. |
| Felvisning | `src/lib/cv/nedladdningsFel.ts`: begripliga rader i stället för koder. Byggarens steg 7 visar felet under knappen (`FlowShell.primaryError`), 402 visar betalväggen. Brevknappen visar aldrig serverns råa text. |
| ATS-ordningen | `src/lib/cv/ats-ordning.ts` körs i PDF-steget (`swedish-cv-pdf-generator.ts`): alla block positionerade i dokumentordning (jobbpunkterna skrivs inte längre sist), gradienttext blir vanlig text i gradientens mörkaste färg, bokstavsavstånd högst 0,16 em, ingen automatisk avstavning, z-index över noll på relative-block nollas. Layouten oförändrad (pixeljämförelse 41 mallar x 3 längder: bara bokstavsavstånd, gradientfärg och radfall vid avstavning skiljer). |
| CV-läsaren | `cleanExtractedText`: radbrytningar bevaras, "för 5" blir inte "för5". |
| ATS-testet | `scripts/ats-mallar.ts`, `npm run test:ats`: alla mallar i registret x kort, normalt, långt (med foto) genom samma PDF-kedja som nedladdningen, läst med pdf-parse; Word med mammoth. |
| Textfel | `/cv-mallar/start`-metan säger antalet gratismallar ur koden; "· PDF och Word" bort på gratismallarna i rullistan; "Mindre ATS-vänlig" bort (alla mallar klarar testet). |
| Mätning fas 0 | Server: `export_blockerad` (kvot, mall, word, brev), `cv_nedladdad`. Klient: `mall_bytt`, `typsnitt_bytt`, `nedladdning_klickad` (galleri, byggare), `mallvisning_mall_bytt`, `mallvisning_klick` (artiklar), `betalvagg_visad` plats mall när en låst premiummall är vald i galleriet. |

## Resultat

- tsc: grönt. vitest: 2221 gröna; 3 fel i `kandidater.test.ts` och `admin/fragor/data.test.ts` finns också på main (förexisterande, orörda).
- `npm run build`: grönt.
- `npm run test:ats`: 141 av 141 gröna (41 mallar x 3 längder + 6 Word-mallar x 3). Före rättelsen: 0 av 15 utbudsmallar enligt saas-leads mätning.
- Klicktest i riktig Chrome mot produktionsbygget, Pixel 7 och 1280, tre nya konton utan `email_verified_at` (e-post, Google, Premium): 35 av 35 kontroller OK. Gratis: första PDF laddas ner, räknaren står på 1, andra PDF:en ger 402 och vyn säger att gratisnedladdningen är använd. Premium: PDF, Word-CV, brev som PDF och Word ger 200. Inga konsolfel eller 4xx/5xx. Testkontona raderade per id (3 + 3).
- SEO-diff mot live, 18 sidor (/verktyg/cv-mallar, /cv-mallar, /cv-mallar/start, /verktyg/skapa-cv och de 14 artiklarna med mallvisningen): Fel 0, ett undantag (metan på /cv-mallar/start, `scripts/seo-baslinje/mallar-steg1-2026-11-16-undantag.json`).
- Perf: /dashboard/cv-mallar LCP 1416 ms (budget 1500), CLS 0,001; /verktyg/cv-mallar 552 ms, /cv-mallar 580 ms, artikel 728 ms, CLS 0.
