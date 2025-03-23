import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { generateCoverLetter, extractJobInfo } from '@/lib/openai/api';

// Enkel cache för att spåra pågående genereringar och förhindra dubbletter
// Denna cache finns på serversidan och delas mellan alla användare
// Det är därför vi använder en kombinerad nyckel av användare-id och cv-id
const activeGenerations = new Map<string, { startTime: number, promise: Promise<any> }>();
const completedGenerations = new Map<string, { timestamp: number, letterId: string | null, content: any }>();

// Tidsperioder
const DUPLICATE_THRESHOLD_MS = 10000; // 10 sekunder mellan tillåtna genereringar för samma kombination
const GENERATION_TIMEOUT_MS = 60000; // 60 sekunder max för en generering
const COMPLETED_RETENTION_MS = 60000; // 60 sekunder spara information om slutförda genereringar

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
  
  // Rensa gamla slutförda genereringar
  for (const [key, { timestamp }] of completedGenerations.entries()) {
    if (now - timestamp > COMPLETED_RETENTION_MS) {
      completedGenerations.delete(key);
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

    // Hämta begäransdata (CV-ID, jobbannons, tonalitet, språk och om vi ska spara)
    const { cv_id, job_description, tonality, language = 'sv', save = false } = await request.json();
    
    if (!cv_id || !job_description) {
      return NextResponse.json(
        { error: 'CV-ID och jobbannons krävs' }, 
        { status: 400 }
      );
    }
    
    // *** KONTROLLERA MAXANTALET BREV ***
    // Räkna användarens sparade brev för att säkerställa att gränsen inte överskridits
    const { count, error: countError } = await supabase
      .from('letters')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_saved', true); // Räkna bara sparade brev
    
    if (countError) {
      console.error('Fel vid räkning av brev:', countError);
      return NextResponse.json(
        { error: 'Kunde inte verifiera antal brev' }, 
        { status: 500 }
      );
    }
    
    // Om save=true och användaren redan har max antal brev, neka begäran
    if (save && count !== null && count >= 10) {
      return NextResponse.json(
        { error: 'Du har nått maximal gräns på 10 sparade brev. Ta bort något brev först.' }, 
        { status: 403 }
      );
    }
    
    // Skapa en unik nyckel för denna specifika kombination
    // Inkludera språket i nyckeln för att hålla isär olika språkversioner
    const requestKey = `${user.id}:${cv_id}:${job_description.length}:${language}`;
    
    // Om detta är en förfrågan med "save=true" och vi har en cachad version, spara den
    if (save && completedGenerations.has(requestKey)) {
      const cachedResult = completedGenerations.get(requestKey);
      if (cachedResult && cachedResult.content) {
        console.log(`Använder cachad version för att spara: ${requestKey}`);
        
        // Kolla om vi redan har ett sparat brev med detta ID
        if (cachedResult.letterId) {
          const { data: existingLetter } = await supabase
            .from('letters')
            .select('*')
            .eq('id', cachedResult.letterId)
            .single();
            
          if (existingLetter) {
            return NextResponse.json({ 
              success: true, 
              data: existingLetter,
              reused: true
            });
          }
        }
        
        // Annars spara den cachade versionen
        const { data: letterData, error: letterError } = await supabase
          .from('letters')
          .insert({
            ...cachedResult.content,
            user_id: user.id,
            is_saved: true
          })
          .select();
          
        if (letterError) {
          console.error('Fel vid sparande av brev:', letterError);
          return NextResponse.json({ error: 'Kunde inte spara brevet' }, { status: 500 });
        }
        
        // Uppdatera cachen med det nya brev-ID:t
        completedGenerations.set(requestKey, {
          ...cachedResult,
          letterId: letterData[0].id
        });
        
        return NextResponse.json({ 
          success: true, 
          data: letterData[0]
        });
      }
    }
    
    // Kontrollera om vi nyligen slutfört en generering för denna kombination
    const recentCompletion = completedGenerations.get(requestKey);
    if (recentCompletion) {
      console.log(`Återanvänder nyligen genererat innehåll för: ${requestKey}`);
      
      // Om 'save' är true och vi har ett letterID, hämta det befintliga brevet
      if (save && recentCompletion.letterId) {
        const { data: existingLetter } = await supabase
          .from('letters')
          .select('*')
          .eq('id', recentCompletion.letterId)
          .single();
          
        if (existingLetter) {
          return NextResponse.json({ 
            success: true, 
            data: existingLetter,
            reused: true
          });
        }
      } 
      // Annars returnera den cachade innehållet utan att spara
      else if (!save && recentCompletion.content) {
        return NextResponse.json({ 
          success: true, 
          data: recentCompletion.content,
          reused: true,
          is_saved: false
        });
      }
    }
    
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
            is_saved: save // Indikera om brevet sparades
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

      // Använd AI för att extrahera jobbinformation från jobbannonsen, skicka med språk
      const jobInfo = await extractJobInfo(job_description, language);

      // Generera personligt brev med OpenAI, skicka med språk
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
        language: language || 'sv', // Spara språkvalet
        job_description: job_description,
        cv_text: cvData.cv_text,
        is_saved: save, // Spara endast om save=true
        cv_path: cvData.original_file_path,
        cv_id: cv_id
      };
      
      // Spara brevet i cachen - ändra typen på letterId för att acceptera null
      completedGenerations.set(requestKey, {
        timestamp: Date.now(),
        letterId: '', // Använd en tom sträng istället för null
        content: letterObject
      });

      // Om save=true, spara i databasen om antal brev inte överstiger max
      if (save) {
        // Kontrollera igen antalet brev för säkerhets skull
        const { count: currentCount, error: currentCountError } = await supabase
          .from('letters')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_saved', true);
        
        if (currentCountError) {
          throw new Error('Kunde inte verifiera antal brev innan sparande');
        }
        
        if (currentCount !== null && currentCount >= 10) {
          throw new Error('Du har nått maximal gräns på 10 sparade brev. Ta bort något brev först.');
        }
        
        const { data: letterData, error: letterError } = await supabase
          .from('letters')
          .insert(letterObject)
          .select();

        if (letterError) {
          console.error('Fel vid sparande av brev:', letterError);
          throw new Error('Kunde inte spara brevet');
        }
        
        // Uppdatera cachen med det sparade brevets ID
        if (letterData && letterData[0]) {
          completedGenerations.set(requestKey, {
            timestamp: Date.now(),
            letterId: letterData[0].id,
            content: letterObject
          });
          
          return letterData[0];
        }
      }
      
      // Om vi inte sparade, returnera bara objektet
      return letterObject;
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
        data: letterData,
        is_saved: save
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