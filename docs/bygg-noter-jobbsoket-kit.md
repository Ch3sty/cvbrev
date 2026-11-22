# Byggnoter: Jobbsökets kit (omgång 1, etapp 1B)

Gren `feat/jobbsoket-kit`, arbetskopia `jobb-b`, 2026-11-21. Det här är kontraktet för vybyggarna i nästa etapp: allt utseende i Jobbsöket kommer ur kitet. Vyerna skriver ingen egen CSS; layout mellan delarna (grid, gap, marginal) får göras med Tailwind som i brevrummet.

## Vad som byggdes

- `src/app/jobb3.css`: tokens `--j3-*` under `[data-rum="jobb"]` (ljust och mörkt) och alla klasser med prefixet `j3-`. Importerad i `src/app/dashboard/layout.tsx` (en rad, efter `brev3.css`) och i kitsidan.
- `src/components/jobb3/kit/`: komponenterna, alla exporterade från `@/components/jobb3/kit` (`index.ts`).
- `src/app/jobb3-kit/page.tsx` + `KitKlient.tsx`: kitsidan på `/jobb3-kit` (404 i produktion, utanför inloggat, `data-rum="jobb"`). Överst en exempelvägg byggd som Main (dator) och Mobil-oversikt (telefon), sedan varje del i sina lägen och fler exempelväggar (tjänsten, tyst tjänst, Jobbcoachen, bedömt svar, Sökta med statistik och rapport, Matchade jobb med betalväggen, Inför intervjun, Oversikt-ny, laddar). `?tema=mork|ljus` väljer läge, `?ark=1` öppnar arket.
- Inget i `src/lib/**`, inga API-rutter, inga migreringar, inga riktiga sidor (utom CSS-importen i layouten). `src/components/rum/` är orört (se F1).

Brytpunkt: dator från 1280 px (`xl`), telefon under. Dator har innehållet 1120 px brett (vägg och golv `padding 0 40px` och `max-width 1120`, som brevrummet; i 1440-vyn blir sidmarginalen 160 som i skissen). Telefon: sidmarginal 16 (24 från 640 px).

## F1: sidramen ersätter RumHuvud

Jobbsökets sidor ritar i dag `RumHuvud` själva (Topprad + Rubrik i `Vagg`). Skalet (`DashboardShell`) ritar ingen rubrik och ingen topprad, och sidomenyn (dator) och dörrnavet (telefon) står kvar oförändrade. Därför behövs ingen ändring i `src/components/rum/`: en vy byter `<RumHuvud ... />` mot `<JobbVagg ...>` och får då exakt en h1 (i `VaggText` eller `TjanstHuvud`) och kontots åtgärder via `atgarder={<Topprad bara="atgarder" />}`, samma mönster som brevrummet (`DinaBrevVy`). Andra rum påverkas inte; alla klasser är `j3-*`.

Flikarna (`JobbFlikar`, klientö) är riktiga `next/link` till `/dashboard`, `/dashboard/jobbmatchning`, `/dashboard/sokta-tjanster` och `/dashboard/intervju`. Aktiv flik läses ur `usePathname()` med den rena funktionen `jobbFlikForPath` (i kitet, `flikar.ts`): `/dashboard` exakt är Översikt, de andra gäller också undersidor (`/dashboard/sokta-tjanster/[id]` ger Sökta). Sidor utan flik (Jobbcoachen, Bli upptäckt, Meddelanden, Arbetsstil) får `null` och ritas med `flik={null}` (flikarna utan aktiv, som skissens Jobbcoachen och Meddelanden) plus `tillbaka={TILLBAKA_JOBBSOKET}`.

## Komponenterna, props och exempel

Importera allt från `@/components/jobb3/kit`. Knappar och länkar: `href` ger `next/link` (eller `<a>` för `mailto:`, `tel:`, `http`), annars `<button>`. Alla komponenter utom `JobbFlikar` och `Ark` är serverkomponenter utan hooks; `onClick`/`onVal` fungerar när de används i en klientvy (skicka aldrig en funktion från en serverkomponent).

### Sidramen (`JobbVagg.tsx`)

