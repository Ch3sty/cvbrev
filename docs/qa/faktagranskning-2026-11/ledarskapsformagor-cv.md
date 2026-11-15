# Faktagranskning: content/artiklar/ledarskapsformagor-cv.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, rangordningen är i stort sett riktig men tillskrivs fel källa och beskrivs som två oberoende undersökningar när det är en och samma Sifo-lista.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 12, 33, 38, 96 | "I den Sifo-undersökning som Ledarna ... refererar toppar tre saker ...: förmågan att fatta beslut, tillit och kommunikationsförmåga" | fel | Den länkade Ledarna-sidan nämner ingen Sifo-undersökning (den är Ledarnas egen åsiktstext om bra chefskap). Listan kommer från Kantar Sifo och publicerades via Vision. Ordningen där är: 1 Ger frihet under ansvar, visar tillit; 2 Är rak och tydlig; 3 Vågar ta beslut; 4 Är duktig på att kommunicera; 5 Visar uppskattning; 6 Är lyhörd; 7 Kan hantera konflikter; 8 Är duktig på att coacha; 9 Är empatisk; 10 Ger kontinuerlig feedback. Ersätt med "I en Kantar Sifo-undersökning som Vision redovisat toppar tillit listan, följt av att vara rak och tydlig, att våga ta beslut och att kommunicera väl". | Vision (betalvägg, ingressen bekräftar att tillit toppar överlägset): https://vision.se/chefenifokus/arkiv/2020/september/10-egenskaper-hos-chefer-som-rankas-hogst/ ; listan återgiven med "Källa: Kantar Sifo, Vision, Arbetslivsinstitutet" hos Västsvenska Handelskammaren: https://www.vastsvenskahandelskammaren.se/tio-egenskaper-hos-en-bra-ledare/ (sekundär, Visions sida bakom inloggning) |
| 38, 44 | "Visions genomgång ... pekar åt samma håll" / "De svenska undersökningarna är påfallande eniga" | fel | Det är samma undersökning, inte två som bekräftar varandra. Skriv "undersökningen" i singular och stryk "påfallande eniga". | Som ovan |
| 124 | Källrad: "Ledarna: Hur är en bra chef?" som källa till Sifo-listan | fel | Byt eller komplettera med Visions artikel. Ledarna-sidan kan stå kvar som källa till "trygghet i sig själv / självinsikt" som Ledarna faktiskt skriver om. | https://www.ledarna.se/om-ledarna/sa-tycker-ledarna/ledarna-tycker/ledarskapets-varde/hur-ar-en-bra-chef/ |

## Belagda påståenden
- Tillit/förtroende i topp i Visions lista (rad 38, 96): Vision, "Att kunna visa tillit toppar överlägset listan". Länk ovan.
- Beslutsförmåga och kommunikation finns bland de fyra högst rankade (plats 3 och 4). Samma lista.
- Ledarna lyfter självförtroende/trygghet och intresse för människor som kännetecken på bra chef (rad 42, "trygghet i sig själv"). Ledarna-sidan ovan.
- CV-analysen flaggar vaga egenskapsord (rad 90): kategorin "Språk och grammatik (aktiva verb, svammelord)" i src/app/(public)/verktyg/cv-analys/components/cv-analys-faq-data.ts.
- CVExample-raderna (rad 52-60) är tydligt illustrativa.

## Rättning (omgång 1, 2026-11-15)
- Rad 12, 96 (FAQ-svaret i frontmatter och FAQ-blocket): "Sifo-undersökning Ledarna refererar ... beslutsförmåga, tillit och kommunikationsförmåga" + "Visions genomgång" rättat till en undersökning: Kantar Sifo via Vision, tillit i topp följt av rak och tydlig, våga ta beslut, kommunicera väl.
- Rad 33 (sammanfattningsrutan): "enligt Ledarna och Vision" rättat till Sifo-undersökningen som Vision redovisat, med rätt ordning.
- Rad 38: rättat till Kantar Sifo/Vision med rätt rangordning; Ledarna står kvar som källa för trygghet i sig själv och intresse för människor. "Pekar åt samma håll" (två undersökningar) struket. "återkommer överallt" mildrat till "återkommer".
- Rad 44: "De svenska undersökningarna är påfallande eniga" omskrivet till singular ("Undersökningen pekar tydligt på ...").
- Rad 124 (källraden): Vision-artikeln först som källa till Sifo-listan (länk vision.se, www2 omdirigerar dit), Västsvenska Handelskammaren tillagd för hela listan (Visions sida har betalvägg), Ledarna kvar.
- updated: "2026-11-15" tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bilden berörs inte, inte omgjord.

## Andra granskningen (2026-11-15)
UNDERKÄND.

1. **Rad 13, 39 och 97**, "toppar tillit listan över vad medarbetare vill se hos en bra chef". **Säger annat än källan.** Västsvenska Handelskammaren, som är den källa i källraden som återger hela listan, skriver: "Listan är baserad på en undersökning Sifo har gjort för att undersöka vad svenskar tycker är viktiga egenskaper hos en bra chef". Visions sida (betalvägg) säger inte vilka som tillfrågades. Originaltexten hade "svenskar", som var rätt; rättningen bytte till "medarbetare". Krävs: "vad svenskar vill se hos en bra chef" på alla tre ställena. Källa: https://www.vastsvenskahandelskammaren.se/tio-egenskaper-hos-en-bra-ledare/

Kontrollerat och godtaget i övrigt: rangordningen (1 tillit, 2 rak och tydlig, 3 vågar ta beslut, 4 kommunicera) stämmer med listan; "med god marginal" bärs av Visions ingress ("toppar överlägset listan"); Ledarna skriver "trygg i dig själv" och "genuint intresse för människor". Källraden är rättad. Inga talstreck i ändrade rader.

## Svar till samordnaren
ledarskapsformagor-cv, UNDERKÄND, rad 13/39/97 säger "medarbetare" fast Sifo-undersökningen frågade svenskar i allmänhet.

## Rättning omgång 2 (2026-11-15)
- Brist 1 (rad 13, 39, 97): "vad medarbetare vill se hos en bra chef" ändrat till "vad svenskar vill se hos en bra chef" på alla tre ställena (frontmatter-FAQ, brödtext, FAQ-block). Kontrollerat själv på vastsvenskahandelskammaren.se: "Listan är baserad på en undersökning Sifo har gjort för att undersöka vad svenskar tycker är viktiga egenskaper hos en bra chef".
- Rubriker, FAQ-frågor, description: oförändrade. Underlaget för artikelbilden citerar inte meningen, bilden inte omgjord. Inga talstreck, MDX kompilerar.

## Tredje kontrollen (2026-11-15)
GODKÄND. "vad svenskar vill se hos en bra chef" på rad 13, 39 och 97, i linje med Västsvenska Handelskammaren ("vad svenskar tycker är viktiga egenskaper hos en bra chef"). FAQ i frontmatter och FAQ-block lika. Inga talstreck.
