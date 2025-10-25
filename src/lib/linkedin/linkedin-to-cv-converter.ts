import type { CVMetadata, CVPersonalInfo, CVExperience, CVEducation, CVSkill } from '@/lib/cv/cv-metadata'

interface LinkedInSections {
  about: string
  experience: string
  education?: string
  skills?: string
}

interface OptimizedSection {
  optimized: string
  score_before: number
  score_after: number
  improvements: string[]
}

interface LinkedInOptimizationResult {
  about: OptimizedSection
  experience: OptimizedSection
  education?: OptimizedSection
  skills?: OptimizedSection
}

/**
 * Parse LinkedIn "Experience" section into CV experience entries
 * Handles LinkedIn Optimizer markdown format:
 * **Position**
 * Company | Location | Dates
 * - Description bullet 1
 * - Description bullet 2
 */
function parseExperience(experienceText: string): CVExperience[] {
  const experiences: CVExperience[] = []

  // Split by job headers (lines starting with **Title**)
  const blocks = experienceText.split(/(?=^\*\*[^*]+\*\*$)/m).filter((block: string) => block.trim())

  for (const block of blocks) {
    const lines = block.split('\n').map((l: string) => l.trim()).filter((l: string) => l)

    if (lines.length < 2) continue

    // Line 1: **Position**
    const titleMatch = lines[0]?.match(/\*\*(.+?)\*\*/)
    if (!titleMatch) continue

    const position = titleMatch[1]

    // Line 2: Company | Location | Dates
    const metaMatch = lines[1]?.match(/^(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)$/)
    if (!metaMatch) continue

    const company = metaMatch[1].trim()
    const location = metaMatch[2].trim()
    const dateRange = metaMatch[3].trim()

    // Parse dates from format: "maj 2022–nu" or "2013–maj 2022"
    const dateMatch = dateRange.match(/(.+?)\s*[–—-]\s*(.+)/)
    const startDate = dateMatch ? dateMatch[1].trim() : dateRange
    const endDate = dateMatch && dateMatch[2].match(/nu|nutid|nuvarande/i) ? undefined : dateMatch?.[2]?.trim()

    // Lines 3+: Description bullets (remove markdown bullet syntax)
    const description = lines.slice(2)
      .filter((l: string) => l.startsWith('-'))
      .map((l: string) => l.replace(/^-\s*/, '').trim())

    experiences.push({
      position,
      company,
      location,
      startDate,
      endDate,
      description
    })
  }

  return experiences
}

/**
 * Parse LinkedIn "Education" section into CV education entries
 * Handles LinkedIn Optimizer markdown format:
 * **Degree/Program**
 * Institution | Location | Years
 */
function parseEducation(educationText: string): CVEducation[] {
  const educations: CVEducation[] = []

  // Split by education headers (lines starting with **Degree**)
  const blocks = educationText.split(/(?=^\*\*[^*]+\*\*$)/m).filter((block: string) => block.trim())

  for (const block of blocks) {
    const lines = block.split('\n').map((l: string) => l.trim()).filter((l: string) => l)

    if (lines.length < 2) continue

    // Line 1: **Degree/Program**
    const degreeMatch = lines[0]?.match(/\*\*(.+?)\*\*/)
    if (!degreeMatch) continue

    const degree = degreeMatch[1]

    // Line 2: Institution | Location | Years
    const metaMatch = lines[1]?.match(/^(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)$/)
    if (!metaMatch) continue

    const institution = metaMatch[1].trim()
    const yearRange = metaMatch[3].trim()

    // Parse graduation year (last year in range: "2009–2012" → "2012")
    const yearMatch = yearRange.match(/(\d{4})\s*[–—-]\s*(\d{4})/)
    const graduationYear = yearMatch ? yearMatch[2] : yearRange.match(/\d{4}/)?.[0]

    educations.push({
      institution,
      degree,
      graduationYear
    })
  }

  return educations
}

/**
 * Parse LinkedIn "Skills" section into CV skill categories
 * Handles both JSON object format (from LinkedIn Optimizer) and string format (legacy)
 */
function parseSkills(skillsText: string | any): CVSkill[] {
  const skills: CVSkill[] = []

  // Handle JSON object format (from LinkedIn Optimizer)
  if (typeof skillsText === 'object' && skillsText !== null) {
    const { strong_skills = [], suggested_skills = [] } = skillsText

    // Combine strong skills and suggested skills
    const allSkills = [
      ...strong_skills,
      ...suggested_skills.map((s: any) => typeof s === 'object' ? s.skill : s)
    ]

    if (allSkills.length > 0) {
      skills.push({
        category: 'Kompetenser',
        skills: allSkills
      })
    }

    return skills
  }

  // Handle string format (legacy)
  // Check if skills are already categorized (contains headers like "LEDARSKAP & AFFÄRSUTVECKLING:")
  const categoryPattern = /^([A-ZÅÄÖ\s&]+):\s*$/m
  const hasCategories = categoryPattern.test(skillsText)

  if (hasCategories) {
    // Parse categorized skills
    const sections = skillsText.split(/^([A-ZÅÄÖ\s&]+):\s*$/m).filter((s: string) => s.trim())

    for (let i = 0; i < sections.length; i += 2) {
      const category = sections[i]?.trim()
      const skillsList = sections[i + 1]?.trim()

      if (!category || !skillsList) continue

      // Extract skills from bullets
      const skillItems = skillsList
        .split('\n')
        .map((line: string) => line.replace(/^[•\-*]\s*/, '').trim())
        .filter((skill: string) => skill.length > 0)

      if (skillItems.length > 0) {
        skills.push({
          category,
          skills: skillItems
        })
      }
    }
  } else {
    // Parse flat skill list (comma-separated or bullet-separated)
    const skillsList = skillsText
      .split(/[,•\-\n]/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0)

    if (skillsList.length > 0) {
      skills.push({
        category: 'Kompetenser',
        skills: skillsList
      })
    }
  }

  return skills
}

/**
 * Convert LinkedIn profile optimization to CV format
 */
export function convertLinkedInToCV(
  optimizedSections: LinkedInOptimizationResult,
  userEmail?: string,
  userName?: string
): CVMetadata {
  // Extract personal info from "Om mig" section
  // We'll use a simple approach - the user will need to fill in contact details separately
  const personalInfo: CVPersonalInfo = {
    fullName: userName || 'Ditt namn',
    email: userEmail || 'din@email.com',
    title: 'Professionell titel'
  }

  // Parse experience
  const experience = parseExperience(optimizedSections.experience.optimized)

  // Parse education
  const education = optimizedSections.education
    ? parseEducation(optimizedSections.education.optimized)
    : []

  // Parse skills
  const skills = optimizedSections.skills
    ? parseSkills(optimizedSections.skills.optimized)
    : []

  // Use "Om mig" as summary
  const summary = optimizedSections.about.optimized

  return {
    personalInfo,
    summary,
    experience,
    education,
    skills
  }
}

/**
 * Create a draft CV from LinkedIn optimization
 * This saves the CV to database so user can edit it further
 */
export async function createCVFromLinkedIn(
  userId: string,
  optimizedSections: LinkedInOptimizationResult,
  userEmail?: string,
  userName?: string
): Promise<string> {
  const cvData = convertLinkedInToCV(optimizedSections, userEmail, userName)

  // Save to database via API
  const response = await fetch('/api/cv/create-from-linkedin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      cvData,
      source: 'linkedin_optimization'
    })
  })

  if (!response.ok) {
    throw new Error('Failed to create CV from LinkedIn data')
  }

  const result = await response.json()
  return result.cvId
}
