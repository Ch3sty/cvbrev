// src/lib/cv/swedish-cv-content-parser.ts
// Avancerad AI-driven och fallback-baserad parsing för svenska CV:n

import { 
  CVMetadata, 
  CVPersonalInfo, 
  CVExperience, 
  CVEducation, 
  CVSkill, 
  CVLanguage, 
  CVProject, 
  CVCertification,
  formatDateRange,
  shouldShowSection
} from './cv-metadata';

// Svenska månader för datumparsing
const SWEDISH_MONTHS = {
  'januari': '01', 'jan': '01',
  'februari': '02', 'feb': '02',
  'mars': '03', 'mar': '03',
  'april': '04', 'apr': '04',
  'maj': '05',
  'juni': '06', 'jun': '06',
  'juli': '07', 'jul': '07',
  'augusti': '08', 'aug': '08',
  'september': '09', 'sep': '09', 'sept': '09',
  'oktober': '10', 'okt': '10',
  'november': '11', 'nov': '11',
  'december': '12', 'dec': '12'
};

// Svenska utbildningsnivåer
const SWEDISH_EDUCATION_LEVELS = [
  'grundskola', 'gymnasium', 'komvux', 'folkhögskola',
  'universitet', 'högskola', 'kandidat', 'master', 'magister',
  'civilingenjör', 'doktor', 'phd', 'fil.dr', 'tekn.dr'
];

// Svenska språknivåer
const SWEDISH_LANGUAGE_LEVELS: Record<string, 'Nybörjare' | 'Konversation' | 'Flytande' | 'Modersmål' | 'Tvåspråkig'> = {
  'nybörjare': 'Nybörjare',
  'grundläggande': 'Nybörjare',
  'konversation': 'Konversation',
  'flyt': 'Flytande',
  'flytande': 'Flytande',
  'modersmål': 'Modersmål',
  'native': 'Modersmål',
  'tvåspråkig': 'Tvåspråkig',
  'bilingual': 'Tvåspråkig'
};

export class SwedishCVContentParser {
  
  /**
   * Huvudfunktion för att extrahera all CV-data
   */
  async parseSwedishCV(rawText: string): Promise<CVMetadata> {
    const cleanedText = this.preprocessText(rawText);
    
    try {
      // Försök med AI-driven parsing först (om tillgängligt)
      // const aiResult = await this.parseWithAI(cleanedText);
      // if (aiResult) return aiResult;
    } catch (error) {
      console.warn('AI parsing failed, using fallback:', error);
    }
    
    // Fallback till avancerad regex-baserad parsing
    return this.parseWithAdvancedRegex(cleanedText);
  }
  
