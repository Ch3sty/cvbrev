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

      // Handle common invalid values
      if (!item || item === 'undefined' || item === 'null' || item === '') {
        if (item !== null) {
          this.storage.removeItem(key);
        }
        return null;
      }

      // If it looks like JSON, try to validate it
      if (item.startsWith('{') || item.startsWith('[')) {
        try {
          JSON.parse(item);
        } catch (e) {
          // Invalid JSON, remove the corrupted item silently
          this.storage.removeItem(key);
          return null;
        }
      }

      return item;
    } catch (error) {
      // Silently handle errors
      return null;
    }
  }

  setItem(key: string, value: string): void {
    if (!this.storage) return;

    try {
      // Prevent storing invalid values
      if (value === 'undefined' || value === undefined as any) {
        this.storage.removeItem(key);
        return;
      }

      // Validate JSON before storing
      if (value && (value.startsWith('{') || value.startsWith('['))) {
        try {
          JSON.parse(value);
        } catch (e) {
          // Don't store invalid JSON
          return;
        }
      }

      this.storage.setItem(key, value);
    } catch (error) {
      // Silently handle errors
    }
  }

  removeItem(key: string): void {
    if (!this.storage) return;

    try {
      this.storage.removeItem(key);
    } catch (error) {
      // Silently handle errors
    }
  }
}

// Create a global instance
export const safeStorage = new SafeStorageAdapter();

// Enhanced monkey-patch for localStorage and sessionStorage
if (typeof window !== 'undefined') {
  // Patch localStorage
  const originalLocalGetItem = window.localStorage.getItem;
  const originalLocalSetItem = window.localStorage.setItem;

  window.localStorage.getItem = function(key: string) {
    try {
      const value = originalLocalGetItem.call(this, key);

      // Handle invalid values
      if (value === 'undefined' || value === '' || value === 'null') {
        this.removeItem(key);
        return null;
      }

      // Special handling for Supabase auth keys
      if (key && (key.includes('supabase') || key.includes('sb-'))) {
        // Don't parse base64 encoded values
        if (value && value.startsWith('base64-')) {
          return value;
        }

        if (value && (value.startsWith('{') || value.startsWith('['))) {
          try {
            JSON.parse(value);
          } catch (e) {
            // Silently clear corrupted auth token
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
      // Prevent storing invalid values
      if (value === 'undefined' || value === undefined as any) {
        this.removeItem(key);
        return;
      }

      // Validate JSON for Supabase keys
      if (key && (key.includes('supabase') || key.includes('sb-'))) {
        // Don't validate base64 encoded values
        if (value && value.startsWith('base64-')) {
          return originalLocalSetItem.call(this, key, value);
        }

        if (value && (value.startsWith('{') || value.startsWith('['))) {
          try {
            JSON.parse(value);
          } catch (e) {
            // Don't store invalid JSON
            return;
          }
        }
      }

      return originalLocalSetItem.call(this, key, value);
    } catch (e) {
      // Silently handle errors
    }
  };

  // Also patch sessionStorage
  const originalSessionGetItem = window.sessionStorage.getItem;
  const originalSessionSetItem = window.sessionStorage.setItem;

  window.sessionStorage.getItem = function(key: string) {
    try {
      const value = originalSessionGetItem.call(this, key);

      // Handle invalid values
      if (value === 'undefined' || value === '' || value === 'null') {
        this.removeItem(key);
        return null;
      }

      return value;
    } catch (e) {
      return null;
    }
  };

  window.sessionStorage.setItem = function(key: string, value: string) {
    try {
      // Prevent storing invalid values
      if (value === 'undefined' || value === undefined as any) {
        this.removeItem(key);
        return;
      }

      return originalSessionSetItem.call(this, key, value);
    } catch (e) {
      // Silently handle errors
    }
  };
}