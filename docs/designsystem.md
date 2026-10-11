# Designsystem: Rummen (v3)

> Gäller inloggat: dashboarden, flödena, betalväggarna och arken i
> `/dashboard`. Publika sidor, auth, kassan, mejl och adminen följer Tråden
> v2.1 tills deras egen omgång (avsnitt 12). Artikelbilder 1200×630 följer
> `reference_article_image_standard` och berörs inte.
>
> Beslut och byggordning: `docs/design/spec-rummen-2026-10-10.md` (godkänd
> av testansvarig 2026-10-10). Utseendet: `docs/design/koncept-testvy-2026-10-10.html`.
> Tokenvärdena bor i `src/app/globals.css`, klassnamnen i `tailwind.config.js`.
> Kontrasten räknas maskinellt med `node scripts/kontrast-rummen.mjs`.

## 1. Principer

Jobbcoach är ett hus med fyra rum: Träningen, CV, Personliga brev och
Jobbsöket. Rummen delar typografi, djup, illustrationsspråk, rörelse och nav.
De skiljer sig i väggfärg, i instrumentet på väggen och i vad "framåt"
betyder. Profil och konto står i ett grafitgrått rum utan eget instrument.

Varje vy har en mörk **vägg** högst upp, i rummets kulör, med rubriken och
rummets instrument (kurvan, poängringen, spåret). Under den ligger **golvet**
med kort i **papper**. Väggen är mörk även i ljust läge: det är den som ger
djupet och som gör ljust och mörkt läge till samma produkt.

**Koppar `#E07A2F` är den enda accenten.** Den är knappen, kurvan, märkena,
fokusringen och "här är du". Kopparfärgad text på väggen är alltid
koppar-ljus, på papper alltid koppar-ink. Ren koppar bär aldrig text.

En vy har exakt en primärknapp, och den är koppar med mörk text. Status är en
rad, innehåll är ett kort, ett tal står aldrig ensamt.

## 2. Tokens

Alla värden ligger som CSS-variabler i `globals.css` och har Tailwind-namn i
`tailwind.config.js`. Hex skrivs aldrig i en komponent.

**Var de gäller.** `DashboardShell` sätter `data-rum` på sin yttersta div i
serverns HTML. Rummens block står under `:root:has([data-rum])` och
`[data-rum="…"]`, så tokens lyfts till `<html>` och även ark i en portal
(`Sheet`, `UpgradeSheet`) står i rummet. Utan rum gäller Trådens värden.
Våg 1a sätter `data-rum="jobb"` på hela inloggat; `rumForPath` per route
kommer i våg 1b (spec avsnitt 5).

### Gemensamt för alla rum

| Variabel | Ljust | Mörkt | Tailwind | Roll |
|---|---|---|---|---|
| `--koppar` | `#E07A2F` | samma | `bg-koppar` | Linje, punkt, knapp, fokusring. Aldrig text. |
| `--koppar-ink` | `#A8491A` | `#F2A368` | `text-koppar-ink` | Koppar som text på papper och golv |
| `--koppar-djup` | `#C4621F` | samma | `bg-koppar-djup` | Knappens toning, mörka änden |
| `--koppar-ljus` | `#F4B98A` | samma | `text-koppar-ljus` | All kopparfärgad text på väggen |
| `--koppar-text` | `#1A1206` | samma | `text-koppar-text` | Text på kopparknappen |
| `--koppar-mjuk` | `#FBE3D0` | koppar 18 % | `bg-koppar-mjuk` | Illustrationernas mjuka yta |
| `--ink-1` / `--ink-2` / `--ink-3` | `#1A1A1F` / `#4A4A55` / `#65656E` | `#F3F2F7` / `#C7C6D0` / `#9391A1` | `text-ink-1` … | Rubrik, brödtext, metadata |
| `--ink-hover` | `#2E2E36` | `#E4E3EC` | `hover:bg-ink-hover` | Hover på bläck |
| `--papper` / `--papper-2` | `#FFFFFF` / `#F4F3F0` | per rum | `bg-papper`, `bg-papper-2` | Kort, fält |
| `--kant` / `--kant-stark` | `#E3E1DC` / `#C9C6BF` | per rum | `border-kant`, `border-kant-stark` | Hårlinje, upphöjd kant |
| `--positiv` / `--positiv-mjuk` | `#2F7D5B` / `#DCEFE5` | `#6CC79A` / `#1C3A2D` | `text-positiv` | Sparat, intervju |
| `--varning` / `--varning-mjuk` | `#985A08` / `#F7E8CF` | `#E3A85A` / `#3A2B14` | `text-varning` | Kvot. Se not nedan. |
| `--fel` / `--fel-mjuk` / `--fel-kant` / `--fel-morker` | `#B3382E` / `#F8E1DE` / `#F0C7C2` / `#7A2219` | `#E57F74` / `#3F1F1C` / `#5A2D29` / `#F3B3AB` | `text-fel` … | Feltext, felrad |
| `--lyft` | två skuggor, ljus | två skuggor, mörk | `shadow-lyft` | Det lyfta kortet |
| `--dimma` | `rgba(10,12,30,.55)` | samma | | Arkets bakgrund |

Not om varning: specen anger `#9A5B08`, som ger 4,49:1 mot varning-mjuk.
Bygget använder ett steg mörkare, `#985A08` (4,6:1), med samma kulör. Frågan
ligger hos art-director (`docs/qa/rummen/vag-1a/README.md`).

### Rummen

Väggen (`--vagg`, `--vagg-2`, `--vagg-3`, `--vagg-ink`, `--vagg-mjuk`,
`--vagg-svag`, `--vagg-kant`), golvet (`--golv`), tonen (`--ton`,
`--ton-ink`), ljuset (`--ljus`, siktet) och rummets färg (`--rum`).
Tailwind: `bg-vagg`, `text-vagg-ink`, `text-vagg-mjuk`, `border-vagg-kant`,
`bg-golv`, `bg-ton`, `text-ton-ink`, `text-ljus`, `bg-rum`.

| Rum | `data-rum` | vagg / vagg-2 / vagg-3 | vagg-ink / mjuk / svag | golv | ton / ton-ink | ljus |
|---|---|---|---|---|---|---|
| Träningen (indigo) | `tran` | `#1B2246` / `#2B3470` / `#121737` | `#F5F6FC` / `#AEB4DA` / `#6F78B0` | `#EBEDF6` | `#DFE3F6` / `#3B4790` | `#93A0EC` |
| CV (petrol) | `cv` | `#113538` / `#1D4D51` / `#0B2628` | `#F1F8F7` / `#A3C9C8` / `#5C918F` | `#E6EFEF` | `#D7ECEA` / `#1E5F5F` | `#7FCFCA` |
| Personliga brev (plommon) | `brev` | `#3A1930` / `#56284A` / `#280F22` | `#FBF3F8` / `#D6AFC8` / `#9C6A8C` | `#F2EAEE` | `#F0DCE8` / `#6E2B59` | `#E29DCB` |
| Jobbsöket (skog), standard | `jobb` | `#1B3324` / `#2A4C37` / `#112219` | `#F2F8F2` / `#A9C9B1` / `#6A9676` | `#E8EEE7` | `#DCEBDD` / `#245C37` | `#8FD3A0` |
| Konto (grafit) | `neutral` | `#26262C` / `#36363E` / `#1A1A1F` | `#F5F4F7` / `#B9B8C2` / `#7C7B88` | `#ECEBE9` | `#E2E1E6` / `#3C3C46` | `#C9C8D2` |

