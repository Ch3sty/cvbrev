# Skissnot: /om-oss

Skiss: `sidor/om-oss.html`, byggd till `ut/skiss-om-oss.html`. Bilder: `bilder/om-oss-375-*`, `-412-*`, `-1440-*`. Sidans färg: indigo.

## Vad som ändras mot i dag

- **Hjälten.** Telefonen "Mitt jobbsök" med fem steg som inte finns (bland annat "Nivåkollen klar" och "dagens pass") är borta, liksom de svävande småbilderna. I stället visar hjälten det sidan handlar om: hur ett verktyg 2023 blev fyra delar i samma konto. Fyra färgade block ligger staplade och blir bredare uppåt: Personliga brev ("Här började vi"), CV, Jobbsöket och överst Rekryteringstester. Den beiga botten är utbytt mot den mörka indigofärgen.
- **Historien.** Tidslinjen är fyra kort på en väg, med en bild i varje: ett brev, två dokument, namnbytet (cvbrev.se överstruket, pil, Jobbcoach.ai) och de fyra delarnas symboler. Det fjärde kortet är märkt som nu.
- **Tre saker vi lovar.** Tre kort där löftet har en bild under texten: de tre stegen "Du klistrar in, Vi skriver, Du kopierar tillbaka och skickar" och raden "Ditt lösenord stannar hos dig"; de sex källorna som skyltar; och 0 kr bredvid 149 kr.
- **Slutet.** En indigoyta med de två talen i stor stil och kontaktrutan bredvid.

## Oförändrat för SEO

- H1 "Vi hjälper dig att nå dina karriärmål", H2 "Från cvbrev.se till Jobbcoach.ai", "Tre saker vi lovar", "Saknar du något, eller har du en fråga?" och alla sju H3, ordagrant och i samma ordning.
- Brödsmulorna Hem och Om oss. Schematyperna Organization, AboutPage och BreadcrumbList.
- Länkarna Se våra verktyg, Så började det, Skapa konto gratis och info@jobbcoach.ai.
- Löftenas texter är ordagranna utom ett ord (se nedan).

## Påståenden som bytts för att de var osanna

| I dag | I skissen |
|---|---|
| Telefonen "Mitt jobbsök": "Tre av fem steg klara", "Nivåkollen klar, dagens pass väntar", "Poäng 74 av 100, två fynd åtgärdade", "25 träffar med skälen, bästa 92 procent", "Lönefrågan inför intervjun", "Starta dagens pass" | Borttagen. Rummet heter Jobbsöket, och det har inga sådana steg. Hjälten visar de fyra delarna. |
| "Tusentals användare kom snabbare till sitt första utkast." | "Användarna kom snabbare till sitt första utkast." Sidan säger längre ned att 543 har skapat konto, så "tusentals" går inte ihop med det talet. |
| "Du provar varje verktyg utan kortuppgifter." | "Du provar det mesta utan kortuppgifter." LinkedIn-profilen, avancerad nivå och övningsproven ingår bara i Premium. |
| "jobbmatchning, rekryteringstester, LinkedIn-profilen och Jobbcoachen" | Samma fyra, med rekryteringstester först. |

## Kräver beslut

1. **"Tusentals användare"** 2023: finns det belägg från cvbrev.se-tiden kan meningen stå kvar, men då bör talet 543+ förklaras (konton på Jobbcoach.ai).
2. **Ordningen i hjältens block.** Jag har inte skrivit ut årtal på CV, Jobbsöket och Rekryteringstester, eftersom historien på sidan inte säger exakt när varje del kom. Bilden säger bara "2023: ett verktyg" och "I dag: fyra delar".
3. **Talen 543+ och 278+** hämtas ur databasen i dag och ska fortsätta göra det. Skissen visar dagens värden.
4. **Sidans färg.** Indigo som startsidan. Briefen nämner grafit för sidor utan egen del; jag valde indigo för att grafit med sitt varmgrå golv ligger för nära det svarta och beiga som ska bort.

## Filer som bygget rör

- `src/app/(public)/om-oss/OmOssSida.tsx` (hela sidan, `MILSTOLPAR`, `LOFTEN`)
- `src/components/publikt/telefon/skarmar/SkarmBana.tsx` (används inte längre här; startsidans skiss tar också bort den)
- `src/components/publikt/SvavandeObjekt.tsx`, `Objekt.tsx`, `publikt.css` (klasserna `if-*`)
- `src/app/(public)/om-oss/page.tsx` rörs inte (talen och JSON-LD).

## Förslag till grunden

- `.vagsteg li` behöver `min-width: 0` och `align-content: start`. Utan dem blir de fyra kolumnerna olika breda när en bild inte får brytas, och rubrikerna hamnar på olika höjd.
- Ett kort med text överst och en bildyta nederst (`.lofte` i sidfilen) återkommer i flera skisser och kunde vara en variant av `.kort`.
