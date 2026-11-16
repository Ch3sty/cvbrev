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
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { renderaMallHtml } from '@/lib/cv/rendera-mall-html';
import { losMallId } from '@/lib/cv/mallar/alias';
import { tolkaVal, typsnittIdForFamilj } from '@/lib/cv/mallar/val';
import { forberedInloggatCv } from '@/lib/cv/forbered-inloggat-cv';
import { medSpok } from '@/lib/cv/bygg/spok';

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
  /**
   * CV-byggaren: tomma avsnitt visas med grå spöktext ur titeln
   * (src/lib/cv/bygg/spok.ts). Bara förhandsvisningen; filen får aldrig spöken.
   */
  spok?: boolean;
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

    // Tolkning och berikning delas med helskärmens sidor (/api/cv/sidor).
    const forberett = await forberedInloggatCv(supabase, user, { cvText, structuredData, cvId });
    if (!forberett.ok) {
      return NextResponse.json({ error: forberett.error }, { status: forberett.status });
    }
    const spok = body.spok === true ? medSpok(forberett.cv) : null;
    const cvData = spok ? spok.cv : forberett.cv;

    // Samma renderare som PDF:en (src/lib/cv/rendera-mall-html.ts). Gamla
    // mall-id löses med alias; förhandsvisningen visar initialen i en tom
    // fotoplats.
    const mallId = losMallId(template);
    const html = mallId ? renderaMallHtml(cvData, mallId, val, { forhandsvisning: true, spok: spok?.markering }) : null;
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
