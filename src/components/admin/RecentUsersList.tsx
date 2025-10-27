'use client';

import { Crown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface RecentUser {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: string | null;
  created_at: string;
}

interface RecentUsersListProps {
  users: RecentUser[];
  isLoading?: boolean;
}

export default function RecentUsersList({ users, isLoading }: RecentUsersListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Senaste registrerade användare</h3>
        <p className="text-gray-500 text-center py-8">Inga användare än</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Senaste registrerade användare</h3>
        <Link
          href="/admin/users"
          className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1"
        >
          Visa alla
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/admin/users/${user.id}`}
            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium flex-shrink-0">
              {user.full_name
                ? user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                : user.email.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.full_name || 'Namnlös användare'}
                </p>
                {user.subscription_tier === 'premium' && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-yellow-400 to-amber-500 text-white">
                    <Crown className="w-3 h-3 mr-0.5" />
                    Premium
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-500">
                {format(new Date(user.created_at), 'd MMM, HH:mm', { locale: sv })}
              </p>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
