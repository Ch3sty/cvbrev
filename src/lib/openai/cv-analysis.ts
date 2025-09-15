// src/lib/openai/cv-analysis.ts
import OpenAI from 'openai';
import { openai, calculateOpenAICost } from './api'; // Importera både klient och kostnadskalkylator från api.ts

// --- Typer för Analysresultat ---
interface Score {
    rating: number; // t.ex. 1-5 eller 1-10
    feedback: string;
}

interface BasicAnalysisResult {
    analysisType: 'basic'; // För att frontend ska veta vilken typ det är
    summary: string;
    identifiedStrengths: string[]; // Enkel lista med styrkor
    improvementAreas: string[];  // Enkel lista med förbättringsområden
    keywords: string[];
    scores: {
        clarityAndStructure?: Score; // Gjort valfri för robusthet
        strongVerbs?: Score;       // Gjort valfri för robusthet
    };
    model?: string;
    cost?: number | null;
    tokens?: { prompt: number; completion: number; total: number; } | null;
}

interface PremiumImprovement {
    area: string; // T.ex. 'Work Experience', 'Skills'
    suggestion: string; // Specifikt förslag
    example?: string; // Konkret exempel på hur det kan skrivas om
}

// Ärv från Basic och lägg till/ersätt fält
interface PremiumAnalysisResult extends Omit<BasicAnalysisResult, 'analysisType' | 'identifiedStrengths' | 'improvementAreas' | 'scores'> {
    analysisType: 'premium';
    summary: string; // Överskrider Basic (kan vara mer detaljerad)
    keywords: string[]; // Överskrider Basic (kan vara fler)
    // Premium-specifika fält
    detailedStrengths?: Array<{ point: string; example?: string }>; // Styrkor med exempel
    detailedImprovements?: PremiumImprovement[]; // Mer strukturerade förbättringar
    atsFriendliness?: { // Applicant Tracking System
        score: number; // 0-100
        feedback: string;
        missingKeywords?: string[];
    };
    quantificationSuggestions?: string[]; // Förslag på var man kan lägga till siffror/resultat
    scores?: { // Mer detaljerade poäng, inkluderar potentiellt de från basic
        overall?: Score;
        clarityAndStructure?: Score; // Kan vara mer detaljerad än basic
        relevance?: Score;
        impactAndResults?: Score;
        strongVerbs?: Score; // Kan finnas separat eller mappas från impactAndResults
    };
     // Inkludera basic-fälten också, även om de kanske inte fylls från premium-prompten
    identifiedStrengths: string[];
    improvementAreas: string[];
}

