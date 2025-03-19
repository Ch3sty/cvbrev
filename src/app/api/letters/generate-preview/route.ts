import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { generateCoverLetter } from '@/lib/openai/api';

// Enkel cache för att spåra pågående genereringar och förhindra dubbletter
// Denna cache finns på serversidan och delas mellan alla användare
const activeGenerations = new Map<string, { startTime: number, promise: Promise<any> }>();

// Tidsperioder
const GENERATION_TIMEOUT_MS = 60000; // 60 sekunder max för en generering

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
            shared: true
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

      // Extrahera jobbinformation från jobbannonsen
      const jobInfo = extractJobInfo(job_description, language);

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
    
    // Vänta på att genereringen slutförs
    try {
      const letterData = await generationPromise;
      
      // Ta bort från aktiva genereringar när den är klar
      activeGenerations.delete(requestKey);
      
      return NextResponse.json({ 
        success: true, 
        data: letterData
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

/**
 * Hjälpfunktion för att extrahera jobbinformation från jobbannonsen
 * med stöd för olika språk
 */
function extractJobInfo(jobDescription: string, language: string = 'sv'): { 
  title?: string, 
  company?: string, 
  position?: string 
} {
  // Anpassa regexes baserat på språk
  if (language === 'en') {
    // Engelska regexes
    const companyRegex = /(?:company|firm|organization|at|with)\s+([A-Za-z][A-Za-z\s&]+)(?:\s+Inc\.?|\s+Ltd\.?)?/i;
	const positionRegex = /(?:seeking\s+(?:an?)?|position\s+(?:as|for)|role\s+(?:as|for)|applying\s+for)\s+([A-Za-z][A-Za-z\s]+?)(?:\s+for|\s+in|\s+at|\.)/i;
    
	const companyMatch = jobDescription.match(companyRegex);
	const positionMatch = jobDescription.match(positionRegex);
    
    // Skapa en titel för brevet på engelska
    const title = positionMatch 
      ? `Application: ${positionMatch[1].trim()}` 
      : 'Job Application';
    
    return {
      title: title,
      company: companyMatch ? companyMatch[1].trim() : undefined,
      position: positionMatch ? positionMatch[1].trim() : undefined
    };
  } else {
    // Svenska regexes (default)
    const companyRegex = /(?:företag|firma|bolag|AB|företaget|hos|på)\s+([A-ZÅÄÖa-zåäö][A-ZÅÄÖa-zåäö\s&]+)(?:\s+AB)?/i;
    const positionRegex = /(?:söker\s+(?:en)?|tjänst\s+som|roll\s+som|position\s+som)\s+([A-ZÅÄÖa-zåäö][A-ZÅÄÖa-zåäö\s]+?)(?:\s+till|\s+för|\s+i|\s+på|\.)/i;
    
    const companyMatch = jobDescription.match(companyRegex);
    const positionMatch = jobDescription.match(positionRegex);
    
    // Skapa en titel för brevet på svenska
    const title = positionMatch 
      ? `Ansökan: ${positionMatch[1].trim()}` 
      : 'Ansökningsbrev';
    
    return {
      title: title,
      company: companyMatch ? companyMatch[1].trim() : undefined,
      position: positionMatch ? positionMatch[1].trim() : undefined
    };
  }
}