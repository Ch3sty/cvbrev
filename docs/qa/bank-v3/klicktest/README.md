# Klicktest bank_version 3, 2026-10-12

Kört med `npx tsx scripts/qa-bank-v3.ts --port 5231 --korningar m360-light,desktop-light,m360-dark` mot en produktionsbyggd server (`NEXT_DIST_DIR=.next-a`, prod-databasen). Riktig Chrome, 360 (Pixel 7) och 1280, ljust; mörkt som stickprov på 360.

Per körning ett nytt konto `qa-v3-<ts>@jobbcoach-qa.test`:

1. Nivåkollen till resultatet.
2. Dagens pass: regelpanelen efter svaret och "Något ser fel ut" (ark, val, text, Skicka, kvittot "Tack, vi tittar på frågan.").
3. Logikens klassiska test på expert, alla svar, resultat och genomgång (ljust).
4. Verbalt och numeriskt test, grund (och avancerad på 360): testvyn visar första texten eller underlaget ur version 2, och sessionen har `underlag_version: 2` (ljust).
5. En gammal session med `bank_version: 2`: genomgången visar sina 15 frågor ur version 2, varav 8 som är pensionerade i version 3 (ljust).

Efter varje körning lästes kontots sessioner ur databasen: alla 165 matrisfrågor som visades (Nivåkollen, passet, klassiskt expert) är valbara i version 3, ingen har `pensionerad_fran: 3`, och det klassiska testet har `bank_version: 3`.

Utfall: inga fel, inga konsolfel, inga 4xx eller 5xx, ingen horisontell scroll. Rapporten loggades på servern (`PGRST205`, tabellen `fraga_rapporter` finns inte än) och kvittot visades ändå.

Kontona raderades med `--radera`, rad för rad via user_id, räknat före delete (`radering.json`). Detaljer i `resultat.json`.