  /**
   * Förbehandla text för bättre parsing
   */
  private preprocessText(rawText: string): string {
    return rawText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
  
  /**
   * Avancerad regex-baserad parsing för svenska CV:n
   */
  private parseWithAdvancedRegex(text: string): CVMetadata {
    const lines = text.split('\n').filter(line => line.trim());
    
    return {
      personalInfo: this.extractPersonalInfo(text, lines),
      summary: this.extractSummary(text, lines),
      experience: this.extractExperience(text, lines),
      education: this.extractEducation(text, lines),
      skills: this.extractSkills(text, lines),
      projects: this.extractProjects(text, lines),
      certifications: this.extractCertifications(text, lines),
      languages: this.extractLanguages(text, lines),
      interests: this.extractInterests(text, lines),
      references: this.extractReferences(text)
    };
  }
  
  /**
   * Extrahera personlig information
   */
  private extractPersonalInfo(text: string, lines: string[]): CVPersonalInfo {
    // E-post
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const emailMatches = text.match(emailRegex);
    const email = emailMatches?.[0] || '';
    
    // Telefon (svenska format)
    const phoneRegex = /(\+46|0046|0)[\s-]?[1-9][\d\s-]{7,10}/g;
    const phoneMatches = text.match(phoneRegex);
    let phone = phoneMatches?.[0] || '';
    if (phone) {
      phone = this.normalizeSwedishPhoneNumber(phone);
    }
    
    // LinkedIn
    const linkedInRegex = /(linkedin\.com\/in\/[\w-]+|linkedin\.com\/pub\/[\w-]+)/gi;
    const linkedInMatch = text.match(linkedInRegex);
    const linkedIn = linkedInMatch?.[0] || '';
    
    // Website/Portfolio
    const websiteRegex = /(https?:\/\/[\w.-]+\.\w+(?:\/[\w.-]*)*)/gi;
    const websiteMatches = text.match(websiteRegex);
    const website = websiteMatches?.find(url => 
      !url.includes('linkedin.com') && 
      !url.includes('github.com')
    ) || '';
    
    // GitHub
    const githubRegex = /(github\.com\/[\w-]+)/gi;
    const githubMatch = text.match(githubRegex);
    const github = githubMatch?.[0] || '';
    
    // Namn (första raden som ser ut som ett namn)
    const nameCandidate = lines.find(line => {
      const trimmed = line.trim();
      return trimmed.length > 3 && 
             trimmed.length < 50 &&
             !trimmed.includes('@') && 
             !trimmed.match(/^\d/) &&
             !trimmed.toLowerCase().includes('curriculum') &&
             !trimmed.toLowerCase().includes('vitae') &&
             trimmed.split(' ').length >= 2 &&
             trimmed.split(' ').length <= 4 &&
             /^[A-ZÅÄÖ]/.test(trimmed);
    }) || '';
    
    // Adress (svenska adressformat)
    const addressRegex = /\d{3}\s?\d{2}\s+[A-ZÅÄÖ][a-zåäö]+/g;
    const addressMatch = text.match(addressRegex);
    const address = addressMatch?.[0] || '';
    
    return {
      fullName: nameCandidate,
      email,
      phone,
      address,
      linkedIn,
      website,
      github
    };
  }
  
  /**
   * Normalisera svenska telefonnummer
   */
  private normalizeSwedishPhoneNumber(phone: string): string {
    // Ta bort alla mellanslag och bindestreck
    let cleaned = phone.replace(/[\s-]/g, '');
    
    // Konvertera till internationellt format
    if (cleaned.startsWith('0046')) {
      cleaned = '+46' + cleaned.substring(4);
    } else if (cleaned.startsWith('0')) {
      cleaned = '+46' + cleaned.substring(1);
    } else if (!cleaned.startsWith('+46')) {
      cleaned = '+46' + cleaned;
    }
    
    // Formatera med mellanslag för läsbarhet
    if (cleaned.startsWith('+46')) {
      const number = cleaned.substring(3);
      if (number.length >= 8) {
        return `+46 ${number.substring(0, 2)}-${number.substring(2, 5)} ${number.substring(5)}`;
      }
    }
    
    return cleaned;
  }
  
  /**
   * Extrahera professionell sammanfattning
   */
  private extractSummary(text: string, lines: string[]): string {
    const summaryKeywords = [
      'sammanfattning', 'summary', 'profil', 'profile', 
      'om mig', 'about', 'bakgrund', 'background'
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (summaryKeywords.some(keyword => line.includes(keyword))) {
        // Samla text efter rubriken
        let summaryText = '';
        for (let j = i + 1; j < lines.length && j < i + 10; j++) {
          const nextLine = lines[j].trim();
          if (nextLine === '' || this.isNewSection(nextLine)) break;
          summaryText += (summaryText ? ' ' : '') + nextLine;
        }
        if (summaryText.length > 50) {
          return summaryText;
        }
      }
    }
    
    return '';
  }
  
  /**
   * Kontrollera om en rad är början på en ny sektion
   */
  private isNewSection(line: string): boolean {
    const sectionKeywords = [
      'arbetslivserfarenhet', 'experience', 'anställning',
      'utbildning', 'education', 'skola',
      'kompetenser', 'skills', 'färdigheter',
      'projekt', 'projects', 'certifiering',
      'språk', 'languages', 'intressen', 'interests'
    ];
    
    const lowerLine = line.toLowerCase();
    return sectionKeywords.some(keyword => lowerLine.includes(keyword)) &&
           line.length < 100;
  }
  
  /**
   * Extrahera arbetslivserfarenhet
   */
  private extractExperience(text: string, lines: string[]): CVExperience[] {
    const experiences: CVExperience[] = [];
    const experienceKeywords = [
      'arbetslivserfarenhet', 'experience', 'anställning', 
      'tjänst', 'position', 'karriär', 'yrkeserfarenhet'
    ];
    
    let inExperienceSection = false;
    let currentExperience: Partial<CVExperience> = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lowerLine = line.toLowerCase();
      
      // Identifiera början på erfarenhet-sektion
      if (experienceKeywords.some(keyword => lowerLine.includes(keyword))) {
        inExperienceSection = true;
        continue;
      }
      
      if (!inExperienceSection) continue;
      
      // Stoppa vid nästa sektion
      if (this.isNewSection(line) && !lowerLine.includes('experience')) {
        if (this.isCompleteExperience(currentExperience)) {
          experiences.push(currentExperience as CVExperience);
        }
        break;
      }
      
      if (line === '') {
        if (this.isCompleteExperience(currentExperience)) {
          experiences.push(currentExperience as CVExperience);
          currentExperience = {};
        }
        continue;
      }
      
      // Försök identifiera position och företag
      if (this.looksLikeJobTitle(line) && !currentExperience.position) {
        const parsed = this.parseJobLine(line);
        currentExperience = { ...currentExperience, ...parsed };
      } else if (line.includes(' - ') && !currentExperience.position) {
        // Format: "Position - Företag"
        const [position, company] = line.split(' - ').map(s => s.trim());
        currentExperience.position = position;
        currentExperience.company = company;
      } else if (this.containsDate(line)) {
        // Datumlinje
        const dates = this.extractDates(line);
        if (dates.startDate) {
          currentExperience.startDate = dates.startDate;
        }
        if (dates.endDate) {
          currentExperience.endDate = dates.endDate;
        }
      } else if (currentExperience.position && line.length > 20) {
        // Beskrivning
        if (!currentExperience.description) {
          currentExperience.description = [];
        }
        currentExperience.description.push(line);
      }
    }
    
    // Lägg till sista erfarenheten
    if (this.isCompleteExperience(currentExperience)) {
      experiences.push(currentExperience as CVExperience);
    }
    
    return experiences;
  }
  
