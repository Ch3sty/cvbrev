// src/lib/cv/tests/swedish-cv-validation.ts
// Validering av svenska CV-mallar enligt Arbetsförmedlingens standarder

import { CVMetadata, CVTemplateType, shouldShowSection, generateDynamicHeadings } from '../cv-metadata';
import { parseSwedishCVContent } from '../swedish-cv-content-parser';
import { loadTemplate } from '../cv-templates';

export interface SwedishCVValidationResult {
  templateId: CVTemplateType;
  isValid: boolean;
  score: number; // 0-100
  issues: ValidationIssue[];
  recommendations: string[];
  passesATS: boolean;
  followsStandards: boolean;
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  category: 'structure' | 'content' | 'format' | 'ats' | 'swedish-standards';
  message: string;
  location?: string;
}

// Test CV-data för validering
const testCVData: CVMetadata = {
  personalInfo: {
    fullName: 'Anna Andersson',
    email: 'anna.andersson@email.com',
    phone: '+46 70-123 45 67',
    address: '123 45 Stockholm',
    linkedIn: 'linkedin.com/in/anna-andersson',
    website: 'annaandersson.se',
    title: 'Senior Projektledare'
  },
  summary: 'Erfaren projektledare med över 8 års erfarenhet av att leda komplexa IT-projekt inom finansbranschen. Specialiserad på agila metoder, teamledarskap och strategisk planering.',
  experience: [
    {
      position: 'Senior Projektledare',
      company: 'Finansbank AB',
      location: 'Stockholm',
      startDate: '2020-03',
      description: [
        'Ledde utveckling av ny internetbank för 500,000+ kunder',
        'Minskade projektleveranstid med 30% genom implementering av Scrum',
        'Ansvarig för budget på 15 MSEK och team med 12 utvecklare'
      ]
    },
    {
      position: 'Projektledare',
      company: 'Tech Solutions Ltd',
      location: 'Göteborg', 
      startDate: '2018-01',
      endDate: '2020-02',
      description: [
        'Genomförde 15+ framgångsrika IT-projekt för medelstora företag',
        'Introducerade agila arbetssätt och förbättrade leveranssäkerhet'
      ]
    }
  ],
  education: [
    {
      degree: 'Civilingenjör Datateknik',
      institution: 'KTH Kungliga Tekniska Högskolan',
      location: 'Stockholm',
      graduationYear: '2017'
    },
    {
      degree: 'Projektledning Certifiering',
      institution: 'PMI Sverige',
      graduationYear: '2019'
    }
  ],
  skills: [
    {
      category: 'Projektledning',
      skills: ['Scrum', 'Kanban', 'PMP', 'Agile', 'PRINCE2']
    },
    {
      category: 'Tekniska färdigheter',
      skills: ['Java', 'Python', 'SQL', 'AWS', 'Docker']
    },
    {
      category: 'Mjuka färdigheter',
      skills: ['Ledarskap', 'Kommunikation', 'Problemlösning', 'Strategisk planering']
    }
  ],
  languages: [
    { language: 'Svenska', proficiency: 'Modersmål' },
    { language: 'Engelska', proficiency: 'Flyt' },
    { language: 'Tyska', proficiency: 'Konversation' }
  ],
  certifications: [
    {
      name: 'Project Management Professional (PMP)',
      issuer: 'PMI',
      issueDate: '2019-06'
    },
    {
      name: 'Certified ScrumMaster',
      issuer: 'Scrum Alliance',
      issueDate: '2020-03'
    }
  ],
  projects: [
    {
      name: 'Bankens Digitala Transformation',
      description: 'Ledde övergång från legacy-system till modern molnbaserad arkitektur',
      technologies: ['AWS', 'Microservices', 'React', 'Node.js']
    }
  ],
  interests: ['Bergsklättring', 'Fotografering', 'Teknisk innovation', 'Mentorskap'],
  references: 'Referenser lämnas på begäran'
};

export class SwedishCVValidator {
  
