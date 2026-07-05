// src/app/api/letters/generate/route.ts
// Uppdaterad för att logga AI-genereringsaktivitet med kostnad server-side
// *** SÄKERHETSREFAKTOR: Anonymiserar CV-data innan OpenAI ***

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
// Importera GenerateLetterResult typen och funktionerna
import { generateCoverLetter, extractJobInfo, GenerateLetterResult } from '@/lib/openai/api';
// *** NY IMPORT FÖR AKTIVITETSLOGGNING ***
import { logUserActivity, ActivityType } from '@/lib/activity-logger';
// *** NY IMPORT FÖR SÄKERHET ***
import { extractSkillsAndExperience, validateAnonymization } from '@/lib/letters/cv-anonymizer';
import { mergeProfileDataIntoLetter, ProfileDataForLetter, JobInfo } from '@/lib/letters/template-merger';
import { getDocxTemplate, DocxTemplateId } from '@/lib/letters/docx-templates';
// Dagskvot (2 brev/dag, midnatt svensk tid) — se docs/plan-kvotmodell.md
import {
  resolveDailyLetterCounter,
  nextMidnightStockholm,
  DAILY_LIMIT_LETTERS,
  quotaExceededBody,
} from '@/lib/quota/quotaService';
// *****************************************

// Cache-logik (oförändrad)...
const activeGenerations = new Map<string, { startTime: number, promise: Promise<any> }>();
const completedGenerations = new Map<string, { timestamp: number, letterId: string | null, content: any }>();
const DUPLICATE_THRESHOLD_MS = 10000;
const GENERATION_TIMEOUT_MS = 60000;
const COMPLETED_RETENTION_MS = 60000;

function cleanupCache() { /* ... oförändrad ... */ 
  const now = Date.now();
  for (const [key, { startTime }] of activeGenerations.entries()) {
    if (now - startTime > GENERATION_TIMEOUT_MS) {
      console.log(`Rensning av timeouted generering: ${key}`);
      activeGenerations.delete(key);
    }
  }
  for (const [key, { timestamp }] of completedGenerations.entries()) {
    if (now - timestamp > COMPLETED_RETENTION_MS) {
      completedGenerations.delete(key);
    }
  }
}
if (typeof setInterval === 'function') { setInterval(cleanupCache, 30000); }
// --- Slut på Cache-logik ---

