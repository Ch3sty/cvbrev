/**
 * Natural Language Processing Analytics
 * Advanced text analysis for user-generated content
 */

import { getSupabaseClient } from '@/lib/supabase/client-manager';

// Types for NLP analysis
export interface SentimentAnalysis {
  content_id: string;
  content_type: 'letter' | 'cv' | 'feedback';
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: EmotionScores;
  key_phrases: string[];
}

export interface EmotionScores {
  professional: number;
  confident: number;
  enthusiastic: number;
  formal: number;
  creative: number;
}

export interface QualityAnalysis {
  content_id: string;
  quality_score: number;
  readability_score: number;
  ats_compatibility: number;
  improvements: QualityImprovement[];
  strengths: string[];
  weaknesses: string[];
}

export interface QualityImprovement {
  type: 'grammar' | 'structure' | 'keywords' | 'length' | 'tone';
  description: string;
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
}

export interface KeywordExtraction {
  content_id: string;
  keywords: Keyword[];
  industry_relevance: number;
  missing_keywords: string[];
  keyword_density: Record<string, number>;
}

export interface Keyword {
  term: string;
  frequency: number;
  relevance: number;
  category: 'skill' | 'experience' | 'education' | 'soft_skill' | 'industry';
}

export interface ContentCategorization {
  content_id: string;
  primary_category: string;
  secondary_categories: string[];
  industry: string;
  job_level: 'entry' | 'mid' | 'senior' | 'executive';
  confidence: number;
}

/**
 * Sentiment Analyzer
 * Analyzes emotional tone and sentiment in content
 */
export class SentimentAnalyzer {
  private supabase;
  
  // Swedish sentiment keywords
  private positiveWords = [
    'utmärkt', 'fantastisk', 'kompetent', 'erfaren', 'driven',
    'motiverad', 'passionerad', 'dedikerad', 'framgångsrik', 'innovativ',
    'kreativ', 'ansvarstagande', 'resultatinriktad', 'ambitiös', 'skicklig'
  ];

  private negativeWords = [
    'svår', 'problem', 'utmaning', 'brist', 'saknar', 
    'begränsad', 'osäker', 'inexperienced', 'oklart', 'vag'
  ];

  private professionalWords = [
    'professionell', 'kvalificerad', 'certifierad', 'specialiserad',
    'expert', 'konsult', 'ledare', 'ansvarig', 'strategisk'
  ];

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async analyzeContent(contentId: string, content: string, type: 'letter' | 'cv' | 'feedback'): Promise<SentimentAnalysis> {
    const sentiment = this.calculateSentiment(content);
    const emotions = this.analyzeEmotions(content);
    const keyPhrases = this.extractKeyPhrases(content);

    return {
      content_id: contentId,
      content_type: type,
      sentiment,
      confidence: this.calculateConfidence(content, sentiment),
      emotions,
      key_phrases: keyPhrases
    };
  }

  private calculateSentiment(content: string): 'positive' | 'negative' | 'neutral' {
    const lowerContent = content.toLowerCase();
    
    let positiveScore = 0;
    let negativeScore = 0;

    this.positiveWords.forEach(word => {
      const matches = (lowerContent.match(new RegExp(word, 'gi')) || []).length;
      positiveScore += matches;
    });

    this.negativeWords.forEach(word => {
      const matches = (lowerContent.match(new RegExp(word, 'gi')) || []).length;
      negativeScore += matches;
    });

    const totalScore = positiveScore - negativeScore;
    
    if (totalScore > 3) return 'positive';
    if (totalScore < -2) return 'negative';
    return 'neutral';
  }

