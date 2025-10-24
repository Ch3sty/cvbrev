import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import { createServerClient } from '@/lib/supabase/server'

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
  language?: 'sv' | 'en'
}

interface SectionResult {
  optimized: string
  score_before: number
  score_after: number
  improvements: string[]
}

// GPT-4o optimization for "Om mig" section
async function optimizeAbout(text: string, mode: string, targetRole?: string, language: string = 'sv'): Promise<SectionResult> {
  const isSwedish = language === 'sv'

  const modeDescription = mode === 'stand_out'
    ? (isSwedish ? 'Få profilen att sticka ut mer' : 'Make the profile stand out more')
    : (isSwedish ? `Optimera för rollen: ${targetRole}` : `Optimize for the role: ${targetRole}`)

  const languageInstruction = isSwedish
    ? 'Använd svenska språket professionellt'
    : 'Use professional English language'

  const prompt = `You are a LinkedIn expert optimizing "About" sections.

MODE: ${modeDescription}

ORIGINAL TEXT:
---
${text}
---

OPTIMIZE FOR:
1. Strong opening hook (first sentence must capture attention)
2. Measurable achievements (years, percentages, numbers, regions, etc.)
3. Concrete results (not just "responsible for" but "increased", "reduced", "built")
4. Structured readability with bullet points for key results
5. ATS-keywords relevant for ${targetRole || 'professional development'}
6. Max 300 words
7. ${languageInstruction}

RETURN JSON:
{
  "optimized": "Optimized text here with bullets (use • for bullets)",
  "score_before": 46,
  "score_after": 89,
  "improvements": [
    "${isSwedish ? 'Lagt till mätbara resultat (10+ år, 5 regioner)' : 'Added measurable results (10+ years, 5 regions)'}",
    "${isSwedish ? 'Strukturerat med bullets för läsbarhet' : 'Structured with bullets for readability'}",
    "${isSwedish ? 'Starkare opening hook' : 'Stronger opening hook'}",
    "${isSwedish ? 'Fokus på prestationer istället för bara uppgifter' : 'Focus on achievements instead of just responsibilities'}"
  ]
}

IMPORTANT:
- Keep all factual information from the original text
- Don't add false information
- Improve structure and wording
- Quantify where possible based on the original text
- Write ALL content in ${isSwedish ? 'Swedish' : 'English'}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}

// GPT-4o optimization for "Erfarenhet" section
async function optimizeExperience(text: string, mode: string, targetRole?: string, language: string = 'sv'): Promise<SectionResult> {
  const isSwedish = language === 'sv'
  const modeDescription = mode === 'stand_out'
    ? (isSwedish ? 'Få erfarenheten att sticka ut mer' : 'Make experience stand out more')
    : (isSwedish ? `Optimera för rollen: ${targetRole}` : `Optimize for the role: ${targetRole}`)

  const prompt = `You are a LinkedIn expert optimizing "Experience" sections.

MODE: ${modeDescription}

ORIGINAL TEXT:
---
${text}
---

OPTIMIZE FOR:
1. Parse each job (title, company, dates, description)
2. Use STAR format (Situation, Task, Action, Result) for each role
3. Bullet points - max 5 per role, start with action verbs
4. Quantification everywhere (numbers, percentages, amounts, time spans)
5. Action verbs: ${isSwedish ? '"Grundade", "Ledde", "Ökade", "Utvecklade", "Implementerade"' : '"Founded", "Led", "Increased", "Developed", "Implemented"'}
6. Focus on RESULTS, not just job duties
7. Keep chronological order
8. Write ALL content in ${isSwedish ? 'Swedish' : 'English'}

RETURN JSON:
{
  "optimized": "Optimized experience text with structured jobs and bullets",
  "score_before": 52,
  "score_after": 87,
  "improvements": [
    "${isSwedish ? 'Omvandlat prosa till konkreta bullet points' : 'Converted prose to concrete bullet points'}",
    "${isSwedish ? 'Lagt till kvantifiering överallt' : 'Added quantification throughout'}",
    "${isSwedish ? 'Använt action verbs' : 'Used action verbs'}",
    "${isSwedish ? 'Fokus på resultat istället för bara arbetsuppgifter' : 'Focus on results instead of just job duties'}"
  ]
}

IMPORTANT:
- Keep all factual jobs, titles, and company names
- Don't add fake achievements
- Restructure descriptions into bullets with measurable results`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}

// GPT-4o optimization for "Utbildning" section
async function optimizeEducation(text: string, mode: string, targetRole?: string, language: string = 'sv'): Promise<SectionResult> {
  const isSwedish = language === 'sv'
  const prompt = `You are a LinkedIn expert optimizing "Education" sections.

ORIGINAL TEXT:
---
${text}
---

OPTIMIZE FOR:
1. Highlight relevant education for ${targetRole || 'professional development'}
2. Add special achievements if they exist (student jobs, awards, grades)
3. Include relevant certifications
4. Keep clear structure: School, Program, Year
5. Write ALL content in ${isSwedish ? 'Swedish' : 'English'}

RETURN JSON:
{
  "optimized": "Optimized education text",
  "score_before": 68,
  "score_after": 75,
  "improvements": [
    "${isSwedish ? 'Framhävt relevant utbildning' : 'Highlighted relevant education'}",
    "${isSwedish ? 'Lagt till specifika kurser/inriktningar' : 'Added specific courses/specializations'}"
  ]
}

IMPORTANT:
- Keep all factual schools and education
- Don't add fake certifications`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}

// GPT-4o optimization for "Kompetenser" section
async function optimizeSkills(text: string, mode: string, targetRole?: string, language: string = 'sv'): Promise<SectionResult> {
  const isSwedish = language === 'sv'
  const modeDescription = mode === 'stand_out'
    ? (isSwedish ? 'Allmän förbättring' : 'General improvement')
    : (isSwedish ? `Optimera för ${targetRole}` : `Optimize for ${targetRole}`)

  const prompt = `You are a LinkedIn expert optimizing "Skills" sections.

MODE: ${modeDescription}

ORIGINAL TEXT:
---
${text}
---

OPTIMIZE FOR:
1. Group skills into 3-4 clear categories (e.g., ${isSwedish ? '"Ledarskap & Affärsutveckling", "Digital Marknadsföring", "Teknisk Expertis"' : '"Leadership & Business Development", "Digital Marketing", "Technical Expertise"'})
2. Prioritize most relevant skills first (for ${targetRole || (isSwedish ? 'allmän professionell utveckling' : 'general professional development')})
3. Remove generic skills like "Microsoft Office", "Email", "Excel" (unless extremely relevant)
4. Add missing obvious skills based on experience (if they are implicit)
5. Use bullets (•) for each skill within the category
6. Write ALL content in ${isSwedish ? 'Swedish' : 'English'}

RETURN JSON:
{
  "optimized": "Optimized skills text with categories and bullets",
  "score_before": 58,
  "score_after": 82,
  "improvements": [
    "${isSwedish ? 'Grupperat i 3 tydliga kategorier' : 'Grouped into 3 clear categories'}",
    "${isSwedish ? 'Prioriterat ledarskap först (relevant för målroll)' : 'Prioritized leadership first (relevant for target role)'}",
    "${isSwedish ? 'Tagit bort generiska skills' : 'Removed generic skills'}",
    "${isSwedish ? 'Lagt till relevanta skills baserat på erfarenhet' : 'Added relevant skills based on experience'}"
  ]
}

IMPORTANT:
- Only add skills that are obvious from the experience
- Don't remove unique/specialized skills`

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
    const { sections, mode, target_role, language = 'sv' } = body

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
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })
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
      optimizeAbout(sections.about, mode, target_role, language),
      optimizeExperience(sections.experience, mode, target_role, language),
      sections.education ? optimizeEducation(sections.education, mode, target_role, language) : Promise.resolve(null),
      sections.skills ? optimizeSkills(sections.skills, mode, target_role, language) : Promise.resolve(null)
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
