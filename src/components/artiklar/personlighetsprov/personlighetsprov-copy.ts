/**
 * All text i personlighetsprovet, ordagrant ur copytabellen i
 * docs/design/rod-trad-prov-2026-09-24.html (avsnitten "Personlighetsprovet
 * (publikt)" och "Sidan /verktyg/personlighetstest").
 *
 * Påståendena och de femton faktormeningarna är innehåll och bor i
 * src/lib/personlighet/. Svenska facktermer, vi-form, inga talstreck.
 */

export const ANTAL = 20

export const COPY = {
  eyebrow: 'Personlighetsprovet',
  rubrik: 'Se vad rekryteraren läser ut av dig',
  ingress:
    'Tjugo påståenden, ungefär två minuter. Du får en profil på de fem faktorerna och en rad per faktor om hur en rekryterare läser den.',
  steg: {
    raknare: (n: number) => `Påstående ${n} av ${ANTAL}`,
    hoger: 'Inga rätt eller fel',
    klart: 'Klart',
  },
  instruktion: 'Tänk på hur du är på jobbet, och svara med första rimliga svaret.',
  reglage: {
    etikett: 'Hur väl stämmer påståendet',
    tom: 'Tryck på ett läge',
    /** Skärmläsarens tillägg efter lägets ord: "2 av 5". */
    lage: (n: number) => `${n} av 5`,
  },
  tillbaka: 'Föregående påstående',
  sparas: 'Svar sparas i panelen',
  fotnot: 'Inget konto behövs. Svaren sparas i sju dagar så att du kan hämta hela tolkningen.',
  laddar: { rubrik: 'Vi räknar ihop din profil', meta: 'Tar en sekund.' },
  resultat: { eyebrow: 'Din profil' },
  segment: (n: number) => `${n} av 5`,
  last: {
    kravprofiler: 'Så läses din profil mot sex vanliga kravprofiler',
    intervju: 'Det du kan säga på intervjun, faktor för faktor',
    omvanda: 'De tio påståendena som var omvända, och hur konsekvent du svarade',
    sr: 'Du ser hela tolkningen när du skapat ett konto.',
  },
  sparr: {
    rubrik: 'Spara profilen och se hela tolkningen',
    text: 'Skapa ett gratiskonto så får du profilen läst mot sex vanliga kravprofiler, vad du kan säga på intervjun och vilka påståenden som var omvända. Vi sparar den inför intervjun, och hela testet med 50 påståenden ingår.',
    knapp: 'Skapa konto gratis',
    villkor: 'Inget kreditkort · Avsluta när du vill',
    igen: 'Gör om provet',
  },
  inloggad: {
    rubrik: 'Profilen ligger i ditt konto',
    text: 'Där finns hela tolkningen, och hela testet med 50 påståenden.',
    knapp: 'Se hela tolkningen',
  },
  fel: {
    server: {
      rubrik: 'Vi kunde inte räkna ihop profilen just nu',
      text: 'Dina svar finns kvar. Försök igen om en stund.',
      lank: 'Försök igen',
    },
    natverk: {
      rubrik: 'Vi nådde inte servern',
      text: 'Kontrollera uppkopplingen och försök igen. Dina svar finns kvar.',
      lank: 'Försök igen',
    },
  },
  kvot: {
    ip: 'Tre prov på ett dygn räcker för en profil. Med ett gratiskonto gör du hela testet med 50 påståenden och sparar resultatet.',
  },
} as const

/** Sidan /verktyg/personlighetstest. */
export const SIDA = {
  title: 'Personlighetstest gratis: vad rekryteraren läser ut av dig',
  h1: 'Personlighetstest, gratis och utan konto',
  description:
    'Tjugo påståenden på femfaktormodellen, samma modell som MAP och de flesta svenska rekryteringstest. Din profil direkt, med en rad per faktor.',
} as const