`--vagg-kant` är `rgba(255,255,255,.12)` i alla rum. `--rum` är samma som
`--ton-ink` i ljust läge.

### Alias under övergången

Omigrerade sidor bär Trådens klassnamn. I inloggat pekar de på Rummen och
tas bort i våg 4 när grep ger noll:

| Tråden | Rummen |
|---|---|
| `--mark` | `--golv` |
| `--panel` | `--papper` |
| `--insunken` / `--insunken-topp` | `--papper-2` / `--kant-stark` |
| `--accent` / `--accent-ink` / `--accent-mjuk` | `--koppar` / `--koppar-ink` / `--koppar-mjuk` |
| `--ink-1-mjuk` / `--ink-1-kant` / `--ink-1-accent` | `--vagg-mjuk` / `--vagg-kant` / `--koppar-ljus` |
| `--cv` / `--test` | petrol `#1E5F5F` / indigo `#3B4790` |

Aliasen deklareras både på roten och på `[data-rum]`: `var()` löses där
egenskapen står, så ett alias bara på `<html>` hade tagit rotens rum även
inne i ett annat.

### Adminens spårfärger

`--diagram-cv` är petrol `#1E5F5F` och `--diagram-test` indigo `#3B4790`
sedan våg 1a (beslut 2). Bara värdena bytte; reglerna i `AdminChart` står
kvar och `--diagram-allt` är fortfarande ink-1. Orange markerar i adminen
bara ett enskilt värde tills adminen får sin egen omgång.

### Kontrast

Räknad ur `globals.css` med WCAG 2.x-formeln av `scripts/kontrast-rummen.mjs`,
som också kontrollerar att tabellen här stämmer, att mörkt läge står
likadant i båda formerna och att inget textpar ligger under 4,5:1. Kör den
efter varje tokenändring; `--skriv` skriver om tabellerna nedan.

<!-- kontrast:start -->

### Ljust läge

| Par | Träningen | CV | Personliga brev | Jobbsöket | Konto | Krav | Roll |
|---|---:|---:|---:|---:|---:|---|---|
| `vagg-ink` på `vagg` | 14,3 | 12,3 | 14,2 | 12,6 | 13,7 | AA, minst 4,5 | Rubrik och brödtext på väggen |
| `vagg-mjuk` på `vagg` | 7,6 | 7,4 | 8,0 | 7,6 | 7,7 | AA, minst 4,5 | Dämpad text på väggen, ner till 11 px |
| `vagg-mjuk` på `vagg-2` | 5,7 | 5,3 | 6,0 | 5,3 | 6,1 | AA, minst 4,5 | Dämpad text på väggens ljusa del |
| `vagg-ink` på `vagg-2` | 10,7 | 8,7 | 10,7 | 8,9 | 10,9 | AA, minst 4,5 | Text på väggens ljusa del |
| `koppar-ljus` på `vagg` | 8,9 | 7,6 | 8,9 | 7,9 | 8,7 | AA, minst 4,5 | Kopparfärgad text på väggen |
| `koppar-ljus` på `vagg-2` | 6,6 | 5,4 | 6,8 | 5,6 | 6,9 | AA, minst 4,5 | Kopparfärgad text på väggens ljusa del |
| `ljus` på `vagg` | 6,2 | 7,3 | 7,3 | 7,8 | 9,1 | AA, minst 4,5 | Siktets etikett |
| `koppar` på `vagg` | 5,1 | 4,4 | 5,1 | 4,5 | 5,0 | grafik, minst 3 | Linje, punkt, knapp på väggen |
| `koppar` på `vagg-2` | 3,8 | 3,1 | 3,9 | 3,2 | 4,0 | aldrig text | Därför aldrig koppar som text på väggen |
| `vagg-svag` på `vagg` | 3,7 | 3,7 | 3,6 | 4,0 | 3,6 | aldrig text | Streck och ihåliga märken, aldrig text |
| `koppar-text` på `koppar` | 6,2 | 6,2 | 6,2 | 6,2 | 6,2 | AA, minst 4,5 | Primärknappen |
| `koppar-text` på `koppar-djup` | 4,5 | 4,5 | 4,5 | 4,5 | 4,5 | AA, minst 4,5 | Primärknappen, toningens mörka ände |
| `ink-1` på `golv` | 14,8 | 14,8 | 14,7 | 14,7 | 14,5 | AA, minst 4,5 | Text direkt på golvet |
| `ink-2` på `golv` | 7,5 | 7,5 | 7,4 | 7,4 | 7,3 | AA, minst 4,5 | Brödtext på golvet |
| `ink-3` på `golv` | 4,9 | 4,9 | 4,9 | 4,9 | 4,8 | AA, minst 4,5 | Metadata på golvet |
| `ink-1` på `papper` | 17,3 | 17,3 | 17,3 | 17,3 | 17,3 | AA, minst 4,5 | Text på kort |
| `ink-2` på `papper` | 8,7 | 8,7 | 8,7 | 8,7 | 8,7 | AA, minst 4,5 | Brödtext på kort |
| `ink-3` på `papper` | 5,8 | 5,8 | 5,8 | 5,8 | 5,8 | AA, minst 4,5 | Metadata på kort |
| `ink-3` på `papper-2` | 5,2 | 5,2 | 5,2 | 5,2 | 5,2 | AA, minst 4,5 | Metadata i fält |
| `ton-ink` på `ton` | 6,6 | 6,0 | 7,5 | 6,4 | 8,4 | AA, minst 4,5 | Aktiv dörr, chip, regelpanel |
| `ton-ink` på `papper` | 8,4 | 7,3 | 9,8 | 7,9 | 10,9 | AA, minst 4,5 | Rummets ton som text på kort |
| `koppar-ink` på `papper` | 5,8 | 5,8 | 5,8 | 5,8 | 5,8 | AA, minst 4,5 | Koppar som text på kort |
| `koppar-ink` på `golv` | 4,9 | 4,9 | 4,9 | 4,9 | 4,9 | AA, minst 4,5 | Koppar som text på golvet |
| `positiv` på `papper` | 5,0 | 5,0 | 5,0 | 5,0 | 5,0 | AA, minst 4,5 | Sparat |
| `varning` på `varning-mjuk` | 4,6 | 4,6 | 4,6 | 4,6 | 4,6 | AA, minst 4,5 | Varningsrad |
| `fel` på `papper` | 6,0 | 6,0 | 6,0 | 6,0 | 6,0 | AA, minst 4,5 | Feltext |
| `fel` på `fel-mjuk` | 4,8 | 4,8 | 4,8 | 4,8 | 4,8 | AA, minst 4,5 | Felrad |
| `koppar` på `papper` | 3,0 | 3,0 | 3,0 | 3,0 | 3,0 | grafik, minst 3 | Kopparlinje på kort och i sidomenyn |
| `koppar` på `golv` | 2,6 | 2,6 | 2,5 | 2,5 | 2,5 | aldrig text | Ren koppar mot golvet: därför är fokusringen koppar-ink (13.2) |
| `fokus` på `golv` | 4,9 | 4,9 | 4,9 | 4,9 | 4,9 | grafik, minst 3 | Fokusringen på golvet |
| `fokus` på `papper` | 5,8 | 5,8 | 5,8 | 5,8 | 5,8 | grafik, minst 3 | Fokusringen på kort |
| `fokus` på `ton` | 4,5 | 4,7 | 4,4 | 4,7 | 4,4 | grafik, minst 3 | Fokusringen på ton (aktiv rad, chip) |
| `koppar-ljus` på `vagg` | 8,9 | 7,6 | 8,9 | 7,9 | 8,7 | grafik, minst 3 | Fokusringen på väggen |
| `koppar-ljus` på `vagg-2` | 6,6 | 5,4 | 6,8 | 5,6 | 6,9 | grafik, minst 3 | Fokusringen på väggens ljusa del |
| `papper` på `golv` | 1,2 | 1,2 | 1,2 | 1,2 | 1,2 | tonsteg | Tonsteg papper mot golv |
| `vit` på `rum` | 8,4 | 7,3 | 9,8 | 7,9 | 10,9 | grafik, minst 3 | Aktiv dörr i sidomenyn (ikon) |

