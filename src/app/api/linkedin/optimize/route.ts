import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import { createServerClient } from '@/lib/supabase/server'
import { calculateCostFromDatabase } from '@/lib/openai/pricing-sync'
import { trackAIUsage, AI_FEATURES } from '@/lib/ai-cost-tracker'
import { logUserActivity } from '@/lib/activity-logger'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Quota limits
const WEEKLY_LINKEDIN_LIMIT_FREE = 1
const WEEKLY_LINKEDIN_LIMIT_PREMIUM = 999
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

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

Everything should point toward the target role (or general expertise if no target specified).`

interface OptimizationRequest {
  sections: {
    headline?: string
    about: string
    experience: string
    education?: string
    skills?: string
  }
  mode: 'stand_out' | 'target_role'
  target_role?: string
  language?: 'sv' | 'en'
}

interface ProfileContext {
  experienceLevel: 'junior' | 'mid' | 'senior'
  yearsOfExperience: number
  hasLeadershipExperience: boolean
  primaryIndustry: string
  careerStage: string
}

interface SectionResult {
  optimized: string
  score_before: number
  score_after: number
  improvements: string[]
}

// Analyze profile context to adapt optimization approach
function analyzeProfileContext(experienceText: string, aboutText: string): ProfileContext {
  const text = `${experienceText} ${aboutText}`.toLowerCase()

  // Detect experience level based on keywords and text length
  const leadershipKeywords = ['led', 'ledde', 'managed', 'director', 'chef', 'vd', 'ceo', 'head of', 'team lead']
  const seniorKeywords = ['senior', '10+', 'years', 'år', 'experienced', 'erfaren']
  const juniorKeywords = ['nyutexaminerad', 'graduate', 'junior', 'praktik', 'internship', 'student']

  const hasLeadership = leadershipKeywords.some(kw => text.includes(kw))
  const hasSeniorMarkers = seniorKeywords.some(kw => text.includes(kw))
  const hasJuniorMarkers = juniorKeywords.some(kw => text.includes(kw))

  // Estimate years of experience (rough heuristic based on text complexity and length)
  const experienceLength = experienceText.length
  let yearsOfExperience = 0
  if (experienceLength > 2000) yearsOfExperience = 10
  else if (experienceLength > 1000) yearsOfExperience = 5
  else if (experienceLength > 500) yearsOfExperience = 2
  else yearsOfExperience = 1

  // Determine experience level
  let experienceLevel: 'junior' | 'mid' | 'senior'
  if (hasJuniorMarkers || yearsOfExperience <= 2) {
    experienceLevel = 'junior'
  } else if (hasSeniorMarkers || hasLeadership || yearsOfExperience >= 8) {
    experienceLevel = 'senior'
  } else {
    experienceLevel = 'mid'
  }

  // Detect primary industry (simplified)
  const industries = {
    tech: ['developer', 'software', 'it', 'tech', 'utvecklare', 'programmerare'],
    marketing: ['marketing', 'marknadsföring', 'seo', 'content', 'social media'],
    sales: ['sales', 'försäljning', 'säljare', 'account manager'],
    finance: ['ekonomi', 'finance', 'accounting', 'redovisning'],
    education: ['teacher', 'lärare', 'education', 'utbildning'],
    healthcare: ['healthcare', 'sjukvård', 'nurse', 'doctor', 'vårdgivare']
  }

  let primaryIndustry = 'General'
  for (const [industry, keywords] of Object.entries(industries)) {
    if (keywords.some(kw => text.includes(kw))) {
      primaryIndustry = industry
      break
    }
  }

  const careerStage = experienceLevel === 'junior'
    ? 'Early career - focus on potential and learning'
    : experienceLevel === 'senior'
    ? 'Senior professional - emphasize leadership and strategic impact'
    : 'Mid-career - balance achievements with growth potential'

  return {
    experienceLevel,
    yearsOfExperience,
    hasLeadershipExperience: hasLeadership,
    primaryIndustry,
    careerStage
  }
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
  const isSwedish = language === 'sv'
  const context = analyzeProfileContext(experienceText, aboutText)

  const modeDescription = mode === 'stand_out'
    ? (isSwedish ? 'Skapa en rubrik som får profilen att sticka ut' : 'Create a headline that makes the profile stand out')
    : (isSwedish ? `Optimera rubriken för rollen: ${targetRole}` : `Optimize headline for the role: ${targetRole}`)

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
6. **Include status** if job seeking (e.g., ${isSwedish ? '"Öppen för nya möjligheter"' : '"Open to opportunities"'})

${isSwedish ? `
SWEDISH MARKET SPECIFICS:
- Use Swedish professional titles: "Ekonomiassistent", "Projektledare", "Systemutvecklare"
- Natural Swedish phrasing (not direct English translation)
- Reference Swedish context if relevant: "Komvux", "Gymnasiekompetens"
` : `
INTERNATIONAL MARKET SPECIFICS:
- Use internationally recognized job titles
- Clear, confident professional tone
- Global industry terminology
`}

EXAMPLES OF GOOD HEADLINES:
${isSwedish ? `
- "Projektledare | Agil Expert | Driver digitala transformationer för svenska företag"
- "Nyexaminerad Civilekonom | Specialist på Financial Analysis | Söker trainee-program"
- "Senior Marknadsförare | 10+ års erfarenhet | SEO, Content & Growth Marketing"
` : `
- "Project Manager | Agile Expert | Driving Digital Transformation"
- "Recent Business Graduate | Financial Analysis Specialist | Seeking Graduate Programs"
- "Senior Marketing Professional | 10+ Years | SEO, Content & Growth Marketing"
`}

RETURN JSON:
{
  "optimized": "Your optimized headline here (max 220 chars)",
  "score_before": 45,
  "score_after": 88,
  "improvements": [
    "${isSwedish ? 'Lagt till målroll och värdeposition' : 'Added target role and value proposition'}",
    "${isSwedish ? 'Inkluderat nyckelkompetenser för ATS' : 'Included key skills for ATS'}",
    "${isSwedish ? 'Ökad sökbarhet med rätt nyckelord' : 'Increased searchability with right keywords'}"
  ]
}

IMPORTANT:
- Keep factual to the profile content
- Make it compelling and searchable
- Balance professionalism with personality
- Write ENTIRELY in ${isSwedish ? 'Swedish' : 'English'}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7
  })

  const result = JSON.parse(response.choices[0].message.content || '{}')
  // Attach usage data to result
  result._usage = response.usage
  return result
}

// GPT-4o optimization for "Om mig" section
async function optimizeAbout(
  text: string,
  experienceText: string,
  mode: string,
  targetRole?: string,
  language: string = 'sv'
): Promise<SectionResult> {
  const isSwedish = language === 'sv'
  const context = analyzeProfileContext(experienceText, text)

  const modeDescription = mode === 'stand_out'
    ? (isSwedish ? 'Skapa en engagerande profil som sticker ut' : 'Create an engaging profile that stands out')
    : (isSwedish ? `Optimera för målrollen: ${targetRole}` : `Optimize for target role: ${targetRole}`)

  const prompt = `${SYSTEM_PROMPT}

