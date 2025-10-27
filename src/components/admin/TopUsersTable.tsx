'use client';

import { useState } from 'react';

interface UserCostData {
  userId: string;
  email: string;
  fullName: string | null;
  subscriptionStatus: string;
  totalCostSek: number;
  totalCalls: number;
  totalTokens: number;
  featuresUsed: string[];
  firstUsage: string;
  lastUsage: string;
}

interface TopUsersTableProps {
  data: UserCostData[];
}

type SortField = 'email' | 'totalCostSek' | 'totalCalls' | 'totalTokens' | 'lastUsage';
type SortDirection = 'asc' | 'desc';

const SUBSCRIPTION_LABELS: Record<string, { label: string; color: string }> = {
  'premium': { label: 'Premium', color: 'bg-purple-100 text-purple-800' },
  'free': { label: 'Gratis', color: 'bg-gray-100 text-gray-800' },
  'trial': { label: 'Testperiod', color: 'bg-blue-100 text-blue-800' },
};

export default function TopUsersTable({ data }: TopUsersTableProps) {
  const [sortField, setSortField] = useState<SortField>('totalCostSek');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle date strings
    if (sortField === 'lastUsage') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('email')}
            >
              <div className="flex items-center gap-2">
                Användare
                <SortIcon field="email" />
              </div>
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('totalCostSek')}
            >
              <div className="flex items-center justify-end gap-2">
                Total kostnad
                <SortIcon field="totalCostSek" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('totalCalls')}
            >
              <div className="flex items-center justify-end gap-2">
                Anrop
                <SortIcon field="totalCalls" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('totalTokens')}
            >
              <div className="flex items-center justify-end gap-2">
                Tokens
                <SortIcon field="totalTokens" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('lastUsage')}
            >
              <div className="flex items-center justify-end gap-2">
                Senast använd
                <SortIcon field="lastUsage" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((user, index) => {
            const subscription = SUBSCRIPTION_LABELS[user.subscriptionStatus] || SUBSCRIPTION_LABELS['free'];
            return (
              <tr key={user.userId} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {user.fullName || 'Okänd användare'}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${subscription.color}`}>
                    {subscription.label}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <span className="text-sm font-semibold text-gray-900">
                    {user.totalCostSek.toFixed(2)} kr
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-600">
                  {user.totalCalls.toLocaleString('sv-SE')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-600">
                  {user.totalTokens.toLocaleString('sv-SE')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-600">
                  {formatDate(user.lastUsage)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {sortedData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Ingen användningsdata hittades</p>
        </div>
      )}
    </div>
  );
}
