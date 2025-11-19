/**
 * CV Anonymizer - Remove PII from CV text before sending to AI
 *
 * SECURITY: This is critical for GDPR compliance. We MUST NOT send personal
 * identifiable information (names, emails, phone numbers, addresses) to external
 * AI services like OpenAI.
 *
 * This module extracts only professional information (skills, experience, education)
 * while removing all personal identifiers.
 */

interface AnonymizedCVData {
  workExperience: string[];
  education: string[];
  skills: string[];
  certifications: string[];
  languages: string[];
  summary: string;
}

/**
 * Patterns to detect and remove PII
 */
const PII_PATTERNS = {
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

  // Swedish phone numbers (various formats)
  phone: /(\+46|0046|0)[\s-]?7[\s-]?\d{1}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g,
  phoneSimple: /\b\d{3}[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}\b/g,
  phoneInternational: /\+\d{1,3}[\s-]?\d{1,14}/g,

  // Addresses (Swedish patterns)
  streetAddress: /\b[A-ZÅÄÖ][a-zåäö]+(?:gatan|vägen|stigen|gränden|torget|platsen)\s+\d+[A-Za-z]?\b/g,
  postalCode: /\b\d{3}\s?\d{2}\b/g,

  // Personal ID numbers (Swedish personnummer)
  personnummer: /\b\d{6}[-\s]?\d{4}\b/g,

  // URLs and websites
  url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
};

/**
 * Common Swedish first names to detect and anonymize
 */
const COMMON_NAMES = [
  'anna', 'erik', 'maria', 'lars', 'eva', 'anders', 'karin', 'johan', 'emma', 'oscar',
  'sofia', 'carl', 'lisa', 'peter', 'sara', 'jan', 'lena', 'mikael', 'kristina', 'anders',
  'mohammed', 'ali', 'ahmed', 'fatima', 'john', 'robert', 'jennifer', 'michael', 'linda'
];

/**
 * Extract professional information from CV while removing PII
 */
export function extractSkillsAndExperience(cvText: string): string {
  if (!cvText || cvText.trim().length === 0) {
    return '';
  }

  // Step 1: Remove all PII using regex patterns
  let anonymized = cvText;

  // Remove emails
  anonymized = anonymized.replace(PII_PATTERNS.email, '[EMAIL REMOVED]');

  // Remove phone numbers
  anonymized = anonymized.replace(PII_PATTERNS.phone, '[PHONE REMOVED]');
  anonymized = anonymized.replace(PII_PATTERNS.phoneSimple, '[PHONE REMOVED]');
  anonymized = anonymized.replace(PII_PATTERNS.phoneInternational, '[PHONE REMOVED]');

  // Remove addresses
  anonymized = anonymized.replace(PII_PATTERNS.streetAddress, '[ADDRESS REMOVED]');
  anonymized = anonymized.replace(PII_PATTERNS.postalCode, '[POSTAL CODE REMOVED]');

  // Remove personal ID numbers
  anonymized = anonymized.replace(PII_PATTERNS.personnummer, '[ID REMOVED]');

  // Remove URLs (might contain personal websites)
  anonymized = anonymized.replace(PII_PATTERNS.url, '[URL REMOVED]');

  // Step 2: Try to parse structured CV data
  const parsed = parseCV(anonymized);

  // Step 3: Reconstruct as anonymized professional profile
  return reconstructAnonymizedCV(parsed);
}

/**
 * Parse CV into structured sections
 */
