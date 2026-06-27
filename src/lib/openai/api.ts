// src/lib/openai/api.ts - Brevgenerering och jobbextraktion via Google Gemini
// (Migrerad från OpenAI 2026-06. Filen behåller sin sökväg tills P4-städningen.)
import { generateText, generateJSON, GEMINI_MODELS } from '@/lib/gemini';

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

/**
 * Extraherar jobbinformation från jobbannonsen med AI
 */
export async function extractJobInfo(
  jobDescription: string,
  language: string = 'sv'
): Promise<{ title?: string, company?: string, position?: string }> {
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

    const { data: jsonResponse } = await generateJSON<{ company?: string; position?: string }>({
      model: GEMINI_MODELS.fast,
      systemInstruction: systemPrompt,
      prompt: jobDescription.substring(0, 4000), // Begränsa input
      temperature: 0.3,
      maxOutputTokens: 500,
      thinkingBudget: 0,
    });

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
    console.error('Fel vid extrahering av jobbinfo:', error);
    // Returnera fallback-titel vid API-fel
    return {
      title: language === 'sv' ? 'Ansökningsbrev' : 'Job Application'
    };
  }
}


// *** RETURTYP FÖR generateCoverLetter (oförändrad form) ***
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
 */
export async function generateCoverLetter(
  anonymizedSkills: string, // Endast anonymiserad data
  jobDescription: string,
  tonality: string = 'professional',
  language: string = 'sv'
): Promise<GenerateLetterResult> {
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

    **BREV SOM KOMPLEMENT (INTE CV-UPPREPNING):**
    - Brevet ska INTE vara en löptextversion av CV:t - rekryteraren har redan CV:t för fakta
    - Använd brevet för att förklara LÄRDOMAR och KONTEXT bakom erfarenheterna
    - Förklara VARFÖR erfarenheterna gör dig rätt för just detta jobb
    - Fokusera på BETYDELSEN av erfarenheterna, inte kronologin

    1. **Målgruppsanpassning:**
      - Läs igenom både CV:t och jobbannonsen noggrant. Identifiera de nyckelkrav och önskade kompetenser som anges i annonsen.
      - Koppla dessa krav direkt till användarens erfarenheter och meriter som framgår av CV:t. Ange konkreta exempel, siffror eller prestationer när det är möjligt.

      **VIKTIGT om kompetensbrister:**
      - Om kandidaten saknar viss formell kompetens (t.ex. specifik utbildning eller legitimation), skriv ÄNDÅ ett brev.
      - Fokusera på överförbar kompetens, relevant erfarenhet och motivation.
      - Skriv ALDRIG "du är inte behörig" eller liknande bedömningar.
      - Din uppgift är att skriva det bästa möjliga brevet, inte att värdera lämplighet.

    2. **Struktur och naturlighet:**
      - **Inledning:** Ange vilken tjänst som söks och visa ENTUSIASM för rollen.
        - Fokusera på vad du kan BIDRA MED, inte vad du vill få ut av jobbet
        - Undvik självcentrerade motiveringar ("för att jag vill utvecklas")
        - Skriv ur arbetsgivarens perspektiv: "Vad får DE om de anställer mig?"
      - **Huvuddel:**
        - Beskriv relevanta erfarenheter kopplat till jobbet. Använd konkreta exempel.
        - Variera meningslängd AKTIVT: blanda korta (3-5 ord) med längre meningar (15-20 ord).
        - Lyft specifika prestationer där relevant (t.ex. resultat, projekt).
        - Visa hur din bakgrund passar tjänsten utan att överdriva.
        - Tillåt en-menings-stycken för betoning.
        - Börja meningar på olika sätt (inte alltid "Jag...").
      - **Varför företaget (OBLIGATORISKT):**
        - Inkludera ALLTID ett stycke som visar research om arbetsgivaren
        - Nämn något SPECIFIKT om företaget (produkter, värderingar, marknadsposition)
        - Koppla till kandidatens värderingar: "Ert fokus på X tilltalar mig eftersom..."
        - Detta separerar bra brev från generiska massutskick
      - **Avslutning:**
        - Sammanfatta kort ditt värde för företaget
        - Uppmana till intervju (självsäker men ödmjuk)
        - Tacka läsaren för deras tid
        - UNDVIK: Att sluta abrupt utan avslutande mening
        - Varianter: "Hoppas vi ses snart" / "Jag är nyfiken på att höra mer om era utmaningar"
      - **Längdvariationer:** Tillåt att olika stycken har olika längd. Alla stycken behöver inte vara lika.
      - **Mänsklig ton:** Skriv som en riktig person skulle skriva, inte som en mall.
    3. **Längd:**
      - Brevet bör vara mellan 250–400 ord (ungefär en halv till en hel A4-sida).
    4. **Tonläge och språk:**
      - ${tonalityInstruction}.
      - Använd ett aktivt och tydligt språk. Undvik klichéer och generiska fraser.
      - ALDRIG tankstreck/em-dash (—) i texten. Det är det tydligaste tecknet på AI-genererad text. Använd punkt, komma eller kolon istället.
      - Variera meningsstrukturerna naturligt. Använd olika sätt att inleda meningar. Blanda korta meningar med längre.
      - VIKTIGT: Låt varje brev vara unikt. Använd INTE samma fraser i varje brev.
      - Undvik dessa AI-markörer (KRITISKT - dessa avslöjar AI-genererad text):
        - "Jag blev mycket intresserad av..."
        - "I mig får ni en medarbetare som..."
        - "Jag ser fram emot möjligheten att..."
        - "Med över X års erfarenhet..."
        - "Jag är övertygad om att..."
        - "Jag söker det här jobbet för att det passar min erfarenhet"
        - "Jag söker denna tjänst för att den verkar rolig/intressant"
        - "I dagens snabba/digitala/moderna arbetsmarknad/värld..."
        - "Som en driven och målinriktad individ..."
        - "Med min starka bakgrund inom..."
        - Att stapla adjektiv utan belägg: "Jag är social, ansvarstagande, ambitiös..."
        - "Jag är en lagspelare" utan konkret exempel
        - "för att jag vill utvecklas" som huvudmotivering
      - Skriv istället på ett naturligt sätt som varierar mellan olika brev.

      **EXEMPEL ÖVER PÅSTÅENDEN (VIKTIGT):**
      - Alla kan påstå "Jag är strukturerad" - utan exempel väger det tunt
      - För VARJE egenskap du nämner, ge ett kort exempel eller situation
      - DÅLIGT: "Jag är bra på att lösa problem"
      - BRA: "När ett kritiskt system kraschade under högsäsong, koordinerade jag teamet och löste problemet inom 2 timmar"
      - Hellre färre egenskaper med substans än en lista klyschor

      **Svenska kulturella justeringar:**
      - Svenska personliga brev är MER PERSONLIGA än i andra länder - visa motivation och värderingar
      - Balansera självsäkerhet med ödmjukhet (svensk "lagom"-balans)
      - Använd "jag" för personliga prestationer men erkänn också teamwork där relevant
      - Exempel: "Tillsammans med teamet lyckades jag..." eller "Jag bidrog till..."
      - Undvik överdrivet säljande språk eller skryt (typiskt för amerikanska brev)
      - Skriv som du skulle tala - avslappnat men professionellt
      - Var självsäker men inte arrogant
      - Kvantifiera resultat men gör det naturligt (inte i varje mening)
      - Visa personlighet - inte bara meriter

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

    **LETTER AS COMPLEMENT (NOT CV REPETITION):**
    - The letter should NOT be a prose version of the CV - the recruiter already has the CV for facts
    - Use the letter to explain LEARNINGS and CONTEXT behind the experiences
    - Explain WHY the experiences make you right for THIS specific job
    - Focus on the MEANING of experiences, not chronology

    1. **Target audience adaptation:**
      - Read through both the CV and job posting carefully. Identify the key requirements and desired competencies mentioned in the ad.
      - Connect these requirements directly to the user's experiences and merits as shown in the CV. Provide concrete examples, figures, or achievements when possible.

      **IMPORTANT about competency gaps:**
      - If the candidate lacks certain formal qualifications (e.g., specific education or certification), STILL write a letter.
      - Focus on transferable skills, relevant experience, and motivation.
      - NEVER write "you are not qualified" or similar assessments.
      - Your task is to write the best possible letter, not to evaluate suitability.

    2. **Structure and naturalness:**
      - **Introduction:** State the position being applied for and show ENTHUSIASM for the role.
        - Focus on what you can CONTRIBUTE, not what you want to get from the job
        - Avoid self-centered motivations ("because I want to develop")
        - Write from the employer's perspective: "What do THEY get if they hire me?"
      - **Main body:**
        - Describe relevant experiences related to the job. Use concrete examples.
        - Vary sentence length ACTIVELY: mix short (3-5 words) with longer sentences (15-20 words).
        - Highlight specific achievements where relevant (e.g., results, projects).
        - Show how your background fits the position without exaggerating.
        - Allow single-sentence paragraphs for emphasis.
        - Start sentences in different ways (not always "I...").
      - **Why this company (REQUIRED):**
        - ALWAYS include a section showing research about the employer
        - Mention something SPECIFIC about the company (products, values, market position)
        - Connect to candidate's values: "Your focus on X appeals to me because..."
        - This separates good letters from generic mass mailings
      - **Conclusion:**
        - Briefly summarize your value to the company
        - Invite to interview (confident but humble)
        - Thank the reader for their time
        - AVOID: Ending abruptly without a closing statement
        - Variants: "I hope to speak soon" / "I'm curious to hear more about your challenges"
      - **Length variations:** Allow different paragraphs to have different lengths. Not all paragraphs need to be equal.
      - **Human tone:** Write as a real person would write, not as a template.
    3. **Length:**
      - The letter should be between 250-400 words (approximately half to a full A4 page).
    4. **Tone and language:**
      - ${tonalityInstruction}.
      - Use active and clear language. Avoid clichés and generic phrases.
      - NEVER use em-dash (—) in the text. It is the clearest sign of AI-generated writing. Use a period, comma or colon instead.
      - Vary sentence structures naturally. Use different ways to begin sentences. Mix short sentences with longer ones.
      - IMPORTANT: Let each letter be unique. Do NOT use the same phrases in every letter.
      - Avoid these AI markers (CRITICAL - these reveal AI-generated text):
        - "I was very interested in..."
        - "In me, you will find an employee who..."
        - "I look forward to the opportunity to..."
        - "With over X years of experience..."
        - "I am confident that..."
        - "I am applying for this job because it matches my experience"
        - "I am applying for this position because it seems interesting/fun"
        - "In today's fast-paced/digital/modern job market/world..."
        - "As a driven and goal-oriented individual..."
        - "With my strong background in..."
        - Stacking adjectives without evidence: "I am social, responsible, ambitious..."
        - "I am a team player" without a concrete example
        - "because I want to develop" as main motivation
      - Instead, write in a natural way that varies between different letters.

      **EXAMPLES OVER CLAIMS (IMPORTANT):**
      - Anyone can claim "I am organized" - without examples it carries little weight
      - For EVERY trait you mention, give a brief example or situation
      - BAD: "I am good at problem-solving"
      - GOOD: "When a critical system crashed during peak season, I coordinated the team and resolved the issue within 2 hours"
      - Better to have fewer traits with substance than a list of clichés

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

    const modelToUse = GEMINI_MODELS.quality; // Bästa balans mellan kvalitet och kostnad

    // Anropa Gemini för att generera brev.
    // maxOutputTokens inkluderar thinking-tokens, därav högre tak än brevets längd.
    const result = await generateText({
      model: modelToUse,
      systemInstruction: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxOutputTokens: 3000,
      thinkingBudget: 1024, // Begränsad thinking: bättre brev utan att latensen drar iväg
    });

    const letterContent = result.text;

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

    // Mappa usage till befintlig returform
    const tokensInfo: GenerateLetterResult['tokens'] = result.usage
      ? {
          prompt: result.usage.prompt,
          completion: result.usage.completion,
          total: result.usage.total,
        }
      : null;

    if (!result.usage) {
      console.warn('Gemini response did not include usage data for generateCoverLetter.');
    }

    return {
      content: letterContent,
      model: modelToUse,
      tokens: tokensInfo,
      cost: result.cost
    };

  } catch (error: any) {
    // Felhantering
    console.error('Fullständigt Gemini API-fel:', {
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