| Komponent | Props | Not |
|---|---|---|
| `JobbVagg` | `hojd` (dator, minsta höjd, 596), `hojdMobil` (440), `luft`/`luftMobil` (luft under innehållet, 88/40), `kullar` ('tva','en','inga'), `flik` ('auto' grund, en flik, `null` utan aktiv, `false` inga flikar), `handling` (GlasKnapp uppe till höger, bara dator), `atgarder` (`<Topprad bara="atgarder" />`), `tillbaka` ({href,text,ton:'mjuk'\|'koppar'}), `handlingMobil` (till höger om tillbakalänken på telefon), `etikett` | Minsta höjd, inte fast: växer om innehållet kräver det. Skissens höjder: Main 596/500, Oversikt-ny 566, Jobb 436/338, Sokta 486, tjänsten 528/392, Intervju 612/432, Jobbcoachen 330, Meddelanden 316, Upptäckt 472, Statistik och Rapport 432, bedömt 460. |
| `Tillbaka` | `href`, `text`, `ton` | Används av JobbVagg; går att använda fristående. |
| `VaggHero` | `children` (vänsterspalt), `bild`, `spalt` (480), `glapp` (28), `topp` (34), `bildPlats` ('hoger','vanster','bred'), `bildStil` | Telefon: text, sedan bild, sedan Knapprad och Chips. |
| `VaggText` | `ogon`, `ogonMobil`, `ogonHoger` (VeckansMal kompakt), `rubrik` (h1), `rubrikMobil`, `storlek` ('stor' 46/50, 'mellan' 42/46), `ingress`, `ingressMobil`, `bredIngress` | Sidans enda h1. |
| `Knapprad` | `children` (StorKnapp), `rad` (bara dator) | |
| `Chips` | `children`, `dator` (dölj på telefon) | |
| `Golv` | `children` | `<main>`, 1120 brett på dator. |
| `FastFot` | `children`, `rader` | Telefonens fot över dörrnavet (sticky), döljs på dator. `rader` ger två rader (annonsens fot): primärknappen i full bredd överst. |

```tsx
<JobbVagg hojd={596} hojdMobil={500} handling={<GlasKnapp href="?logga=1" ikon={<IkonPlus />}>Logga sökt tjänst</GlasKnapp>} atgarder={<Topprad bara="atgarder" />}>
  <VaggHero bild={<JobbsokBana {...bana} />}>
    <VaggText ogon="Lördag 21 nov · vecka 47" ogonMobil="Lör 21 nov · vecka 47" ogonHoger={<VeckansMal kompakt antal={2} mal={3} />} rubrik="Intervju på Umeå Energi på tisdag" ingress="..." />
    <Knapprad rad="En kvart räcker."><StorKnapp href="/dashboard/sokta-tjanster/x">Förbered intervjun<IkonPil /></StorKnapp></Knapprad>
    <Chips dator><VeckansMal antal={2} mal={3} onAndra={oppnaMal} /></Chips>
  </VaggHero>
</JobbVagg>
<Golv>...</Golv>
```

### Små delar (`delar.tsx`)

