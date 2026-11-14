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