TASK: Optimize LinkedIn "About" Section

MODE: ${modeDescription}
LANGUAGE: ${isSwedish ? 'Swedish' : 'English'}
EXPERIENCE LEVEL: ${context.experienceLevel} (${context.careerStage})
TARGET ROLE: ${targetRole || (isSwedish ? 'Allmän karriärutveckling' : 'General career advancement')}

ORIGINAL TEXT:
---
${text}
---

OPTIMIZATION STRATEGY BASED ON EXPERIENCE LEVEL:

${context.experienceLevel === 'junior' ? `
**JUNIOR PROFILE APPROACH:**
- Emphasize POTENTIAL, learning agility, and drive
- Highlight education projects, internships, part-time work
- Focus on skills acquired and enthusiasm for the field
- Show how academic/project work prepared them for ${targetRole || 'their career'}
- Use energetic, forward-looking tone
- Example opening: "Passionate recent graduate eager to apply..."
` : context.experienceLevel === 'senior' ? `
**SENIOR PROFILE APPROACH:**
- Lead with STRATEGIC IMPACT and leadership experience
- Quantify scale: team sizes, budgets, regional responsibility
- Show track record of driving change and delivering results
- Position as industry expert or thought leader
- Confident, authoritative tone
- Example opening: "Seasoned leader with 15+ years driving..."
` : `
**MID-CAREER APPROACH:**
- Balance PROVEN RESULTS with growth potential
- Show career progression and increasing responsibility
- Highlight specialized expertise developed
- Demonstrate readiness for next-level challenges
- Professional, confident but approachable tone
- Example opening: "Results-driven professional with 5+ years..."
`}

CORE OPTIMIZATION GUIDELINES:
1. **Engaging Story Arc**: Create narrative flow
   - Opening hook → Who you are professionally
   - Journey → How you got here (key experiences)
   - Value → What you bring to the table
   - Future → Where you're heading (connects to target role)

2. **Red Thread Principle**: Every sentence should connect to either:
   - Your unique value proposition
   - The target role you're pursuing
   - Key achievements that prove your capability

3. **Measurable Impact**: Include quantifiable achievements
   - ${isSwedish ? 'Exempel: "Ökade försäljningen med 40%", "Ledde team på 12 personer"' : 'Example: "Increased sales by 40%", "Led team of 12"'}

