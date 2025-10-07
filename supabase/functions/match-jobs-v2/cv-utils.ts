/**
 * CV Utility Functions
 *
 * Hjälpfunktioner för att extrahera data från CV-analyser
 */

/**
 * Extrahera yrken från CV-data
 */
export function extractOccupations(cvData: any): string[] {
  const occupations: string[] = [];

  if (cvData.structuredCV?.experience) {
    cvData.structuredCV.experience.forEach((exp: any) => {
      if (exp.position) {
        occupations.push(exp.position.toLowerCase());
      }
    });
  }

  // Deduplicate och returnera
  return [...new Set(occupations)];
}

/**
 * Extrahera geografiska platser från CV
 */
export function extractGeography(cvData: any): string[] {
  const locations: string[] = [];

  // Från personuppgifter
  if (cvData.structuredCV?.personalInfo?.address) {
    locations.push(cvData.structuredCV.personalInfo.address);
  }

  // Från arbetserfarenheter
  if (cvData.structuredCV?.experience) {
    cvData.structuredCV.experience.forEach((exp: any) => {
      if (exp.location) {
        locations.push(exp.location);
      }
    });
  }

  return [...new Set(locations)];
}

/**
 * Extrahera kompetenser från CV
 */
export function extractSkills(cvData: any): string[] {
  const skills: string[] = [];

  if (cvData.structuredCV?.skills) {
    cvData.structuredCV.skills.forEach((skillItem: any) => {
      if (typeof skillItem === 'string') {
        skills.push(skillItem.toLowerCase());
      } else if (skillItem.skills) {
        skillItem.skills.forEach((skill: string) => {
          skills.push(skill.toLowerCase());
        });
      }
    });
  }

  return [...new Set(skills)];
}

/**
 * Extrahera utbildningar från CV
 */
export function extractEducations(cvData: any): Array<{
  degree: string;
  institution: string;
  year?: string;
}> {
  const educations: Array<{ degree: string; institution: string; year?: string }> = [];

  if (cvData.structuredCV?.education) {
    cvData.structuredCV.education.forEach((edu: any) => {
      educations.push({
        degree: edu.degree || '',
        institution: edu.institution || '',
        year: edu.graduationYear
      });
    });
  }

  return educations;
}

/**
 * Beräkna total arbetslivserfarenhet (år)
 */
export function calculateTotalExperience(cvData: any): number {
  if (!cvData.structuredCV?.experience) return 0;

  let totalYears = 0;

  for (const exp of cvData.structuredCV.experience) {
    try {
      const parseDate = (dateStr: string) => {
        const parts = dateStr.split('/');
        if (parts.length === 2) {
          const month = parseInt(parts[0]);
          const year = parseInt(parts[1]);
          return new Date(year, month - 1);
        }
        return null;
      };

      const startDate = parseDate(exp.startDate);
      const endDate = exp.endDate ? parseDate(exp.endDate) : new Date();

      if (startDate && endDate) {
        const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        totalYears += years;
      }
    } catch {
      // Skip om datum inte kan parsas
    }
  }

  return totalYears;
}
