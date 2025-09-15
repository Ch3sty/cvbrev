// src/app/api/letters/generate/route.ts
// Uppdaterad för att logga AI-genereringsaktivitet med kostnad server-side

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
// Importera GenerateLetterResult typen och funktionerna
import { generateCoverLetter, extractJobInfo, GenerateLetterResult } from '@/lib/openai/api'; 
// *** NY IMPORT FÖR AKTIVITETSLOGGNING ***
import { logUserActivity, ActivityType } from '@/lib/activity-logger'; 
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

    // Hämta profil (oförändrat)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, weekly_letter_count, last_count_reset')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) { // Lade till !profile check
      console.error('Fel vid hämtning av användarprofil:', profileError);
      // Logga felet här om möjligt
      if (userIdForLogging) {
          logUserActivity(userIdForLogging, 'letter_generation_failed', 'Kunde inte hämta profil innan generering', { error: profileError?.message || 'Profil ej hittad' });
      }
      return NextResponse.json({ error: 'Kunde inte hämta användarprofil' }, { status: 500 });
    }

    // Logik för veckoräknare (oförändrad)...
    const lastReset = profile.last_count_reset ? new Date(profile.last_count_reset) : new Date(0);
    const now = new Date();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    let weeklyCount = profile.weekly_letter_count || 0;
    let shouldResetCounter = false;
    let nextResetDate = new Date(lastReset.getTime() + oneWeek); // Beräkna nästa datum
    if (now.getTime() - lastReset.getTime() > oneWeek) {
      weeklyCount = 0;
      shouldResetCounter = true;
      nextResetDate = new Date(now.getTime() + oneWeek); // Sätt nytt datum från nu
    }
    // --- Slut på logik för veckoräknare ---

    // Kontroll av veckogräns (oförändrad)...
    if (profile.subscription_tier === 'free' && weeklyCount >= 5) {
      // Logga detta försök
      logUserActivity(user.id, 'letter_generation_failed', 'Försökte generera brev men veckogräns nådd', { limit: 5 });
      return NextResponse.json({
        error: 'Du har nått din veckogräns på 5 brev. Uppgradera till premium.',
        code: 'WEEKLY_LIMIT_REACHED',
        nextResetDate: nextResetDate.toISOString() // Skicka med nästa återställningsdatum
      }, { status: 403 });
    }
    // --- Slut på kontroll av veckogräns ---

    // Hämta input och spara för ev. felloggning
    const { cv_id, job_description, tonality, language = 'sv', save = false } = await request.json();
    logInputData = { cv_id, job_description_length: job_description?.length, tonality, language, save }; // Spara input

    if (!cv_id || !job_description) {
      logUserActivity(user.id, 'letter_generation_failed', 'Försökte generera brev men input saknades', { has_cv_id: !!cv_id, has_job_description: !!job_description });
      return NextResponse.json({ error: 'CV-ID och jobbannons krävs' }, { status: 400 });
    }

    // Kontroll av sparade brev (oförändrad)...
    if (save) {
      const { count, error: countError } = await supabase.from('letters').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_saved', true);
      if (countError) { /* ... felhantering ... */ }
      if (profile.subscription_tier === 'free' && count !== null && count >= 2) {
         logUserActivity(user.id, 'letter_generation_failed', 'Försökte spara brev men spargräns nådd (gratis)', { saved_count: count, limit: 2 });
         return NextResponse.json({ error: 'Som gratisanvändare kan du spara max 2 brev.', code: 'SAVED_LETTERS_LIMIT' }, { status: 403 });
      }
      // Ingen gräns för premium
    }
    // --- Slut på kontroll av sparade brev ---


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
      console.log(`Starting new generation for key: ${requestKey}`);
      
      // Hämta CV-text (oförändrat)
      const { data: cvData, error: cvError } = await supabase.from('cv_texts').select('*').eq('id', cv_id).eq('user_id', user.id).single();
      if (cvError || !cvData || !cvData.cv_text) { throw new Error(`Kunde inte hitta CV med ID: ${cv_id}`); }

      // Extrahera jobbinformation (oförändrat)
      const jobInfo = await extractJobInfo(job_description, language);

      // Generera personligt brev - FÅR NU GenerateLetterResult OBJEKT
      const generationResult: GenerateLetterResult = await generateCoverLetter(
        cvData.cv_text,
        job_description,
        tonality || 'professional',
        language || 'sv'
      );
      const generationTimeMs = Date.now() - startTime; // Beräkna tid

      // *** LOGGA LYCKAD GENERERING HÄR ***
      // Logga till user_activities för händelsehistorik
      logUserActivity(
        user.id,
        save ? 'letter_saved' : 'letter_generated', // Skilj på sparade och preview
        save ? 'Sparade ett personligt brev' : 'Genererade brevförhandsvisning',
        { // Metadata för admin/analys
           cv_id: cv_id,
           language: language,
           tonality: tonality || 'professional',
           job_title: jobInfo.position,
           company: jobInfo.company,
           is_saved: save,
           // AI-specifik metadata
           model: generationResult.model,
           cost: generationResult.cost,
           cost_sek: generationResult.cost * 10.5, // Konvertera till SEK
           tokens_prompt: generationResult.tokens?.prompt,
           tokens_completion: generationResult.tokens?.completion,
           tokens_total: generationResult.tokens?.total,
           generation_time_ms: generationTimeMs
        }
      );

      // Logga AI-kostnad till usage_log för ekonomisk spårning
      await supabase.from('usage_log').insert({
        user_id: user.id,
        feature_type: 'letter_generation',
        model: generationResult.model,
        tokens: generationResult.tokens?.total || 0,
        cost: generationResult.cost,
        metadata: {
          is_saved: save,
          language: language,
          tonality: tonality,
          generation_time_ms: generationTimeMs,
          cost_sek: generationResult.cost * 10.5
        }
      });
      // ***********************************

      // Skapa brevdata-objektet med innehållet från resultatet
      const letterObject = {
        user_id: user.id,
        title: jobInfo.title || (language === 'en' ? 'Job Application' : 'Ansökningsbrev'),
        company: jobInfo.company,
        job_title: jobInfo.position,
        content: generationResult.content, // Använd innehållet här
        tonality: tonality || 'professional',
        language: language || 'sv',
        job_description: job_description,
        cv_text: cvData.cv_text,
        is_saved: save,
        cv_path: cvData.original_file_path || null,
        cv_id: cv_id,
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

    // Registrera pågående generering (oförändrat)
    activeGenerations.set(requestKey, { startTime: Date.now(), promise: generationPromise });

    // Öka veckoräknaren (oförändrat)...
    let finalRemainingLetters = null;
    if (profile.subscription_tier === 'free') {
      const currentWeeklyCount = shouldResetCounter ? 1 : weeklyCount + 1;
      finalRemainingLetters = 5 - currentWeeklyCount;
      finalRemainingLetters = finalRemainingLetters >= 0 ? finalRemainingLetters : 0; // Se till att det inte är negativt

      const updates: any = { weekly_letter_count: currentWeeklyCount };
      if (shouldResetCounter) { updates.last_count_reset = new Date().toISOString(); }
      // Uppdatera även next_reset_date för tydlighet i DB (även om den beräknas ovan)
      updates.next_reset_date = nextResetDate.toISOString(); 

      const { error: updateError } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (updateError) { console.error('Fel vid uppdatering av brevräknare:', updateError); }
      else { console.log(`Updated weekly count for user ${user.id} (free) to ${currentWeeklyCount}`); }
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

      // Lägg till remainingLetters och nextResetDate
      if (profile.subscription_tier === 'free') {
         responseData.remainingLetters = finalRemainingLetters;
      }
       responseData.nextResetDate = nextResetDate.toISOString(); // Skicka med nästa datum

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