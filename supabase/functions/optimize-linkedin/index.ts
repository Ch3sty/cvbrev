import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
};

// Environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_PROJECT_ID = Deno.env.get('OPENAI_PROJECT_ID');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Validate environment variables
if (!OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY is not configured');
}
if (!OPENAI_PROJECT_ID) {
  console.warn('WARNING: OPENAI_PROJECT_ID is not configured');
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

// System prompt for all LinkedIn optimizations
const SYSTEM_PROMPT = `You are an expert LinkedIn career coach with 15+ years of experience optimizing profiles for:
- Job seekers at all levels (entry-level to C-suite)
- Career changers
- International professionals
- Swedish and global markets

Your approach:
1. Understand the person's unique value proposition
2. Identify their target audience (recruiters, hiring managers, network)
3. Create a compelling narrative that positions them for their goals
4. Use data-driven insights about what makes LinkedIn profiles successful
5. Optimize for both human readers and ATS systems

Core principles:
- Authenticity: Keep all facts true, enhance presentation
- Clarity: Make complex backgrounds easy to understand
- Impact: Focus on results and value delivered
- Searchability: Strategic use of keywords
- Story: Create emotional connection, not just facts

RED THREAD PRINCIPLE:
Your optimization should create a coherent narrative where:
1. Headline → Immediately shows who they are and what they want
2. About → Tells the story of how they got here and where they're going
3. Experience → Proves the story with concrete examples
4. Education → Supports the journey
5. Skills → Reinforces the expertise

Everything should point toward the target role (or general expertise if no target specified).

🚨 KRITISKA REGLER - MÅSTE FÖLJAS:

1. ❌ ALDRIG hitta på, anta eller tolka information som inte finns
2. ❌ ALDRIG ändra fakta: årtal, företagsnamn, skolnamn, examensnamn, titlar
3. ❌ ALDRIG omvandla "deltog i kurs" → "undervisade i kurs"
4. ❌ ALDRIG lägg till påståenden om ansvar personen inte hade
5. ✅ BEHÅLL exakt all faktisk information från originalet
6. ✅ FÖRBÄTTRA endast formulering, struktur och presentation
7. ✅ Om osäker på något - behåll originalformuleringen

BUZZWORD-FILTER (undvik generiska fraser):
❌ ALDRIG använd: "Driven professional", "Results-oriented", "Passionate about", "Innovative thinker",
   "Go-getter", "Team player", "Hard worker", "Self-starter", "Detail-oriented"
✅ ANVÄND istället: Konkreta exempel, siffror, specifika prestationer, mätbara resultat

EXEMPEL PÅ FEL ATT UNDVIKA:
❌ Fel: "Internationell licens som personlig tränare. Undervisade anatomi på engelska."
   (Personen DELTOG i kursen, undervisade INTE)
✅ Rätt: "Internationell licens som personlig tränare och kostrådgivare. Fördjupad kunskap inom anatomi, muskellära och skelett från engelskspråkig utbildning."

❌ Fel: "Driven sales professional with passion for results"
✅ Rätt: "Ökade försäljningen med 40% på 6 månader genom strategisk kundbearbetning"

SPRÅK & GRAMMATIK:
- Svenska: Perfekt svensk grammatik, naturligt flyt, korrekt böjning
- Engelska: Professional business English, no Swenglish
- Dubbelkolla ALLA pluralformer, verb-böjningar, bestämd/obestämd form
- Läs igenom texten mentalt - låter den naturlig för en infödd talare?

LINKEDIN-FORMATBEGRÄNSNINGAR:
- Headline: Max 220 tecken (HÅRT tak - får EJ överskridas)
- About: 3-4 korta stycken, totalt 250-350 ord (ej längre - blir oläsligt)
- Experience: Använd bullets (•), max 5 per roll, fokus på resultat
- Education: Kort format - Examen | Skola | År (+ eventuell specialisering på 1 rad)

KONKRETA EXEMPEL FÖRE/EFTER:

Original: "Jobbar som lärare och har gjort det i många år"
❌ Dåligt: "Passionate educator with extensive experience inspiring students"
✅ Bra: "Gymnasielärare i Engelska & Historia sedan 2015 | 300+ elever undervisade | Specialiserad på digitala läromedel"

Original: "Gick en kurs i ekonomi"
❌ Dåligt: "Educated in advanced financial economics"
✅ Bra: "Ekonomikurs vid Stockholms Universitet (2020)"

VALIDERING INNAN RETURN:
Innan du returnerar svaret, fråga dig själv:
1. Har jag lagt till något som INTE stod i originalet? → TA BORT
2. Har jag ändrat någon faktisk information? → ÅTERSTÄLL
3. Finns det buzzwords som kan bytas mot konkreta exempel? → ERSÄTT
4. Är grammatiken perfekt på målspråket? → DUBBELKOLLA
5. Passar texten LinkedIn's format och längd? → JUSTERA`;

interface OptimizationRequest {
  sections: {
    headline?: string;
    about: string;
    experience: string;
    education?: string;
    skills?: string;
  };
  mode: 'stand_out' | 'target_role';
  target_role?: string;
  language?: 'sv' | 'en';
  user_id: string;
}

interface ProfileContext {
  experienceLevel: 'junior' | 'mid' | 'senior';
  yearsOfExperience: number;
  hasLeadershipExperience: boolean;
  primaryIndustry: string;
  careerStage: string;
}

interface SectionResult {
  optimized: string;
  score_before: number;
  score_after: number;
  improvements: string[];
}

// Analyze profile context to adapt optimization approach
function analyzeProfileContext(experienceText: string, aboutText: string): ProfileContext {
  const text = `${experienceText} ${aboutText}`.toLowerCase();

  // Detect experience level based on keywords and text length
  const leadershipKeywords = ['led', 'ledde', 'managed', 'director', 'chef', 'vd', 'ceo', 'head of', 'team lead'];
  const seniorKeywords = ['senior', '10+', 'years', 'år', 'experienced', 'erfaren'];
  const juniorKeywords = ['nyutexaminerad', 'graduate', 'junior', 'praktik', 'internship', 'student'];

  const hasLeadership = leadershipKeywords.some(kw => text.includes(kw));
  const hasSeniorMarkers = seniorKeywords.some(kw => text.includes(kw));
  const hasJuniorMarkers = juniorKeywords.some(kw => text.includes(kw));

  // Estimate years of experience (rough heuristic based on text complexity and length)
  const experienceLength = experienceText.length;
  let yearsOfExperience = 0;
  if (experienceLength > 2000) yearsOfExperience = 10;
  else if (experienceLength > 1000) yearsOfExperience = 5;
  else if (experienceLength > 500) yearsOfExperience = 2;
  else yearsOfExperience = 1;

  // Determine experience level
  let experienceLevel: 'junior' | 'mid' | 'senior';
  if (hasJuniorMarkers || yearsOfExperience <= 2) {
    experienceLevel = 'junior';
  } else if (hasSeniorMarkers || hasLeadership || yearsOfExperience >= 8) {
    experienceLevel = 'senior';
  } else {
    experienceLevel = 'mid';
  }

  // Detect primary industry (simplified)
  const industries: Record<string, string[]> = {
    tech: ['developer', 'software', 'it', 'tech', 'utvecklare', 'programmerare'],
    marketing: ['marketing', 'marknadsföring', 'seo', 'content', 'social media'],
    sales: ['sales', 'försäljning', 'säljare', 'account manager'],
    finance: ['ekonomi', 'finance', 'accounting', 'redovisning'],
    education: ['teacher', 'lärare', 'education', 'utbildning'],
    healthcare: ['healthcare', 'sjukvård', 'nurse', 'doctor', 'vårdgivare']
  };

  let primaryIndustry = 'General';
  for (const [industry, keywords] of Object.entries(industries)) {
    if (keywords.some(kw => text.includes(kw))) {
      primaryIndustry = industry;
      break;
    }
  }

  const careerStage = experienceLevel === 'junior'
    ? 'Early career - focus on potential and learning'
    : experienceLevel === 'senior'
    ? 'Senior professional - emphasize leadership and strategic impact'
    : 'Mid-career - balance achievements with growth potential';

  return {
    experienceLevel,
    yearsOfExperience,
    hasLeadershipExperience: hasLeadership,
    primaryIndustry,
    careerStage
  };
}

// Call OpenAI API with proper headers
async function callOpenAI(messages: any[], temperature = 0.7): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`
  };

  if (OPENAI_PROJECT_ID) {
    headers['OpenAI-Project'] = OPENAI_PROJECT_ID;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      response_format: { type: 'json_object' },
      temperature
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`OpenAI API error (${response.status}):`, errorText);
    throw new Error(`OpenAI API failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content || '{}');
}

