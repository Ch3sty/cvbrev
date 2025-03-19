// src/lib/openai/api.ts
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
    // Begränsa storleken på texten för att förhindra token-överskridning
    const truncatedCV = cvText.substring(0, 3000); // Begränsa CV till 3000 tecken
    const truncatedJobDesc = jobDescription.substring(0, 2000); // Begränsa jobbannons till 2000 tecken
    
    // Skapa en prompt som instruerar AI:n hur brevet ska genereras
    const tonalityDescriptions: { [key: string]: string } = {
      'professional': 'formell och affärsmässig ton med fokus på kompetens och erfarenhet',
      'enthusiastic': 'entusiastisk och energisk ton som visar passion för rollen och företaget',
      'creative': 'kreativ och innovativ ton som framhäver nytänkande och kreativa lösningar',
      'confident': 'självsäker ton som betonar styrkor, prestationer och resultat',
      'balanced': 'balanserad ton som kombinerar professionalitet med personlighet'
    };
    
    const tonalityDescription = tonalityDescriptions[tonality] || tonalityDescriptions.professional;
    
    // Skapa systemprompten
    const systemPrompt = `
    Du är en expert på att skriva personliga brev för jobbansökningar. 
    Du ska skapa ett övertygande, personligt brev baserat på personens CV och innehållet i jobbannonsen.
    
    Följande riktlinjer ska följas:
    1. Använd en ${tonalityDescription}.
    2. Matcha kandidatens erfarenheter och färdigheter med kraven i jobbannonsen.
    3. Var specifik och använd exempel från CV:t som relaterar till jobbannonsen.
    4. Använd en tydlig struktur med introduktion, huvuddel och avslutning.
    5. Håll texten koncis och relevant, max 400-500 ord.
    6. Skriv på ${language === 'sv' ? 'svenska' : 'engelska'} med korrekt grammatik och stavning.
    7. Undvik klyschor och generiska fraser.
    8. Fokusera på värdet kandidaten kan tillföra företaget, inte bara deras erfarenheter.
    9. Formatera brevet med styckeindelning.
    10. Inkludera inte kontaktuppgifter eller datum i själva brevet.
    
    Brevet ska ha en professionell ton men samtidigt vara personligt och visa personlighet.
    `;
    
    // Skapa användarprompten med CV och jobbannons
    const userPrompt = `
    Skriv ett personligt brev baserat på följande CV och jobbannons:
    
    ## CV:
    ${truncatedCV}
    
    ## Jobbannons:
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
    
    // Returnera den genererade texten
    return completion.choices[0].message.content || 
      "Ett fel uppstod vid generering av brevet. Vänligen försök igen.";
    
  } catch (error: any) {
    console.error('OpenAI API-fel:', error);
    throw new Error(
      `Misslyckades med att generera brev: ${error.message || 'Okänt fel'}`
    );
  }
}