  private analyzeEmotions(content: string): EmotionScores {
    const lowerContent = content.toLowerCase();
    
    return {
      professional: this.calculateEmotionScore(lowerContent, this.professionalWords),
      confident: this.calculateEmotionScore(lowerContent, ['säker', 'trygg', 'erfaren', 'kompetent']),
      enthusiastic: this.calculateEmotionScore(lowerContent, ['entusiastisk', 'ivrig', 'passionerad', 'motiverad']),
      formal: this.calculateEmotionScore(lowerContent, ['formell', 'respektfull', 'artigt', 'korrekt']),
      creative: this.calculateEmotionScore(lowerContent, ['kreativ', 'innovativ', 'nytänkande', 'originell'])
    };
  }

  private calculateEmotionScore(content: string, keywords: string[]): number {
    let score = 0;
    keywords.forEach(keyword => {
      if (content.includes(keyword)) score++;
    });
    return Math.min(score / keywords.length, 1);
  }

  private calculateConfidence(content: string, sentiment: string): number {
    // Simple confidence based on content length and keyword density
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 50) return 0.5;
    if (wordCount > 500) return 0.9;
    return 0.7;
  }

  private extractKeyPhrases(content: string): string[] {
    // Extract important phrases (simplified - in production would use NLP library)
    const phrases: string[] = [];
    
    // Extract phrases with professional keywords
    const professionalPatterns = [
      /\b\d+\s*års?\s*erfarenhet\b/gi,
      /\bansvarig för\s+[\w\s]+/gi,
      /\blett\s+[\w\s]+team\b/gi,
      /\butvecklat\s+[\w\s]+/gi,
      /\bimplementerat\s+[\w\s]+/gi
    ];

    professionalPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) phrases.push(...matches);
    });

    return phrases.slice(0, 10); // Return top 10 phrases
  }

  async batchAnalyze(contentType: 'letters' | 'cvs'): Promise<SentimentAnalysis[]> {
    const table = contentType === 'letters' ? 'letters' : 'cv_texts';
    const contentField = contentType === 'letters' ? 'content' : 'cv_text';
    
    const { data, error } = await this.supabase
      .from(table)
      .select(`id, ${contentField}`)
      .limit(100);

    if (error || !data) return [];

    const analyses: SentimentAnalysis[] = [];
    for (const item of data) {
      const analysis = await this.analyzeContent(
        item.id,
        (item as any)[contentField],
        contentType === 'letters' ? 'letter' : 'cv'
      );
      analyses.push(analysis);
    }

    return analyses;
  }
}

/**
 * Quality Analyzer
 * Evaluates content quality and provides improvements
 */
export class QualityAnalyzer {
  private supabase;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async analyzeQuality(contentId: string, content: string, jobDescription?: string): Promise<QualityAnalysis> {
    const qualityScore = this.calculateQualityScore(content);
    const readabilityScore = this.calculateReadability(content);
    const atsScore = this.calculateATSCompatibility(content, jobDescription);
    const improvements = this.identifyImprovements(content, jobDescription);
    const { strengths, weaknesses } = this.identifyStrengthsWeaknesses(content);

    return {
      content_id: contentId,
      quality_score: qualityScore,
      readability_score: readabilityScore,
      ats_compatibility: atsScore,
      improvements,
      strengths,
      weaknesses
    };
  }

  private calculateQualityScore(content: string): number {
    let score = 0.5; // Base score

    // Check for various quality indicators
    const wordCount = content.split(/\s+/).length;
    
    // Ideal length
    if (wordCount >= 200 && wordCount <= 500) score += 0.1;
    
    // Check for quantifiable achievements
    if (/\d+\s*%/.test(content)) score += 0.1; // Percentages
    if (/\d+\s*(år|månader)/.test(content)) score += 0.1; // Time periods
    if (/\d+\s*(personer|anställda|team)/.test(content)) score += 0.05; // Team sizes
    
    // Check for action verbs (Swedish)
    const actionVerbs = ['ledde', 'utvecklade', 'implementerade', 'skapade', 'förbättrade', 'ökade', 'minskade'];
    actionVerbs.forEach(verb => {
      if (content.toLowerCase().includes(verb)) score += 0.02;
    });

    // Check for structure (paragraphs)
    const paragraphs = content.split(/\n\n/).filter(p => p.trim().length > 0);
    if (paragraphs.length >= 3 && paragraphs.length <= 5) score += 0.1;

    return Math.min(score, 1);
  }

