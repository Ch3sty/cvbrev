import React from 'react';
import { Profile } from '@/types/user.types';

interface ProfileCardProps {
  profile: Profile;
  cv?: {
    name: string;
    url: string | null;
    lastUpdated: string | null;
  } | null;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, cv }) => {
  // Map tonality to readable Swedish
  const getTonalityLabel = (tonality: string | undefined) => {
    const tonalityMap: Record<string, string> = {
      'professional': 'Professionell',
      'enthusiastic': 'Entusiastisk',
      'creative': 'Kreativ',
      'confident': 'Självsäker',
      'balanced': 'Balanserad'
    };
    
    return tonalityMap[tonality || 'professional'] || 'Professionell';
  };
  
  // Generate avatar initials from full name
  const getInitials = (name: string | undefined) => {
    if (!name) return '?';
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="h-14 w-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-semibold mr-4">
            {getInitials(profile.full_name)}
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">
              {profile.full_name || 'Användare'}
            </h2>
            <div className="inline-flex items-center bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {getTonalityLabel(profile.preferred_tonality)}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 my-4"></div>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="text-sm text-gray-700">{profile.email}</span>
          </div>
          
          {profile.phone && (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span className="text-sm text-gray-700">{profile.phone}</span>
            </div>
          )}
        </div>
        
        {cv && cv.url && (
          <>
            <div className="border-t border-gray-200 my-4"></div>
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="text-sm text-gray-700">CV: {cv.name}</span>
                {cv.lastUpdated && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Uppdaterad: {new Date(cv.lastUpdated).toLocaleDateString('sv-SE')}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;