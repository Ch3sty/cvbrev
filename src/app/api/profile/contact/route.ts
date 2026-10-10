import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { arGiltigEpost, dokumentEpost, EPOST_MAX } from '@/lib/profile/dokumentEpost';
import {
  lasKontaktIStrukturerad,
  sammaTelefon,
  sammaText,
  sattKontaktIStrukturerad,
} from '@/lib/profile/dokumentKontakt';
import { captureServer, vantaMedTak } from '@/lib/analytics/server';

/**
 * PATCH /api/profile/contact
 *
 * Kontaktuppgifterna i CV och brev: namn, telefon, ort och e-post. Anropas
 * från kortet "Komplettera profilen", profilsidans CV-sektion och raden
 * "I dokumentet" vid CV-mallen och brevflödet (KontaktuppgifterRad).
 *
 * Fälten:
 *  - full_name, phone, location: text. Tom sträng hoppas över (kortet skickar
 *    bara ifyllda fält). null tömmer telefon och ort; namnet går inte att tömma.
 *  - contact_email: adressen i dokument. Tom eller null betyder kontoadressen
 *    och sparas som null. Ingen verifiering: adressen används bara i
 *    användarens egna dokument.
 *  - visa_i_brev (standard true): den som fyller i telefon eller ort här vill
 *    ha dem i brevhuvudet, så togglarna slås på. Profilsidan skickar false,
 *    där finns egna togglar.
 *  - cv_id: CV:t som raden vid CV-mallen gäller. Dess sparade uppgifter sätts
 *    till de nya värdena, eftersom det som står i CV:t vinner i PDF:en.
 *  - kalla: varifrån ändringen kom, bara för mätningen.
 *
 * Efter sparningen följer CV:n med: där ett fält i structured_data fortfarande
 * har profilens gamla värde (alltså kom från förifyllningen) sätts det nya.
 * Värden användaren skrivit annorlunda i ett CV lämnas orörda.
 * Regeln bor i src/lib/profile/dokumentKontakt.ts.
 *
 * RLS begränsar update till egen rad, så vi kör med användarens egen klient
 * och behöver ingen service role här. Inga premium- eller Stripe-kolumner rörs.
 */

export const dynamic = 'force-dynamic';

const MAX_LENGTHS: Record<string, number> = {
  full_name: 120,
  phone: 32,
  location: 64,
};

type Field = keyof typeof MAX_LENGTHS;

const ALLOWED: Field[] = ['full_name', 'phone', 'location'];
const TOMBARA: Field[] = ['phone', 'location'];

const KALLOR = ['rad_cv', 'rad_brev', 'profil', 'kort'] as const;
type Kalla = (typeof KALLOR)[number];

type ProfilRad = {
  full_name: string | null;
  phone: string | null;
  location: string | null;
  email: string | null;
  contact_email: string | null;
  include_phone_in_letters: boolean | null;
  include_location_in_letters: boolean | null;
};

