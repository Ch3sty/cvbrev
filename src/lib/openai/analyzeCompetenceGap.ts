// src/lib/openai/analyzeCompetenceGap.ts
import { generateJSON, GEMINI_MODELS } from '@/lib/gemini';

// --- Typer för Kompetensanalys (Justerade) ---
export interface IdentifiedSkill {
    skill: string;
    source_in_cv: string; // Var hittades den i CVt
    relevance_to_target: 'high' | 'medium' | 'low'; // Hur relevant är den för målet?
}

export interface MissingSkill {
    skill: string; // Beskrivning av gapet (t.ex. "Saknar 1SO Behörighet klass X")
    importance: 'essential' | 'desirable' | 'unclear'; // Viktighet för målet I SVERIGE
    reasoning: string; // Motivering varför det är ett gap för rollen i Sverige
}

// LearningSuggestion-typen behövs inte längre här, den hanteras av route.ts
// export interface LearningSuggestion { ... }

// --- UPPDATERAD RETURTYP (utan suggestedLearningPath från denna funktion) ---
export interface CompetenceAnalysisResult {
    analysisType: 'competence';
    // -- Input context --
    targetDescription: string;
    // -- Analysis results --
    matchScore: number | null;
    cvSummaryForTarget: string;
    identifiedRelevantSkills: IdentifiedSkill[];
    identifiedSkillGaps: MissingSkill[]; // Fokus på att dessa blir korrekta
    // suggestedLearningPath tas bort här, läggs till i route.ts
    // -- Metadata --
    model: string;
    tokens: {
        prompt: number;
        completion: number;
        total: number;
    } | null;
    cost: number | null;
}
// ----------------------------

// --- Argument-typ för funktionen (Oförändrad) ---
type CompetenceAnalysisInput =
    | { mode: 'role'; cvText: string; targetRole: string; targetCountry: string; }
    | { mode: 'jobAd'; cvText: string; jobAdText: string; };

