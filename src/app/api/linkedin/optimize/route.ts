import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface OptimizationRequest {
  sections: {
    about: string
    experience: string
    education?: string
    skills?: string
  }
  mode: 'stand_out' | 'target_role'
  target_role?: string
}

interface SectionResult {
  optimized: string
  score_before: number
  score_after: number
  improvements: string[]
}

// GPT-4o optimization for "Om mig" section
async function optimizeAbout(text: string, mode: string, targetRole?: string): Promise<SectionResult> {
  const modeDescription = mode === 'stand_out'
    ? 'Få profilen att sticka ut mer'
    : `Optimera för rollen: ${targetRole}`

  const prompt = `Du är en LinkedIn-expert som optimerar "Om mig"-sektioner.

MODE: ${modeDescription}

ORIGINAL TEXT:
---
${text}
---

OPTIMERA FÖR:
1. Stark opening hook (första meningen måste fånga uppmärksamhet)
2. Mätbara achievements (år, procent, antal, regioner, etc.)
3. Konkreta resultat (inte bara "ansvar för" utan "ökade", "sänkte", "byggde")
4. Strukturerad läsbarhet med bullet points för nyckelresultat
5. ATS-keywords relevanta för ${targetRole || 'professionell utveckling'}
6. Max 300 ord
7. Använd svenska språket professionellt

RETURNERA JSON:
{
  "optimized": "Optimerad text här med bullets (använd • för bullets)",
  "score_before": 46,
  "score_after": 89,
  "improvements": [
    "Lagt till mätbara resultat (10+ år, 5 regioner)",
    "Strukturerat med bullets för läsbarhet",
    "Starkare opening hook",
    "Fokus på prestationer istället för bara uppgifter"
  ]
}

VIKTIGT:
- Behåll all faktisk information från originaltexten
- Lägg inte till falsk information
- Förbättra strukturen och formuleringar
- Kvantifiera där det är möjligt baserat på originaltexten`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}

// GPT-4o optimization for "Erfarenhet" section
async function optimizeExperience(text: string, mode: string, targetRole?: string): Promise<SectionResult> {
  const modeDescription = mode === 'stand_out'
    ? 'Få erfarenheten att sticka ut mer'
    : `Optimera för rollen: ${targetRole}`

  const prompt = `Du är en LinkedIn-expert som optimerar "Erfarenhet"-sektioner.

MODE: ${modeDescription}

ORIGINAL TEXT:
---
${text}
---

OPTIMERA FÖR:
1. Parse varje jobb (titel, företag, datum, beskrivning)
2. Använd STAR-format (Situation, Task, Action, Result) för varje roll
3. Bullet points - max 5 per roll, börja med action verbs
4. Kvantifiering överallt (siffror, procent, antal, tidsspann)
5. Action verbs: "Grundade", "Ledde", "Ökade", "Utvecklade", "Implementerade"
6. Fokus på RESULTAT, inte bara arbetsuppgifter
7. Behåll kronologisk ordning

RETURNERA JSON:
{
  "optimized": "Optimerad erfarenhetstext med strukturerade jobb och bullets",
  "score_before": 52,
  "score_after": 87,
  "improvements": [
    "Omvandlat prosa till konkreta bullet points",
    "Lagt till kvantifiering överallt",
    "Använt action verbs ('Grundade', 'Expanderade')",
    "Fokus på resultat istället för bara arbetsuppgifter"
  ]
}

VIKTIGT:
- Behåll alla faktiska jobb, titlar och företagsnamn
- Lägg inte till falska achievements
- Strukturera om beskrivningar till bullets med mätbara resultat`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}

// GPT-4o optimization for "Utbildning" section
async function optimizeEducation(text: string, mode: string, targetRole?: string): Promise<SectionResult> {
  const prompt = `Du är en LinkedIn-expert som optimerar "Utbildning"-sektioner.

ORIGINAL TEXT:
---
${text}
---

OPTIMERA FÖR:
1. Framhäv relevant utbildning för ${targetRole || 'professionell utveckling'}
2. Lägg till särskilda achievements om de finns (ex-jobb, priser, betyg)
3. Inkludera relevanta certifieringar
4. Behåll tydlig struktur: Skola, Program, Årtal

RETURNERA JSON:
{
  "optimized": "Optimerad utbildningstext",
  "score_before": 68,
  "score_after": 75,
  "improvements": [
    "Framhävt relevant utbildning",
    "Lagt till specifika kurser/inriktningar"
  ]
}

VIKTIGT:
- Behåll alla faktiska skolor och utbildningar
- Lägg inte till falska certifieringar`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}

