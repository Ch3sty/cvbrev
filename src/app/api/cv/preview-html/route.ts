/**
 * /api/cv/preview-html
 *
 * Lattvikts-endpoint som returnerar genererad HTML for live-preview pa
 * /dashboard/cv-mallar (utan Puppeteer/PDF-generering).
 *
 * Anvander samma server-parser och mallrenderare som /api/cv/generate-formatted
 * for att garantera att preview matchar PDF-output exakt.
 *
 * Body: { template, structuredData | cvText, val?, cvId? }. Svar: { html, mall }
 * dar mall ar mallens id efter alias (docs/qa/mallsystemet-2026-11-16.md).
 */
import { cookies } from 'next/headers';
import { arPlatshallareTitel, kontaktForCv } from '@/lib/profile/dokumentKontakt';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { renderaMallHtml } from '@/lib/cv/rendera-mall-html';
import { losMallId } from '@/lib/cv/mallar/alias';
import { tolkaVal, typsnittIdForFamilj } from '@/lib/cv/mallar/val';
import { lasSparadeRubriker } from '@/lib/cv/mallar/sparade-rubriker';
import { parseSwedishCVContent } from '@/lib/cv/swedish-cv-content-parser';
import { normalizeStructuredData } from '@/lib/cv/normalize-structured-data';
import type { CVMetadata } from '@/lib/cv/cv-metadata';

interface PreviewRequest {
  template: string;
  cvText?: string;
  /**
   * Pre-parsed structured data fran db. Kan vara CVMetadata (nyare CV:n)
   * eller gammal ParsedCV (aldre CV:n) - normalizeStructuredData hanterar
   * bada formaten och faller tillbaka till regex-parser om strukturen
   * inte gar att tolka.
   */
  structuredData?: unknown;
  templateOptions?: {
    includePhoto?: boolean;
    includeLinkedIn?: boolean;
  };
  fontFamily?: string;
  /** Valen i alla mallar (MallVal i src/lib/cv/mallar/kontrakt.ts). */
  val?: unknown;
  /** CV:ts id i cv_texts, så att sparade rubriker (section_titles) följer med. */
  cvId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PreviewRequest = await request.json();
    const { template, cvText, structuredData, templateOptions = {}, fontFamily, cvId } = body;
    const val = tolkaVal(body.val, {
      includePhoto: (templateOptions as { includePhoto?: boolean }).includePhoto,
      fontId: typsnittIdForFamilj(fontFamily),
    });

    if (!template || (!cvText && !structuredData)) {
      return NextResponse.json(
        { error: 'Template och antingen cvText eller structuredData krävs' },
        { status: 400 }
      );
    }

    // Auth-koll: bara inloggade anvandare far preview-API
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Inte inloggad' }, { status: 401 });
    }

    // Anvand structuredData direkt om det finns OCH ar i ratt format.
    // Aldre CV:n kan vara sparade i ParsedCV-format - vi normaliserar.
    // Om data ar trasig faller vi tillbaka till regex-parser pa cvText.
    let cvData: CVMetadata | null = null;
    let kontaktKalla: 'strukturerad' | 'text' = 'strukturerad';
    if (structuredData) {
      cvData = normalizeStructuredData(structuredData);
    }
    if (!cvData) {
      if (!cvText) {
        return NextResponse.json(
          { error: 'CV-data saknas eller kan inte tolkas' },
          { status: 400 }
        );
      }
      try {
        cvData = await parseSwedishCVContent(cvText);
        kontaktKalla = 'text';
      } catch (err) {
        console.error('Fel vid CV-parsing i preview:', err);
        return NextResponse.json(
          { error: 'Kunde inte tolka CV-text' },
          { status: 500 }
        );
      }
    }

    // Berika med profile-data sa preview matchar PDF (foto + LinkedIn)
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('profile_photo_url, linkedin_url, full_name, email, contact_email, phone, location')
      .eq('id', user.id)
      .single();

    if (userProfile && cvData.personalInfo) {
      if (userProfile.profile_photo_url) {
        cvData.personalInfo.profilePhotoUrl = userProfile.profile_photo_url;
      }
      if (userProfile.linkedin_url) {
        if (!cvData.personalInfo.linkedIn && !(cvData.personalInfo as any).linkedin) {
          (cvData.personalInfo as any).linkedin = userProfile.linkedin_url;
        }
      }
      // Samma regel som PDF:en i generate-formatted: det användaren skrivit i
      // CV:t vinner, profilen fyller tomma fält och platshållare.
      const kontakt = kontaktForCv(cvData.personalInfo, userProfile, user, kontaktKalla);
      cvData.personalInfo.fullName = kontakt.fullName;
      cvData.personalInfo.email = kontakt.email;
      cvData.personalInfo.phone = kontakt.phone;
      cvData.personalInfo.address = kontakt.address;
      if (arPlatshallareTitel(cvData.personalInfo.title)) cvData.personalInfo.title = '';
    }

    // Rubrikerna CV:t sparat (cv_texts.section_titles); valet i anropet går före.
    if (cvId) {
      const sparade = await lasSparadeRubriker(supabase, user.id, cvId);
      if (sparade) cvData.sectionTitles = sparade;
    }

    // Samma renderare som PDF:en (src/lib/cv/rendera-mall-html.ts). Gamla
    // mall-id löses med alias; förhandsvisningen visar initialen i en tom
    // fotoplats.
    const mallId = losMallId(template);
    const html = mallId ? renderaMallHtml(cvData, mallId, val, { forhandsvisning: true }) : null;
    if (!mallId || !html) {
      return NextResponse.json(
        { error: 'Okand mall: ' + template },
        { status: 400 }
      );
    }

    return NextResponse.json({ html, mall: mallId });
  } catch (error: any) {
    console.error('Fel i /api/cv/preview-html:', error);
    return NextResponse.json(
      { error: error?.message || 'Internt fel' },
      { status: 500 }
    );
  }
}