// GPT-4o optimization for Headline
async function optimizeHeadline(
  currentHeadline: string | undefined,
  aboutText: string,
  experienceText: string,
  mode: string,
  targetRole?: string,
  language: string = 'sv'
): Promise<SectionResult> {
  const isSwedish = language === 'sv';
  const context = analyzeProfileContext(experienceText, aboutText);

  const modeDescription = mode === 'stand_out'
    ? (isSwedish ? 'Skapa en rubrik som får profilen att sticka ut' : 'Create a headline that makes the profile stand out')
    : (isSwedish ? `Optimera rubriken för rollen: ${targetRole}` : `Optimize headline for the role: ${targetRole}`);

  const prompt = `${SYSTEM_PROMPT}

TASK: Optimize LinkedIn Headline

MODE: ${modeDescription}
LANGUAGE: ${isSwedish ? 'Swedish' : 'English'}
EXPERIENCE LEVEL: ${context.experienceLevel} (${context.careerStage})
TARGET ROLE: ${targetRole || (isSwedish ? 'Allmän karriärutveckling' : 'General career advancement')}

CURRENT HEADLINE:
${currentHeadline || (isSwedish ? '(Ingen rubrik angiven - skapa från scratch baserat på profilen)' : '(No headline provided - create from scratch based on profile)')}

PROFILE CONTEXT:
About: ${aboutText.substring(0, 300)}...
Experience: ${experienceText.substring(0, 300)}...

OPTIMIZATION GUIDELINES:
1. **Max 220 characters** (LinkedIn limit)
2. **Include target role** if specified, or current/desired role
3. **Add value proposition** - what makes this person unique
4. **Use keywords** relevant for ${targetRole || 'their field'} (ATS optimization)
5. **Show expertise areas** (1-3 key areas)

RETURN JSON:
{
  "optimized": "Your optimized headline here (max 220 chars)",
  "score_before": 45,
  "score_after": 88,
  "improvements": [
    "${isSwedish ? 'Lagt till målroll och värdeposition' : 'Added target role and value proposition'}",
    "${isSwedish ? 'Inkluderat nyckelkompetenser för ATS' : 'Included key skills for ATS'}"
  ]
}

IMPORTANT:
- Keep factual to the profile content
- Make it compelling and searchable
- Balance professionalism with personality
- Write ENTIRELY in ${isSwedish ? 'Swedish' : 'English'}`;

  return await callOpenAI([{ role: 'user', content: prompt }], 0.7);
}

