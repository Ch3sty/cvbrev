'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface InlineLinkedInFieldProps {
  value?: string;
  onChange: (url: string) => void;
  error?: string;
  disabled?: boolean;
}

const LINKEDIN_HOSTS = ['linkedin.com', 'www.linkedin.com'];

function validateLinkedInUrl(url: string): string {
  if (!url.trim()) return '';
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    if (!LINKEDIN_HOSTS.includes(urlObj.hostname.toLowerCase())) {
      return 'Ange en giltig LinkedIn-profil URL';
    }
    const path = urlObj.pathname.toLowerCase();
    if (!path.startsWith('/in/') && !path.startsWith('/pub/')) {
      return 'URL:en måste vara till en LinkedIn-profil (linkedin.com/in/ditt-namn)';
    }
    return '';
  } catch {
    return 'Ange en giltig URL (t.ex. linkedin.com/in/ditt-namn)';
  }
}

function formatLinkedInUrl(url: string): string {
  if (!url.trim()) return url;
  try {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const urlObj = new URL(fullUrl);
    if (urlObj.hostname === 'www.linkedin.com') {
      urlObj.hostname = 'linkedin.com';
    }
    return urlObj.toString();
  } catch {
    return url;
  }
}

export function InlineLinkedInField({
  value = '',
  onChange,
  error,
  disabled = false,
}: InlineLinkedInFieldProps) {
  const [inputValue, setInputValue] = useState(value);
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const validationErr = validateLinkedInUrl(newValue);
    setValidationError(validationErr);

    if (!validationErr && newValue.trim()) {
      onChange(formatLinkedInUrl(newValue));
    } else {
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim() && !validationError) {
      const formatted = formatLinkedInUrl(inputValue);
      setInputValue(formatted);
      onChange(formatted);
    }
  };

  const displayError = error || validationError;
  const borderStyle = displayError
    ? '1px solid #DC2626'
    : '1px solid rgba(249, 115, 22, 0.25)';

  return (
    <div>
      <div className="relative">
        <input
          type="url"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="linkedin.com/in/ditt-namn"
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm min-h-[48px] focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors disabled:opacity-50 disabled:bg-slate-50"
          style={{ border: borderStyle }}
        />
      </div>

      {displayError ? (
        <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" strokeWidth={2.5} />
          {displayError}
        </p>
      ) : (
        <p className="text-xs text-slate-500 mt-2">
          Du väljer själv när du skapar varje CV om länken ska vara med.
        </p>
      )}
    </div>
  );
}