const PROFIL_KOLUMNER =
  'full_name, phone, location, email, contact_email, include_phone_in_letters, include_location_in_letters';

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }

    const updates: Record<string, string | boolean | null> = {};

    for (const field of ALLOWED) {
      if (!(field in body)) continue;
      const raw = body[field];
      if (raw === undefined) continue;
      if (raw === null) {
        if (TOMBARA.includes(field)) updates[field] = null;
        continue;
      }
      if (typeof raw !== 'string') {
        return NextResponse.json({ error: `Fältet ${field} måste vara text.`, field }, { status: 400 });
      }
      const value = raw.trim();
      if (!value) continue;
      if (value.length > MAX_LENGTHS[field]) {
        return NextResponse.json({ error: `Fältet ${field} är för långt.`, field }, { status: 400 });
      }
      if (field === 'full_name' && value.length < 2) {
        return NextResponse.json({ error: 'Namnet är för kort.', field }, { status: 400 });
      }
      updates[field] = value;
    }

    // E-post i CV och brev. Tom betyder kontoadressen.
    let nyDokumentEpost: string | null | undefined;
    if ('contact_email' in body) {
      const raw = body.contact_email;
      if (raw !== null && typeof raw !== 'string') {
        return NextResponse.json({ error: 'Adressen måste vara text.' }, { status: 400 });
      }
      const value = (raw ?? '').trim();
      if (value && (value.length > EPOST_MAX || !arGiltigEpost(value))) {
        return NextResponse.json(
          { error: 'Det ser inte ut som en e-postadress.', field: 'contact_email' },
          { status: 400 }
        );
      }
      const konto = (user.email ?? '').trim().toLowerCase();
      // Samma som kontoadressen betyder samma sak som tomt: följ kontot.
      nyDokumentEpost = value && value.toLowerCase() !== konto ? value : null;
      updates.contact_email = nyDokumentEpost;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Inget att spara.' }, { status: 400 });
    }

    const cvId = typeof body.cv_id === 'string' && body.cv_id ? body.cv_id : null;
    const kalla: Kalla = KALLOR.includes(body.kalla as Kalla) ? (body.kalla as Kalla) : 'kort';

    // Den som fyller i telefon eller ort här vill ha dem i brevhuvudet.
    // Tömda fält stängs av, så brevet inte får en tom rad.
    if (body.visa_i_brev !== false) {
      if ('phone' in updates) updates.include_phone_in_letters = Boolean(updates.phone);
      if ('location' in updates) updates.include_location_in_letters = Boolean(updates.location);
    }

    // Föregående värden: för mätningen och för att se vilka CV:n som följer med.
    const { data: foreData } = await supabase
      .from('profiles')
      .select(PROFIL_KOLUMNER)
      .eq('id', user.id)
      .maybeSingle();
    const fore = (foreData as ProfilRad | null) ?? null;

    let hadeEgenForut = false;
    if (nyDokumentEpost) {
      const tidigare = fore?.contact_email ?? null;
      hadeEgenForut = Boolean(tidigare);
      if (tidigare && tidigare.toLowerCase() === nyDokumentEpost.toLowerCase()) {
        // Oförändrad: spara ändå, men mät inte en ändring som inte skett.
        nyDokumentEpost = undefined;
      }
    }

    const { data: sparadData, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select(PROFIL_KOLUMNER)
      .single();

    if (updateError) {
      console.error('profile/contact update error:', updateError.code);
      return NextResponse.json({ error: 'Kunde inte spara.' }, { status: 500 });
    }
    const sparad = sparadData as ProfilRad;

    // CV:n följer med. Fel här får aldrig fälla sparningen av profilen.
    let cvUppdaterade = 0;
    let valtCv: { id: string; structured_data: unknown } | null = null;
    try {
      const resultat = await foljMedICv(supabase, user, fore, sparad, body, cvId);
      cvUppdaterade = resultat.antal;
      valtCv = resultat.valtCv;
    } catch (e) {
      console.error('profile/contact cv-följning:', e instanceof Error ? e.message : e);
    }

    const matning: Promise<unknown>[] = [];
    if (nyDokumentEpost) {
      matning.push(
        captureServer('document_email_changed', user.id, {
          differs_from_account: true,
          had_custom_before: hadeEgenForut,
        })
      );
    }
    const andradeFalt: ('namn' | 'telefon' | 'ort')[] = [];
    if ('full_name' in updates && !sammaText(fore?.full_name, sparad.full_name)) andradeFalt.push('namn');
    if ('phone' in updates && (fore?.phone ?? '') !== (sparad.phone ?? '')) andradeFalt.push('telefon');
    if ('location' in updates && (fore?.location ?? '') !== (sparad.location ?? '')) andradeFalt.push('ort');
    if (andradeFalt.length > 0) {
      matning.push(
        captureServer('document_contact_changed', user.id, {
          fields: andradeFalt,
          source: kalla,
          cv_updated: cvUppdaterade,
        })
      );
    }
    if (matning.length > 0) await vantaMedTak(Promise.all(matning));

    return NextResponse.json({
      saved: Object.keys(updates),
      contact_email: sparad.contact_email ?? null,
      profil: sparad,
      cv: valtCv,
      cv_uppdaterade: cvUppdaterade,
    });
  } catch (error) {
    console.error('profile/contact error:', error);
    return NextResponse.json({ error: 'Kunde inte spara.' }, { status: 500 });
  }
}