// GPT-4o optimization for About section
async function optimizeAbout(
  text: string,
  experienceText: string,
  mode: string,
  targetRole?: string,
  language: string = 'sv'
): Promise<SectionResult> {
  const isSwedish = language === 'sv';
  const context = analyzeProfileContext(experienceText, text);

  const prompt = `${SYSTEM_PROMPT}

TASK: Optimize LinkedIn "About" Section

MODE: ${mode === 'stand_out' ? (isSwedish ? 'Skapa en engagerande profil som sticker ut' : 'Create an engaging profile that stands out') : (isSwedish ? `Optimera för målrollen: ${targetRole}` : `Optimize for target role: ${targetRole}`)}
LANGUAGE: ${isSwedish ? 'Swedish' : 'English'}
EXPERIENCE LEVEL: ${context.experienceLevel} (${context.careerStage})
TARGET ROLE: ${targetRole || (isSwedish ? 'Allmän karriärutveckling' : 'General career advancement')}

ORIGINAL TEXT:
---
${text}
---

CORE OPTIMIZATION GUIDELINES:
1. **Engaging Story Arc**: Create narrative flow
2. **Red Thread Principle**: Every sentence should connect to your unique value proposition
3. **Measurable Impact**: Include quantifiable achievements
4. **Industry Keywords**: Natural integration of relevant ATS keywords
5. **Length**: 250-350 words (3-4 paragraphs)

RETURN JSON:
{
  "optimized": "Compelling About section that tells a story and positions the person for their goals",
  "score_before": 46,
  "score_after": 89,
  "improvements": [
    "${isSwedish ? 'Skapade en engagerande berättelse med röd tråd' : 'Created an engaging narrative with red thread'}",
    "${isSwedish ? 'Lagt till mätbara resultat och kvantifiering' : 'Added measurable results and quantification'}"
  ]
}

IMPORTANT:
- Keep ALL factual information from original
- Don't invent achievements or experiences
- Create emotional connection while staying professional
- Write ENTIRELY in ${isSwedish ? 'Swedish' : 'English'}`;

  return await callOpenAI([{ role: 'user', content: prompt }], 0.7);
}