  private calculateReadability(content: string): number {
    // Simplified Flesch Reading Ease adapted for Swedish
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const syllables = this.countSyllables(content);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Modified Flesch formula for Swedish
    const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
    
    // Normalize to 0-1 scale
    return Math.max(0, Math.min(score / 100, 1));
  }

  private countSyllables(text: string): number {
    // Simplified syllable counting for Swedish
    const words = text.toLowerCase().split(/\s+/);
    let totalSyllables = 0;

    words.forEach(word => {
      // Count vowel groups as syllables
      const vowelGroups = word.match(/[aeiouåäö]+/g);
      totalSyllables += vowelGroups ? vowelGroups.length : 1;
    });

    return totalSyllables;
  }

  private calculateATSCompatibility(content: string, jobDescription?: string): number {
    let score = 0.7; // Base score

    // Check for ATS-friendly formatting
    if (!/<[^>]*>/.test(content)) score += 0.1; // No HTML tags
    if (!/[^\x00-\x7F]/.test(content.replace(/[åäöÅÄÖ]/g, ''))) score += 0.05; // Mostly ASCII

    // Check for keyword matching if job description provided
    if (jobDescription) {
      const contentWords = content.toLowerCase().split(/\s+/);
      const jobWords = jobDescription.toLowerCase().split(/\s+/);
      
      // Find common keywords
      const commonWords = jobWords.filter(word => 
        word.length > 4 && contentWords.includes(word)
      );
      
      const matchRate = commonWords.length / Math.min(jobWords.length, 20);
      score += matchRate * 0.15;
    }

    return Math.min(score, 1);
  }

  private identifyImprovements(content: string, jobDescription?: string): QualityImprovement[] {
    const improvements: QualityImprovement[] = [];

    // Check content length
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 200) {
      improvements.push({
        type: 'length',
        description: 'Innehållet är för kort',
        priority: 'high',
        suggestion: 'Utöka innehållet till minst 200 ord för bättre genomslag'
      });
    } else if (wordCount > 600) {
      improvements.push({
        type: 'length',
        description: 'Innehållet är för långt',
        priority: 'medium',
        suggestion: 'Förkorta till max 500 ord för bättre läsbarhet'
      });
    }

    // Check for quantifiable achievements
    if (!/\d+/.test(content)) {
      improvements.push({
        type: 'keywords',
        description: 'Saknar kvantifierbara resultat',
        priority: 'high',
        suggestion: 'Lägg till siffror och mätbara resultat (t.ex. "ökade försäljningen med 25%")'
      });
    }

    // Check structure
    const paragraphs = content.split(/\n\n/).filter(p => p.trim().length > 0);
    if (paragraphs.length < 3) {
      improvements.push({
        type: 'structure',
        description: 'Behöver bättre struktur',
        priority: 'medium',
        suggestion: 'Dela upp texten i tydliga stycken för bättre läsbarhet'
      });
    }

    // Check tone
    const formalWords = ['härmed', 'undertecknad', 'vördsamt'];
    const hasFormalWords = formalWords.some(word => content.toLowerCase().includes(word));
    if (hasFormalWords) {
      improvements.push({
        type: 'tone',
        description: 'För formell ton',
        priority: 'low',
        suggestion: 'Använd en mer modern och personlig ton'
      });
    }

