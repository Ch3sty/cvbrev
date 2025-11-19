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

// *** KOSTNADSBERÄKNING MED BASELINE FALLBACK ***
/**
 * Baseline pricing (fallback if database unavailable)
 * Updated 2025-01-27 from official OpenAI pricing page
 * Source: https://openai.com/api/pricing/
 */
const BASELINE_PRICES: { [key: string]: { input: number; output: number } } = {
    // GPT-4 modeller (korrekta priser från OpenAI 2025-01)
    "gpt-4o":               { input: 3.00,  output: 10.00 },   // KORRIGERAT från 5/15
    "gpt-4o-mini":          { input: 0.15,  output: 0.60 },
    "gpt-4-turbo":          { input: 10.00, output: 30.00 },
    "gpt-4":                { input: 30.00, output: 60.00 },
    "gpt-3.5-turbo":        { input: 0.50,  output: 1.50 },

    // GPT-5 modeller (estimerade - ej släppta än)
    "gpt-5":                { input: 1.25,  output: 10.00 },
    "gpt-5-mini":           { input: 0.25,  output: 1.00 },
};

/**
 * Beräknar kostnaden för ett OpenAI API-anrop (synkron version med baseline fallback).
 * Använder hårdkodade baseline-priser som fallback om databas ej tillgänglig.
 *
 * @param model - Modellen som användes (t.ex. "gpt-4o").
 * @param promptTokens - Antal input tokens.
 * @param completionTokens - Antal output tokens.
 * @returns Beräknad kostnad i USD, eller null om pris saknas.
 */