// GPT-4o optimization for Experience section
async function optimizeExperience(
  text: string,
  aboutText: string,
  mode: string,
  targetRole?: string,
  language: string = 'sv'
): Promise<SectionResult> {
  const isSwedish = language === 'sv';
  const context = analyzeProfileContext(text, aboutText);

  const prompt = `${SYSTEM_PROMPT}

TASK: Optimize LinkedIn "Experience" Section

MODE: ${mode === 'stand_out' ? (isSwedish ? 'Få erfarenheten att sticka ut och visa progression' : 'Make experience stand out and show progression') : (isSwedish ? `Optimera för målrollen: ${targetRole}` : `Optimize for target role: ${targetRole}`)}
LANGUAGE: ${isSwedish ? 'Swedish' : 'English'}
EXPERIENCE LEVEL: ${context.experienceLevel} (${context.careerStage})
TARGET ROLE: ${targetRole || (isSwedish ? 'Allmän karriärutveckling' : 'General career advancement')}

ORIGINAL TEXT:
---
${text}
---

CORE OPTIMIZATION GUIDELINES:
1. **STAR Format for Each Role**: Situation, Task, Action, Result
2. **Action Verbs**: Use powerful verbs appropriate to experience level
3. **Quantification**: Add measurable outcomes to all achievements
4. **Red Thread**: Show progression toward target role
5. **Chronological Order**: Most recent first

RETURN JSON:
{
  "optimized": "Structured experience section showing clear progression and results",
  "score_before": 52,
  "score_after": 87,
  "improvements": [
    "${isSwedish ? 'Omstrukturerat till STAR-format med tydliga resultat' : 'Restructured to STAR format with clear results'}",
    "${isSwedish ? 'Lagt till kvantifiering på alla achievements' : 'Added quantification to all achievements'}"
  ]
}

IMPORTANT:
- Keep ALL factual job information (company, title, dates)
- Don't invent achievements - only enhance presentation
- Write ENTIRELY in ${isSwedish ? 'Swedish' : 'English'}`;

  return await callOpenAI([{ role: 'user', content: prompt }], 0.7);
}

