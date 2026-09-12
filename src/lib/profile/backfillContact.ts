/**
 * Backfill av kontaktuppgifter från parsat CV
 * (docs/plan-inloggat-saljflode.md, punkt 2).
 *
 * Parsern plockar redan ut telefon och ort ur uppladdade CV. Ingenting skrev
 * tillbaka dem, samtidigt som CV-byggarens steg 0 kräver telefon och 56
 * procent av kontona saknar den. Vi har alltså datan och kastade bort den.
 *
 * Regel: skriv aldrig över ett värde användaren själv angett. Vi fyller bara
 * tomma fält, och vi returnerar vad vi fyllde så gränssnittet kan berätta det.
 */

import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface BackfilledContact {
  phone?: string;
  location?: string;
}

/** Tomt fält: null, tom sträng eller triggerns gamla platshållare. */
function isBlank(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'string') return true;
  const trimmed = value.trim();
  return trimmed === '' || trimmed.toLowerCase() === 'ej angivet';
}

/**
 * Plockar ut ort ur en adressrad. CV skriver ofta "Storgatan 1, 411 23
 * Göteborg" och vi vill bara ha "Göteborg". Sista segmentet efter komma,
 * med eventuellt postnummer bortskalat.
 */
export function extractCity(address: unknown): string | null {
  if (typeof address !== 'string') return null;
  const raw = address.trim();
  if (!raw) return null;

  const lastSegment = raw.split(',').pop()?.trim() ?? '';
  // Postnummer i svensk form: "411 23 Göteborg" eller "41123 Göteborg".
  const withoutPostal = lastSegment.replace(/^\d{3}\s?\d{2}\s+/, '').trim();
  const city = withoutPostal || lastSegment;

  if (!city || city.length > 64) return null;
  // En ort innehåller inte siffror. Är det bara en gatuadress hoppar vi över.
  if (/\d/.test(city)) return null;
  return city;
}

/** Normaliserar telefonnummer lätt utan att förstöra landskoder. */
export function normalizePhone(phone: unknown): string | null {
  if (typeof phone !== 'string') return null;
  const trimmed = phone.trim();
  if (!trimmed) return null;
  // Minst sju siffror för att räknas som ett telefonnummer.
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return null;
  if (trimmed.length > 32) return null;
  return trimmed;
}

/**
 * Fyller tomma profilfält från parsad personalInfo. Körs med service role
 * eftersom den anropas från serverrutter direkt efter parsning.
 *
 * Returnerar bara de fält som faktiskt skrevs, så anroparen kan visa
 * "vi hittade också X" utan att ljuga när ingenting ändrades.
 */
export async function backfillProfileContact(
  userId: string,
  personalInfo: { phone?: unknown; address?: unknown } | null | undefined
): Promise<BackfilledContact> {
  if (!userId || !personalInfo) return {};

  const parsedPhone = normalizePhone(personalInfo.phone);
  const parsedCity = extractCity(personalInfo.address);
  if (!parsedPhone && !parsedCity) return {};

  try {
    // Admin-klienten är generiskt typad här, så vi läser raden som ett
    // öppet objekt i stället för att tvinga in den i en genererad typ.
    const admin = getSupabaseAdmin() as unknown as {
      from: (table: string) => {
        select: (cols: string) => {
          eq: (col: string, val: string) => {
            single: () => Promise<{
              data: Record<string, unknown> | null;
              error: unknown;
            }>;
          };
        };
        update: (values: Record<string, string>) => {
          eq: (col: string, val: string) => Promise<{ error: unknown }>;
        };
      };
    };

    const { data: profile, error } = await admin
      .from('profiles')
      .select('phone, location')
      .eq('id', userId)
      .single();

    if (error || !profile) return {};

    const updates: Record<string, string> = {};
    const filled: BackfilledContact = {};

    if (parsedPhone && isBlank(profile.phone)) {
      updates.phone = parsedPhone;
      filled.phone = parsedPhone;
    }
    if (parsedCity && isBlank(profile.location)) {
      updates.location = parsedCity;
      filled.location = parsedCity;
    }

    if (Object.keys(updates).length === 0) return {};

    // Märker att fälten fyllts i automatiskt, så profilsidan kan visa "hämtat från ditt CV".
    updates.contact_parsed_at = new Date().toISOString();

    const { error: updateError } = await admin
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (updateError) {
      console.error('backfillProfileContact update error:', updateError);
      return {};
    }

    return filled;
  } catch (err) {
    // Backfillen får aldrig sänka en CV-parsning som annars lyckats.
    console.error('backfillProfileContact error:', err);
    return {};
  }
}