- `StorKnapp` (primär, koppar, EN per skärm): `storlek` 'normal' (60 på dator) \| 'mellan' (56) \| 'lag' (52), `golv` (mjukare skugga på papper), `bred`, `href`/`onClick`/`type`/`disabled`. Telefon: alltid 56 och full bredd; klassen `lag-alltid` ger 52 och egen bredd också på telefon (Skicka, Följ upp i en rad).
- `LitenKnapp` (vit): `storlek` 44\|48\|52, `variant` 'vit'\|'kop'(bara i betalväggar)\|'streckad'(Annat)\|'morkt'(på väggens mörka kort), `bred`, `ikon` (ritas i rummets gröna).
- `IkonKnapp` är borttagen (Jobbsöket omgång 2): annonsens fot på telefon har inte längre ikonknappar utan text. Foten är `AnnonsFotMobil` i `jobb/AnnonsVy.tsx` i `<FastFot rader>`: "Skriv brev" i full bredd, under den två `LitenKnapp storlek={48}` med ikon och text ("Spara", "Markera som sökt"). Klassen `.j3-liten.ikon` står kvar, den används av `sokta/Backfill.tsx` och `sokta/Rapport.tsx`.
- `GlasKnapp` (väggen): `ikon`, `href`/`onClick`.
- `TextLank`: `vagg`, `mjuk`, `liten`.
- `Chip` (bricka i väggen), `VaggEtikett` (glasbricka "Umeå", "Lön: satt").
- `VeckansMal`: `antal`, `mal`, `onAndra`\|`andraHref`, `kompakt`. Nått mål ger "Veckans mål klart: 3 av 3". Rutorna fyller aldrig mer än målet.
- `StorBricka` (92/64): `kod`, `tyst` (kopparring).
- `VaggBricka` (50, `stor` 54): `kod`, `ton` 'vit'\|'tyst'\|'tom'\|'int'\|'av', `tagg`, `taggLjus`, `href`, `etikett`.
- `Bricka` (golvet): `kod`, `ton` 'standard'\|'tyst'\|'tom'(Ska sökas, streckad)\|'slut'(avslutad, grå)\|'int'\|'las', `mobil` 44\|48\|56, `dator` 44\|48\|56\|60, `ring` (kopparring), `children` (ikon i stället för kod).
- `Tagg`: `variant` 'ny'\|'exempel'\|'premium', `liten`. "Nytt i flödet" finns inte och ska inte byggas.
- `StatusPiller`: `status` 'vantar'\|'folj-upp'\|'intervju'\|'vantar-besked'\|'avslutad'\|'erbjudande', `children` (egen text, t.ex. "Intervju bokad", "Avslag", "11 dagar"), `vit` (på tonade rader). Aldrig rött.
- `Antal` (talet bredvid en grupprubrik): `tyst`.
- `DatumBricka`: `datum` (Date) eller `manad`+`dag`, `pa` 'vagg'\|'golv'.
- `DatumRuta`: `bricka`, `rubrik`, `rad`, `pa`.
- `Prickar` (betyg 1 till 5): `antal`, `av`, `variant` 'normal'\|'vagg'\|'mini'\|'mellan'\|'stor'(40 px), `etikett`.
- `Rutor`: `antal`, `av`, `variant` 'golv'\|'morkt'\|'vagg', `etikett`.
- `UppMarke` ("upp från 2 av 5").
- `Kompetens` (`saknas`), `KompetensRad` (`har`, `saknas`: texten blir "SAP saknas i ditt CV").
- `Matchring`: `procent`, `storlek` 48\|52\|64\|112.
- `FyrstegsBana` (132 x 20): `steg` 1 till 4, `tyst`, `avslutad`.

### Väggens banor (`Bana.tsx`)

- `JobbsokBana`: `skaSokas`, `sokt`, `intervju`, `erbjudande` (varje `{ brickor: {kod, tyst?, tagg?, taggTon?}[], under?, underMobil? }`), `etikett`. Kapacitet 2/4/2/1, fler blir "+N". Kopparspåret går till längsta steget med brickor; det steget pulserar. Taggar bara på dator.
- `JobbsokBanaNy` (Oversikt-ny): `steg` (tre `{rubrik, under?}`), `aktuellt` 1\|2\|3, `etikett`.
- `TjanstBana`: `steg` 'sokt'\|'svar'\|'intervju'\|'erbjudande', `datum`, `datumMobil`, `kod`, `tyst` (taggens text, t.ex. "tyst 15 dagar"), `etikett`.
- `FrageBana`: `fragor` (sju `{nr, rubrik, href, lage:'ny'\|'klar'\|'nasta', betyg?, betygOrd?, under?, underKoppar?}`), `intervju` ({rubrik, under}). Ormen på dator, en rad med sju rutor på telefon.

### Golvets ram (`Golv.tsx`)

- `LyftPanel`: `rubrikId`/`etikett`, `tat`, `delad` (vänsterspaltens bredd, 432 Jobb, 388 Meddelanden), `lyftMobil` (30), `ejLyft`, `luft` (dator-padding som sträng).
- `PanelHuvud`: `ogon`, `ogonTagg`, `rubrik` (h2), `rubrikMobil`, `rubrikId`, `stor` (26/32), `under`, `hoger` (dator), `hogerAlltid`, `mitt`.
- `SektionsHuvud`: `rubrik`, `rubrikId`, `under`, `underAlltid`, `lank` {href,text,textMobil}, `hoger`.
- `GruppHuvud` ("Följ upp 1 ..."): `rubrik`, `antal`, `antalTyst`, `text` (bara dator), `tagg`, `niva` 2\|3, `id`.
- `Kort`: `ton` 'vit'\|'ton'\|'streckad'\|'tyst'\|'kop'\|'morkt', `lista` (rader kant i kant med linje), `luft`, `as`.
- `TonYta`, `Spalter` (`sido` 380/400/360, `topp`, `tat`), `Avsnitt` (`topp`, `tat`).