  /**
   * Validera en svensk CV-mall mot alla standards
   */
  async validateTemplate(templateId: CVTemplateType): Promise<SwedishCVValidationResult> {
    const issues: ValidationIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;
    
    try {
      // Ladda template
      const template = await loadTemplate(templateId);
      const html = await template.generateHTML(testCVData, {
        template: templateId,
        format: 'pdf',
        colorScheme: 'blue'
      });
      
      // Strukturvalidering
      const structureIssues = this.validateStructure(html, testCVData);
      issues.push(...structureIssues);
      score -= structureIssues.filter(i => i.severity === 'error').length * 15;
      score -= structureIssues.filter(i => i.severity === 'warning').length * 5;
      
      // Svenska standarder
      const standardsIssues = this.validateSwedishStandards(html, template);
      issues.push(...standardsIssues);
      score -= standardsIssues.filter(i => i.severity === 'error').length * 20;
      score -= standardsIssues.filter(i => i.severity === 'warning').length * 8;
      
      // ATS-kompatibilitet
      const atsIssues = this.validateATSCompatibility(html);
      issues.push(...atsIssues);
      score -= atsIssues.filter(i => i.severity === 'error').length * 25;
      
      // Innehållsvalidering
      const contentIssues = this.validateContent(html, testCVData);
      issues.push(...contentIssues);
      score -= contentIssues.filter(i => i.severity === 'error').length * 10;
      
      // Formatvalidering
      const formatIssues = this.validateFormatting(html);
      issues.push(...formatIssues);
      score -= formatIssues.filter(i => i.severity === 'warning').length * 3;
      
      // Generera rekommendationer
      const templateRecommendations = this.generateRecommendations(issues, templateId);
      recommendations.push(...templateRecommendations);
      
      const passesATS = !atsIssues.some(i => i.severity === 'error');
      const followsStandards = !standardsIssues.some(i => i.severity === 'error');
      
      return {
        templateId,
        isValid: issues.filter(i => i.severity === 'error').length === 0,
        score: Math.max(0, score),
        issues,
        recommendations,
        passesATS,
        followsStandards
      };
      
    } catch (error) {
      issues.push({
        severity: 'error',
        category: 'structure',
        message: `Template kunde inte laddas: ${error instanceof Error ? error.message : 'Okänt fel'}`
      });
      
      return {
        templateId,
        isValid: false,
        score: 0,
        issues,
        recommendations: ['Mall måste fixas innan validering kan genomföras'],
        passesATS: false,
        followsStandards: false
      };
    }
  }
  
  /**
   * Validera CV-struktur
   */
  private validateStructure(html: string, cvData: CVMetadata): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Kontrollera att namn finns
    if (!html.includes(cvData.personalInfo.fullName)) {
      issues.push({
        severity: 'error',
        category: 'structure',
        message: 'Namn saknas eller renderas inte korrekt'
      });
    }
    
    // Kontrollera kontaktuppgifter
    if (cvData.personalInfo.email && !html.includes(cvData.personalInfo.email)) {
      issues.push({
        severity: 'error',
        category: 'structure',
        message: 'E-postadress saknas'
      });
    }
    
    if (cvData.personalInfo.phone && !html.includes(cvData.personalInfo.phone)) {
      issues.push({
        severity: 'warning',
        category: 'structure',
        message: 'Telefonnummer saknas eller fel formaterat'
      });
    }
    
    // Kontrollera att erfarenhet renderas
    if (cvData.experience.length > 0) {
      const hasExperience = cvData.experience.some(exp => 
        html.includes(exp.position) && html.includes(exp.company)
      );
      if (!hasExperience) {
        issues.push({
          severity: 'error',
          category: 'structure',
          message: 'Arbetslivserfarenhet renderas inte korrekt'
        });
      }
    }
    
    // Kontrollera utbildning
    if (cvData.education.length > 0) {
      const hasEducation = cvData.education.some(edu => 
        html.includes(edu.degree) && html.includes(edu.institution)
      );
      if (!hasEducation) {
        issues.push({
          severity: 'error',
          category: 'structure', 
          message: 'Utbildning renderas inte korrekt'
        });
      }
    }
    
