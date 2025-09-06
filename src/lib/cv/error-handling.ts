// Centralized error handling for CV template system
import type { CVTemplateType, TemplateEvent } from './types';

export enum TemplateErrorCode {
  // Loading errors
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  TEMPLATE_LOAD_FAILED = 'TEMPLATE_LOAD_FAILED',
  TEMPLATE_PARSE_ERROR = 'TEMPLATE_PARSE_ERROR',
  TEMPLATE_TIMEOUT = 'TEMPLATE_TIMEOUT',
  
  // Generation errors
  GENERATION_FAILED = 'GENERATION_FAILED',
  INVALID_CV_DATA = 'INVALID_CV_DATA',
  CUSTOMIZATION_ERROR = 'CUSTOMIZATION_ERROR',
  EXPORT_FAILED = 'EXPORT_FAILED',
  
  // Preview errors
  PREVIEW_GENERATION_FAILED = 'PREVIEW_GENERATION_FAILED',
  PREVIEW_CACHE_ERROR = 'PREVIEW_CACHE_ERROR',
  PREVIEW_FORMAT_UNSUPPORTED = 'PREVIEW_FORMAT_UNSUPPORTED',
  
  // System errors
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

export class TemplateError extends Error {
  readonly code: TemplateErrorCode;
  readonly templateId?: CVTemplateType;
  readonly details?: Record<string, any>;
  readonly timestamp: Date;
  readonly retriable: boolean;

  constructor(
    code: TemplateErrorCode,
    message: string,
    options: {
      templateId?: CVTemplateType;
      details?: Record<string, any>;
      cause?: Error;
      retriable?: boolean;
    } = {}
  ) {
    super(message);
    this.name = 'TemplateError';
    this.code = code;
    this.templateId = options.templateId;
    this.details = options.details;
    this.timestamp = new Date();
    this.retriable = options.retriable ?? false;
    this.cause = options.cause;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      templateId: this.templateId,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      retriable: this.retriable,
      stack: this.stack
    };
  }
}

// User-friendly error messages
const ERROR_MESSAGES: Record<TemplateErrorCode, { 
  user: string; 
  technical: string; 
  suggestions: string[] 
}> = {
  [TemplateErrorCode.TEMPLATE_NOT_FOUND]: {
    user: 'Den valda mallen kunde inte hittas',
    technical: 'Template not found in registry',
    suggestions: ['Kontrollera att mallen existerar', 'Försök ladda om sidan']
  },
  [TemplateErrorCode.TEMPLATE_LOAD_FAILED]: {
    user: 'Mallen kunde inte laddas',
    technical: 'Failed to load template from source',
    suggestions: ['Kontrollera internetanslutningen', 'Försök igen om en stund']
  },
  [TemplateErrorCode.TEMPLATE_PARSE_ERROR]: {
    user: 'Ett fel uppstod vid bearbetning av mallen',
    technical: 'Template parsing failed',
    suggestions: ['Kontakta support om problemet kvarstår']
  },
  [TemplateErrorCode.TEMPLATE_TIMEOUT]: {
    user: 'Mallen tog för lång tid att ladda',
    technical: 'Template loading timed out',
    suggestions: ['Kontrollera internetanslutningen', 'Försök igen']
  },
  [TemplateErrorCode.GENERATION_FAILED]: {
    user: 'CV-genereringen misslyckades',
    technical: 'PDF generation failed',
    suggestions: ['Kontrollera CV-innehållet', 'Försök med en annan mall']
  },
  [TemplateErrorCode.INVALID_CV_DATA]: {
    user: 'CV-data är ofullständig eller felaktig',
    technical: 'CV data validation failed',
    suggestions: ['Kontrollera att alla obligatoriska fält är ifyllda', 'Ladda upp CV:t igen']
  },
  [TemplateErrorCode.CUSTOMIZATION_ERROR]: {
    user: 'Anpassningsinställningarna kunde inte tillämpas',
    technical: 'Template customization failed',
    suggestions: ['Återställ till standardinställningar', 'Försök med enklare anpassningar']
  },
  [TemplateErrorCode.EXPORT_FAILED]: {
    user: 'Exporten misslyckades',
    technical: 'File export failed',
    suggestions: ['Kontrollera lagringsutrymme', 'Försök igen']
  },
  [TemplateErrorCode.PREVIEW_GENERATION_FAILED]: {
    user: 'Förhandsvisningen kunde inte skapas',
    technical: 'Preview generation failed',
    suggestions: ['Försök ladda om förhandsvisningen']
  },
  [TemplateErrorCode.PREVIEW_CACHE_ERROR]: {
    user: 'Ett fel uppstod med förhandsvisningen',
    technical: 'Preview cache error',
    suggestions: ['Rensa cache', 'Ladda om sidan']
  },
  [TemplateErrorCode.PREVIEW_FORMAT_UNSUPPORTED]: {
    user: 'Förhandsvisningsformatet stöds inte',
    technical: 'Unsupported preview format',
    suggestions: ['Välj ett annat format']
  },
  [TemplateErrorCode.MEMORY_LIMIT_EXCEEDED]: {
    user: 'Systemet är överbelastat',
    technical: 'Memory limit exceeded',
    suggestions: ['Försök igen om en stund', 'Använd mindre filer']
  },
  [TemplateErrorCode.RATE_LIMIT_EXCEEDED]: {
    user: 'För många förfrågningar, försök igen om en stund',
    technical: 'Rate limit exceeded',
    suggestions: ['Vänta en minut och försök igen']
  },
  [TemplateErrorCode.NETWORK_ERROR]: {
    user: 'Nätverksfel uppstod',
    technical: 'Network connection failed',
    suggestions: ['Kontrollera internetanslutningen', 'Försök igen']
  },
  [TemplateErrorCode.PERMISSION_DENIED]: {
    user: 'Du har inte behörighet för denna åtgärd',
    technical: 'Permission denied',
    suggestions: ['Logga in igen', 'Kontakta support']
  }
};