    return improvements;
  }

  private identifyStrengthsWeaknesses(content: string): { strengths: string[]; weaknesses: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Check for strengths
    if (/\d+\s*års?\s*erfarenhet/.test(content)) {
      strengths.push('Tydlig erfarenhetsbeskrivning');
    }

    if (/[A-Z][a-z]+\s+[A-Z][a-z]+/.test(content)) {
      strengths.push('Professionell formatering');
    }

    const actionVerbs = ['ledde', 'utvecklade', 'implementerade', 'skapade'];
    if (actionVerbs.some(verb => content.toLowerCase().includes(verb))) {
      strengths.push('Använder starka handlingsverb');
    }

    // Check for weaknesses
    const sentences = content.split(/[.!?]+/);
    const longSentences = sentences.filter(s => s.split(/\s+/).length > 25);
    if (longSentences.length > 2) {
      weaknesses.push('För långa meningar');
    }

    if (content.toLowerCase().split('jag').length > 10) {
      weaknesses.push('För mycket fokus på "jag"');
    }

    if (!/\d+/.test(content)) {
      weaknesses.push('Saknar kvantifierbara resultat');
    }

    return { strengths, weaknesses };
  }
}

/**
 * Keyword Extractor
 * Extracts and analyzes keywords from content
 */
export class KeywordExtractor {
  private supabase;
  
  // Swedish skill keywords by category
  private skillKeywords = {
    technical: ['programmering', 'utveckling', 'databas', 'system', 'teknik', 'IT', 'mjukvara', 'hårdvara'],
    leadership: ['ledare', 'chef', 'ansvarig', 'team', 'projekt', 'koordinera', 'delegera'],
    communication: ['kommunikation', 'presentation', 'förhandling', 'kundkontakt', 'samarbete'],
    analytical: ['analys', 'data', 'statistik', 'forskning', 'utvärdering', 'rapport'],
    creative: ['kreativ', 'design', 'innovation', 'koncept', 'ide', 'utveckling']
  };

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async extractKeywords(contentId: string, content: string, industry?: string): Promise<KeywordExtraction> {
    const keywords = this.identifyKeywords(content);
    const relevance = this.calculateIndustryRelevance(keywords, industry);
    const missingKeywords = this.identifyMissingKeywords(content, industry);
    const density = this.calculateKeywordDensity(content, keywords);

    return {
      content_id: contentId,
      keywords,
      industry_relevance: relevance,
      missing_keywords: missingKeywords,
      keyword_density: density
    };
  }

  private identifyKeywords(content: string): Keyword[] {
    const keywords: Keyword[] = [];
    const words = content.toLowerCase().split(/\s+/);
    const wordFrequency: Record<string, number> = {};

    // Count word frequency
    words.forEach(word => {
      const cleaned = word.replace(/[.,!?;:]/g, '');
      if (cleaned.length > 3) { // Skip short words
        wordFrequency[cleaned] = (wordFrequency[cleaned] || 0) + 1;
      }
    });

    // Identify keywords from predefined categories
    Object.entries(this.skillKeywords).forEach(([category, categoryWords]) => {
      categoryWords.forEach(keyword => {
        if (wordFrequency[keyword]) {
          keywords.push({
            term: keyword,
            frequency: wordFrequency[keyword],
            relevance: this.calculateRelevance(keyword, wordFrequency[keyword], words.length),
            category: this.categorizeKeyword(keyword)
          });
        }
      });
    });

    // Add high-frequency words not in predefined lists
    Object.entries(wordFrequency)
      .filter(([word, freq]) => freq > 2 && !keywords.some(k => k.term === word))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([word, freq]) => {
        keywords.push({
          term: word,
          frequency: freq,
          relevance: this.calculateRelevance(word, freq, words.length),
          category: 'skill'
        });
      });

