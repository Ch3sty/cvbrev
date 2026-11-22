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
 * Nycklarna "setItem" och "getItem" (klicktestet på live 2026-11-22).
 *
 * Här fanns förut patchStorageMethods, som tilldelade nya funktioner till
 * setItem och getItem direkt på window.localStorage och window.sessionStorage. Ett Storage-objekt har en namngiven setter: en tilldelning
 * av en egenskap blir en sparad nyckel med värdet som text, och metoden på
 * prototypen står kvar orörd. Lappningen gjorde alltså ingenting utom att
 * lägga funktionernas källkod i lagringen under namnen setItem och getItem,
 * vid varje sidladdning. Den är borttagen. De nycklar den redan lagt kvar tas
 * bort här, men bara när värdet är en funktions text, så att ingen annans
 * nyckel med samma namn rörs.
 */
const FELSKRIVNA = ['setItem', 'getItem'];

export function rensaFelskrivnaNycklar(storage: Storage): number {
  let antal = 0;
  for (const nyckel of FELSKRIVNA) {
    try {
      const varde = storage.getItem(nyckel);
      if (typeof varde === 'string' && /^\s*function\b/.test(varde)) {
        storage.removeItem(nyckel);
        antal++;
      }
    } catch {
      // Blockerad lagring.
    }
  }
  return antal;
}

function rensaFelskrivna(): void {
  if (typeof window === 'undefined') return;
  for (const typ of ['localStorage', 'sessionStorage'] as const) {
    try {
      const s = window[typ];
      if (s) rensaFelskrivnaNycklar(s);
    } catch {
      // Ignore
    }
  }
}

/**
 * Clean corrupted cookies that might have been set by old auth-helpers
 */
function cleanCorruptedCookies(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    const allCookies = document.cookie.split(';');

    for (const cookie of allCookies) {
      const trimmed = cookie.trim();
      if (!trimmed) continue;

      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;

      const name = trimmed.substring(0, eqIndex).trim();
      const value = trimmed.substring(eqIndex + 1).trim();

      // Check if this is a Supabase auth cookie
      const isSupabaseKey = SUPABASE_KEY_PATTERNS.some(pattern => pattern.test(name)) ||
                            SUPABASE_STORAGE_KEYS.includes(name);

      if (isSupabaseKey) {
        // Check for common corruption patterns
        if (value === 'undefined' || value === 'null' || value === '' ||
            value === '""' || value === "''" || value === '%22%22' ||
            value === '%27%27') {

          // Remove the corrupted cookie
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;

          if (process.env.NODE_ENV === 'development') {
            console.log(`[Storage Sanitizer] Removed corrupted cookie: ${name}`);
          }
        }

        // Check for malformed JSON in cookies
        else if (value.includes('%7B') || value.includes('%5B')) {
          try {
            const decoded = decodeURIComponent(value);
            if (decoded.startsWith('{') || decoded.startsWith('[')) {
              JSON.parse(decoded); // Test if it's valid JSON
            }
          } catch (e) {
            // Invalid JSON, remove the cookie
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;

            if (process.env.NODE_ENV === 'development') {
              console.log(`[Storage Sanitizer] Removed malformed JSON cookie: ${name}`);
            }
          }
        }
      }
    }
  } catch (error) {
    // Ignore errors during cookie cleaning
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Storage Sanitizer] Error cleaning cookies:', error);
    }
  }
}

/**
 * Initialize storage sanitization
 * This should be called as early as possible in the application lifecycle
 */
export function initializeStorageSanitizer(): void {
  // Clean existing corrupted data
  cleanAllStorage();

  // Clean corrupted cookies
  cleanCorruptedCookies();

  // Nycklarna den gamla lappningen lade i lagringen.
  rensaFelskrivna();
}

// Auto-initialize if this is the browser
if (typeof window !== 'undefined') {
  initializeStorageSanitizer();
}