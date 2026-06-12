import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { geminiGenerate, geminiGenerateJSON, GEMINI_MODELS } from '../_shared/gemini.ts';

// KRITISK FIX: Validera och normalisera roleImprovement-objekt
function sanitizeRoleImprovement(role: any): any {
  // Validera att keywords är array av STRINGS (inte objekt, undefined, null, eller tom sträng)
  const validateStringArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(item => typeof item === 'string' && item !== null && item !== undefined && item.trim().length > 0)
      .map(item => String(item).trim());
  };

  // Validera matchKeywords-objekt
  const validateMatchKeywords = (mk: any) => {
    if (!mk || typeof mk !== 'object') {
      return {
        directSkills: [],
        implicitSkills: [],
        tools: [],
        responsibilities: [],
        industryTerms: []
      };
    }

    return {
      directSkills: validateStringArray(mk.directSkills),
      implicitSkills: validateStringArray(mk.implicitSkills),
      tools: validateStringArray(mk.tools),
      responsibilities: validateStringArray(mk.responsibilities),
      industryTerms: validateStringArray(mk.industryTerms)
    };
  };

  return {
    roleTitle: role?.roleTitle || 'Okänd roll',
    company: role?.company || 'Okänt företag',
    period: role?.period || '',
    currentText: role?.currentText || '',
    suggestedText: role?.suggestedText || '',
    improvements: {
      hasQuantification: role?.improvements?.hasQuantification ?? false,
      keywords: validateStringArray(role?.improvements?.keywords),
      grammarIssues: validateStringArray(role?.improvements?.grammarIssues),
      atsOptimization: role?.improvements?.atsOptimization ?? false
    },
    matchKeywords: validateMatchKeywords(role?.matchKeywords),
    atsImpact: typeof role?.atsImpact === 'number' ? role.atsImpact : 0
  };
}

