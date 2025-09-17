// src/lib/openai/api.ts - Uppdaterad för att exportera kostnadsberäkning
import OpenAI from 'openai';
import { SupabaseClient } from '@supabase/supabase-js'; // Importera SupabaseClient
import { Database } from '@/types/database.types'; // Importera Database-typ

// Skapa OpenAI-klient med API-nyckel från miljövariabel (oförändrad)
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mappning av tonaliteter till beskrivningar (Oförändrad)
const tonalityDescriptions: { [key: string]: { sv: string, en: string } } = {
  'professional': {
    sv: 'formell och affärsmässig ton med fokus på kompetens och erfarenhet',
    en: 'formal and business-like tone with focus on competence and experience'
  },
  'enthusiastic': {
    sv: 'entusiastisk och energisk ton som visar passion för rollen och företaget',
    en: 'enthusiastic and energetic tone showing passion for the role and company'
  },
  'creative': {
    sv: 'kreativ och innovativ ton som framhäver nytänkande och kreativa lösningar',
    en: 'creative and innovative tone highlighting original thinking and creative solutions'
  },
  'confident': {
    sv: 'självsäker ton som betonar styrkor, prestationer och resultat',
    en: 'confident tone that emphasizes strengths, achievements and results'
  },
  'balanced': {
    sv: 'balanserad ton som kombinerar professionalitet med personlighet',
    en: 'balanced tone that combines professionalism with personality'
  },
  'auto': {
    sv: 'en ton som är optimalt anpassad efter tjänsten och företaget baserat på din analys av jobbannonsen',
    en: 'a tone optimally adapted to the position and company based on your analysis of the job posting'
  }
};

// *** NY HJÄLPFUNKTION FÖR KOSTNADSBERÄKNING - NU EXPORTERAD ***
/**
 * Beräknar kostnaden för ett OpenAI API-anrop.
 * Priser är per 1 miljon tokens (Kolla aktuell prislista!).
 * @param model - Modellen som användes (t.ex. "gpt-4o").
 * @param promptTokens - Antal input tokens.
 * @param completionTokens - Antal output tokens.
 * @returns Beräknad kostnad i USD, eller null om pris saknas.
 */
export function calculateOpenAICost(model: string, promptTokens: number, completionTokens: number): number | null { // <<<--- EXPORT TILLAGD HÄR
    // Priser per 1 MILJON tokens (Uppdaterad 2025-09-15)
    // Hämta från https://openai.com/pricing
    const prices: { [key: string]: { input: number; output: number } } = {
        // GPT-5 modeller (augusti 2025) - Exakta priser från dokumentationen
        "gpt-5":                { input: 1.25,  output: 10.00 },  // $1.25/$10.00 per 1M tokens
        "gpt-5-2025-08-07":     { input: 1.25,  output: 10.00 },  // Specifik snapshot
        "gpt-5-mini":           { input: 0.25,  output: 1.00 },   // Billigare variant
        "gpt-5-mini-2025-08-07":{ input: 0.25,  output: 1.00 },   // Mini snapshot
        "gpt-5-nano":           { input: 0.05,  output: 0.20 },   // Mest kostnadseffektiv

        // GPT-4 modeller
        "gpt-4o":               { input: 5.00,  output: 15.00 },
        "gpt-4o-mini":          { input: 0.15,  output: 0.60 },
        "gpt-4-turbo":          { input: 10.00, output: 30.00 },
        "gpt-4":                { input: 30.00, output: 60.00 },
        "gpt-4.1":              { input: 10.00, output: 30.00 }, // Antar samma som gpt-4-turbo
        "gpt-3.5-turbo":        { input: 0.50,  output: 1.50 },
        "gpt-3.5-turbo-0125":   { input: 0.50,  output: 1.50 },
        "gpt-3.5-turbo-1106":   { input: 1.00,  output: 2.00 },
        "gpt-3.5-turbo-instruct": { input: 1.50,  output: 2.00 },
        // Lägg till fler modeller vid behov
    };

    let modelPrice = prices[model];
    // Försök hitta pris baserat på mer generell modell om exakt matchning saknas
    if (!modelPrice) {
        const baseModel = model.split('-').slice(0, 2).join('-'); // Ex: "gpt-4o" -> "gpt-4"
        modelPrice = prices[baseModel];
    }
    // Fallback för olika gpt-3.5-turbo-varianter
    if (!modelPrice && model.startsWith('gpt-3.5-turbo')) {
        modelPrice = prices["gpt-3.5-turbo-0125"]; // Använd priset för den vanligaste?
    }

    if (!modelPrice) {
        console.warn(`Prisinformation saknas för OpenAI-modell: ${model}. Kan inte beräkna kostnad.`);
        return null;
    }

    const inputCost = (promptTokens / 1_000_000) * modelPrice.input;
    const outputCost = (completionTokens / 1_000_000) * modelPrice.output;
    const totalCost = inputCost + outputCost;

    // Returnera med rimlig precision
    return parseFloat(totalCost.toFixed(6));
}
// **************************************************


