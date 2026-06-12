// src/lib/openai/cv-analysis.ts
import { generateJSON, GEMINI_MODELS } from '@/lib/gemini';

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
    const modelToUse = GEMINI_MODELS.fast; // Basic-analys: snabb modell räcker
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
        const result = await generateJSON<any>({
            model: modelToUse,
            systemInstruction: systemPrompt,
            prompt: `Analysera följande CV:\n\n${truncatedCV}`,
            temperature: 0.5,
            maxOutputTokens: 1500,
            thinkingBudget: 0,
        });
        const parsedResult = result.data;

        // Beräkna kostnad och tokens
        const promptTokens = result.usage?.prompt || 0;
        const completionTokens = result.usage?.completion || 0;
        const totalTokens = result.usage?.total || 0;
        const cost = result.cost;

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

// --- Helper: Analyze a batch of roles ---
async function analyzeRoleBatch(
    cvText: string,
    roles: any[],
    modelToUse: string,
    batchIndex: number
): Promise<{ roleBasedImprovements: RoleBasedImprovement[], tokens: any, cost: number | null }> {
    const truncatedCV = cvText.substring(0, 8000);

    // Bygg roll-kontext för denna batch
    const rolesContext = '\n\n=== ROLLER ATT ANALYSERA ===\n' + roles.map((r: any, idx: number) =>
        `ROLL ${idx + 1}: ${r.title} @ ${r.company} (${r.period})\nText: ${(r.description || r.originalText || '').substring(0, 300)}`
    ).join('\n---\n');

    const systemPrompt = `Du är en CV-expert med ATS-kunskap. Analysera roller från ett svenskt CV och generera roll-baserade förbättringar.

VIKTIGT: För VARJE roll nedan, generera EN komplett förbättrad CV-text med ATS-nyckelord, kvantifiering, starka verb och grammatik.

JSON-struktur (svara ENDAST med JSON):
{
  "roleBasedImprovements": [{
    "roleTitle": "Titel från CV",
    "company": "Företag",
    "period": "Period",
    "currentText": "Nuvarande text",
    "improvements": {
      "hasQuantification": boolean,
      "keywords": ["3-5 nyckelord"],
      "grammarIssues": ["fel"] eller [],
      "atsOptimization": boolean
    },
    "suggestedText": "KOMPLETT färdig CV-text (80+ ord) med konkreta siffror, ATS-nyckelord och starka verb. MÅSTE vara användbar text, INTE instruktioner!",
    "atsImpact": number (0-20)
  }]
}

KRAV för suggestedText:
1. Fullständig CV-text, INTE instruktioner
2. Konkreta siffror (teamstorlek, budget, resultat, %)
3. Minst 80 ord, sammanhängande text
4. Starka verb: ledde, utvecklade, implementerade, ökade
5. Bransch-ATS-nyckelord naturligt integrerade

Exempel KORREKT suggestedText: "Ledde träningsanläggning med 3500 medlemmar och team på 15 anställda. Budgetansvar 5 MSEK årligen. Implementerade nya rutiner som ökade retention med 25% och minskade personalomsättning från 40% till 15% på 18 månader. Utvecklade träningsprogram som resulterade i 95% kundnöjdhet (NPS)."

Var konstruktiv och praktisk.`;

    const userPrompt = `Här är CV-kontexten:\n\n${truncatedCV}\n\n${rolesContext}\n\nGenerera förbättringsförslag för varje roll ovan.`;

    const result = await generateJSON<any>({
        model: modelToUse,
        systemInstruction: systemPrompt,
        prompt: userPrompt,
        temperature: 0.6,
        maxOutputTokens: 4000, // Inkluderar thinking-tokens
        thinkingBudget: 1024,
    });

    const parsedResult = result.data;

    // Beräkna kostnad och tokens
    const promptTokens = result.usage?.prompt || 0;
    const completionTokens = result.usage?.completion || 0;
    const totalTokens = result.usage?.total || 0;
    const cost = result.cost;

    console.log(`[analyzeRoleBatch ${batchIndex}] Analyzed ${roles.length} roles: ${promptTokens} prompt + ${completionTokens} completion tokens ($${cost !== null ? cost.toFixed(4) : 'N/A'})`);

    return {
        roleBasedImprovements: parsedResult.roleBasedImprovements || [],
        tokens: { prompt: promptTokens, completion: completionTokens, total: totalTokens },
        cost: cost
    };
}

