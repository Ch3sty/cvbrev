// src/lib/traning/rutter.ts
// Sidorna i Rekryteringstester, på ett ställe. Hemvyn (våg 2) länkar hit;
// passflödet, mätningen och genomgången byggs i våg 3b, och om de hamnar
// på andra adresser ändras de här och ingen annanstans.

export const TRANING_RUTT = {
  hem: '/dashboard/tester',
  /** Ingången E1 till E3 och "Test och datum". steg=2 öppnar leverantören, steg=3 datumet. */
  installningar: '/dashboard/tester/installningar',
  installningarSteg: (steg: 1 | 2 | 3) => `/dashboard/tester/installningar?steg=${steg}`,
  kurvan: '/dashboard/tester/kurvan',
  alla: '/dashboard/tester/alla',
  provlaget: '/dashboard/tester/matrislogik-prov',
  /** Passflödet (våg 3b): mätning, dagens pass, riktat pass och generalrepetition. */
  matning: '/dashboard/tester/pass?typ=matning',
  pass: '/dashboard/tester/pass?typ=pass',
  riktat: (family: string) => `/dashboard/tester/pass?typ=riktat&familj=${encodeURIComponent(family)}`,
  general: '/dashboard/tester/pass?typ=general',
  /** Uppvärmningen på provdagen, tre frågor som inte sparas. */
  uppvarmning: '/dashboard/tester/pass?typ=uppvarmning',
  /** Genomgången av ett slutfört pass (våg 3b, P4). */
  genomgang: (sessionId: string) => `/dashboard/tester/pass/${encodeURIComponent(sessionId)}`,
  personlighet: '/dashboard/tester/personlighet-grund',
  intervju: '/dashboard/intervju',
  brev: '/dashboard/mina-brev',
  jobbsok: '/dashboard',
} as const;