### Mörkt läge

Väggen byter aldrig, så väggparen är desamma som i ljust läge.

| Par | Träningen | CV | Personliga brev | Jobbsöket | Konto | Krav | Roll |
|---|---:|---:|---:|---:|---:|---|---|
| `vagg-ink` på `vagg` | 14,3 | 12,3 | 14,2 | 12,6 | 13,7 | AA, minst 4,5 | Rubrik och brödtext på väggen |
| `vagg-mjuk` på `vagg` | 7,6 | 7,4 | 8,0 | 7,6 | 7,7 | AA, minst 4,5 | Dämpad text på väggen, ner till 11 px |
| `vagg-mjuk` på `vagg-2` | 5,7 | 5,3 | 6,0 | 5,3 | 6,1 | AA, minst 4,5 | Dämpad text på väggens ljusa del |
| `vagg-ink` på `vagg-2` | 10,7 | 8,7 | 10,7 | 8,9 | 10,9 | AA, minst 4,5 | Text på väggens ljusa del |
| `koppar-ljus` på `vagg` | 8,9 | 7,6 | 8,9 | 7,9 | 8,7 | AA, minst 4,5 | Kopparfärgad text på väggen |
| `koppar-ljus` på `vagg-2` | 6,6 | 5,4 | 6,8 | 5,6 | 6,9 | AA, minst 4,5 | Kopparfärgad text på väggens ljusa del |
| `ljus` på `vagg` | 6,2 | 7,3 | 7,3 | 7,8 | 9,1 | AA, minst 4,5 | Siktets etikett |
| `koppar` på `vagg` | 5,1 | 4,4 | 5,1 | 4,5 | 5,0 | grafik, minst 3 | Linje, punkt, knapp på väggen |
| `koppar` på `vagg-2` | 3,8 | 3,1 | 3,9 | 3,2 | 4,0 | aldrig text | Därför aldrig koppar som text på väggen |
| `vagg-svag` på `vagg` | 3,7 | 3,7 | 3,6 | 4,0 | 3,6 | aldrig text | Streck och ihåliga märken, aldrig text |
| `koppar-text` på `koppar` | 6,2 | 6,2 | 6,2 | 6,2 | 6,2 | AA, minst 4,5 | Primärknappen |
| `koppar-text` på `koppar-djup` | 4,5 | 4,5 | 4,5 | 4,5 | 4,5 | AA, minst 4,5 | Primärknappen, toningens mörka ände |
| `ink-1` på `golv` | 16,8 | 16,6 | 17,3 | 16,8 | 16,7 | AA, minst 4,5 | Text direkt på golvet |
| `ink-2` på `golv` | 11,1 | 11,0 | 11,4 | 11,1 | 11,0 | AA, minst 4,5 | Brödtext på golvet |
| `ink-3` på `golv` | 6,1 | 6,0 | 6,2 | 6,1 | 6,0 | AA, minst 4,5 | Metadata på golvet |
| `ink-1` på `papper` | 15,3 | 15,0 | 15,9 | 15,4 | 15,2 | AA, minst 4,5 | Text på kort |
| `ink-2` på `papper` | 10,1 | 9,9 | 10,5 | 10,1 | 10,0 | AA, minst 4,5 | Brödtext på kort |
| `ink-3` på `papper` | 5,5 | 5,4 | 5,7 | 5,5 | 5,5 | AA, minst 4,5 | Metadata på kort |
| `ink-3` på `papper-2` | 5,1 | 5,0 | 5,4 | 5,1 | 5,1 | AA, minst 4,5 | Metadata i fält |
| `ton-ink` på `ton` | 7,8 | 8,0 | 8,5 | 8,4 | 8,6 | AA, minst 4,5 | Aktiv dörr, chip, regelpanel |
| `ton-ink` på `papper` | 9,8 | 10,9 | 10,3 | 11,5 | 10,2 | AA, minst 4,5 | Rummets ton som text på kort |
| `koppar-ink` på `papper` | 8,3 | 8,1 | 8,6 | 8,3 | 8,3 | AA, minst 4,5 | Koppar som text på kort |
| `koppar-ink` på `golv` | 9,1 | 9,0 | 9,4 | 9,1 | 9,0 | AA, minst 4,5 | Koppar som text på golvet |
| `positiv` på `papper` | 8,3 | 8,2 | 8,7 | 8,4 | 8,3 | AA, minst 4,5 | Sparat |
| `varning` på `varning-mjuk` | 6,5 | 6,5 | 6,5 | 6,5 | 6,5 | AA, minst 4,5 | Varningsrad |
| `fel` på `papper` | 6,2 | 6,1 | 6,4 | 6,2 | 6,2 | AA, minst 4,5 | Feltext |
| `fel` på `fel-mjuk` | 5,4 | 5,4 | 5,4 | 5,4 | 5,4 | AA, minst 4,5 | Felrad |
| `koppar` på `papper` | 5,7 | 5,6 | 5,9 | 5,7 | 5,7 | grafik, minst 3 | Kopparlinje på kort och i sidomenyn |
| `koppar` på `golv` | 6,2 | 6,2 | 6,4 | 6,2 | 6,2 | aldrig text | Ren koppar mot golvet: därför är fokusringen koppar-ink (13.2) |
| `fokus` på `golv` | 9,1 | 9,0 | 9,4 | 9,1 | 9,0 | grafik, minst 3 | Fokusringen på golvet |
| `fokus` på `papper` | 8,3 | 8,1 | 8,6 | 8,3 | 8,3 | grafik, minst 3 | Fokusringen på kort |
| `fokus` på `ton` | 6,6 | 6,0 | 7,0 | 6,1 | 6,9 | grafik, minst 3 | Fokusringen på ton (aktiv rad, chip) |
| `koppar-ljus` på `vagg` | 8,9 | 7,6 | 8,9 | 7,9 | 8,7 | grafik, minst 3 | Fokusringen på väggen |
| `koppar-ljus` på `vagg-2` | 6,6 | 5,4 | 6,8 | 5,6 | 6,9 | grafik, minst 3 | Fokusringen på väggens ljusa del |
| `papper` på `golv` | 1,1 | 1,1 | 1,1 | 1,1 | 1,1 | tonsteg | Tonsteg papper mot golv |