  /**
   * Kontrollera om en rad ser ut som en jobbtitel
   */
  private looksLikeJobTitle(line: string): boolean {
    const jobTitleIndicators = [
      'chef', 'manager', 'utvecklare', 'konsult', 'specialist',
      'ingenjör', 'analytiker', 'koordinator', 'assistent',
      'direktör', 'ledare', 'projektledare', 'säljare'
    ];
    
    const lowerLine = line.toLowerCase();
    return jobTitleIndicators.some(indicator => lowerLine.includes(indicator)) ||
           (line.length > 10 && line.length < 80 && !line.includes('@'));
  }
  
  /**
   * Parsa jobb-rad för position och företag
   */
  private parseJobLine(line: string): Partial<CVExperience> {
    // Olika format som kan förekomma
    if (line.includes(' på ')) {
      const [position, company] = line.split(' på ').map(s => s.trim());
      return { position, company };
    } else if (line.includes(' hos ')) {
      const [position, company] = line.split(' hos ').map(s => s.trim());
      return { position, company };
    } else if (line.includes(' - ')) {
      const [position, company] = line.split(' - ').map(s => s.trim());
      return { position, company };
    }
    
    return { position: line };
  }
  
  /**
   * Kontrollera om en rad innehåller datum
   */
  private containsDate(line: string): boolean {
    const datePatterns = [
      /\d{4}[-\/]\d{1,2}/,  // YYYY-MM or YYYY/MM
      /\d{1,2}[-\/]\d{4}/,  // MM-YYYY or MM/YYYY
      /(januari|februari|mars|april|maj|juni|juli|augusti|september|oktober|november|december)/i,
      /(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)/i,
      /\d{4}/  // Just year
    ];
    
    return datePatterns.some(pattern => pattern.test(line));
  }
  
