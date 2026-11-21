import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { geminiGenerate, geminiGenerateJSON, GEMINI_MODELS } from '../_shared/gemini.ts';
import { maskForModel, extractContactLocally, restorePlaceholders } from '../_shared/pii.ts';

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
    // Rollens plats i structuredCV.experience, så att förslaget kan föras
    // in i rätt roll. Inga tal från modellen: läsbarhetspoängen och varje
    // förslags plus räknas i webbappen (docs/poangmodell-cv-analys.md).
    experienceIndex: typeof role?.experienceIndex === 'number' ? role.experienceIndex : null,
  };
}

// ---------------------------------------------------------------------------
// Den lagrade strukturen (cv_texts.structured_data) som CVMetadata.
//
// Poängen räknas i webbappen ur samma lagrade struktur (src/lib/cv/poang/
// kanon.ts). När funktionen arbetar på den, och inte på en ny AI-tolkning per
// analys, pekar förslagen på samma roller som poängen räknas på. Speglar
// kanon.ts i förenklad form; webbappen matchar ändå rollerna själv.
// ---------------------------------------------------------------------------
const PLATSHALLARE = new Set(['okänd titel', 'okänt företag', 'okänd roll', 'period ej angiven', 'okänd utbildning', 'okänd institution', 'ej specificerad', 'yrkesroll', 'arbetsgivare']);
function falt(v: unknown): string {
  if (typeof v !== 'string') return '';
  const t = v.replace(/\s+/g, ' ').trim();
  return PLATSHALLARE.has(t.toLowerCase()) ? '' : t;
}
// Speglar PERIOD_SKILJE, PAGAENDE_SLUT, delaPeriod och startOchSlut i
// src/lib/cv/poang/matt.ts: "2017 till 2019" delas, så att ett avslutat jobb
// aldrig kallas nuvarande i förslagen.
const PERIOD_SKILJE = /\s+(?:till\s+och\s+med|till|t\.\s?o\.\s?m\.?|to|until)\s+|\s+[-–—]\s+|\s*[–—]\s*/i;
const PAGAENDE_SLUT = /^(pågående|pagaende|nuvarande|nu|idag|i dag|tills vidare|present|current|ongoing|now)$/i;
function delaPeriod(period: unknown): { start: string; slut: string } {
  const p = falt(period);
  if (!p) return { start: '', slut: '' };
  const delar = p.split(PERIOD_SKILJE);
  if (delar.length > 1 && delar[0].trim()) return { start: delar[0].trim(), slut: delar.slice(1).join(' ').trim() };
  const m = p.match(/^(.*?\d{4})\s*-\s*((?:19|20)\d{2}\b.*|\p{L}.*)$/u);
  if (m) return { start: m[1].trim(), slut: m[2].trim() };
  return { start: p, slut: '' };
}
/** Hela perioden i startdatumet utan slut ("2017 till 2019") delas; annars orört. */
function medDeladPeriod(e: any): any {
  if (!e || typeof e !== 'object') return e;
  const s = typeof e.startDate === 'string' ? e.startDate.trim() : '';
  const slutNu = typeof e.endDate === 'string' ? e.endDate.trim() : '';
  if (!s || slutNu) return e;
  const { start, slut } = delaPeriod(s);
  if (!slut || start === s) return e;
  return { ...e, startDate: start, endDate: PAGAENDE_SLUT.test(slut) ? null : slut };
}
function strukturUrLagrad(sd: any): any | null {
  if (!sd || typeof sd !== 'object' || Array.isArray(sd)) return null;
  if ((sd.personalInfo && typeof sd.personalInfo === 'object') || (Array.isArray(sd.experience) && !Array.isArray(sd.roles))) {
    const k = JSON.parse(JSON.stringify(sd));
    k.experience = Array.isArray(k.experience) ? k.experience.map(medDeladPeriod) : [];
    k.education = Array.isArray(k.education) ? k.education.map(medDeladPeriod) : [];
    k.skills = Array.isArray(k.skills) ? k.skills : [];
    return k;
  }
  if (Array.isArray(sd.roles)) {
    return {
      personalInfo: {},
      summary: typeof sd.profile === 'string' && sd.profile.trim() ? sd.profile.trim() : undefined,
      experience: sd.roles.filter((r: any) => r && typeof r === 'object').map((r: any) => {
        const { start, slut } = delaPeriod(r.period);
        let rader = (typeof r.description === 'string' ? r.description : '').split(/\n+/).map((s: string) => s.trim()).filter(Boolean);
        if (rader.length === 0 && Array.isArray(r.responsibilities)) rader = r.responsibilities.filter((s: any) => typeof s === 'string' && s.trim());
        return { position: falt(r.title), company: falt(r.company), startDate: start, endDate: slut && !PAGAENDE_SLUT.test(slut) ? slut : null, description: rader };
      }),
      education: (Array.isArray(sd.education) ? sd.education : []).filter((e: any) => e && typeof e === 'object').map((e: any) => {
        const { start, slut } = delaPeriod(e.period);
        return { degree: falt(e.degree), institution: falt(e.institution), startDate: start, endDate: slut, graduationYear: slut || start };
      }),
      skills: Array.isArray(sd.skills) ? [{ category: '', skills: sd.skills.filter((s: any) => typeof s === 'string') }] : [],
      ...(Array.isArray(sd.languages) ? { languages: sd.languages } : {}),
    };
  }
  return null;
}