### Adminens spårfärger (Tråden, panel `#FFFFFF`)

| Serie | Värde | Mot panel | Krav |
|---|---|---:|---|
| `--diagram-cv` (CV-paketet) | `#1E5F5F` | 7,3 | grafik, minst 3 |
| `--diagram-test` (Träningspaketet) | `#3B4790` | 8,4 | grafik, minst 3 |
| `--ink-1` (Hela paketet) | `#1C1917` | 17,5 | grafik, minst 3 |

Avstånd i CIELAB (ΔE76): petrol mot indigo 52,6, petrol mot ink-1 35,5, indigo mot ink-1 52,9. Med deuteranopi (Machado 2009): petrol mot indigo 36,1. Varje serie har direktetikett vid slutpunkten, så färgen är aldrig ensam bärare.

<!-- kontrast:slut -->

## 3. Typskala

Två familjer. Schibsted Grotesk (`font-display`) bär rubriker och tal. Inter
bär etiketter, brödtext, knappar och menyn. Display-klasserna ligger i
`globals.css` under `@layer utilities` (de byter storlek vid `lg` och sätter
familjen), övriga i `tailwind.config.js` under `fontSize`.

| Klass | Mobil | Dator (lg) | Vikt | Användning |
|---|---|---|---|---|
| `.text-h1` | 34/36 i rummen (32/35 utanför) | 44/46 | 800, -0.025em | Rubriken på väggen, en per vy |
| `.text-h1-liten` | 28/31 | 32/35 | 800 | Rubrik i resultat, kvitto, CV-rummet |
| `.text-tal-stor` | 64/64 | 72/72 | 800, -0.035em, tabulära siffror | Provdagens datum, mätningens nivå |
| `.text-tal-rad` | 22/24 | 22/24 | 700, tabulära | Dagsradens tre tal |
| `.text-tal-tre` | 28/30 | 28/30 | 700, tabulära | Resultatets tre tal |
| `.text-kort-t` | 22/27 | 22/27 | 700, -0.02em | Det lyfta kortets titel |
| `.text-ey` | 12/16 | 12/16 | 600, .08em, versaler | Eyebrow (Inter) |
| `.text-meta` | 13/18 | 13/18 | 400 | Metadata (Inter) |
| `.text-ax` | 11/16 | 11/16 | 500 | Bara i SVG-axlar och `.axel` (Inter) |

Brödtext 14/21 på kort, 15/22 på vägg. Vikterna 700 och 800 finns bara
tillsammans med `font-display`. Minsta text är 12 px; 11 px bara i SVG-axlar
med `aria-label` som läser ut talen. Trådens `text-fraga`, `text-tal`,
`text-kort`, `text-steg`, `text-varde` och `text-tal-display` finns kvar för
omigrerade sidor.

## 4. Djup: vägg, papper, ton

```
Vägg     rummets toning vagg-2 → vagg → vagg-3, ljuskant uppe till höger   mörk, högst upp
 └ Golv  golv, rummets ljusa ton                                            nivå 0
    ├ Kort       papper, border-kant, rounded-2xl                          nivå 1
    ├ LyftKort   papper, shadow-lyft, överlappar väggen 30 px              nivå 2
    ├ Fält       papper-2                                                  nivå 1 minus
    └ Ton        ton med ton-ink (aktiv dörr, chip, regelpanel)            markering
```

Väggen: `.vagg` i `globals.css`, radie 0 0 28 28, padding 16 (mobil) och 40
(dator) i sidled, 44 under (24 med `tat`). Golvet: 16 px mobil, 40 px dator,
max-bredd 1120 px. Radier: `rounded-lg` 8 för kontroller, `rounded-xl` 12 för
knappar, `rounded-2xl` 16 för kort, `rounded-vagg` 28 för väggen,
`rounded-ark` 24 för arkets överkant. Skuggor: bara `shadow-lyft` (det lyfta
kortet) och skuggan på svävande ark. Toningar finns bara i `globals.css`
under `.vagg`, `.knapp-primar`, `.kurva-yta` och i märkenas `<defs>`.

## 5. Koppar

En linje genom alla rum. Den betyder **här är du** och **det här rör sig**.

| Var | Hur |
|---|---|
| Primärknappen | `.knapp-primar` (toning `#E8863B` → koppar → koppar-djup), text koppar-text, 48 px, radie 12, exakt en per vy |
| Kurvan och nivåskalan | linje 2,25 px, punkter med `stroke: vagg`, yta `#g-yta` 0,38 → 0 |
| Aktiv undersida i sidomenyn | `shadow-[inset_3px_0_0_var(--koppar)]` |
| Märken | exakt en kopparyta per symbol |
| Fokusring | `outline: 2px solid var(--fokus); outline-offset: 2px` på `:focus-visible`; `--fokus` är koppar-ink på golv, papper och ton och koppar-ljus på väggen (13.2) |
| Text | koppar-ljus på väggen, koppar-ink på papper och golv, aldrig ren koppar |

Val markeras med `border-ink-1` och en bock, inte med koppar.

## 6. Komponenter

Nya komponenter i `src/components/rum/` om inget annat sägs. Server
components där inga hooks behövs (vägg, golv, kurva, skala, rader), klient
bara för interaktion. Status per komponent: vilken våg den byggs i.

