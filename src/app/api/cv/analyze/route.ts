import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
// --- ÄNDRAD IMPORT ---
// import { createServerClient, type CookieOptions } from '@supabase/ssr' // <-- Ta bort denna
import { createServerClient } from '@/lib/supabase/server'; // <-- Lägg till denna
// --- SLUT PÅ ÄNDRING ---
import { openai } from '@/lib/openai/api'
import { Database } from '@/types/database.types' // Importera dina Supabase-typer

// Definiera gränsen centralt i API-rutten
const WEEKLY_ANALYSIS_LIMIT_FREE = 2;

// Hjälpfunktion för att beräkna nästa reset-datum (samma logik som i useProfile)
const calculateNextResetDate = (lastResetTimestamp: string | null): Date => {
  const now = new Date();
  const lastReset = lastResetTimestamp ? new Date(lastResetTimestamp) : now; // Använd nu om null

  const nextReset = new Date(lastReset);
  nextReset.setUTCHours(0, 0, 0, 0); // Nollställ tid till början av dagen (UTC)

  // Hitta nästa måndag
  const dayOfWeek = nextReset.getUTCDay(); // 0=Söndag, 1=Måndag,...
  const daysUntilMonday = (dayOfWeek === 1) ? 7 : (dayOfWeek === 0 ? 1 : 8 - dayOfWeek);
  nextReset.setUTCDate(nextReset.getUTCDate() + daysUntilMonday);

  // Säkerställ att reset alltid är i framtiden jämfört med 'nu'
  if (nextReset.getTime() <= now.getTime()) {
    nextReset.setUTCDate(nextReset.getUTCDate() + 7);
  }
  return nextReset;
};