4. **Industry Keywords**: Natural integration of ${targetRole || 'relevant'} ATS keywords
   - ${context.primaryIndustry} industry terminology
   - ${isSwedish ? 'Svenska yrkestitlar och termer' : 'International job titles and terms'}

5. **Structure for Readability**:
   - Opening paragraph: Who you are + hook
   - Middle: 2-3 key achievements/areas with bullets
   - Closing: Future goals/what you're looking for

6. **Professional Tone**:
   ${isSwedish ? `- Svensk professionell ton: balanserad, konkret, inte överdrivet självsäker
   - Använd "jag" naturligt: "Jag leder...", "Jag har byggt..."
   - Undvik direktöversättningar från engelska` : `- International professional tone: confident but authentic
   - Use active voice: "I lead...", "I've built..."
   - Clear and direct communication`}

7. **Length**: 250-350 words (3-4 paragraphs)

${isSwedish ? `
SWEDISH MARKET SPECIFICS:
- Use Swedish professional terminology naturally
- Reference Swedish work culture when relevant
- Examples: "gymnasiekompetens", "komvux", "högskola"
- Modest but clear about achievements (Swedish culture)
` : `
INTERNATIONAL MARKET SPECIFICS:
- Use globally recognized terminology
- More assertive, achievement-focused language
- Clear about value proposition and unique selling points
`}

RETURN JSON:
{
  "optimized": "Compelling About section that tells a story and positions the person for their goals",
  "score_before": 46,
  "score_after": 89,
  "improvements": [
    "${isSwedish ? 'Skapade en engagerande berättelse med röd tråd' : 'Created an engaging narrative with red thread'}",
    "${isSwedish ? 'Anpassat ton för ' + context.experienceLevel + '-nivå' : 'Adapted tone for ' + context.experienceLevel + ' level'}",
    "${isSwedish ? 'Lagt till mätbara resultat och kvantifiering' : 'Added measurable results and quantification'}",
    "${isSwedish ? 'Optimerat för ' + (targetRole || 'karriärmål') + ' med rätt nyckelord' : 'Optimized for ' + (targetRole || 'career goals') + ' with right keywords'}"
  ]
}

IMPORTANT:
- Keep ALL factual information from original
- Don't invent achievements or experiences
- Create emotional connection while staying professional
- Every word should serve the narrative toward ${targetRole || 'their goals'}
- Write ENTIRELY in ${isSwedish ? 'Swedish' : 'English'}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7
  })

  const result = JSON.parse(response.choices[0].message.content || '{}')
  // Attach usage data to result
  result._usage = response.usage
  return result
}

