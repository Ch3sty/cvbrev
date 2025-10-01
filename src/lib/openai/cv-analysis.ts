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

interface RoleBasedImprovement {
    roleTitle: string;
    company: string;
    period: string;
    currentText: string;
    improvements: {
        hasQuantification: boolean;
        keywords: string[];
        grammarIssues: string[];
        atsOptimization: boolean;
    };
    suggestedText: string;
    atsImpact: number;
}

// Ärv från Basic och lägg till/ersätt fält
interface PremiumAnalysisResult extends Omit<BasicAnalysisResult, 'analysisType' | 'identifiedStrengths' | 'improvementAreas' | 'scores'> {
    analysisType: 'premium';
    summary: string; // Överskrider Basic (kan vara mer detaljerad)
    keywords: string[]; // Överskrider Basic (kan vara fler)
    // Premium-specifika fält
    detailedStrengths?: Array<{ point: string; example?: string }>; // Styrkor med exempel
    detailedImprovements?: PremiumImprovement[]; // Mer strukturerade förbättringar (legacy)
    roleBasedImprovements?: RoleBasedImprovement[]; // Roll-baserade förbättringar (nytt)
    generalImprovements?: Array<{ area: string; suggestion: string; example?: string }>; // Allmänna förbättringar
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
export async function analyzeCvPremium(cvText: string, parsedCV?: any): Promise<PremiumAnalysisResult> {
    const truncatedCV = cvText.substring(0, 8000);
    const modelToUse = "gpt-4.1";

    // Bygg roll-kontext om parsedCV finns
    let rolesContext = '';
    if (parsedCV && parsedCV.roles && parsedCV.roles.length > 0) {
        rolesContext = '\n\n=== IDENTIFIERADE ROLLER ===\n' + parsedCV.roles.map((r: any, idx: number) =>
            `\nROLL ${idx + 1}:\nTitel: ${r.title}\nFöretag: ${r.company}\nPeriod: ${r.period}\nNuvarande text: ${r.description || r.originalText}`
        ).join('\n---');
    }

    const systemPrompt = `
        Du är en expert på CV-granskning och rekrytering med djup förståelse för Applicant Tracking Systems (ATS). Analysera följande svenska CV i detalj och generera ROLL-BASERADE förbättringar.

        VIKTIGT: För VARJE identifierad yrkesroll, generera EN komplett förbättrad version som kombinerar ALLA förbättringstyper (ATS-nyckelord, kvantifiering, grammatik, starka verb) i SAMMA text.

        Svara ALLTID i JSON-format med exakt denna struktur:
        {
          "summary": "En detaljerad sammanfattning (3-4 meningar) som lyfter fram CV:ts kärnbudskap, målgruppsanpassning och övergripande intryck.",
          "detailedStrengths": [ { "point": "Specifik identifierad styrka", "example": "Konkret exempel från CV:t som illustrerar styrkan, t.ex., 'Användningen av projekt X för att visa Y-kompetens är effektiv.'" } ],
          "roleBasedImprovements": [
            {
              "roleTitle": "Exakt titel från CV",
              "company": "Företagsnamn",
              "period": "Tidsperiod",
              "currentText": "Nuvarande text för denna roll från CV:t",
              "improvements": {
                "hasQuantification": true/false,
                "keywords": ["nyckelord1", "nyckelord2", "nyckelord3"],
                "grammarIssues": ["specifikt fel1", "specifikt fel2"] eller [],
                "atsOptimization": true/false
              },
              "suggestedText": "KOMPLETT förbättrad CV-text för denna roll som KOMBINERAR alla förbättringar: kvantifiering MED konkreta siffror, bransch-specifika ATS-nyckelord, korrigerad grammatik OCH starka resultat-fokuserade verb i EN sammanhängande professionell text (minst 80 ord). Texten MÅSTE vara färdig CV-text som kan användas direkt, INTE en beskrivning av vad som ska göras.",
              "atsImpact": number (poäng-förbättring 0-20)
            }
          ],
          "generalImprovements": [
            {
              "area": "Profilsammanfattning" | "Färdigheter" | "Utbildning",
              "suggestion": "Specifikt förslag",
              "example": "Konkret exempel på förbättring"
            }
          ],
          "keywords": ["Omfattande lista med identifierade nyckelord och tekniska termer (10-15 st)"],
          "atsFriendliness": { "score": number (0-100), "feedback": "Specifik feedback om ATS-läsbarhet, formatering, och nyckelordsanvändning.", "missingKeywords": ["Eventuell lista på 3-5 viktiga nyckelord som troligen saknas baserat på vanliga roller/branscher"] },
          "quantificationSuggestions": [ "Lista med 2-4 specifika punkter i CV:t där kvantifiering skulle stärka intrycket" ],
          "scores": { "overall": { "rating": number (1-10), "feedback": "Övergripande bedömning" }, "clarityAndStructure": { "rating": number (1-10), "feedback": "Detaljerad feedback om läsbarhet, struktur, sektionsindelning." }, "relevance": { "rating": number (1-10), "feedback": "Bedömning av hur väl innehållet verkar anpassat." }, "impactAndResults": { "rating": number (1-10), "feedback": "Feedback om användning av resultat, prestationer och starka verb." } }
        }

        KRITISKA REGLER FÖR suggestedText:
        1. MÅSTE vara FULLSTÄNDIG CV-text för rollen, INTE en beskrivning eller instruktion
        2. MÅSTE inkludera KONKRETA SIFFROR för kvantifiering (teamstorlek, budget, resultat, procentuella förbättringar)
        3. MÅSTE vara minst 80 ord lång och läsbar som sammanhängande text
        4. MÅSTE använda starka aktiva verb (ledde, utvecklade, implementerade, ökade, förbättrade)
        5. MÅSTE innehålla bransch-specifika ATS-nyckelord naturligt integrerade
        6. Generera EN förbättring PER ROLL, inte flera varianter

        EXEMPEL PÅ KORREKT suggestedText för en Platschef-roll:
        "Ledde Stockholms största träningsanläggning (Fitnessworld Skärholmen) med 3500 medlemmar och ansvar för team på 15 anställda. Hanterade budgetansvar på 5 MSEK årligen med fokus på drift, inköp, personalutveckling och medlemssystem. Implementerade nya rutiner för kundnöjdhet som ökade retentionen med 25% och minskade personalomsättningen från 40% till 15% på 18 månader. Ansvarade för webbsida, digital marknadsföring och statistikuppföljning. Utvecklade och genomförde träningsprogram som resulterade i 95% kundnöjdhet enligt NPS-mätningar."

        EXEMPEL PÅ FEL suggestedText (undvik dessa):
        ❌ "Förbättrad version kommer att inkludera teamstorlek och budget" ← Detta är INTE CV-text!
        ❌ "Lägg till konkreta siffror om medlemmar" ← Detta är en instruktion, inte CV-text!
        ❌ "Ansvarig för drift" ← För kort och saknar kvantifiering

        Ge betyg (rating) från 1 (Mycket svagt) till 10 (Utmärkt). Var kritisk men konstruktiv.
    `;

     try {
        const userPrompt = `Analysera följande CV i detalj och generera roll-baserade förbättringar:\n\n${truncatedCV}${rolesContext}`;

        const completion = await openai.chat.completions.create({
            model: modelToUse,
            messages: [ { role: "system", content: systemPrompt }, { role: "user", content: userPrompt } ],
            temperature: 0.6, max_tokens: 3000, response_format: { type: "json_object" }
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
          detailedImprovements: parsedResult.detailedImprovements || [], // Legacy fallback
          roleBasedImprovements: parsedResult.roleBasedImprovements || [], // Nytt roll-baserat format
          generalImprovements: parsedResult.generalImprovements || [],
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