### Rader och kort (`Rader.tsx`)

- `GoraKort`: `ton` 'nu'\|'tyst'\|'vanlig', `ikon`, `nar`, `rubrik`, `rubrikMobil`, `text`, `textMobil`, `href`, `knapp`. Dator: kort med vit knapp. Telefon: hela raden är länken. I `GoraLista`.
- `TjanstRad`: `bricka` {kod,ton}, `rubrik`, `rubrikMobil`, `arbetsgivare`, `text`/`textMobil` (ReactNode), `steg` {steg,tyst,avslutad}, `status` {status,text,vit}, `href` (hela raden tryckbar), `handling`, `handlingMobil` (grund ja), `hogerMobil`, `storlek` 'kompakt'(Main)\|'stor'(Sökta). Utan steg och status blir rutnätet enkelt (bricka, text, knapp).
- `SidoRad` (Mer i Jobbsöket, provlistan, samtal): `ikon`, `ikonTon` 'mjuk'\|'test'\|'tyst'\|'ton', `figur`, `rubrik`, `text`, `href`, `hoger`, `vald`.
- `SparadKort` (Ska sökas): `kod`, `titel`, `arbetsgivare`, `matchgrad`, `dag`, `snart`, `passerad` (grått, "Sista dag har passerat"), `handling`, `lank` (syns i alla bredder med 44 px tryckyta, egen rad om bredden inte räcker), `bort` ("Ta bort" på en aktiv rad, egen rad sist). I `SparadLista`.
- `TraffKort` (Main): `procent`, `titel`, `var`, `ny`, `skal` (högst två), `dag`, `snart`, `href`, `knapp`. I `Traffar` (tre i rad på dator, en lista i ett kort på telefon).
- `TraffRad` (Matchade jobb): `procent`, `titel`/`var` (utelämnade = dold träff), `skal` (telefon), `dag`, `snart`, `ny`, `href` (lägg vald annons i adressen), `vald`, `onClick`. I `TraffLista`.
- `FilterRad`: `val` [{id,text,antal,href?}], `valt`, `onVal`, `sort`, `etikett`. Länkar när `href` finns (F8: adressen bär filtret).
- `Vaxel`: `val` [{id,text,href?}], `valt`, `onVal`, `variant` 'ljus'(Lista, Statistik, Rapport)\|'mork'(Jag har sökt, Jag ska söka)\|'liten'(Vecka, Månad), `etikett`.

### Data som bild (`Data.tsx`)

`Fakta` (rader {etikett,varde}), `FaktaRutor`, `KravLista` (krav {text,saknas,rad}), `Passar` (ring 112 och skäl), `AnnonsText`, `KravRutor`, `Handelsebana` (handelser {rubrik,datum,datumKoppar,text,lage:'klar'\|'snart'\|'sen',ikon,linje}, `liten` för Vad som händer sedan; ikon kan vara en kort text som "3/12"), `Snabbval`, `FragaKort` (rubrik, rad, betyg 0 till 5, href, nu), `FragaAllt`, `Fragor`, `StarBrickor` (delar {bokstav,namn,under,saknas}, `pa` 'papper'\|'vagg', `marke`), `Bedomning` (rubrik, punkter, saknas), `Faktorer` ({namn,niva,ord}), `Tratt` (led {tal,namn,under,brickor:{kod,ton:'int'\|'standard'\|'tyst'\|'slut'}[],mal}, mellan, etikett), `Veckostaplar` (veckor {etikett,brickor,nu}, mal, etikett), `Kanaler`, `ManadVal`, `StegKort`/`StegKortRad`, `Notis`, `EtikettTag`, `Punkter`.

### Väggdelar (`VaggDelar.tsx`)

`TjanstHuvud` (kod, tyst, ogon, titel = h1, arbetsgivare), `VaggRuta` (rubrik, lankar), `RutaRad` (rubrik, text, handling, href\|onClick), `VaggTal`, `StortTal` (tal, rad, stark), `StegFack` (fack {namn,antal,under,brickor,mal}), `VaggBrickLag`, `Strombrytare` (pa, rubrik, text, onClick; role="switch").

### Ark och fält (`Ark.tsx`, `Falt.tsx`)