/**
 * Maskeringens platshållare bort ur allt modellen svarar, så att de aldrig
 * hamnar i sparad struktur eller i förslag hon ser. [antal] i förslagen är
 * inte en av dem. Speglar src/lib/privacy/cvForModel.ts.
 */
const PII_PLATSHALLARE = /\[(?:NAMN|E-POST|EMAIL|TELEFON|TEL|ADRESS|POSTNUMMER|POSTNR|PERSONNUMMER|PERSNR|FÖDELSEDATUM|LÄNK|URL)\]/gi;
/** Etikett som blir ensam kvar när kontaktuppgiften efter den är borttagen. */
const KONTAKTETIKETT = /^(?:kontakt(?:uppgifter)?|kontakta mig|telefon|tel|mobil|e-?post|e-?mail|mejl|adress|linkedin|webb(?:plats)?|hemsida|länk)\s*:?$/i;

/**
 * En rad utan platshållare. Rader som hade en platshållare städas hårdare:
 * tomma led mellan | och · tas bort, och en rad där bara etiketten blev kvar
 * ("Kontakt: |", "Telefon:") stryks helt (null). Speglar cvForModel.ts.
 */
function rensaRad(rad: string): string | null {
  const stada = (s: string) =>
    s.replace(/[ \t]{2,}/g, ' ').replace(/\s+([,.;:])/g, '$1').replace(/^[\s,;:]+|[\s,;:]+$/g, '');
  if (!new RegExp(PII_PLATSHALLARE.source, 'i').test(rad)) return stada(rad);
  const utan = rad.replace(PII_PLATSHALLARE, '').replace(/\(\s*[,;]?\s*\)/g, '');
  const skilje = utan.match(/[|·]/)?.[0] ?? null;
  const delar = (skilje ? utan.split(skilje) : [utan]).map(stada).filter((d) => d && !KONTAKTETIKETT.test(d));
  if (delar.length === 0) return null;
  return delar.join(skilje ? ` ${skilje} ` : '');
}