**Rummet** (`src/lib/rum/rum.ts`, våg 1b): `type Rum = 'tran'|'cv'|'brev'|'jobb'|'neutral'`,
`rumForPath(pathname)`, `RUM_NAMN`, `DORRAR`. `DashboardShell` sätter
`data-rum` ur props (server) och följer `usePathname` (klient).

**`Vagg`** (server, våg 1b) `{ children, className?, tat? }`. **`Golv`**
(server): `px-4 pb-[calc(var(--bottom-nav-h)+24px)] lg:px-10 lg:pb-10 flex flex-col gap-4 flex-1`.
**`Topprad`** (klient) `{ brand, kontext?, stang? }`: 60 px (72 dator),
brand i display 15/700, avatar 34 px, notiser och meddelanden bara när de har
något, alla knappar 44 px, `data-topprad`. **`Rubrik`** (server)
`{ titel, rad?, liten?, as? }`. **`RumHuvud`** (server) `{ title, description?,
eyebrow?, handling?, tat? }`: h1 är undersidans namn (`RUBRIK` i
`src/lib/rum/copy.ts`), eyebrow bara för data (datumraden), `handling` bara
`LANK_VAGG` eller `KNAPP_GLAS`.

**Regeln: väggen säger var du är, det lyfta kortet vad du gör.** Väggen bär
aldrig primärknappen. Vyns primära handling står i ett `LyftKort` först på
golvet (`Golv lyft`, `RumHuvud tat={false}`), som överlappar väggen 30 px.
Ordningen på golvet är alltid lyft kort, sedan statusrad eller flikar, sedan
listor. `scripts/grep-rummen.mjs --vag 1b --noll` stoppar `KNAPP_PRIMAR` på
väggen.

| Står på väggen | Står på golvet |
|---|---|
| Topprad (rummets namn, konto, notiser) | Lyft kort (vyns enda kopparknapp) |
| Rubrik (undersidans namn) och en rad status | Kort |
| Instrument (dagsrad, nivåskala, kurva) | Rader |
| Glasknapp i automatisk bredd eller vägglänk | Statusrad, flikar, sök och filter |

**`Dorrnav`** (klient, våg 1b, ersätter `MobileBottomNav`): `nav aria-label="Huvudmeny"`,
fyra dörrar Tester, CV, Personliga brev, Jobbsöket (`DORR_ETIKETT.mobil`;
på dator heter testdörren Rekryteringstester, `DORR_ETIKETT.dator`), 72 px plus safe
area, aktiv dörr `bg-ton text-ton-ink`, etikett aktiv `text-ink-1` 600,
`aria-current="page"`. **`Sidomeny`** (klient, våg 1b, ersätter `Sidebar`):
248 px, fyra rumsrader 48 px, aktiv dörr `bg-rum text-white`, grupprubrik
med rummets namn och undersidor 40 px med kopparlinje på aktiv, kontot
längst ner på två rader (namn 13/500, paket 12).
Inga realtidskanaler i kritisk väg.

**Knappar** (`src/components/shell/knappar.ts`, våg 1b, ersätter
`INK_KNAPP`/`INK_LANK`): `KNAPP_PRIMAR` (koppar, 48 px, radie 12),
`KNAPP_SEKUNDAR` (papper med `border-kant-stark`; `KNAPP_SEKUNDAR_LAG`, 40 px
och 14 px text, när två eller fler sekundära står i rad), `KNAPP_GLAS` (på
väggen, `bg-white/[.08]` med `border-vagg-kant`, alltid automatisk bredd),
`LANK`, `LANK_VAGG`, `KNAPPRAD`. Exakt ett `KNAPP_PRIMAR` per vy, aldrig på
väggen; det sekundära i en betalvägg är alltid `LANK`.

**`LyftKort`** (server) `{ eyebrow?, eyebrowTon?, titel?, text?, handling?, sekundar?, fot?, children?, label }`:
papper, `shadow-lyft`, överlappar väggen 30 px, i mörkt läge `border-kant`.
Tar rollen som vyns viktigaste handling från `InkPanel`.
**`Kort`**, **`Rader`** (rader 56 px, `border-t border-kant` mellan),
**`SektRubrik`** (13/600 `text-ink-3`), **`Chip`** (28 px, radie 8; ton och
lås), **`Dagsrad`**, **`Dagsring`** (SVG 56), **`Veckorad`**, **`Formord`**.

**Instrument** (server-renderade SVG, våg 2 och 3b): `Kurva` (viewBox
380×150 mobil, 840×170 dator, två viewBoxar så text aldrig skalas),
`Nivaskala` (380×56 / 840×56), `Poangring` (CV-rummet, 112 px), `Spar`
(Jobbsöket), `Staplar` (tempo), `Plan`, `Marke`. Exakta mått och regler i
spec avsnitt 4.4.

**Flödet**: `FlowShell` restylas i våg 1b (golv, kopparknapp `h-12`,
progress 3 px), `PassShell` (våg 3b) lägger till tidsraden som aldrig räknar
ner och aldrig byter färg. `PassFraga`, `Regelpanel` (`bg-ton`,
`role="status"`), `Resultatvy`, `Kvitto`, `Ingang`.

**Befintliga som behålls**: `StatusRow` (restylad i 1b: papper, punkt
`bg-ink-3`, `warm` ger koppar; på väggen `bg-white/5`), `Fordelning`
(Jobbsöket, segmentton `accent` blir koppar), `LoadingSkeleton` (får
varianten `vagg`), `Sheet` (radie 24 upptill, papper, `--dimma`),
`GraValSheet`/`PaywallCard` (utseende i 1b, innehåll i våg 5). `PageHeader`
och `InkPanel` står kvar för publika sidor.

## 7. Illustrationer, ikoner och symboler

Primitiverna i `src/components/illustrations/primitives.tsx`: konturer i
`currentColor`, fyllning via `--illu-fill` (papper), accent via
`--illu-accent` (koppar), unika id via `useIlluId()`, `aria-hidden`, inga
animationer i SVG, aldrig hårdkodat vitt.

| viewBox | Stroke | Radie | Var |
|---|---|---|---|
| 24 | 1,75 | 2 | Ikoner, dörrar |
| 48 | 2 | 4 | Testtypernas symboler |
| 96 | 3 | 8 | Tomt tillstånd (`SymPlan`) |
| 120 | 3 | 10 | Märkena (Rummen) |
| 240 | 6 | 20 | Publika scener |

Symbolbiblioteket `src/components/illustrations/RumSymboler.tsx` (våg 1b),
koordinaterna ordagrant ur konceptets `<defs>`, exakt en kopparyta per
symbol, aldrig en bakgrundscirkel:

