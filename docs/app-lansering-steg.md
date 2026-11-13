# Testklar till Google Play: ägarens steg

Skriven 2026-11-13. Gren `feat/android-app`. Fingeravtryck och sökvägar nedan är inte hemliga; nyckeln och lösenordet ligger i `C:\Users\chris\.testklar\` och delas aldrig.

## 1. Godkänn driftsättningen
Säg ja, så committar jag grenen, kör fullt bygge och kontroll av webben och driftsätter. Det ger rättad kontoradering på webben, sidan https://www.jobbcoach.ai/radera-konto och appens sidor (de syns bara för appen).

## 2. Beslut: Nivåkollen före kontot
Ja: slå på Supabase > Authentication > Sign In / Providers > Allow anonymous sign-ins, och helst captcha. Nej: konto skapas före Nivåkollen (fungerar redan).

## 3. Google Play Console (play.google.com/console)
1. Utvecklarkonto som organisation (D-U-N-S-nummer, 25 dollar en gång). Organisation slipper kravet på 12 testare i 14 dagar.
2. Skapa app: namn Testklar, språk svenska, App, Gratis.
3. Testning > Intern testning: skapa version, godkänn Play App Signing, ladda upp `mobilapp/utdata/testklar-1.0.0-1.aab`.
4. Inställningar > Appintegritet > Appsignering: kopiera SHA-1 och SHA-256 för appsigneringsnyckeln och skicka dem till mig.
5. Butiksnärvaro: texter från `mobilapp/butik/butikstexter.md`, ikon `ikon-512.png`, featuregrafik, `telefon-1` till `telefon-4`.
6. Appinnehåll: integritetspolicy https://www.jobbcoach.ai/integritetspolicy, kontoradering https://www.jobbcoach.ai/radera-konto, datasäkerhet enligt `mobilapp/butik/data-safety.md`, innehållsklassning, målgrupp 18+, inga annonser.
7. Intäktsgenerering > Prenumerationer: produkt-id `testklar_premium`, basplan månad, 149 kr, ingen provperiod.
8. Inställningar > Licenstestning: lägg till din Gmail (köp utan att dras pengar).
9. Lägg till dig själv som testare i Intern testning och öppna testlänken på telefonen.

## 4. Google Cloud, projekt 750584671017
1. API:er och tjänster > Inloggningsuppgifter > Skapa OAuth-klient-id > Android. Paket `ai.jobbcoach.testklar`, SHA-1 nedan. Gör en klient per fingeravtryck:
   - Upload-nyckeln: `04:91:2D:17:50:6A:1F:6F:EA:1E:88:8C:E0:F4:46:E8:E3:C9:A2:E8`
   - Play-signeringen: från steg 3.4
   - Debug: `32:36:96:95:51:65:3B:43:7B:55:B5:31:E4:FE:60:5F:7B:A2:D2:B0`
2. Tjänstekonto för RevenueCat: följ RevenueCats guide "Google Play service credentials" (ger en JSON-nyckel, och kontot bjuds in i Play Console med ekonomibehörighet).

## 5. RevenueCat (app.revenuecat.com)
1. Skapa projekt Testklar, lägg till Google Play-app `ai.jobbcoach.testklar` med tjänstekontots JSON.
2. Real-time developer notifications: följ RevenueCats steg för Pub/Sub i Play Console.
3. Entitlement `premium`. Produkt `testklar_premium`. Offering `current` med månadspaketet.
4. Integrations > Webhooks: URL `https://www.jobbcoach.ai/api/app/revenuecat`, Authorization = ett långt slumpat värde du hittar på.
5. Kopiera den publika Android-nyckeln (börjar med `goog_`).

## 6. Firebase (console.firebase.google.com)
1. Lägg till Firebase i projekt 750584671017 (eller nytt projekt).
2. Lägg till Android-app `ai.jobbcoach.testklar`, ladda ner `google-services.json` och lägg den i `C:\Users\chris\.testklar\`.
3. Projektinställningar > Tjänstekonton > Generera ny privat nyckel. Lägg JSON-filen i `C:\Users\chris\.testklar\`. Skicka den aldrig i chatten.

## 7. Vercel (Production)
- `REVENUECAT_WEBHOOK_AUTH` = värdet från 5.4
- `NEXT_PUBLIC_REVENUECAT_ANDROID_KEY` = nyckeln från 5.5
Driftsätt om efteråt.

## 8. Säg ja till körningarna i produktionsdatabasen
Jag kör i ordning: tabellen `app_enheter`, utskicksfunktionen `app-paminnelse`, dess hemligheter (från filen i 6.3), schemat var 15:e minut. Och städningen av anonyma konton om du sa ja i steg 2.

## Sedan gör jag
Lägger `google-services.json` i appen och Plays SHA-256 i `public/.well-known/assetlinks.json`, bygger version 2, provar Google-inloggning, köp med licenstestaren och påminnelsen på din telefon via Intern testning. När allt fungerar: du flyttar versionen till Produktion i Play Console.