function parseCV(cvText: string): AnonymizedCVData {
  const lines = cvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  const data: AnonymizedCVData = {
    workExperience: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
    summary: ''
  };

  let currentSection: keyof AnonymizedCVData | null = null;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Detect section headers
    if (lowerLine.includes('arbetslivserfarenhet') || lowerLine.includes('experience') || lowerLine.includes('anställning')) {
      currentSection = 'workExperience';
      continue;
    }
    if (lowerLine.includes('utbildning') || lowerLine.includes('education')) {
      currentSection = 'education';
      continue;
    }
    if (lowerLine.includes('kompetens') || lowerLine.includes('skills') || lowerLine.includes('färdigheter')) {
      currentSection = 'skills';
      continue;
    }
    if (lowerLine.includes('certifiering') || lowerLine.includes('certification')) {
      currentSection = 'certifications';
      continue;
    }
    if (lowerLine.includes('språk') || lowerLine.includes('language')) {
      currentSection = 'languages';
      continue;
    }
    if (lowerLine.includes('profil') || lowerLine.includes('summary') || lowerLine.includes('om mig')) {
      currentSection = 'summary';
      continue;
    }

    // Skip lines that look like contact headers
    if (lowerLine.includes('kontaktuppgifter') || lowerLine.includes('contact')) {
      currentSection = null;
      continue;
    }

    // Skip lines with PII markers
    if (line.includes('[EMAIL REMOVED]') || line.includes('[PHONE REMOVED]') ||
        line.includes('[ADDRESS REMOVED]') || line.includes('[ID REMOVED]')) {
      continue;
    }

    // Add content to current section
    if (currentSection && line.length > 3) {
      if (Array.isArray(data[currentSection])) {
        (data[currentSection] as string[]).push(line);
      } else if (currentSection === 'summary') {
        data.summary += line + ' ';
      }
    }
  }

  return data;
}

/**
 * Reconstruct CV from parsed data in anonymized format
 */
function reconstructAnonymizedCV(data: AnonymizedCVData): string {
  const sections: string[] = [];

  // Professional Summary
  if (data.summary && data.summary.trim().length > 0) {
    sections.push('PROFESSIONELL PROFIL:\n' + anonymizeText(data.summary.trim()));
  }

  // Work Experience
  if (data.workExperience.length > 0) {
    sections.push('\nARBETSLIVSERFARENHET:\n' + data.workExperience.map(exp => '• ' + anonymizeText(exp)).join('\n'));
  }

  // Education
  if (data.education.length > 0) {
    sections.push('\nUTBILDNING:\n' + data.education.map(edu => '• ' + anonymizeText(edu)).join('\n'));
  }

  // Skills
  if (data.skills.length > 0) {
    sections.push('\nKOMPETENSER:\n' + data.skills.map(skill => '• ' + anonymizeText(skill)).join('\n'));
  }

  // Certifications
  if (data.certifications.length > 0) {
    sections.push('\nCERTIFIERINGAR:\n' + data.certifications.map(cert => '• ' + anonymizeText(cert)).join('\n'));
  }

  // Languages
  if (data.languages.length > 0) {
    sections.push('\nSPRÅK:\n' + data.languages.map(lang => '• ' + anonymizeText(lang)).join('\n'));
  }

  return sections.join('\n\n');
}

/**
 * Additional text anonymization - remove potential names
 */
function anonymizeText(text: string): string {
  let anonymized = text;

  // Remove common Swedish names (case insensitive)
  for (const name of COMMON_NAMES) {
    const regex = new RegExp(`\\b${name}\\b`, 'gi');
    anonymized = anonymized.replace(regex, '[NAME]');
  }

  // Remove patterns like "Jag är" or "Mitt namn är" at start of sentences
  anonymized = anonymized.replace(/^(jag är|mitt namn är|jag heter|min namn|i am|my name is)\s+[A-ZÅÄÖ][a-zåäö]+\s*/gi, '');

  return anonymized;
}

/**
 * Validate that anonymization was successful
 * Returns array of warnings if potential PII detected
 */
export function validateAnonymization(text: string): string[] {
  const warnings: string[] = [];

  if (PII_PATTERNS.email.test(text)) {
    warnings.push('Email address detected in anonymized text');
  }

  if (PII_PATTERNS.phone.test(text) || PII_PATTERNS.phoneSimple.test(text)) {
    warnings.push('Phone number detected in anonymized text');
  }

  if (PII_PATTERNS.personnummer.test(text)) {
    warnings.push('Personal ID number detected in anonymized text');
  }

  if (text.includes('@')) {
    warnings.push('@ symbol detected - possible missed email');
  }

  return warnings;
}
