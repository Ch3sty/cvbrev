// Enhanced TypeScript types for CV templates system
import type {
  CVTemplate,
  CVTemplateType,
  CVMetadata,
  CVGenerationOptions,
  CVPersonalInfo,
  CVExperience,
  CVEducation,
  CVSkill,
  CVLanguage
} from './cv-metadata';

export type {
  CVTemplate,
  CVTemplateType,
  CVMetadata,
  CVGenerationOptions,
  CVPersonalInfo,
  CVExperience,
  CVEducation,
  CVSkill,
  CVLanguage
} from './cv-metadata';

// Template loading and caching types
export interface TemplateLoadResult {
  template: CVTemplate;
  fromCache: boolean;
  loadTime: number;
}

export interface TemplateCache {
  get(templateId: CVTemplateType): CVTemplate | undefined;
  set(templateId: CVTemplateType, template: CVTemplate): void;
  has(templateId: CVTemplateType): boolean;
  clear(): void;
  size: number;
}

export interface TemplateLoaderOptions {
  useCache?: boolean;
  timeout?: number;
  retries?: number;
}

export interface TemplateLoadError extends Error {
  templateId: CVTemplateType;
  reason: 'not_found' | 'load_failed' | 'timeout' | 'parse_error';
  originalError?: Error;
}

// Template comparison types
export interface TemplateComparison {
  templateId: CVTemplateType;
  scores: {
    atsCompatible: number;
    visualImpact: number;
    industryFocus: number;
    readability: number;
  };
  strengths: string[];
  weaknesses: string[];
  visualFeatures: string[];
  recommendedFor: 'entry-level' | 'experienced' | 'senior' | 'executive';
}

export interface ComparisonCriteria {
  industryFocus?: string[];
  careerLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  prioritizeATS?: boolean;
  visualPreference?: 'minimal' | 'balanced' | 'creative';
}

// Customization types (extended from component)
export interface BaseTemplateCustomization {
  colorScheme: string;
  fontSize: number;
  spacing: number;
  fontFamily: string;
}

export interface AdvancedCustomization extends BaseTemplateCustomization {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  headerStyle: 'minimal' | 'prominent' | 'creative' | 'executive';
  layoutStyle: 'single-column' | 'two-column' | 'sidebar' | 'modern-grid';
  borderRadius: number;
  shadowIntensity: number;
}

// Preview types
export interface PreviewOptions {
  format: 'html' | 'image' | 'pdf';
  width?: number;
  height?: number;
  quality?: number;
  cacheKey?: string;
}

export interface PreviewResult {
  data: string | Buffer;
  format: string;
  cached: boolean;
  generationTime: number;
  size: number;
}

export interface PreviewCache {
  get(key: string): PreviewResult | undefined;
  set(key: string, result: PreviewResult, ttl?: number): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  size: number;
}

// Analytics and performance types
export interface TemplateUsage {
  templateId: CVTemplateType;
  count: number;
  averageGenerationTime: number;
  successRate: number;
  lastUsed: Date;
}

export interface PerformanceMetrics {
  templateLoadTimes: Map<CVTemplateType, number[]>;
  previewGenerationTimes: Map<CVTemplateType, number[]>;
  cacheHitRate: number;
  errorRate: number;
  memoryUsage: {
    templates: number;
    previews: number;
    total: number;
  };
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  metrics: PerformanceMetrics;
  errors: Array<{
    timestamp: Date;
    error: string;
    templateId?: CVTemplateType;
  }>;
}

// Event types for system monitoring
export type TemplateEvent =
  | { type: 'template_loaded'; templateId: CVTemplateType; loadTime: number; fromCache: boolean }
  | { type: 'template_load_failed'; templateId: CVTemplateType; error: string }
  | { type: 'preview_generated'; templateId: CVTemplateType; format: string; generationTime: number }
  | { type: 'preview_cached'; templateId: CVTemplateType; cacheKey: string }
  | { type: 'customization_applied'; templateId: CVTemplateType; customization: any }
  | { type: 'comparison_performed'; templateIds: CVTemplateType[]; duration: number };

export interface TemplateEventHandler {
  (event: TemplateEvent): void;
}

// API types
export interface TemplateAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId: string;
}

export interface GenerateTemplateRequest {
  templateId: CVTemplateType;
  cvData: CVMetadata;
  customization?: AdvancedCustomization;
  format?: 'pdf' | 'html' | 'image';
  options?: {
    quality?: 'draft' | 'standard' | 'high';
    compression?: boolean;
    watermark?: boolean;
  };
}

export interface GenerateTemplateResponse extends TemplateAPIResponse {
  data?: {
    content: string | Buffer;
    format: string;
    size: number;
    generationTime: number;
    templateUsed: CVTemplateType;
    customizationsApplied: boolean;
  };
}

// Validation types
export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    suggestion?: string;
  }>;
}

export interface CVDataValidator {
  validate(cvData: CVMetadata): ValidationResult;
  validateField(field: string, value: any): ValidationResult;
}

export interface TemplateValidator {
  validate(template: CVTemplate): ValidationResult;
  validateHTML(html: string): ValidationResult;
  validateAccessibility(html: string): ValidationResult;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Template registry type for enhanced type safety
export interface TemplateRegistry {
  readonly templates: ReadonlyMap<CVTemplateType, CVTemplate>;
  get(templateId: CVTemplateType): Promise<CVTemplate>;
  getSync(templateId: CVTemplateType): CVTemplate | undefined;
  preload(templateIds: CVTemplateType[]): Promise<void>;
  register(templateId: CVTemplateType, template: CVTemplate): void;
  unregister(templateId: CVTemplateType): boolean;
  list(): CVTemplateType[];
  clear(): void;
}

// Export utility type helpers
export type TemplateMetadataOnly<T extends CVTemplate> = Omit<T, 'generateHTML'>;

export type AsyncTemplate = Omit<CVTemplate, 'generateHTML'> & {
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => Promise<string>;
};

// Configuration types
export interface TemplateSystemConfig {
  caching: {
    enabled: boolean;
    maxSize: number;
    ttl: number;
  };
  performance: {
    preloadPopular: boolean;
    lazyLoading: boolean;
    bundleSplitting: boolean;
  };
  features: {
    livePreview: boolean;
    templateComparison: boolean;
    advancedCustomization: boolean;
  };
  monitoring: {
    enabled: boolean;
    metricsCollection: boolean;
    errorTracking: boolean;
  };
}