    return issues;
  }
  
  /**
   * Validera svenska CV-standarder
   */
  private validateSwedishStandards(html: string, template: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Kontrollera svenska rubriker
    const swedishHeadings = [
      'arbetslivserfarenhet', 'yrkeserfarenhet', 'erfarenhet',
      'utbildning', 'kompetenser', 'färdigheter', 'språkkunskaper'
    ];
    
    const hasSwedishHeadings = swedishHeadings.some(heading => 
      html.toLowerCase().includes(heading)
    );
    
    if (!hasSwedishHeadings) {
      issues.push({
        severity: 'warning',
        category: 'swedish-standards',
        message: 'Saknar svenska rubriker - använd svenska termer för sektioner'
      });
    }
    
    // Kontrollera datumformat
    const swedishDatePattern = /\d{4}-\d{2}/g;
    const hasSwedishDates = swedishDatePattern.test(html);
    
    if (!hasSwedishDates && html.includes('2020')) {
      issues.push({
        severity: 'warning', 
        category: 'swedish-standards',
        message: 'Använd svenskt datumformat (YYYY-MM)'
      });
    }
    
    // Kontrollera referenser
    const referencesText = ['referenser lämnas på begäran', 'references available'];
    const hasReferences = referencesText.some(ref => 
      html.toLowerCase().includes(ref.toLowerCase())
    );
    
    if (!hasReferences) {
      issues.push({
        severity: 'info',
        category: 'swedish-standards',
        message: 'Rekommenderat att inkludera "Referenser lämnas på begäran"'
      });
    }
    
    // Kontrollera längd (approximation baserad på HTML-längd)
    const approximatePages = html.length / 4000; // Rough estimate
    if (approximatePages > 2.5) {
      issues.push({
        severity: 'warning',
        category: 'swedish-standards',
        message: 'CV verkar överstiga 2 sidor - Arbetsförmedlingen rekommenderar max 2 sidor'
      });
    }
    
    return issues;
  }
  
  /**
   * Validera ATS-kompatibilitet
   */
  private validateATSCompatibility(html: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Kontrollera att det inte finns komplexa tabeller
    const complexTables = html.match(/<table[^>]*>[\s\S]*?<\/table>/gi) || [];
    if (complexTables.length > 1) {
      issues.push({
        severity: 'warning',
        category: 'ats',
        message: 'Många tabeller kan orsaka ATS-parsingproblem'
      });
    }
    
    // Kontrollera att text inte är i bilder
    const hasImages = /<img[^>]*>/gi.test(html);
    if (hasImages) {
      issues.push({
        severity: 'warning',
        category: 'ats',
        message: 'Bilder kan inte läsas av ATS-system - undvik text i bilder'
      });
    }
    
    // Kontrollera tydliga rubriker
    const hasHeaders = /<h[1-6][^>]*>/gi.test(html);
    if (!hasHeaders) {
      issues.push({
        severity: 'error',
        category: 'ats',
        message: 'Saknar strukturerade rubriker (H1-H6) för ATS-parsing'
      });
    }
    
    // Kontrollera för mycket CSS som kan störa ATS
    const hasComplexCSS = html.includes('position: absolute') || 
                         html.includes('transform:') ||
                         html.includes('z-index');
    
    if (hasComplexCSS) {
      issues.push({
        severity: 'info',
        category: 'ats',
        message: 'Komplex CSS kan påverka ATS-läsbarhet'
      });
    }
    
    return issues;
  }
  
  /**
   * Validera innehåll
   */
  private validateContent(html: string, cvData: CVMetadata): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Kontrollera att inga hårdkodade platshållare finns
    const placeholders = [
      'lorem ipsum', 'placeholder', 'example@email.com', 
      'your name here', 'ditt namn här', 'exempel'
    ];
    
    for (const placeholder of placeholders) {
      if (html.toLowerCase().includes(placeholder)) {
        issues.push({
          severity: 'error',
          category: 'content',
          message: `Hårdkodad platshållare hittad: "${placeholder}"`
        });
      }
    }
    
    // Kontrollera att viktiga sektioner visas när data finns
    if (shouldShowSection('skills', cvData) && !html.toLowerCase().includes('kompetens')) {
      issues.push({
        severity: 'warning',
        category: 'content',
        message: 'Kompetenser borde visas när data finns tillgänglig'
      });
    }
    
    if (shouldShowSection('languages', cvData) && !html.toLowerCase().includes('språk')) {
      issues.push({
        severity: 'warning',
        category: 'content',
        message: 'Språkkunskaper borde visas när data finns tillgänglig'
      });
    }
    
    return issues;
  }
  
  /**
   * Validera formattering
   */
  private validateFormatting(html: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Kontrollera typsnitt
    if (!html.includes('Helvetica') && !html.includes('Arial') && !html.includes('Inter')) {
      issues.push({
        severity: 'info',
        category: 'format',
        message: 'Rekommenderat att använda professionella typsnitt (Helvetica, Arial, Inter)'
      });
    }
    
    // Kontrollera att PDF-optimeringar finns
    if (!html.includes('@media print')) {
      issues.push({
        severity: 'warning',
        category: 'format',
        message: 'Saknar print-CSS för optimal PDF-rendering'
      });
    }
    
    // Kontrollera färgkontrast (grundläggande)
    const hasLowContrast = html.includes('color: #ccc') || 
                          html.includes('color: #ddd') ||
                          html.includes('color: #eee');
    
    if (hasLowContrast) {
      issues.push({
        severity: 'warning',
        category: 'format',
        message: 'Låg färgkontrast kan påverka läsbarhet'
      });
    }
    
    return issues;
  }
  
  /**
   * Generera rekommendationer baserat på issues
   */
  private generateRecommendations(issues: ValidationIssue[], templateId: CVTemplateType): string[] {
    const recommendations: string[] = [];
    
    const structureErrors = issues.filter(i => i.category === 'structure' && i.severity === 'error');
    if (structureErrors.length > 0) {
      recommendations.push('Åtgärda strukturella problem före produktionsdeploy');
    }
    
    const atsIssues = issues.filter(i => i.category === 'ats');
    if (atsIssues.length > 0) {
      recommendations.push('Förbättra ATS-kompatibilitet för bättre genomslagskraft på svenska jobbportaler');
    }
    
    const swedishIssues = issues.filter(i => i.category === 'swedish-standards');
    if (swedishIssues.length > 0) {
      recommendations.push('Anpassa ytterligare till svenska CV-normer enligt Arbetsförmedlingen');
    }
    
    // Template-specifika rekommendationer
    switch (templateId) {
      case 'klassisk':
        recommendations.push('Klassisk mall - perfekt för konservativa branscher och senior roller');
        break;
      case 'modern':
        recommendations.push('Modern mall - bra för tech/innovation, se till att sidokolumn fungerar i ATS');
        break;
      case 'minimalistisk':
        recommendations.push('Minimalistisk mall - utmärkt för premium-positioner, fokusera på innehållskvalitet');
        break;
    }
    
    if (issues.length === 0) {
      recommendations.push('Mall följer alla svenska standarder - redo för produktion!');
    }
    
    return recommendations;
  }
}