// --- Grundläggande Analysfunktion ---
export async function analyzeCvBasic(cvText: string): Promise<BasicAnalysisResult> {
    // ... (funktionens kod är oförändrad) ...
    const truncatedCV = cvText.substring(0, 6000);
    const modelToUse = "gpt-4o";
    const systemPrompt = `
        Du är en AI-assistent som analyserar svenska CV:n för jobbsökande. Ge en kortfattad och konstruktiv analys baserat på innehållet. Fokusera på följande punkter och svara ALLTID i JSON-format med exakt denna struktur:
        {
          "summary": "En övergripande sammanfattning på 1-2 meningar om CV:ts intryck och fullständighet.",
          "identifiedStrengths": ["Lista med 2-4 tydliga styrkor i CV:t, t.ex., 'Tydlig struktur', 'Relevant erfarenhet listad'"],
          "improvementAreas": ["Lista med 2-4 konkreta förbättringsområden, t.ex., 'Kvantifiera prestationer mer', 'Lägg till en sammanfattande profil'"],
          "keywords": ["Lista med 5-8 viktiga nyckelord eller färdigheter som identifierats i CV:t"],
          "scores": {
            "clarityAndStructure": { "rating": number (1-5), "feedback": "Kort feedback om tydlighet och struktur" },
            "strongVerbs": { "rating": number (1-5), "feedback": "Kort feedback om användningen av starka verb" }
          }
        }
        Ge betyg (rating) från 1 (Svagt) till 5 (Utmärkt). Var ärlig men uppmuntrande i din feedback. Anpassa feedbacken specifikt till det inskickade CV-innehållet.
    `;
    try {
        const completion = await openai.chat.completions.create({
            model: modelToUse,
            messages: [ { role: "system", content: systemPrompt }, { role: "user", content: `Analysera följande CV:\n\n${truncatedCV}` } ],
            temperature: 0.5, max_tokens: 800, response_format: { type: "json_object" }
        });
        const content = completion.choices[0].message.content || '{}';
        const parsedResult = JSON.parse(content);

        // Beräkna kostnad och tokens
        const promptTokens = completion.usage?.prompt_tokens || 0;
        const completionTokens = completion.usage?.completion_tokens || 0;
        const totalTokens = completion.usage?.total_tokens || 0;
        const cost = calculateOpenAICost(modelToUse, promptTokens, completionTokens);

        // Säkerställ att alla obligatoriska basic-fält finns
        return {
            analysisType: 'basic',
            summary: parsedResult.summary || "Sammanfattning saknas.",
            identifiedStrengths: parsedResult.identifiedStrengths || [],
            improvementAreas: parsedResult.improvementAreas || [],
            keywords: parsedResult.keywords || [],
            scores: parsedResult.scores || {
                clarityAndStructure: { rating: 0, feedback: "Poäng saknas." },
                strongVerbs: { rating: 0, feedback: "Poäng saknas." }
            },
            model: modelToUse,
            cost: cost,
            tokens: {
                prompt: promptTokens,
                completion: completionTokens,
                total: totalTokens
            }
        };
    } catch (error: any) {
        console.error("Fel vid grundläggande CV-analys:", error);
        throw new Error(`Kunde inte utföra grundläggande CV-analys: ${error.message}`);
    }
}

