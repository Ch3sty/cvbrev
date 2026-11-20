# Omgång 2, steg C: de publika testvyerna

Baslinje och kontrakt inför ombyggnaden av de publika proven till sessionsramen (skissen i artefakten KtViRMpthysT8t34isdnPK, rad 11 till 14). Tagen 2026-11-20 mot www.jobbcoach.ai.

## Filerna

| Fil | Vad |
| --- | --- |
| `docs/qa/seo-diff/omgang2-publikt-fore.json` | SEO-avtrycket före, 21 sidor, ur `scripts/seo-diff-artiklar.ts ta` |
| `docs/qa/seo-diff/omgang2-publikt-prov-fore.json` | Provrutornas server-HTML före, 19 sidor, ur `scripts/qa-omgang2-publikt-prov.ts ta` |
| `scripts/qa-omgang2-publikt-prov.ts` | Nytt: kollar att uppgift 1 och reglaget står i server-HTML:en (seo-diffen ser inte det) |
| `src/components/artiklar/prov/__tests__/artikelprov-kontrakt.test.tsx` | Artikelprovet, 88 test |
| `src/components/publikt/__tests__/prova-kontrakt.test.tsx` | /verktyg/rekryteringstester/prova, 6 test |
| `src/components/publikt/__tests__/personlighetsprov-kontrakt.test.tsx` | Personlighetsprovet, 5 test |
| `src/components/publikt/__tests__/prov-server-kontrakt.test.ts` | API-svaren, registreringens resultat och adresser, 24 test |
| `src/components/publikt/__tests__/registrering-prov-kontrakt.test.tsx` | Resultatpanelen, ProvBrickor, ProvTypGenomgang, 14 test |

Sidorna i baslinjen: de 16 artiklarna med `<ArtikelProv>` (alva-labs-logiktest, aon-cut-e-test, cubiks-logiks-test, deduktivt-induktivt-test, i-prov, logiktest-exempel-med-losningar, logiktest-tips, logiska-tester, matrigma-test, numeriskt-test-guide, ordforstaelse-test, rotation-test-guide, stanine-testresultat, talserier, tester-hos-myndigheter, verbalt-test-guide), map-test-personlighetstest, personlighetstest-jobb-guide, /verktyg/personlighetstest, /verktyg/rekryteringstester och /verktyg/rekryteringstester/prova. Provrutornas avtryck har samma sidor utom de två verktygssidorna för rekryteringstester.

## Så kör steg C efter-diffen

1. Bygg och starta lokalt: `npm run build` och `npx next start -p 8300`.
2. SEO-avtrycket efter, med exakt samma sidlista (i Git Bash krävs `MSYS_NO_PATHCONV=1`, annars görs `/artiklar/...` om till en Windows-sökväg och värden blir `www.jobbcoach.aic`):

```bash
S=$(grep -l "<ArtikelProv" content/artiklar/*.mdx | sed 's#content/artiklar/#/artiklar/#; s#\.mdx##' | paste -sd,)
S="$S,/artiklar/map-test-personlighetstest,/artiklar/personlighetstest-jobb-guide,/verktyg/personlighetstest,/verktyg/rekryteringstester,/verktyg/rekryteringstester/prova"
MSYS_NO_PATHCONV=1 npx tsx scripts/seo-diff-artiklar.ts ta --port 8300 --sidor "$S" --ut docs/qa/seo-diff/omgang2-publikt-efter.json
npx tsx scripts/seo-diff-artiklar.ts jamfor --fore docs/qa/seo-diff/omgang2-publikt-fore.json --efter docs/qa/seo-diff/omgang2-publikt-efter.json --rapport docs/qa/seo-diff/omgang2-publikt-diff.md
```

3. Provrutorna efter:

```bash
npx tsx scripts/qa-omgang2-publikt-prov.ts ta --bas http://localhost:8300 --ut docs/qa/seo-diff/omgang2-publikt-prov-efter.json
npx tsx scripts/qa-omgang2-publikt-prov.ts jamfor --fore docs/qa/seo-diff/omgang2-publikt-prov-fore.json --efter docs/qa/seo-diff/omgang2-publikt-prov-efter.json
```

4. Kontraktstesterna: `npx vitest run --dir src src/components/artiklar/prov/__tests__ src/components/publikt/__tests__`.

Grinden är densamma som i tidigare omgångar: båda jämförelserna ska sluta med `Fel: 0` och alla kontraktstester ska vara gröna. Behövs ett undantag läggs det i en egen fil, `scripts/seo-baslinje/omgang2-publikt-2026-11-<dag>-undantag.json`, med datum och skäl per post, som textdäckets `textdack-2026-11-19-undantag.json`. Rör inte de andra undantagsfilerna.

## Tillåtna och otillåtna skillnader

Tillåtet:

