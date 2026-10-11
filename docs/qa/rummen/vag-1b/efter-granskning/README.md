# Rummen våg 1b, efter granskningen (spec 16.3 a)

Datum 2026-10-11. Branch `design/rummen-1b`, efter merge av `origin/main`
(e158144f). Produktionsbygge `NEXT_DIST_DIR=.next-r1b2`, server på port 5233.
Klicktest i riktig Chrome (puppeteer-core) med tre nyskapade konton
(`qa-rummen-1b-{gratis,hela,mycket}-*@jobbcoach-qa.test`), raderade med id
efteråt (räknat före varje delete).

## Mappar

| Mapp | Innehåll |
|---|---|
| `vyer/` | 212 skärmdumpar: kontot med mycket data på 29 routes, gratis och Hela paketet på 12 routes, Pixel 7 och 1280, ljust och mörkt. Namn: `<konto>-<form>-<läge>-<route>.png`. |
| `dorrar/` | Dörrnavet på Pixel 7 och 360 px i alla fyra rum, ljust och mörkt, och rumsbytet via dörrarna. "Tester" står på en rad på 360 px, inget klipps. |
| `sidomeny/` | Sidomenyn per rum, ljust och mörkt: Rekryteringstester ryms, grupprubriken utan "I", Provläget låst med "Vårt provläge. 18 uppgifter, 25 minuter.", kontoraden på två rader. |
| `komigang/` | Kom igång-raden på Jobbsökets hem vid scrollbotten: sista raden i listan står ovanför raden (743 mot 769 px) i båda kontona och lägena. |
| `fokus/`, `floden/`, `natfel/`, `tema/` | Samma kontroller som i 1b, omkörda. |

## Resultat

- Klicktest: 212 av 212 vyer utan anmärkning i omkörningen på slutbygget
  (topprad och nav i bild, h1 i bild, rätt `data-rum` och statusfält, ingen
  horisontell scroll, body rullar inte, högst en kopparknapp, inga vita ytor i
  mörkt läge, ingen text under 3:1, inga konsolfel, inga 4xx/5xx). Första
  körningen hade en enstaka 502 från en extern resurs på
  `tester-personlighet` desktop mörkt; omkörningen var ren.
- `grep-rummen.mjs --vag 1b --noll`: 0 (grå klasser, lucide, och nya
  grinden "KNAPP_PRIMAR på väggen"). `grep-1b.txt`.
- `kontrast-rummen.mjs`: inga avvikelser. `kontrast.txt`.
- Prestanda (`perf.txt`, 39 routes, 3 körningar, Pixel 7 med 3x CPU och LTE):
  CLS 0 (0,001 är mätbrus under 0,002) på alla routes, LCP inom budget på 38
  av 39. `dashboard` mätte 1536 ms som första route mot en kall server;
  omkörd med 5 körningar 748 ms (`perf-omkorning-dashboard.txt`).

## Att titta på för art-director

- Lyftet: `vyer/mycket-pixel7-ljust-{profil-cv,mina-brev,mina-brev-id,sokta-tjanster,tester-slug,tester-provlaget,tester-personlighet,tester-resultat,cv-analys,mina-brev-id-edit}.png`.
- Väggen utan kopparknapp: `vyer/mycket-pixel7-ljust-dashboard.png`, `-intervju.png`, `-sokta-tjanster-id.png`.
- J2 på dator (Nästa handling till vänster): `vyer/mycket-desktop-ljust-dashboard.png`.
- Mörkt läge: samma namn med `morkt`.