/**
 * Validera alla svenska CV-mallar
 */
export async function validateAllSwedishTemplates(): Promise<Record<CVTemplateType, SwedishCVValidationResult>> {
  const validator = new SwedishCVValidator();
  const templates: CVTemplateType[] = ['klassisk', 'modern', 'minimalistisk'];
  
  const results: Record<string, SwedishCVValidationResult> = {};
  
  for (const templateId of templates) {
    try {
      console.log(`Validerar ${templateId} mall...`);
      results[templateId] = await validator.validateTemplate(templateId);
      console.log(`${templateId}: Score ${results[templateId].score}/100`);
    } catch (error) {
      console.error(`Fel vid validering av ${templateId}:`, error);
      results[templateId] = {
        templateId,
        isValid: false,
        score: 0,
        issues: [{
          severity: 'error',
          category: 'structure',
          message: `Validering misslyckades: ${error instanceof Error ? error.message : 'Okänt fel'}`
        }],
        recommendations: ['Mall måste åtgärdas'],
        passesATS: false,
        followsStandards: false
      };
    }
  }
  
  return results as Record<CVTemplateType, SwedishCVValidationResult>;
}

/**
 * Kör validering och skriv ut resultat
 */
export async function runSwedishCVValidation(): Promise<void> {
  console.log('🇸🇪 VALIDERING AV SVENSKA CV-MALLAR 🇸🇪\n');
  console.log('Testar alla mallar mot svenska standarder...\n');
  
  const results = await validateAllSwedishTemplates();
  
  // Skriv ut sammanfattning
  console.log('\n📊 SAMMANFATTNING:');
  console.log('='.repeat(50));
  
  for (const [templateId, result] of Object.entries(results)) {
    const statusIcon = result.isValid ? '✅' : '❌';
    const atsIcon = result.passesATS ? '🤖✅' : '🤖❌';
    const swedishIcon = result.followsStandards ? '🇸🇪✅' : '🇸🇪❌';
    
    console.log(`${statusIcon} ${templateId.toUpperCase()}: ${result.score}/100`);
    console.log(`   ATS: ${atsIcon} | Svenska standarder: ${swedishIcon}`);
    console.log(`   Issues: ${result.issues.length} | Rekommendationer: ${result.recommendations.length}`);
    
    if (result.issues.length > 0) {
      console.log('   Huvudproblem:');
      result.issues
        .filter(i => i.severity === 'error')
        .slice(0, 2)
        .forEach(issue => console.log(`   - ${issue.message}`));
    }
    
    console.log('');
  }
  
  // Övergripande statistik
  const totalTemplates = Object.keys(results).length;
  const validTemplates = Object.values(results).filter(r => r.isValid).length;
  const atsCompatible = Object.values(results).filter(r => r.passesATS).length;
  const swedishCompliant = Object.values(results).filter(r => r.followsStandards).length;
  
  console.log('📈 STATISTIK:');
  console.log(`Giltiga mallar: ${validTemplates}/${totalTemplates}`);
  console.log(`ATS-kompatibla: ${atsCompatible}/${totalTemplates}`);
  console.log(`Svenska standarder: ${swedishCompliant}/${totalTemplates}`);
  
  const avgScore = Object.values(results).reduce((sum, r) => sum + r.score, 0) / totalTemplates;
  console.log(`Genomsnittlig kvalitet: ${avgScore.toFixed(1)}/100`);
  
  if (avgScore >= 90) {
    console.log('\n🎉 UTMÄRKT! Mallarna håller mycket hög kvalitet för svenska marknaden.');
  } else if (avgScore >= 75) {
    console.log('\n👍 BRA! Mallarna fungerar väl, men kan förbättras ytterligare.');
  } else {
    console.log('\n⚠️  BEHÖVER FÖRBÄTTRING: Flera problem måste åtgärdas.');
  }
}