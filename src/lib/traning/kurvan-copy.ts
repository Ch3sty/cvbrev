// src/lib/traning/kurvan-copy.ts
// Texterna på Hela kurvan (konceptets F1). Utkast ur konceptet; copywritern
// har sista ordet (spec-rummen avsnitt 9, våg 3b-listan: legendens fyra
// rader, "Pass flyttar nivån lite i taget, ommätningar mer.",
// "Personlighetstestet har ingen kurva.").

export const KURVAN = {
  brand: 'Hela kurvan',
  kontext: 'Test och datum',
  rubrik: 'Hela kurvan',
  figurer: 'Figurer och mönster',
  tomRad: 'Kurvan börjar med Nivåkollen. Sedan en punkt per pass, och en tyngre punkt varje ny nivåkoll.',
  passFlyttar: 'Passen flyttar nivån lite i taget. Nivåkollerna flyttar den mer.',
  legend: {
    rubrik: 'Så läser du kurvan',
    pass: 'Pass',
    passMeta: 'En punkt per dag. Flyttar nivån högst ett halvt steg.',
    matning: 'Nivåkoll',
    matningMeta: 'Tolv uppgifter var sjunde dag. Ger en tyngre punkt.',
    sikte: 'Målet',
    sikteMeta: 'Nivån vi föreslår att du når före provdagen. Du kan ändra den. Ingen arbetsgivare kräver den.',
    plan: 'Planerade dagar',
    planMeta: 'Ihåliga märken längst ner. Söndag är vilodag och lämnar en lucka utan att bryta dina dagar i rad.',
  },
  flerKurvor: 'Fler kurvor',
  ingenKurva: (senast: string | null) =>
    senast ? `Ingen kurva än: nivån mäts bara i figurer och mönster. Senast gjort ${senast}.` : 'Ingen kurva än: nivån mäts bara i figurer och mönster.',
  personlighet: (datum: string | null) =>
    datum ? `Personlighetstestet har ingen kurva. Profil klar ${datum}.` : 'Personlighetstestet har ingen kurva. Inga rätta svar.',
  visaProfilen: 'Visa profilen',
  gorProfilen: 'Gör profilen',
  historikLast: 'Kurvans historik visar bara den senaste punkten.',
} as const