// GPT-4o optimization for Education section
async function optimizeEducation(
  text: string,
  experienceText: string,
  aboutText: string,
  mode: string,
  targetRole?: string,
  language: string = 'sv'
): Promise<SectionResult> {
  const isSwedish = language === 'sv';
  const context = analyzeProfileContext(experienceText, aboutText);

  const prompt = `${SYSTEM_PROMPT}

TASK: Optimize LinkedIn "Education" Section

MODE: ${mode === 'stand_out' ? (isSwedish ? 'Framhäv utbildning och meriter' : 'Highlight education and credentials') : (isSwedish ? `Optimera för målrollen: ${targetRole}` : `Optimize for target role: ${targetRole}`)}
LANGUAGE: ${isSwedish ? 'Swedish' : 'English'}
EXPERIENCE LEVEL: ${context.experienceLevel} (${context.careerStage})

ORIGINAL TEXT:
---
${text}
---

OPTIMIZATION GUIDELINES:
- Junior: Expand with thesis, coursework, achievements (IF they exist in original)
- Mid/Senior: Keep concise, emphasize certifications
- Adapt detail level to experience level

⚠️ KRITISKT FÖR UTBILDNING:
- Om personen "gick en kurs" → använd ALDRIG "undervisade", "lärde ut", "föreläste"
- Om personen var STUDENT → använd "studerade", "fördjupade kunskaper i", "fick utbildning i"
- Om personen var LÄRARE → då kan du använda "undervisade" (men bara om det TYDLIGT framgår)

EXEMPEL - KORREKT TOLKNING:
Original: "Internationell licens som personlig tränare samt kostrådgivare."
❌ FEL: "Undervisade anatomi på engelska med latinska termer"
✅ RÄTT: "Internationell licens som personlig tränare och kostrådgivare. Fördjupad kunskap inom anatomi, muskellära och skelett från engelskspråkig utbildning."

LINKEDIN-FORMAT FÖR UTBILDNING:
**[Examen/Certifiering]**
[Skola/Institution] | [Ort (om relevant)] | [År/Period]
[Ev. specialisering eller kortfattat tillägg på MAX 1 rad]

RETURN JSON:
{
  "optimized": "Optimized education section appropriate for experience level",
  "score_before": 68,
  "score_after": 75,
  "improvements": [
    "${isSwedish ? 'Anpassat detalj-nivå baserat på erfarenhet' : 'Adapted detail level based on experience'}"
  ]
}

IMPORTANT:
- Keep ALL factual schools, degrees, and years EXACTLY as stated
- NEVER change person's role from student to teacher
- Write ENTIRELY in ${isSwedish ? 'Swedish' : 'English'}`;

  return await callOpenAI([{ role: 'user', content: prompt }], 0.7);
}

// GPT-4o optimization for Skills section
async function optimizeSkills(
  text: string,
  experienceText: string,
  aboutText: string,
  mode: string,
  targetRole?: string,
  language: string = 'sv'
): Promise<SectionResult> {
  const isSwedish = language === 'sv';
  const context = analyzeProfileContext(experienceText, aboutText);

  const prompt = `${SYSTEM_PROMPT}

TASK: Optimize LinkedIn Skills Section

MODE: ${mode === 'stand_out' ? (isSwedish ? 'Allmän förbättring' : 'General improvement') : (isSwedish ? `Optimera för ${targetRole}` : `Optimize for ${targetRole}`)}
LANGUAGE: ${isSwedish ? 'Swedish' : 'English'}
EXPERIENCE LEVEL: ${context.experienceLevel} (${context.careerStage})
PRIMARY INDUSTRY: ${context.primaryIndustry}

ORIGINAL SKILLS:
---
${text}
---

CONTEXT FROM PROFILE (for adding implicit skills):
Experience: ${experienceText.substring(0, 500)}...
About: ${aboutText.substring(0, 300)}...

OPTIMIZATION GUIDELINES:
1. **Skill Organization**: 3-4 categories with bullets (•)
2. **Prioritization**: Most relevant skills for ${targetRole || 'career goals'} first
3. **Remove generic fluff**: "Microsoft Office", "Email", etc.
4. **Add implicit skills**: Skills obvious from experience but not listed
5. **Keywords for ATS**: Industry-standard terms

RETURN JSON:
{
  "optimized": "Organized skills with 3-4 categories, bullets (•), prioritized by relevance",
  "score_before": 58,
  "score_after": 85,
  "improvements": [
    "${isSwedish ? 'Organiserat i 3 relevanta kategorier' : 'Organized into 3 relevant categories'}",
    "${isSwedish ? 'Tagit bort generiska skills' : 'Removed generic skills'}"
  ]
}

IMPORTANT:
- Only add skills truly evident from the experience/about sections
- Write ALL content in ${isSwedish ? 'Swedish' : 'English'}`;

  return await callOpenAI([{ role: 'user', content: prompt }], 0.7);
}