    return keywords.sort((a, b) => b.relevance - a.relevance);
  }

  private calculateRelevance(keyword: string, frequency: number, totalWords: number): number {
    const tf = frequency / totalWords; // Term frequency
    const idf = Math.log(1000 / (frequency + 1)); // Inverse document frequency (simplified)
    return tf * idf;
  }

  private categorizeKeyword(keyword: string): 'skill' | 'experience' | 'education' | 'soft_skill' | 'industry' {
    const lowerKeyword = keyword.toLowerCase();
    
    if (['universitet', 'högskola', 'examen', 'utbildning'].some(edu => lowerKeyword.includes(edu))) {
      return 'education';
    }
    
    if (['år', 'erfarenhet', 'arbetat', 'anställd'].some(exp => lowerKeyword.includes(exp))) {
      return 'experience';
    }
    
    if (['kommunikation', 'ledarskap', 'samarbete', 'flexibel'].some(soft => lowerKeyword.includes(soft))) {
      return 'soft_skill';
    }
    
    if (['bransch', 'sektor', 'industri', 'marknad'].some(ind => lowerKeyword.includes(ind))) {
      return 'industry';
    }
    
    return 'skill';
  }

  private calculateIndustryRelevance(keywords: Keyword[], industry?: string): number {
    if (!industry) return 0.5;

    // Industry-specific keyword maps (simplified)
    const industryKeywords: Record<string, string[]> = {
      'tech': ['programmering', 'utveckling', 'agile', 'scrum', 'databas', 'api'],
      'finance': ['ekonomi', 'budget', 'analys', 'rapportering', 'revision'],
      'healthcare': ['vård', 'patient', 'medicin', 'hälsa', 'behandling'],
      'retail': ['försäljning', 'kund', 'butik', 'lager', 'service']
    };

    const relevantKeywords = industryKeywords[industry.toLowerCase()] || [];
    const matchCount = keywords.filter(k => 
      relevantKeywords.some(rk => k.term.includes(rk))
    ).length;

    return Math.min(matchCount / relevantKeywords.length, 1);
  }

  private identifyMissingKeywords(content: string, industry?: string): string[] {
    if (!industry) return [];

    const industryEssentials: Record<string, string[]> = {
      'tech': ['agile', 'git', 'cloud', 'api', 'databas'],
      'finance': ['excel', 'budget', 'analys', 'rapportering'],
      'healthcare': ['patient', 'vård', 'säkerhet', 'dokumentation'],
      'retail': ['kund', 'försäljning', 'service', 'lager']
    };

    const essentials = industryEssentials[industry.toLowerCase()] || [];
    const contentLower = content.toLowerCase();

    return essentials.filter(keyword => !contentLower.includes(keyword));
  }

  private calculateKeywordDensity(content: string, keywords: Keyword[]): Record<string, number> {
    const totalWords = content.split(/\s+/).length;
    const density: Record<string, number> = {};

    keywords.forEach(keyword => {
      density[keyword.term] = (keyword.frequency / totalWords) * 100;
    });

    return density;
  }
}

/**
 * Content Categorizer
 * Automatically categorizes content by industry and job level
 */
export class ContentCategorizer {
  private supabase;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async categorizeContent(contentId: string, content: string): Promise<ContentCategorization> {
    const industry = this.identifyIndustry(content);
    const jobLevel = this.identifyJobLevel(content);
    const categories = this.identifyCategories(content);

    return {
      content_id: contentId,
      primary_category: categories[0] || 'general',
      secondary_categories: categories.slice(1),
      industry,
      job_level: jobLevel,
      confidence: this.calculateConfidence(content, industry, jobLevel)
    };
  }

  private identifyIndustry(content: string): string {
    const industries = {
      'IT/Tech': ['programmering', 'utvecklare', 'software', 'databas', 'system', 'IT'],
      'Finance': ['ekonomi', 'finans', 'bank', 'redovisning', 'budget'],
      'Healthcare': ['vård', 'sjukvård', 'patient', 'medicin', 'hälsa'],
      'Education': ['utbildning', 'lärare', 'pedagogik', 'undervisning', 'skola'],
      'Retail': ['butik', 'försäljning', 'handel', 'kund', 'service'],
      'Manufacturing': ['produktion', 'tillverkning', 'fabrik', 'kvalitet', 'process']
    };

    let bestMatch = 'General';
    let bestScore = 0;

    Object.entries(industries).forEach(([industry, keywords]) => {
      const score = keywords.filter(keyword => 
        content.toLowerCase().includes(keyword)
      ).length;
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = industry;
      }
    });