// --- Premium Analysfunktion ---
export async function analyzeCvPremium(cvText: string, parsedCV?: any): Promise<PremiumAnalysisResult> {
    const startTime = Date.now();
    const truncatedCV = cvText.substring(0, 8000);
    const modelToUse = GEMINI_MODELS.quality; // Premium-analys: kvalitetsmodell

    // Batch-baserad roll-analys: Dela upp roller i grupper om 3
    const ROLES_PER_BATCH = 3;
    const allRoleImprovements: RoleBasedImprovement[] = [];
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalCost = 0;

    if (parsedCV && parsedCV.roles && parsedCV.roles.length > 0) {
        console.log(`[analyzeCvPremium] Starting batch analysis for ${parsedCV.roles.length} roles (${ROLES_PER_BATCH} per batch)`);

        // Dela upp i batchar
        const batches = [];
        for (let i = 0; i < parsedCV.roles.length; i += ROLES_PER_BATCH) {
            batches.push(parsedCV.roles.slice(i, i + ROLES_PER_BATCH));
        }

        // Analysera varje batch sekventiellt
        for (let i = 0; i < batches.length; i++) {
            const batchStartTime = Date.now();
            const batch = batches[i];

            try {
                const batchResult = await analyzeRoleBatch(cvText, batch, modelToUse, i + 1);
                allRoleImprovements.push(...batchResult.roleBasedImprovements);

                totalPromptTokens += batchResult.tokens.prompt;
                totalCompletionTokens += batchResult.tokens.completion;
                totalCost += batchResult.cost || 0;

                const batchDuration = Date.now() - batchStartTime;
                console.log(`[analyzeCvPremium] Batch ${i + 1}/${batches.length} completed in ${batchDuration}ms (${batchResult.roleBasedImprovements.length} improvements)`);
            } catch (error: any) {
                console.error(`[analyzeCvPremium] Batch ${i + 1} failed:`, error.message);
                // Fortsätt med nästa batch även om en batch misslyckas
            }
        }
    }

    // Nu gör vi en snabb general analysis (utan roll-detaljer)
    const generalSystemPrompt = `Du är en CV-expert med ATS-kunskap. Ge en övergripande analys av detta svenska CV.

JSON-struktur (svara ENDAST med JSON):
{
  "summary": "3-4 meningar om CV:ts styrkor och intryck",
  "detailedStrengths": [{"point": "Styrka", "example": "Exempel från CV"}],
  "generalImprovements": [{"area": "Område", "suggestion": "Förslag", "example": "Exempel"}],
  "keywords": ["10-15 identifierade nyckelord"],
  "atsFriendliness": {"score": number (0-100), "feedback": "ATS-feedback", "missingKeywords": ["3-5 saknade ord"]},
  "quantificationSuggestions": ["2-4 kvantifieringsförslag"],
  "scores": {
    "overall": {"rating": number (1-10), "feedback": "Text"},
    "clarityAndStructure": {"rating": number (1-10), "feedback": "Text"},
    "relevance": {"rating": number (1-10), "feedback": "Text"},
    "impactAndResults": {"rating": number (1-10), "feedback": "Text"}
  }
}

Ge betyg 1-10. Var konstruktiv.`;

     try {
        console.log(`[analyzeCvPremium] Starting general analysis (role analysis completed with ${allRoleImprovements.length} improvements)`);
        const userPrompt = `Analysera följande CV övergripande:\n\n${truncatedCV}`;

        const aiStartTime = Date.now();
        const result = await generateJSON<any>({
            model: modelToUse,
            systemInstruction: generalSystemPrompt,
            prompt: userPrompt,
            temperature: 0.6,
            maxOutputTokens: 3000, // Inkluderar thinking-tokens
            thinkingBudget: 1024,
        });
        const aiDuration = Date.now() - aiStartTime;
        console.log(`[analyzeCvPremium] General analysis finished in ${aiDuration}ms`);

        const parsedResult = result.data;

        // Beräkna kostnad och tokens (lägg till general analysis tokens)
        const promptTokens = result.usage?.prompt || 0;
        const completionTokens = result.usage?.completion || 0;
        const totalTokens = result.usage?.total || 0;
        const cost = result.cost;

        totalPromptTokens += promptTokens;
        totalCompletionTokens += completionTokens;
        totalCost += cost || 0;

        const totalDuration = Date.now() - startTime;
        console.log(`[analyzeCvPremium] Total analysis time: ${totalDuration}ms (${allRoleImprovements.length} roles analyzed)`);
        console.log(`[analyzeCvPremium] Total token usage: ${totalPromptTokens} prompt + ${totalCompletionTokens} completion = ${totalPromptTokens + totalCompletionTokens} total ($${totalCost.toFixed(4)})`);

        // *** UPPDATERAT finalResult-OBJEKT ***
        const finalResult: PremiumAnalysisResult = {
          analysisType: 'premium',
          summary: parsedResult.summary || "Sammanfattning kunde inte genereras.",
          keywords: parsedResult.keywords || [],

          // Premium fields
          detailedStrengths: parsedResult.detailedStrengths || [],
          detailedImprovements: parsedResult.detailedImprovements || [], // Legacy fallback
          roleBasedImprovements: allRoleImprovements, // Från batch-analysen
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
                  rating: parsedResult.scores.impactAndResults.rating,
                  feedback: parsedResult.scores.impactAndResults.feedback
              } : undefined
          },

          identifiedStrengths: [],
          improvementAreas: [],

          // Lägg till kostnads- och tokeninformation (totalt från alla batchar + general analysis)
          model: modelToUse,
          cost: totalCost,
          tokens: {
              prompt: totalPromptTokens,
              completion: totalCompletionTokens,
              total: totalPromptTokens + totalCompletionTokens
          }
        };

        return finalResult;

    } catch (error: any) {
        console.error("Fel vid premium CV-analys:", error);
        throw new Error(`Kunde inte utföra premium CV-analys: ${error.message}`);
    }
}