Deno.serve(async (req) => {
  let jobId: string | undefined;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestData = await req.json();
    jobId = requestData.jobId;
    const { cvId } = requestData;

    if (!jobId || !cvId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields (jobId or cvId)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Job ${jobId}] Starting background analysis for CV ${cvId}`);

    // Fetch CV text from cv_texts table
    const { data: cv, error: cvError } = await supabase
      .from('cv_texts')
      .select('cv_text')
      .eq('id', cvId)
      .single();

    if (cvError || !cv) {
      console.error(`[Job ${jobId}] Failed to fetch CV:`, cvError);
      return new Response(
        JSON.stringify({ error: `Failed to fetch CV: ${cvError?.message || 'CV not found'}` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cvText = cv.cv_text;
    console.log(`[Job ${jobId}] CV text fetched (${cvText.length} chars)`);

    await supabase
      .from('cv_analysis_jobs')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // ALLA användare får nu fullständig premium-analys
    // Premium-användare får andra förmåner (fler analyser/vecka, fler mallar, etc)
    const useFullAnalysis = true;

    // 1. Parse CV into structured CVMetadata format (ONLY parsing needed)
    console.log(`[Job ${jobId}] Step 1/5: Parsing CV into structured format (${cvText.length} chars)...`);
    const structuredParsingResult = await geminiGenerateJSON({
      model: GEMINI_MODELS.fast,
      systemInstruction: 'Du är en CV-parser. Extrahera ALL information från CV:t och returnera som strukturerad JSON. Var EXTREMT noggrann med att bevara all text och formatering.',
      prompt: `Parsa detta CV till strukturerad JSON:\n\n${cvText}\n\nReturnera JSON med EXAKT detta format:\n{\n  "personalInfo": {\n    "fullName": string,\n    "email": string,\n    "phone": string,\n    "address": string,\n    "linkedin": string\n  },\n  "summary": string,\n  "experience": [{\n    "position": string,\n    "company": string,\n    "location": string,\n    "startDate": string,\n    "endDate": string (eller null om nuvarande),\n    "description": string[]\n  }],\n  "education": [{\n    "degree": string,\n    "institution": string,\n    "graduationYear": string,\n    "description": string\n  }],\n  "skills": [{\n    "category": string,\n    "skills": string[]\n  }],\n  "languages": [{\n    "language": string,\n    "proficiency": string\n  }],\n  "certifications": [{\n    "name": string,\n    "issuer": string,\n    "date": string\n  }],\n  "references": string\n}\n\nVIKTIGT: Bevara ALL originaltext. Description-fält ska vara arrays med meningar/punkter.`,
      temperature: 0.2,
      maxOutputTokens: 6000,
      thinkingBudget: 0,
    });

    const structuredCV = structuredParsingResult.data;

    // FIX: Sortera experience i OMVÄND KRONOLOGI (senaste först, äldsta sist)
    if (structuredCV.experience && Array.isArray(structuredCV.experience)) {
      structuredCV.experience.sort((a: any, b: any) => {
        // Nuvarande jobb (endDate = null eller tom) ska alltid vara först
        const aIsCurrent = !a.endDate || a.endDate === 'Nuvarande' || a.endDate.toLowerCase() === 'nuvarande';
        const bIsCurrent = !b.endDate || b.endDate === 'Nuvarande' || b.endDate.toLowerCase() === 'nuvarande';

        if (aIsCurrent && !bIsCurrent) return -1;
        if (!aIsCurrent && bIsCurrent) return 1;

        // Annars sortera efter startDate (senaste först)
        const yearA = parseInt(a.startDate) || 0;
        const yearB = parseInt(b.startDate) || 0;
        return yearB - yearA;
      });
    }

    // FIX: Sortera education i OMVÄND KRONOLOGI (senaste först)
    if (structuredCV.education && Array.isArray(structuredCV.education)) {
      structuredCV.education.sort((a: any, b: any) => {
        const yearA = parseInt(a.graduationYear) || 0;
        const yearB = parseInt(b.graduationYear) || 0;
        return yearB - yearA;
      });
    }

    console.log(`[Job ${jobId}] Structured CV parsed and sorted: ${structuredCV.experience?.length || 0} experiences, ${structuredCV.education?.length || 0} educations`);

    let analysisResult: any;

    if (useFullAnalysis) {
      // 2. Analysera personbeskrivning (Fullständig analys för alla användare)
      console.log(`[Job ${jobId}] Step 2/5: Analyzing profile summary...`);
      let profileSummaryImprovement = null;

      if (structuredCV.summary) {
        const profileResult = await geminiGenerateJSON({
          model: GEMINI_MODELS.quality,
          systemInstruction: 'Du är en CV-expert. Förbättra personbeskrivningen med kraftfulla nyckelord och tydligt värde. Skriv ALLTID i JAG-FORM (första person).',
          prompt: `Förbättra denna personbeskrivning:\n\n"${structuredCV.summary}"\n\nReturnera JSON med format: { "suggestedText": string (förbättrad version i JAG-FORM), "improvements": string[] }\n\nVIKTIGT:\n- suggestedText MÅSTE vara skriven i JAG-FORM (första person), ALDRIG tredje person\n- Använd "jag", "min", "mitt", inte "han", "hennes" eller personens namn`,
          temperature: 0.6,
          maxOutputTokens: 1600,
          thinkingBudget: 0,
        });

        const rawProfileData = profileResult.data;
        // Use ONLY structuredCV as source of truth
        profileSummaryImprovement = {
          currentText: structuredCV.summary, // ENDAST från structured CV
          improvedText: rawProfileData.suggestedText,
          changes: rawProfileData.improvements || [],
          atsImpact: 10
        };
        console.log(`[Job ${jobId}] Profile summary improvement generated`);
      }

      // 3. Extrahera färdigheter från roller (Premium)
      console.log(`[Job ${jobId}] Step 3/5: Extracting skills from role descriptions...`);
      const skillsResult = await geminiGenerateJSON({
        model: GEMINI_MODELS.quality,
        temperature: 0.5,
        maxOutputTokens: 3000,
        thinkingBudget: 0,
        systemInstruction: 'Du är en ATS-optimeringskonsult för svenska arbetsmarknaden. Extrahera EXAKTA kompetenser som svenska jobbannonser söker efter för det här yrket.',
        prompt: `Analysera dessa yrkesroller och extrahera kompetenser som EXAKT matchar termer i svenska jobbannonser.

Input: ${JSON.stringify(structuredCV.experience)}

Returnera JSON: { "skillSuggestions": [{
  "skill": string (1-3 ord, EXAKT term från jobbannonser),
  "relevance": string ("high", "medium", "low"),
  "source": string ("position på company"),
  "reasoning": string (KORT förklaring),
  "atsImpact": number (1-5)
}] }

KRITISKA REGLER FÖR "skill":
1. Max 1-3 ord (inga meningar/fraser)
2. Använd EXAKTA termer som står i svenska jobbannonser för det yrket
3. SEPARERA sammansatta kompetenser:
   ❌ "Rekrytering och utbildning" → ✅ TWO skills: "Rekrytering" + "Utbildning"
   ❌ "Försäljningsoptimering" → ✅ "Försäljning"
   ❌ "Personaladministration" → ✅ "Administration" eller "Personalansvar"

4. Inkludera IMPLICITA verktyg/system baserat på yrke:
   - Butikschef → "Kassasystem", "Excel", "Bemanningsplanering"
   - Byggjobb → "Byggnorm", "Säkerhetsarbete", "Arbetsledning"
   - Juridik → "Avtalsrätt", "Due diligence", "Processrätt"
   - IT → "Git", "Agil utveckling", "JavaScript"
   - Vård → "Läkemedelshantering", "Patientvård", "Legitimation"

5. UNDVIK vaga/abstrakta termer:
   ❌ "God kommunikationsförmåga" → Skippa helt
   ❌ "Produktkunskap" → ✅ Specifik produkt/bransch (t.ex. "Smycken", "Möbler")
   ❌ "Motivera medarbetare" → ✅ "Personalledning" eller "Ledarskap"

EXEMPEL PER BRANSCH (använd som guide):

Detaljhandel:
✅ "Försäljning", "Butiksdrift", "Kassasystem", "Visual merchandising", "Kundservice", "Lagerhantering"

Bygg/Hantverk:
✅ "Arbetsledning", "Byggnorm", "Projektering", "Säkerhetsarbete", "Kvalitetssäkring", "Renovering"

Juridik:
✅ "Avtalsrätt", "Processrätt", "Due diligence", "Arbetsrätt", "Förhandling", "Avtalsupprättning"

IT/Tech:
✅ "JavaScript", "Python", "Git", "Agil utveckling", "Systemutveckling", "DevOps"

Ekonomi:
✅ "Redovisning", "Bokföring", "Budgetansvar", "Controller", "Ekonomiadministration", "Visma"

VIKTIGT:
- ALLA termer på SVENSKA (svenska arbetsmarknaden!)
- Tänk: "Vad söker ATS efter i jobbannonser för detta yrke?"
- source: Exakt "position på company" från input
- reasoning: Kort (1 mening) varför denna term är ATS-viktig
- atsImpact: 5 = kritisk term, 1 = nice-to-have`,
      });

      const skillSuggestions = skillsResult.data.skillSuggestions || [];
      console.log(`[Job ${jobId}] Found ${skillSuggestions.length} skill suggestions`);

      // 4. Analysera roller med batch processing (Premium)
      console.log(`[Job ${jobId}] Step 4/5: Analyzing roles...`);
      const ROLES_PER_BATCH = 3;
      const allRoleImprovements: any[] = [];
      const experiences = structuredCV.experience || [];

      // Skapa batches med currentDescription från structuredCV
      const batches = [];
      for (let i = 0; i < experiences.length; i += ROLES_PER_BATCH) {
        const batch = experiences.slice(i, i + ROLES_PER_BATCH).map(exp => ({
          title: exp.position,
          company: exp.company,
          period: `${exp.startDate} - ${exp.endDate || 'Nuvarande'}`,
          currentDescription: Array.isArray(exp.description) ? exp.description.join('\n') : exp.description
        }));
        batches.push(batch);
      }

      console.log(`[Job ${jobId}] Processing ${experiences.length} roles in ${batches.length} batches...`);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`[Job ${jobId}] Step 4.${i + 1}: Analyzing batch ${i + 1}/${batches.length} (${batch.length} roles)...`);

        const batchResult2 = await geminiGenerateJSON({
          model: GEMINI_MODELS.quality,
          temperature: 0.6,
          maxOutputTokens: 5000,
          thinkingBudget: 1024,
          systemInstruction: 'Du är en expert CV-rådgivare OCH jobbmatchningsspecialist. Analysera arbetsroller, förbättra text ÄRLIGT och extrahera matchbara keywords för jobbsökning.',
          prompt: `Analysera dessa arbetsroller och förbättra dem med ÄKTHET och MATCHNINGSFOKUS.

Input: ${JSON.stringify(batch)}

Returnera JSON: { "roleBasedImprovements": [{
  "roleTitle": string (från input.title),
  "company": string (från input.company),
  "period": string (från input.period),
  "suggestedText": string (FÖRBÄTTRAD beskrivning),
  "improvements": {
    "hasQuantification": boolean,
    "keywords": string[],
    "grammarIssues": string[],
    "atsOptimization": boolean
  },
  "matchKeywords": {
    "directSkills": string[],
    "implicitSkills": string[],
    "tools": string[],
    "responsibilities": string[],
    "industryTerms": string[]
  },
  "atsImpact": number (1-5)
}] }

KRITISKA REGLER FÖR suggestedText:
❌ HITTA ALDRIG PÅ SIFFROR (10%, 15%, 95% etc.) - detta skadar trovärdigheten!
✅ Fokusera på: specifika ansvarsområden, action verbs, konkreta arbetsuppgifter
✅ OM användaren redan nämner resultat → förtydliga dem
✅ OM ingen kvantifiering finns → förbättra med action verbs och konkrethet

Exempel KORREKT förbättring:
Original: "Hjälpte butikschefen med olika uppgifter"
✅ BRA: "Stöttade butikschefen med personalplanering, lagerhantering och kundservice. Ansvarade för daglig kassaavstämning och rapportering."
❌ DÅLIGT: "Assisterade butikschefen i att öka försäljningen med 10%" (påhittad siffra!)

INSTRUKTIONER FÖR matchKeywords (KRITISKT FÖR JOBBMATCHNING):

1. directSkills: Explicit nämnda kompetenser från texten
   Exempel: "rekrytering" → ["rekrytering", "personalrekrytering", "anställningsprocess"]
   Exempel: "kundservice" → ["kundservice", "kundtjänst", "kundkontakt"]

2. implicitSkills: Kompetenser som FRAMGÅR av kontext
   Exempel: "ansvarade för 8 medarbetare" → ["personalansvar", "teamledning", "bemanningsplanering"]
   Exempel: "hanterade klagomål" → ["konflikthantering", "problemlösning"]

3. tools: ENDAST digitala verktyg, system och mjukvara (ALDRIG fysiska verktyg!)
   ✅ Exempel: butikschef → ["kassasystem", "POS-system", "Excel", "lagerhanteringssystem", "Visma"]
   ✅ Exempel: utvecklare → ["Git", "VS Code", "Jira", "agila verktyg", "Docker", "Kubernetes"]
   ✅ Exempel: VVS/Bygg → ["CAD", "BIM", "Revit", "AutoCAD", "Ritningsprogram", "Projektstyrningsverktyg"]
   ✅ Exempel: Ekonomi → ["Visma", "Fortnox", "Excel", "BAS-kontoplan", "Ekonomisystem"]

   ❌ Inkludera ALDRIG fysiska verktyg:
   ❌ Inte "Hammare", "Spik", "Skruv", "Såg", "Skruvdragare"
   ❌ Inte "Svetsverktyg", "Rörbockningsverktyg", "Läckagesökare"
   ❌ Inte "Saxlift", "Truck", "Grävmaskin"

   REGEL: Om verktyget inte är mjukvara/digitalt system → använd responsibilities eller implicitSkills istället

4. responsibilities: Konkreta ansvarsområden
   Exempel: ["budgetansvar", "nyckeltaluppföljning", "visuell merchandising", "daglig drift"]

5. industryTerms: Branschspecifika termer OCH yrkes-synonymer för jobbsökning
   VIKTIGT: Inkludera alternativa yrkestitlar och branschakronymer!
   Exempel: detaljhandel → ["butiksdrift", "detaljhandel", "visual merchandising", "retail", "försäljningschef", "butikssäljare"]
   Exempel: tech → ["agil utveckling", "CI/CD", "molntjänster", "DevOps", "systemutvecklare", "backend-utvecklare"]
   Exempel: rörmokare → ["VVS", "vvs-montör", "vs-montör", "rörläggare", "installationsrör", "sanitet", "avlopp", "rörinstallation"]
   Exempel: elektriker → ["elinstallatör", "elmontör", "eltekniker", "elektrisk installation"]
   Exempel: sjuksköterska → ["vård", "hälso-sjukvård", "omvårdnad", "patientvård", "specialist sjuksköterska"]

VIKTIGT för matchKeywords:
- Alla keywords på SVENSKA
- Inkludera både singular och plural där relevant
- Lägg till synonymer (t.ex. "personalansvar" + "medarbetaransvar")
- För industryTerms: Lägg ALLTID till branschakronymer (VVS, IT, HR) och alternativa yrkestitlar
- Basera på faktisk text OCH yrkeskontext (infoga branschkunskap)
- Totalt 15-25 matchKeywords per roll (fördelat över kategorierna, med fokus på industryTerms)
- matchKeywords används för jobbmatchning, INTE synligt för användaren

atsImpact (1-5):
1-2: Grammatik/formatering
3: Action verbs, konkreta ansvarsområden, tydlig struktur
4: Branschspecifika keywords, verktyg/teknologier, många matchKeywords
5: ÄKTA kvantifiering (baserad på originaltext) + rika matchKeywords + struktur`,
        });

        const batchResult = batchResult2.data;

        // Mappa currentText DIREKT från structured CV (enda sanningskällan)
        const sanitizedBatch = (batchResult.roleBasedImprovements || []).map((role: any, index: number) => {
          const batchIndex = i * ROLES_PER_BATCH + index;
          const exp = experiences[batchIndex];

          // currentText kommer ALLTID från structuredCV
          const currentText = Array.isArray(exp?.description)
            ? exp.description.join('\n')
            : (exp?.description || '');

          return sanitizeRoleImprovement({
            roleTitle: exp?.position || role.roleTitle,
            company: exp?.company || role.company,
            period: role.period,
            currentText, // GARANTERAT från structuredCV
            suggestedText: role.suggestedText,
            improvements: role.improvements,
            matchKeywords: role.matchKeywords,
            atsImpact: role.atsImpact
          });
        });

        allRoleImprovements.push(...sanitizedBatch);

        console.log(`[Job ${jobId}] Batch ${i + 1} completed: ${sanitizedBatch.length} improvements`);
      }

      // 5. Allmän analys (Premium)
      console.log(`[Job ${jobId}] Step 5/5: Performing general analysis...`);
      const generalResponse = await geminiGenerateJSON({
        model: GEMINI_MODELS.quality,
        systemInstruction: 'Du är en CV-expert. Ge konkreta allmänna förbättringsförslag för struktur, formatering, certifieringar och språk. Var ALLTID specifik och ge minst 3-5 förbättringsförslag.',
        prompt: `Ge allmänna förbättringsförslag för detta CV:\n\n${cvText}\n\nReturnera JSON med format: { "generalImprovements": [{ "title": string, "description": string, "category": string ("Struktur", "Formatering", "Innehåll", "Nyckelord"), "atsImpact": number (1-5, hur mycket denna förbättring påverkar ATS-score) }], "keywords": string[], "atsScore": number (0-100) }\n\nVIKTIGT: Ge MINST 3 konkreta generalImprovements. atsScore ska vara ett heltal mellan 0-100. atsImpact ska vara 1-5 baserat på vikten av förbättringen (5 = mycket viktig, 1 = mindre viktig).`,
        temperature: 0.6,
        maxOutputTokens: 3000,
        thinkingBudget: 0,
      });

      const generalResult = generalResponse.data;

      // Ensure generalImprovements is never empty
      if (!generalResult.generalImprovements || generalResult.generalImprovements.length === 0) {
        generalResult.generalImprovements = [
          { title: 'Lägg till nyckelord', description: 'Inkludera branschspecifika nyckelord för att öka ATS-träffsäkerhet', category: 'Nyckelord', atsImpact: 4 },
          { title: 'Kvantifiera prestationer', description: 'Lägg till mätbara resultat och siffror i dina arbetsbeskrivningar', category: 'Innehåll', atsImpact: 3 },
          { title: 'Förbättra struktur', description: 'Organisera ditt CV i tydliga sektioner med konsekvent formatering', category: 'Struktur', atsImpact: 2 }
        ];
      }

      analysisResult = {
        analysisType: 'full', // Ändrat från 'premium' till 'full' - alla får samma
        profileSummary: profileSummaryImprovement,
        skillSuggestions: skillSuggestions,
        roleBasedImprovements: allRoleImprovements,
        generalImprovements: generalResult.generalImprovements,
        keywords: generalResult.keywords || [],
        atsFriendliness: {
          score: generalResult.atsScore || 0,
          feedback: `Ditt CV har en ATS-poäng på ${generalResult.atsScore || 0}/100`,
          missingKeywords: []
        },
        model: GEMINI_MODELS.quality,
        tokens: { total: 0 }
      };
    }

    // Lägg till parsed roles från structuredCV
    const experiences = structuredCV.experience || [];
    analysisResult.parsedRoles = experiences.map((exp: any) => ({
      title: exp.position,
      company: exp.company,
      period: `${exp.startDate} - ${exp.endDate || 'Nuvarande'}`
    }));

    // NEW: Add structured CV data to result
    analysisResult.structuredCV = structuredCV;

    // NEW: Generate formatted preview text from structured CV
    console.log(`[Job ${jobId}] Generating formatted preview text...`);
    const previewResult = await geminiGenerate({
      model: GEMINI_MODELS.fast,
      systemInstruction: 'Du formaterar CV-data till läsbar text med tydliga sektioner och styckeindelningar.',
      prompt: `Formatera detta CV till läsbar text med tydliga sektioner:\n\n${JSON.stringify(structuredCV)}\n\nAnvänd följande format:\n- Personuppgifter på separata rader\n- Tom rad mellan varje sektion\n- Sektionsrubriker i VERSALER\n- VIKTIGT: Erfarenheter i OMVÄND KRONOLOGI (senaste/nuvarande först, äldsta sist)\n- VIKTIGT: Behåll EXAKT ordningen från experience-arrayen\n- Tydlig struktur för erfarenheter och utbildning\n\nReturnera ENDAST den formaterade texten, ingen JSON.`,
      temperature: 0.3,
      maxOutputTokens: 4000,
      thinkingBudget: 0,
    });

    const formattedPreview = previewResult.text;
    analysisResult.formattedPreview = formattedPreview;
    console.log(`[Job ${jobId}] Preview text generated (${formattedPreview.length} chars)`);

    console.log(`[Job ${jobId}] Saving results (with structured CV data + preview)...`);

    // Auto-generate display name from most recent/current role
    const displayName = (() => {
      const firstExp = structuredCV.experience?.[0];
      if (!firstExp) return `CV-analys ${new Date().toLocaleDateString('sv-SE')}`;

      const roleTitle = firstExp.position || 'Okänd roll';
      const isCurrent = !firstExp.endDate ||
                       firstExp.endDate === 'Nuvarande' ||
                       firstExp.endDate.toLowerCase() === 'nuvarande';

      if (isCurrent) {
        return `${roleTitle} (Nuvarande)`;
      } else {
        return `${roleTitle} (${firstExp.endDate})`;
      }
    })();

    const { error: resultError } = await supabase
      .from('cv_analysis_jobs')
      .update({
        status: 'completed',
        result: analysisResult,
        display_name: displayName,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (resultError) {
      console.error(`[Job ${jobId}] Failed to save analysis result:`, resultError);
      throw resultError;
    }

    console.log(`[Job ${jobId}] ✅ Analysis completed successfully`);

    return new Response(
      JSON.stringify({ success: true, jobId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[Job ${jobId || 'unknown'}] ❌ Error in background analysis:`, error);

    if (jobId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        await supabase
          .from('cv_analysis_jobs')
          .update({
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', jobId);
      } catch (updateError) {
        console.error(`[Job ${jobId}] Failed to update job with error:`, updateError);
      }
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