export function calculateOpenAICost(model: string, promptTokens: number, completionTokens: number): number | null {
    // Försök hitta exakt modell i baseline
    let modelPrice = BASELINE_PRICES[model];

    // Försök hitta basmodell om exakt matchning saknas
    if (!modelPrice) {
        // Ta bort datumstämplar från modellnamn (t.ex. "gpt-4o-2024-08-06" -> "gpt-4o")
        const baseModel = model.replace(/-\d{4}-\d{2}-\d{2}$/, '');
        modelPrice = BASELINE_PRICES[baseModel];
    }

    // Försök fallback för gpt-3.5-varianter
    if (!modelPrice && model.startsWith('gpt-3.5-turbo')) {
        modelPrice = BASELINE_PRICES["gpt-3.5-turbo"];
    }

    if (!modelPrice) {
        console.warn(`[calculateOpenAICost] No pricing found for model: ${model}. Consider syncing pricing data.`);
        return null;
    }

    const inputCost = (promptTokens / 1_000_000) * modelPrice.input;
    const outputCost = (completionTokens / 1_000_000) * modelPrice.output;
    const totalCost = inputCost + outputCost;

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
 * Genererar ett personligt brev baserat på ANONYMISERADE CV-data och jobbannons
 *
 * SÄKERHET: Denna funktion tar emot ENDAST anonymiserade kompetenser/erfarenheter.
 * PII (namn, email, telefon, adress) FÅR ALDRIG skickas hit.
 * Profildata läggs till EFTER AI-generering av template-merger.
 *
 * --- UPPDATERAD ATT RETURNERA GenerateLetterResult ---
 */
export async function generateCoverLetter(
  anonymizedSkills: string, // ÄNDRAT: Endast anonymiserad data
  jobDescription: string,
  tonality: string = 'professional',
  language: string = 'sv'
): Promise<GenerateLetterResult> { // <<< ÄNDRAD RETURTYP HÄR
  try {
    // Validera indata
    if (!anonymizedSkills || !jobDescription) {
      throw new Error('Anonymiserade kompetenser och jobbannons måste innehålla text');
    }

    // Begränsa storleken på texten
    const truncatedSkills = anonymizedSkills.substring(0, 3000); // Anonymiserad data
    const truncatedJobDesc = jobDescription.substring(0, 2000);

    // Skapa en prompt som instruerar AI:n
    // Hämta tonalitetsbeskrivning
    const tonalityInstruction = tonality === 'auto'
      ? (language === 'sv'
          ? 'Analysera jobbannonsen och anpassa tonen så den passar optimalt för tjänsten, företagskulturen och branschen'
          : 'Analyze the job posting and adapt the tone to optimally fit the position, company culture and industry')
      : `Använd en ${tonalityDescriptions[tonality]?.[language as 'sv' | 'en'] || tonalityDescriptions.balanced[language as 'sv' | 'en']}`;

    // Premium auto-prompt: Djupare analys för bästa resultat
    const premiumAutoInstructions = tonality === 'auto' ? (language === 'sv' ? `

**PREMIUM AUTO-ANPASSNING:**

Innan du skriver brevet, genomför en djup analys:

1. **Branschanalys:**
   - Identifiera bransch och företagstyp (tech-startup, traditionellt företag, offentlig sektor, konsultbolag, etc.)
   - Anpassa formell nivå därefter (startup = informellt och dynamiskt, finans/juridik = formellt, offentlig = balanserat)

2. **Kulturanalys:**
   - Leta efter signaler om företagskultur i jobbannonsen (ord som "innovativ", "traditionell", "familjär", "professionell")
   - Anpassa ton efter kultur (innovativ vs traditionell, platt vs hierarkisk, teamorienterad vs individuell)

3. **Kravprofil:**
   - Identifiera och rangordna de 3-5 viktigaste kraven i annonsen
   - Prioritera dessa i brevet med konkreta exempel från CV:t som matchar varje krav

4. **Nyckelordsintegration:**
   - Identifiera 8-12 kritiska nyckelord från jobbannonsen (kompetenser, verktyg, metoder, mjuka färdigheter)
   - Integrera naturligt med 2-3 upprepningar av de viktigaste nyckelorden
   - Använd exakt samma terminologi som jobbannonsen

5. **Differentieringsstrategi:**
   - Hitta den unika kombinationen av erfarenheter i CV:t som passar bäst för just denna roll
   - Framhäv detta som kandidatens unika styrka för positionen
   - Koppla till företagets specifika behov och utmaningar

Baserat på denna analys, skriv ett brev som känns PERFEKT skräddarsytt för både tjänsten OCH företaget.
` : `

**PREMIUM AUTO-ADAPTATION:**

Before writing the letter, conduct a deep analysis:

1. **Industry Analysis:**
   - Identify industry and company type (tech-startup, traditional company, public sector, consultancy, etc.)
   - Adapt formality level accordingly (startup = informal and dynamic, finance/legal = formal, public = balanced)

2. **Culture Analysis:**
   - Look for signals about company culture in the job posting (words like "innovative", "traditional", "family-like", "professional")
   - Adapt tone to culture (innovative vs traditional, flat vs hierarchical, team-oriented vs individual)

3. **Requirements Profile:**
   - Identify and rank the 3-5 most important requirements in the posting
   - Prioritize these in the letter with concrete examples from the CV matching each requirement

4. **Keyword Integration:**
   - Identify 8-12 critical keywords from the job posting (skills, tools, methods, soft skills)
   - Integrate naturally with 2-3 repetitions of the most important keywords
   - Use the exact same terminology as the job posting

5. **Differentiation Strategy:**
   - Find the unique combination of experiences in the CV that best fits this specific role
   - Highlight this as the candidate's unique strength for the position
   - Connect to the company's specific needs and challenges

Based on this analysis, write a letter that feels PERFECTLY tailored to both the position AND the company.
`) : '';

    // Språkspecifika instruktioner
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

    // Skapa systemprompten baserat på språket
    const systemPrompt = language === 'sv' ?
    `VIKTIGT: Du ska ENDAST returnera BREVKROPPEN (main content). Inkludera INTE:
- Header med namn, adress, telefon (läggs till automatiskt)
- Datum (läggs till automatiskt)
- Mottagaradress (läggs till automatiskt)
- Hälsning som "Hej," eller "Bästa Herrskap," (läggs till automatiskt)
- Avslutande hälsning som "Med vänliga hälsningar" eller signatur (läggs till automatiskt)
- Jobbannonstexten
- CV-innehåll
- Headers som "## CV:" eller "## Jobbannons:"
- Kommentarer om kandidatens lämplighet eller behörighet
- Metadata eller förklaringar

Returnera BARA brevkroppen (de stycken som utgör brevets huvudinnehåll), inget annat.

---

SÄKERHETSINFORMATION:
Du har fått tillgång till ANONYMISERADE kompetenser och erfarenheter (INGET namn, email, telefon eller adress).
Du har också fått den aktuella jobbannonsen.

Din uppgift är att skriva ENDAST BREVKROPPEN för ett personligt brev på svenska som är helt anpassat efter den sökta tjänsten och företaget. Följ dessa riktlinjer:
${premiumAutoInstructions}
    1. **Målgruppsanpassning:**
      - Läs igenom både CV:t och jobbannonsen noggrant. Identifiera de nyckelkrav och önskade kompetenser som anges i annonsen.
      - Koppla dessa krav direkt till användarens erfarenheter och meriter som framgår av CV:t. Ange konkreta exempel, siffror eller prestationer när det är möjligt.

      **VIKTIGT om kompetensbrister:**
      - Om kandidaten saknar viss formell kompetens (t.ex. specifik utbildning eller legitimation), skriv ÄNDÅ ett brev.
      - Fokusera på överförbar kompetens, relevant erfarenhet och motivation.
      - Skriv ALDRIG "du är inte behörig" eller liknande bedömningar.
      - Din uppgift är att skriva det bästa möjliga brevet, inte att värdera lämplighet.

    2. **Struktur och naturlighet:**
      - **Inledning:** Ange vilken tjänst som söks. Var direkt och tydlig.
      - **Huvuddel:**
        - Beskriv relevanta erfarenheter kopplat till jobbet. Använd konkreta exempel.
        - Variera meningslängd naturligt. Blanda korta och längre meningar.
        - Lyft specifika prestationer där relevant (t.ex. resultat, projekt).
        - Visa hur din bakgrund passar tjänsten utan att överdriva.
      - **Avslutning:** Kort sammanfattning och nästa steg. Var artig men naturlig.
      - **Längdvariationer:** Tillåt att olika stycken har olika längd. Alla stycken behöver inte vara lika.
      - **Mänsklig ton:** Skriv som en riktig person skulle skriva, inte som en mall.
    3. **Längd:**
      - Brevet bör vara mellan 250–400 ord (ungefär en halv till en hel A4-sida).
    4. **Tonläge och språk:**
      - ${tonalityInstruction}.
      - Använd ett aktivt och tydligt språk. Undvik klichéer och generiska fraser.
      - Variera meningsstrukturerna naturligt. Använd olika sätt att inleda meningar.
      - VIKTIGT: Låt varje brev vara unikt. Använd INTE samma fraser i varje brev.
      - Undvik dessa AI-markörer:
        - "Jag blev mycket intresserad av..."
        - "I mig får ni en medarbetare som..."
        - "Jag ser fram emot möjligheten att..."
        - "Med över X års erfarenhet..."
        - "Jag är övertygad om att..."
      - Skriv istället på ett naturligt sätt som varierar mellan olika brev.

      **Svenska kulturella justeringar:**
      - Balansera självsäkerhet med ödmjukhet (svensk "lagom"-balans)
      - Använd "jag" för personliga prestationer men erkänn också teamwork där relevant
      - Exempel: "Tillsammans med teamet lyckades jag..." eller "Jag bidrog till..."
      - Undvik överdrivet säljande språk eller skryt
      - Var självsäker men inte arrogant
      - Kvantifiera resultat men gör det naturligt (inte i varje mening)

    5. **Anpassning:**
      - Skräddarsy brevet mot tjänsten. Referera till specifika punkter i jobbannonsen där relevant.
      - Visa förståelse för företaget genom att nämna:
        * Specifika projekt eller produkter om de nämns
        * Företagets värderingar om de framgår
        * Bransch-specifika utmaningar
      - Koppla din erfarenhet till företagets behov, inte bara till jobbeskrivningen.

    6. **Kvalitet:**
      - Kontrollera att brevet är grammatiskt korrekt.
      - Var koncis och engagerande – varje mening ska ha ett syfte.
      - Låt brevet låta som en riktig person skrev det, inte som en genererad text.

    7. **ATS-optimering (Applicant Tracking Systems):**
      - Identifiera nyckelord från jobbannonsen (kompetenser, verktyg, metoder, mjuka färdigheter)
      - Integrera dessa nyckelord naturligt i brevet minst 2-3 gånger för viktiga termer
      - Använd exakt samma terminologi som jobbannonsen (t.ex. "projektledning" om annonsen säger det, inte "projektledarskap")
      - Inkludera både hårda färdigheter (teknisk kompetens) och mjuka färdigheter (ledarskap, kommunikation)
      - VIKTIGT: Nyckelorden ska flyta naturligt i meningar - använd dem INTE som en lista

    8. **Kvantifiering av prestationer:**
      - Sök aktivt efter siffror och mätbara resultat i CV:t
      - Inkludera minst 2-3 kvantifierbara exempel om sådana finns (budget, procentuell förbättring, antal projekt, teamstorlek, omsättning, besparingar)
      - Exempel: "Jag ökade försäljningen med 25%" istället för "Jag förbättrade försäljningen"
      - Exempel: "Jag ledde ett team på 8 personer och levererade 12 projekt" istället för "Jag ledde projekt"
      - Om inga exakta siffror finns i CV:t, fokusera på konkreta resultat och omfattning

    Skriv nu brevkroppen. Returnera ENDAST brevkroppen (main content paragraphs), inget annat.`
    :
    `IMPORTANT: Return ONLY the LETTER BODY (main content). Do NOT include:
- Header with name, address, phone (added automatically)
- Date (added automatically)
- Recipient address (added automatically)
- Greeting like "Dear Sir/Madam," or "Hello," (added automatically)
- Closing like "Sincerely" or signature (added automatically)
- The job posting text
- CV content
- Headers like "## CV:" or "## Job posting:"
- Comments about candidate suitability or qualifications
- Metadata or explanations

Return ONLY the letter body (the paragraphs that make up the main content), nothing else.

---

SECURITY INFORMATION:
You have been given access to ANONYMIZED skills and experience (NO name, email, phone, or address).
You also have the current job posting.

Your task is to write ONLY THE LETTER BODY for a cover letter in English that is completely customized for the specific position and company. Follow these guidelines:
${premiumAutoInstructions}
    1. **Target audience adaptation:**
      - Read through both the CV and job posting carefully. Identify the key requirements and desired competencies mentioned in the ad.
      - Connect these requirements directly to the user's experiences and merits as shown in the CV. Provide concrete examples, figures, or achievements when possible.

      **IMPORTANT about competency gaps:**
      - If the candidate lacks certain formal qualifications (e.g., specific education or certification), STILL write a letter.
      - Focus on transferable skills, relevant experience, and motivation.
      - NEVER write "you are not qualified" or similar assessments.
      - Your task is to write the best possible letter, not to evaluate suitability.

    2. **Structure and naturalness:**
      - **Introduction:** State the position being applied for. Be direct and clear.
      - **Main body:**
        - Describe relevant experiences related to the job. Use concrete examples.
        - Vary sentence length naturally. Mix short and longer sentences.
        - Highlight specific achievements where relevant (e.g., results, projects).
        - Show how your background fits the position without exaggerating.
      - **Conclusion:** Brief summary and next steps. Be polite but natural.
      - **Length variations:** Allow different paragraphs to have different lengths. Not all paragraphs need to be equal.
      - **Human tone:** Write as a real person would write, not as a template.
    3. **Length:**
      - The letter should be between 250-400 words (approximately half to a full A4 page).
    4. **Tone and language:**
      - ${tonalityInstruction}.
      - Use active and clear language. Avoid clichés and generic phrases.
      - Vary sentence structures naturally. Use different ways to begin sentences.
      - IMPORTANT: Let each letter be unique. Do NOT use the same phrases in every letter.
      - Avoid these AI markers:
        - "I was very interested in..."
        - "In me, you will find an employee who..."
        - "I look forward to the opportunity to..."
        - "With over X years of experience..."
        - "I am confident that..."
      - Instead, write in a natural way that varies between different letters.

    5. **Customization:**
      - Tailor the letter to the position. Refer to specific points in the job posting where relevant.
      - Show understanding of the company by mentioning:
        * Specific projects or products if mentioned
        * Company values if evident
        * Industry-specific challenges
      - Connect your experience to the company's needs, not just the job description.

    6. **Quality:**
      - Ensure the letter is grammatically correct.
      - Be concise and engaging – every sentence should have a purpose.
      - Make the letter sound like a real person wrote it, not like generated text.

    7. **ATS optimization (Applicant Tracking Systems):**
      - Identify keywords from the job posting (skills, tools, methods, soft skills)
      - Integrate these keywords naturally in the letter at least 2-3 times for important terms
      - Use the exact same terminology as the job posting (e.g., "project management" if the ad says that, not "project leadership")
      - Include both hard skills (technical competence) and soft skills (leadership, communication)
      - IMPORTANT: Keywords should flow naturally in sentences - do NOT use them as a list

    8. **Quantification of achievements:**
      - Actively search for numbers and measurable results in the CV
      - Include at least 2-3 quantifiable examples if available (budget, percentage improvement, number of projects, team size, revenue, savings)
      - Example: "I increased sales by 25%" instead of "I improved sales"
      - Example: "I led a team of 8 people and delivered 12 projects" instead of "I led projects"
      - If no exact numbers are in the CV, focus on concrete results and scope

    Write the letter body now. Return ONLY the letter body (main content paragraphs), nothing else.`;

    // Skapa användarprompten med anonymiserade kompetenser och jobbannons
    const userPrompt = language === 'sv' ? `
    Skriv brevkroppen för ett personligt brev baserat på följande anonymiserade kompetenser och jobbannons:

    ## Anonymiserade kompetenser och erfarenheter:
    ${truncatedSkills}

    ## Jobbannons:
    ${truncatedJobDesc}

    VIKTIGT: Skriv ENDAST brevkroppen (de stycken som utgör innehållet). INTE header, datum, hälsning eller signatur.
    ` : `
    Write the letter body for a cover letter based on the following anonymized skills and job posting:

    ## Anonymized skills and experience:
    ${truncatedSkills}

    ## Job posting:
    ${truncatedJobDesc}

    IMPORTANT: Write ONLY the letter body (the paragraphs that make up the content). NOT header, date, greeting, or signature.
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

    // Validering av output - kontrollera att inget ogiltigt innehåll returneras
    const invalidPatterns = [
      /##\s*(CV|Jobbannons|Job posting):/i,  // Headers från input
      /(inte|not)\s+(behörig|qualified)/i,   // Behörighetsmeddelanden
      /följande\s+(CV|jobbannons)/i,         // Referens till input-struktur
      /baserat på följande/i,                // Referens till prompt-struktur
      /write a cover letter based on/i       // Engelsk prompt-läckage
    ];

    const hasInvalidContent = invalidPatterns.some(pattern => pattern.test(letterContent));

    if (hasInvalidContent) {
      console.error('AI returnerade ogiltigt innehåll (jobbannons/behörighetsmeddelande)', {
        letterPreview: letterContent.substring(0, 300)
      });
      throw new Error(
        language === 'sv'
          ? 'Det genererade brevet innehöll ogiltigt format. Försök igen.'
          : 'The generated letter contained invalid format. Please try again.'
      );
    }

    if (!letterContent || letterContent.trim().length < 50) { // Kontrollera att brevet inte är för kort
      console.error('Genererat brev är för kort eller tomt', { letterContent });
      throw new Error(
        language === 'sv'
          ? 'Det genererade brevet är ogiltigt'
          : 'The generated letter is invalid'
      );
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