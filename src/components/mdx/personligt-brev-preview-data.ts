/**
 * De sex breven i artiklarnas förhandsvisning (<PersonligtBrevPreview yrke="..." />),
 * flyttade ordagrant ur PersonligtBrevPreview.tsx (byggspecen våg 2, 2026-11-21:
 * artiklarnas egna brev behålls som datakälla, inte exempelsidornas). Läses av
 * förhandsvisningen (texten under arket) och av /api/public/exempel/brev
 * (nyckel=...), så att arket och texten är samma brev.
 *
 * Ren data, klientsäker.
 */

export interface ArtikelBrev {
  /** Yrket i iframens titel: "Personligt brev för undersköterska i mallen Koppar". */
  yrke: string
  namn: string
  adress: string
  telefon: string
  epost: string
  arbetsgivare: string
  roll: string
  brevText: string
}

export const ARTIKEL_BREV_NYCKLAR = ['student', 'underskoterska', 'saljare', 'ekonomiassistent', 'lagerarbetare', 'butikssaljare'] as const
export type ArtikelBrevNyckel = (typeof ARTIKEL_BREV_NYCKLAR)[number]

export const ARTIKEL_BREV: Record<ArtikelBrevNyckel, ArtikelBrev> = {
  student: {
    yrke: 'student',
    namn: 'Erik Johansson',
    adress: 'Vasagatan 8, 411 24 Göteborg',
    telefon: '073-456 78 90',
    epost: 'erik.johansson@student.gu.se',
    arbetsgivare: 'Gekås Ullared',
    roll: 'Sommarjobb som säljare',
    brevText: `Hej,

Jag söker sommarjobb som säljare på Gekås Ullared för perioden juni till augusti 2026. Som andraårsstudent på ekonomiprogrammet vid Göteborgs universitet kombinerar jag teoretisk kunskap inom marknadsföring och kommunikation med praktisk erfarenhet från kundmöten och serviceyrkande arbete. Gekås rykte som Sveriges mest besökta affär och ert höga tempo lockar mig. Jag vill lära mig retail i en miljö där ingen dag är den andra lik.

Under mitt sommarjobb på Café Lilla Paris serverade jag 200+ kunder per dag i ett högt tempo. Jag hanterade kassasystem, beställningar och konfliktlösning när kunder var missnöjda med väntetider. Ett konkret exempel var när vårt kösystem krashade en lördagseftermiddag. Jag tog initiativ att manuellt notera ordrar på papper, kommunicerade tydligt med stressade kunder om vad som hänt och fick köket att flyta igen. Min chef lyfte fram att jag behöll lugnet och löste problemet istället för att vänta på hjälp.

Mina kurser i marknadsföring och kommunikation ger mig verktyg att förstå kundbeteende och säljteknik. Jag är social, flexibel och lär mig snabbt. Kolleger beskriver mig som någon som tar ansvar och bidrar till god stämning även när det är stressigt.

Jag är tillgänglig för arbete heltid juni–augusti och kan även arbeta helger. Hör gärna av er så berättar jag mer!

Med vänlig hälsning,
Erik Johansson`
  },
  underskoterska: {
    yrke: 'undersköterska',
    namn: 'Lisa Andersson',
    adress: 'Storgatan 12, 123 45 Stockholm',
    telefon: '070-123 45 67',
    epost: 'lisa.andersson@email.se',
    arbetsgivare: 'Karolinska Universitetssjukhuset',
    roll: 'Undersköterska inom geriatrik',
    brevText: `Hej,

Jag söker tjänsten som undersköterska inom geriatrik på Karolinska Universitetssjukhuset. Med fem års erfarenhet av personcentrerad vård och ett genuint engagemang för äldres välmående är jag övertygad om att min kompetens skulle passa väl i ert team.

Under mina år på Stockholms äldreboende har jag utvecklat gedigen erfarenhet av ADL-stöd, demensvård och palliativ omvårdnad. Jag har medicinsk delegering för insulin, subkutana injektioner och PEG-sondmatning. Ett konkret exempel är när jag uppmärksammade tidiga tecken på urinvägsinfektion hos en patient med demens, kontaktade läkare och startade behandling innan tillståndet förvärrades.

Det jag uppskattar mest med vårdyrket är relationerna med patienterna. Att få tid att sitta ner med en orolig patient, lyssna på deras berättelser och skapa trygghet i vardagen är det som driver mig.

Jag ser fram emot att diskutera hur jag kan bidra till er verksamhet. Tveka inte att kontakta mig på 070-123 45 67 eller lisa.andersson@email.se.

Varma hälsningar,
Lisa Andersson`
  },
  saljare: {
    yrke: 'säljare',
    namn: 'Marcus Lindqvist',
    adress: 'Kungsgatan 45, 111 56 Stockholm',
    telefon: '076-234 56 78',
    epost: 'marcus.lindqvist@email.se',
    arbetsgivare: 'Telia Sverige AB',
    roll: 'Account Manager B2B',
    brevText: `Hej,

Jag söker tjänsten som Account Manager B2B på Telia. Med sex års erfarenhet av B2B-försäljning inom telekom och IT har jag konsekvent överträffat säljmål och byggt långsiktiga kundrelationer som genererat merförsäljning.

På min nuvarande tjänst hos Telenor ansvarar jag för en kundportfölj värd 45 MSEK årligen. Under 2024 ökade jag försäljningen med 23% genom strategisk bearbetning av befintliga kunder och identifiering av nya affärsmöjligheter. Mitt arbetssätt bygger på att förstå kundens verksamhet på djupet innan jag presenterar lösningar.

Vad som tilltalar mig med Telia är er satsning på 5G-lösningar för företag och ert fokus på hållbar digitalisering. Jag vill vara med och hjälpa svenska företag att ta nästa steg i sin digitala transformation.

Jag ser fram emot att diskutera hur jag kan bidra till Telias fortsatta framgång.

Med vänlig hälsning,
Marcus Lindqvist`
  },
  ekonomiassistent: {
    yrke: 'ekonomiassistent',
    namn: 'Anna Bergström',
    adress: 'Drottninggatan 23, 411 14 Göteborg',
    telefon: '070-987 65 43',
    epost: 'anna.bergstrom@email.se',
    arbetsgivare: 'Volvo Group',
    roll: 'Ekonomiassistent',
    brevText: `Hej,

Jag söker tjänsten som ekonomiassistent på Volvo Group. Med fyra års erfarenhet av löpande bokföring, leverantörsreskontra och månadsavstämningar i en internationell miljö är jag redo för nästa steg i min karriär.

På min nuvarande tjänst hos SKF hanterar jag dagligen bokföring i SAP för tre dotterbolag, processar 400+ leverantörsfakturor per månad och ansvarar för valutaomräkningar. Jag har effektiviserat avstämningsprocessen vilket sparar två arbetsdagar per månad.

Volvos position som global industrikoncern och era möjligheter till kompetensutveckling tilltalar mig starkt. Jag vill bidra med min erfarenhet av SAP och internationell redovisning till ert team.

Jag ser fram emot att berätta mer om hur jag kan bidra till ekonomiavdelningen.

Med vänlig hälsning,
Anna Bergström`
  },
  lagerarbetare: {
    yrke: 'lagerarbetare',
    namn: 'Johan Eriksson',
    adress: 'Industrivägen 15, 721 30 Västerås',
    telefon: '072-345 67 89',
    epost: 'johan.eriksson@email.se',
    arbetsgivare: 'PostNord Logistics',
    roll: 'Lagermedarbetare',
    brevText: `Hej,

Jag söker tjänsten som lagermedarbetare på PostNord Logistics i Västerås. Med tre års erfarenhet av lagerjobb och truckkort A+B är jag van vid högt tempo och noggrann godshantering.

På mitt nuvarande jobb hos DHL hanterar jag dagligen 150+ paket, kör motviktstruck och skjutstativtruck, och arbetar med WMS-system för inventering och plockning. Jag har utbildning i säker godshantering och prioriterar alltid arbetsmiljö och ergonomi.

PostNords satsning på hållbar logistik och era moderna anläggningar lockar mig. Jag är flexibel med arbetstider och kan börja omgående.

Hör gärna av er så berättar jag mer!

Med vänlig hälsning,
Johan Eriksson`
  },
  butikssaljare: {
    yrke: 'butikssäljare',
    namn: 'Emma Karlsson',
    adress: 'Storgatan 78, 252 23 Helsingborg',
    telefon: '073-567 89 01',
    epost: 'emma.karlsson@email.se',
    arbetsgivare: 'IKEA Helsingborg',
    roll: 'Säljare',
    brevText: `Hej,

Jag söker tjänsten som säljare på IKEA Helsingborg. Med två års erfarenhet från detaljhandeln och ett genuint intresse för inredning vill jag bidra till att skapa en bra köpupplevelse för era kunder.

På Jysk har jag arbetat med allt från kundservice och kassaarbete till varupåfyllning och visual merchandising. Jag har konsekvent fått goda kundbetyg och bidragit till att vår butik nådde säljmålen varje månad under 2024.

IKEAs vision om att skapa en bättre vardag för de många människorna inspirerar mig. Jag är van vid högt tempo, flexibel med arbetstider och trivs i teamarbete.

Jag ser fram emot att höra från er!

Med vänlig hälsning,
Emma Karlsson`
  }
}

/** Sant för en av de sex nycklarna. */
export function arArtikelBrevNyckel(v: unknown): v is ArtikelBrevNyckel {
  return typeof v === 'string' && (ARTIKEL_BREV_NYCKLAR as readonly string[]).includes(v)
}