  /**
   * Extrahera datum från text
   */
  private extractDates(line: string): { startDate?: string; endDate?: string } {
    const result: { startDate?: string; endDate?: string } = {};
    
    // Leta efter datum i olika format
    const yearMonthRegex = /(\d{4})[-\/](\d{1,2})/g;
    const monthYearRegex = /(\d{1,2})[-\/](\d{4})/g;
    const swedishDateRegex = /(januari|februari|mars|april|maj|juni|juli|augusti|september|oktober|november|december|jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)\s+(\d{4})/gi;
    const yearOnlyRegex = /\b(\d{4})\b/g;
    
    const dates: string[] = [];
    
    // Extrahera alla möjliga datum
    let match;
    
    // YYYY-MM format
    while ((match = yearMonthRegex.exec(line)) !== null) {
      dates.push(`${match[1]}-${match[2].padStart(2, '0')}`);
    }
    
    // MM-YYYY format
    yearMonthRegex.lastIndex = 0;
    while ((match = monthYearRegex.exec(line)) !== null) {
      dates.push(`${match[2]}-${match[1].padStart(2, '0')}`);
    }
    
    // Svenska månader
    while ((match = swedishDateRegex.exec(line)) !== null) {
      const monthName = match[1].toLowerCase();
      const year = match[2];
      const monthNumber = SWEDISH_MONTHS[monthName as keyof typeof SWEDISH_MONTHS];
      if (monthNumber) {
        dates.push(`${year}-${monthNumber}`);
      }
    }
    
    // Endast årtal
    if (dates.length === 0) {
      while ((match = yearOnlyRegex.exec(line)) !== null) {
        dates.push(`${match[1]}-01`);
      }
    }
    
    // Sortera datum kronologiskt
    dates.sort();
    
    if (dates.length >= 1) {
      result.startDate = dates[0];
    }
    if (dates.length >= 2) {
      result.endDate = dates[dates.length - 1];
    }
    
    // Kolla efter "pågående" eller "nuvarande"
    if (line.toLowerCase().includes('pågående') || 
        line.toLowerCase().includes('nuvarande') ||
        line.toLowerCase().includes('current')) {
      result.endDate = undefined; // Pågående jobb
    }
    
    return result;
  }
  
  /**
   * Kontrollera om erfarenhet är komplett
   */
  private isCompleteExperience(exp: Partial<CVExperience>): boolean {
    return !!(exp.position && exp.company);
  }
  
  /**
   * Extrahera utbildning
   */
  private extractEducation(text: string, lines: string[]): CVEducation[] {
    const education: CVEducation[] = [];
    const educationKeywords = [
      'utbildning', 'education', 'skola', 'universitet', 'högskola',
      'examen', 'degree', 'studier', 'kurs'
    ];
    
    let inEducationSection = false;
    let currentEducation: Partial<CVEducation> = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lowerLine = line.toLowerCase();
      
      if (educationKeywords.some(keyword => lowerLine.includes(keyword))) {
        inEducationSection = true;
        continue;
      }
      
      if (!inEducationSection) continue;
      
      if (this.isNewSection(line) && !lowerLine.includes('education')) {
        if (this.isCompleteEducation(currentEducation)) {
          education.push(currentEducation as CVEducation);
        }
        break;
      }
      
      if (line === '') {
        if (this.isCompleteEducation(currentEducation)) {
          education.push(currentEducation as CVEducation);
          currentEducation = {};
        }
        continue;
      }
      
      // Parsa utbildningsrad
      if (line.includes(' - ') && !currentEducation.degree) {
        const [degree, institution] = line.split(' - ').map(s => s.trim());
        currentEducation.degree = degree;
        currentEducation.institution = institution;
      } else if (this.containsDate(line)) {
        const dates = this.extractDates(line);
        if (dates.endDate) {
          currentEducation.graduationYear = dates.endDate.split('-')[0];
        }
      } else if (!currentEducation.degree && this.looksLikeDegree(line)) {
        currentEducation.degree = line;
      } else if (!currentEducation.institution && this.looksLikeInstitution(line)) {
        currentEducation.institution = line;
      }
    }
    
    if (this.isCompleteEducation(currentEducation)) {
      education.push(currentEducation as CVEducation);
    }
    
