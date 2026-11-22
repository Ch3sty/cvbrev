// src/lib/recruiter/orgnummer.ts
//
// Svenskt organisationsnummer: tio siffror (NNNNNN-NNNN), tredje siffran
// minst 2 och sista siffran en kontrollsiffra enligt Luhn. Används av
// registreringen för rekryterare.

/** "5566778899" eller "556677 8899" blir "556677-8899". Annat lämnas som det är. */
export function normaliseraOrgnummer(value: string): string {
  const cleaned = value.replace(/\s/g, '');
  if (/^\d{10}$/.test(cleaned)) return `${cleaned.slice(0, 6)}-${cleaned.slice(6)}`;
  return cleaned;
}

/** Luhn över tio siffror: varannan siffra från vänster dubblas. */
export function luhnStammer(siffror: string): boolean {
  if (!/^\d{10}$/.test(siffror)) return false;
  let summa = 0;
  for (let i = 0; i < 10; i++) {
    let v = Number(siffror[i]);
    if (i % 2 === 0) {
      v *= 2;
      if (v > 9) v -= 9;
    }
    summa += v;
  }
  return summa % 10 === 0;
}

/**
 * Exempelnummer som ofta står i formulär och guider. 556677-8899 var vår egen
 * platshållare och håller både form och kontrollsiffra, så den måste stoppas
 * för sig.
 */
const EXEMPELNUMMER = new Set(['5566778899', '5561234567', '5560000000', '5555555555']);

/** Felet som en mening till användaren, eller null när numret håller. */
export function orgnummerFel(value: string): string | null {
  const normaliserat = normaliseraOrgnummer(value.trim());
  if (!/^\d{6}-\d{4}$/.test(normaliserat)) {
    return 'Organisationsnumret ska ha tio siffror, skrivet NNNNNN-NNNN.';
  }
  const siffror = normaliserat.replace('-', '');
  if (Number(siffror[2]) < 2) {
    return 'Det här ser inte ut som ett organisationsnummer: den tredje siffran är alltid 2 eller högre. Kontrollera numret.';
  }
  if (!luhnStammer(siffror)) {
    return 'Organisationsnumret stämmer inte. Kontrollera att alla siffror är rätt.';
  }
  if (EXEMPELNUMMER.has(siffror)) {
    return 'Det där är ett exempelnummer. Fyll i ert eget organisationsnummer.';
  }
  return null;
}
