import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { generateCoverLetter, extractJobInfo } from '@/lib/openai/api';

// Enkel cache för att spåra pågående genereringar och förhindra dubbletter
// Denna cache finns på serversidan och delas mellan alla användare
const activeGenerations = new Map<string, { startTime: number, promise: Promise<any> }>();

// Tidsperioder
const GENERATION_TIMEOUT_MS = 60000; // 60 sekunder max för en generering

/**
 * Kontrollerar om veckogränsen behöver nollställas och beräknar nästa nollställningsdatum
 */
function checkWeeklyReset(lastResetStr: string | null, currentCount: number): { 
  shouldReset: boolean, 
  newCount: number, 
  nextResetDate: Date 
} {
  const now = new Date();
  
  // Om det inte finns något senaste återställningsdatum, behöver vi återställa
  if (!lastResetStr) {
    const nextReset = new Date(now);
    nextReset.setDate(nextReset.getDate() + 7); // Nästa återställning om 7 dagar
    return { 
      shouldReset: true, 
      newCount: 1, // Börja med 1 eftersom vi håller på att generera ett brev
      nextResetDate: nextReset
    };
  }
  
  const lastReset = new Date(lastResetStr);
  // Beräkna tidsskillnaden i millisekunder
  const timeDiff = now.getTime() - lastReset.getTime();
  const daysDiff = timeDiff / (1000 * 3600 * 24);
  
  // Om det har gått 7 dagar eller mer sedan senaste återställning
  if (daysDiff >= 7) {
    const nextReset = new Date(now);
    nextReset.setDate(nextReset.getDate() + 7); // Nästa återställning om 7 dagar från idag
    return { 
      shouldReset: true, 
      newCount: 1, // Börja med 1 för detta nya brev
      nextResetDate: nextReset 
    };
  }
  
  // Ingen återställning behövs, öka bara räknaren
  const nextReset = new Date(lastReset);
  nextReset.setDate(nextReset.getDate() + 7); // Nästa återställning är 7 dagar från senaste återställning
  return { 
    shouldReset: false, 
    newCount: currentCount + 1,
    nextResetDate: nextReset
  };
}

// Hjälpfunktion för att rensa gamla cache-poster
function cleanupCache() {
  const now = Date.now();
  
  // Rensa gamla pågående genereringar (timeout)
  for (const [key, { startTime }] of activeGenerations.entries()) {
    if (now - startTime > GENERATION_TIMEOUT_MS) {
      console.log(`Rensning av timeouted generering: ${key}`);
      activeGenerations.delete(key);
    }
  }
}

// Schemalägg regelbunden rensning av cachen
if (typeof setInterval === 'function') {
  setInterval(cleanupCache, 30000); // Kör var 30:e sekund
}