    return bestMatch;
  }

  private identifyJobLevel(content: string): 'entry' | 'mid' | 'senior' | 'executive' {
    const contentLower = content.toLowerCase();

    // Check for executive indicators
    if (/vd|ceo|cto|cfo|director|direktör/.test(contentLower)) {
      return 'executive';
    }

    // Check for senior indicators
    if (/senior|chef|ledare|ansvarig|expert|specialist/.test(contentLower)) {
      return 'senior';
    }

    // Check years of experience
    const yearsMatch = contentLower.match(/(\d+)\s*års?\s*erfarenhet/);
    if (yearsMatch) {
      const years = parseInt(yearsMatch[1]);
      if (years >= 10) return 'senior';
      if (years >= 3) return 'mid';
    }

    // Check for entry-level indicators
    if (/nyexaminerad|praktik|trainee|junior|assistent/.test(contentLower)) {
      return 'entry';
    }

    return 'mid'; // Default to mid-level
  }

  private identifyCategories(content: string): string[] {
    const categories: string[] = [];
    
    const categoryKeywords = {
      'Technical': ['teknik', 'programmering', 'utveckling', 'system'],
      'Management': ['ledning', 'chef', 'ansvar', 'team'],
      'Sales': ['försäljning', 'kund', 'affär', 'sälja'],
      'Creative': ['design', 'kreativ', 'skapande', 'innovation'],
      'Administrative': ['administration', 'koordinera', 'organisera', 'planera'],
      'Analytical': ['analys', 'data', 'rapport', 'utvärdering']
    };

    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      if (keywords.some(keyword => content.toLowerCase().includes(keyword))) {
        categories.push(category);
      }
    });

    return categories.length > 0 ? categories : ['General'];
  }

  private calculateConfidence(content: string, industry: string, jobLevel: string): number {
    // Base confidence on content length and keyword matches
    const wordCount = content.split(/\s+/).length;
    let confidence = 0.5;

    if (wordCount > 100) confidence += 0.2;
    if (industry !== 'General') confidence += 0.15;
    if (jobLevel !== 'mid') confidence += 0.15; // Specific level identified

    return Math.min(confidence, 1);
  }
}

/**
 * Main NLP Analytics Orchestrator
 */
export class NLPAnalyticsEngine {
  private sentimentAnalyzer: SentimentAnalyzer;
  private qualityAnalyzer: QualityAnalyzer;
  private keywordExtractor: KeywordExtractor;
  private contentCategorizer: ContentCategorizer;

  constructor() {
    this.sentimentAnalyzer = new SentimentAnalyzer();
    this.qualityAnalyzer = new QualityAnalyzer();
    this.keywordExtractor = new KeywordExtractor();
    this.contentCategorizer = new ContentCategorizer();
  }

  async analyzeContent(contentId: string, content: string, type: 'letter' | 'cv', jobDescription?: string) {
    const [sentiment, quality, keywords, categorization] = await Promise.all([
      this.sentimentAnalyzer.analyzeContent(contentId, content, type),
      this.qualityAnalyzer.analyzeQuality(contentId, content, jobDescription),
      this.keywordExtractor.extractKeywords(contentId, content),
      this.contentCategorizer.categorizeContent(contentId, content)
    ]);

    return {
      content_id: contentId,
      type,
      sentiment,
      quality,
      keywords,
      categorization,
      overall_score: this.calculateOverallScore(sentiment, quality, keywords),
      recommendations: this.generateRecommendations(sentiment, quality, keywords, categorization),
      analyzed_at: new Date().toISOString()
    };
  }

