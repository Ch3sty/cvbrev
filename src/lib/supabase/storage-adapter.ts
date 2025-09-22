// Custom storage adapter for Supabase Auth with error handling
class SafeStorageAdapter {
  private storage: Storage | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.storage = window.localStorage;
    }
  }

  getItem(key: string): string | null {
    if (!this.storage) return null;

    try {
      const item = this.storage.getItem(key);

      // If it looks like JSON, try to validate it
      if (item && (item.startsWith('{') || item.startsWith('['))) {
        try {
          JSON.parse(item);
        } catch (e) {
          // Invalid JSON, remove the corrupted item
          console.warn(`Removing corrupted storage item: ${key}`);
          this.storage.removeItem(key);
          return null;
        }
      }

      return item;
    } catch (error) {
      console.warn('Storage getItem error:', error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    if (!this.storage) return;

    try {
      // Validate JSON before storing
      if (value && (value.startsWith('{') || value.startsWith('['))) {
        try {
          JSON.parse(value);
        } catch (e) {
          console.warn(`Attempting to store invalid JSON for key: ${key}`);
          return;
        }
      }

      this.storage.setItem(key, value);
    } catch (error) {
      console.warn('Storage setItem error:', error);
    }
  }

  removeItem(key: string): void {
    if (!this.storage) return;

    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.warn('Storage removeItem error:', error);
    }
  }
}

// Create a global instance
export const safeStorage = new SafeStorageAdapter();

// Monkey-patch localStorage if in browser
if (typeof window !== 'undefined') {
  const originalGetItem = window.localStorage.getItem;
  const originalSetItem = window.localStorage.setItem;

  window.localStorage.getItem = function(key: string) {
    try {
      const value = originalGetItem.call(this, key);

      // Special handling for Supabase auth keys
      if (key && key.includes('supabase.auth.token')) {
        if (value && (value.startsWith('{') || value.startsWith('['))) {
          try {
            JSON.parse(value);
          } catch (e) {
            console.warn(`Clearing corrupted auth token: ${key}`);
            this.removeItem(key);
            return null;
          }
        }
      }

      return value;
    } catch (e) {
      return null;
    }
  };

  window.localStorage.setItem = function(key: string, value: string) {
    try {
      // Validate JSON for Supabase keys
      if (key && key.includes('supabase.auth.token')) {
        if (value && (value.startsWith('{') || value.startsWith('['))) {
          try {
            JSON.parse(value);
          } catch (e) {
            console.warn(`Blocked invalid JSON for key: ${key}`);
            return;
          }
        }
      }

      return originalSetItem.call(this, key, value);
    } catch (e) {
      console.warn('localStorage.setItem error:', e);
    }
  };
}