/**
 * Flyttar in de nya värdena i användarens CV:n. Ett fält byts när det har
 * profilens gamla värde. I CV:t som raden gäller (cv_id) sätts alla fält som
 * skickades, eftersom användaren ändrade dem just för det CV:t.
 */
async function foljMedICv(
  supabase: ReturnType<typeof createServerClient>,
  user: { id: string; email?: string | null },
  fore: ProfilRad | null,
  efter: ProfilRad,
  body: Record<string, unknown>,
  cvId: string | null
): Promise<{ antal: number; valtCv: { id: string; structured_data: unknown } | null }> {
  const foreEpost = dokumentEpost(fore, user);
  const efterEpost = dokumentEpost(efter, user);
  const namnAndrat = !sammaText(fore?.full_name, efter.full_name) && Boolean(efter.full_name);
  const telAndrad = (fore?.phone ?? '') !== (efter.phone ?? '');
  const ortAndrad = (fore?.location ?? '') !== (efter.location ?? '');
  const epostAndrad = !sammaText(foreEpost, efterEpost);

  if (!namnAndrat && !telAndrad && !ortAndrad && !epostAndrad && !cvId) {
    return { antal: 0, valtCv: null };
  }

  const { data: cvs, error } = await supabase
    .from('cv_texts')
    .select('id, structured_data')
    .eq('user_id', user.id);
  if (error) throw new Error(error.message);

  let antal = 0;
  let valtCv: { id: string; structured_data: unknown } | null = null;

  for (const cv of (cvs ?? []) as { id: string; structured_data: unknown }[]) {
    const nu = lasKontaktIStrukturerad(cv.structured_data);
    if (!nu) continue;
    const patch: { fullName?: string; email?: string; phone?: string | null; address?: string | null } = {};

    if (cv.id === cvId) {
      if ('full_name' in body && efter.full_name) patch.fullName = efter.full_name;
      if ('phone' in body) patch.phone = efter.phone ?? '';
      if ('location' in body) patch.address = efter.location ?? '';
      if ('contact_email' in body) patch.email = efterEpost;
    } else {
      if (namnAndrat && fore?.full_name && sammaText(nu.fullName, fore.full_name)) patch.fullName = efter.full_name ?? '';
      if (telAndrad && fore?.phone && sammaTelefon(nu.phone, fore.phone)) patch.phone = efter.phone ?? '';
      if (ortAndrad && fore?.location && sammaText(nu.address, fore.location)) patch.address = efter.location ?? '';
      if (epostAndrad && foreEpost && sammaText(nu.email, foreEpost)) patch.email = efterEpost;
    }

    if (Object.keys(patch).length === 0) {
      if (cv.id === cvId) valtCv = { id: cv.id, structured_data: cv.structured_data };
      continue;
    }
    const ny = sattKontaktIStrukturerad(cv.structured_data, patch);
    if (!ny) continue;
    const { error: cvFel } = await supabase
      .from('cv_texts')
      .update({ structured_data: ny })
      .eq('id', cv.id)
      .eq('user_id', user.id);
    if (cvFel) {
      console.error('profile/contact cv-uppdatering:', cvFel.code);
      continue;
    }
    antal++;
    if (cv.id === cvId) valtCv = { id: cv.id, structured_data: ny };
  }

  return { antal, valtCv };
}
