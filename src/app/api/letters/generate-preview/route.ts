import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { generateCoverLetter, extractJobInfo } from '@/lib/openai/api';
import { calculateCostFromDatabase } from '@/lib/openai/pricing-sync';
import { getDocxTemplate, type DocxTemplateId } from '@/lib/letters/docx-templates';
import type { ProfileDataForLetter, JobInfo } from '@/lib/letters/template-merger';

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

    // Hämta begäransdata (CV-ID, jobbannons, tonalitet, språk och mall)
    const { cv_id, job_description, tonality, language = 'sv', template_id = 'classic' } = await request.json();
    
    if (!cv_id || !job_description) {
      return NextResponse.json(
        { error: 'CV-ID och jobbannons krävs' }, 
        { status: 400 }
      );
    }
    
    // Skapa en unik nyckel för denna specifika kombination
    // Inkludera språket och mallen i nyckeln för att hålla isär genereringar på olika språk och mallar
    const requestKey = `${user.id}:${cv_id}:${job_description.length}:${language}:${template_id}`;
    
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
      const startTime = Date.now(); // Tidtagning för generering
      
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

      // *** SÄKERHET: Enkel PII-rensning från CV-text ***
      console.log('🔒 SÄKERHET (Preview): Rensar PII från CV-data...');

      // Enkel regex-baserad rensning av PII utan att förstöra innehållet
      let cleanedCV = cvData.cv_text;

      // Ta bort email
      cleanedCV = cleanedCV.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '');

      // Ta bort svenska telefonnummer
      cleanedCV = cleanedCV.replace(/(\+46|0046|0)[\s-]?7[\s-]?\d{1}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g, '');
      cleanedCV = cleanedCV.replace(/\b\d{3}[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}\b/g, '');

      // Ta bort postnummer
      cleanedCV = cleanedCV.replace(/\b\d{3}\s?\d{2}\b/g, '');

      // Ta bort personnummer
      cleanedCV = cleanedCV.replace(/\b\d{6}[-\s]?\d{4}\b/g, '');

      // Rensa onödiga mellanslag och newlines
      cleanedCV = cleanedCV.replace(/\s+/g, ' ').trim();

      console.log('📋 Original CV-längd:', cvData.cv_text.length, 'tecken');
      console.log('📋 Rensad CV-längd:', cleanedCV.length, 'tecken');

      // Generera personligt brev med OpenAI, skicka CV UTAN PII
      console.log('🚀 SÄKERHET (Preview): Skickar CV utan PII till OpenAI...');
      const coverLetterResult = await generateCoverLetter(
        cleanedCV, // ✅ CV-text med PII borttaget
        job_description,
        tonality || 'professional',
        language || 'sv'
      );

      // Extrahera innehållet från returvärdet (AI-genererad brevkropp)
      const aiGeneratedBody = coverLetterResult.content;
      console.log('✅ SÄKERHET (Preview): OpenAI returnerade brevkropp (INGEN PII skickades)');
      const generationTimeMs = Date.now() - startTime; // Beräkna total tidsåtgång

      // Beräkna faktisk kostnad från databas (med fallback till baseline)
      const actualCost = await calculateCostFromDatabase(
        supabase,
        coverLetterResult.model,
        coverLetterResult.tokens?.prompt || 0,
        coverLetterResult.tokens?.completion || 0
      );

      // Hämta användarens profildata för att inkludera i brevet
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email, phone, location, include_phone_in_letters, include_location_in_letters')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData) {
        console.error('Kunde inte hämta profildata:', profileError);
        throw new Error('Kunde inte hämta användarens profildata');
      }

      // Bygg profilobjekt för template
      const profileForLetter: ProfileDataForLetter = {
        full_name: profileData.full_name || 'Ditt namn',
        email: profileData.email,
        phone: profileData.phone || undefined,
        location: profileData.location || undefined,
        include_phone_in_letters: profileData.include_phone_in_letters || false,
        include_location_in_letters: profileData.include_location_in_letters || false
      };

      // Hämta vald DOCX-template (använder samma template för både PDF och DOCX)
      const selectedTemplate = getDocxTemplate(template_id as DocxTemplateId);

      // Säkerställ att jobInfo har required fields för JobInfo-typen
      const jobInfoForTemplate: JobInfo = {
        title: jobInfo.title || (language === 'en' ? 'Job Application' : 'Ansökningsbrev'),
        company: jobInfo.company || 'Företag',
        position: jobInfo.position || jobInfo.title || 'Position',
        recipient: (jobInfo as any).recipient // recipient är optional i extractJobInfo
      };

      // Generera komplett HTML med DOCX-template (som används för både förhandsvisning och PDF)
      console.log(`Genererar komplett brev med DOCX-template: ${selectedTemplate.name}`);
      const completeLetterHTML = selectedTemplate.generateHTML(
        profileForLetter,
        jobInfoForTemplate,
        aiGeneratedBody // AI-genererad brevkropp
      );

      // Spara preview i databasen med is_saved = false
      const { data: previewData, error: insertError } = await supabase
        .from('letters')
        .insert({
          user_id: user.id,
          title: jobInfo.title || (language === 'en' ? 'Job Application' : 'Ansökningsbrev'),
          company: jobInfo.company,
          job_title: jobInfo.position,
          content: completeLetterHTML, // ✅ Använd komplett HTML med mall
          tonality: tonality || 'professional',
          language: language || 'sv',
          template_id: template_id, // ✅ Spara mall-ID
          job_description: job_description,
          cv_text: cvData.cv_text,
          is_saved: false, // ✅ Preview-status
          cv_path: cvData.original_file_path,
          ai_model: coverLetterResult.model,
          ai_tokens: coverLetterResult.tokens?.total || null,
          ai_cost: actualCost,
          generation_time_ms: generationTimeMs
        })
        .select()
        .single();

      if (insertError) {
        console.error('Fel vid skapande av preview:', insertError);
        throw new Error('Kunde inte spara preview');
      }

      // Returnera preview-data med ID
      return {
        id: previewData.id, // ✅ Lägg till ID för exakt matchning vid sparning
        title: previewData.title,
        company: previewData.company,
        job_title: previewData.job_title,
        content: previewData.content,
        tonality: previewData.tonality,
        language: previewData.language,
        template_id: previewData.template_id, // ✅ Inkludera mall-ID
        job_description: previewData.job_description,
        cv_text: previewData.cv_text,
        is_saved: false,
        cv_path: previewData.cv_path,
        cv_id: cv_id,
        user_id: previewData.user_id,
        ai_model: previewData.ai_model,
        ai_tokens: previewData.ai_tokens,
        ai_cost: previewData.ai_cost,
        generation_time_ms: previewData.generation_time_ms,
        created_at: previewData.created_at,
        // Behåll även det gamla ai_metadata för kompatibilitet
        ai_metadata: {
          model: previewData.ai_model,
          tokens: coverLetterResult.tokens,
          cost: previewData.ai_cost
        }
      };
    })();
    
    // Registrera generering i aktiva genereringar
    activeGenerations.set(requestKey, {
      startTime: Date.now(),
      promise: generationPromise
    });
    
    // Öka brevräknaren och uppdatera senaste återställningstiden om det behövs för gratisanvändare
    if (profile.subscription_tier === 'free') {
      // Definiera uppdateringsobjektet med tydlig typning för att lösa TypeScript-felet
      const updates: {
        weekly_letter_count: number;
        next_reset_date: string;
        last_count_reset?: string;
      } = {
        weekly_letter_count: newCount,
        next_reset_date: nextResetDate.toISOString()
      };
      
      // Om vi ska återställa räknaren, lägg till last_count_reset
      if (shouldReset) {
        updates.last_count_reset = new Date().toISOString();
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