# Omgång 3, spår E: tillägg efter granskningen

Datum 2026-10-12. Från Opus E till testansvarig. Efter `granskning.md` och `beslut.json`. Bilderna i `tillagg/`.

## Art-directors tre generatortillägg (spec 15.1)

Inget godkänt id ändrades. B2 använde redan bara tom och svart (BM5), B3 redan 90 eller 180 grader (BM5), och B4:s mönster var redan utan symmetri. Kontrollen i B4 står nu också uttryckligen i BM1 ("mönstret är symmetriskt, så spegelbilden är en vridning av det") med en fixtur. Generatorn körd om: byte-identisk för alla 32 bryter utom textbytet nedan.

## Textbytet i B1 block (granskning avsnitt 3)

| Id | Regel | Misstag |
|---|---|---|
| fsb-g-antal-03 | Fem av figurerna har fyra svarta rutor. Den som bryter har fem. | Den här följer regeln: fyra svarta rutor. |
| fsb-g-antal-07 | Fem av figurerna har tre svarta rutor. Den som bryter har fyra. | Den här följer regeln: tre svarta rutor. |

Samma id, samma figurer och facit. Bara block-varianten fick den nya mallen (`bryterTexter`, B1). `tillagg/bryter-grund/`.

## Ersättarna med samma id (`scripts/figurserier-omgang3-ersattare.mjs`)

| Id | Nytt | Kontroll |
|---|---|---|
| fs-g-antal-17 | 3×3-blockets kant, nedåt från sex | Strålarnas båda F2-nycklar på grund var tagna, och sektorhjulet uppåt till sju ger 125 noder (V11). Ny F2-kontroll i `validate-figurserier.mjs`: samma primitiv, riktning och startantal två gånger per nivå fälls (de tio befintliga paren i banken är godkända och står som upplysning). |
| fs-a-vaxl-11 | pil, 90 moturs mot 90 medurs | F9 grön; fällan "fortsätter första serien" (B) är ren |
| fs-a-vaxl-12 | orbital, två steg mot ett steg medurs | F9 grön; fällan ren |
| fs-a-vaxl-13 | duo kant + pil, ett steg medurs mot tre moturs | F9 grön; fällan ren |

F9 ligger i `sparrar.mjs` (`f9`, s0 + 3·ke ≠ s1 + 2·ko mod 8) och körs i `v7-facit-check.mjs --serie`; den fäller de tre gamla vaxl-11 till 13. Två godkända expertfrågor i banken träffas också och står som upplysning: **fs-e-vrid-02** (vinkel) och **fs-e-antal-04** (start). Där bär de andra reglerna (längd, spets, antal) fortfarande facit, men titta gärna.

Kravet "rena först" i ersättarna: minst två rena distraktorer och fällan med första seriens förlängning som ren distraktor.

## Befordran

Befordrat enligt `beslut.json` plus textbytet: bryter grund 16 (14 + antal-03, 07), bryter avancerad 16, parti 2 grund 7, parti 2 avancerad 13. De fyra ersättarna ligger kvar som kandidater tills ditt ja. Härnäst i pass och prov: grund 43, avancerad 43.
