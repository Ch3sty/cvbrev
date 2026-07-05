// /src/app/api/cv/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import { createBackgroundJob } from '@/lib/cv/background-jobs';
import { checkCvAnalysisQuota, quotaExceededBody, CV_ANALYSIS_WINDOW_HOURS } from '@/lib/quota/quotaService';

// Vercel maxDuration configuration
export const maxDuration = 60; // 60 seconds (Vercel free tier limit)

// ============================================================================
//  Helper Functions
// ============================================================================

// Kvoten (1 analys per rullande 72h för gratisanvändare) hanteras av
// checkCvAnalysisQuota i src/lib/quota/quotaService.ts. Den räknar
// cv_analysis_jobs med usage_counted=true — flaggan sätts vid jobbskapande
// och rullas tillbaka vid failure av /api/cv/jobs/[jobId] (orörd logik).

/**
 * Extracts general improvements from analysis result
 * General improvements are those that apply to the whole CV, not specific roles
 */
function extractGeneralImprovementsFromAnalysis(analysisResult: any): any[] {
    const generalImprovements: any[] = [];

    // Extract from detailed improvements if available
    const detailedImprovements = analysisResult.detailedImprovements || [];

    detailedImprovements.forEach((improvement: any) => {
        const area = (improvement.area || '').toLowerCase();
        const suggestion = (improvement.suggestion || '').toLowerCase();

        // Check if this is a general improvement (not role-specific)
        const isGeneral =
            area.includes('profilsammanfattning') ||
            area.includes('profil') ||
            area.includes('färdighet') ||
            area.includes('certifiering') ||
            area.includes('språk') ||
            area.includes('utbildning') ||
            area.includes('saknade nyckelord') ||
            suggestion.includes('lägg till färdighet') ||
            suggestion.includes('certifiering') ||
            suggestion.includes('språkkunskap');

        if (isGeneral) {
            let category: 'skills' | 'certifications' | 'languages' | 'profile' = 'skills';

            if (area.includes('profilsammanfattning') || area.includes('profil')) {
                category = 'profile' as any;
            } else if (area.includes('certifiering')) {
                category = 'certifications';
            } else if (area.includes('språk')) {
                category = 'languages';
            }

            generalImprovements.push({
                id: `general-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: improvement.area || 'Allmän förbättring',
                description: improvement.suggestion || improvement.example || 'Förbättring identifierad',
                category,
                selected: false,
                impact: 'high' as const,
                example: improvement.example
            });
        }
    });

    return generalImprovements;
}

/**
 * Fetches the CV text for a given user and CV ID.
 * @param supabase - Initialized Supabase server client.
 * @param userId - The ID of the user.
 * @param cvId - The ID of the CV.
 * @returns The CV text or throws an error.
 */
// Använd den importerade SupabaseClient-typen här
async function getCvText(supabase: SupabaseClient<Database>, userId: string, cvId: string): Promise<string> {
    // ... (funktionens kod oförändrad) ...
    const { data: cvData, error: dbError } = await supabase
        .from('cv_texts')
        .select('cv_text, text_extraction_failed')
        .eq('id', cvId)
        .eq('user_id', userId)
        .single();
    if (dbError || !(cvData as any)?.cv_text) {
        const isNotFoundError = dbError?.code === 'PGRST116';
        const errorMessage = isNotFoundError ? 'Kunde inte hitta angivet CV eller så tillhör det inte dig.' : `Databasfel vid hämtning av CV: ${dbError?.message || 'Okänt DB-fel'}`;
        console.error(`API analyzeCv: Error fetching CV text (CV ID: ${cvId}, User ID: ${userId}):`, dbError);
        const error = new Error(errorMessage);
        (error as any).statusCode = isNotFoundError ? 404 : 500;
        throw error;
    }

    // Check if text extraction failed
    if ((cvData as any).text_extraction_failed === true) {
        const error = new Error('CV-texten kunde inte extraheras från din PDF. Vänligen ladda upp filen igen eller kontrollera att PDF:en innehåller textbaserat innehåll (inte bara bilder).');
        (error as any).statusCode = 400;
        throw error;
    }

    return (cvData as any).cv_text;
}

// ============================================================================
//  API Route Handler (POST)
// ============================================================================
export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    let userId: string | undefined;

    try {
        // --- 1. Authentication ---
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('API analyzeCv: Authentication failed.', authError);
            return NextResponse.json({ message: 'Autentisering krävs.' }, { status: 401 });
        }
        userId = user.id;

        // --- 2. Request Body Parsing ---
        let cvId: string;
        try {
            const body = await request.json();
            cvId = body.cvId;
            if (!cvId || typeof cvId !== 'string') { throw new Error('cvId saknas eller är ogiltigt i request body.'); }
        } catch (error) {
            console.error('API analyzeCv: Failed to parse request body:', error);
            return NextResponse.json({ message: 'Ogiltig förfrågan.' }, { status: 400 });
        }

        // --- 3. Quota Check (1 analys per rullande 72h, premium passerar) ---
        const quota = await checkCvAnalysisQuota(supabase, userId);

        if (!quota.allowed) {
            console.log(`API analyzeCv: User ${userId} (Free): Quota exceeded (${quota.used}/${quota.limit}).`);
            return NextResponse.json({
                ...quotaExceededBody(
                    'cv_analysis',
                    quota,
                    'Du har använt din CV-analys. En ny blir tillgänglig var tredje dygn, eller uppgradera för obegränsat.'
                ),
                // Bakåtkompatibla fält som klienten läser idag:
                remainingAnalyses: 0,
                currentCount: quota.used,
            }, { status: 429 });
        }

        // --- 4. Fetch CV Text ---
        const cvText = await getCvText(supabase, userId, cvId);

        // --- 5. Create Background Job for AI Analysis (100% Async) ---
        console.log(`API analyzeCv: User ${userId} (${quota.isPremium ? 'premium' : 'free'}): Creating background job for CV ${cvId}...`);

        const { jobId, error: jobError } = await createBackgroundJob(userId, cvId);

        if (jobError || !jobId) {
            console.error('Failed to create background job:', jobError);
            return NextResponse.json(
                { message: 'Kunde inte starta CV-analys. Försök igen.' },
                { status: 500 }
            );
        }

        console.log(`✅ Background job created: ${jobId}`);

        // OBS: Forbrukning raknas via usage_counted pa cv_analysis_jobs
        // (satts vid jobbskapande, rullas tillbaka vid failure i
        // /api/cv/jobs/[jobId]). Ingen raknare uppdateras har.

        // Onboarding-progress for analyze_cv markeras INTE har heller -
        // det gors i jobs/[jobId] vid 'completed' sa anvandaren inte
        // markeras klar pa ett misslyckat eller pagaende jobb.

        // Return 202 Accepted immediately with job info.
        // remainingAnalyses speglar laget EFTER att detta jobb startats
        // (jobbet har redan usage_counted=true nar det skapas).
        return NextResponse.json(
            {
                message: 'CV-analysen har startats och körs i bakgrunden.',
                jobId,
                status: 'processing',
                isBackgroundJob: true,
                estimatedTime: '30-60 sekunder',
                remainingAnalyses: quota.isPremium ? null : Math.max(0, quota.limit - quota.used - 1),
                // Fonstret oppnar igen 72h efter jobbet som nyss skapades
                // (quota.nextResetAt fran pre-checken ar "nu" nar used=0).
                nextResetDate: quota.isPremium
                    ? quota.nextResetAt
                    : new Date(Date.now() + CV_ANALYSIS_WINDOW_HOURS * 60 * 60 * 1000).toISOString(),
                currentCount: quota.isPremium ? null : quota.used,
                limit: quota.isPremium ? null : quota.limit
            },
            { status: 202 } // Accepted
        );

    } catch (error: any) {
        // --- Global Error Handling ---
        console.error(`API analyzeCv: Unhandled error for user ${userId ?? 'unknown'}:`, error);
        const statusCode = error.statusCode || 500;
        const message = statusCode === 404 ? error.message : error.message || 'Ett internt serverfel inträffade.';
        return NextResponse.json({ message: message }, { status: statusCode });
    }
}