  private calculateOverallScore(
    sentiment: SentimentAnalysis,
    quality: QualityAnalysis,
    keywords: KeywordExtraction
  ): number {
    const sentimentScore = sentiment.sentiment === 'positive' ? 0.3 : sentiment.sentiment === 'neutral' ? 0.2 : 0.1;
    const qualityScore = quality.quality_score * 0.4;
    const keywordScore = Math.min(keywords.keywords.length / 20, 1) * 0.3;
    
    return sentimentScore + qualityScore + keywordScore;
  }

  private generateRecommendations(
    sentiment: SentimentAnalysis,
    quality: QualityAnalysis,
    keywords: KeywordExtraction,
    categorization: ContentCategorization
  ): string[] {
    const recommendations: string[] = [];

    // Sentiment-based recommendations
    if (sentiment.sentiment === 'negative') {
      recommendations.push('Använd mer positiv och självsäker ton');
    }

    // Quality-based recommendations
    if (quality.quality_score < 0.7) {
      recommendations.push(...quality.improvements.slice(0, 3).map(i => i.suggestion));
    }

    // Keyword-based recommendations
    if (keywords.missing_keywords.length > 0) {
      recommendations.push(`Inkludera relevanta nyckelord: ${keywords.missing_keywords.slice(0, 3).join(', ')}`);
    }

    // Category-based recommendations
    if (categorization.job_level === 'entry') {
      recommendations.push('Fokusera på utbildning och potential snarare än erfarenhet');
    } else if (categorization.job_level === 'senior') {
      recommendations.push('Betona ledarskap och strategiska resultat');
    }

    return recommendations;
  }

  async generateBatchInsights(contentType: 'letters' | 'cvs', limit: number = 100) {
    const analyses = await this.sentimentAnalyzer.batchAnalyze(contentType);
    
    // Aggregate insights
    const positiveCount = analyses.filter(a => a.sentiment === 'positive').length;
    const negativeCount = analyses.filter(a => a.sentiment === 'negative').length;
    const neutralCount = analyses.filter(a => a.sentiment === 'neutral').length;

    const avgEmotions = {
      professional: 0,
      confident: 0,
      enthusiastic: 0,
      formal: 0,
      creative: 0
    };

    analyses.forEach(analysis => {
      Object.keys(avgEmotions).forEach(emotion => {
        avgEmotions[emotion as keyof EmotionScores] += analysis.emotions[emotion as keyof EmotionScores];
      });
    });

    Object.keys(avgEmotions).forEach(emotion => {
      avgEmotions[emotion as keyof EmotionScores] /= analyses.length;
    });

    return {
      total_analyzed: analyses.length,
      sentiment_distribution: {
        positive: positiveCount / analyses.length,
        negative: negativeCount / analyses.length,
        neutral: neutralCount / analyses.length
      },
      average_emotions: avgEmotions,
      common_phrases: this.extractCommonPhrases(analyses),
      insights: this.generateAggregateInsights(analyses, avgEmotions)
    };
  }

  private extractCommonPhrases(analyses: SentimentAnalysis[]): string[] {
    const phraseCount: Record<string, number> = {};
    
    analyses.forEach(analysis => {
      analysis.key_phrases.forEach(phrase => {
        phraseCount[phrase] = (phraseCount[phrase] || 0) + 1;
      });
    });

    return Object.entries(phraseCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([phrase]) => phrase);
  }

  private generateAggregateInsights(analyses: SentimentAnalysis[], avgEmotions: EmotionScores): string[] {
    const insights: string[] = [];

    if (avgEmotions.professional > 0.7) {
      insights.push('Användare skriver generellt mycket professionellt');
    }

    if (avgEmotions.confident < 0.5) {
      insights.push('Många användare verkar osäkra - överväg att lägga till självförtroende-byggande tips');
    }

    const positiveRate = analyses.filter(a => a.sentiment === 'positive').length / analyses.length;
    if (positiveRate > 0.7) {
      insights.push('Hög andel positiv ton i genererat innehåll');
    } else if (positiveRate < 0.4) {
      insights.push('Låg andel positiv ton - justera AI-prompts för mer optimistisk output');
    }

    return insights;
  }
}