# Väntar på S-1: de fyra FAQ-svaren om säkerhet

**Införda 2026-11-22.** S-1 kördes i produktion samma dag (samordnarens besked), så svaren och undantagsraderna nedan är införda i samma omgång som resten av ägarpunkterna, D-3 i versionen med "i en lagring som bara ditt konto når". Filen står kvar som underlag.

Ur `docs/publikt-omgang3/beslut-agarpunkter.md`, punkt 2, D-1 till D-4. De förs in först när S-1 (reglerna på hinken `cvs`, `supabase/migrations/20261122180000_cvs_egen_mapp.sql`) är körd och klicktestad. Lydelsen är saas-leads, ordagrant. Byt bara svaret (`a:`), frågorna (`q:`) står.

Radnumren gäller grenen `design/publikt-omgang3` efter commiten med ägarpunkterna (2026-11-22). Sök på frågan om raden har flyttat.

## D-1. Startsidan

`src/components/publikt/start/Startsidan.tsx:144`, frågan `Är mina uppgifter säkra?` på rad 143.

```ts
    a: 'Ja. Vi säljer inte dina uppgifter och tränar inga egna AI-modeller på ditt CV. Ditt konto, dina CV, brev och testresultat lagras i EU, i Irland, och text ur ditt CV går till Googles AI-tjänst utan namn, e-postadress och telefonnummer. Raderar du kontot under Inställningar tar vi bort det du har sparat hos oss. Kvitton finns kvar hos Stripe i sju år, som bokföringslagen kräver.',
```

## D-2. /funktioner

`src/app/(public)/funktioner/FunktionerSida.tsx:283`, frågan `Är det säkert att lämna mitt CV till er?` på rad 282.

```ts
    a: 'Ja. Vi säljer inte dina uppgifter och tränar inga egna AI-modeller på ditt CV. Ditt konto och dina dokument lagras i EU, i Irland, och text ur ditt CV går till Googles AI-tjänst utan namn, e-postadress och telefonnummer. Du raderar kontot själv under Inställningar, och då tar vi bort profilen, CV:n, breven, testresultaten och uppladdade filer. Kvitton finns kvar hos Stripe i sju år, som bokföringslagen kräver.',
```

## D-3. /verktyg/cv-analys

`src/app/(public)/verktyg/cv-analys/components/cv-analys-faq-data.ts:46`, frågan `Är mitt CV säkert hos er?` på rad 45.

När S-1 är testad (med "i en lagring som bara ditt konto når"):

```ts
    a: 'Ja. Vi säljer inte dina uppgifter och tränar inga egna AI-modeller på ditt CV. CV-filen och texten lagras i EU, i Irland, i en lagring som bara ditt konto når. Innan text ur CV:t går till Googles AI-tjänst byter vi ut namn, e-postadress och telefonnummer. Du raderar kontot själv under Inställningar, och då tar vi bort allt du har sparat hos oss, också filerna. Kvitton finns kvar hos Stripe i sju år, som bokföringslagen kräver.',
```

Om S-1 dröjer, enligt beslutet utan bisatsen:

```ts
    a: 'Ja. Vi säljer inte dina uppgifter och tränar inga egna AI-modeller på ditt CV. CV-filen och texten lagras i EU, i Irland. Innan text ur CV:t går till Googles AI-tjänst byter vi ut namn, e-postadress och telefonnummer. Du raderar kontot själv under Inställningar, och då tar vi bort allt du har sparat hos oss, också filerna. Kvitton finns kvar hos Stripe i sju år, som bokföringslagen kräver.',
```

Obs: dagens svar säger "CV-filerna ligger i en privat lagring som bara du kommer åt", vilket inte stämmer förrän S-1 är körd.

## D-4. /verktyg/personligt-brev

`src/app/(public)/verktyg/personligt-brev/components/brev-faq-data.ts:27`, frågan `Är det säkert att lämna mitt CV och era brev?` på rad 26.

```ts
    a: 'Ja. Vi säljer inte dina uppgifter och tränar inga egna AI-modeller på ditt CV eller dina brev. CV:n och brev lagras i EU, i Irland. Innan text ur ditt CV går till Googles AI-tjänst byter vi ut namn, e-postadress och telefonnummer, och sätter tillbaka dem i brevet hos oss. Du raderar kontot själv under Inställningar, och då tar vi bort profilen, CV:n och breven. Kvitton finns kvar hos Stripe i sju år, som bokföringslagen kräver.',
```

## Undantagsraderna

I `scripts/seo-baslinje/publikt-omgang3-undantag.json`, under `LD_UNDANTAG`. Svaren ligger i FAQPage på alla fyra sidorna; frågorna står, så ingen `FAQ_BYTT`. Lägg till fyra rader (lägg till, ta inte bort):

```json
    {
      "path": "/",
      "datum": "2026-11-22",
      "skal": "Beslut-agarpunkter D-1 (ägarens besked 2026-11-22, efter S-1): svaret på \"Är mina uppgifter säkra?\" säger lagring i EU, i Irland, AI-tjänsten utan namn, e-post och telefon, och kvitton hos Stripe i sju år. Frågan oförändrad.",
      "andrade": ["Organization+WebSite+FAQPage"]
    },
    {
      "path": "/funktioner",
      "datum": "2026-11-22",
      "skal": "Beslut-agarpunkter D-2 (efter S-1): svaret på \"Är det säkert att lämna mitt CV till er?\" säger lagring i EU, i Irland, och kvitton hos Stripe i sju år. Frågan oförändrad.",
      "andrade": ["FAQPage"]
    },
    {
      "path": "/verktyg/cv-analys",
      "datum": "2026-11-22",
      "skal": "Beslut-agarpunkter D-3 (efter S-1): svaret på \"Är mitt CV säkert hos er?\" säger lagring i EU, i Irland, maskningen före Googles AI-tjänst och kvitton hos Stripe i sju år. Frågan oförändrad.",
      "andrade": ["FAQPage"]
    },
    {
      "path": "/verktyg/personligt-brev",
      "datum": "2026-11-22",
      "skal": "Beslut-agarpunkter D-4 (efter S-1): svaret på \"Är det säkert att lämna mitt CV och era brev?\" säger lagring i EU, i Irland, maskningen och kvitton hos Stripe i sju år. Frågan oförändrad.",
      "andrade": ["FAQPage"]
    }
```

Beslutet säger "utöka raden" där en rad för sidan och schematypen redan finns; grinden slår ihop rader per sida (`ldUndantag` i `scripts/seo-diff-artiklar.ts`), så en ny rad gör samma sak och är lättare att se i diffen. Vill du hellre utöka: lägg skälet sist i den befintliga radens `skal` för samma sida.

## Efteråt

`npx tsc --noEmit`, `npx vitest run src/components/verktyg src/app/(public)`, bygget och SEO-grinden mot `docs/qa/seo-diff/publikt-omgang3-efter-live.json` för `/`, `/funktioner`, `/verktyg/cv-analys` och `/verktyg/personligt-brev`. Revalidera de fyra adresserna efter deploy.