function rensaText(text: string): string {
  return text
    .split('\n')
    .map(rensaRad)
    .filter((r): r is string => r !== null)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function rensaPii(v: any): any {
  if (typeof v === 'string') {
    if (!new RegExp(PII_PLATSHALLARE.source, 'i').test(v)) return v;
    return rensaText(v);
  }
  if (Array.isArray(v)) return v.map(rensaPii);
  if (v && typeof v === 'object') {
    const ut: any = {};
    for (const [k, x] of Object.entries(v)) ut[k] = rensaPii(x);
    return ut;
  }
  return v;
}

/** Strängarna i ett objekt maskade, för allt som går till modellen. */
function maskeraDjupt(v: any, fullName: string | null): any {
  if (typeof v === 'string') return maskForModel(v, { fullName, maskUrls: true }).text;
  if (Array.isArray(v)) return v.map((x) => maskeraDjupt(x, fullName));
  if (v && typeof v === 'object') {
    const ut: any = {};
    for (const [k, x] of Object.entries(v)) {
      if (k === 'personalInfo' || k === 'bygge' || k === 'sectionTitles') continue;
      ut[k] = maskeraDjupt(x, fullName);
    }
    return ut;
  }
  return v;
}

/**
 * Är bäraren projektets servicenyckel?
 *
 * Det går inte att jämföra med miljöns SUPABASE_SERVICE_ROLE_KEY som sträng:
 * Supabase ger funktionsmiljön en egen nyckel vid varje driftsättning, och den
 * är inte samma sträng som nyckeln vår server har (2026-11-21: jämförelsen
 * nekade varje anrop från servern, 403). Därför i två steg:
 *   1. Rollen i JWT:n ska vara service_role. En användares JWT faller här,
 *      utan något nätverksanrop.
 *   2. Rollen i en JWT bevisar inget i sig, så nyckeln prövas mot
 *      auth-tjänstens adminyta, som bara svarar 200 på en giltig servicenyckel.
 */
async function arServicenyckel(barare: string, supabaseUrl: string, miljonyckel: string): Promise<boolean> {
  if (!barare) return false;
  if (miljonyckel && barare === miljonyckel) return true;
  try {
    const del = barare.split('.')[1] ?? '';
    const b64 = del.replace(/-/g, '+').replace(/_/g, '/');
    const krav = JSON.parse(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4)));
    if (krav?.role !== 'service_role') return false;
    const svar = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1`, {
      headers: { Authorization: `Bearer ${barare}`, apikey: barare },
    });
    await svar.body?.cancel();
    return svar.ok;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  let jobId: string | undefined;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // SÄKERHET (2026-11-21): bara vår server får starta en analys. Servern
    // anropar med servicenyckeln som bärare (src/lib/cv/background-jobs.ts),
    // efter kvotkontrollen och med jobbraden redan skapad. En inloggad
    // användares JWT räcker inte längre: förr kunde vem som helst anropa
    // funktionen direkt med valfritt jobId och cvId, förbi kvoten och med
    // någon annans CV. Driftsätt aldrig med --no-verify-jwt.
    const barare = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
    if (!(await arServicenyckel(barare, supabaseUrl, supabaseServiceKey))) {
      console.error('[analyze-cv-background] nekat: anropet kom inte med servicenyckeln');
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

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
      .select('cv_text, user_id, structured_data')
      .eq('id', cvId)
      .single();

    if (cvError || !cv) {
      console.error(`[Job ${jobId}] Failed to fetch CV:`, cvError);
      return new Response(
        JSON.stringify({ error: `Failed to fetch CV: ${cvError?.message || 'CV not found'}` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // SÄKERHET (2026-11-21): jobbet och CV:t ska höra ihop och tillhöra samma
    // konto, och jobbet ska vara nytt. Annars skrivs ingenting, inte heller
    // "failed" på jobbet (det kan vara någon annans).
    const { data: jobbRad, error: jobbFel } = await supabase
      .from('cv_analysis_jobs')
      .select('user_id, cv_id, status')
      .eq('id', jobId)
      .maybeSingle();
    if (jobbFel || !jobbRad || jobbRad.user_id !== cv.user_id || jobbRad.cv_id !== cvId || jobbRad.status !== 'pending') {
      console.error(`[Job ${jobId}] nekat: jobbet saknas, är inte nytt eller hör inte till CV:t`);
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cvText = cv.cv_text;
    console.log(`[Job ${jobId}] CV text fetched (${cvText.length} chars)`);

    // -------------------------------------------------------------------
    // SÄKERHET: maskera personuppgifter innan något går till Gemini.
    //
    // Funktionen var det sista flödet som skickade rå CV-text till en modell,
    // trots att allt i Next.js-koden maskas. Tre anrop berörs: steg 1
    // (parsning), steg 5 (allmän analys) och formateringen av
    // förhandsvisningen. Alla tre får numera maskerad text.
    //
    // Kontaktuppgifterna plockas ut lokalt med regex och sätts tillbaka i
    // resultatet EFTER att modellen är klar, så personalInfo ser likadan ut
    // för resten av appen som tidigare.
    // -------------------------------------------------------------------
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', cv.user_id)
      .maybeSingle();

    const localContact = extractContactLocally(cvText);
    const knownName = ownerProfile?.full_name || localContact.fullName || null;

    // Inga personuppgifter till modellen (ägarens beslut 2026-11-21), inte
    // heller webbadresser: LinkedIn läses lokalt och sätts in efteråt.
    const maskedCv = maskForModel(cvText, { fullName: knownName, maskUrls: true, knownPhones: [ownerProfile?.phone] });
    const safeCvText = maskedCv.text;

    if (maskedCv.warnings.length > 0) {
      console.error(`[Job ${jobId}] [privacy] personuppgifter kvar efter andra passet: ${maskedCv.warnings.join(', ')}`);
    }
    console.log(`[Job ${jobId}] CV maskerat (${safeCvText.length} chars)`);

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

    // 1. Strukturen. Den lagrade (cv_texts.structured_data) används när den
    // finns: webbappen strukturerar CV:t en gång och sparar det innan jobbet
    // startar, och poängen räknas på samma struktur. Bara när den saknas
    // tolkar vi CV:t med AI här, som förut.
    const lagrad = strukturUrLagrad((cv as any).structured_data);
    let structuredCV: any;
    if (lagrad) {
      console.log(`[Job ${jobId}] Step 1/5: Using stored structure (${lagrad.experience?.length || 0} roles)`);
      structuredCV = lagrad;
    } else {
    console.log(`[Job ${jobId}] Step 1/5: Parsing CV into structured format (${safeCvText.length} chars, maskerat)...`);
    const structuredParsingResult = await geminiGenerateJSON({
      model: GEMINI_MODELS.fast,
      systemInstruction: 'Du är en CV-parser. Extrahera ALL information från CV:t och returnera som strukturerad JSON. Var EXTREMT noggrann med att bevara all text och formatering.',
      prompt: `Parsa detta CV till strukturerad JSON:\n\n${safeCvText}\n\nReturnera JSON med EXAKT detta format:\n{\n  "personalInfo": {\n    "linkedin": string\n  },\n  "summary": string,\n  "experience": [{\n    "position": string,\n    "company": string,\n    "location": string,\n    "startDate": string,\n    "endDate": string (eller null om nuvarande),\n    "description": string[]\n  }],\n  "education": [{\n    "degree": string,\n    "institution": string,\n    "graduationYear": string,\n    "description": string\n  }],\n  "skills": [{\n    "category": string,\n    "skills": string[]\n  }],\n  "languages": [{\n    "language": string,\n    "proficiency": string\n  }],\n  "certifications": [{\n    "name": string,\n    "issuer": string,\n    "date": string\n  }],\n  "references": string\n}\n\nVIKTIGT: Bevara ALL originaltext. Description-fält ska vara arrays med meningar/punkter.`,
      temperature: 0.2,
      maxOutputTokens: 6000,
      thinkingBudget: 0,
    });

    // Platshållare från maskeringen följer aldrig med in i strukturen.
    structuredCV = rensaPii(structuredParsingResult.data);

    // FIX: Sortera experience i OMVÄND KRONOLOGI (senaste först, äldsta sist).
    // Bara för den egna tolkningen: den lagrade strukturen behåller CV:ts
    // ordning, så att rollernas plats stämmer med det poängen räknas på.
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
    }

    // Allt som går till modellen nedan maskas: den lagrade strukturen är
    // omaskerad (rollbeskrivningar kan innehålla referenser och nummer).
    const modellCV = maskeraDjupt(structuredCV, knownName);

    let analysisResult: any;

    if (useFullAnalysis) {
      // 2. Analysera personbeskrivning (Fullständig analys för alla användare)
      console.log(`[Job ${jobId}] Step 2/5: Analyzing profile summary...`);
      let profileSummaryImprovement = null;

      // Regler för texten som modellen skriver. Talen (poäng och plus) räknas
      // i webbappen; reglerna här är vad poängmodellen mäter, i ord.
      const PROFILREGLER = `- Skriv i JAG-FORM (första person), aldrig tredje person eller personens namn
- 40 till 90 ord
- Säg vilken roll personen har eller söker, med yrkestiteln ur CV:t
- Använd BARA fakta som står i CV:t: arbetsgivare, titlar, kompetenser, tal och resultat. Hitta aldrig på något.
- Ta med något konkret (antal år, ansvar, resultat) BARA om det står i CV:t. Saknas talet: skriv platshållaren [antal] där personen själv fyller i det, aldrig ett påhittat tal.
- Tal som redan står i texten, med siffror eller med ord ("fem års erfarenhet", "12 medarbetare", "tre butiker"), skriver du av precis som de står. Byt ALDRIG ut ett tal som finns mot [antal]. [antal] får bara stå där texten saknar tal.
- Skriv på svenska med svenska facktermer. Inga engelska ord där det finns ett svenskt: "lager" eller "lagerhantering", inte "inventory"; "varuexponering", inte "merchandising"; "kundservice", inte "customer service". Stava korrekt och kontrollera stavningen innan du svarar.`;

      const rollerForProfil = (modellCV.experience || []).slice(0, 3).map((e: any) => ({
        position: e.position, company: e.company, description: e.description,
      }));

      if (structuredCV.summary) {
        const profileResult = await geminiGenerateJSON({
          model: GEMINI_MODELS.quality,
          systemInstruction: 'Du är en CV-expert. Förbättra personbeskrivningen med kraftfulla nyckelord och tydligt värde. Skriv ALLTID i JAG-FORM (första person).',
          prompt: `Förbättra denna personbeskrivning:\n\n"${modellCV.summary}"\n\nRollerna i CV:t, för sammanhang:\n${JSON.stringify(rollerForProfil)}\n\nReturnera JSON med format: { "suggestedText": string (förbättrad version), "improvements": string[] }\n\nVIKTIGT för suggestedText:\n${PROFILREGLER}`,
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
        };
        console.log(`[Job ${jobId}] Profile summary improvement generated`);
      } else if (rollerForProfil.length > 0) {
        // Ingen personbeskrivning: föreslå en ur rollerna. Förr fick ett CV
        // utan profil inget profilförslag alls.
        const profileResult = await geminiGenerateJSON({
          model: GEMINI_MODELS.quality,
          systemInstruction: 'Du är en CV-expert. Skriv en personbeskrivning till ett svenskt CV utifrån rollerna. Skriv ALLTID i JAG-FORM (första person).',
          prompt: `CV:t saknar personbeskrivning. Skriv en utifrån rollerna:\n${JSON.stringify(rollerForProfil)}\n\nReturnera JSON med format: { "suggestedText": string, "improvements": string[] }\n\nVIKTIGT för suggestedText:\n${PROFILREGLER}`,
          temperature: 0.6,
          maxOutputTokens: 1600,
          thinkingBudget: 0,
        });
        profileSummaryImprovement = {
          currentText: '',
          improvedText: profileResult.data.suggestedText,
          changes: profileResult.data.improvements || [],
        };
        console.log(`[Job ${jobId}] New profile summary generated`);
      }

      // 3. Extrahera färdigheter från roller (Premium)
      console.log(`[Job ${jobId}] Step 3/5: Extracting skills from role descriptions...`);
      const skillsResult = await geminiGenerateJSON({
        model: GEMINI_MODELS.quality,
        temperature: 0.5,
        maxOutputTokens: 6000,
        thinkingBudget: 0,
        // Schema håller svaret kompakt och kapar långa reasoning-strängar som
        // tidigare sprängde token-gränsen och trunkerade JSON:en.
        schema: {
          type: 'object',
          properties: {
            skillSuggestions: {
              type: 'array',
              maxItems: 24,
              items: {
                type: 'object',
                properties: {
                  skill: { type: 'string' },
                  relevance: { type: 'string', enum: ['high', 'medium', 'low'] },
                  source: { type: 'string' },
                  reasoning: { type: 'string' },
                },
                required: ['skill', 'relevance', 'source', 'reasoning'],
              },
            },
          },
          required: ['skillSuggestions'],
        },
        systemInstruction: 'Du är en ATS-optimeringskonsult för svenska arbetsmarknaden. Extrahera EXAKTA kompetenser som svenska jobbannonser söker efter för det här yrket.',
        prompt: `Analysera dessa yrkesroller och extrahera kompetenser som EXAKT matchar termer i svenska jobbannonser.

Input: ${JSON.stringify(modellCV.experience)}

Kompetenser som redan står i CV:t (föreslå INTE dessa igen): ${JSON.stringify(modellCV.skills)}

Returnera JSON: { "skillSuggestions": [{
  "skill": string (1-3 ord, EXAKT term från jobbannonser),
  "relevance": string ("high", "medium", "low"),
  "source": string ("position på company"),
  "reasoning": string (KORT förklaring)
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
✅ "Försäljning", "Butiksdrift", "Kassasystem", "Varuexponering", "Kundservice", "Lagerhantering"

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
- reasoning: Kort (1 mening) varför denna term är ATS-viktig. Påstå ALDRIG att personen har kompetensen: den är ett förslag att lägga till om den stämmer (skriv t.ex. "Efterfrågas ofta för rollen" i stället för "Du har erfarenhet av").`,
      });

      const skillSuggestions = skillsResult.data.skillSuggestions || [];
      console.log(`[Job ${jobId}] Found ${skillSuggestions.length} skill suggestions`);

      // 4. Analysera roller med batch processing (Premium)
      console.log(`[Job ${jobId}] Step 4/5: Analyzing roles...`);
      const ROLES_PER_BATCH = 3;
      const allRoleImprovements: any[] = [];
      const experiences = structuredCV.experience || [];
      // Samma roller maskade, för prompten. Index är desamma.
      const modellExperiences = modellCV.experience || [];

      // Skapa batches med currentDescription från structuredCV
      const batches = [];
      for (let i = 0; i < modellExperiences.length; i += ROLES_PER_BATCH) {
        const batch = modellExperiences.slice(i, i + ROLES_PER_BATCH).map((exp: any) => ({
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
  }
}] }

KRITISKA REGLER FÖR suggestedText:
❌ HITTA ALDRIG PÅ SIFFROR (10%, 15%, 95% etc.) - detta skadar trovärdigheten!
✅ Fokusera på: specifika ansvarsområden, action verbs, konkreta arbetsuppgifter
✅ OM användaren redan nämner resultat → förtydliga dem och BEHÅLL alla siffror som står i originalet
✅ OM ingen kvantifiering finns → förbättra med action verbs och konkrethet, och skriv platshållaren [antal] där personen kan fylla i en egen siffra (högst en per punkt), t.ex. "Besvarade [antal] kundärenden per dag". Skriv ALDRIG ett tal som inte står i originaltexten.
❌ Byt ALDRIG ut ett tal som redan står i originalet mot [antal], vare sig det är skrivet med siffror ("12 medarbetare") eller med ord ("fem års erfarenhet", "tre butiker"). Skriv av talet precis som det står. [antal] får bara stå där originalet saknar tal.
✅ SPRÅK: skriv på svenska med svenska facktermer. Inga engelska ord där det finns ett svenskt: "lager" eller "lagerhantering", inte "inventory"; "varuexponering", inte "merchandising"; "kundservice", inte "customer service". Stava korrekt och kontrollera stavningen innan du svarar.
✅ Använd BARA arbetsgivare, titlar, verktyg och kompetenser som står i CV:t. Lägg aldrig till system, certifikat eller ansvar som inte nämns.
✅ FORM: 3 till 6 punkter, VARJE punkt på EGEN RAD (radbrytning \\n mellan punkterna), utan punkttecken
✅ Varje punkt börjar med ett verb (Ledde, Ansvarade, Byggde, Sålde, Planerar) och är högst 25 ord

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
- matchKeywords används för jobbmatchning, INTE synligt för användaren`,
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
            experienceIndex: exp ? batchIndex : null,
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
        // Inga poäng och inga plus från modellen: de räknas i webbappen ur
        // CV:ts struktur (docs/poangmodell-cv-analys.md).
        prompt: `Ge allmänna förbättringsförslag för detta CV:\n\n${safeCvText}\n\nReturnera JSON med format: { "generalImprovements": [{ "title": string, "description": string, "category": string ("Struktur", "Formatering", "Innehåll", "Nyckelord") }], "keywords": string[] }\n\nVIKTIGT: Ge MINST 3 konkreta generalImprovements, viktigast först. Ge inga poäng, betyg eller procentsatser.`,
        temperature: 0.6,
        maxOutputTokens: 3000,
        thinkingBudget: 0,
      });

      const generalResult = generalResponse.data;

      // Ensure generalImprovements is never empty
      if (!generalResult.generalImprovements || generalResult.generalImprovements.length === 0) {
        generalResult.generalImprovements = [
          { title: 'Lägg till nyckelord', description: 'Inkludera branschspecifika nyckelord för att öka ATS-träffsäkerhet', category: 'Nyckelord' },
          { title: 'Kvantifiera prestationer', description: 'Lägg till mätbara resultat och siffror i dina arbetsbeskrivningar', category: 'Innehåll' },
          { title: 'Förbättra struktur', description: 'Organisera ditt CV i tydliga sektioner med konsekvent formatering', category: 'Struktur' }
        ];
      }
      // Skulle modellen ändå skicka tal tas de bort.
      generalResult.generalImprovements = generalResult.generalImprovements.map((g: any) => {
        const { atsImpact: _a, ...rest } = g || {};
        return rest;
      });

      // Platshållare från maskeringen bort ur allt hon ser.
      analysisResult = rensaPii({
        analysisType: 'full', // Ändrat från 'premium' till 'full' - alla får samma
        profileSummary: profileSummaryImprovement,
        skillSuggestions: skillSuggestions,
        roleBasedImprovements: allRoleImprovements,
        generalImprovements: generalResult.generalImprovements,
        keywords: generalResult.keywords || [],
        // Läsbarhetspoängen räknas i webbappen när resultatet läses
        // (src/lib/cv/poang), aldrig här och aldrig av modellen.
        atsFriendliness: { score: null, feedback: '', missingKeywords: [] },
        model: GEMINI_MODELS.quality,
        tokens: { total: 0 }
      });
    }

    // Lägg till parsed roles från structuredCV
    const experiences = structuredCV.experience || [];
    analysisResult.parsedRoles = experiences.map((exp: any) => ({
      title: exp.position,
      company: exp.company,
      period: `${exp.startDate} - ${exp.endDate || 'Nuvarande'}`
    }));


    // NEW: Generate formatted preview text from structured CV
    console.log(`[Job ${jobId}] Generating formatted preview text...`);
    const previewResult = await geminiGenerate({
      model: GEMINI_MODELS.fast,
      systemInstruction: 'Du formaterar CV-data till läsbar text med tydliga sektioner och styckeindelningar.',
      prompt: `Formatera detta CV till läsbar text med tydliga sektioner:\n\n${JSON.stringify(modellCV)}\n\nAnvänd följande format:\n- Personuppgifter på separata rader\n- Tom rad mellan varje sektion\n- Sektionsrubriker i VERSALER\n- VIKTIGT: Erfarenheter i OMVÄND KRONOLOGI (senaste/nuvarande först, äldsta sist)\n- VIKTIGT: Behåll EXAKT ordningen från experience-arrayen\n- Tydlig struktur för erfarenheter och utbildning\n\nReturnera ENDAST den formaterade texten, ingen JSON.`,
      temperature: 0.3,
      maxOutputTokens: 4000,
      thinkingBudget: 0,
    });

    // Formateringsanropet ovan såg bara platshållare. Nu, efter att alla
    // modellanrop är gjorda, sätts de lokalt extraherade uppgifterna
    // tillbaka: dels i personalInfo så CV-byggaren får samma fält som
    // förut, dels i förhandsvisningstexten så användaren ser sina egna
    // uppgifter och inte [NAMN].
    const localAddress = [localContact.address, localContact.postalCode, localContact.city]
      .filter(Boolean)
      .join(", ");

    // Den lagrade strukturens egna uppgifter går före det som läses ur texten.
    const pi = structuredCV.personalInfo || {};
    structuredCV.personalInfo = {
      ...pi,
      fullName: pi.fullName || knownName || localContact.fullName,
      email: pi.email || localContact.email,
      phone: pi.phone || localContact.phone,
      address: pi.address || localAddress,
      linkedin: pi.linkedin || pi.linkedIn || localContact.linkedIn || "",
    };
    analysisResult.structuredCV = structuredCV;

    const formattedPreview = restorePlaceholders(previewResult.text, {
      name: knownName || localContact.fullName,
      email: localContact.email,
      phone: localContact.phone,
      address: localAddress,
    });
    analysisResult.formattedPreview = rensaPii(formattedPreview);
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
