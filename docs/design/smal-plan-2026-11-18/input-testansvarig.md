# Testansvarig om ägarens input: fritt läge som standard, studieplan vid val (2026-11-18)

## Vad som håller

Premissen stämmer. Ingången har redan "Annat eller vet inte" och ledtråden "Vet du inte, så börjar vi med det som oftast ingår", och det är den vanliga situationen. För den som inte vet är bredd rationellt, och det är ett ärligt argument: "du vet inte vilket test, därför övar du de vanliga". Det är något helt annat än att lova överföring mellan testtyper.

Intensiteten stämmer också. Planen är i dag ett pass om dagen med nio uppgifter, söndag fri och nivåkoll var sjunde dag. Det är tunt för den som betalar och har två veckor kvar. Valbar intensitet löser mer av "det ser ut som att man inte behöver göra mycket" än något i vyn.

## Vad som är riskabelt

1. **"Utvecklas inom allt, ska mätas" är inte sant i dag.** Kurva och nivåpunkter finns bara för matris. Figurserier, deduktivt, text och siffror har Nivåkollen men ingen kurva. Talserier, spatial och ordförråd har bara procent på nivåtest. Ett fritt läge med nio rader "ej mätt" är exakt den tunna känslan ägaren vill bort från. Mätningen måste byggas före läget lanseras: nivåkoll för de tre I-provsdeltesterna (bankerna har `p_prior`, så Nivåkollens formel går direkt), nivåpunkter per `test_kind` (kolumnen finns) och en kurva per deltyp.
2. **Bankerna tar slut.** Matris har 90 frågor per nivå, 30 dagars karens. Tre pass om dagen är 27 frågor; på fyra dagar är nivåns frågor genomgångna, sedan är det upprepning och minne, inte träning. Upprepade frågor räknas redan bort ur nivån, så passen blir dessutom tomma på mätvärde. Intensiteten måste styras av banken och säga det rakt: "nya frågor på din nivå om tre dagar".
3. **Nivån fladdrar.** Passet får flytta nivån 0,5. Tre pass ger 1,5 om dagen. Sätt ett dagstak på 0,5 oavsett antal pass.
4. **Aldrig ett sammanlagt tal.** Nivå per deltyp får visas bredvid varandra som profil. Ingen summa, inget "logikindex", ingen IQ-liknelse.

## Studieplanen testmässigt

- **Intensitet:** Lugn (ett pass), Normal (två), Intensiv (tre plus ett riktat). Fler pass ger fler familjer och mer tempo, inte fler nivåkoller.
- **Nivåkoll:** var sjunde dag oavsett intensitet. Tolv frågor har standardfel cirka 0,6 nivåer; tätare mätning visar brus och bränner mätfrågorna. Säg varför i vyn.
- **Övningsprov:** högst vart tredje dag under planen, alltid två och en dag före datumet. Första gången tidigt, så kurvan över provform får fler punkter.
- **Vila:** ingen tvingad vilodag, men inget straff heller. Serien pausar, bryts inte. Formordet "vilar" står kvar som ärlig signal.
- **Utan datum:** rullande sju dagar som i dag, med intensitet.
- **Vid val av test:** bara testets deltester i rotationen, resten under "Utanför ditt test" utan nyttolöfte.

## Ärlighet

Fritt läge: "övar det som oftast ingår, eftersom du inte vet". Valt test: "samma format som". Aldrig "träning på X hjälper på Y". Figurserier och matriser delar tre familjer; där får "samma mönster i annan form" stå, inget mer.

## Ordning

Mätning per deltyp först, sedan intensitet, sist läget som standard. Lanseras läget före mätningen får vi nio rader utan innehåll.