| Export | Storlek | Används |
|---|---|---|
| `SymMatris`, `SymSiffror`, `SymOrd`, `SymPerson`, `SymVetInte` | 48 | Ingången, Fler tester, passets topp, kurvans små multiplar |
| `DorrTran`, `DorrCv`, `DorrBrev`, `DorrJobb`, `DorrProfil` | 24 | Dörrnav, sidomeny |
| `IkonX`, `IkonChev`, `IkonPil`, `IkonLas`, `IkonKalender`, `IkonCheck`, `IkonInfo`, `IkonTillbaka`, `IkonPenna` | 24 | Ersätter lucide i skalet |
| `MarkeMatning`, `MarkeVecka`, `MarkeNiva`, `MarkeGeneral`, `MarkeProv` | 120 | Kvitto 132, ommätning 48, legend 24 |
| `SymPlan` | 96 | Tomt tillstånd |
| `Gradienter` | defs | `#g-koppar-h`, `#g-yta`, `#g-lyster` för `Kurva` och `Nivaskala` |

`Ikoner.tsx` behålls för rader. Instrumenten är bilden i rummen; scenerna
(`PriserScener`, `TradenScener`) används inte i inloggat efter våg 4.
Aldrig Sparkles, aldrig emoji.

## 8. Rörelse

CSS, inte framer-motion. Allt under `prefers-reduced-motion: reduce` visar
sluttillståndet direkt.

| Vad | Tid | Kurva | Klass |
|---|---|---|---|
| Byte av rum, väggens och golvets färg | 240 ms | ease | `[data-rum]` |
| Kurvans linje ritas | 700 ms från 200 | ease-out | `.motion .kurva .linje` (`rita`) |
| Ytan under kurvan tonar in | 500 ms från 500 | ease-out | `.motion .kurva .yta` (`tona`) |
| Ny punkt tänds | 240 ms från 900 | ease-out | `.motion .kurva .punkt.ny` (`tand`) |
| Dagsringen fylls | 500 ms från 300 | ease-out | `.motion .ring .fyll` (`fyll`) |
| Resultatets fyra steg | 260 ms vardera, start 120 / 420 / 720 / 1020 | ease-out | `.motion .steg.s1` … `.s4` (`upp`) |
| Märket i kvittot | 600 ms från 200 | `cubic-bezier(.2,.7,.2,1)` | `.motion .marke` (`marke`) |
| Laddning | 1200 ms loop | ease-in-out | `.loading-thread` |
| Lång väntan, tre rader | 1800 ms loop | ease-out | `.writing-lines` |
| Bekräftelse | panel 240, linje 200, bock 480, rubrik 200 | ease-out | `.confirm-*` |
| Ark | 240 ms upp från botten | ease-out | `sheetUp` |

`.motion` sätts bara när `nyPunkt` är sant (serverberäknat: senaste
nivåpunkt nyare än `profiles.traning_sedd_at`). Inget sidledsglid vid byte av
rum, ingen skalning på kort, ingen konfetti.

## 9. Tillgänglighet

- Kontrast AA enligt tabellen i avsnitt 2: inget textpar under 4,5:1.
- Träffytor 44 px, 48 px i navigation.
- Minsta text 12 px; 11 px bara i SVG-axlar med `aria-label` som läser ut talen.
- Fokusring 2 px med 2 px offset, aldrig borttagen: koppar-ink på golv, papper och ton, koppar-ljus på väggen (`--fokus`, raderna i avsnitt 2).
- `prefers-reduced-motion` ger sluttillstånd direkt.
- Exakt ett `h1` per vy, på väggen.
- Laddning `role="status" aria-busy aria-live="polite"`, framsteg
  `role="progressbar"`, fel `role="alert"`, regelpanelen `role="status"`.
- Aktiv dörr och aktiv rad `aria-current="page"`.
- Ingen färg är ensam informationsbärare: en punkt följs alltid av text, och
  adminens serier har direktetikett.

### Mobil, safe areas och z-index

375 px först. `--bottom-nav-h` är en sanning; i våg 1b blir den
`calc(72px + env(safe-area-inset-bottom))` med dörrnavet, till dess 56 px.
Skalet är `h-dvh` med låst body och bara `main` rullar. Lager: innehåll 0,
sticky 30, navigation 40, ark 50, modal 60, toast 70.

## 10. Grep-listan

Ger noll träffar i `src/app/dashboard` och `src/components` (utanför
`src/components/ui` och mallförhandsvisningarna) när Rummen är byggt. Våg 1a
tar inte bort något; träffarna listas per våg i QA-rapporten.

```bash
# Förbjudna mönster (font-display-raden undantas för vikterna)
grep -rnE "—|Sparkles|bg-gradient|linear-gradient|animate-pulse|shadow-(sm|md|lg|xl)\b|text-gray-|bg-white\b|rounded-3xl|font-(bold|extrabold|black)|(^|[\" '\`])dark:" \
  src/app/dashboard src/components --include=*.tsx \
  | grep -v "^src/components/ui/" | grep -v "font-display"

# Lucide i nav och rum (tillåts i FlowShell/PassShell för X och ChevronLeft till våg 1b)
grep -rln "lucide-react" src/components/dashboard src/components/shell src/components/rum src/app/dashboard/DashboardShell.tsx
```

Plus: inga engelska gränssnittsord, och `dark:`-klasser används inte alls
(mörkt läge sker via variabler). Undantag som skrivs upp: `bg-white` i CV-
och brevmallarnas förhandsvisning (dokumentet är papper).

## 11. Mörkt läge

**Byggt (våg 1a).** Samma roller, mörka golv och papper per rum, väggen
byter aldrig. Två former med samma innehåll, båda i `globals.css`:

```css
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]):has([data-rum]) { … } }
:root[data-theme="dark"]:has([data-rum]) { … }
```

Varje rums mörka värden står inuti båda formerna som
`:root[data-theme="dark"] [data-rum="tran"]`, annars vinner det ljusa rummet
på specificitet. Kontrastskriptet kontrollerar att formerna är identiska.

Valet: `localStorage.tema` är `'ljust'`, `'morkt'` eller `'system'`. Ett
inline-skript i `<head>` (`src/app/layout.tsx`) sätter `data-theme` före
första målningen, så ingen vy blinkar. Väljaren "Utseende: Följer systemet,
Ljust, Mörkt" byggs i profilen i våg 1b. Tailwind har inget `darkMode`, och
`dark:`-klasser används inte.

| Rum | golv | papper / papper-2 | kant / kant-stark | ton / ton-ink |
|---|---|---|---|---|
| Träningen | `#0E1120` | `#171B2E` / `#1D2238` | `#293050` / `#3B4470` | `#232B55` / `#B9C2F2` |
| CV | `#0B1516` | `#13201F` / `#182827` | `#223634` / `#2F4A48` | `#163A3A` / `#A9DAD6` |
| Personliga brev | `#160B13` | `#22141E` / `#2A1925` | `#3A2434` / `#50334A` | `#3E1F35` / `#E8B8D8` |
| Jobbsöket | `#0B140E` | `#141E17` / `#19261D` | `#223A2A` / `#2F4E3A` | `#1C3A27` / `#B4DEBF` |
| Konto | `#121318` | `#1B1C23` / `#22232B` | `#33343F` / `#454654` | `#2A2A33` / `#C9C8D2` |

