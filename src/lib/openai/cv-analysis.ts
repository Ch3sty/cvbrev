// src/lib/openai/cv-analysis.ts
//
// Basanalysens texter till snabbpoängen (inloggad och publik): sammanfattning,
// styrkor, förbättringsområden och nyckelord. Modellen skriver bara text.
// Poängen räknas aldrig här utan med läsbarhetsmodellen i src/lib/cv/poang
// (docs/poangmodell-cv-analys.md), så prompten ber inte om några betyg.
//
// Den gamla premiumanalysen (analyzeCvPremium) hade inga anropare och bad
// modellen hitta på poäng och plus; den är borttagen. Den fulla analysen körs
// i edge-funktionen analyze-cv-background.
import { generateJSON, GEMINI_MODELS } from '@/lib/gemini';
import { maskForModel } from '@/lib/privacy/pii';

interface BasicAnalysisResult {
    analysisType: 'basic'; // För att frontend ska veta vilken typ det är
    summary: string;
    identifiedStrengths: string[]; // Enkel lista med styrkor
    improvementAreas: string[];  // Enkel lista med förbättringsområden
    keywords: string[];
    model?: string;
    cost?: number | null;
    tokens?: { prompt: number; completion: number; total: number; } | null;
}

// --- Grundläggande Analysfunktion ---
export async function analyzeCvBasic(
    cvText: string,
    options: { fullName?: string | null } = {}
): Promise<BasicAnalysisResult> {
    // Personuppgifter maskas innan texten lämnar servern. Platshållarna är
    // stabila strängar, så modellen ser ATT kontaktuppgifter finns och inte
    // föreslår att de ska läggas till.
    const masked = maskForModel(cvText, { fullName: options.fullName, maskUrls: false }).text;
    const truncatedCV = masked.substring(0, 6000);
    const modelToUse = GEMINI_MODELS.fast; // Basic-analys: snabb modell räcker
    const systemPrompt = `
        Du är en AI-assistent som analyserar svenska CV:n för jobbsökande. Ge en kortfattad och konstruktiv analys baserat på innehållet. Fokusera på följande punkter och svara ALLTID i JSON-format med exakt denna struktur:
        {
          "summary": "En övergripande sammanfattning på 1-2 meningar om CV:ts intryck och fullständighet.",
          "identifiedStrengths": ["Lista med 2-4 tydliga styrkor i CV:t, t.ex., 'Tydlig struktur', 'Relevant erfarenhet listad'"],
          "improvementAreas": ["Lista med 2-4 konkreta förbättringsområden, t.ex., 'Kvantifiera prestationer mer', 'Lägg till en sammanfattande profil'"],
          "keywords": ["Lista med 5-8 viktiga nyckelord eller färdigheter som identifierats i CV:t"]
        }
        Ge inga betyg, poäng eller procentsatser. Var ärlig men uppmuntrande. Anpassa texten specifikt till det inskickade CV-innehållet.
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

        return {
            analysisType: 'basic',
            summary: parsedResult.summary || "Sammanfattning saknas.",
            identifiedStrengths: parsedResult.identifiedStrengths || [],
            improvementAreas: parsedResult.improvementAreas || [],
            keywords: parsedResult.keywords || [],
            model: modelToUse,
            cost: result.cost,
            tokens: {
                prompt: result.usage?.prompt || 0,
                completion: result.usage?.completion || 0,
                total: result.usage?.total || 0,
            }
        };
    } catch (error: any) {
        console.error("Fel vid grundläggande CV-analys:", error);
        throw new Error(`Kunde inte utföra grundläggande CV-analys: ${error.message}`);
    }
}
