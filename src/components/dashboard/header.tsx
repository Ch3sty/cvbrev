'use client';
import { useState, useEffect } from 'react';
import { Bell, Search, Settings, User } from 'lucide-react';

interface DashboardHeaderProps {
  user: any;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('sv-SE', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('sv-SE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Hämta användarnamn från user objekt
  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Användare';
  };

  return (
    <header className="bg-navy-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Vänster sida - Välkomstmeddelande */}
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-white">
            Välkommen tillbaka, {getUserName()}!
          </h1>
          <p className="text-sm text-gray-400">
            {formatDate(currentTime)} • {formatTime(currentTime)}
          </p>
        </div>

        {/* Höger sida - Användarinfo och snabblänkar */}
        <div className="flex items-center space-x-4">
          {/* Sökfunktion */}
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Sök i dina brev..."
              className="bg-navy-800 text-white placeholder-gray-400 border border-gray-600 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-pink-500 w-64"
            />
          </div>

          {/* Notifikationer */}
          <button className="relative p-2 rounded-lg hover:bg-navy-800 transition-colors">
            <Bell className="w-5 h-5 text-gray-400" />
            {/* Notifikationsbadge */}
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              2
            </span>
          </button>

          {/* Användarinfo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {getUserName().charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{getUserName()}</span>
              <span className="text-xs text-gray-400">Premium Användare</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}