- `Ark` (klient): `open`, `onClose`, `rubrik`, `text`, `children`, `fot` (StorKnapp bred och en rad), `bredd` (560). Botten på telefon, mitten på dator; portal till body, Escape och tryck på dimman stänger, fokus på arket och tillbaka efteråt, sidan bakom rullar inte, Tab stannar i arket.
- `Falt` (`typ` 'text'\|'datum'\|'tid'\|'url'\|'epost'\|'tal', `etikett`, `tillagg`, `hjalp`, `fel`, plus input-attribut), `ValFalt` (`alternativ`), `TextFalt`, `SokFalt`, `GruppEtikett`, `ValKnapp` (`vald`, `form` 'stor'\|'rad', `ikon`, `krymp`) i `ValRad`, `Kryss`, `FlerDetaljer`.

### Papper, Jobbcoachen, lägen

- `MejlUtkast` (till, amne, children = stycken eller `<textarea>`, fotVanster, fotHoger), `LinjeratSvar` med `Hak` och `Markor`, `RapportBlad` (namn, period, periodRad, sektioner {rubrik,rader,antal,las}, siffror, under; alltid vitt).
- `Samtal`, `JagBubbla`, `SvarBubbla` (kallor, skriver, ikon), `Kallrad`, `FragaForslag` (kod, ton, onClick) i `ForslagLista`, `Inmatning` (etikett, value, onChange, onSubmit, knapp), `KvotPrickar` (kvar, av).
- `TomtLage` (ikon, rubrik, text, handling, inbaddad), `Felruta` (text, onForsok\|forsokHref; "Försök igen"), `SparrRam` (ram runt `<PaywallCard ... bare />`, dess logik och texter orörda), `Skel`, `VaggSkelett` (läggs i JobbVagg med samma höjder), `PanelSkelett`, `RadSkelett`.

### Ikoner (`ikoner.tsx`)

Inline-SVG, stroke 2, rundade ändar, `aria-hidden`: IkonPil, IkonTillbaka, IkonChevron, IkonNed, IkonPlus, IkonKryss, IkonBock, IkonKalender, IkonKlocka, IkonMejl, IkonPenna, IkonOga, IkonPrat, IkonRutnat, IkonFlagga, IkonLas, IkonLasUpp, IkonKopiera, IkonBokmark, IkonSkicka, IkonPlan, IkonPersoner, IkonPerson, IkonDokument, IkonVaska, IkonAvslag, IkonUtrop, IkonLank, IkonUt, IkonSok, IkonSkrivare, IkonSkold, IkonPilUpp, IkonPilHoger. Props `size`, `className`, `bredd`.

## Klasslistan

Alla klasser i `src/app/jobb3.css` (komponenterna bär dem; använd komponenten, inte klassen, om den finns):

