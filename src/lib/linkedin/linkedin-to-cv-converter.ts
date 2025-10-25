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
 * Format CVMetadata as human-readable text (not JSON)
 * Used for cv_text field in database
 */
export function formatCVMetadataAsText(cvData: CVMetadata): string {
  let text = ''

  // Personal Info
  text += `${cvData.personalInfo.fullName}\n`
  text += `${cvData.personalInfo.email}\n`
  if (cvData.personalInfo.phone) text += `${cvData.personalInfo.phone}\n`
  if (cvData.personalInfo.address) text += `${cvData.personalInfo.address}\n`
  if (cvData.personalInfo.location) text += `${cvData.personalInfo.location}\n`
  text += '\n'

  // Summary
  if (cvData.summary) {
    text += `SAMMANFATTNING\n`
    text += `${cvData.summary}\n\n`
  }

  // Experience
  if (cvData.experience && cvData.experience.length > 0) {
    text += `ERFARENHET\n\n`
    for (const exp of cvData.experience) {
      text += `${exp.position}\n`
      text += `${exp.company}`
      if (exp.location) text += ` | ${exp.location}`
      text += ` | ${exp.startDate}`
      if (exp.endDate) text += `–${exp.endDate}`
      else text += '–nu'
      text += '\n'

      if (exp.description && exp.description.length > 0) {
        for (const desc of exp.description) {
          text += `- ${desc}\n`
        }
      }
      text += '\n'
    }
  }

  // Education
  if (cvData.education && cvData.education.length > 0) {
    text += `UTBILDNING\n\n`
    for (const edu of cvData.education) {
      text += `${edu.degree}\n`
      text += `${edu.institution}`
      if (edu.location) text += ` | ${edu.location}`
      if (edu.graduationYear) text += ` | ${edu.graduationYear}`
      text += '\n'
      if (edu.description) text += `${edu.description}\n`
      text += '\n'
    }
  }

  // Skills
  if (cvData.skills && cvData.skills.length > 0) {
    text += `KOMPETENSER\n`
    for (const skillCat of cvData.skills) {
      if (skillCat.category && skillCat.category !== 'Kompetenser') {
        text += `\n${skillCat.category}:\n`
      }
      if (skillCat.skills && skillCat.skills.length > 0) {
        text += skillCat.skills.join(', ')
        text += '\n'
      }
    }
    text += '\n'
  }

  // Projects
  if (cvData.projects && cvData.projects.length > 0) {
    text += `PROJEKT\n\n`
    for (const project of cvData.projects) {
      const projectName = project.name || project.title || ''
      text += `${projectName}\n`
      text += `${project.description}\n`
      if (project.technologies && project.technologies.length > 0) {
        text += `Teknologier: ${project.technologies.join(', ')}\n`
      }
      text += '\n'
    }
  }

  // Languages
  if (cvData.languages && cvData.languages.length > 0) {
    text += `SPRÅK\n`
    for (const lang of cvData.languages) {
      text += `${lang.language} - ${lang.proficiency}\n`
    }
    text += '\n'
  }

  return text
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
