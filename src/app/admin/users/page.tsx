'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import {
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Crown,
  MoreHorizontal,
  UserX,
  Eye,
  Trash,
  FileText,
  ScrollText,
  AlertCircle,
  CreditCard,
  Shield,
  Users as UsersIcon,
  Clock,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';

// Type definitions
interface User {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: string | null;
  premium_source: string | null;
  premium_until: string | null;
  stripe_customer_id: string | null;
  subscription_status: string | null;
  created_at: string;
  last_active: string | null;
  saved_letters_count?: number;
  cv_count?: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string | null>(null);

  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const getFilteredAndSortedUsers = useCallback((userList = users) => {
    let result = [...userList];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(user =>
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchLower))
      );
    }

    if (subscriptionFilter) {
      if (subscriptionFilter === 'free') {
        result = result.filter(user => user.subscription_tier === 'free' || !user.subscription_tier);
      } else if (subscriptionFilter === 'premium') {
        result = result.filter(user => user.subscription_tier === 'premium');
      } else if (subscriptionFilter === 'stripe') {
        result = result.filter(user =>
          user.subscription_tier === 'premium' &&
          user.stripe_customer_id &&
          user.subscription_status === 'active'
        );
      } else if (subscriptionFilter === 'admin') {
        result = result.filter(user =>
          user.subscription_tier === 'premium' &&
          user.premium_source === 'admin'
        );
      } else if (subscriptionFilter === 'guest') {
        result = result.filter(user =>
          user.subscription_tier === 'premium' &&
          user.premium_source === 'guest_invitation'
        );
      } else if (subscriptionFilter === 'trial') {
        result = result.filter(user =>
          user.subscription_tier === 'premium' &&
          (user.premium_source === 'signup_trial' || user.premium_source === 'oauth_signup_trial')
        );
      }
    }

    result.sort((a, b) => {
      const valA = sortField === 'saved_letters_count' ? (a.saved_letters_count || 0) :
                   sortField === 'cv_count' ? (a.cv_count || 0) :
                   a[sortField as keyof User];
      const valB = sortField === 'saved_letters_count' ? (b.saved_letters_count || 0) :
                   sortField === 'cv_count' ? (b.cv_count || 0) :
                   b[sortField as keyof User];

      if (valA == null && valB == null) return 0;
      if (valA == null) return sortDirection === 'asc' ? -1 : 1;
      if (valB == null) return sortDirection === 'asc' ? 1 : -1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      if (sortField === 'created_at') {
        const dateA = new Date(valA as string).getTime();
        const dateB = new Date(valB as string).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }

      return sortDirection === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });

    return result;
  }, [users, searchTerm, subscriptionFilter, sortField, sortDirection]);

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      setError(null);

      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name, subscription_tier, premium_source, premium_until, stripe_customer_id, subscription_status, created_at, last_active')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        const { data: letterCounts, error: letterError } = await supabase
          .rpc('get_letter_counts_by_user', { is_saved_param: true });

        const { data: cvCounts, error: cvError } = await supabase
          .rpc('get_cv_counts_by_user');

        const letterCountMap = new Map<string, number>();
        if (letterCounts) {
          letterCounts.forEach((item: any) => {
            letterCountMap.set(item.user_id, typeof item.count === 'string' ? parseInt(item.count, 10) : item.count);
          });
        }

        const cvCountMap = new Map<string, number>();
        if (cvCounts) {
          cvCounts.forEach((item: any) => {
            cvCountMap.set(item.user_id, typeof item.count === 'string' ? parseInt(item.count, 10) : item.count);
          });
        }

        const enrichedProfiles = profiles?.map((profile): User => ({
          ...profile,
          subscription_tier: profile.subscription_tier || 'free',
          saved_letters_count: letterCountMap.get(profile.id) || 0,
          cv_count: cvCountMap.get(profile.id) || 0
        })) || [];

        setUsers(enrichedProfiles);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Ett fel uppstod vid hämtning av användare');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [supabase]);

  useEffect(() => {
    const filteredResults = getFilteredAndSortedUsers();
    setFilteredUsers(filteredResults);

    const newTotalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
    setTotalPages(newTotalPages);

    setCurrentPage(prev => Math.max(1, Math.min(prev, newTotalPages)));
  }, [getFilteredAndSortedUsers, pageSize]);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: string) => {
    if (field !== sortField) return <ChevronDown className="w-4 h-4 text-gray-400 opacity-50" />;

    return sortDirection === 'asc'
      ? <ChevronUp className="w-4 h-4 text-pink-600" />
      : <ChevronDown className="w-4 h-4 text-pink-600" />;
  };

  const getPremiumSourceBadge = (user: User) => {
    if (user.subscription_tier !== 'premium') {
      return <span className="text-gray-500 text-sm">-</span>;
    }

    if (user.stripe_customer_id && user.subscription_status === 'active') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
          <CreditCard className="w-3 h-3 mr-1" />
          Stripe
        </span>
      );
    }

    if (user.premium_source === 'signup_trial') {
      const expiryDate = user.premium_until ? new Date(user.premium_until).toLocaleString('sv-SE') : 'Okänt';
      return (
        <span
          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 cursor-help"
          title={`Går ut: ${expiryDate}`}
        >
          <Clock className="w-3 h-3 mr-1" />
          Prova på - Banner
        </span>
      );
    }

    if (user.premium_source === 'oauth_signup_trial') {
      const expiryDate = user.premium_until ? new Date(user.premium_until).toLocaleString('sv-SE') : 'Okänt';
      return (
        <span
          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 cursor-help"
          title={`Går ut: ${expiryDate}`}
        >
          <Clock className="w-3 h-3 mr-1" />
          Prova på - OAuth
        </span>
      );
    }

    if (user.premium_source === 'admin') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </span>
      );
    }

    if (user.premium_source === 'guest_invitation') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
          <UsersIcon className="w-3 h-3 mr-1" />
          Gäst
        </span>
      );
    }

    if (user.premium_source === 'onboarding_completion') {
      const expiryDate = user.premium_until ? new Date(user.premium_until).toLocaleString('sv-SE') : 'Okänt';
      return (
        <span
          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 cursor-help"
          title={`Går ut: ${expiryDate}`}
        >
          <GraduationCap className="w-3 h-3 mr-1" />
          Genomförd guide
        </span>
      );
    }

    return <span className="text-gray-500 text-sm">-</span>;
  };

  const showUserActions = (user: User) => {
    setSelectedUser(user);
    setShowActionModal(true);
    setError(null);
    setUpdateSuccess(null);
  };

  const closeActionModal = () => {
    if (!isUpdating) {
      setShowActionModal(false);
      setSelectedUser(null);
      setError(null);
      setUpdateSuccess(null);
    }
  };

  const handleUpgradeUser = async () => {
    if (!selectedUser) return;

    setIsUpdating(true);
    setUpdateSuccess(null);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: 'premium',
          premium_until: null,
          premium_source: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      const updatedUser = { ...selectedUser, subscription_tier: 'premium', premium_source: 'admin' } as User;
      setUsers(prevUsers => prevUsers.map(user =>
        user.id === selectedUser.id ? updatedUser : user
      ));
      setSelectedUser(updatedUser);

      setUpdateSuccess(`${selectedUser.full_name || selectedUser.email} har uppgraderats till Premium!`);

      setTimeout(() => {
        closeActionModal();
      }, 2000);

    } catch (err: any) {
      console.error('Error upgrading user:', err);
      setError(err.message || 'Ett fel uppstod vid uppgradering av användaren');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDowngradeUser = async () => {
    if (!selectedUser) return;

    setIsUpdating(true);
    setUpdateSuccess(null);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: 'free',
          premium_until: null,
          premium_source: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      const updatedUser = { ...selectedUser, subscription_tier: 'free', premium_source: null } as User;
      setUsers(prevUsers => prevUsers.map(user =>
        user.id === selectedUser.id ? updatedUser : user
      ));
      setSelectedUser(updatedUser);

      setUpdateSuccess(`${selectedUser.full_name || selectedUser.email} har nedgraderats till Free.`);

      setTimeout(() => {
        closeActionModal();
      }, 2000);

    } catch (err: any) {
      console.error('Error downgrading user:', err);
      setError(err.message || 'Ett fel uppstod vid nedgradering av användaren');
    } finally {
      setIsUpdating(false);
    }
  };

  const getCurrentPageUsers = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredUsers.slice(startIndex, endIndex);
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return '-';
    }
  };

  const getSubscriptionBadge = (tier: string | null) => {
    if (tier === 'premium') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-sm">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
        Free
      </span>
    );
  };

  const totalStats = {
    totalUsers: users.length,
    premiumUsers: users.filter(u => u.subscription_tier === 'premium').length,
    freeUsers: users.filter(u => u.subscription_tier === 'free' || !u.subscription_tier).length,
    totalLetters: users.reduce((sum, u) => sum + (u.saved_letters_count || 0), 0),
    totalCVs: users.reduce((sum, u) => sum + (u.cv_count || 0), 0),
    usersWithLetters: users.filter(u => (u.saved_letters_count || 0) > 0).length,
    usersWithCVs: users.filter(u => (u.cv_count || 0) > 0).length,
    usersWithoutName: users.filter(u => !u.full_name).length
  };

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 relative overflow-hidden">
          <Users className="absolute right-2 top-2 w-8 h-8 text-gray-300" />
          <div className="text-2xl font-bold text-gray-900">{totalStats.totalUsers}</div>
          <div className="text-sm text-gray-600">Totalt antal användare</div>
          <div className="text-xs text-gray-500 mt-1">
            {totalStats.premiumUsers} premium, {totalStats.freeUsers} free
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 relative overflow-hidden">
          <FileText className="absolute right-2 top-2 w-8 h-8 text-gray-300" />
          <div className="text-2xl font-bold text-gray-900">{totalStats.totalLetters}</div>
          <div className="text-sm text-gray-600">Sparade brev</div>
          <div className="text-xs text-gray-500 mt-1">
            från {totalStats.usersWithLetters} användare
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 relative overflow-hidden">
          <ScrollText className="absolute right-2 top-2 w-8 h-8 text-gray-300" />
          <div className="text-2xl font-bold text-gray-900">{totalStats.totalCVs}</div>
          <div className="text-sm text-gray-600">Skapade CV:n</div>
          <div className="text-xs text-gray-500 mt-1">
            från {totalStats.usersWithCVs} användare
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 relative overflow-hidden">
          <AlertCircle className="absolute right-2 top-2 w-8 h-8 text-gray-300" />
          <div className="text-2xl font-bold text-gray-900">
            {totalStats.usersWithoutName > 0 ? (
              <span className="text-yellow-600">{totalStats.usersWithoutName}</span>
            ) : (
              <span className="text-emerald-600">0</span>
            )}
          </div>
          <div className="text-sm text-gray-600">Ofullständiga profiler</div>
          <div className="text-xs text-gray-500 mt-1">saknar namn</div>
        </div>
      </div>

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hantera användare</h1>
          <p className="text-gray-600">
            {filteredUsers.length} användare matchar filter
          </p>
        </div>

        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Sök namn/e-post..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <select
            value={subscriptionFilter || ''}
            onChange={(e) => { setSubscriptionFilter(e.target.value || null); setCurrentPage(1); }}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="">Alla typer</option>
            <option value="free">Gratis</option>
            <option value="premium">Premium (alla)</option>
            <option value="stripe">Premium - Stripe</option>
            <option value="trial">Premium - Trial (Prova på)</option>
            <option value="admin">Premium - Admin</option>
            <option value="guest">Premium - Gäst</option>
          </select>
        </div>
      </div>

      {error && !showActionModal && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r" role="alert">
          <h2 className="text-lg font-semibold text-red-900 mb-1">Ett fel uppstod</h2>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Laddar användare...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('full_name')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Användare</span>
                        {getSortIcon('full_name')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('subscription_tier')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Status</span>
                        {getSortIcon('subscription_tier')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      <span>Premium-källa</span>
                    </th>
                    <th
                      scope="col"
                      className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('saved_letters_count')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Brev</span>
                        {getSortIcon('saved_letters_count')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('cv_count')}
                    >
                      <div className="flex items-center gap-1">
                        <span>CV:n</span>
                        {getSortIcon('cv_count')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Registrerad</span>
                        {getSortIcon('created_at')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('last_active')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Senast aktiv</span>
                        {getSortIcon('last_active')}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Åtgärder
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">Inga användare hittades</h3>
                          <p className="text-gray-600 text-sm">
                            {searchTerm || subscriptionFilter
                              ? 'Inga användare matchar dina filter.'
                              : 'Det finns inga användare än.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    getCurrentPageUsers().map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.full_name
                                  ? user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                                  : user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                {user.full_name || <span className="italic text-gray-500">Namnlös</span>}
                              </div>
                              <div className="text-sm text-gray-600 truncate max-w-[200px]">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getSubscriptionBadge(user.subscription_tier)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPremiumSourceBadge(user)}
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {user.saved_letters_count ?? 0}
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {user.cv_count ?? 0}
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.last_active ? formatDate(user.last_active) : (
                            <span className="text-gray-400 italic">Aldrig</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => showUserActions(user)}
                            className="text-gray-400 hover:text-pink-600 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 sm:px-6 flex flex-col md:flex-row items-center justify-between border-t border-gray-200 gap-4 bg-gray-50">
                <div className="flex items-center gap-2">
                  <label htmlFor="pageSize" className="text-sm text-gray-600">Visa:</label>
                  <select
                    id="pageSize"
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className="px-2 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-900"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-600">per sida</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Föregående
                  </button>
                  <span className="text-sm text-gray-700">
                    Sida {currentPage} av {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Nästa
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Action Modal */}
      {showActionModal && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeActionModal}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeActionModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              disabled={isUpdating}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-semibold text-gray-900 mb-5">Hantera användare</h3>

            {/* User Info */}
            <div className="mb-6 border-b border-gray-200 pb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-700 text-lg font-medium">
                    {selectedUser.full_name
                      ? selectedUser.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                      : selectedUser.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <div className="text-lg font-medium text-gray-900">
                    {selectedUser.full_name || <span className="italic text-gray-500">Namnlös användare</span>}
                  </div>
                  <div className="text-sm text-gray-600">{selectedUser.email}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div className="text-gray-600 font-medium">Status:</div>
                <div>{getSubscriptionBadge(selectedUser.subscription_tier)}</div>

                {selectedUser.subscription_tier === 'premium' && (
                  <>
                    <div className="text-gray-600 font-medium">Premium-källa:</div>
                    <div>{getPremiumSourceBadge(selectedUser)}</div>
                  </>
                )}

                <div className="text-gray-600 font-medium">Registrerad:</div>
                <div className="text-gray-900">{formatDate(selectedUser.created_at)}</div>

                <div className="text-gray-600 font-medium">Senast aktiv:</div>
                <div className="text-gray-900">
                  {selectedUser.last_active ? formatDate(selectedUser.last_active) : (
                    <span className="text-gray-400 italic">Aldrig</span>
                  )}
                </div>

                <div className="text-gray-600 font-medium">Sparade brev:</div>
                <div className="text-gray-900">{selectedUser.saved_letters_count ?? 0}</div>

                <div className="text-gray-600 font-medium">CV:n:</div>
                <div className="text-gray-900">{selectedUser.cv_count ?? 0}</div>
              </div>
            </div>

            {updateSuccess && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 p-3 rounded-md text-center">
                <p className="text-sm text-emerald-800">{updateSuccess}</p>
              </div>
            )}

            {error && showActionModal && (
              <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-md text-center">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Åtgärder</h4>

              <div className="grid grid-cols-1 gap-3">
                {selectedUser.subscription_tier !== 'premium' && (
                  <button
                    onClick={handleUpgradeUser}
                    disabled={isUpdating}
                    className="flex items-center justify-center w-full px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-lg hover:from-yellow-500 hover:to-amber-600 disabled:opacity-60 transition-all"
                  >
                    {isUpdating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Crown className="w-4 h-4 mr-2" />
                    )}
                    Uppgradera till Premium
                  </button>
                )}

                {selectedUser.subscription_tier === 'premium' && (
                  <button
                    onClick={handleDowngradeUser}
                    disabled={isUpdating}
                    className="flex items-center justify-center w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-60 transition-all"
                  >
                    {isUpdating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    ) : (
                      <UserX className="w-4 h-4 mr-2" />
                    )}
                    Nedgradera till Free
                  </button>
                )}

                <Link
                  href={`/admin/users/${selectedUser.id}`}
                  className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowActionModal(false)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Visa detaljer
                </Link>

                <button
                  className="flex items-center justify-center w-full px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white disabled:opacity-50 transition-colors"
                  disabled
                  title="Funktion ej implementerad"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Ta bort konto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