export async function POST(request: Request) {
  try {
    // Hämta cookies korrekt med Next.js pattern
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Verifiera att användaren är autentiserad
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    // Hämta användarprofil för att kontrollera prenumerationsnivå
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, weekly_letter_count, last_count_reset, next_reset_date')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Fel vid hämtning av användarprofil:', profileError);
      return NextResponse.json({ error: 'Kunde inte hämta användarprofil' }, { status: 500 });
    }

    // Kontrollera om veckogränsen behöver nollställas med den nya hjälpfunktionen
    const { shouldReset, newCount, nextResetDate } = checkWeeklyReset(
      profile.last_count_reset,
      profile.weekly_letter_count || 0
    );

    // Kontrollera om användaren har nått sin veckogräns (endast för gratisanvändare)
    if (profile.subscription_tier === 'free' && !shouldReset && newCount > 5) {
      return NextResponse.json({ 
        error: 'Du har nått din veckogräns på 5 brev. Uppgradera till premium för obegränsad åtkomst.', 
        code: 'WEEKLY_LIMIT_REACHED',
        nextResetDate: nextResetDate.toISOString()
      }, { status: 403 });
    }

    // Hämta begäransdata (CV-ID, jobbannons, tonalitet och språk)
    const { cv_id, job_description, tonality, language = 'sv' } = await request.json();
    
    if (!cv_id || !job_description) {
      return NextResponse.json(
        { error: 'CV-ID och jobbannons krävs' }, 
        { status: 400 }
      );
    }
    
    // Skapa en unik nyckel för denna specifika kombination
    // Inkludera språket i nyckeln för att hålla isär genereringar på olika språk
    const requestKey = `${user.id}:${cv_id}:${job_description.length}:${language}`;
    
    // Kontrollera om en generering redan pågår för denna kombination
    if (activeGenerations.has(requestKey)) {
      console.log(`Generering pågår redan för: ${requestKey}`);
      
      try {
        // Vänta på befintlig generering
        const existingGeneration = activeGenerations.get(requestKey);
        if (existingGeneration) {
          const result = await existingGeneration.promise;
          return NextResponse.json({ 
            success: true, 
            data: result,
            shared: true,
            nextResetDate: nextResetDate.toISOString()
          });
        }
      } catch (error) {
        // Om befintlig generering misslyckades, ta bort den från cachen
        activeGenerations.delete(requestKey);
        console.log(`Befintlig generering misslyckades för: ${requestKey}`);
      }
    }
    
    // Skapa generaringslöfte
    const generationPromise = (async () => {
      // Hämta CV-text från databasen
      const { data: cvData, error: cvError } = await supabase
        .from('cv_texts')
        .select('*')
        .eq('id', cv_id)
        .eq('user_id', user.id)
        .single();

      if (cvError) {
        console.error('Fel vid hämtning av CV:', cvError);
        throw new Error('Kunde inte hitta CV');
      }

      // Använd AI för att extrahera jobbinformation från jobbannonsen
      const jobInfo = await extractJobInfo(job_description, language);

      // Generera personligt brev med OpenAI, skicka med språket
      const coverLetterContent = await generateCoverLetter(
        cvData.cv_text,
        job_description,
        tonality || 'professional',
        language || 'sv'
      );

      // Returnera det genererade brevet utan att spara i databasen
      return {
        title: jobInfo.title || (language === 'en' ? 'Job Application' : 'Ansökningsbrev'),
        company: jobInfo.company,
        job_title: jobInfo.position,
        content: coverLetterContent,
        tonality: tonality || 'professional',
        language: language || 'sv',
        job_description: job_description,
        cv_text: cvData.cv_text,
        is_saved: false,
        cv_path: cvData.original_file_path,
        cv_id: cv_id,
        user_id: user.id
      };
    })();
    
    // Registrera generering i aktiva genereringar
    activeGenerations.set(requestKey, {
      startTime: Date.now(),
      promise: generationPromise
    });
    
    // Öka brevräknaren och uppdatera senaste återställningstiden om det behövs för gratisanvändare
    if (profile.subscription_tier === 'free') {
      const updates = {
        weekly_letter_count: newCount,
        next_reset_date: nextResetDate.toISOString()
      };
      
      if (shouldReset) {
        updates['last_count_reset'] = new Date().toISOString();
      }
      
      // Uppdatera räknaren
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Fel vid uppdatering av brevräknare:', updateError);
      }
    }
    
    // Vänta på att genereringen slutförs
    try {
      const letterData = await generationPromise;
      
      // Ta bort från aktiva genereringar när den är klar
      activeGenerations.delete(requestKey);
      
      // För gratisanvändare, returnera också antalet återstående brev för veckan
      if (profile.subscription_tier === 'free') {
        const remainingLetters = Math.max(0, 5 - newCount);
        return NextResponse.json({ 
          success: true, 
          data: letterData,
          remainingLetters: remainingLetters,
          nextResetDate: nextResetDate.toISOString()
        });
      }
      
      return NextResponse.json({ 
        success: true, 
        data: letterData,
        nextResetDate: nextResetDate.toISOString()
      });
    } catch (error: any) {
      // Ta bort från aktiva genereringar vid fel
      activeGenerations.delete(requestKey);
      throw error;
    }
  } catch (error: any) {
    console.error('Brevgenerering error:', error);
    return NextResponse.json(
      { error: 'Serverfel vid generering av brev: ' + error.message }, 
      { status: 500 }
    );
  }
}