`j3-sida j3-disp j3-eyebrow j3-ogon j3-ogon-golv j3-h1(.mellan) j3-ingress(.bred) j3-h2(.stor) j3-h3 j3-under j3-text j3-fin j3-lank(.liten) j3-lank-vagg(.mjuk)` · vägg: `j3-vagg j3-vagg-dekor j3-vagg-cirkel j3-vagg-kullar j3-vagg-inre j3-topp j3-topp-atgarder j3-topp-hoger j3-flikar j3-flik j3-tillbaka(.koppar) j3-tillbaka-rad j3-glas j3-hero j3-hero-text j3-hero-bild j3-ogonrad j3-knapprad j3-sidorad j3-chips(.dator) j3-chip(.liten) j3-malpips j3-mal-kort j3-ruta j3-ruta-huvud j3-ruta-lankar j3-ruta-rad j3-vchip j3-vtal j3-stortal j3-storbricka j3-tjanst-huvud j3-vb j3-vb-lag j3-fackrad j3-fack j3-fack-* j3-datum j3-datumruta j3-bryt j3-bryt-sp j3-vaggtext-rad` · banor: `j3-bana(.dator .mobil) j3-halo j3-sparet j3-fragebana j3-fb j3-ft j3-fb-nasta j3-sju` · knappar: `j3-stor(.golv .mellan .lag .lag-alltid .bred) j3-liten(.s48 .s52 .bred .kop .streckad .morkt .ikon) j3-tagg(.liten .exempel .premium) j3-pill(.vantar .folj-upp .intervju .vantar-besked .avslutad .erbjudande .vit) j3-bricka(.m48 .m56 .d44 .d48 .d56 .d60 .tyst .slut .int .tom .las .ikon .ring) j3-brickrad j3-antal` · golv: `j3-golv j3-golv-inre j3-spalter j3-avsnitt j3-panel(.tat .delad .ej-lyft) j3-panel-huvud j3-sektion-huvud j3-grupp j3-kort(.lista .luft .ton .streckad .tyst .kop .morkt) j3-tonyta j3-rad(.stor .med-handling .enkel) j3-rad-* j3-strack j3-fyrsteg j3-sido j3-sido-* j3-spar(.passerad) j3-spar-* j3-sparlista j3-goralista j3-gora j3-gorarad j3-gora-ik j3-gora-nar j3-ring j3-traffar j3-traff j3-traff-* j3-skal j3-trflista j3-trf(.dold .vald) j3-trf-* j3-filterrad j3-fchip(.sort) j3-komprad j3-komp(.saknas) j3-faktarutor j3-fakta j3-annons-text j3-passar j3-passar-* j3-krav2 j3-kravlista j3-krav(.saknas) j3-vaxel(.mork .liten)` · fält och ark: `j3-falt j3-etikett(.grupp) j3-inp(.sok) j3-inp-ram(.vanster) j3-falt-hjalp j3-falt-fel j3-valrad j3-val(.rad .krymp) j3-kryss j3-detaljer j3-dimma j3-ark j3-ark-*` · papper: `j3-brunn j3-mejl j3-mejl-rad j3-mejl-text j3-brunn-fot j3-linjerat j3-hak j3-markor j3-rbrunn j3-rark j3-rark-* j3-arad(.las) j3-siffror j3-siff j3-manad j3-manad-*` · statistik: `j3-tratt j3-led j3-led-* j3-lada(.mal) j3-mellan j3-forklaring j3-forkl j3-veckor j3-veckor-* j3-vecka j3-klots j3-kanal j3-kanal-*` · händelser och intervju: `j3-handlista j3-hand(.streck .sist .liten .sen-rubrik) j3-hand-* j3-snabbval j3-prickar(.vagg .mini .mellan .stor) j3-rutor(.morkt .vagg) j3-upp j3-fragor j3-fraga(.nu .allt) j3-star(.vagg) j3-sb(.saknas) j3-sb-bock j3-sb-marke j3-dom(.saknas) j3-faktor j3-faktorer j3-band` · coach: `j3-samtal j3-jag j3-coach j3-coach-ik j3-svar(.skriver) j3-kallor j3-kalla j3-forslag j3-forslaglista j3-inmatning j3-kvotpips` · övrigt: `j3-stegkort j3-stegkort-bild j3-stegkort-rad j3-nr(.koppar) j3-punkter(.vagg) j3-etikett-tag(.ton .kant) j3-notis(.ton) j3-notis-ik j3-fot j3-tomt(.inbaddad) j3-tomt-ik j3-fel j3-fel-rad j3-skel(.vagg .rund) j3-skel-flikar j3-sparr`.

## Mörkt läge

Som brevrummet: tokens skrivs både under `@media (prefers-color-scheme: dark)` med `:root:not([data-theme="light"])` och under `:root[data-theme="dark"]`, på `[data-rum="jobb"]` och `:root:has(...)` (så att arket i body får dem). Väggen och allt som står på den (flikar, glas, väggens brickor, banorna) är detsamma. Golvet följer globals (`#0B140E`), papperet `#141E17`, kanter `#2F4E3A`, tonad yta `#19261D`, linjer `#223A2A`, text `#F3F2F7/#C9D6CC/#9DB0A2`, rummets gröna text `#8FD3A0`. Brickornas toner (ton, tyst, slut, väntar) har mörka par. Rapportbladet är alltid vitt. Kort i väggens färg (Att göra nu "nu", vald växel) behåller `--vagg`, vilket ligger nära panelens mörka papper men skiljs av skuggan; se avvikelser.

## Egna beslut