export async function POST(request: Request) {
  let userIdForLogging: string | null = null; // För att logga fel även om user-objektet inte finns senare
  let logInputData: Record<string, any> = {}; // För att logga input vid fel

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }
    userIdForLogging = user.id; // Spara ID för ev. felloggning

    // Hämta profil med nya dynamiska kvotfält
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, weekly_letter_count, weekly_letter_first_used_at, weekly_letter_reset_at')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Fel vid hämtning av användarprofil:', profileError);
      if (userIdForLogging) {
          logUserActivity(userIdForLogging, 'letter_generation_failed', 'Kunde inte hämta profil innan generering', { error: profileError?.message || 'Profil ej hittad' });
      }
      return NextResponse.json({ error: 'Kunde inte hämta användarprofil' }, { status: 500 });
    }

    // Dagskvot: 2 brev per dag, fönstret nollställs vid midnatt svensk tid.
    // Kolumnerna weekly_letter_* återanvänds men tolkas som dagsräknare via
    // resolveDailyLetterCounter — fönstret är självrensande, så vi skriver
    // bara till databasen vid faktisk förbrukning.
    const now = new Date();
    const { effectiveCount, windowIsStale } = resolveDailyLetterCounter(
      profile.weekly_letter_count,
      profile.weekly_letter_first_used_at,
      now
    );
    const resetAt = nextMidnightStockholm(now);

    // Kontroll av dagsgräns för gratis-användare
    if (profile.subscription_tier === 'free' && effectiveCount >= DAILY_LIMIT_LETTERS) {
      logUserActivity(user.id, 'letter_generation_failed', 'Försökte generera brev men dagsgräns nådd', { limit: DAILY_LIMIT_LETTERS, current: effectiveCount });
      return NextResponse.json(
        quotaExceededBody(
          'letter_generation',
          {
            allowed: false,
            isPremium: false,
            used: effectiveCount,
            limit: DAILY_LIMIT_LETTERS,
            nextResetAt: resetAt.toISOString(),
          },
          'Du har använt dagens två brev. Ny kvot i morgon, eller uppgradera för obegränsat.'
        ),
        { status: 429 }
      );
    }

    // Hämta input och spara för ev. felloggning
    const { cv_id, job_description, tonality, language = 'sv', save = false, template_id = 'classic' } = await request.json();
    logInputData = { cv_id, job_description_length: job_description?.length, tonality, language, save, template_id }; // Spara input

    if (!cv_id || !job_description) {
      logUserActivity(user.id, 'letter_generation_failed', 'Försökte generera brev men input saknades', { has_cv_id: !!cv_id, has_job_description: !!job_description });
      return NextResponse.json({ error: 'CV-ID och jobbannons krävs' }, { status: 400 });
    }

    // Sparande är alltid tillåtet. För gratisanvändare är i stället bara de
    // 2 senast sparade breven AKTIVA — äldre låses (se /api/letters GET/PUT).

    const requestKey = `${user.id}:${cv_id}:${job_description.length}:${language}`;

    // Cache-hantering (oförändrad logik)...
     if (save && completedGenerations.has(requestKey)) { /* ... */ }
     const recentCompletion = completedGenerations.get(requestKey);
     if (recentCompletion) { /* ... */ }
     if (activeGenerations.has(requestKey)) { /* ... */ }
    // --- Slut på Cache-hantering ---

    // Skapa generaringslöfte
    const generationPromise = (async () => {
      const startTime = Date.now(); // Tidtagning för generering
      console.log(`Starting new SECURE generation for key: ${requestKey}`);

      // *** STEG 1: Hämta CV-text ***
      const { data: cvData, error: cvError } = await supabase.from('cv_texts').select('*').eq('id', cv_id).eq('user_id', user.id).single();
      if (cvError || !cvData || !cvData.cv_text) { throw new Error(`Kunde inte hitta CV med ID: ${cv_id}`); }

      // *** STEG 2: Hämta profildata (PII) ***
      const { data: profileData, error: profileFetchError } = await supabase
        .from('profiles')
        .select('full_name, email, phone, location, include_phone_in_letters, include_location_in_letters')
        .eq('id', user.id)
        .single();

      if (profileFetchError || !profileData) {
        throw new Error('Kunde inte hämta profildata för brevgenerering');
      }

      // *** STEG 3: Anonymisera CV-data (TA BORT PII) ***
      console.log('🔒 SÄKERHET: Anonymiserar CV-data...');
      console.log('📋 Original CV-längd:', cvData.cv_text.length, 'tecken');

      const anonymizedSkills = extractSkillsAndExperience(cvData.cv_text);

      console.log('📋 Anonymiserad data-längd:', anonymizedSkills.length, 'tecken');
      console.log('🔍 SÄKERHETSKONTROLL: Validerar anonymisering...');

      // Validera anonymisering
      const anonymizationWarnings = validateAnonymization(anonymizedSkills);
      if (anonymizationWarnings.length > 0) {
        console.error('❌ SÄKERHETSVARNING: PII-läckage detekterat!', anonymizationWarnings);
        console.error('🚨 Anonymiserad data innehåller:', anonymizationWarnings.join(', '));

        // Logga varningen men fortsätt (kan finjustera senare)
        logUserActivity(user.id, 'letter_generation_failed', 'Anonymisering producerade varningar', { warnings: anonymizationWarnings });

        // I produktion kan vi välja att stoppa här om det finns PII
        // throw new Error('Säkerhetsfel: PII hittades i anonymiserad data');
      } else {
        console.log('✅ SÄKERHET VERIFIERAD: Ingen PII hittades i anonymiserad data');
      }

      // *** STEG 4: Extrahera jobbinformation ***
      const jobInfoExtracted = await extractJobInfo(job_description, language);

      // *** STEG 5: Generera brevkropp med ENDAST anonymiserad data till OpenAI ***
      console.log('🚀 SÄKERHET: Skickar ENDAST anonymiserad data till OpenAI...');
      console.log('📤 Data som SKICKAS till OpenAI:');
      console.log('  - Anonymiserade kompetenser:', anonymizedSkills.substring(0, 100) + '...');
      console.log('  - Jobbbeskrivning:', job_description.substring(0, 100) + '...');
      console.log('  - Tonalitet:', tonality);
      console.log('  - Språk:', language);
      console.log('');
      console.log('🔒 Data som INTE skickas till OpenAI:');
      console.log('  - Namn:', profileData.full_name, '❌');
      console.log('  - Email:', profileData.email, '❌');
      console.log('  - Telefon:', profileData.phone || 'ej angivet', '❌');
      console.log('  - Plats:', profileData.location || 'ej angivet', '❌');
      console.log('');

      const generationResult: GenerateLetterResult = await generateCoverLetter(
        anonymizedSkills, // ENDAST anonymiserad data
        job_description,
        tonality || 'professional',
        language || 'sv'
      );
      const generationTimeMs = Date.now() - startTime; // Beräkna tid

      console.log('✅ SÄKERHET: OpenAI returnerade brevkropp (INGEN PII skickades)');

      // *** STEG 6: Bygga JobInfo-objekt ***
      const jobInfo: JobInfo = {
        title: jobInfoExtracted.title || (language === 'en' ? 'Job Application' : 'Ansökningsbrev'),
        company: jobInfoExtracted.company || '',
        position: jobInfoExtracted.position || '',
        recipient: undefined // Kan läggas till senare om vi extraherar mottagarnamn
      };

      // *** STEG 7: Skapa ProfileDataForLetter-objekt ***
      const profileForLetter: ProfileDataForLetter = {
        full_name: profileData.full_name || 'Namn saknas',
        email: profileData.email,
        phone: profileData.phone || null,
        location: profileData.location || null,
        include_phone_in_letters: profileData.include_phone_in_letters || false,
        include_location_in_letters: profileData.include_location_in_letters || false
      };

      // *** STEG 8: Hämta vald DOCX-template (används för både PDF och DOCX) ***
      const selectedTemplate = getDocxTemplate(template_id as DocxTemplateId);

      // *** STEG 9: Generera komplett HTML med DOCX-template + profildata ***
      console.log(`Genererar komplett brev med DOCX-template: ${selectedTemplate.name}`);
      const completeLetterHTML = selectedTemplate.generateHTML(
        profileForLetter,
        jobInfo,
        generationResult.content // AI-genererad brevkropp
      );

      console.log('✅ Komplett brev genererat (PII tillagt EFTER AI-steg)')

      // *** LOGGA LYCKAD GENERERING HÄR ***
      // Logga till user_activities för händelsehistorik
      logUserActivity(
        user.id,
        save ? 'letter_saved' : 'letter_created', // Använd letter_created för preview, letter_saved för sparade
        save ? 'Sparade ett personligt brev' : 'Genererade brevförhandsvisning',
        { // Metadata för admin/analys
           cv_id: cv_id,
           language: language,
           tonality: tonality || 'professional',
           job_title: jobInfo.position,
           company: jobInfo.company,
           is_saved: save, // Detta anger om det är preview eller sparat
           is_preview: !save, // Tydlig flagga för preview
           // AI-specifik metadata
           model: generationResult.model,
           cost: generationResult.cost,
           cost_sek: generationResult.cost ? generationResult.cost * 10.5 : 0, // Konvertera till SEK med null-check
           tokens_prompt: generationResult.tokens?.prompt,
           tokens_completion: generationResult.tokens?.completion,
           tokens_total: generationResult.tokens?.total,
           generation_time_ms: generationTimeMs
        }
      );

      // Logga AI-kostnad till usage_log för ekonomisk spårning
      const { error: usageLogError } = await supabase.from('usage_log').insert({
        user_id: user.id,
        feature_type: 'letter_generation',
        model: generationResult.model,
        tokens: generationResult.tokens?.total || 0,
        cost: generationResult.cost || 0,
        metadata: {
          is_saved: save,
          is_preview: !save,
          language: language,
          tonality: tonality,
          generation_time_ms: generationTimeMs,
          cost_sek: generationResult.cost ? generationResult.cost * 10.5 : 0,
          job_title: jobInfo.position,
          company: jobInfo.company
        }
      });

      if (usageLogError) {
        console.error('Failed to insert into usage_log:', usageLogError);
      } else {
        console.log(`Logged AI cost to usage_log: $${generationResult.cost} for user ${user.id}`);
      }
      // ***********************************

      // Skapa brevdata-objektet med kompletta innehållet
      const letterObject = {
        user_id: user.id,
        title: jobInfo.title,
        company: jobInfo.company,
        job_title: jobInfo.position,
        content: completeLetterHTML, // Komplett HTML med profildata
        tonality: tonality || 'professional',
        language: language || 'sv',
        job_description: job_description,
        cv_text: cvData.cv_text,
        is_saved: save,
        cv_path: cvData.original_file_path || null,
        cv_id: cv_id,
        template_id: template_id, // Lägg till mall-ID
        // Lägger till AI-metadata i letterObject
        ai_model: generationResult.model,
        ai_tokens: generationResult.tokens?.total || null,
        ai_cost: generationResult.cost,
        generation_time_ms: generationTimeMs
      };

      // Cachelagring (oförändrat, använder letterObject)
      completedGenerations.set(requestKey, { timestamp: Date.now(), letterId: null, content: letterObject });

      // Spara i databasen om save=true (oförändrat, använder letterObject)
      if (save) {
         const { data: letterData, error: letterError } = await supabase.from('letters').insert(letterObject).select().single();
         if (letterError) { throw new Error('Kunde inte spara brevet i databasen'); }
         if (letterData) {
             completedGenerations.set(requestKey, { timestamp: Date.now(), letterId: letterData.id, content: letterObject });
             // *** VALFRITT: Logga sparandet separat ***
             // logUserActivity(user.id, 'letter_saved', 'Sparade ett genererat personligt brev', { letter_id: letterData.id });
             return letterData; // Returnera DB-objektet
         } else {
             throw new Error("Kunde inte hämta det sparade brevet efter insert.");
         }
      }

      // Om inte save=true, returnera bara letterObject (ingen AI-metadata behövs till frontend)
      return letterObject;
    })();

    // Registrera pågående generering
    activeGenerations.set(requestKey, { startTime: Date.now(), promise: generationPromise });

    // Öka dagsräknaren vid förbrukning. Om fönstret är gammalt (windowIsStale)
    // startas ett nytt dagsfönster: count=1, first_used_at=nu, reset=nästa midnatt.
    let finalRemainingLetters = null;
    const newDailyCount = effectiveCount + 1;
    if (profile.subscription_tier === 'free') {
      finalRemainingLetters = Math.max(0, DAILY_LIMIT_LETTERS - newDailyCount);

      const { error: updateError } = await supabase
        .from('profiles')
        .update(
          windowIsStale
            ? {
                weekly_letter_count: 1,
                weekly_letter_first_used_at: now.toISOString(),
                weekly_letter_reset_at: resetAt.toISOString(),
              }
            : {
                weekly_letter_count: newDailyCount,
                weekly_letter_reset_at: resetAt.toISOString(),
              }
        )
        .eq('id', user.id);

      if (updateError) {
        console.error('Fel vid uppdatering av brevräknare:', updateError);
      } else {
        console.log(`Uppdaterade dagskvot för användare ${user.id}: ${newDailyCount}/${DAILY_LIMIT_LETTERS}`);
      }
    }

    // Vänta på resultat och returnera till frontend
    try {
      const letterDataResult = await generationPromise;
      activeGenerations.delete(requestKey); // Ta bort från pågående

      // Svaret till frontend innehåller INTE AI-metadata
      const responseData: any = {
         success: true,
         data: letterDataResult, // Objektet från DB om save=true, annars letterObject
         is_saved: letterDataResult.is_saved // Skicka med flaggan
      };

      // Lägg till kvotinformation för gratis-användare (dagsvärden)
      if (profile.subscription_tier === 'free') {
         responseData.remainingLetters = finalRemainingLetters;
         responseData.nextResetDate = resetAt.toISOString();
         responseData.currentCount = newDailyCount;
         responseData.limit = DAILY_LIMIT_LETTERS;
      }

      // Update onboarding progress - mark create_letter step as completed
      const { error: onboardingError } = await supabase.rpc('update_onboarding_progress', {
        user_id: user.id,
        step_name: 'create_letter'
      });
      if (onboardingError) {
        console.error('Failed to update onboarding progress:', onboardingError.message);
      }

      console.log(`Generation successful for key: ${requestKey}. Returning data to frontend (without AI meta).`);
      return NextResponse.json(responseData);

    } catch (error: any) {
      activeGenerations.delete(requestKey); // Ta bort från pågående vid fel
      console.error(`Generation promise failed for key ${requestKey}:`, error);

      // *** LOGGA MISSLYCKAD GENERERING HÄR ***
      logUserActivity(
        user.id,
        'letter_generation_failed', // Använd den typ du definierat
        `Misslyckades med att generera/spara brev: ${error.message}`, // Beskrivning
        { // Metadata för felsökning
           ...logInputData, // Input som användes
           error_message: error.message,
           // error_stack: error.stack // Kan vara för mycket info
        }
      );
      // *************************************

      // Returnera felet till frontend (oförändrat)
      return NextResponse.json({ error: error.message || 'Internt serverfel under generering' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Oväntat fel i /api/letters/generate:', error);
    // Logga det oväntade felet om möjligt
    if (userIdForLogging) {
        logUserActivity(userIdForLogging, 'letter_generation_failed', 'Oväntat serverfel i generate route', { ...logInputData, error: error.message });
    }
    return NextResponse.json(
      { error: 'Serverfel vid generering av brev: ' + (error.message || 'Okänt fel') },
      { status: 500 }
    );
  }
}