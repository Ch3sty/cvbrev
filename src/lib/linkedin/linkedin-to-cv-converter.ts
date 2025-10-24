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
 * Handles various formats including bullet points and paragraphs
 */
function parseExperience(experienceText: string): CVExperience[] {
  const experiences: CVExperience[] = []

  // Split by common delimiters (multiple newlines, horizontal rules, etc.)
  const jobBlocks = experienceText.split(/\n{2,}|━━━|---/).filter(block => block.trim())

  let currentJob: Partial<CVExperience> = {}

  for (const block of jobBlocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l)

    if (lines.length === 0) continue

    // Try to detect job title and company
    // Common patterns:
    // 1. "VD" (title on its own)
    // 2. "Begone Skadedjur & Sanering" (company)
    // 3. "jan. 2022 - nu" or "2022-2024" (dates)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check if it's a date line
      const datePattern = /(\d{4}|\w{3,}\.\s*\d{4})\s*[-–—]\s*(nu|nutid|nuvarande|\d{4}|\w{3,}\.\s*\d{4})/i
      const dateMatch = line.match(datePattern)

      if (dateMatch && !currentJob.position) {
        // Previous lines likely contain title and company
        if (i >= 2) {
          currentJob.position = lines[i - 2]
          currentJob.company = lines[i - 1]
        } else if (i === 1) {
          currentJob.position = lines[0]
          currentJob.company = 'Företag' // Default
        }

        currentJob.startDate = dateMatch[1]
        currentJob.endDate = dateMatch[2].match(/nu|nutid|nuvarande/i) ? undefined : dateMatch[2]
      }

      // Check if line contains bullet points or description
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        if (!currentJob.description) {
          currentJob.description = []
        }
        currentJob.description.push(line.replace(/^[•\-*]\s*/, ''))
      } else if (currentJob.position && currentJob.company && !dateMatch) {
        // It's likely a description paragraph
        if (!currentJob.description) {
          currentJob.description = []
        }
        currentJob.description.push(line)
      }
    }

    // If we have a complete job, save it
    if (currentJob.position && currentJob.company) {
      experiences.push({
        position: currentJob.position,
        company: currentJob.company,
        startDate: currentJob.startDate || '',
        endDate: currentJob.endDate,
        description: currentJob.description || [],
        location: currentJob.location
      })
      currentJob = {}
    }
  }

  return experiences
}

/**
 * Parse LinkedIn "Education" section into CV education entries
 */
function parseEducation(educationText: string): CVEducation[] {
  const educations: CVEducation[] = []

  const blocks = educationText.split(/\n{2,}|━━━|---/).filter(block => block.trim())

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l)

    if (lines.length === 0) continue

    let institution = ''
    let degree = ''
    let graduationYear = ''

    // Common pattern:
    // Line 1: Institution name
    // Line 2: Degree/Program
    // Line 3: Years (e.g., "2015 - 2018" or "2015-2018")

    if (lines.length >= 1) institution = lines[0]
    if (lines.length >= 2) degree = lines[1]

    // Look for year pattern
    const yearPattern = /(\d{4})\s*[-–—]\s*(\d{4})/
    for (const line of lines) {
      const yearMatch = line.match(yearPattern)
      if (yearMatch) {
        graduationYear = yearMatch[2]
        break
      }
    }

    if (institution && degree) {
      educations.push({
        institution,
        degree,
        graduationYear: graduationYear || undefined
      })
    }
  }

  return educations
}

/**
 * Parse LinkedIn "Skills" section into CV skill categories
 */
function parseSkills(skillsText: string): CVSkill[] {
  const skills: CVSkill[] = []

  // Check if skills are already categorized (contains headers like "LEDARSKAP & AFFÄRSUTVECKLING:")
  const categoryPattern = /^([A-ZÅÄÖ\s&]+):\s*$/m
  const hasCategories = categoryPattern.test(skillsText)

  if (hasCategories) {
    // Parse categorized skills
    const sections = skillsText.split(/^([A-ZÅÄÖ\s&]+):\s*$/m).filter(s => s.trim())

    for (let i = 0; i < sections.length; i += 2) {
      const category = sections[i]?.trim()
      const skillsList = sections[i + 1]?.trim()

      if (!category || !skillsList) continue

      // Extract skills from bullets
      const skillItems = skillsList
        .split('\n')
        .map(line => line.replace(/^[•\-*]\s*/, '').trim())
        .filter(skill => skill.length > 0)

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
      .map(s => s.trim())
      .filter(s => s.length > 0)

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
