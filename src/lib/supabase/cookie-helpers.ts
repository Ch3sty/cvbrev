// Cookie helpers for Supabase Auth with robust error handling
export const parseCookieValue = (value: string | undefined): any => {
  if (!value) return undefined;

  // Try to decode URI component first
  try {
    value = decodeURIComponent(value);
  } catch (e) {
    // Value might not be URI encoded, continue
  }

  // Check if it looks like JSON
  if (value.startsWith('{') || value.startsWith('[') || value === 'null' || value === 'true' || value === 'false') {
    try {
      return JSON.parse(value);
    } catch (e) {
      // Not valid JSON, return as string
      return value;
    }
  }

  // Check if it's a number
  if (!isNaN(Number(value))) {
    return value;
  }

  // Return as string
  return value;
};

export const stringifyCookieValue = (value: any): string => {
  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value === 'string') {
    return encodeURIComponent(value);
  }

  try {
    return encodeURIComponent(JSON.stringify(value));
  } catch (e) {
    console.warn('Failed to stringify cookie value:', e);
    return '';
  }
};

// Parse cookie string into key-value pairs
export const parseCookies = (cookieString: string): Record<string, string> => {
  const cookies: Record<string, string> = {};

  if (!cookieString) return cookies;

  try {
    const pairs = cookieString.split(';');

    for (const pair of pairs) {
      const trimmedPair = pair.trim();
      if (!trimmedPair) continue;

      const eqIndex = trimmedPair.indexOf('=');
      if (eqIndex === -1) continue;

      const name = trimmedPair.substring(0, eqIndex).trim();
      const value = trimmedPair.substring(eqIndex + 1).trim();

      if (name) {
        cookies[name] = value;
      }
    }
  } catch (e) {
    console.warn('Failed to parse cookies:', e);
  }

  return cookies;
};