Systemfältet (`themeColor` i `src/app/dashboard/layout.tsx`) är indigoväggens
`#1B2246` i ljust läge och `#0E1120` i mörkt.

**Övergången (våg 1a till 4).** Trådens bläckytor med vit text
(`bg-ink-1 text-white`: `InkPanel`, primärknapparna, pakethuvudet) hade
blivit ljusa med vit text när ink-1 vänds. I mörkt läge får de därför
väggens färg (`--vagg`, hover `--vagg-2`), vilket är den roll aliasen
`ink-1-mjuk`, `ink-1-kant` och `ink-1-accent` redan pekar på. Regeln står
i `globals.css` i båda formerna och tas bort när knapparna blivit
`KNAPP_PRIMAR` och `InkPanel` blivit `LyftKort`. Hårdkodade `text-gray-*`
och `bg-white` (grep-listan) är fortfarande fel i mörkt läge tills sidan
migrerats; se QA-rapporten för våg 1a.

## 12. Publika sidor: Tråden tills vidare

Publika sidor, auth, kassan, mejlen och adminen följer Tråden v2.1 tills
saas-lead och ägaren tar deras omgång, med SEO-diff som grind. Koppar,
vägg och kopparknapp gäller **inte** där. Trådens värden står i `:root` i
`globals.css` och gäller allt utan `data-rum`.

### Principer

Papper på ett bord och en orange linje som visar var du är. Hierarki av
toner, kanter och typografi, aldrig av skuggor eller gradienter. Orange är
linje eller bläck, aldrig en yta, och handlingen är svart. En vy har en
primär handling, en illustration och högst tre orange inslag.

### Toner

| Variabel | Värde | Tailwind | Roll |
|---|---|---|---|
| `--mark` | `#EDE8DF` | `bg-mark` | Sidbakgrund |
| `--panel` | `#FFFFFF` | `bg-panel` | Kort, sektioner, nav |
| `--insunken` / `--insunken-topp` | `#ECE6DC` / `#D6CDBF` | `bg-insunken`, `shadow-insunken` | Fält, skelett |
| `--kant` / `--kant-stark` | `#DBD2C4` / `#C4B9A8` | `border-kant` | Hårlinje, upphöjd panel |
| `--ink-1` / `--ink-2` / `--ink-3` | `#1C1917` / `#57534E` / `#6B645E` | `text-ink-1` … | Rubrik, brödtext, metadata |
| `--ink-hover` | `#2C2724` | `hover:bg-ink-hover` | Primärknappens hover |
| `--accent` / `--accent-ink` / `--accent-mjuk` | `#D9480F` / `#9A3412` / `#FBE7D3` | `bg-accent`, `text-accent-ink` | Tråden, orange som text, plattan |
| `--positiv` / `--varning` / `--fel` | `#047857` / `#A14A05` / `#B91C1C` | `text-positiv` … | Status |
| `--ink-1-mjuk` / `--ink-1-kant` / `--ink-1-accent` | `#CFC8BD` / `#3A3531` / `#FBB98A` | | Tonerna på bläckytan (InkPanel, Allt-kortet) |
| `--cv` / `--cv-mjuk` | `#1D4ED8` / `#DCE6FB` | `text-cv`, `bg-cv-mjuk` | Spåretikett CV, 6,3:1 |
| `--test` / `--test-mjuk` | `#7C2D12` / `#F6E4D6` | `text-test`, `bg-test-mjuk` | Spåretikett tester, 8,6:1 |

Kontrast (v2.1): panel mot mark 1,22, ink-3 på mark 5,0, accent-ink på mark
6,4, accent på panel 4,6, varning på varning-mjuk 5,1, fel på fel-mjuk 5,3.

### Typografi, knappar och komponenter

Sidrubrik `text-h1-pub` (display 32/35 mobil, 60/60 dator), sektionsrubrik
`text-h2-pub` (28/32, 40/44), värdemening `text-varde` (18/24/600), stort tal
`text-tal-display`. Inloggade rubriker utanför rummen (adminen) har kvar
`text-h1` 32/35. Primärknapp `bg-ink-1 text-white hover:bg-ink-hover` 44 px,
sekundär `border-kant-stark bg-panel`, länk understruken i `decoration-kant-stark`.
`PageHeader`, `InkPanel` (exakt en bläckyta per vy), `Fordelning`,
`StatusRow`, `ChoiceCard`, `Segment`, `MarginPlate`, `EmptyState`,
`Confirmation`, `Sheet`, `PaywallCard` som i v2.1. Fokusringen är tråden:
`outline: 2px solid var(--accent)`.

### Rytm och sektionsföljd

Två sektioner i följd får inte ha samma form. Hero på mark med scen, en panel
med produktbild, en bläckyta, högst tre kort, en lista, FAQ på mark. Inga
glödar, prickmönster, vågor eller bakgrundscirklar. Header med fem val i
Inter 15/500 och "Skapa konto" som bläckknapp; megamenyn i tre grupper
(Skriv och förbättra, Hitta jobb, Träna); footern på mark med fyra kolumner.
Logotypens `#F97316` är det enda undantaget från tokens och byts inte.

### Prissidan och köpvägen

`docs/design/spec-prissida-2026-09-22.html`: rubriker i Schibsted Grotesk,
det rekommenderade paketet som enda fyllda ink-kort med vit text, och
färgetiketterna `cv` och `test` bara där paketen nämns (mörk text på mjuk
yta, aldrig som knapp). Byte till koppar och nytt paketinnehåll på `/priser`
är våg 5 och saas-leads omgång.

### Adminens diagram

`docs/design/spec-admin-tydlighet-2026-09-22.html`: axlar alltid med enhet,
senaste värdet utskrivet vid slutpunkten, färre än sju punkter blir en
mening, dagar före mätstart som grå zon i `--insunken` märkt "mäts från …".
Spårfärgerna: se avsnitt 2.

### Förbjudna mönster, publikt

`bg-gradient`, `shadow-sm/md/lg/xl`, `rounded-2xl/3xl`, `font-bold` utan
`font-display`, `text-gray-*`, `bg-white` som sidbakgrund, `animate-pulse`,
`framer-motion`, Sparkles och em-dash. Grep-kommandot för de omritade
publika ytorna:

