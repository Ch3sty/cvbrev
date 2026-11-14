# K2, prisraderna följer kampanjen: säljgranskning 2026-11-14

**Underkänt tills två rättelser är gjorda. Själva bygget i 6d9eef74 håller.**

Det här håller:
- Provkort, verktygskort och sidokort visar ett pris per kort: "99 kr första månaden, sedan 149 kr i månaden" under Black Week och 49 kr på Cyber Monday. Före och efter kampanjen visas bara 149 kr. Orden stämmer med kampanjraden ("Första månaden Premium för 99 kr") och med kassan (99 kr, Black Week i Stripe enligt qa-kampanj). Sidokortet har samma mönster som PremiumBlock. Skärmdumparna för 1280 och 412 i ljust och mörkt stämmer.
- Provsidan i inloggat frågar servern med samma klocka och aldrig-Premium-regel som kassan. Gratiskontot ser 99 kr och den före detta kunden ser 149 kr utan "första månaden". Där kan ingen före detta kund få ett pris som kassan sedan nekar.
- Publikt döljer jc_kampanj_ej kampanjpriset för före detta kunder. En före detta kund som är utloggad på en ny enhet ser 99 kr, precis som i kampanjraden. Det är samma kända gräns som i K1 och inget nytt med K2.
- Inga kampanjord i title, H1, description, snabbsvar, FAQ eller schema.

Rättelse 1, två priser på samma sida. `<PremiumPris />` i artikelns löptext (artiklar/[slug]/page.tsx rad 496) skriver alltid "149 kr i månaden". Det gäller:
- i-prov.mdx rad 44, stycket direkt under TypProvKort. Kortet säger 99 kr och nästa stycke säger "ingår i Premium, 149 kr i månaden". Det är den tydligaste krocken.
- i-prov.mdx rad 259, talserier.mdx rad 252 och ordforstaelse-test.mdx rad 80.

Gör så här: `PremiumPris: () => <MedKampanjPris text={premiumPris(PREMIUM_PLAN)} />`. Inget av stycket står i snabbsvaret. Varianterna ligger i löptexten på samma sätt som på korten, så SEO behöver bara bekräfta att löptext är okej.

Rättelse 2. Listans slutkort på /artiklar (ListaSlutKort, LISTA_SLUT.text) säger "Allt i en prenumeration, 149 kr i månaden" under kampanjraden som säger 99 kr. Lägg texten i `<MedKampanjPris text={LISTA_SLUT.text} />`.

Lägg till i qa-kampanj.mjs: /artiklar/i-prov i BW-läget. Ingen synlig text på sidan får säga "149 kr i månaden" utan "sedan" före.

Utanför K2 och inte stoppande: rakna-ut, verktygs-FAQ, skapa-brev och /funktioner visar fortfarande bara 149 kr. Det är ordinarie pris och inte fel i sak, men de bör tas i en egen omgång om kampanjen ska synas överallt. Ägaren avgör.

## Andra varvet, 2026-11-14

**K2 är godkänt (26302c28).** `<PremiumPris />` och listans slutkort går nu genom MedKampanjPris. Typen fungerar, eftersom PremiumBlock tar ReactNode i `text`. Det gäller under ett villkor: qa-kampanj.mjs ska vara grönt i alla fyra lägen på /artiklar/i-prov, med ett pris per sida, innan något pushas.

**K5, blocket "Inför testet", är underkänt i sin nuvarande placering.** Innehållet och länkmålen håller. Alla tre artiklarna har ArtikelProv på sidan, så besökaren kommer tillbaka till provet därifrån. Två saker behöver ändras:
1. Placeringen. 5c ligger direkt efter 5b ("Vilket test ska du göra?"). Där har varje kort både en guide och en väg till provet. 5c ger tre utgångar i följd mitt i säljföljden 5b, personligheten, vad som ingår och Premium. Det är en hypotes, inte uppmätt: klicken ut till artiklarna kan ta från hub-val-prov. Flytta därför blocket så att det står direkt efter 8 ("Förbered dig") och före 9. Ämnet hänger ihop med förberedelserna, och i ett läsflöde är guider på sin plats först efter säljavsnitten. Byt `yta="mark"` till `yta="panel"` så att blocket inte flyter ihop med 9, som också är mark.
2. En väg till provet. Lägg en länk under rastret i samma mönster som 5b, mätt för sig:
   `<div className="pub-handling" style={{ marginTop: 24 }}><MattLank className="pub-lank" href={PROVA} handelse="article_cta_clicked" egenskaper={{ cluster: 'test', position: 'inline', variant: 'hub-infor-prov', target: PROVA }}>Prova fem frågor utan konto</MattLank></div>`
   Copy får formulera om länktexten. Löftet "fem frågor utan konto" finns redan i Premium-avslutet.

FAQ-frågan "Vilka tester använder myndigheterna?" med länk är godkänd. Den står efter I-provsfrågan och påverkar inte köpvägen. Schemat läser bara svaret.

Mätning: följ hub-infor-* mot hub-val-prov-* och prova-klicken på hubben fyra veckor efter att artiklarna kommit till main. Om prova-klicken per besök sjunker är placeringen fel.
