# Copy: Black Week och Cyber Monday 2026

Slutliga texter för de två kampanjerna på Jobbcoach Premium. Varje text har en nyckel så att den går att klistra in rakt av. Platshållare står inom klammerparenteser: `{datum}` är nästa dragningsdatum (en månad efter köpet, till exempel 23 december för ett köp den 23 november).

Gäller för alla texter nedan: inga tankstreck, "vi" om Jobbcoach, aldrig "AI", "Premium" följs alltid av pris eller period i knappar, säljrader och ämnesrader, "Köp" i köpknappar, "personliga brev" och "Jobbcoachen".

| Kampanj | Period | Första månaden | Sedan |
|---|---|---|---|
| Black Week | mån 23 till sön 29 november, 00.00 till 23.59 | 99 kr | 149 kr i månaden |
| Cyber Monday | mån 30 november, 00.00 till 23.59 | 49 kr | 149 kr i månaden |

Båda gäller bara konton som aldrig haft Premium.

---

## 1. Publik banner (raden ovanför menyn)

Etikett i versaler, sedan text, sedan länktext. I mobil visas bara texten och hela raden är länken.

### Black Week

- `banner.bw.etikett`: BLACK WEEK
- `banner.bw.text`: Första månaden Premium för 99 kr, till och med söndag.
- `banner.bw.lanktext`: Se erbjudandet

Text 54 tecken, länktext 14 tecken.

### Cyber Monday

- `banner.cm.etikett`: CYBER MONDAY
- `banner.cm.text`: Första månaden Premium för 49 kr. Bara i dag till 23.59.
- `banner.cm.lanktext`: Se erbjudandet

Text 56 tecken, länktext 14 tecken.

---

## 2. Kort i inloggad hemvy (bara gratiskonton)

Stängknappen döljer kortet för resten av kampanjen. På Cyber Monday visas kortet igen med ny text, även för den som stängde det under Black Week.

### Black Week

- `kort.bw.rubrik`: Black Week: första månaden Premium för 99 kr
- `kort.bw.brodtext`: Övningsprov med tid och ett pass om dagen fram till provet. Sedan 149 kr i månaden. Till och med söndag.
- `kort.bw.knapp`: Köp Premium, 99 kr
- `kort.bw.stang`: Nej tack

Rubrik 44 tecken, brödtext 104 tecken.

### Cyber Monday

- `kort.cm.rubrik`: Cyber Monday: första månaden för 49 kr
- `kort.cm.brodtext`: Övningsprov med tid, CV och personliga brev, allt i Premium. Sedan 149 kr i månaden. Bara i dag, till 23.59.
- `kort.cm.knapp`: Köp Premium, 49 kr
- `kort.cm.stang`: Nej tack

Rubrik 38 tecken, brödtext 108 tecken.

Om knappen får plats med fler tecken går det bra att använda den längre formen från priskortet: "Köp Premium, 99 kr första månaden".

"Nej tack" i stället för "Inte nu": stängningen gäller resten av kampanjen, och då ska ordet inte antyda att kortet kommer tillbaka i morgon.

---

## 3. Priskort (/priser och Premium-blocket)

Ordinarie pris struket bredvid kampanjpriset. Raden direkt under priset börjar med liten bokstav eftersom den fortsätter beloppet ("99 kr första månaden, sedan ...").

### Black Week

- `pris.bw.flagga`: Black Week
- `pris.bw.belopp`: 99 kr
- `pris.bw.struket`: 149 kr
- `pris.bw.rad`: första månaden, sedan 149 kr i månaden. Säg upp när du vill.
- `pris.bw.knapp`: Köp Premium, 99 kr första månaden
- `pris.bw.fotnot`: Gäller till och med söndag 29 november 23.59 för konton som inte haft Premium tidigare.
- `pris.bw.prisrad`: Jobbcoach Premium, 99 kr första månaden, sedan 149 kr i månaden. Säg upp när du vill.

### Cyber Monday