    return education;
  }
  
  private looksLikeDegree(line: string): boolean {
    const degreeIndicators = SWEDISH_EDUCATION_LEVELS;
    const lowerLine = line.toLowerCase();
    return degreeIndicators.some(indicator => lowerLine.includes(indicator));
  }
  
  private looksLikeInstitution(line: string): boolean {
    const institutionIndicators = [
      'universitet', 'högskola', 'institute', 'school',
      'college', 'academy', 'institution'
    ];
    const lowerLine = line.toLowerCase();
    return institutionIndicators.some(indicator => lowerLine.includes(indicator));
  }
  
  private isCompleteEducation(edu: Partial<CVEducation>): boolean {
    return !!(edu.degree && edu.institution);
  }
  
  /**
   * Extrahera kompetenser/färdigheter
   */
  private extractSkills(text: string, lines: string[]): CVSkill[] {
    const skills: CVSkill[] = [];
    const skillsKeywords = [
      'kompetenser', 'skills', 'färdigheter', 'kunskaper',
      'tekniker', 'verktyg', 'programvara'
    ];
    
    let inSkillsSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lowerLine = line.toLowerCase();
      
      if (skillsKeywords.some(keyword => lowerLine.includes(keyword))) {
        inSkillsSection = true;
        continue;
      }
      
      if (!inSkillsSection) continue;
      
      if (this.isNewSection(line) && !lowerLine.includes('skill')) {
        break;
      }
      
      if (line === '') continue;
      
      // Parsa kompetenser
      if (line.includes(':')) {
        const [category, skillsText] = line.split(':').map(s => s.trim());
        const skillArray = skillsText.split(',').map(s => s.trim()).filter(s => s.length > 0);
        if (skillArray.length > 0) {
          skills.push({
            category,
            skills: skillArray
          });
        }
      } else if (line.includes(',')) {
        const skillArray = line.split(',').map(s => s.trim()).filter(s => s.length > 0);
        if (skillArray.length > 1) {
          skills.push({
            category: 'Tekniska färdigheter',
            skills: skillArray
          });
        }
      } else {
        // Enskild kompetens
        if (line.length > 2 && line.length < 50) {
          skills.push({
            category: 'Kompetenser',
            skills: [line]
          });
        }
      }
    }
    
    return skills;
  }
  
  /**
   * Extrahera projekt
   */
  private extractProjects(text: string, lines: string[]): CVProject[] {
    const projects: CVProject[] = [];
    const projectKeywords = ['projekt', 'projects', 'portfolio'];
    
    let inProjectSection = false;
    let currentProject: Partial<CVProject> = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lowerLine = line.toLowerCase();
      
      if (projectKeywords.some(keyword => lowerLine.includes(keyword))) {
        inProjectSection = true;
        continue;
      }
      
      if (!inProjectSection) continue;
      
      if (this.isNewSection(line)) {
        if (currentProject.name) {
          projects.push(currentProject as CVProject);
        }
        break;
      }
      
      if (line === '') {
        if (currentProject.name) {
          projects.push(currentProject as CVProject);
          currentProject = {};
        }
        continue;
      }
      
      if (!currentProject.name) {
        currentProject.name = line;
      } else if (!currentProject.description && line.length > 20) {
        currentProject.description = line;
      }
    }
    
    if (currentProject.name) {
      projects.push(currentProject as CVProject);
    }
    
    return projects;
  }
  
  /**
   * Extrahera certifieringar
   */
  private extractCertifications(text: string, lines: string[]): CVCertification[] {
    const certifications: CVCertification[] = [];
    const certKeywords = [
      'certifiering', 'certification', 'certifikat', 'certificate',
      'utmärkelse', 'award', 'diplom'
    ];
    
    let inCertSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lowerLine = line.toLowerCase();
      
      if (certKeywords.some(keyword => lowerLine.includes(keyword))) {
        inCertSection = true;
        continue;
      }
      
      if (!inCertSection) continue;
      
      if (this.isNewSection(line)) break;
      
      if (line === '') continue;
      
      // Parsa certifiering
      if (line.includes(' - ')) {
        const [name, issuer] = line.split(' - ').map(s => s.trim());
        certifications.push({
          name,
          issuer,
          issueDate: this.extractYear(line)
        });
      } else if (line.length > 5) {
        certifications.push({
          name: line,
          issuer: 'Certifieringsmyndighet',
          issueDate: this.extractYear(line)
        });
      }
    }
    
    return certifications;
  }
  
  /**
   * Extrahera språkkunskaper
   */
  private extractLanguages(text: string, lines: string[]): CVLanguage[] {
    const languages: CVLanguage[] = [];
    const langKeywords = ['språk', 'languages', 'språkkunskaper'];
    
    let inLanguageSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lowerLine = line.toLowerCase();
      
      if (langKeywords.some(keyword => lowerLine.includes(keyword))) {
        inLanguageSection = true;
        continue;
      }
      
      if (!inLanguageSection) continue;
      
      if (this.isNewSection(line)) break;
      
      if (line === '') continue;
      
      // Parsa språk
      const langMatch = this.parseLanguageLine(line);
      if (langMatch) {
        languages.push(langMatch);
      }
    }
    
    return languages;
  }
  
  private parseLanguageLine(line: string): CVLanguage | null {
    // Format: "Svenska - Modersmål" eller "Engelska (flytande)"
    const lowerLine = line.toLowerCase();
    
    for (const [levelKey, levelValue] of Object.entries(SWEDISH_LANGUAGE_LEVELS)) {
      if (lowerLine.includes(levelKey)) {
        let language = line.replace(new RegExp(levelKey, 'gi'), '').trim();
        language = language.replace(/[-()]/g, '').trim();
        
        if (language.length > 1) {
          return {
            language,
            proficiency: levelValue
          };
        }
      }
    }
    
    // Om ingen nivå hittas, anta grundläggande
    if (line.length > 1 && line.length < 30) {
      return {
        language: line,
        proficiency: 'Konversation'
      };
    }
    
    return null;
  }
  
  /**
   * Extrahera intressen
   */
  private extractInterests(text: string, lines: string[]): string[] {
    const interests: string[] = [];
    const interestKeywords = ['intressen', 'interests', 'hobbies', 'fritid'];
    
    let inInterestSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lowerLine = line.toLowerCase();
      
      if (interestKeywords.some(keyword => lowerLine.includes(keyword))) {
        inInterestSection = true;
        continue;
      }
      
      if (!inInterestSection) continue;
      
      if (this.isNewSection(line)) break;
      
      if (line === '') continue;
      
      // Parsa intressen (kommaseparerade)
      if (line.includes(',')) {
        const interestArray = line.split(',').map(s => s.trim()).filter(s => s.length > 0);
        interests.push(...interestArray);
      } else if (line.length > 2) {
        interests.push(line);
      }
    }
    
    return interests;
  }
  
  /**
   * Extrahera referenser
   */
  private extractReferences(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('referenser lämnas på begäran') ||
        lowerText.includes('references available upon request')) {
      return 'Referenser lämnas på begäran';
    }
    
    // Leta efter referenssektion
    const referenceKeywords = ['referenser', 'references'];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const lowerLine = lines[i].toLowerCase();
      if (referenceKeywords.some(keyword => lowerLine.includes(keyword))) {
        return 'Referenser lämnas på begäran';
      }
    }
    
    return '';
  }
  
  /**
   * Extrahera år från text
   */
  private extractYear(text: string): string {
    const yearMatch = text.match(/\b(20\d{2}|19\d{2})\b/);
    return yearMatch?.[0] || '';
  }
  
  /**
   * Validera och rensa extraherad data
   */
  validateAndCleanData(cvData: CVMetadata): CVMetadata {
    return {
      ...cvData,
      personalInfo: this.cleanPersonalInfo(cvData.personalInfo),
      summary: cvData.summary?.trim() || '',
      experience: cvData.experience.filter(exp => exp.position && exp.company),
      education: cvData.education.filter(edu => edu.degree && edu.institution),
      skills: cvData.skills.filter(skill => skill.skills && skill.skills.length > 0),
      projects: cvData.projects?.filter(proj => proj.name && proj.description) || [],
      certifications: cvData.certifications?.filter(cert => cert.name) || [],
      languages: cvData.languages?.filter(lang => lang.language && lang.proficiency) || [],
      interests: cvData.interests?.filter(interest => interest && interest.length > 1) || [],
      references: cvData.references || 'Referenser lämnas på begäran'
    };
  }
  
  private cleanPersonalInfo(personalInfo: CVPersonalInfo): CVPersonalInfo {
    return {
      ...personalInfo,
      fullName: personalInfo.fullName?.trim() || '',
      email: personalInfo.email?.trim() || '',
      phone: personalInfo.phone?.trim() || '',
      address: personalInfo.address?.trim() || '',
      linkedIn: personalInfo.linkedIn?.trim() || '',
      website: personalInfo.website?.trim() || '',
      github: personalInfo.github?.trim() || ''
    };
  }
}

// Singleton för parsing
let swedishCVParser: SwedishCVContentParser | null = null;

export function getSwedishCVParser(): SwedishCVContentParser {
  if (!swedishCVParser) {
    swedishCVParser = new SwedishCVContentParser();
  }
  return swedishCVParser;
}

/**
 * Huvudfunktion för att extrahera svenskt CV-innehåll
 */
export async function parseSwedishCVContent(rawText: string): Promise<CVMetadata> {
  const parser = getSwedishCVParser();
  const parsedData = await parser.parseSwedishCV(rawText);
  return parser.validateAndCleanData(parsedData);
}