// --- Premium Analysfunktion ---
export async function analyzeCvPremium(cvText: string): Promise<PremiumAnalysisResult> {
    // ... (kod för prompt och API-anrop är oförändrad) ...
    const truncatedCV = cvText.substring(0, 8000);
    const modelToUse = "gpt-4.1";
    const systemPrompt = `
        Du är en expert på CV-granskning och rekrytering med djup förståelse för Applicant Tracking Systems (ATS). Analysera följande svenska CV i detalj. Ge konkreta, handlingsorienterade råd och exempel. Svara ALLTID i JSON-format med exakt denna struktur:
        {
          "summary": "En detaljerad sammanfattning (3-4 meningar) som lyfter fram CV:ts kärnbudskap, målgruppsanpassning och övergripande intryck.",
          "detailedStrengths": [ { "point": "Specifik identifierad styrka", "example": "Konkret exempel från CV:t som illustrerar styrkan, t.ex., 'Användningen av projekt X för att visa Y-kompetens är effektiv.'" } ],
          "detailedImprovements": [ { "area": "Område för förbättring (t.ex. 'Arbetslivserfarenhet', 'Profilsammanfattning', 'Kompetenser')", "suggestion": "Specifikt och handlingsbart förslag, t.ex. 'Kvantifiera resultaten under rollen som Projektledare'", "example": "Eventuellt ett kort exempel på hur det kan skrivas om, t.ex. 'Istället för Ansvarade för budget, skriv Ledde budget på X SEK och uppnådde Y% besparing.'" } ],
          "keywords": ["Omfattande lista med identifierade nyckelord och tekniska termer (10-15 st)"],
          "atsFriendliness": { "score": number (0-100), "feedback": "Specifik feedback om ATS-läsbarhet, formatering, och nyckelordsanvändning.", "missingKeywords": ["Eventuell lista på 3-5 viktiga nyckelord som troligen saknas baserat på vanliga roller/branscher, om det går att avgöra"] },
          "quantificationSuggestions": [ "Lista med 2-4 specifika punkter i CV:t där kvantifiering skulle stärka intrycket, t.ex., 'Resultat under rollen [Rollnamn]', 'Effekten av projekt [Projektnamn]'" ],
          "scores": { "overall": { "rating": number (1-10), "feedback": "Övergripande bedömning" }, "clarityAndStructure": { "rating": number (1-10), "feedback": "Detaljerad feedback om läsbarhet, struktur, sektionsindelning." }, "relevance": { "rating": number (1-10), "feedback": "Bedömning av hur väl innehållet verkar anpassat (generellt, då vi inte har jobbannons här)." }, "impactAndResults": { "rating": number (1-10), "feedback": "Feedback om användning av resultat, prestationer och starka verb." } }
        }
        Ge betyg (rating) från 1 (Mycket svagt) till 10 (Utmärkt). Ge många konkreta exempel i 'detailedStrengths' och 'detailedImprovements'. Var kritisk men konstruktiv.
    `;

     try {
        const completion = await openai.chat.completions.create({
            model: modelToUse,
            messages: [ { role: "system", content: systemPrompt }, { role: "user", content: `Analysera följande CV i detalj:\n\n${truncatedCV}` } ],
            temperature: 0.6, max_tokens: 2000, response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content || '{}';
        const parsedResult = JSON.parse(content);

        // Beräkna kostnad och tokens
        const promptTokens = completion.usage?.prompt_tokens || 0;
        const completionTokens = completion.usage?.completion_tokens || 0;
        const totalTokens = completion.usage?.total_tokens || 0;
        const cost = calculateOpenAICost(modelToUse, promptTokens, completionTokens);

        // *** UPPDATERAT finalResult-OBJEKT ***
        const finalResult: PremiumAnalysisResult = {
          analysisType: 'premium',
          summary: parsedResult.summary || "Sammanfattning kunde inte genereras.",
          keywords: parsedResult.keywords || [], // Från premium-prompten

          // Premium fields
          detailedStrengths: parsedResult.detailedStrengths || [],
          detailedImprovements: parsedResult.detailedImprovements || [],
          atsFriendliness: parsedResult.atsFriendliness,
          quantificationSuggestions: parsedResult.quantificationSuggestions || [],

          // Premium Scores
          scores: {
              overall: parsedResult.scores?.overall,
              clarityAndStructure: parsedResult.scores?.clarityAndStructure,
              relevance: parsedResult.scores?.relevance,
              impactAndResults: parsedResult.scores?.impactAndResults,
              // Försök mappa 'impactAndResults' till 'strongVerbs' för kompatibilitet med ScoreSection
              strongVerbs: parsedResult.scores?.impactAndResults ? {
                  rating: parsedResult.scores.impactAndResults.rating, // Använd samma betyg
                  feedback: parsedResult.scores.impactAndResults.feedback // Använd samma feedback
              } : undefined
          },

          // <<< INKLUDERA DE FÄLT SOM KRÄVS FÖR ATT UPPFYLLA PremiumAnalysisResult-TYPEN >>>
          // Även om premium-prompten inte direkt ber om dessa,
          // så behöver de finnas här (kan vara tomma).
          // Om din PremiumAnalysisResult-typ INTE ärver/inkluderar dessa, kan du ta bort dem.
          identifiedStrengths: [], // Sätt till tom array som standard
          improvementAreas: [],   // Sätt till tom array som standard

          // Lägg till kostnads- och tokeninformation
          model: modelToUse,
          cost: cost,
          tokens: {
              prompt: promptTokens,
              completion: completionTokens,
              total: totalTokens
          }
        };
        // *** SLUT PÅ UPPDATERING ***

        return finalResult;

    } catch (error: any) {
        console.error("Fel vid premium CV-analys:", error);
        throw new Error(`Kunde inte utföra premium CV-analys: ${error.message}`);
    }
}