// GPT-4o optimization for "Kompetenser" section
async function optimizeSkills(text: string, mode: string, targetRole?: string): Promise<SectionResult> {
  const prompt = `Du är en LinkedIn-expert som optimerar "Kompetenser"-sektioner.

MODE: ${mode === 'stand_out' ? 'Allmän förbättring' : `Optimera för ${targetRole}`}

ORIGINAL TEXT:
---
${text}
---

OPTIMERA FÖR:
1. Gruppera kompetenser i 3-4 tydliga kategorier (t.ex. "Ledarskap & Affärsutveckling", "Digital Marknadsföring", "Teknisk Expertis")
2. Prioritera mest relevanta skills först (för ${targetRole || 'allmän professionell utveckling'})
3. Ta bort generiska skills som "Microsoft Office", "Email", "Excel" (om inte extremt relevanta)
4. Lägg till saknade uppenbara skills baserat på erfarenhet (om de syns implicit)
5. Använd bullets (•) för varje skill inom kategorin

RETURNERA JSON:
{
  "optimized": "Optimerad kompetenstext med kategorier och bullets",
  "score_before": 58,
  "score_after": 82,
  "improvements": [
    "Grupperat i 3 tydliga kategorier",
    "Prioriterat ledarskap först (relevant för målroll)",
    "Tagit bort generiska skills",
    "Lagt till 'Entreprenörskap' (saknades men uppenbart från erfarenhet)"
  ]
}

VIKTIGT:
- Lägg bara till skills som är uppenbara från erfarenheten
- Ta inte bort unika/specialiserade skills`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}

// Calculate overall score
function calculateOverallScore(results: {
  about: SectionResult
  experience: SectionResult
  education?: SectionResult
  skills?: SectionResult
}, type: 'before' | 'after'): number {
  const scoreKey = type === 'before' ? 'score_before' : 'score_after'

  let totalScore = 0
  let totalWeight = 0

  // Om mig: 30% weight
  totalScore += results.about[scoreKey] * 0.3
  totalWeight += 0.3

  // Erfarenhet: 40% weight
  totalScore += results.experience[scoreKey] * 0.4
  totalWeight += 0.4

  // Utbildning: 15% weight (if present)
  if (results.education) {
    totalScore += results.education[scoreKey] * 0.15
    totalWeight += 0.15
  }

  // Kompetenser: 15% weight (if present)
  if (results.skills) {
    totalScore += results.skills[scoreKey] * 0.15
    totalWeight += 0.15
  }

  return Math.round(totalScore / totalWeight)
}

export async function POST(req: NextRequest) {
  try {
    const body: OptimizationRequest = await req.json()
    const { sections, mode, target_role } = body

    // Validation
    if (!sections.about?.trim()) {
      return NextResponse.json(
        { error: 'Du måste fylla i "Om mig"-sektionen' },
        { status: 400 }
      )
    }

    if (!sections.experience?.trim()) {
      return NextResponse.json(
        { error: 'Du måste fylla i "Erfarenhet"-sektionen' },
        { status: 400 }
      )
    }

    if (mode === 'target_role' && !target_role?.trim()) {
      return NextResponse.json(
        { error: 'Du måste ange vilken roll du vill optimera för' },
        { status: 400 }
      )
    }

    // Get current user
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad för att använda denna funktion' },
        { status: 401 }
      )
    }

    // Check if user is premium
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single()

    const isPremium = profile?.subscription_status === 'active'

    // Check quota for free users
    if (!isPremium) {
      const { data: weeklyCount, error: countError } = await supabase
        .rpc('get_weekly_linkedin_optimizations_count', { p_user_id: user.id })

      if (countError) {
        console.error('Error checking quota:', countError)
      }

      if (weeklyCount && weeklyCount >= 1) {
        return NextResponse.json(
          {
            error: 'Du har använt din gratis optimering denna vecka. Uppgradera till Premium för obegränsade optimeringar!',
            quota_exceeded: true
          },
          { status: 403 }
        )
      }
    }

    // Optimize each section in parallel
    const [aboutResult, experienceResult, educationResult, skillsResult] = await Promise.all([
      optimizeAbout(sections.about, mode, target_role),
      optimizeExperience(sections.experience, mode, target_role),
      sections.education ? optimizeEducation(sections.education, mode, target_role) : Promise.resolve(null),
      sections.skills ? optimizeSkills(sections.skills, mode, target_role) : Promise.resolve(null)
    ])

    // Calculate overall scores
    const results = {
      about: aboutResult,
      experience: experienceResult,
      ...(educationResult && { education: educationResult }),
      ...(skillsResult && { skills: skillsResult })
    }

    const overall_score_before = calculateOverallScore(results as any, 'before')
    const overall_score_after = calculateOverallScore(results as any, 'after')

    // Save to database
    const { data: savedOptimization, error: saveError } = await supabase
      .from('linkedin_optimizations')
      .insert({
        user_id: user.id,
        original_about: sections.about,
        original_experience: sections.experience,
        original_education: sections.education || null,
        original_skills: sections.skills || null,
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
      .single()

    if (saveError) {
      console.error('Error saving optimization:', saveError)
      // Don't fail the request if saving fails, just log it
    }

    return NextResponse.json({
      sections: results,
      overall_score_before,
      overall_score_after,
      optimization_id: savedOptimization?.id
    })

  } catch (error) {
    console.error('LinkedIn optimization error:', error)
    return NextResponse.json(
      { error: 'Något gick fel. Försök igen.' },
      { status: 500 }
    )
  }
}