- `pris.cm.flagga`: Cyber Monday
- `pris.cm.belopp`: 49 kr
- `pris.cm.struket`: 149 kr
- `pris.cm.rad`: första månaden, sedan 149 kr i månaden. Säg upp när du vill.
- `pris.cm.knapp`: Köp Premium, 49 kr första månaden
- `pris.cm.fotnot`: Gäller bara måndag 30 november till 23.59, för konton som inte haft Premium tidigare.
- `pris.cm.prisrad`: Jobbcoach Premium, 49 kr första månaden, sedan 149 kr i månaden. Säg upp när du vill.

`prisrad` är den enradiga säljraden på de ställen som i dag visar "Jobbcoach Premium, 149 kr i månaden. Säg upp när du vill." (betalväggar, passflöden, Mitt test).

---

## 4. Kassan

### Sammanställningen

- `kassa.rad.produkt`: Jobbcoach Premium, första månaden
- `kassa.rad.ordinarie`: 149 kr
- `kassa.bw.rabatt.etikett`: Black Week
- `kassa.bw.rabatt.belopp`: −50 kr
- `kassa.cm.rabatt.etikett`: Cyber Monday
- `kassa.cm.rabatt.belopp`: −100 kr
- `kassa.rad.summa`: Att betala i dag

### Samtyckestext (kryssrutan)

- `kassa.bw.samtycke`:

> Jag vill att innehållet startar direkt och förstår att ångerrätten därmed inte gäller. 99 kr dras i dag, sedan 149 kr varje månad på samma datum, nästa gång {datum}, tills jag säger upp prenumerationen.

- `kassa.cm.samtycke`:

> Jag vill att innehållet startar direkt och förstår att ångerrätten därmed inte gäller. 49 kr dras i dag, sedan 149 kr varje månad på samma datum, nästa gång {datum}, tills jag säger upp prenumerationen.

### Betalknapp

- `kassa.bw.knapp`: Till betalning, 99 kr
- `kassa.cm.knapp`: Till betalning, 49 kr
- `kassa.fotnot`: Kortbetalning via Stripe. Kvitto på mejl.

### Felbesked när kampanjen tagit slut medan kassan var öppen

Visas i stället för betalknappen, innan något dras. Black Week går direkt över i Cyber Monday vid midnatt, så det finns två fall: priset har gått ner (söndag till måndag) och priset har gått upp (måndag till tisdag).

Priset upp (Cyber Monday tog slut):

- `kassa.fel.slut.rubrik`: Priset har ändrats
- `kassa.fel.slut.text`: Cyber Monday tog slut medan kassan var öppen. Jobbcoach Premium kostar nu 149 kr i månaden från första dragningen. Inget har dragits från ditt kort.
- `kassa.fel.slut.knapp`: Till betalning, 149 kr
- `kassa.fel.slut.avbryt`: Avbryt

Priset ner (Black Week gick över i Cyber Monday):

- `kassa.fel.sankt.rubrik`: Priset har ändrats
- `kassa.fel.sankt.text`: Cyber Monday började medan kassan var öppen. Första månaden kostar nu 49 kr i stället för 99 kr. Inget har dragits från ditt kort.
- `kassa.fel.sankt.knapp`: Till betalning, 49 kr
- `kassa.fel.sankt.avbryt`: Avbryt

Samtyckestexten måste laddas om med det nya beloppet innan kunden kan gå vidare, annars stämmer inte texten vi sparar i Stripe.

---

## 5. Kampanjmejlen

Två mejl. Mejl 1 går morgonen den 23 november, mejl 2 morgonen den 30 november. Mejl 2 går inte till den som köpte under Black Week.

### Mejl 1: Black Week

- `mejl.bw.amne`: Black Week: första månaden Premium för 99 kr
- `mejl.bw.forhandsrad`: Hela veckan till och med söndag. Sedan 149 kr i månaden, säg upp när du vill.
- `mejl.bw.eyebrow`: Black Week 23 till 29 november
- `mejl.bw.rubrik`: Öva inför testet. 99 kr första månaden.
- `mejl.bw.stycke1`:

> Har du ett logiktest eller I-provet framför dig? Den här veckan kostar första månaden Premium 99 kr i stället för 149 kr. Du gör övningsprov med tid, i samma format som på riktigt, och ser exakt var du tappar poäng.

- `mejl.bw.stycke2`:

