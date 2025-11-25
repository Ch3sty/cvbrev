import type { CVMetadata } from './cv-metadata'

// Helper function to map language proficiency levels
function mapLanguageProficiency(niva: string): 'Nybörjare' | 'Konversation' | 'Flyt' | 'Modersmål' | 'Tvåspråkig' {
  const lowerNiva = niva.toLowerCase()

  if (lowerNiva.includes('modersmål')) return 'Modersmål'
  if (lowerNiva.includes('tvåspråkig') || lowerNiva.includes('tvasprakig')) return 'Tvåspråkig'
  if (lowerNiva.includes('flytande') || lowerNiva.includes('flyt')) return 'Flyt'
  if (lowerNiva.includes('konversation')) return 'Konversation'
  if (lowerNiva.includes('nybörjare') || lowerNiva.includes('grundläggande')) return 'Nybörjare'

  // Default fallback
  return 'Konversation'
}

interface ExempelCV {
  namn: string
  titel: string
  kontakt: {
    telefon: string
    epost: string
    plats: string
    linkedin?: string
  }
  profil: string
  erfarenhet: Array<{
    titel: string
    arbetsgivare: string
    period: string
    beskrivning: string[]
  }>
  utbildning: Array<{
    titel: string
    skola: string
    period: string
    beskrivning?: string
  }>
  kompetenser: {
    tekniska: string[]
    personliga: string[]
  }
  certifieringar: string[]
  sprak: Array<{
    sprak: string
    niva: string
  }>
}

/**
 * Converts exempelCV data structure to CVMetadata format
 * Used for both SSR pre-rendering and client-side template generation
 */
export function convertToCVMetadata(exempelCV: ExempelCV): CVMetadata {
  return {
    personalInfo: {
      fullName: exempelCV.namn,
      email: exempelCV.kontakt.epost,
      phone: exempelCV.kontakt.telefon,
      address: exempelCV.kontakt.plats,
      linkedIn: exempelCV.kontakt.linkedin || '',
      linkedin: exempelCV.kontakt.linkedin || '',
      website: '',
      github: ''
    },
    summary: exempelCV.profil,
    experience: exempelCV.erfarenhet.map(exp => {
      // Hanterar både - (hyphen) och – (em-dash) i period-strängar
      const periodParts = exp.period.split(/\s*[-–]\s*/)
      const startDate = periodParts[0] || ''
      const endDate = periodParts[1] === 'Nuvarande' || periodParts[1] === 'Pågående'
        ? undefined
        : (periodParts[1] || '')

      return {
        position: exp.titel,
        company: exp.arbetsgivare,
        location: '',
        startDate,
        endDate,
        description: exp.beskrivning,
        achievements: []
      }
    }),
    education: exempelCV.utbildning.map(edu => {
      // Hanterar både - (hyphen) och – (em-dash) i period-strängar
      const periodParts = edu.period.split(/\s*[-–]\s*/)
      const graduationYear = periodParts[1] || periodParts[0] || ''

      return {
        degree: edu.titel,
        institution: edu.skola,
        location: '',
        graduationYear,
        startDate: periodParts[0] || '',
        endDate: periodParts[1] || '',
        honors: edu.beskrivning || ''
      }
    }),
    skills: [
      {
        category: 'Tekniska kompetenser',
        skills: exempelCV.kompetenser.tekniska
      },
      {
        category: 'Personliga egenskaper',
        skills: exempelCV.kompetenser.personliga
      }
    ],
    projects: [],
    certifications: exempelCV.certifieringar.map(cert => ({
      name: cert,
      issuer: '',
      date: '',
      credentialId: ''
    })),
    languages: exempelCV.sprak.map(lang => ({
      language: lang.sprak,
      proficiency: mapLanguageProficiency(lang.niva)
    })),
    interests: [],
    references: 'Referenser lämnas på begäran'
  }
}
