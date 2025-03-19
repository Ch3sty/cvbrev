// src/lib/openai/api.ts - Uppdaterad med språkval och förbättrad felhantering
import OpenAI from 'openai';

// Skapa OpenAI-klient med API-nyckel från miljövariabel
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Genererar ett personligt brev baserat på CV och jobbannons
 */
export async function generateCoverLetter(
  cvText: string,
  jobDescription: string,
  tonality: string = 'professional',
  language: string = 'sv'
): Promise<string> {
  try {
    // Validera indata
    if (!cvText || !jobDescription) {
      throw new Error('CV och jobbannons måste innehålla text');
    }

    // Begränsa storleken på texten för att förhindra token-överskridning
    const truncatedCV = cvText.substring(0, 3000); // Begränsa CV till 3000 tecken
    const truncatedJobDesc = jobDescription.substring(0, 2000); // Begränsa jobbannons till 2000 tecken
    
    // Skapa en prompt som instruerar AI:n hur brevet ska genereras
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
      }
    };
    
    const tonalityDescription = tonalityDescriptions[tonality]?.[language as 'sv' | 'en'] || 
                              tonalityDescriptions.professional[language as 'sv' | 'en'];
    
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
    const systemPrompt = language === 'sv' ? `
    Du är en expert på att skriva personliga brev för jobbansökningar. 
    Du ska skapa ett övertygande, personligt brev baserat på personens CV och innehållet i jobbannonsen.
    
    Följande riktlinjer ska följas:
    1. Använd en ${tonalityDescription}.
    2. Matcha kandidatens erfarenheter och färdigheter med kraven i jobbannonsen.
    3. Var specifik och använd exempel från CV:t som relaterar till jobbannonsen.
    4. Använd en tydlig struktur med ${langInst.format}.
    5. Håll texten koncis och relevant, max 400-500 ord.
    6. Skriv på ${langInst.title} med korrekt grammatik och stavning.
    7. Undvik klyschor och generiska fraser.
    8. Fokusera på värdet kandidaten kan tillföra företaget, inte bara deras erfarenheter.
    9. Formatera brevet med styckeindelning.
    10. Inkludera inte kontaktuppgifter eller datum i själva brevet.
    
    Brevet ska ha en professionell ton men samtidigt vara personligt och visa personlighet.
    Börja med en hälsningsfras som "${langInst.greeting}" (beroende på kontexten) och avsluta med "${langInst.closing}".
    ` : `
    You are an expert at writing cover letters for job applications.
    You'll create a compelling, personalized cover letter based on the person's CV and the content of the job advertisement.
    
    Follow these guidelines:
    1. Use a ${tonalityDescription}.
    2. Match the candidate's experiences and skills with the requirements in the job ad.
    3. Be specific and use examples from the CV that relate to the job position.
    4. Use a clear structure with ${langInst.format}.
    5. Keep the text concise and relevant, max 400-500 words.
    6. Write in ${langInst.title} with correct grammar and spelling.
    7. Avoid clichés and generic phrases.
    8. Focus on the value the candidate can bring to the company, not just their experiences.
    9. Format the letter with proper paragraph structure.
    10. Do not include contact information or date in the letter itself.
    
    The letter should have a professional tone while being personal and showing personality.
    Start with a greeting like "${langInst.greeting}" (depending on context) and end with "${langInst.closing}".
    `;
    
    // Skapa användarprompten med CV och jobbannons
    const userPrompt = language === 'sv' ? `
    Skriv ett personligt brev baserat på följande CV och jobbannons:
    
    ## CV:
    ${truncatedCV}
    
    ## Jobbannons:
    ${truncatedJobDesc}
    ` : `
    Write a cover letter based on the following CV and job advertisement:
    
    ## CV:
    ${truncatedCV}
    
    ## Job advertisement:
    ${truncatedJobDesc}
    `;
    
    // Anropa ChatGPT API för att generera brev
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",  // Använd den senaste GPT-4 modellen för bästa resultat
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,  // Balans mellan kreativitet och konsekvens
      max_tokens: 1500,  // Begränsa svarets längd
    });
    
    // Mer robust hantering av svaret
    if (!completion.choices || completion.choices.length === 0) {
      console.error('Inget svar från OpenAI', { 
        completion,
        systemPrompt: systemPrompt.substring(0, 500), 
        userPrompt: userPrompt.substring(0, 500) 
      });
      
      throw new Error('Inget svar mottaget från OpenAI');
    }

    const letterContent = completion.choices[0].message.content;

    // Ytterligare validering av innehållet
    if (!letterContent || letterContent.trim().length < 50) {
      console.error('Genererat brev är för kort eller tomt', { 
        letterContent, 
        contentLength: letterContent?.length 
      });
      
      throw new Error('Det genererade brevet är ogiltigt');
    }

    // Returnera den genererade texten
    return letterContent;
    
  } catch (error: any) {
    // Mer detaljerad och informativ felhantering
    console.error('Fullständigt OpenAI API-fel:', {
      errorMessage: error.message,
      errorName: error.name,
      errorCode: error.code,
      errorDetails: error.response?.data || 'Ingen ytterligare information'
    });

    // Kasta ett mer informativt fel
    throw new Error(
      language === 'sv'
        ? `Misslyckades med att generera brev: ${error.message || 'Okänt fel'}`
        : `Failed to generate letter: ${error.message || 'Unknown error'}`
    );
  }
}