// --- Funktion för Kompetensanalys (Uppdaterad med skarpare prompt) ---
export async function analyzeCompetenceGap(
    input: CompetenceAnalysisInput
): Promise<CompetenceAnalysisResult> { // Returnerar nu typen UTAN suggestedLearningPath

    const { mode, cvText } = input;
    const truncatedCV = cvText.substring(0, 8000); // Hela CV:t för fullständig analys
    const modelToUse = GEMINI_MODELS.quality; // Kvalitetsmodell för tillförlitlig gap-analys

    // --- Dynamisk Promptkonstruktion ---
    let targetInfoPrompt: string;
    let targetDescriptionForOutput: string;

    if (mode === 'role') {
        // Tydligare instruktion om svenska krav
        targetInfoPrompt = `Målet är yrkesrollen "${input.targetRole}" specifikt **i Sverige**. Fokusera på de **typiska svenska kompetenskraven**, ansvarsområdena och **obligatoriska svenska certifieringar, licenser eller formella utbildningskrav** som är vanliga för denna roll **i Sverige**. Om landet angivits som annat än Sverige, anpassa dig men behåll ett kritiskt öga för formella krav.`;
        targetDescriptionForOutput = `Yrkesroll: ${input.targetRole} i ${input.targetCountry}`; // Behåll land här för kontext
    } else { // mode === 'jobAd'
        const truncatedJobAd = input.jobAdText.substring(0, 4000);
        targetInfoPrompt = `Målet är att matcha mot följande specifika jobbannons (troligen från den svenska marknaden):\n\n"""\n${truncatedJobAd}\n"""\n\nAnalysera annonsen noggrant. Identifiera först de **absolut nödvändiga kraven ("ska"-krav)**, sedan starkt önskvärda ("bör"-krav). Notera även eventuella krav på specifika **svenska certifikat/utbildningar**.`;
        targetDescriptionForOutput = `Jobbannons (förkortad)`;
    }

    // --- UPPDATERAD SYSTEM PROMPT ---
    const systemPrompt = `
        Du är en expert karriärrådgivare och rekryterare med djup kunskap om **den svenska arbetsmarknaden**, kompetenskrav och hur man tolkar jobbannonser i en svensk kontext.
        Din uppgift är att analysera ett CV och jämföra det mot ett specificerat mål.
        ${targetInfoPrompt}

        Baserat på din jämförelse, gör följande:
        1.  **Beräkna Matchningspoäng:** Ge en realistisk procentuell matchningspoäng (0-100%) baserat på hur väl CV:t uppfyller målets krav, **särskilt de essentiella kraven för Sverige**.
        2.  **Skriv Sammanfattning:** Ge en kort (2-3 meningar) bedömning av CV:ts styrkor och svagheter i relation till målet **i Sverige**.
        3.  **Identifiera Relevanta Färdigheter:** Lista 3-7 färdigheter från CV:t som är relevanta för målet. Ange relevans ('high', 'medium', 'low') och var i CV:t de hittades.
        4.  **Identifiera Kompetensgap (VIKTIGASTE STEGET):**
            a.  **Prioritera Essentiella Svenska Krav:** Identifiera FÖRST de kompetenser, erfarenheter, **formella utbildningar, licenser, certifikat eller behörigheter (t.ex. 1SO, legitimation, körkortsklass)** som är **absolut nödvändiga ('essential')** för att kunna arbeta i yrkesrollen **i Sverige**, men som saknas i CV:t. Var specifik (t.ex. "Saknar B-körkort", "Saknar Sjuksköterskelegitimation", "Saknar 1SO Behörighet Klass X").
            b.  **Identifiera Övriga Gap:** Lista därefter 2-4 andra viktiga kompetenser som är starkt önskvärda ('desirable') för målet men saknas.
            c.  **Format:** Ange 'importance' ('essential' eller 'desirable') och motivera kort varför det är ett gap för rollen **i Sverige**. Lista de essentiella gapen FÖRST i arrayen.
    `;
    // ---------------------------------

    let content: string | null = null;

    try {
        console.log(`Starting competence analysis (Step 1) for target: ${targetDescriptionForOutput}`);

        // Skapa en timeout promise (50 sekunder)
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini request timeout after 50s')), 50000)
        );

        // Kör Gemini-anropet med timeout. Schemat saneras automatiskt
        // (additionalProperties tas bort) av toGeminiSchema i generateJSON.
        const completionPromise = generateJSON<any>({
            model: modelToUse,
            systemInstruction: systemPrompt,
            prompt: `Här är CV:t som ska analyseras:\n\n${truncatedCV}`,
            temperature: 0.4, // Låg temperatur för konsistenta svar
            maxOutputTokens: 4000, // Inkluderar thinking-tokens
            thinkingBudget: 1024,
            schema: {
                type: "object",
                properties: {
                    matchScore: {
                        type: "number",
                        description: "Matchningspoäng mellan 0-100"
                    },
                    cvSummaryForTarget: {
                        type: "string",
                        description: "Sammanfattning av CV:t i relation till målet"
                    },
                    identifiedRelevantSkills: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                skill: { type: "string" },
                                source_in_cv: { type: "string" },
                                relevance_to_target: {
                                    type: "string",
                                    enum: ["high", "medium", "low"]
                                }
                            },
                            required: ["skill", "source_in_cv", "relevance_to_target"]
                        }
                    },
                    identifiedSkillGaps: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                skill: { type: "string" },
                                importance: {
                                    type: "string",
                                    enum: ["essential", "desirable", "unclear"]
                                },
                                reasoning: { type: "string" }
                            },
                            required: ["skill", "importance", "reasoning"]
                        }
                    }
                },
                required: ["matchScore", "cvSummaryForTarget", "identifiedRelevantSkills", "identifiedSkillGaps"]
            }
        });

        // Vänta på det som slutförs först - completion eller timeout
        const result = await Promise.race([
            completionPromise,
            timeoutPromise
        ]);

        content = result.text;
        console.log("Raw Gemini Response (Step 1):", content.substring(0, 500) + "...");

        const parsedResult = result.data;

        // Kostnadsberäkning
        const usage = result.usage;
        let tokensInfo: CompetenceAnalysisResult['tokens'] = null;
        let calculatedCost: number | null = null;
        if (usage) {
            tokensInfo = { prompt: usage.prompt, completion: usage.completion, total: usage.total };
            calculatedCost = result.cost;
            console.log(`Gemini Usage (Step 1): Prompt=${usage.prompt}, Completion=${usage.completion}, Total=${usage.total}, Cost=${calculatedCost}`);
        } else {
            console.warn("Gemini response did not include usage data for analyzeCompetenceGap.");
        }

        // --- UPPDATERAD: Skapa finalResult utan suggestedLearningPath ---
        const finalResult: CompetenceAnalysisResult = {
            analysisType: 'competence',
            targetDescription: targetDescriptionForOutput,
            matchScore: typeof parsedResult.matchScore === 'number' ? parsedResult.matchScore : null,
            cvSummaryForTarget: parsedResult.cvSummaryForTarget || "Sammanfattning kunde inte genereras.",
            identifiedRelevantSkills: parsedResult.identifiedRelevantSkills || [],
            identifiedSkillGaps: parsedResult.identifiedSkillGaps || [], // Fokus här!
            // suggestedLearningPath tas bort här
            model: modelToUse,
            tokens: tokensInfo,
            cost: calculatedCost
        };
        // --- SLUT UPPDATERING ---

        console.log(`Competence analysis (Step 1) successful for target: ${targetDescriptionForOutput}. Score: ${finalResult.matchScore}%. Identified Gaps: ${finalResult.identifiedSkillGaps.length}`);
        return finalResult; // Returnerar nu objektet utan learning path

    } catch (error: any) {
        console.error(`Fel vid kompetensanalys (Step 1) för target: ${targetDescriptionForOutput}:`, error);
        if (error instanceof SyntaxError && content) {
            console.error("Failed to parse JSON response from OpenAI (Step 1). Raw content:", content);
        }
        // Kasta ett mer specifikt fel om möjligt
        throw new Error(`Kunde inte utföra kompetensanalys (Steg 1): ${error.message}`);
    }
}