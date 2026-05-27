// src/app/api/cv/upload/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { parseCV, ImageBasedPdfError } from '@/lib/cv-parser';
import { extractTextWithVision } from '@/lib/cv-parser/vision-fallback';
import { parseCV as parseCVStructure, type ParsedCV } from '@/lib/cv/cv-parser';
import { sanitizeStorageKey } from '@/utils/helpers';
export const runtime = 'nodejs';
export const maxDuration = 60;

function escapeDatabasePlaceholder(text: string): string {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

function stripPii(text: string): string {
  return text
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
    .replace(/(\+46|0046|0)[\s-]?7[\s-]?\d{1}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g, '[TEL]')
    .replace(/\+\d{1,3}[\s-]?\d{6,14}/g, '[TEL]')
    .replace(/\b[A-ZÅÄÖ][a-zåäö]+(?:gatan|vägen|stigen|gränden|torget|platsen)\s+\d+[A-Za-z]?\b/g, '[ADRESS]')
    .replace(/\b\d{3}\s?\d{2}\b/g, '[POSTNR]')
    .replace(/\b\d{6}[-\s]?\d{4}\b/g, '[PERSNR]')
    .replace(/https?:\/\/[^\s]+/g, '[URL]');
}

type SsePhase = 'uploading' | 'vision';

interface SseEmitter {
  phase: (phase: SsePhase, label: string) => void;
  complete: (data: any) => void;
  error: (payload: { error: string; message?: string; code?: string; status?: number }) => void;
  close: () => void;
}

function createSseStream(): { stream: ReadableStream<Uint8Array>; emitter: SseEmitter } {
  const encoder = new TextEncoder();
  let controller!: ReadableStreamDefaultController<Uint8Array>;

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
  });

  const send = (event: string, payload: any) => {
    const chunk = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
    try {
      controller.enqueue(encoder.encode(chunk));
    } catch {
      // controller stängd, ignorera
    }
  };

  const emitter: SseEmitter = {
    phase: (phase, label) => send('phase', { phase, label }),
    complete: (data) => send('complete', { success: true, data }),
    error: (payload) => send('error', payload),
    close: () => {
      try {
        controller.close();
      } catch {
        // redan stängd
      }
    },
  };

  return { stream, emitter };
}

