// src/lib/openai/analyzeCompetenceGap.ts
import { openai } from './api';
import { calculateOpenAICost } from './api';

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
    const truncatedCV = cvText.substring(0, 8000);
    const modelToUse = "gpt-5"; // Uppgraderat till GPT-5 för bättre prestanda och lägre kostnad

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

        Svara ALLTID i JSON-format med exakt denna struktur (OBS: ingen 'suggestedLearningPath' här):
        {
          "matchScore": number (0-100),
          "cvSummaryForTarget": "Din sammanfattande bedömning för Sverige (2-3 meningar).",
          "identifiedRelevantSkills": [
            { "skill": "...", "source_in_cv": "...", "relevance_to_target": "..." }
          ],
          "identifiedSkillGaps": [
            // Essentiella gap först
            { "skill": "...", "importance": "essential", "reasoning": "..." },
            // Därefter desirable gap
            { "skill": "...", "importance": "desirable", "reasoning": "..." }
          ]
        }
    `;
    // ---------------------------------

    let content: string | null = null;

    try {
        console.log(`Starting competence analysis (Step 1) for target: ${targetDescriptionForOutput}`);
        const completion = await openai.chat.completions.create({
            model: modelToUse,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Här är CV:t som ska analyseras:\n\n${truncatedCV}` }
            ],
            temperature: 0.4, // Ännu lägre temp för att fokusera på instruktioner
            max_completion_tokens: 1800, // GPT-5 använder max_completion_tokens
            response_format: { type: "json_object" }
        });

        content = completion.choices[0].message.content || '{}';
        console.log("Raw OpenAI Response (Step 1):", content.substring(0, 500) + "...");

        const parsedResult = JSON.parse(content);

        // Kostnadsberäkning
        const usage = completion.usage;
        let tokensInfo: CompetenceAnalysisResult['tokens'] = null;
        let calculatedCost: number | null = null;
        if (usage) {
            const promptTokens = usage.prompt_tokens ?? 0;
            const completionTokens = usage.completion_tokens ?? 0;
            tokensInfo = { prompt: promptTokens, completion: completionTokens, total: usage.total_tokens ?? (promptTokens + completionTokens) };
            calculatedCost = calculateOpenAICost(modelToUse, promptTokens, completionTokens);
            console.log(`OpenAI Usage (Step 1): Prompt=${promptTokens}, Completion=${completionTokens}, Total=${tokensInfo.total}, Cost=${calculatedCost}`);
        } else {
            console.warn("OpenAI response did not include usage data for analyzeCompetenceGap.");
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