> Vill du ha struktur lägger vi upp ett pass om dagen fram till ditt provdatum. CV, personliga brev, Jobbcoachen och jobbmatchningen ingår också. Allt inför ansökan på ett ställe, hela veckan till och med söndag.

- `mejl.bw.prisrad.belopp`: 99 kr
- `mejl.bw.prisrad.struket`: 149 kr
- `mejl.bw.prisrad.text`: första månaden
- `mejl.bw.knapp`: Köp Premium, 99 kr första månaden
- `mejl.bw.villkor`: Gäller till och med söndag 29 november 23.59 för konton som inte haft Premium tidigare. Efter första månaden dras 149 kr varje månad tills du säger upp, vilket du gör under Prenumeration i din profil.
- `mejl.bw.avreg.text`: Du får det här mejlet för att du har ett konto hos oss.
- `mejl.bw.avreg.lanktext`: Avregistrera dig från erbjudanden

Ämnesrad 44 tecken.

### Mejl 2: Cyber Monday

- `mejl.cm.amne`: Cyber Monday: 49 kr för första månaden, bara i dag
- `mejl.cm.forhandsrad`: Gäller till 23.59 i kväll. Sedan 149 kr i månaden, säg upp när du vill.
- `mejl.cm.eyebrow`: Cyber Monday 30 november
- `mejl.cm.rubrik`: Testet görs på nätet. Övningen också.
- `mejl.cm.stycke1`:

> I dag, och bara i dag, kostar första månaden Premium 49 kr i stället för 149 kr. Det är vårt lägsta pris i år. Vid midnatt är det borta.

- `mejl.cm.stycke2`:

> Gör övningsprovet med tid, se var du tappar poäng och få ett pass om dagen tills det är dags på riktigt. CV, personliga brev och Jobbcoachen följer med.

- `mejl.cm.prisrad.belopp`: 49 kr
- `mejl.cm.prisrad.struket`: 149 kr
- `mejl.cm.prisrad.text`: första månaden
- `mejl.cm.knapp`: Köp Premium, 49 kr första månaden
- `mejl.cm.villkor`: Gäller måndag 30 november till 23.59 för konton som inte haft Premium tidigare. Efter första månaden dras 149 kr varje månad tills du säger upp, vilket du gör under Prenumeration i din profil.
- `mejl.cm.avreg.text`: Du får det här mejlet för att du har ett konto hos oss.
- `mejl.cm.avreg.lanktext`: Avregistrera dig från erbjudanden

Ämnesrad 50 tecken.

Om "vårt lägsta pris i år": 49 kr är lägre än allt vi tagit ut för en månad Premium under året, så påståendet håller. Skriv aldrig "lägsta någonsin" eller "lägre än så blir det aldrig", eftersom avslutsflödet har erbjudit 49 kr i månaden till uppsägare.

---

## 6. Mejlvalet (samtycke till erbjudanden)

Valet heter "Erbjudanden och tips på mejl" på alla tre ställen, så att kunden känner igen det från registreringen till avregistreringen. Kvitton, påminnelser om provdatum och andra mejl om kontot påverkas inte, och det står på varje ställe.

### Kryssrutan i registreringen (frivillig, oikryssad)

- `mejlval.registrering.text`: Mejla mig erbjudanden och tips om tester och jobbsök. Avsluta när du vill.

### Under Inställningar / Profil

- `mejlval.installningar.rubrik`: Erbjudanden och tips på mejl
- `mejlval.installningar.beskrivning`: Ibland mejlar vi om kampanjer, nya tester och sådant som gör jobbsöket lättare. Kvitton och påminnelser om ditt provdatum kommer oavsett.
- `mejlval.installningar.etikett`: Ta emot erbjudanden och tips
- `mejlval.installningar.pa`: På
- `mejlval.installningar.av`: Av

### Avregistreringssidan (efter klick på länken i mejlet)

- `mejlval.avreg.rubrik`: Du är avregistrerad
- `mejlval.avreg.text`: Du får inga fler erbjudanden eller tips från oss på mejl. Kvitton, påminnelser om ditt provdatum och annat som rör kontot kommer som vanligt. Ångrar du dig? Slå på valet igen under Inställningar i din profil.
- `mejlval.avreg.knapp`: Till inställningarna
- `mejlval.avreg.sekundar`: Till startsidan