- Ny markup, klasser och text inne i provrutan (`aside[data-artikel-prov]`), i personlighetspanelen och i provsidans vyer.
- Ord i main kan ändras, men se fallgrop 6: på de hårda sidorna är toleransen 2 procent.
- Nya händelseegenskaper som tillägg (till exempel `plats: 'prova'` på provsidans sample_completed och signup_gate_shown).

Inte tillåtet (fäller grinden):

- Ändrad title, description, canonical, robots eller h1 på någon sida. Provsidan ska behålla `noindex, follow`, canonical till `/verktyg/rekryteringstester` och intro-h1:an.
- Nya, borttagna eller omdöpta h2 och h3. Provrutan och personlighetspanelen får inte ha några rubriker alls (h1 till h6).
- Försvunna interna länkar i innehållet, ändrade FAQ-frågor, ändrad JSON-LD.
- Uppgift 1 borta ur server-HTML:en, färre än två svarsknappar som går att trycka på utan JavaScript, eller ändrade attribut på rutan (`data-artikel-prov`, `data-cta-position="inline"`, `data-cta-cluster`, `data-cta-variant="prov-<typ>"`, `data-cta-slug`, `aria-label`).
- Reglaget (fem radioknappar) borta ur personlighetssidornas server-HTML.
- Facitnycklar i någon sidas HTML.

## Vad steg C ersätter

| Yta | Filer |
| --- | --- |
| Provsidan | `src/app/(public)/verktyg/rekryteringstester/prova/ProvaFlow.tsx`, skalet `src/components/registrering/PubliktFlodesskal.tsx` (används också av registreringen och inloggningen, så ändra med försiktighet), `src/components/publikt/prov/TypUppgiftVy.tsx` |
| Artikelprovet | `src/components/artiklar/prov/ArtikelProv.tsx` (serverdelen), `ArtikelProvKlient.tsx`, `ArtikelProvRam.tsx`, `useArtikelProv.ts` |
| Personlighetsprovet | `src/components/artiklar/personlighetsprov/Personlighetsprov.tsx`, `Segmentrad.tsx` (texten i `personlighetsprov-copy.ts`) |
| Registreringens panel | `ProvPanel` i `src/components/registrering/RegisterKontoSteg.tsx`, `src/components/publikt/ProvBrickor.tsx` |
| Genomgången efter kontot | `src/app/dashboard/tester/prov/[token]/ProvTypGenomgang.tsx` |

Rör inte: `src/app/api/public/test-session/route.ts`, `src/app/api/public/personlighetsprov/route.ts`, `src/lib/tests/prov-typer*.ts`, `src/lib/tests/anon-session.ts`, `src/lib/letters/claim-draft-client.ts`, `src/lib/tests/prova-lokalt.ts`. Testerna läser dem som kontrakt.

## Kontrakten

Händelserna (PostHog), per yta:

| Händelse | Provsidan | Artikeln | Personlighet |
| --- | --- | --- | --- |
| sample_started | `{ kind: 'test', cluster: 'test', test_kind, plats: 'prova' }` vid start | `{ kind: 'test', cluster: 'test', test_kind, plats: 'artikel', slug }` när starten lyckats (första svaret) | `{ kind: 'personality', cluster: 'test', slug }` vid första valet |
| sample_completed | `{ kind: 'test', cluster: 'test', test_kind }` (ingen plats i dag) | samma som sample_started | `{ kind: 'personality', cluster: 'test', slug, duration_ms }` |
| signup_gate_shown | `{ kind: 'test', cluster: 'test', test_kind }` | samma som sample_started | `{ kind: 'personality', cluster: 'test', slug }`, bara utan konto |
| signup_started | `{ cluster: 'test', source_page: '/verktyg/rekryteringstester/prova' }` | `{ cluster: 'test', source_page: '/artiklar/<slug>' }` | `{ cluster: 'test', source_page }`, `/artiklar/<slug>` eller `/verktyg/personlighetstest` |
| sample_restored | `{ kind: 'test' }` när resultatet återställs, utan ny sample_completed | finns inte | finns inte |

data-cta: `prova-start` (startknappen), `prova-gate` (spärrens länk), `artikel-prov-gate` (artikelns spärr, inne i rutan med `data-cta-position="inline"`), `personlighetsprov-gate` (spärren och kvotens länk), `personlighetsprov-konto` (inloggad).

Rutter: `/register?test=<token>` från provsidan och artikeln, `/register?personlighet=<token>` från personlighetsprovet, `/register` vid kvoten.

POST `/api/public/test-session`: matrisen på provsidan utan kropp; typerna på provsidan `{ typ }`; artikeln `{ typ, artikel }` (även för matris); rättningen `{ token, answers }` med ett svar per uppgift. Svaret före claim är bara uppgifterna utan facit och, vid rättningen, `{ score, total, fel, percentile }`.

POST `/api/public/personlighetsprov`: `{ token, answers: [{ id, value }] x 20, slug }`, som ska klara `validerBegaran`.