```bash
grep -rnE "bg-orange-|bg-amber-|from-orange|to-orange|bg-gradient|linear-gradient|shadow-(sm|md|lg|xl|2xl)|drop-shadow|rounded-(2xl|3xl)|font-(bold|extrabold|black)|framer-motion|Sparkles|text-orange-[0-9]|border-orange|ring-orange|bg-white\b|bg-gray-|text-gray-|border-gray-|text-slate|bg-slate|border-slate|animate-pulse|animate-spin|—" src/components/landing src/components/Footer.tsx src/components/artiklar src/components/verktyg "src/app/(public)/page.tsx" "src/app/(public)/artiklar" "src/app/(public)/verktyg" "src/app/(public)/funktioner" "src/app/(public)/om-oss" --include=*.tsx | grep -v "font-display"
```

## 13. Copy

Svenska, vi-form, svenska facktermer. Inga em-dash, inga AI-klichéer, aktiv
form. Alla användartexter i rummen bor i `src/lib/traning/copy.ts`,
`src/lib/rum/copy.ts` och befintliga `*-copy.ts`, aldrig i JSX. Paketnamn och
priser ur `PLANS`, pris efter namnet, verbet Köp. "Samma format som", aldrig
"samma test". Knappen säger exakt vad som händer. Bekräftelsen säger vad som
skapades och var det finns. Felet säger vad som gick fel och hur man går
vidare. En rad har subjekt, verb och nästa steg.

## 14. Ändringslogg

**v3, Rummen, 2026-10-11 (våg 3b, passet).** Passflödet och resultatskärmarna i `src/components/traning/`: `PassShell` (helskärm, tidsraden som fylls mot provets tid per uppgift och aldrig räknar ner eller byter färg), `PassFraga` (matrisen och sex alternativ; valt i bläck, rätt i koppar, övriga 0,38, aldrig rött), `Regelpanel` (regeln ur bankens `rule`, misstaget ur `misstag`, rullas in i bild efter svaret), `ResultatSkal` (väggen med passets egen topprad, kopparknappen i foten), P4/S1, M1, O1, `Kvitto` (K1), `GenomgangVy`, uppvärmningen, `Nivaskala` (två viewBoxar, texten i HTML så den aldrig skalas), `Staplar`, `Plan`, `Marke`. `.matrisyta` i `globals.css` byter V7-renderarnas fasta svart och vitt mot bläck och papper, så figurerna syns i mörkt läge. `Dagsring` heter `.dagsring` (Tailwinds `ring` gav en blå skugga). M1 för gratis: betalväggens knapp står i foten så att den är inom viewport (fråga till art-director).

**v3, Rummen, 2026-10-11 (1b, granskning).** Lyftet tillbaka i alla vyer: väggen bär aldrig primärknappen, `RumHuvud handling` i stället för `action`, `LyftKort` först på golvet, h1 är undersidans namn, kategori-eyebrows borta, Kom igång-raden på papper med kopparring, kontoraden på två rader, `KNAPP_GLAS` i automatisk bredd, `KNAPP_SEKUNDAR_LAG`, `Dagsring` utan uppvärmning. Testrummets dörr heter Tester på mobil och Rekryteringstester på dator.

**v3, Rummen, 2026-10-10 (våg 1b).** Skalet byggt: `data-rum` per route (`rumForPath`), vägg, golv och topprad, dörrnavet med fyra rum, sidomenyn med undersidor per rum, profilen i toppraden och Skapa borttagen. `KNAPP_PRIMAR` i koppar, `LyftKort`, `Kort`, `Rader`, `Chip`, `Dagsrad`, `Dagsring`, `Veckorad`, `RumSymboler`. FlowShell, ark och betalväggar i rummens material. Utseende-väljaren på profilen, `theme-color` i väggens kulör, `--fokus` med egna kontrastrader, `.dokument` håller brev ljusa i mörkt läge. Grå Tailwind-klasser borta ur inloggat.

**v3, Rummen, 2026-10-10 (våg 1a).** Spec `docs/design/spec-rummen-2026-10-10.md`,
godkänd av testansvarig. Vad som ändrades:

- Inloggat blev ett hus med fyra rum och ett grafitrum: mörk vägg högst upp i
  rummets kulör, golv och papper under. "Papper på ett bord" gäller inte
  längre i inloggat.
- Koppar `#E07A2F` ersätter orange som enda accent i inloggat, med
  koppar-ljus för text på väggen och koppar-ink på papper. Primärknappen blir
  koppar med mörk text (byggs i våg 1b).
- Tokens för fem rum, mörkt läge i båda formerna (system och `data-theme`),
  Tailwind-namnen `golv`, `papper`, `vagg`, `ton`, `rum`, `koppar`, `ljus`,
  radierna `vagg` och `ark`, skuggan `lyft`, typklasserna `text-h1-liten`,
  `text-tal-stor`, `text-tal-rad`, `text-tal-tre`, `text-kort-t`, `text-ey`,
  `text-ax`. `text-h1` blev 34/36 på mobil i rummen.
- Tokens gäller där sidan har ett rum (`:root:has([data-rum])`); Trådens
  värden står kvar för publika sidor och adminen. Alias från Tråden till
  Rummen tills våg 4.
- Adminens `--diagram-cv` och `--diagram-test` blev petrol och indigo; bara
  värdena.
- `primitives.tsx` fick storlek 120 för märkena.
- Kontrasten räknas maskinellt (`scripts/kontrast-rummen.mjs`) för alla fem
  rum i båda lägena. `--varning` blev `#985A08` i stället för specens
  `#9A5B08` (4,49:1), fråga till art-director.
- Borttaget ur `globals.css`: `.animate-shimmer`, `.card-hover-effect`,
  `.animate-pulse-pink`, `.animate-glow` och body-regeln med
  `--foreground-rgb`. Nyckelrutorna `pulse` står kvar eftersom de skriver
  över Tailwinds `animate-pulse` på publika sidor.

**v2.1, en linje, 2026-09-22.** Tio regler för en linje (display-snittet bär
varje sidrubrik, en scen per vy, en bläckyta, högst tre ytor i samma vikt i
följd, ett tal står aldrig ensamt, rader är innehåll, värde före funktion,
navigation med vikt och grupper, rytm mellan sektioner, orange är linje och
bläck). `text-h1` 32/35 och 44/46, `text-h1-pub`, `text-h2-pub`,
`text-varde`, `text-tal-display`. `InkPanel` och `Fordelning`. Gäller nu
publika sidor (avsnitt 12).

**2026-09-22, admin utan streck.** `--diagram-cv` och `--diagram-test` med
Allt i `--ink-1` och diagramregeln.

**v2, Tråden, 2026-09-13.** Egna tokens (`mark`, `panel`, `insunken`, `kant`,
`ink-1..3`, `accent`) med mätt kontrast, primärknappen i ink-1, tråden som
enda betydelsebärande linje, egna ikoner, CSS-rörelse.

**v1, 2026-09-11.** Linear/Vercel-uttryck på Tailwinds neutralskala, orange
primärknapp.
