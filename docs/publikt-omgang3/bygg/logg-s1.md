# S-1: CV-lagringen var öppen för alla inloggade

Körd 2026-11-22 med ägarens ja för just den här ändringen. Projekt `mnlrpfidyzuaxxlftruf` (Irland).

## Felet

Hinken `cvs` (privat, 354 filer från 183 konton, alla under `users/<id>/`) hade två regler på `storage.objects` som gav varje inloggad användare full åtkomst till alla filer:

| Regel | Kommando | Villkor |
|---|---|---|
| `Allow storage access to all authenticated users` | ALL | `bucket_id = 'cvs' AND auth.role() = 'authenticated'` |
| `Authenticated users can access cvs bucket` | ALL | samma, också som `with_check` |

De fyra ägarreglerna (`Allow users to view/update/delete/upload own files`) jämförde `(storage.foldername(name))[1]` med användarens id. Filerna ligger under `users/<id>/`, så första mappen är `users` och reglerna träffade aldrig. Registreringen är öppen, så den som skapade ett konto kunde lista, hämta, skriva över och radera alla filer i hinken.

Felet hittades av saas-lead under genomgången av texterna om datalagring och bekräftades med läsfrågor mot `pg_policies` och `storage.objects` innan något ändrades.

## Rättningen

Kördes via Supabase Management API (`POST /v1/projects/<projekt>/database/query`), eftersom MCP:ns `apply_migration` nekar SQL med `drop`. Svar: 201.

```sql
begin;
drop policy if exists "Allow storage access to all authenticated users" on storage.objects;
drop policy if exists "Authenticated users can access cvs bucket" on storage.objects;
drop policy if exists "Allow users to view own files" on storage.objects;
drop policy if exists "Allow users to update own files" on storage.objects;
drop policy if exists "Allow users to delete own files" on storage.objects;
drop policy if exists "Allow users to upload own files" on storage.objects;

create policy "cvs: egen mapp, läsa" on storage.objects for select to authenticated
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "cvs: egen mapp, ladda upp" on storage.objects for insert to authenticated
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "cvs: egen mapp, ändra" on storage.objects for update to authenticated
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text)
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "cvs: egen mapp, radera" on storage.objects for delete to authenticated
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text);
commit;
```

## Kontrollerat efteråt

- `pg_policies`: bara de fyra nya reglerna nämner hinken `cvs`.
- Alla 354 filer ligger under `users/<uuid>/`. Ingen fil ligger utanför.
- Reglerna provade i databasen, i en transaktion som rullades tillbaka, genom att låta frågan köras som rollen med ett givet användar-id:

| Fall | Synliga filer i `cvs` |
|---|---|
| Kontot med flest filer, enligt tabellen | 9 |
| Inloggad som det kontot | 9 |
| Inloggad som ett annat konto | 0 |
| Utan inloggning | 0 |

## Loggarna

Lagringsloggarna i projektet börjar 2026-11-19 12:51 UTC, när projektet skapades i Irland. Tre dygnsfönster är lästa (19, 20 till 21 och senaste dygnet):

- Inget anrop där ett inloggat konto har en annan användares mapp i adressen. 2 464 respektive 64 och 73 anrop mot hinken i de tre fönstren.
- Det loggarna inte visar: listningar (`storage.object.list`) har mappen i anropets kropp, inte i adressen, så det går inte att se vilken mapp som listades. Senaste dygnet gjorde 10 konton 18 listningar och 28 uppladdningar, vilket stämmer med att uppladdningen listar den egna mappen.
- Det som inte går att se alls: tiden före 2026-11-19, då databasen låg i det gamla projektet i Ohio (`dbvbnbkvadvlhjhomibg`). Reglerna fanns sannolikt där också. Loggarna där är inte lästa.

## Kvar

1. Klicka med ett riktigt konto på live: ladda upp ett CV, öppna det, ladda ner originalet, bifoga ett dokument till Jobbcoachen, radera CV:t.
2. Ägaren avgör, gärna med en jurist, om detta är en personuppgiftsincident som ska anmälas till IMY. Underlaget ovan säger vad som går och inte går att visa.
3. Hinken `profile-photos` är publik och dess regler jämför också första mappnamnet med användarens id. Inte ändrat här.
4. Skalets miljö har `NODE_TLS_REJECT_UNAUTHORIZED=0` satt, vilket stänger av certifikatkontrollen för alla anrop från Node i den terminalen. Det bör tas bort.

## Loggarna i det gamla projektet (läst 2026-11-22, på ägarens uppdrag)

Det gamla projektet i Ohio (`dbvbnbkvadvlhjhomibg`) är igång och dess loggar går att läsa via Management API (`GET /v1/projects/<projekt>/analytics/endpoints/logs`, ett dygn per fråga, bara läsning). Loggarna börjar 2026-08-24. Lästa: alla 88 dygn från 2026-08-24 till 2026-11-19, 2 981 895 anrop mot projektet. Skript och råutdata: sessionens arbetsmapp `gamla-loggar` (`q-varifran.sql`, `ut-varifran.txt`), utan användar-id i utdatat.

Reglerna i det gamla projektet är samma felbyggda regler som rättades i det nya: två ALL-regler på `auth.role() = 'authenticated'` och ägarregler som jämför första mappnamnet.

Alla anrop mot lagringen under de 88 dygnen, utom publika profilfoton:

| Vem | Varifrån | Vad | Antal |
|---|---|---|---|
| Inloggad användare | Vår server hos Vercel (Amazon), klienten `supabase-ssr createServerClient` | Uppladdning till egen mapp | 148 |
| Inloggad användare | Samma | Listning i `cvs` | 93 |
| Inloggad användare | Samma | Radering i `cvs` | 27 |
| Inloggad användare | Tele2 Sverige, klienten `supabase-ssr createServerClient` (lokal utvecklingsserver, tre dygn) | Uppladdning till egen mapp 39, listning 20, en nekad uppladdning av profilfoto | 60 |
| Servernyckeln | Tele2 Sverige och Vercel, klienten `supabase-js-node` (skript och serverrutter) | Listning, radering och uppladdning vid städning och kontoradering | cirka 1 070 |
| Servernyckeln | Tele2 Sverige | Hämtning av alla filer vid flytten till Irland 2026-11-19 | 2 450 CV och 14 profilfoton |

Det loggarna visar:

- Ingen fil i `cvs` har hämtats med en användares nyckel under de 88 dygnen. Ingen signerad adress har skapats. De enda hämtningarna är flytten 2026-11-19 med servernyckeln.
- Inget anrop där ett inloggat konto har en annan användares mapp i adressen.
- Varje anrop med en användares nyckel kom genom vår egen serverkod (`createServerClient`), från Vercel eller från den lokala utvecklingsservern. Inget anrop kom från en webbläsare eller en annan klient direkt mot lagringen.

Det loggarna inte visar:

- Tiden före 2026-08-24. Hinken har funnits sedan mars 2025.
- Vilken mapp en listning eller radering gällde, eftersom den står i anropets innehåll. Alla sådana anrop kom dock genom vår egen serverkod, som bara arbetar i den inloggades mapp.
- Klientens namn och nätverk är uppgifter som den som anropar kan förfalska. Att Tele2-anropen är ägarens egen uppkoppling är ett antagande som ägaren kan bekräfta.

Slutsats för ägarens beslut om IMY: under den tid som går att se finns inget tecken på att någon har läst, listat eller raderat någon annans filer. Beslutet och motiveringen är ägarens.

Öppet: det gamla projektet har kvar 350 filer i `cvs` och de felbyggda reglerna. Inget är ändrat där.
