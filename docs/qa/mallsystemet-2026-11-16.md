# Mallsystemet: API för komponenterna (2026-11-16)

Byggagent A, grenen `feat/mallar`. Det här är vad komponenterna (mallväljaren, dokumentet, arken, finalen, artikelkomponenten) anropar. Allt annat i `src/lib/cv/mallar/` är serverns.

## 1. Klientsäkert (får importeras i komponenter)

| Modul | Export | Vad |
|---|---|---|
| `src/lib/cv/mallar/kontrakt.ts` | `SEKTIONER`, `Sektion`, `Ordning`, `Niva`, `Familj`, `TypsnittId`, `MallVal`, `MallKort`, `Format` | Kontraktet (samordnarens). Tillägg från A: `MallKort.typsnitt?` (mallens brödtextstypsnitt, förval i verktygsraden). |
| `src/lib/cv/mallar/katalog.ts` | `MALL_KATALOG: readonly MallKort[]` | Alla mallar i visningsordning, gratis först. Liten: ingen renderare, ingen CSS. |
| | `getMallKort(id)`, `arMallId(id)` | Kortet för ett id i katalogen (inget alias). |
| | `FORVALD_MALL_ID` | Första gratismallen; används när inget är valt. |
| | `GRATIS_MALL_IDS`, `WORD_MALL_IDS` | |
| | `harWord(id)`, `arGratisMall(id)` | |
| | `MALL_ANTAL`, `GRATIS_ANTAL`, `PREMIUM_ANTAL`, `WORD_ANTAL` | Talen. Copy läser dem via `src/lib/cv/template-antal.ts` (samma namn som förut: `TEMPLATE_COUNT`, `FREE_TEMPLATE_COUNT`, `PREMIUM_TEMPLATE_COUNT`, `WORD_TEMPLATE_COUNT`, `WORD_TEMPLATE_COUNT_ORD`, `WORD_MALL_NAMN`, `WORD_MALL_TYPSNITT`, `harWordVersion`, `talSomOrd`). |
| | `mallBild(id)` | `{ liten: '/mallar/v2/<id>-liten.webp' (112 x 158), stor: '/mallar/v2/<id>-stor.webp' (300 x 424) }`, samma som `MallKort.bild`. |
| `src/lib/cv/mallar/alias.ts` | `losMallId(id): string \| null` | Gamla id (41 gamla mallar + 7 äldre ur `formatted_cv_downloads`) till efterföljaren. Id som finns returneras som de är, okända ger null. Använd för `?mall=`, sparade val och localStorage. |
| | `losMallIdEllerForval(id)` | Som ovan men okänt ger `FORVALD_MALL_ID`. |
| | `MALL_ALIAS` | Kartan. |
| `src/lib/cv/rubriker.ts` | `BIBLIOTEK[sektion]` | Rubrikarkets rullista per avsnitt, förvalet först. |
| | `UPPSATTNINGAR`, `UPPSATTNING_IDS`, `UPPSATTNING_NAMN` | Tolv uppsättningar och namnen ("Vård och omsorg") för raden "Rubriker: Vård och omsorg, ändra". |
| | `forvalFor(cv)` | Uppsättningen för ett CV (titel, önskad roll, senaste tjänst, utbildning, kompetenser). Svag signal ger `allman`. |
| | `uppsattningForTitel(titel)` | Bara titeln. För artikelkomponenten medan besökaren skriver. |
| | `rubrik(sektion, cv, val)`, `rubriker(cv, val)` | Rubriken som gäller: valet i `val.rubriker`, sedan `cv.sectionTitles`, sedan uppsättningen (`val.uppsattning` eller förvalet), sedan standard. |
| | `RUBRIK_MAX` (40), `rensaRubrik(text)` | "Skriv egen rubrik": högst 40 tecken. |
| `src/lib/cv/mallar/val.ts` | `tolkaVal(obj)`, `tolkaValUrQuery(params)`, `arTypsnitt`, `arOrdning`, `TYPSNITT_IDS` | Samma validering som servern gör. |

`MallVal` (kontrakt.ts): `{ ordning?, enSida?, farg? (0 till 3), typsnitt?, foto?, rubriker?, uppsattning? }`. Tomt fält betyder mallens förval.

## 2. Rutterna

### POST `/api/cv/preview-html` (inloggad)
Body: `{ template, structuredData | cvText, val?, cvId? }`. Äldre fält tas som reserv: `templateOptions.includePhoto` blir `val.foto`, `fontFamily` blir `val.typsnitt`.
Svar: `{ html, mall }` där `mall` är mallens id efter alias. HTML:en är förhandsvisning: en tom fotoplats visar initialen.