// GPT-4o optimization for "Erfarenhet" section
async function optimizeExperience(
  text: string,
  aboutText: string,
  mode: string,
  targetRole?: string,
  language: string = 'sv'
): Promise<SectionResult> {
  const isSwedish = language === 'sv'
  const context = analyzeProfileContext(text, aboutText)

  const modeDescription = mode === 'stand_out'
    ? (isSwedish ? 'Få erfarenheten att sticka ut och visa progression' : 'Make experience stand out and show progression')
    : (isSwedish ? `Optimera för målrollen: ${targetRole}` : `Optimize for target role: ${targetRole}`)

  const prompt = `${SYSTEM_PROMPT}

TASK: Optimize LinkedIn "Experience" Section

MODE: ${modeDescription}
LANGUAGE: ${isSwedish ? 'Swedish' : 'English'}
EXPERIENCE LEVEL: ${context.experienceLevel} (${context.careerStage})
TARGET ROLE: ${targetRole || (isSwedish ? 'Allmän karriärutveckling' : 'General career advancement')}

ORIGINAL TEXT:
---
${text}
---

OPTIMIZATION STRATEGY BASED ON EXPERIENCE LEVEL:

${context.experienceLevel === 'junior' ? `
**JUNIOR/LIMITED EXPERIENCE APPROACH:**
- Highlight ALL relevant experience: internships, part-time jobs, volunteer work
- Emphasize skills LEARNED and initiative SHOWN
- Include relevant school/university projects if they demonstrate professional skills
- Show growth mindset and eagerness to contribute
- Don't apologize for limited experience - focus on what IS there
- Example: "Part-time Sales Associate → Developed customer service skills while managing..."
` : context.experienceLevel === 'senior' ? `
**SENIOR/EXTENSIVE EXPERIENCE APPROACH:**
- Focus on most recent and relevant 7-10 years in detail
- Emphasize LEADERSHIP roles and STRATEGIC impact
- Quantify: team sizes managed, budgets controlled, scale of responsibility
- Show progression: individual contributor → lead → manager → director
- Older roles can be summarized or omitted if not relevant
- Example: "VP of Sales → Led organization of 50+ across 3 regions, driving $10M revenue growth..."
` : `
**MID-CAREER APPROACH:**
- Show clear career PROGRESSION and increasing responsibility
- Balance tactical execution with strategic thinking
- Highlight specialized expertise developed over time
- Demonstrate readiness for next-level challenges
- Include all relevant roles from past 5-7 years
- Example: "Senior Marketing Manager → Progressed from coordinator to senior role, now managing..."
`}

CORE OPTIMIZATION GUIDELINES:

1. **STAR Format for Each Role**:
   - Situation: Context of the role
   - Task: Your responsibility
   - Action: What you DID (action verbs!)
   - Result: Quantifiable outcome

2. **Structure Per Job Entry**:
   \`\`\`
   **Job Title** | Company Name | Dates
   Brief role context (1 sentence)
   • Achievement 1 with quantification
   • Achievement 2 with result
   • Achievement 3 with impact
   (Max 5 bullets per role - prioritize most impressive)
   \`\`\`

3. **Action Verbs by Level**:
   ${isSwedish ? `
   - Junior: "Bidrog till", "Assisterade", "Lärde mig", "Genomförde", "Hanterade"
   - Mid: "Ledde", "Utvecklade", "Implementerade", "Förbättrade", "Drev"
   - Senior: "Skapade", "Transformerade", "Omstrukturerade", "Grundade", "Skalade"
   ` : `
   - Junior: "Contributed to", "Assisted", "Learned", "Executed", "Managed"
   - Mid: "Led", "Developed", "Implemented", "Improved", "Drove"
   - Senior: "Created", "Transformed", "Restructured", "Founded", "Scaled"
   `}

4. **Quantification Everywhere**:
   - Revenue: "Increased sales by $500K (25%)"
   - Team: "Managed team of 12 across 3 departments"
   - Time: "Reduced processing time from 5 days to 2 days"
   - Scale: "Served 200+ customers monthly"
   - Impact: "Improved customer satisfaction from 78% to 94%"

5. **Red Thread to Target Role**:
   - Prioritize experiences most relevant to ${targetRole || 'career goals'}
   - Show progression TOWARD that role
   - Connect past achievements to future capabilities

6. **Chronological Order**: Most recent first (reverse chronological)

7. **Keep It Honest**:
   - All companies, titles, and dates must be accurate
   - Only quantify what's true or can be reasonably estimated
   - Don't invent achievements

${isSwedish ? `
SWEDISH MARKET SPECIFICS:
- Use Swedish job titles naturally: "Projektledare" not "Project Manager"
- Swedish company culture: team-oriented language
- Modest but clear: "bidrog till att öka" rather than "jag ökade ensam"
- Reference Swedish work context when relevant
` : `
INTERNATIONAL MARKET SPECIFICS:
- Use internationally recognized job titles
- More direct, individual achievement language
- Confident first-person: "I led", "I achieved"
- Global business terminology
`}

RETURN JSON:
{
  "optimized": "Structured experience section showing clear progression and results",
  "score_before": 52,
  "score_after": 87,
  "improvements": [
    "${isSwedish ? 'Omstrukturerat till STAR-format med tydliga resultat' : 'Restructured to STAR format with clear results'}",
    "${isSwedish ? 'Lagt till kvantifiering på alla achievements' : 'Added quantification to all achievements'}",
    "${isSwedish ? 'Använt kraftfulla action verbs anpassat för nivå' : 'Used powerful action verbs adapted for level'}",
    "${isSwedish ? 'Visat tydlig progression mot målroll' : 'Showed clear progression toward target role'}"
  ]
}

IMPORTANT:
- Keep ALL factual job information (company, title, dates)
- Don't invent achievements - only enhance presentation
- Show career story that leads to ${targetRole || 'next opportunity'}
- Write ENTIRELY in ${isSwedish ? 'Swedish' : 'English'}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7
  })

  const result = JSON.parse(response.choices[0].message.content || '{}')
  // Attach usage data to result
  result._usage = response.usage
  return result
}

// GPT-4o optimization for "Utbildning" section
async function optimizeEducation(
  text: string,
  experienceText: string,
  aboutText: string,
  mode: string,
  targetRole?: string,
  language: string = 'sv'
): Promise<SectionResult> {
  const isSwedish = language === 'sv'
  const context = analyzeProfileContext(experienceText, aboutText)

  const prompt = `${SYSTEM_PROMPT}

TASK: Optimize LinkedIn "Education" Section

MODE: ${mode === 'stand_out' ? (isSwedish ? 'Framhäv utbildning och meriter' : 'Highlight education and credentials') : (isSwedish ? `Optimera för målrollen: ${targetRole}` : `Optimize for target role: ${targetRole}`)}
LANGUAGE: ${isSwedish ? 'Swedish' : 'English'}
EXPERIENCE LEVEL: ${context.experienceLevel} (${context.careerStage})
TARGET ROLE: ${targetRole || (isSwedish ? 'Allmän karriärutveckling' : 'General career advancement')}

ORIGINAL TEXT:
---
${text}
---

OPTIMIZATION STRATEGY BASED ON EXPERIENCE LEVEL:

${context.experienceLevel === 'junior' ? `
**JUNIOR/LIMITED WORK EXPERIENCE:**
Education becomes CRITICAL - expand significantly:
- Include thesis/dissertation topics if relevant to ${targetRole}
- List relevant coursework and specializations
- Mention academic achievements: honors, awards, high GPA (if strong)
- Include significant group projects or research
- Add extracurricular activities that show leadership/skills
- Certifications and online courses are valuable
- Example: "Bachelor in Computer Science, Uppsala University (2022)
  • Thesis: 'Machine Learning in Healthcare' - 95/100
  • Relevant courses: Data Structures, AI, Software Engineering
  • President of Programming Club - organized 3 hackathons"
` : context.experienceLevel === 'senior' ? `
**SENIOR/EXTENSIVE WORK EXPERIENCE:**
Keep education CONCISE - work speaks louder:
- Basic structure: Degree, School, Year
- Only expand if directly relevant to ${targetRole || 'current role'}
- Emphasize recent certifications and executive education
- Show continuous learning mindset
- Advanced degrees (MBA, PhD) deserve brief mention of specialization
- Example: "MBA, Stockholm School of Economics (2015)
  • Specialization: Strategic Leadership
  Executive Leadership Program, Harvard Business School (2022)"
` : `
**MID-CAREER:**
Balance approach:
- Clear degree information with some relevant details
- Highlight specializations related to ${targetRole}
- Include professional certifications prominently
- Mention significant academic achievements if recent/relevant
- Example: "MSc in Marketing, Lund University (2018)
  • Specialization: Digital Marketing & Analytics
  Certified ScrumMaster (2021)"
`}

OPTIMIZATION GUIDELINES:

1. **Standard Structure Per Entry**:
   \`\`\`
   **Degree/Program Name**
   School/University Name | Location | Graduation Year
   • Relevant detail 1 (if applicable)
   • Relevant detail 2 (if applicable)
   \`\`\`

2. **What to Include Based on Context**:
   - Always: Degree, School, Year
   - If junior: Thesis, coursework, projects, GPA (if good), activities
   - If mid/senior: Specializations, certifications, executive education
   - If career change: Highlight education that bridges to new field

3. **Certifications & Continuing Education**:
   - List professional certifications separately or with degree
   - Recent online courses from recognized platforms (Coursera, edX) if relevant
   - Industry-specific credentials (PMP, CFA, AWS, etc.)

4. **Relevance to Target Role**:
   - Emphasize education that prepares for ${targetRole || 'desired career'}
   - If multiple degrees, lead with most relevant
   - Connect academic work to professional capabilities

${isSwedish ? `
SWEDISH EDUCATION SYSTEM TERMS:
- "Gymnasieexamen" (not "high school diploma")
- "Högskoleexamen" / "Kandidatexamen" / "Masterexamen"
- "Universitet" / "Högskola"
- "Komvux" för vuxenutbildning
- Use Swedish school names as-is: "Stockholms Universitet", "KTH"
` : `
INTERNATIONAL EDUCATION TERMS:
- Use globally recognized degree names: "Bachelor's", "Master's", "PhD"
- Clarify Swedish degrees if needed: "MSc (Swedish: Civilingenjör)"
- International school names in English if they have one
`}

RETURN JSON:
{
  "optimized": "Optimized education section appropriate for experience level",
  "score_before": 68,
  "score_after": 75,
  "improvements": [
    "${isSwedish ? 'Anpassat detalj-nivå baserat på erfarenhet' : 'Adapted detail level based on experience'}",
    "${isSwedish ? 'Framhävt utbildning relevant för målroll' : 'Highlighted education relevant to target role'}",
    "${isSwedish ? 'Lagt till certifieringar och fortsatt lärande' : 'Added certifications and continuous learning'}"
  ]
}

IMPORTANT:
- Keep ALL factual schools, degrees, and years
- Don't invent certifications or achievements
- Adapt detail level to experience: more for junior, less for senior
- Write ENTIRELY in ${isSwedish ? 'Swedish' : 'English'}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7
  })

  const result = JSON.parse(response.choices[0].message.content || '{}')
  // Attach usage data to result
  result._usage = response.usage
  return result
}

// GPT-4o optimization for "Kompetenser" section
async function optimizeSkills(
  text: string,
  experienceText: string,
  aboutText: string,
  mode: string,
  targetRole?: string,
  language: string = 'sv'
): Promise<SectionResult> {
  const isSwedish = language === 'sv'
  const context = analyzeProfileContext(experienceText, aboutText)
  const modeDescription = mode === 'stand_out'
    ? (isSwedish ? 'Allmän förbättring' : 'General improvement')
    : (isSwedish ? `Optimera för ${targetRole}` : `Optimize for ${targetRole}`)

  const prompt = `${SYSTEM_PROMPT}

TASK: Optimize LinkedIn Skills Section

MODE: ${modeDescription}
LANGUAGE: ${isSwedish ? 'Swedish' : 'English'}
EXPERIENCE LEVEL: ${context.experienceLevel} (${context.careerStage})
PRIMARY INDUSTRY: ${context.primaryIndustry}
TARGET ROLE: ${targetRole || (isSwedish ? 'Allmän karriärutveckling' : 'General career advancement')}

ORIGINAL SKILLS:
---
${text}
---

CONTEXT FROM PROFILE (for adding implicit skills):
Experience: ${experienceText.substring(0, 500)}...
About: ${aboutText.substring(0, 300)}...

OPTIMIZATION STRATEGY BASED ON EXPERIENCE LEVEL:

${context.experienceLevel === 'junior' ? `
**JUNIOR PROFILE APPROACH:**
- Focus on technical and foundational skills
- Include relevant academic/project skills
- Group by: Technical Skills, Soft Skills, Tools & Platforms
- Emphasize learning agility and adaptability
- OK to include more specific technical tools
` : context.experienceLevel === 'senior' ? `
**SENIOR PROFILE APPROACH:**
- Lead with strategic and leadership competencies
- Group by: Leadership & Strategy, Domain Expertise, Technical Foundation
- De-emphasize specific tools (they should know many)
- Emphasize high-level capabilities: "Strategic Planning", "Change Management", "P&L Management"
- Show breadth of expertise
` : `
**MID-CAREER APPROACH:**
- Balance technical depth with emerging leadership skills
- Group by expertise areas relevant to ${targetRole || 'their field'}
- Show specialization while maintaining versatility
- Include both execution skills and strategic thinking
`}

CORE OPTIMIZATION GUIDELINES:

1. **Skill Organization** (3-4 categories):
   ${isSwedish ? `
   - Use clear Swedish category names: "Ledarskap & Strategi", "Teknisk Expertis", etc.
   - Match categories to ${targetRole || 'bransch och roll'}
   ` : `
   - Use clear English category names: "Leadership & Strategy", "Technical Expertise", etc.
   - Match categories to ${targetRole || 'industry and role'}
   `}

2. **Prioritization**:
   - Most relevant skills for ${targetRole || 'their career goals'} come FIRST
   - Align with experience level expectations
   - Support the "red thread" from headline → about → experience

3. **Content Quality**:
   - **Remove generic fluff**: "Microsoft Office", "Email", "Teamwork" (unless critical)
   - **Keep specialized skills**: Industry-specific tools, certifications, methodologies
   - **Add implicit skills**: Skills obvious from experience but not listed
   - **Use bullets** (•) within each category for readability

4. **Keywords for ATS**:
   - Include industry-standard terms for ${targetRole || context.primaryIndustry}
   - Balance human readability with ATS optimization
   - Use proper terminology (e.g., "Agile/Scrum" not just "Agile")

5. **Language & Tone**:
   ${isSwedish ? `
   - Write in Swedish
   - Use professional Swedish terminology
   - "Projektledning" not "Project Management"
   ` : `
   - Write in English
   - Use international professional terminology
   - Clear and concise skill names
   `}

EXAMPLES OF WELL-ORGANIZED SKILLS:

${context.experienceLevel === 'senior' ? (isSwedish ? `
**Ledarskap & Strategi**
• Strategisk affärsutveckling • Change management • Team building & mentorskap

**Domänexpertis inom ${context.primaryIndustry}**
• Produktstrategi • Go-to-market planning • Customer success management
` : `
**Leadership & Strategy**
• Strategic business development • Change management • Team building & mentorship

**Domain Expertise in ${context.primaryIndustry}**
• Product strategy • Go-to-market planning • Customer success management
`) : (isSwedish ? `
**Tekniska färdigheter**
• JavaScript/TypeScript • React & Next.js • PostgreSQL & Supabase

**Projektledning**
• Agil utveckling (Scrum/Kanban) • Stakeholder management • Roadmap planning
` : `
**Technical Skills**
• JavaScript/TypeScript • React & Next.js • PostgreSQL & Supabase

**Project Management**
• Agile development (Scrum/Kanban) • Stakeholder management • Roadmap planning
`)}

RETURN JSON:
{
  "optimized": "Organized skills with 3-4 categories, bullets (•), prioritized by relevance",
  "score_before": 58,
  "score_after": 85,
  "improvements": [
    "${isSwedish ? 'Exempel: "Organiserat i 3 relevanta kategorier"' : 'Example: "Organized into 3 relevant categories"'}",
    "${isSwedish ? 'Exempel: "Prioriterat ledarskap (matchar målroll)"' : 'Example: "Prioritized leadership (matches target role)"'}",
    "${isSwedish ? 'Exempel: "Tagit bort generiska skills"' : 'Example: "Removed generic skills"'}",
    "${isSwedish ? 'Exempel: "Lagt till implicit kompetens från erfarenhet"' : 'Example: "Added implicit skills from experience"'}"
  ]
}

IMPORTANT:
- Only add skills that are truly evident from the experience/about sections
- Don't fabricate skills that aren't there
- Preserve all specialized/unique skills from original
- Write ALL content in ${isSwedish ? 'Swedish' : 'English'}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7
  })

  const result = JSON.parse(response.choices[0].message.content || '{}')
  // Attach usage data to result
  result._usage = response.usage
  return result
}