sessionStorage: `jc_pending_test` (storePendingTestSession), `jc_prova_resultat_v2` (sparaProv), `jc_pending_personlighet` (storePendingPersonlighet), `jc_smakprov_aktiv` och `jc_smakprov_<token>` (personlighetsprovet mitt i). Kakan `jc_provkalla` får `via: 'smakprov'` och `slug` när artikelns prov startar.

## Fallgropar

1. **Uppgift 1 i artikeln väljs med ett fast frö.** `ArtikelProv` är en serverkomponent som väljer uppgift 1 med `artikelSeed(typ, slug)` (matrisen `artikelSeedMatris(slug)`), samma HTML för alla besökare och för CDN-cachen. Servern bygger om samma prov när klienten skickar `{ typ, artikel }`, och uppgift 1 behåller artikelns frö (`valjProv(..., forstaSeed)`), så alternativens ordning i HTML:en är densamma som servern rättar mot. Svaret på uppgift 1 är positionen i HTML:en. Flyttas uppgift 1 till klienten, ritas med ett annat frö eller blandas om, rättas den fel. Kontraktstestet `{ typ, artikel }: uppgift 1 är artikelns serverrenderade uppgift` fångar det.
2. **Svaret på uppgift 1 sparas före token.** Klienten håller svaret i en ref medan starten går, och token finns först efter. `TypProv` skickar `seed={lage.token ?? 'artikel'}` som sessionId till Nivåkollens komponent; den används bara för felrapporten, inte för ordningen.
3. **RubrikTagg.** I artiklarna sätter `TypUppgiftVy` `RubrikTaggProvider value="p"`. Bara `DeduktivFraga` läser den i dag, men utan providern blir deduktivas rubrik en h2 i artikelns rubrikträd och seo-diffen fäller (deduktivt-induktivt-test). Byter steg C till sessionsramens komponenter måste de få samma p-läge. Provsidan använder standardläget h2, och dess frågevy har en h1 (`pub-prov-fraga-txt`); den syns inte i avtrycket eftersom servern bara ritar intron.
4. **Token-livslängd.** `anon_test_sessions.expires_at` och `anon_personality_samples.expires_at` är sju dagar från start; personlighetsprovets rad får null vid claim eller när besökaren är inloggad. Det sparade resultatet i fliken (`jc_prova_resultat_v2`) gäller i ett dygn. Personlighetsprovets token skapas i klienten (`crypto.randomUUID`, med en ordning som börjar på påstående 1), servern skapar den inte. Ett hämtat testprov rättas aldrig om (404).
5. **Gränserna.** Tre prov per IP och dygn för alla testtyper tillsammans (scope `anon_test`, provsidan och artiklarna delar), tre personlighetsprov (scope `anon_personality`), 30 resultatläsningar för registreringens panel. 429 ger `message` och `registerHref: '/register'`; båda vyerna visar meddelandet med länk.
6. **Ordantalet på de hårda sidorna.** Provrutans och panelens text räknas in i ord i main (aria-hidden räknas inte). Toleransen är 2 procent. /verktyg/personlighetstest har bara 617 ord, så panelen får tappa högst cirka 12 ord. Kortaste artikeln är cubiks-logiks-test med 2114 ord (cirka 42 ord). Stryks rutans inledande mening och raden under uppgiften samtidigt kan en kort artikel falla.
7. **Personlighetsprovet laddas med next/dynamic** (`src/components/artiklar/mdx-klient.tsx`) och serverrenderas i dag: påstående 1 och reglaget står i HTML:en. Sätts `ssr: false` försvinner det, och provskriptet fäller.
8. **Mätningen av rutan sker utanför komponenten.** `ArtikelKlient` läser alla `[data-cta-position]` för article_cta_shown och tar cluster, variant och slug ur rutans data-attribut. Personlighetspanelen ska inte ha `data-cta-position` (räknas då som reklamkort). I talserier och i-prov finns två element med `inline:prov-<typ>` (TypProvKort och rutan); det är som i dag.
9. **ersatterProvkort** i MDX läses bara som text av artikelsidan (`content.includes('ersatterProvkort')`) för att hoppa över klustrets inlinekort; komponenten tar inte emot propen. Ta inte bort attributet ur MDX-filerna.
10. **Avvikelser som testerna låser som de är:** provsidans sample_completed och signup_gate_shown saknar `plats` (får läggas till som `'prova'`), artikelprovet har ingen återställning efter Tillbaka från registreringen (och alltså ingen sample_restored), och matrisen på provsidan startas helt utan kropp. Ändras något av det är det ett beslut, inte en följd av ombyggnaden.
11. **Testerna hittar svaren via roller.** Svarskontrollerna letas som `radio` om sådana finns, annars knappar, utan navigering (Föregående, Tillbaka). Personlighetsprovet kräver fem radioknappar per påstående. Får sessionsramen andra kontroller räcker det att ändra hjälparen `svarsknappar()` i testfilen, inte förväntningarna.
