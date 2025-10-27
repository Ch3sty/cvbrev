'use client';

import { useState } from 'react';

interface FeatureUsage {
  featureName: string;
  calls: number;
  costSek: number;
  tokens: number;
  firstUsed: string;
  lastUsed: string;
}

interface UserEngagement {
  userId: string;
  email: string;
  fullName: string | null;
  subscriptionStatus: string;
  totalCalls: number;
  totalCostSek: number;
  featuresUsed: string[];
  featureCount: number;
  featureUsage: FeatureUsage[];
  daysSinceLastActivity: number;
  engagementScore: number;
}

interface UserEngagementTableProps {
  data: UserEngagement[];
}

type SortField = 'email' | 'totalCalls' | 'featureCount' | 'engagementScore' | 'daysSinceLastActivity';
type SortDirection = 'asc' | 'desc';

const SUBSCRIPTION_LABELS: Record<string, { label: string; color: string }> = {
  'premium': { label: 'Premium', color: 'bg-purple-100 text-purple-800' },
  'free': { label: 'Gratis', color: 'bg-gray-100 text-gray-800' },
  'trial': { label: 'Testperiod', color: 'bg-blue-100 text-blue-800' },
};

const FEATURE_LABELS: Record<string, string> = {
  'letter_generation': 'Personligt Brev',
  'cv_parsing': 'CV-parsning',
  'cv_improvement': 'CV-förbättring',
  'linkedin_optimization': 'LinkedIn-optimering',
  'group_improvements': 'Grupperade förbättringar',
  'cv_analysis': 'CV-analys',
  'competence_analysis': 'Kompetensanalys',
};

export default function UserEngagementTable({ data }: UserEngagementTableProps) {
  const [sortField, setSortField] = useState<SortField>('engagementScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

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

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

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

  const getEngagementColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

            </th>
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
              onClick={() => handleSort('totalCalls')}
            >
              <div className="flex items-center justify-end gap-2">
                Totalt anrop
                <SortIcon field="totalCalls" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('featureCount')}
            >
              <div className="flex items-center justify-end gap-2">
                Funktioner
                <SortIcon field="featureCount" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('engagementScore')}
            >
              <div className="flex items-center justify-end gap-2">
                Engagement
                <SortIcon field="engagementScore" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('daysSinceLastActivity')}
            >
              <div className="flex items-center justify-end gap-2">
                Senast aktiv
                <SortIcon field="daysSinceLastActivity" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((user) => {
            const subscription = SUBSCRIPTION_LABELS[user.subscriptionStatus] || SUBSCRIPTION_LABELS['free'];
            const isExpanded = expandedUser === user.userId;

            return (
              <>
                <tr
                  key={user.userId}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedUser(isExpanded ? null : user.userId)}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </td>
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
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                    {user.totalCalls.toLocaleString('sv-SE')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-600">
                    {user.featureCount} av 7
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEngagementColor(user.engagementScore)}`}>
                      {user.engagementScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-600">
                    {user.daysSinceLastActivity === 0 ? 'Idag' : `${user.daysSinceLastActivity}d sedan`}
                  </td>
                </tr>

                {/* Expanded details */}
                {isExpanded && (
                  <tr>
                    <td colSpan={7} className="px-4 py-3 bg-gray-50">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Funktionsanvändning:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {user.featureUsage.map((usage) => (
                            <div
                              key={usage.featureName}
                              className="bg-white rounded-lg p-3 border border-gray-200"
                            >
                              <p className="text-sm font-medium text-gray-900">
                                {FEATURE_LABELS[usage.featureName] || usage.featureName}
                              </p>
                              <div className="mt-2 space-y-1 text-xs text-gray-600">
                                <p>Anrop: {usage.calls}</p>
                                <p>Kostnad: {usage.costSek.toFixed(2)} kr</p>
                                <p>Tokens: {usage.tokens.toLocaleString('sv-SE')}</p>
                                <p className="text-gray-500">
                                  Senast: {new Date(usage.lastUsed).toLocaleDateString('sv-SE')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>

      {sortedData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Ingen användardata hittades</p>
        </div>
      )}
    </div>
  );
}