export async function POST(request: Request) {
  const cookieStore = cookies()

  // --- ÄNDRAD INITIALISERING ---
  // Ta bort den gamla @supabase/ssr-initialiseringen:
  /*
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // ...
      },
    }
  )
  */
  // Lägg till den som används i din andra API-rutt:
  const supabase = createServerClient({ cookies: cookieStore });
  // --- SLUT PÅ ÄNDRING ---


  // 1. Autentisering (ingen ändring)
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Analysera CV - Auth Error:', authError)
    return NextResponse.json({ message: 'Åtkomst nekad: Användaren är inte autentiserad.' }, { status: 401 })
  }

  // 2. Hämta CV ID (ingen ändring)
  let cvId: string
  try {
    const body = await request.json()
    if (!body.cvId) {
      return NextResponse.json({ message: 'Saknar CV ID i förfrågan.' }, { status: 400 })
    }
    cvId = body.cvId
  } catch (error) {
    console.error('Analysera CV - Parse body error:', error)
    return NextResponse.json({ message: 'Kunde inte läsa förfrågan.' }, { status: 400 })
  }

  // --- Logik för profil, reset och gränskontroll (ingen ändring) ---
  let currentAnalysisCount: number = 0;
  let lastAnalysisResetTimestamp: string | null = null;
  let subscriptionTier: 'free' | 'premium' = 'free'; // Default till free
  let needsReset = false;
  let nextResetDate: Date;

  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, weekly_analysis_count, last_analysis_reset')
      .eq('id', user.id)
      .single();

     if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
     } else if (profileData) {
      subscriptionTier = (profileData.subscription_tier === 'premium' ? 'premium' : 'free');
      currentAnalysisCount = profileData.weekly_analysis_count ?? 0;
      lastAnalysisResetTimestamp = profileData.last_analysis_reset;
     }

    nextResetDate = calculateNextResetDate(lastAnalysisResetTimestamp);
    const now = new Date();

    if (now.getTime() >= nextResetDate.getTime()) {
        console.log(`Analysera CV - Användare ${user.id}: Räknaren behöver nollställas.`);
        needsReset = true;
        currentAnalysisCount = 0;
        lastAnalysisResetTimestamp = now.toISOString();

        const { error: resetError } = await supabase
            .from('profiles')
            .update({ weekly_analysis_count: 0, last_analysis_reset: lastAnalysisResetTimestamp })
            .eq('id', user.id);

        if (resetError) {
            console.error(`Analysera CV - Användare ${user.id}: Kunde inte uppdatera DB vid nollställning:`, resetError);
        } else {
            console.log(`Analysera CV - Användare ${user.id}: Databas uppdaterad med nollställd räknare.`);
        }
        nextResetDate = calculateNextResetDate(lastAnalysisResetTimestamp);
    } else {
        console.log(`Analysera CV - Användare ${user.id}: Ingen nollställning behövs.`);
    }

    if (subscriptionTier === 'free') {
      if (currentAnalysisCount >= WEEKLY_ANALYSIS_LIMIT_FREE) {
        console.log(`Analysera CV - Användare ${user.id} (Free): Gräns nådd.`);
        return NextResponse.json(
          {
            message: `Du har nått din veckogräns på ${WEEKLY_ANALYSIS_LIMIT_FREE} CV-analyser.`,
            remainingAnalyses: 0,
            limitReached: true,
            nextResetDate: nextResetDate.toISOString()
          },
          { status: 429 }
        );
      } else {
        console.log(`Analysera CV - Användare ${user.id} (Free): Inom gräns.`);
      }
    } else {
      console.log(`Analysera CV - Användare ${user.id} (Premium): Tillåter analys.`);
    }

  } catch (error: any) {
    console.error(`Analysera CV - Fel vid profilhämtning/gränskontroll (User ID: ${user.id}):`, error);
    return NextResponse.json({ message: 'Kunde inte verifiera användarstatus eller gränser.' }, { status: 500 });
  }
  // --- SLUT PÅ Logik för profil, reset och gränskontroll ---


  try {
    // 4. Hämta CV-text från databasen (ingen ändring)
    const { data: cvData, error: dbError } = await supabase
      .from('cv_texts')
      .select('cv_text')
      .eq('id', cvId)
      .eq('user_id', user.id)
      .single()

    if (dbError || !cvData || !cvData.cv_text) {
      console.error(`Analysera CV - DB Error (CV ID: ${cvId}, User ID: ${user.id}):`, dbError)
      const message = dbError?.code === 'PGRST116' ? 'Kunde inte hitta angivet CV eller så tillhör det inte dig.' : 'Kunde inte hämta CV-text från databasen.'
      return NextResponse.json({ message }, { status: dbError?.code === 'PGRST116' ? 404 : 500 })
    }

    const cvText = cvData.cv_text

    // 5. Förbered OpenAI Prompt (ingen ändring)
    const prompt = `
Du är en expert på rekrytering och CV-granskning i Sverige. Analysera följande CV-text noggrant.
Identifiera styrkor, svagheter/förbättringsområden, och extrahera relevanta nyckelord.
Ge också en kort sammanfattning och en bedömning av tydlighet och användning av handlingsverb.

**CV-Text:**
\`\`\`
${cvText}
\`\`\`

**Instruktioner för ditt svar:**
Returnera ditt svar **endast** som ett JSON-objekt med följande exakta struktur och nycklar (på engelska för enkelhet i koden):
{
  "summary": "En kort (1-2 meningar) övergripande bedömning av CV:t.",
  "strengths": ["Lista med 3-5 tydliga styrkor identifierade i CV:t (specifika färdigheter, erfarenheter, prestationer)."],
  "improvement_areas": ["Lista med 2-4 konkreta och konstruktiva förslag på förbättringar (t.ex. kvantifiera resultat, förtydliga ansvar, lägg till sektion X, åtgärda otydligheter). Var specifik!"],
  "keywords": ["Lista med 5-10 relevanta nyckelord extraherade från CV:t (tekniska färdigheter, mjuka färdigheter, branschspecifika termer, verktyg)."],
  "clarity_score": Siffra mellan 1 (mycket otydligt) och 10 (mycket tydligt) som bedömer CV:ts struktur och läsbarhet.,
  "action_verbs_usage": "En kort bedömning (t.ex. 'Bra', 'Kan förbättras', 'Varierad') av användningen av starka handlingsverb för att beskriva erfarenheter."
}

Se till att JSON-objektet är korrekt formaterat och komplett. Inkludera ingen annan text före eller efter JSON-objektet. Använd svenska i textvärdena inuti JSON (summary, strengths, improvement_areas, keywords, action_verbs_usage).
`

    // 6. Anropa OpenAI API (ingen ändring)
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Eller annan modell
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 600, // Justera vid behov
      response_format: { type: "json_object" },
    });

    const aiResponseContent = completion.choices[0]?.message?.content

    if (!aiResponseContent) {
      throw new Error('OpenAI returnerade inget innehåll.')
    }

    // 7. Parsa OpenAI Svar (ingen ändring)
    let analysisResult: any;
    try {
      analysisResult = JSON.parse(aiResponseContent);
      if (!analysisResult.summary || !analysisResult.strengths || !analysisResult.improvement_areas || !analysisResult.keywords) {
          throw new Error("AI-svaret saknar nödvändiga fält.");
      }
    } catch (parseError) {
      console.error('Analysera CV - OpenAI JSON Parse Error:', parseError)
      console.error('--- Mottaget från OpenAI ---'); console.error(aiResponseContent); console.error('--- Slut på OpenAI-svar ---')
      throw new Error('Kunde inte tolka svaret från AI-analysen.')
    }

    // --- Logik för uppdatering av räknare (ingen ändring) ---
    let remainingAnalysesAfterUpdate = Infinity;

    if (subscriptionTier === 'free') {
      const newCount = currentAnalysisCount + 1;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ weekly_analysis_count: newCount })
        .eq('id', user.id);

      if (updateError) {
        console.error(`Analysera CV - Användare ${user.id}: Kunde inte uppdatera räknare efter analys:`, updateError);
      } else {
        console.log(`Analysera CV - Användare ${user.id}: Räknare uppdaterad till ${newCount}.`);
      }
      remainingAnalysesAfterUpdate = Math.max(0, WEEKLY_ANALYSIS_LIMIT_FREE - newCount);
    }
    // --- SLUT PÅ Logik för uppdatering av räknare ---


    // 9. Returnera framgångsrikt svar (ingen ändring)
    return NextResponse.json(
      {
        ...analysisResult,
        remainingAnalyses: remainingAnalysesAfterUpdate,
        nextResetDate: nextResetDate.toISOString(),
        limitReached: subscriptionTier === 'free' && remainingAnalysesAfterUpdate <= 0,
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error(`Analysera CV - Oväntat fel (CV ID: ${cvId}, User ID: ${user.id}):`, error)
    return NextResponse.json({ message: error.message || 'Ett internt fel uppstod vid analys av CV.' }, { status: 500 })
  }
}