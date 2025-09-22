/**
 * Centralized Storage Initialization
 * This file ensures all storage-related fixes are applied before Supabase initializes
 */

// Import and initialize storage sanitizer first
import { initializeStorageSanitizer } from './storage-sanitizer';

// Initialize immediately
if (typeof window !== 'undefined') {
  initializeStorageSanitizer();
}

// Export for explicit initialization if needed
export { initializeStorageSanitizer };

// Export a flag to confirm initialization
export const storageInitialized = true;