### POST `/api/cv/generate-formatted`
Body: `{ template, structuredData | cvText, format: 'pdf' | 'docx', val?, cvId? }`. Samma spärrar som i dag (premiummall, Word kräver Premium, gratisnedladdningen). `template` löses med alias; `formatted_cv_downloads.template_id` loggas med det nya id:t. `cvId` gör att sparade rubriker följer med; `val.rubriker` går före.

### PUT `/api/cv/section-titles` (inloggad, eget CV)
Body: `{ cvId, rubriker: { [sektion]: string | null } }`. Sträng sätter (högst 40 tecken, annars 400), `null` eller `''` tar bort ("Tillbaka till förslaget"), avsnitt som inte nämns lämnas. Okänt avsnitt ger 400, annat CV 404. Svar: `{ rubriker }` (det som nu är sparat). Kolumnen `cv_texts.section_titles` (jsonb, nullable) finns i prod sedan 2026-11-16.

### GET `/api/public/exempel/cv` (publik, CDN-cache ett dygn, noindex)
Query: `mall` (alias löses; okänd ger 404), `typsnitt`, `farg` (0 till 3), `ordning`, `foto` (0/1), `ensida` (0/1), `uppsattning` eller `rubriker` (ett uppsättnings-id, eller JSON med valda rubriker), `yrke` (yrkessidans slug: exempel-CV:t med yrkets titel och kompetenser, rubrikerna ur yrket).
Svar: HTML med skalskriptet för iframen.

## 3. HTML:en (för textbytet i exempel-iframen)

- `<html lang="sv" data-mall="<id>">`, en `.cv` på 210 mm.
- `h1[data-falt="namn"]`, `p[data-falt="titel"]` (alltid med; dold med `:empty` när titeln saknas, så exempel-iframen kan fylla den), `ul[data-falt="kontakt"] > li[data-falt="epost|telefon|ort|linkedin|webb"]`, `[data-falt="foto"]`.
- Varje avsnitt: `section[data-avsnitt="<sektion>"] > .start > h2[data-sektion="<sektion>"]`. Kontakten i en sidospalt är `section[data-avsnitt="kontakt"]`.
- Varje post: `[data-post]`.
- Tokens som CSS-variabler på `:root`: `--accent`, `--ton`, `--text`, `--dampad`, `--linje`, `--typsnitt`, `--typsnitt-rubrik`, `--grad*`, `--sida-*`.

## 4. Det som inte ska importeras i klienten

`src/lib/cv/mallar/register.ts`, `definitioner/*`, `render/*`, `innehall.ts`, `src/lib/cv/word/*`, `src/lib/cv/rendera-mall-html.ts`. Kompatibilitetslagren finns kvar tills komponenterna läser katalogen och rutterna: `src/lib/cv/simple-templates.ts` (SIMPLE_TEMPLATES, getTemplateById med alias, isTemplateFree, FREE_TEMPLATE_IDS), `src/lib/cv/mallar/kompat.ts` (isValidTemplateId, liten) och `src/lib/cv/mallar/kompat-generator.ts` (getTemplateGenerator, drar in renderaren: används i dag av cv-exempel, yrkessidans förhandsvisning och CV-byggarens steg 7; byt dem mot exempel-API:t och preview-html).

## 5. Utbudet (2026-11-16)

20 mallar i katalogen, i visningsordning: linne, bjork (gratis, PDF och Word); koppar, kalksten, granit, kolumn, arsring, antikva, fasad, raster, folio, stal (Premium, PDF och Word); morkrum, terrakotta, kvadrat, siluett, ritning, tidning, tusch, horisont (Premium, bara PDF). Fotoplats: bjork, koppar, kalksten, granit, fasad, morkrum, siluett. Alla 41 gamla id och 7 äldre id ur `formatted_cv_downloads` har alias (`src/lib/cv/mallar/alias.ts`); gamla gratismallar pekar på gratismallar, `linje` på Stål.

## 6. Grindarna

- `npm run test:ats` (scripts/ats-mallar.ts): 20 mallar x kort, normalt, långt, intyg först, utbildning först; PDF och Word.
- `npx tsx scripts/mallar-sidbrytning.ts [--ut <mapp> --png]`: delade poster, ensamma rubriker, sidor med en eller två rader, sidantal.
- `npx tsx scripts/word-mallar-granska.ts <mapp>`: Word via COM, Chrome-PDF mot Word-PDF sida vid sida (`<mall>-<längd>-jamforelse.png`).
- `npx tsx scripts/mallbilder.ts`: miniatyrerna; vitest fäller om en saknas.
- Vitest: `src/lib/cv/__tests__/rubriker.test.ts`, `src/lib/cv/mallar/__tests__/*`, `src/lib/cv/word/__tests__/word-mallar.test.ts`, `src/lib/cv/__tests__/template-count.test.ts`.
