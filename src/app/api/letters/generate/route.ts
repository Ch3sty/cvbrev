import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { generateCoverLetter } from '@/lib/openai/api';

export async function POST(request: Request) {
  try {
    // Hämta cookies korrekt med Next.js 15.2 pattern
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Verifiera att användaren är autentiserad
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    // Hämta begäransdata (CV-ID, jobbannons och tonalitet)
    const { cv_id, job_description, tonality } = await request.json();
    
    if (!cv_id || !job_description) {
      return NextResponse.json(
        { error: 'CV-ID och jobbannons krävs' }, 
        { status: 400 }
      );
    }

    // Hämta CV-text från databasen
    const { data: cvData, error: cvError } = await supabase
      .from('cv_texts')
      .select('*')
      .eq('id', cv_id)
      .eq('user_id', user.id)
      .single();

    if (cvError) {
      console.error('Fel vid hämtning av CV:', cvError);
      return NextResponse.json(
        { error: 'Kunde inte hitta CV' }, 
        { status: 404 }
      );
    }

    // Extrahera jobbinformation från jobbannonsen
    const jobInfo = extractJobInfo(job_description);

    // Generera personligt brev med OpenAI
    const coverLetterContent = await generateCoverLetter(
      cvData.cv_text,
      job_description,
      tonality || 'professional'
    );

    // Spara det genererade brevet i databasen
    const { data: letterData, error: letterError } = await supabase
      .from('letters')
      .insert({
        user_id: user.id,
        title: jobInfo.title || 'Ansökningsbrev',
        company: jobInfo.company,
        job_title: jobInfo.position,
        content: coverLetterContent,
        tonality: tonality || 'professional',
        job_description: job_description,
        cv_text: cvData.cv_text,
        is_saved: true,
        cv_path: cvData.original_file_path
      })
      .select();

    if (letterError) {
      console.error('Fel vid sparande av brev:', letterError);
      return NextResponse.json(
        { error: 'Kunde inte spara brevet' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: letterData[0]
    });
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
 */
function extractJobInfo(jobDescription: string): { 
  title?: string, 
  company?: string, 
  position?: string 
} {
  // Enkel extrahering av företagsnamn och jobbtitel
  // Detta är en mycket grundläggande implementation som kan förbättras
  const lines = jobDescription.split('\n').filter(line => line.trim() !== '');
  
  // Försök hitta företagsnamn (antar att det ofta finns i början eller innehåller nyckelord)
  const companyRegex = /(?:företag|firma|bolag|AB|företaget|hos|på)\s+([A-ZÅÄÖa-zåäö][A-ZÅÄÖa-zåäö\s&]+)(?:\s+AB)?/i;
  const companyMatch = jobDescription.match(companyRegex);
  
  // Försök hitta position/jobbtitel
  const positionRegex = /(?:söker\s+(?:en)?|tjänst\s+som|roll\s+som|position\s+som)\s+([A-ZÅÄÖa-zåäö][A-ZÅÄÖa-zåäö\s]+?)(?:\s+till|\s+för|\s+i|\s+på|\.)/i;
  const positionMatch = jobDescription.match(positionRegex);
  
  // Skapa en titel för brevet
  const title = positionMatch 
    ? `Ansökan: ${positionMatch[1].trim()}` 
    : 'Ansökningsbrev';
  
  return {
    title: title,
    company: companyMatch ? companyMatch[1].trim() : undefined,
    position: positionMatch ? positionMatch[1].trim() : undefined
  };
}