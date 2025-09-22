/**
 * Storage Sanitizer - Cleans corrupted storage data before Supabase initialization
 * This must run BEFORE any Supabase code to prevent JSON parsing errors
 */

// List of Supabase-related storage keys to check
const SUPABASE_STORAGE_KEYS = [
  'supabase.auth.token',
  'sb-auth-token',
  'sb-refresh-token',
  'sb-access-token'
];

// Patterns that indicate Supabase storage keys
const SUPABASE_KEY_PATTERNS = [
  /^sb-.*-auth-token$/,
  /^supabase\.auth\..*/,
  /^sb-.*-auth-token-code-verifier$/
];

/**
 * Check if a value is valid JSON
 */
function isValidJSON(value: string): boolean {
  if (!value || typeof value !== 'string') return false;

  // Check for common invalid patterns
  if (value === 'undefined' || value === 'null' || value === '') return false;

  // Check if it looks like JSON
  const trimmed = value.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[') && trimmed !== 'null' && trimmed !== 'true' && trimmed !== 'false') {
    // Not JSON-like, but might be a valid string token
    return true;
  }

  try {
    JSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clean a single storage item
 */
function cleanStorageItem(storage: Storage, key: string): boolean {
  try {
    const value = storage.getItem(key);

    if (value === null) return true;

    // Check for common corruption patterns
    if (value === 'undefined' || value === '' || value === '""' || value === "''") {
      storage.removeItem(key);
      return false;
    }

    // For Supabase keys, validate JSON structure
    const isSupabaseKey = SUPABASE_KEY_PATTERNS.some(pattern => pattern.test(key)) ||
                          SUPABASE_STORAGE_KEYS.includes(key);

    if (isSupabaseKey) {
      // Special handling for base64 encoded values
      if (value.startsWith('base64-')) {
        // This is likely a valid Supabase token, keep it
        return true;
      }

      // Check if it's JSON
      const trimmed = value.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        if (!isValidJSON(value)) {
          storage.removeItem(key);
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    // If we can't even read it, remove it
    try {
      storage.removeItem(key);
    } catch {
      // Ignore removal errors
    }
    return false;
  }
}

/**
 * Clean all storage locations
 */
function cleanAllStorage(): void {
  if (typeof window === 'undefined') return;

  let cleanedCount = 0;

  // Clean localStorage
  if (window.localStorage) {
    try {
      const keys = Object.keys(window.localStorage);
      for (const key of keys) {
        if (!cleanStorageItem(window.localStorage, key)) {
          cleanedCount++;
        }
      }
    } catch {
      // Ignore errors
    }
  }

  // Clean sessionStorage
  if (window.sessionStorage) {
    try {
      const keys = Object.keys(window.sessionStorage);
      for (const key of keys) {
        if (!cleanStorageItem(window.sessionStorage, key)) {
          cleanedCount++;
        }
      }
    } catch {
      // Ignore errors
    }
  }

  // Only log if we actually cleaned something, and only in development
  if (cleanedCount > 0 && process.env.NODE_ENV === 'development') {
    console.log(`[Storage Sanitizer] Cleaned ${cleanedCount} corrupted storage items`);
  }
}

/**
 * Patch storage methods to prevent future corruption
 */
function patchStorageMethods(): void {
  if (typeof window === 'undefined') return;

  // Patch localStorage
  if (window.localStorage) {
    const originalSetItem = window.localStorage.setItem;
    const originalGetItem = window.localStorage.getItem;

    window.localStorage.setItem = function(key: string, value: string) {
      // Prevent setting invalid values
      if (value === 'undefined' || value === undefined as any) {
        this.removeItem(key);
        return;
      }

      try {
        return originalSetItem.call(this, key, value);
      } catch (e) {
        // Silently fail
      }
    };

    window.localStorage.getItem = function(key: string) {
      try {
        const value = originalGetItem.call(this, key);

        // Return null for invalid values
        if (value === 'undefined' || value === '') {
          this.removeItem(key);
          return null;
        }

        return value;
      } catch (e) {
        return null;
      }
    };
  }

  // Patch sessionStorage similarly
  if (window.sessionStorage) {
    const originalSetItem = window.sessionStorage.setItem;
    const originalGetItem = window.sessionStorage.getItem;

    window.sessionStorage.setItem = function(key: string, value: string) {
      // Prevent setting invalid values
      if (value === 'undefined' || value === undefined as any) {
        this.removeItem(key);
        return;
      }

      try {
        return originalSetItem.call(this, key, value);
      } catch (e) {
        // Silently fail
      }
    };

    window.sessionStorage.getItem = function(key: string) {
      try {
        const value = originalGetItem.call(this, key);

        // Return null for invalid values
        if (value === 'undefined' || value === '') {
          this.removeItem(key);
          return null;
        }

        return value;
      } catch (e) {
        return null;
      }
    };
  }
}

/**
 * Initialize storage sanitization
 * This should be called as early as possible in the application lifecycle
 */
export function initializeStorageSanitizer(): void {
  // Clean existing corrupted data
  cleanAllStorage();

  // Patch storage methods to prevent future corruption
  patchStorageMethods();
}

// Auto-initialize if this is the browser
if (typeof window !== 'undefined') {
  initializeStorageSanitizer();
}