/**
 * Extraherar jobbinformation från jobbannonsen med AI (Oförändrad)
 */
export async function extractJobInfo(
  jobDescription: string,
  language: string = 'sv'
): Promise<{ title?: string, company?: string, position?: string }> {
  // ---- Hela koden för extractJobInfo är oförändrad här ----
  try {
    const systemPrompt = language === 'sv' ?
      `Du är en expert på att analysera jobbannonser. Din uppgift är att extrahera följande information från en jobbannons:
       1. Företagsnamnet
       2. Tjänstetiteln/Positionen

       Svara i JSON-format med följande struktur:
       {
         "company": "Företagsnamnet",
         "position": "Tjänstetiteln"
       }

       Om du inte kan hitta någon av dessa, lämna den specifika nyckeln tom (t.ex. "company": "").
       Försök dock alltid att göra ditt bästa för att identifiera informationen.`
      :
      `You are an expert at analyzing job postings. Your task is to extract the following information from a job posting:
       1. The company name
       2. The job title/position

       Respond in JSON format with the following structure:
       {
         "company": "Company name",
         "position": "Job title"
       }

       If you cannot find any of these, leave that specific key empty (e.g., "company": "").
       However, always try your best to identify the information.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Eller annan modell om du föredrar för denna uppgift
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: jobDescription.substring(0, 4000) } // Begränsa input
      ],
      temperature: 0.3,
      max_tokens: 150,
      response_format: { type: "json_object" }
    });

    try {
      const content = response.choices[0].message.content || '{}';
      const jsonResponse = JSON.parse(content);

      // Skapa titel baserat på position och språk
      const title = jsonResponse.position ?
        (language === 'sv' ? `Ansökan: ${jsonResponse.position.trim()}` : `Application: ${jsonResponse.position.trim()}`) :
        (language === 'sv' ? 'Ansökningsbrev' : 'Job Application'); // Fallback-titel

      return {
        title: title,
        company: jsonResponse.company?.trim() || undefined, // Returnera undefined om tom
        position: jsonResponse.position?.trim() || undefined // Returnera undefined om tom
      };
    } catch (error) {
      console.error('Fel vid parsning av JSON-svar i extractJobInfo:', error);
      // Returnera fallback-titel om JSON-parsing misslyckas
      return {
        title: language === 'sv' ? 'Ansökningsbrev' : 'Job Application'
      };
    }
  } catch (error) {
    console.error('Fel vid extrahering av jobbinfo:', error);
     // Returnera fallback-titel vid API-fel
    return {
      title: language === 'sv' ? 'Ansökningsbrev' : 'Job Application'
    };
  }
  // ---- Slut på oförändrad kod för extractJobInfo ----
}


// *** DEFINIERA NY RETURTYP FÖR generateCoverLetter ***
export interface GenerateLetterResult {
  content: string; // Det genererade brevet
  model: string;   // Modellen som användes
  tokens: {        // Token-information
    prompt: number;
    completion: number;
    total: number;
  } | null;        // Kan vara null om usage saknas
  cost: number | null; // Beräknad kostnad (kan vara null)
}
// ***************************************************

/**
 * Genererar ett personligt brev baserat på CV och jobbannons
 * --- UPPDATERAD ATT RETURNERA GenerateLetterResult ---
 */
export async function generateCoverLetter(
  cvText: string,
  jobDescription: string,
  tonality: string = 'professional',
  language: string = 'sv'
): Promise<GenerateLetterResult> { // <<< ÄNDRAD RETURTYP HÄR
  try {
    // Validera indata (oförändrat)
    if (!cvText || !jobDescription) {
      throw new Error('CV och jobbannons måste innehålla text');
    }

    // Begränsa storleken på texten (oförändrat)
    const truncatedCV = cvText.substring(0, 3000); // Justera vid behov
    const truncatedJobDesc = jobDescription.substring(0, 2000); // Justera vid behov

    // Skapa en prompt som instruerar AI:n (oförändrat)
    // Hämta tonalitetsbeskrivning
    const tonalityInstruction = tonality === 'auto'
      ? (language === 'sv'
          ? 'Analysera jobbannonsen och anpassa tonen så den passar optimalt för tjänsten, företagskulturen och branschen'
          : 'Analyze the job posting and adapt the tone to optimally fit the position, company culture and industry')
      : `Använd en ${tonalityDescriptions[tonality]?.[language as 'sv' | 'en'] || tonalityDescriptions.balanced[language as 'sv' | 'en']}`;

    // Språkspecifika instruktioner (oförändrat)
    const languageSpecificInstructions = {
      sv: {
        title: 'svenska',
        format: 'inledning, huvuddel och avslutning',
        greeting: 'Bäste mottagare/Hej',
        closing: 'Med vänliga hälsningar'
      },
      en: {
        title: 'English',
        format: 'introduction, main body, and conclusion',
        greeting: 'Dear recipient/Hello',
        closing: 'Sincerely/Kind regards'
      }
    };
    const langInst = languageSpecificInstructions[language as 'sv' | 'en'] || languageSpecificInstructions.sv;

    // Skapa systemprompten baserat på språket (oförändrat - behåller dina detaljerade prompts)
    const systemPrompt = language === 'sv' ?
    `Du har fått tillgång till användarens CV och den aktuella jobbannonsen. Din uppgift är att skriva ett personligt brev på svenska som är helt anpassat efter den sökta tjänsten och företaget. Följ dessa riktlinjer:
    1. **Målgruppsanpassning:**
      - Läs igenom både CV:t och jobbannonsen noggrant. Identifiera de nyckelkrav och önskade kompetenser som anges i annonsen.
      - Koppla dessa krav direkt till användarens erfarenheter och meriter som framgår av CV:t. Ange konkreta exempel, siffror eller prestationer när det är möjligt.
    2. **Struktur:**
      - **Inledning:** Ange vilken tjänst som söks, nämn företagets namn och förklara kort varför du är intresserad. Inledningen ska vara stark och fånga läsarens uppmärksamhet.
      - **Huvuddel:**
        - Beskriv dina mest relevanta erfarenheter och kompetenser. Använd konkreta exempel från CV:t som matchar jobbannonsens krav.
        - Lyft fram specifika prestationer (t.ex. "ökat försäljningen med 20%", "drivit projekt som resulterat i…").
        - Förklara hur dina erfarenheter och egenskaper gör att du är rätt kandidat för just denna tjänst och hur du kan bidra till företagets framgång.
      - **Avslutning:** Sammanfatta varför du är rätt kandidat, uttryck din entusiasm och önskan om att gå vidare till en intervju. Avsluta med en artig hälsningsfras (t.ex. "Med vänliga hälsningar") och ditt namn.
    3. **Längd:**
      - Brevet bör vara mellan 250–400 ord (ungefär en halv till en hel A4-sida).
    4. **Tonläge och språk:**
      - ${tonalityInstruction}.
      - Använd ett aktivt och tydligt språk. Undvik klichéer och generiska fraser.
      - Inkludera effektiva formuleringar som:
        - "Jag blev mycket intresserad av er annons eftersom…"
        - "I mig får ni en medarbetare som…"
        - "Jag ser fram emot möjligheten att…"

    5. **Anpassning och precision:**
      - Se till att varje stycke är skräddarsytt mot den aktuella tjänsten. Referera gärna direkt till specifika punkter i jobbannonsen, exempelvis företagets mission, värderingar eller specifika krav.
      - Visa att du gjort din research genom att nämna unika detaljer om företaget, om sådana finns i annonsen.
    6. **Kvalitetskontroll:**
      - Kontrollera att brevet är grammatiskt korrekt och felfritt.
      - Se till att brevet är koncist, informativt och engagerande – varje mening ska ha ett syfte.

    Skriv ett personligt brev enligt ovanstående riktlinjer som integrerar och matchar de relevanta delarna från både CV:t och jobbannonsen. Anpassa texten så att det framgår tydligt varför kandidaten är perfekt för rollen.`
    :
    `You have been given access to the user's CV and the current job posting. Your task is to write a cover letter in English that is completely customized for the specific position and company. Follow these guidelines:
    1. **Target audience adaptation:**
      - Read through both the CV and job posting carefully. Identify the key requirements and desired competencies mentioned in the ad.
      - Connect these requirements directly to the user's experiences and merits as shown in the CV. Provide concrete examples, figures, or achievements when possible.
    2. **Structure:**
      - **Introduction:** State the position being applied for, mention the company name, and briefly explain why you are interested. The introduction should be strong and capture the reader's attention.
      - **Main body:**
        - Describe your most relevant experiences and competencies. Use concrete examples from the CV that match the job posting requirements.
        - Highlight specific achievements (e.g., "increased sales by 20%", "led projects that resulted in...").
        - Explain how your experiences and qualities make you the right candidate for this specific position and how you can contribute to the company's success.
      - **Conclusion:** Summarize why you are the right candidate, express your enthusiasm and desire to proceed to an interview. End with a polite greeting (e.g., "Sincerely" or "Kind regards") and your name.
    3. **Length:**
      - The letter should be between 250-400 words (approximately half to a full A4 page).
    4. **Tone and language:**
      - ${tonalityInstruction}.
      - Use active and clear language. Avoid clichés and generic phrases.
      - Include effective formulations such as:
        - "I was very interested in your advertisement because..."
        - "In me, you will find an employee who..."
        - "I look forward to the opportunity to..."

    5. **Customization and precision:**
      - Ensure that each paragraph is tailored to the current position. Feel free to refer directly to specific points in the job posting, such as the company's mission, values, or specific requirements.
      - Show that you've done your research by mentioning unique details about the company, if such information is in the job posting.
    6. **Quality control:**
      - Ensure the letter is grammatically correct and error-free.
      - Make sure the letter is concise, informative, and engaging – every sentence should have a purpose.

    Write a cover letter according to the above guidelines that integrates and matches the relevant parts from both the CV and the job posting. Adapt the text to clearly show why the candidate is perfect for the role.`;

    // Skapa användarprompten med CV och jobbannons (oförändrat)
    const userPrompt = language === 'sv' ? `
    Skriv ett personligt brev baserat på följande CV och jobbannons:

    ## CV:
    ${truncatedCV}

    ## Jobbannons:
    ${truncatedJobDesc}
    ` : `
    Write a cover letter based on the following CV and job posting:

    ## CV:
    ${truncatedCV}

    ## Job posting:
    ${truncatedJobDesc}
    `;

    const modelToUse = "gpt-4o"; // Använd gpt-4o för bästa balans mellan kvalitet och kostnad

    // Anropa ChatGPT API för att generera brev (oförändrat)
    const completion = await openai.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7, // Du kan justera denna parameter
      max_tokens: 1500, // Säkerställ att det räcker för ett helt brev
    });

    // Hantering av svar (oförändrat)
    if (!completion.choices || completion.choices.length === 0) {
      console.error('Inget svar från OpenAI', { completion });
      throw new Error('Inget svar mottaget från OpenAI');
    }
    const letterContent = completion.choices[0].message.content || '';
    if (!letterContent || letterContent.trim().length < 50) { // Kontrollera att brevet inte är för kort
      console.error('Genererat brev är för kort eller tomt', { letterContent });
      throw new Error('Det genererade brevet är ogiltigt');
    }

    // *** NY KOD: EXTRAHERA USAGE OCH BERÄKNA KOSTNAD ***
    const usage = completion.usage;
    let tokensInfo: GenerateLetterResult['tokens'] = null;
    let calculatedCost: number | null = null;

    if (usage) {
        const promptTokens = usage.prompt_tokens ?? 0;
        const completionTokens = usage.completion_tokens ?? 0;
        tokensInfo = {
            prompt: promptTokens,
            completion: completionTokens,
            total: usage.total_tokens ?? (promptTokens + completionTokens) // Summera om total saknas
        };
        // Anropar den nu exporterade funktionen
        calculatedCost = calculateOpenAICost(modelToUse, promptTokens, completionTokens);
    } else {
        console.warn("OpenAI response did not include usage data for generateCoverLetter.");
    }
    // ***************************************************

    // *** UPPDATERAD RETURVÄRDE ***
    // Returnera det nya objektet istället för bara strängen
    return {
      content: letterContent,
      model: modelToUse,
      tokens: tokensInfo,
      cost: calculatedCost
    };
    // ****************************

  } catch (error: any) {
    // Felhantering (oförändrat)
    console.error('Fullständigt OpenAI API-fel:', {
      errorMessage: error.message,
      errorName: error.name,
      errorCode: error.code,
      errorDetails: error.response?.data || 'Ingen ytterligare information'
    });
    // Försök ge ett mer användarvänligt felmeddelande
    throw new Error(
      language === 'sv'
        ? `Misslyckades med att generera brev: ${error.message || 'Okänt fel'}`
        : `Failed to generate letter: ${error.message || 'Unknown error'}`
    );
  }
}