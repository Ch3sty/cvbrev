/**
 * /api/cv/preview-html
 *
 * Lattvikts-endpoint som returnerar genererad HTML for live-preview pa
 * /dashboard/cv-mallar (utan Puppeteer/PDF-generering).
 *
 * Anvander samma server-parser och template-system som /api/cv/generate-formatted
 * for att garantera att preview matchar PDF-output exakt.
 */
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getTemplateGenerator } from '@/lib/cv/templates';
import { parseSwedishCVContent } from '@/lib/cv/swedish-cv-content-parser';
import type { CVMetadata, CVTemplateType } from '@/lib/cv/cv-metadata';

interface PreviewRequest {
  template: string;
  cvText: string;
  templateOptions?: {
    includePhoto?: boolean;
    includeLinkedIn?: boolean;
  };
  fontFamily?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PreviewRequest = await request.json();
    const { template, cvText, templateOptions = {}, fontFamily } = body;

    if (!template || !cvText) {
      return NextResponse.json(
        { error: 'Template och cvText krävs' },
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

    // Parsa CV-text till CVMetadata med samma parser som PDF-flow
    let cvData: CVMetadata;
    try {
      cvData = await parseSwedishCVContent(cvText);
    } catch (err) {
      console.error('Fel vid CV-parsing i preview:', err);
      return NextResponse.json(
        { error: 'Kunde inte tolka CV-text' },
        { status: 500 }
      );
    }

    // Berika med profile-data sa preview matchar PDF (foto + LinkedIn)
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('profile_photo_url, linkedin_url')
      .eq('id', user.id)
      .single();

    if (userProfile) {
      if (userProfile.profile_photo_url && cvData.personalInfo) {
        cvData.personalInfo.profilePhotoUrl = userProfile.profile_photo_url;
      }
      if (userProfile.linkedin_url && cvData.personalInfo) {
        if (!cvData.personalInfo.linkedIn && !(cvData.personalInfo as any).linkedin) {
          (cvData.personalInfo as any).linkedin = userProfile.linkedin_url;
        }
      }
    }

    // Generera HTML med vald mall + options
    const generator = getTemplateGenerator(template as CVTemplateType);
    if (!generator) {
      return NextResponse.json(
        { error: 'Okand mall: ' + template },
        { status: 400 }
      );
    }

    let html = generator.generate(cvData, templateOptions);

    // Applicera anvandarvalt typsnitt om sant - same teknik som PDF-flow
    if (fontFamily && typeof fontFamily === 'string') {
      html = html.replace(
        /<style>/,
        `<style>\n  body, body * { font-family: ${fontFamily} !important; }\n  `
      );
    }

    return NextResponse.json({ html });
  } catch (error: any) {
    console.error('Fel i /api/cv/preview-html:', error);
    return NextResponse.json(
      { error: error?.message || 'Internt fel' },
      { status: 500 }
    );
  }
}