export class TemplateErrorHandler {
  private static instance: TemplateErrorHandler;
  private errorLog: TemplateError[] = [];
  private maxLogSize = 100;
  private eventHandlers: Array<(error: TemplateError) => void> = [];

  static getInstance(): TemplateErrorHandler {
    if (!this.instance) {
      this.instance = new TemplateErrorHandler();
    }
    return this.instance;
  }

  // Log error and notify handlers
  handleError(error: TemplateError): void {
    // Add to error log
    this.errorLog.push(error);
    
    // Maintain log size limit
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Notify handlers
    this.eventHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error handler failed:', handlerError);
      }
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Template Error:', error.toJSON());
    }
  }

  // Create standardized error
  createError(
    code: TemplateErrorCode,
    templateId?: CVTemplateType,
    details?: Record<string, any>,
    cause?: Error
  ): TemplateError {
    const errorInfo = ERROR_MESSAGES[code];
    return new TemplateError(code, errorInfo.technical, {
      templateId,
      details,
      cause,
      retriable: this.isRetriable(code)
    });
  }

  // Get user-friendly error message
  getUserMessage(error: TemplateError): { message: string; suggestions: string[] } {
    const errorInfo = ERROR_MESSAGES[error.code];
    return {
      message: errorInfo.user,
      suggestions: errorInfo.suggestions
    };
  }

  // Check if error is retriable
  private isRetriable(code: TemplateErrorCode): boolean {
    const retriableCodes = [
      TemplateErrorCode.TEMPLATE_TIMEOUT,
      TemplateErrorCode.NETWORK_ERROR,
      TemplateErrorCode.RATE_LIMIT_EXCEEDED,
      TemplateErrorCode.PREVIEW_GENERATION_FAILED,
      TemplateErrorCode.GENERATION_FAILED
    ];
    return retriableCodes.includes(code);
  }

  // Retry logic with exponential backoff
  async retry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (error instanceof TemplateError && !error.retriable) {
          throw error;
        }

        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  // Add error handler
  onError(handler: (error: TemplateError) => void): () => void {
    this.eventHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      const index = this.eventHandlers.indexOf(handler);
      if (index > -1) {
        this.eventHandlers.splice(index, 1);
      }
    };
  }

  // Get error statistics
  getErrorStats(): {
    total: number;
    byCode: Record<TemplateErrorCode, number>;
    recentErrors: TemplateError[];
  } {
    const byCode: Record<TemplateErrorCode, number> = {} as any;
    
    this.errorLog.forEach(error => {
      byCode[error.code] = (byCode[error.code] || 0) + 1;
    });

    return {
      total: this.errorLog.length,
      byCode,
      recentErrors: this.errorLog.slice(-10)
    };
  }

  // Clear error log
  clearLog(): void {
    this.errorLog = [];
  }
}

// Convenience functions
export const errorHandler = TemplateErrorHandler.getInstance();

export function createTemplateError(
  code: TemplateErrorCode,
  templateId?: CVTemplateType,
  details?: Record<string, any>,
  cause?: Error
): TemplateError {
  return errorHandler.createError(code, templateId, details, cause);
}

export function handleTemplateError(error: TemplateError): void {
  errorHandler.handleError(error);
}

export function getUserErrorMessage(error: TemplateError): { message: string; suggestions: string[] } {
  return errorHandler.getUserMessage(error);
}

// Async wrapper with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  templateId?: CVTemplateType,
  fallback?: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    let templateError: TemplateError;
    
    if (error instanceof TemplateError) {
      templateError = error;
    } else {
      templateError = createTemplateError(
        TemplateErrorCode.GENERATION_FAILED,
        templateId,
        { originalMessage: (error as Error).message },
        error as Error
      );
    }
    
    handleTemplateError(templateError);
    
    if (fallback !== undefined) {
      return fallback;
    }
    
    throw templateError;
  }
}

// Note: React hook for error handling moved to separate client component file
// to avoid server-side rendering issues