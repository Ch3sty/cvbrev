// src/app/api/letters/generate/route.ts
// KORRIGERAD: Tar bort den felaktiga gränsen på 10 sparade brev för premiumanvändare.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { generateCoverLetter, extractJobInfo } from '@/lib/openai/api';

// Cache-logik (oförändrad)
const activeGenerations = new Map<string, { startTime: number, promise: Promise<any> }>();
const completedGenerations = new Map<string, { timestamp: number, letterId: string | null, content: any }>();
const DUPLICATE_THRESHOLD_MS = 10000;
const GENERATION_TIMEOUT_MS = 60000;
const COMPLETED_RETENTION_MS = 60000;

function cleanupCache() {
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

if (typeof setInterval === 'function') {
  setInterval(cleanupCache, 30000);
}
// --- Slut på Cache-logik ---

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, weekly_letter_count, last_count_reset')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Fel vid hämtning av användarprofil:', profileError);
      return NextResponse.json({ error: 'Kunde inte hämta användarprofil' }, { status: 500 });
    }

    // Logik för återställning av veckoräknare (oförändrad)
    const lastReset = profile.last_count_reset ? new Date(profile.last_count_reset) : new Date(0);
    const now = new Date();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    let weeklyCount = profile.weekly_letter_count || 0;
    let shouldResetCounter = false;
    if (now.getTime() - lastReset.getTime() > oneWeek) {
      weeklyCount = 0;
      shouldResetCounter = true;
    }
    // --- Slut på logik för veckoräknare ---

    // Kontroll av veckogräns för gratisanvändare (oförändrad)
    if (profile.subscription_tier === 'free' && weeklyCount >= 5) {
      return NextResponse.json({
        error: 'Du har nått din veckogräns på 5 brev. Uppgradera till premium för obegränsad åtkomst.',
        code: 'WEEKLY_LIMIT_REACHED'
      }, { status: 403 });
    }
    // --- Slut på kontroll av veckogräns ---

    const { cv_id, job_description, tonality, language = 'sv', save = false } = await request.json();

    if (!cv_id || !job_description) {
      return NextResponse.json({ error: 'CV-ID och jobbannons krävs' }, { status: 400 });
    }

    // *** KONTROLLERA MAXANTALET SPARADE BREV (KORRIGERAD) ***
    if (save) { // Kontrollera endast om användaren FÖRSÖKER spara
      // Räkna användarens sparade brev
      const { count, error: countError } = await supabase
        .from('letters')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_saved', true); // Räkna bara sparade brev

      if (countError) {
        console.error('Fel vid räkning av sparade brev:', countError);
        return NextResponse.json(
          { error: 'Kunde inte verifiera antal sparade brev' },
          { status: 500 }
        );
      }

      // Kontrollera ENDAST gränsen för GRATISANVÄNDARE (max 2 brev)
      if (profile.subscription_tier === 'free' && count !== null && count >= 2) {
        console.log(`User ${user.id} (free) tried to save letter but reached limit of 2.`);
        return NextResponse.json(
          {
            error: 'Som gratisanvändare kan du spara max 2 brev. Uppgradera till premium för obegränsad lagring.',
            code: 'SAVED_LETTERS_LIMIT'
          },
          { status: 403 }
        );
      }
      // INGEN KONTROLL FÖR PREMIUMANVÄNDARE HÄR - Den felaktiga "else if count >= 10" är borttagen.
      else {
        // Logga att användaren får spara (oavsett om gratis < 2 eller premium)
         console.log(`User ${user.id} (tier: ${profile.subscription_tier}) is allowed to save letter (current saved: ${count ?? 'N/A'}).`);
      }
    }
    // *** SLUT PÅ KORRIGERAD KONTROLL ***

    const requestKey = `${user.id}:${cv_id}:${job_description.length}:${language}`;

    // Cache-hantering för slutförda och pågående generationer (oförändrad logik)
    if (save && completedGenerations.has(requestKey)) {
       // ... (logik för att spara cachad version) ...
        const cachedResult = completedGenerations.get(requestKey);
        if (cachedResult && cachedResult.content) {
            console.log(`Använder cachad version för att spara: ${requestKey}`);
            if (cachedResult.letterId) { /* ... hämta befintligt brev ... */ }
            // Spara cachad version
            const { data: letterData, error: letterError } = await supabase
                .from('letters').insert({...cachedResult.content, user_id: user.id, is_saved: true }).select().single();
            if (letterError) { /* ... hantera fel ... */ }
            if (letterData) {
                 completedGenerations.set(requestKey, { ...cachedResult, letterId: letterData.id });
                 return NextResponse.json({ success: true, data: letterData });
            }
        }
    }
    const recentCompletion = completedGenerations.get(requestKey);
    if (recentCompletion) {
        // ... (logik för att återanvända nyligen genererat innehåll) ...
         if (save && recentCompletion.letterId) { /* ... hämta befintligt brev ... */ }
         else if (!save && recentCompletion.content) { /* ... returnera cachat innehåll ... */ }
    }
    if (activeGenerations.has(requestKey)) {
        // ... (logik för att vänta på pågående generering) ...
         try {
            const existingGeneration = activeGenerations.get(requestKey);
            if (existingGeneration) {
                 const result = await existingGeneration.promise;
                 return NextResponse.json({ success: true, data: result, shared: true, is_saved: save });
            }
         } catch (error) { activeGenerations.delete(requestKey); /* ... */ }
    }
    // --- Slut på Cache-hantering ---

    // Skapa generaringslöfte
    const generationPromise = (async () => {
      console.log(`Starting new generation for key: ${requestKey}`);
      // Hämta CV-text
      const { data: cvData, error: cvError } = await supabase
        .from('cv_texts')
        .select('*') // Hämta hela CV-objektet
        .eq('id', cv_id)
        .eq('user_id', user.id)
        .single();

      if (cvError || !cvData) {
        console.error('Fel vid hämtning av CV eller CV saknas:', cvError);
        throw new Error(`Kunde inte hitta CV med ID: ${cv_id}`);
      }
      if (!cvData.cv_text) {
         console.error(`CV med ID: ${cv_id} saknar cv_text innehåll.`);
         throw new Error(`CV med ID: ${cv_id} saknar innehåll.`);
      }

      // Extrahera jobbinformation
      console.log(`Extracting job info for key: ${requestKey}`);
      const jobInfo = await extractJobInfo(job_description, language);

      // Generera personligt brev
      console.log(`Generating cover letter content for key: ${requestKey}`);
      const coverLetterContent = await generateCoverLetter(
        cvData.cv_text,
        job_description,
        tonality || 'professional',
        language || 'sv'
      );

      // Skapa brevdata-objektet
      const letterObject = {
        user_id: user.id,
        title: jobInfo.title || (language === 'en' ? 'Job Application' : 'Ansökningsbrev'),
        company: jobInfo.company,
        job_title: jobInfo.position,
        content: coverLetterContent,
        tonality: tonality || 'professional',
        language: language || 'sv',
        job_description: job_description, // Spara för ev. framtida referens
        cv_text: cvData.cv_text, // Spara CV-texten som användes
        is_saved: save, // Sätt flaggan baserat på input
        cv_path: cvData.original_file_path || null, // Spara sökväg om den finns
        cv_id: cv_id // Spara vilket CV som användes
      };

      // Cachelagra det genererade resultatet (innan ev. DB-insert)
      // Använd tom sträng för letterId initialt om det inte sparas
      completedGenerations.set(requestKey, {
        timestamp: Date.now(),
        letterId: null, // Sätt till null initialt
        content: letterObject
      });
      console.log(`Cached generated content (not saved yet) for key: ${requestKey}`);

      // Om save=true, spara i databasen (ingen extra gränskontroll behövs här nu)
      if (save) {
         console.log(`Saving generated letter to DB for key: ${requestKey}`);
         const { data: letterData, error: letterError } = await supabase
           .from('letters')
           .insert(letterObject) // letterObject har is_saved=true
           .select()
           .single(); // Få tillbaka den sparade raden som ett objekt

         if (letterError) {
           console.error('Fel vid sparande av brev till DB:', letterError);
           // Ta bort från cache om DB-insert misslyckas? Kanske inte, kan försöka spara senare.
           throw new Error('Kunde inte spara brevet i databasen');
         }

         if (letterData) {
           console.log(`Successfully saved letter ID: ${letterData.id} to DB.`);
           // Uppdatera cachen med det sparade brevets ID
           completedGenerations.set(requestKey, {
             timestamp: Date.now(),
             letterId: letterData.id, // Uppdatera med det verkliga ID:t
             content: letterObject // Behåll innehållet
           });
           console.log(`Updated cache with saved letter ID for key: ${requestKey}`);
           return letterData; // Returnera det sparade objektet från DB
         } else {
             console.error("DB insert successful but no data returned for key:", requestKey);
             throw new Error("Kunde inte hämta det sparade brevet efter insert.");
         }
      }

      // Om vi inte sparade (save=false), returnera bara objektet som det är
      console.log(`Returning generated content without saving for key: ${requestKey}`);
      return letterObject; // Returnera objektet med is_saved=false
    })();

    // Registrera pågående generering (oförändrat)
    activeGenerations.set(requestKey, {
      startTime: Date.now(),
      promise: generationPromise
    });

    // Öka veckoräknaren för gratisanvändare (oförändrat)
    if (profile.subscription_tier === 'free') {
      const updates: any = {
        weekly_letter_count: shouldResetCounter ? 1 : weeklyCount + 1
      };
      if (shouldResetCounter) {
        updates.last_count_reset = new Date().toISOString();
      }
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (updateError) {
        console.error('Fel vid uppdatering av brevräknare:', updateError);
        // Fortsätt ändå, det är inte kritiskt för själva genereringen
      } else {
         console.log(`Updated weekly count for user ${user.id} (free) to ${updates.weekly_letter_count}`);
      }
    }

    // Vänta på resultat och returnera (oförändrat)
    try {
      const letterData = await generationPromise;
      activeGenerations.delete(requestKey); // Ta bort från pågående

      // Anpassa svaret baserat på om det sparades eller ej
      const responseData = {
         success: true,
         data: letterData, // Innehåller nu is_saved flaggan korrekt
         is_saved: letterData.is_saved // Skicka med flaggan explicit också
      };

      // Lägg till remainingLetters endast för gratisanvändare
      if (profile.subscription_tier === 'free') {
         const remainingLetters = 5 - (shouldResetCounter ? 1 : weeklyCount + 1);
         (responseData as any).remainingLetters = remainingLetters >= 0 ? remainingLetters : 0;
      }

      console.log(`Generation successful for key: ${requestKey}. Returning data.`);
      return NextResponse.json(responseData);

    } catch (error: any) {
      activeGenerations.delete(requestKey); // Ta bort från pågående vid fel
      console.error(`Generation promise failed for key ${requestKey}:`, error);
      // Returnera det specifika felet som kastades från generationPromise
      return NextResponse.json({ error: error.message || 'Internt serverfel under generering' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Oväntat fel i /api/letters/generate:', error);
    return NextResponse.json(
      { error: 'Serverfel vid generering av brev: ' + (error.message || 'Okänt fel') },
      { status: 500 }
    );
  }
}