export async function POST(request: Request) {
  const { stream, emitter } = createSseStream();

  // Kör hela upload-arbetet i bakgrunden, streamen levererar progress
  void runUpload(request, emitter);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

async function runUpload(request: Request, emitter: SseEmitter) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file) {
      emitter.error({ error: 'Ingen fil hittades', status: 400 });
      return emitter.close();
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      emitter.error({ error: 'Ej autentiserad', status: 401 });
      return emitter.close();
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, email_verified_at')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Fel vid hämtning av användarprofil:', profileError);
      emitter.error({ error: 'Kunde inte hämta användarprofil', status: 500 });
      return emitter.close();
    }

    const userFolder = `users/${user.id}`;
    const originalFileName = file.name;
    const sanitizedFileName = sanitizeStorageKey(originalFileName);
    const storageFilePath = `${userFolder}/${sanitizedFileName}`;

    console.log(`ℹ️ Original filename: ${originalFileName}`);

    // FAS 1: ladda upp + tolka text
    emitter.phase('uploading', 'Laddar upp och tolkar...');

    const isPdf = originalFileName.toLowerCase().endsWith('.pdf');

    let extractedText = '';
    let textExtractionFailed = false;
    let placeholderUsed = false;
    let usedVisionFallback = false;
    let needsVisionFallback = false;

    try {
      console.log(`📄 Starting text extraction for ${originalFileName} using parseCV...`);
      extractedText = await parseCV(file);

      const pdfErrorMessages = [
        'Kunde inte läsa',
        'Misslyckades med att läsa',
        'PDF-texten kunde inte',
      ];
      const nonPdfErrorMessages = [
        'Filformatet stöds inte',
        'Kunde inte ladda DOCX-parsningsbiblioteket',
        'Kunde inte extrahera text från DOCX-filen (tom fil)',
      ];

      const matchesPdfError = pdfErrorMessages.some((msg) => extractedText.startsWith(msg));
      const matchesNonPdfError = nonPdfErrorMessages.some((msg) => extractedText.startsWith(msg));
      const tooShort = !extractedText || extractedText.length < 50;

      if (matchesNonPdfError) {
        textExtractionFailed = true;
        placeholderUsed = true;
      } else if (isPdf && (matchesPdfError || tooShort)) {
        // PDF där pdf-parse strular eller returnerar för lite text →
        // försök vision-fallback i alla fall
        console.warn(
          `⚠️ parseCV gav otillräcklig output för ${originalFileName} (${extractedText.length} tecken). Försöker vision-fallback.`
        );
        needsVisionFallback = true;
      } else if (tooShort) {
        textExtractionFailed = true;
        placeholderUsed = true;
      }
    } catch (parseError) {
      if (parseError instanceof ImageBasedPdfError) {
        console.info(
          `[upload] image-based PDF detected (${parseError.extractedLength} chars). Försöker vision-fallback.`
        );
        needsVisionFallback = true;
      } else {
        console.error(`❌ Unexpected CV parsing error for ${originalFileName}:`, parseError);
        emitter.error({
          error: 'PARSING_ERROR',
          code: 'PARSING_ERROR',
          message: 'Ett oväntat fel uppstod vid läsning av filen. Kontrollera att filen inte är skadad.',
          status: 500,
        });
        return emitter.close();
      }
    }

    // Vision-fallback (FAS 2)
    if (needsVisionFallback) {
      emitter.phase(
        'vision',
        'Datan ligger bakom grafik. Vi läser igenom det — tar några sekunder till...'
      );

      const pdfData = new Uint8Array(await file.arrayBuffer());
      const visionText = await extractTextWithVision(pdfData);

      if (visionText && visionText.length >= 50) {
        extractedText = visionText;
        textExtractionFailed = false;
        placeholderUsed = false;
        usedVisionFallback = true;
        console.info(`[upload] vision-fallback lyckades: ${visionText.length} tecken`);
      } else {
        emitter.error({
          error: 'IMAGE_BASED_PDF',
          code: 'IMAGE_BASED_PDF',
          message: `PDF-filen verkar vara skannad eller bildbaserad och vi lyckades inte läsa innehållet.

Lösning:
1. Öppna ditt CV i Word/Pages/Google Docs
2. Välj: Arkiv → Exportera → PDF
3. Kontrollera att texten ÄR selekterbar (testa att markera text med musen)
4. Ladda upp den nya PDF:en

Alternativt: Ladda upp som .DOCX istället.`,
          status: 400,
        });
        return emitter.close();
      }
    }

    // Om vi nådde hit med textExtractionFailed=true (icke-PDF-fel som ändå måste blockas)
    if (textExtractionFailed && !usedVisionFallback) {
      emitter.error({
        error: 'INSUFFICIENT_TEXT',
        code: 'IMAGE_BASED_PDF',
        message: `Vi kunde inte extrahera tillräckligt med text från filen.

Lösning:
1. Öppna ditt CV i Word/Pages/Google Docs
2. Välj: Arkiv → Exportera → PDF
3. Kontrollera att texten ÄR selekterbar
4. Ladda upp den nya PDF:en

Alternativt: Ladda upp som .DOCX istället.`,
        status: 400,
      });
      return emitter.close();
    }

    if (extractedText && !textExtractionFailed) {
      extractedText = stripPii(extractedText);
    }

    let textToSave = extractedText;
    if (placeholderUsed) {
      textToSave = escapeDatabasePlaceholder(extractedText);
    }

    // Strukturera CV:t med AI for vacker presentation pa /profil/cv-sidan.
    // Non-blocking: misslyckas det sparar vi CV:t anda och anvandaren far
    // en "Strukturera nu"-knapp i detalj-vyn.
    let structuredData: ParsedCV | null = null;
    if (!textExtractionFailed) {
      try {
        structuredData = await parseCVStructure(textToSave);
        console.info(
          `[upload] structured CV parsing OK: ${structuredData.roles.length} roles, ${structuredData.skills.length} skills`
        );
      } catch (err) {
        console.warn('[upload] structured parsing failed, saving without:', err);
      }
    }

    // Storage upload
    try {
      const { data: folderExists } = await supabase.storage.from('cvs').list(userFolder);
      if (!folderExists || folderExists.length === 0) {
        await supabase.storage.from('cvs').upload(`${userFolder}/.placeholder`, new Blob([''], { type: 'text/plain' }));
      }
    } catch (folderError) {
      console.log('Mappkontroll/-skapande fel (ignoreras):', folderError);
    }

    const { error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(storageFilePath, file, { upsert: true });

    if (uploadError) {
      console.error(`❌ Storage upload error:`, uploadError);
      emitter.error({
        error: uploadError.message.includes('Invalid Input') || uploadError.message.includes('invalid key')
          ? `Ogiltigt filnamn för lagring: ${originalFileName}`
          : `Storagefel: ${uploadError.message}`,
        status: 500,
      });
      return emitter.close();
    }

    let publicUrl: string | null = null;
    try {
      const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(storageFilePath);
      if (urlData?.publicUrl) {
        publicUrl = urlData.publicUrl;
      }
    } catch (storageError: any) {
      console.error(`❌ Oväntat fel vid getPublicUrl:`, storageError.message || storageError);
    }

    // Idempotency: om samma fil redan finns i DB (t.ex. SSE-anslutning bröts men insert gick igenom)
    // returnera den befintliga posten istället för att skapa en dubblett
    const { data: existingCv } = await supabase
      .from('cv_texts')
      .select()
      .eq('user_id', user.id)
      .eq('original_file_path', storageFilePath)
      .maybeSingle();

    if (existingCv) {
      emitter.complete({ ...existingCv, publicUrl, textExtractionFailed, usedVisionFallback });
      return emitter.close();
    }

    // Kvotkontroll sker här, efter storage upload och idempotency-check,
    // så att en reconnect för en redan sparad fil aldrig blockeras av kvoten
    if (profile.subscription_tier === 'free' && !profile.email_verified_at) {
      const { count: cvCount } = await supabase
        .from('cv_texts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (cvCount !== null && cvCount >= 1) {
        emitter.error({
          error: 'Du måste verifiera din e-post för att ladda upp fler CV:n. Kontrollera din inkorg eller begär ett nytt verifieringsmejl.',
          code: 'EMAIL_NOT_VERIFIED',
          status: 403,
        });
        return emitter.close();
      }
    }

    if (profile.subscription_tier === 'free') {
      const { count } = await supabase
        .from('cv_texts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (count !== null && count >= 2) {
        emitter.error({
          error: 'Som gratisanvändare kan du bara ha 2 CV. Uppgradera till premium för att hantera flera CV:n.',
          code: 'CV_LIMIT_REACHED',
          status: 403,
        });
        return emitter.close();
      }
    }

    const { data: cvData, error: cvError } = await supabase
      .from('cv_texts')
      .insert({
        user_id: user.id,
        file_name: title || originalFileName,
        original_file_path: storageFilePath,
        cv_text: textToSave,
        text_extraction_failed: textExtractionFailed,
        structured_data: structuredData as any,
      })
      .select()
      .single();

    if (cvError) {
      console.error(`❌ DB insert error:`, cvError);
      emitter.error({ error: `Databasfel: ${cvError.message}`, status: 500 });
      return emitter.close();
    }

    const { error: onboardingError } = await supabase.rpc('update_onboarding_progress', {
      user_id: user.id,
      step_name: 'upload_cv',
    });
    if (onboardingError) {
      console.error('Failed to update onboarding progress:', onboardingError.message);
    }

    emitter.complete({
      ...cvData,
      publicUrl,
      textExtractionFailed,
      usedVisionFallback,
    });
    emitter.close();
  } catch (error: any) {
    console.error('💥 Top-level CV upload error:', error);
    emitter.error({
      error: 'Serverfel vid uppladdning: ' + (error.message || 'Okänt fel'),
      status: 500,
    });
    emitter.close();
  }
}

// För enklare tests och kompatibilitet med eventuella icke-streamande clients,
// behåller vi inte gamla JSON-svar — clients måste uppgradera till SSE-läsning.
