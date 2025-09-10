import type { CVMetadata, CVTemplateType } from '@/lib/cv/cv-metadata';

/**
 * Interface för CV-template generators
 */
export interface CVTemplateGenerator {
  /**
   * Genererar HTML för template
   */
  generate: (cvData: CVMetadata) => string;
  
  /**
   * Template ID för identifiering
   */
  templateId: CVTemplateType;
  
  /**
   * Template metadata
   */
  metadata: {
    name: string;
    description: string;
    category: 'modern' | 'traditional' | 'creative';
    tier: 'free' | 'premium';
  };
}

/**
 * Utility functions för templates
 */
export class TemplateUtils {
  /**
   * Escape HTML special characters
   */
  static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Format datum för CV
   */
  static formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      return date.toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'long'
      });
    } catch {
      return dateStr;
    }
  }

  /**
   * Beräkna duration mellan datum
   */
  static calculateDuration(startDate: string, endDate?: string): string {
    if (!startDate) return '';
    
    try {
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date();
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
      
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
      const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
      
      if (diffYears > 0) {
        return diffMonths > 0 ? `${diffYears} år, ${diffMonths} månader` : `${diffYears} år`;
      } else if (diffMonths > 0) {
        return `${diffMonths} månader`;
      } else {
        return '< 1 månad';
      }
    } catch {
      return '';
    }
  }

  /**
   * Formatera skills som HTML lista
   */
  static formatSkillsAsHTML(skills: string[], className: string = 'skill-item'): string {
    if (!skills || skills.length === 0) return '';
    
    return skills
      .map(skill => `<span class="${className}">${this.escapeHtml(skill.trim())}</span>`)
      .join('\n');
  }

  /**
   * Formatera languages som HTML lista
   */
  static formatLanguagesAsHTML(languages: string[], className: string = 'language-item'): string {
    if (!languages || languages.length === 0) return '';
    
    return languages
      .map(lang => `<span class="${className}">${this.escapeHtml(lang.trim())}</span>`)
      .join('\n');
  }
}