// Calculate overall score
function calculateOverallScore(results: {
  headline: SectionResult;
  about: SectionResult;
  experience: SectionResult;
  education?: SectionResult;
  skills?: SectionResult;
}, type: 'before' | 'after'): number {
  const scoreKey = type === 'before' ? 'score_before' : 'score_after';

  let totalScore = 0;
  let totalWeight = 0;

  // Headline: 20% weight
  totalScore += results.headline[scoreKey] * 0.2;
  totalWeight += 0.2;

  // About: 25% weight
  totalScore += results.about[scoreKey] * 0.25;
  totalWeight += 0.25;

  // Experience: 35% weight
  totalScore += results.experience[scoreKey] * 0.35;
  totalWeight += 0.35;

  // Education: 10% weight (if present)
  if (results.education) {
    totalScore += results.education[scoreKey] * 0.1;
    totalWeight += 0.1;
  }

  // Skills: 10% weight (if present)
  if (results.skills) {
    totalScore += results.skills[scoreKey] * 0.1;
    totalWeight += 0.1;
  }

  return Math.round(totalScore / totalWeight);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: OptimizationRequest = await req.json();
    const { sections, mode, target_role, language = 'sv', user_id } = body;

    // Validation
    if (!sections.about?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Du måste fylla i "Om mig"-sektionen' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!sections.experience?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Du måste fylla i "Erfarenhet"-sektionen' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (mode === 'target_role' && !target_role?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Du måste ange vilken roll du vill optimera för' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID krävs' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is premium
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user_id)
      .single();

    const isPremium = profile?.subscription_status === 'active';

    // Check quota for free users
    if (!isPremium) {
      const { data: weeklyCount, error: countError } = await supabase
        .rpc('get_weekly_linkedin_optimizations_count', { p_user_id: user_id });

      if (countError) {
        console.error('Error checking quota:', countError);
      }

      if (weeklyCount && weeklyCount >= 1) {
        return new Response(
          JSON.stringify({
            error: 'Du har använt din gratis optimering denna vecka. Uppgradera till Premium för obegränsade optimeringar!',
            quota_exceeded: true
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('[LinkedIn Optimizer] Starting optimization...');

    // Optimize each section in parallel
    const [headlineResult, aboutResult, experienceResult, educationResult, skillsResult] = await Promise.all([
      optimizeHeadline(sections.headline, sections.about, sections.experience, mode, target_role, language),
      optimizeAbout(sections.about, sections.experience, mode, target_role, language),
      optimizeExperience(sections.experience, sections.about, mode, target_role, language),
      sections.education ? optimizeEducation(sections.education, sections.experience, sections.about, mode, target_role, language) : Promise.resolve(null),
      sections.skills ? optimizeSkills(sections.skills, sections.experience, sections.about, mode, target_role, language) : Promise.resolve(null)
    ]);

    // Calculate overall scores
    const results = {
      headline: headlineResult,
      about: aboutResult,
      experience: experienceResult,
      ...(educationResult && { education: educationResult }),
      ...(skillsResult && { skills: skillsResult })
    };

    const overall_score_before = calculateOverallScore(results as any, 'before');
    const overall_score_after = calculateOverallScore(results as any, 'after');

    console.log(`[LinkedIn Optimizer] Optimization complete. Score: ${overall_score_before} → ${overall_score_after}`);

    // Save to database
    const { data: savedOptimization, error: saveError } = await supabase
      .from('linkedin_optimizations')
      .insert({
        user_id,
        original_headline: sections.headline || null,
        original_about: sections.about,
        original_experience: sections.experience,
        original_education: sections.education || null,
        original_skills: sections.skills || null,
        optimized_headline: headlineResult,
        optimized_about: aboutResult,
        optimized_experience: experienceResult,
        optimized_education: educationResult || null,
        optimized_skills: skillsResult || null,
        overall_score_before,
        overall_score_after,
        mode,
        target_role: target_role || null
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving optimization:', saveError);
      // Don't fail the request if saving fails
    }

    return new Response(
      JSON.stringify({
        sections: results,
        overall_score_before,
        overall_score_after,
        optimization_id: savedOptimization?.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[LinkedIn Optimizer] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Något gick fel. Försök igen.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
