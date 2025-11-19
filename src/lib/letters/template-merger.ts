/**
 * Template Merger - Merge profile data into AI-generated letter content
 *
 * SECURITY: This module handles PII and merges it with AI-generated content.
 * PII from Supabase profiles table is NEVER sent to OpenAI - it's added here
 * AFTER the AI has generated the letter body.
 *
 * This ensures GDPR compliance and user privacy.
 */

export interface ProfileDataForLetter {
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  include_phone_in_letters: boolean;
  include_location_in_letters: boolean;
}

export interface JobInfo {
  title: string;        // Job title from application
  company: string;      // Company name
  position: string;     // Position title
  recipient?: string;   // Optional: Specific person name
}

/**
 * Merge profile data into letter using selected template
 */
export function mergeProfileDataIntoLetter(
  aiGeneratedBody: string,
  profile: ProfileDataForLetter,
  jobInfo: JobInfo,
  template?: string
): string {
  // Generate header with profile data
  const header = generateLetterHeader(profile);

  // Generate recipient section
  const recipient = generateRecipientSection(jobInfo);

  // Generate date
  const date = formatSwedishDate(new Date());

  // Generate greeting
  const greeting = generateGreeting(jobInfo.recipient);

  // Generate signature
  const signature = generateSignature(profile.full_name);

  // Combine all parts
  return `${header}\n\n${recipient}\n\n${date}\n\n${greeting}\n\n${aiGeneratedBody}\n\n${signature}`;
}

/**
 * Generate letter header with profile contact information
 */
function generateLetterHeader(profile: ProfileDataForLetter): string {
  const parts: string[] = [profile.full_name];

  // Add location if user wants it included
  if (profile.include_location_in_letters && profile.location) {
    parts.push(profile.location);
  }

  // Add phone if user wants it included
  if (profile.include_phone_in_letters && profile.phone) {
    parts.push(profile.phone);
  }

  // Always include email
  parts.push(profile.email);

  return parts.join('\n');
}

/**
 * Generate recipient section (company + position)
 */
function generateRecipientSection(jobInfo: JobInfo): string {
  const parts: string[] = [];

  if (jobInfo.recipient) {
    parts.push(jobInfo.recipient);
  }

  parts.push(jobInfo.company);

  // Add position if it's different from title
  if (jobInfo.position && jobInfo.position !== jobInfo.title) {
    parts.push(`Avseende: ${jobInfo.position}`);
  }

  return parts.join('\n');
}

/**
 * Format date in Swedish format: "19 november 2025"
 */
function formatSwedishDate(date: Date): string {
  const months = [
    'januari', 'februari', 'mars', 'april', 'maj', 'juni',
    'juli', 'augusti', 'september', 'oktober', 'november', 'december'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Generate greeting based on recipient
 */
function generateGreeting(recipient?: string): string {
  if (recipient) {
    return `Hej ${recipient},`;
  }
  return 'Hej,';
}

/**
 * Generate signature with name
 */
function generateSignature(fullName: string): string {
  return `Med vänliga hälsningar,\n${fullName}`;
}

/**
 * Parse AI-generated body and ensure it doesn't contain inappropriate content
 */
export function sanitizeAIGeneratedBody(body: string): string {
  let sanitized = body.trim();

  // Remove any accidental headers (AI sometimes adds these despite instructions)
  sanitized = sanitized.replace(/^(.*kontakt.*|.*address.*|.*email.*|.*telefon.*)$/gim, '');

  // Remove any accidental "Hej," at start
  sanitized = sanitized.replace(/^(Hej,?\s*|Hej\s+\[.*?\],?\s*)/i, '');

  // Remove any accidental signature at end
  sanitized = sanitized.replace(/(Med vänliga hälsningar,?.*|Vänliga hälsningar,?.*)$/i, '');

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

  return sanitized.trim();
}

/**
 * Validate merged letter to ensure it contains required elements
 */
export function validateMergedLetter(letter: string, profile: ProfileDataForLetter): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check that profile name is present
  if (!letter.includes(profile.full_name)) {
    errors.push('Profile name not found in letter');
  }

  // Check that email is present
  if (!letter.includes(profile.email)) {
    errors.push('Email not found in letter');
  }

  // Check for minimum length
  if (letter.length < 200) {
    errors.push('Letter is too short');
  }

  // Check that it has both a greeting and signature
  if (!letter.includes('Hej')) {
    errors.push('Missing greeting');
  }

  if (!letter.includes('Med vänliga hälsningar')) {
    errors.push('Missing signature');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Extract job information from job description text
 * Helper function for when we need to parse unstructured job data
 */
export function extractJobInfoFromDescription(jobDescription: string): Partial<JobInfo> {
  const info: Partial<JobInfo> = {};

  // Try to extract company name (look for common patterns)
  const companyMatch = jobDescription.match(/(hos|at|för)\s+([A-ZÅÄÖ][a-zåäö]+(?:\s+[A-ZÅÄÖ][a-zåäö]+)*)/i);
  if (companyMatch) {
    info.company = companyMatch[2];
  }

  // Try to extract position (look for job titles)
  const positionPatterns = [
    /som\s+([A-ZÅÄÖ][a-zåäö]+(?:\s+[a-zåäö]+)*)/i,
    /tjänst(?:en)?:\s*([A-ZÅÄÖ][a-zåäö]+(?:\s+[a-zåäö]+)*)/i,
    /position:\s*([A-ZÅÄÖ][a-zåäö]+(?:\s+[a-zåäö]+)*)/i
  ];

  for (const pattern of positionPatterns) {
    const match = jobDescription.match(pattern);
    if (match) {
      info.position = match[1];
      break;
    }
  }

  return info;
}
