'use client';

import { useState, useEffect } from 'react';
import { Crown, Linkedin } from 'lucide-react';

interface LinkedInInputProps {
  value?: string;
  onChange: (url: string) => void;
  error?: string;
  disabled?: boolean;
}

export function LinkedInInput({
  value = '',
  onChange,
  error,
  disabled = false
}: LinkedInInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const validateLinkedInUrl = (url: string): string => {
    if (!url.trim()) {
      return ''; // Tomt är OK eftersom fältet är valfritt
    }

    // Grundläggande URL-validering
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      
      // Kontrollera att det är en LinkedIn-URL
      const validDomains = ['linkedin.com', 'www.linkedin.com'];
      if (!validDomains.includes(urlObj.hostname.toLowerCase())) {
        return 'Ange en giltig LinkedIn-profil URL';
      }

      // Kontrollera att det är en profilsida
      const path = urlObj.pathname.toLowerCase();
      if (!path.startsWith('/in/') && !path.startsWith('/pub/')) {
        return 'URL:en måste vara till en LinkedIn-profil (linkedin.com/in/ditt-namn)';
      }

      return '';
    } catch {
      return 'Ange en giltig URL (t.ex. linkedin.com/in/ditt-namn)';
    }
  };

  const formatLinkedInUrl = (url: string): string => {
    if (!url.trim()) return url;
    
    try {
      // Lägg till https:// om det saknas
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      const urlObj = new URL(fullUrl);
      
      // Normalisera till linkedin.com (ta bort www)
      if (urlObj.hostname === 'www.linkedin.com') {
        urlObj.hostname = 'linkedin.com';
      }
      
      return urlObj.toString();
    } catch {
      return url; // Returnera originalet om parsing misslyckas
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Validering i realtid
    const validationErr = validateLinkedInUrl(newValue);
    setValidationError(validationErr);
    
    // Skicka formaterad URL om den är giltig
    if (!validationErr && newValue.trim()) {
      const formattedUrl = formatLinkedInUrl(newValue);
      onChange(formattedUrl);
    } else {
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    // Formatera URL när användaren lämnar fältet
    if (inputValue.trim() && !validationError) {
      const formattedUrl = formatLinkedInUrl(inputValue);
      setInputValue(formattedUrl);
      onChange(formattedUrl);
    }
  };

  const displayError = error || validationError;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 flex items-center">
          <Linkedin className="w-4 h-4 mr-2 text-blue-600" />
          LinkedIn-profil <span className="text-xs text-gray-500 font-normal ml-1">(Valfritt)</span>
        </label>
        <div className="flex items-center text-xs text-white bg-gradient-to-r from-pink-600 to-purple-600 px-3 py-1 rounded-full shadow-sm">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <div className="w-8 h-8 text-blue-600 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
        </div>
        <input
          type="url"
          id="linkedin_url"
          name="linkedin_url"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="linkedin.com/in/ditt-namn"
          disabled={disabled}
          className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white text-gray-900 border ${
            displayError
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-200 focus:ring-pink-500 focus:border-pink-500'
          } focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50`}
        />
      </div>

      {displayError && (
        <p className="text-xs text-red-600 mt-2 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {displayError}
        </p>
      )}

      {!displayError && (
        <p className="text-xs text-gray-600 mt-2">
          Används för att förbättra CV-generering. Länken visas endast på dina CV:n.
        </p>
      )}
    </div>
  );
}