1. **Minsta höjd i stället för fast höjd** på väggen (skissens höjder som `min-height`, plus luft under innehållet). Längre rubriker och kontots åtgärder klipps aldrig; panelens överlapp är detsamma eftersom den lyfts med negativ marginal.
2. **Kontots åtgärder** (meddelanden, notiser, profil) ritas inte i skissen men måste finnas. Dator: till höger om glasknappen. Telefon: en egen rad på 44 px över flikarna (fyra flikar och tre ikoner får inte plats på en rad i 380 px). Väggen blir då 48 px högre på telefon än skissen.
3. **Flikarna på sidor utan flik**: skissen ritar flikarna utan aktiv flik plus tillbakalänk (Jobbcoachen, Meddelanden); specen säger tillbakalänk "Jobbsöket". Kitet gör båda möjliga; rekommendation: `flik={null}` plus `tillbaka={TILLBAKA_JOBBSOKET}` med `ton="koppar"`. Intervjusvarets sidor (Intervju-svar, Intervju-bedomt) ritas utan flikar (`flik={false}`) med tillbakalänk till Inför intervjun, som skissen.
4. **Telefonens fot** ("Logga sökt tjänst") är sticky över dörrnavet i stället för att bara stå sist på sidan; skissen är en statisk bild och klassen heter `.fast` där.
5. **Arket fokuserar sig självt** vid öppning, inte första fältet, så att telefonens tangentbord inte fälls upp innan hon trycker i ett fält.
6. **Banornas kapacitet**: Ska sökas 2, Sökt 4, Intervju 2, Erbjudande 1; fler visas som en bricka "+N". Skissen ritar bara Elins fall.
7. **Datumbrickan och tjänstens bana på telefon** har mått som inte står i skissens CSS (datumbrickan 48 x 52); tagna ur bilden Mobil-tjanst.
8. **Tratten på telefon** står under varandra med pilen nedåt (specen: datorns innehåll i en kolumn).
9. **Veckostaplarna** skalar efter data: en rad per sökt tjänst (60 px dator, 46 telefon), mållinjen på målets höjd. Skissens linjer på 68 px kunde inte följas när veckorna har fler än tre.
10. `jobbFlikForPath` ligger i kitet (`flikar.ts`), inte i `src/lib`, eftersom bara kitet använder den.

## Avvikelser från skissen, med skäl

- Kontots åtgärder i väggen (se beslut 2): skissen ritar dem inte.
- Taggen "Nytt i flödet" är inte byggd (anteckning till ägaren, enligt uppdraget).
- `Matchring` i 48 px använder skissens 52-geometri nedskalad (Mobil-oversikt gör likadant).
- Ögonbrynet "Därför passar du" i annonsen är 11 px som skissens `.eyebrow`-klass, fast bilden ser större ut.
- Datumfältet är ett riktigt `<input type="date">`: webbläsaren visar datumet i sitt format (2026-11-21), inte "I dag, lördag 21 nov" som i Mobil-logga. Vill vi ha skissens text behövs en egen datumväljare.
- I mörkt läge ligger mörka kort (Att göra nu "nu", vald växel, valt månadsval) i väggens färg `#1B3324` på papper `#141E17`: skillnaden är liten. Brevrummet har samma lösning.
- Kitsidans exempel använder lite inline-stil för sin egen layout (rubriker, bredder). Kitkomponenterna sätter bara mått och CSS-variabler inline (skelettens storlek, väggens höjd, staplarnas antal), aldrig färg.

## Det som inte är prövat

- Inget fullt bygge, ingen perf, ingen klickmatris (görs i slutkontrollen). `npx tsc --noEmit` är grön.
- Ingen komponent är inkopplad på en riktig sida; F1 (flikarna mot riktiga rutter) är prövad bara med `aktiv` satt på kitsidan och genom att läsa `jobbFlikForPath`.
- `Ark`: fokusfällan och Escape är skrivna men bara prövade genom att öppna och stänga i kitsidan.
- PaywallCard i `SparrRam` ritas med `bare` på kitsidan och skickar sina vanliga mätpunkter (bara i utveckling).

## Skärmbilder

`scratchpad/jobbsok/bygg/kit/`: `kit-1440-ljus.png`, `kit-1440-mork.png`, `kit-412-ljus.png`, `kit-412-mork.png`, `main-1440.png`, `main-412.png`, `jamfor-main.png` (skissen Main och Mobil-oversikt bredvid kitets exempelvägg), `ark-412.png`, `ark-1440.png`, och per vägg i `del/`.

## Hur man backar

Ta bort importen av `jobb3.css` i `src/app/dashboard/layout.tsx`, och filerna `src/app/jobb3.css`, `src/components/jobb3/`, `src/app/jobb3-kit/` och den här filen. Inget annat är rört.