// Calculate overall score
function calculateOverallScore(results: {
  headline: SectionResult
  about: SectionResult
  experience: SectionResult
  education?: SectionResult
  skills?: SectionResult
}, type: 'before' | 'after'): number {
  const scoreKey = type === 'before' ? 'score_before' : 'score_after'

  let totalScore = 0
  let totalWeight = 0

  // Headline: 20% weight (critical for first impression and search)
  totalScore += results.headline[scoreKey] * 0.2
  totalWeight += 0.2

  // Om mig: 25% weight (reduced from 30% to make room for headline)
  totalScore += results.about[scoreKey] * 0.25
  totalWeight += 0.25

  // Erfarenhet: 35% weight (reduced from 40% to make room for headline)
  totalScore += results.experience[scoreKey] * 0.35
  totalWeight += 0.35

  // Utbildning: 10% weight (if present)
  if (results.education) {
    totalScore += results.education[scoreKey] * 0.1
    totalWeight += 0.1
  }

  // Kompetenser: 10% weight (if present)
  if (results.skills) {
    totalScore += results.skills[scoreKey] * 0.1
    totalWeight += 0.1
  }

  return Math.round(totalScore / totalWeight)
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()

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

    // Log activity: LinkedIn optimization started
    await logUserActivity(
      user.id,
      'linkedin_optimization_started',
      'Användare startade LinkedIn-optimering',
      { mode, target_role, language }
    )

    // Check if user is premium and fetch quota fields
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, weekly_linkedin_count, weekly_linkedin_first_used_at, weekly_linkedin_reset_at, premium_until')
      .eq('id', user.id)
      .single()

    const now = new Date()
    const isPremium = profile?.subscription_status === 'active' ||
      (profile?.premium_until && new Date(profile.premium_until) > now)

    // Initialize and check quota
    let currentCount = profile?.weekly_linkedin_count || 0
    let firstUsedAt = profile?.weekly_linkedin_first_used_at ? new Date(profile.weekly_linkedin_first_used_at) : null
    let resetAt = profile?.weekly_linkedin_reset_at ? new Date(profile.weekly_linkedin_reset_at) : null

    // Initialize quota tracking on first use
    if (!firstUsedAt || !resetAt) {
      firstUsedAt = now
      resetAt = new Date(now.getTime() + SEVEN_DAYS_MS)
      currentCount = 0

      const { error: initError } = await supabase
        .from('profiles')
        .update({
          weekly_linkedin_first_used_at: firstUsedAt.toISOString(),
          weekly_linkedin_reset_at: resetAt.toISOString(),
          weekly_linkedin_count: 0
        })
        .eq('id', user.id)

      if (initError) {
        console.error('Error initializing LinkedIn quota:', initError)
      }
    }
    // Reset quota if 7 days have passed
    else if (now.getTime() >= resetAt.getTime()) {
      firstUsedAt = now
      resetAt = new Date(now.getTime() + SEVEN_DAYS_MS)
      currentCount = 0

      const { error: resetError } = await supabase
        .from('profiles')
        .update({
          weekly_linkedin_first_used_at: firstUsedAt.toISOString(),
          weekly_linkedin_reset_at: resetAt.toISOString(),
          weekly_linkedin_count: 0
        })
        .eq('id', user.id)

      if (resetError) {
        console.error('Error resetting LinkedIn quota:', resetError)
      }
    }

    // Check quota limits
    const limit = isPremium ? WEEKLY_LINKEDIN_LIMIT_PREMIUM : WEEKLY_LINKEDIN_LIMIT_FREE
    if (currentCount >= limit) {
      return NextResponse.json(
        {
          error: isPremium
            ? 'Du har nått din veckovisa gräns. Kontakta support om du behöver fler optimeringar.'
            : 'Du har använt din gratis optimering denna vecka. Uppgradera till Premium för obegränsade optimeringar!',
          quota_exceeded: true
        },
        { status: 429 }
      )
    }

    // Optimize each section in parallel
    const [headlineResult, aboutResult, experienceResult, educationResult, skillsResult] = await Promise.all([
      // Headline optimization (always run, even if no current headline provided)
      optimizeHeadline(sections.headline, sections.about, sections.experience, mode, target_role, language),
      // About with experience context for storytelling
      optimizeAbout(sections.about, sections.experience, mode, target_role, language),
      // Experience with about context for red thread
      optimizeExperience(sections.experience, sections.about, mode, target_role, language),
      // Education with full context for level-appropriate detail
      sections.education ? optimizeEducation(sections.education, sections.experience, sections.about, mode, target_role, language) : Promise.resolve(null),
      // Skills with full context for level-appropriate categorization
      sections.skills ? optimizeSkills(sections.skills, sections.experience, sections.about, mode, target_role, language) : Promise.resolve(null)
    ])

    // Track AI usage and costs
    try {
      const generationTimeMs = Date.now() - startTime

      // Collect usage from all optimization calls
      let totalPromptTokens = 0
      let totalCompletionTokens = 0

      // Extract usage from each result
      const usageData = [headlineResult, aboutResult, experienceResult, educationResult, skillsResult]
        .filter(result => result && (result as any)._usage)
        .map(result => (result as any)._usage)

      usageData.forEach((usage: any) => {
        totalPromptTokens += usage.prompt_tokens || 0
        totalCompletionTokens += usage.completion_tokens || 0
      })

      // Calculate cost using model pricing
      const costUsd = await calculateCostFromDatabase(
        supabase,
        'gpt-4o',
        totalPromptTokens,
        totalCompletionTokens
      )

      // Track usage in database
      await trackAIUsage({
        supabase,
        userId: user.id,
        featureName: AI_FEATURES.LINKEDIN_OPTIMIZATION,
        endpoint: '/api/linkedin/optimize',
        model: 'gpt-4o',
        promptTokens: totalPromptTokens,
        completionTokens: totalCompletionTokens,
        costUsd,
        generationTimeMs,
        metadata: {
          mode,
          target_role: target_role || null,
          language,
          sections_optimized: [
            'headline',
            'about',
            'experience',
            educationResult ? 'education' : null,
            skillsResult ? 'skills' : null
          ].filter(Boolean)
        }
      })

      console.log('[LinkedIn Optimize] AI usage tracked:', {
        totalTokens: totalPromptTokens + totalCompletionTokens,
        costUsd: costUsd.toFixed(6),
        generationTimeMs
      })
    } catch (trackingError) {
      // Don't fail the request if tracking fails
      console.error('[LinkedIn Optimize] Failed to track AI usage:', trackingError)
    }

    // Calculate overall scores
    const results = {
      headline: headlineResult,
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
      .single()

    if (saveError) {
      console.error('Error saving optimization:', saveError)
      // Don't fail the request if saving fails, just log it
    }

    // Increment quota count after successful optimization
    if (!saveError && savedOptimization) {
      const newCount = currentCount + 1
      const { error: incrementError } = await supabase
        .from('profiles')
        .update({ weekly_linkedin_count: newCount })
        .eq('id', user.id)

      if (incrementError) {
        console.error('Error incrementing LinkedIn quota count:', incrementError)
      } else {
        console.log(`[LinkedIn Quota] Updated count: ${newCount}/${limit}`)
      }
    }

    // Log activity: LinkedIn optimization completed
    await logUserActivity(
      user.id,
      'linkedin_optimization_completed',
      'LinkedIn-optimering slutfördes framgångsrikt',
      {
        optimization_id: savedOptimization?.id,
        overall_score_before,
        overall_score_after,
        score_improvement: overall_score_after - overall_score_before
      }
    )

    // Track onboarding progress for LinkedIn optimization
    const { error: onboardingError } = await supabase.rpc('update_onboarding_progress', {
      user_id: user.id,
      step_name: 'optimize_linkedin'
    });
    if (onboardingError) {
      console.error('Failed to update onboarding progress:', onboardingError.message);
    }

    return NextResponse.json({
      sections: results,
      overall_score_before,
      overall_score_after,
      optimization_id: savedOptimization?.id
    })

  } catch (error) {
    console.error('LinkedIn optimization error:', error)

    // Try to log failed activity if we have user context
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient({ cookies: cookieStore })
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        await logUserActivity(
          user.id,
          'linkedin_optimization_failed',
          'LinkedIn-optimering misslyckades',
          { error: error instanceof Error ? error.message : 'Unknown error' }
        )
      }
    } catch (logError) {
      // Silently fail if activity logging fails
      console.error('Failed to log error activity:', logError)
    }

    return NextResponse.json(
      { error: 'Något gick fel. Försök igen.' },
      { status: 500 }
    )
  }
}
