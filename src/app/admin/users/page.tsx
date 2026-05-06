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
  GraduationCap,
  Check,
  X
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
  email_verified_at: string | null;

  // Primary metrics: Usage per feature
  letters_generated_count: number;
  cv_analyses_count: number;
  cv_templates_downloaded_count: number;
  job_matches_count: number;
  linkedin_optimizations_count: number;

  // Secondary metrics: Saved documents
  saved_letters_count: number;
  saved_cvs_count: number;
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
  const [premiumDays, setPremiumDays] = useState<number | 'unlimited'>('unlimited');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Bulk-selektion
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [bulkPremiumDays, setBulkPremiumDays] = useState<number | 'unlimited'>(7);
  const [bulkActionMode, setBulkActionMode] = useState<'idle' | 'confirm_delete' | 'choose_premium'>('idle');
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      const valA = sortField === 'letters_generated_count' ? (a.letters_generated_count || 0) :
                   sortField === 'cv_analyses_count' ? (a.cv_analyses_count || 0) :
                   sortField === 'cv_templates_downloaded_count' ? (a.cv_templates_downloaded_count || 0) :
                   sortField === 'job_matches_count' ? (a.job_matches_count || 0) :
                   sortField === 'linkedin_optimizations_count' ? (a.linkedin_optimizations_count || 0) :
                   sortField === 'saved_letters_count' ? (a.saved_letters_count || 0) :
                   sortField === 'saved_cvs_count' ? (a.saved_cvs_count || 0) :
                   a[sortField as keyof User];
      const valB = sortField === 'letters_generated_count' ? (b.letters_generated_count || 0) :
                   sortField === 'cv_analyses_count' ? (b.cv_analyses_count || 0) :
                   sortField === 'cv_templates_downloaded_count' ? (b.cv_templates_downloaded_count || 0) :
                   sortField === 'job_matches_count' ? (b.job_matches_count || 0) :
                   sortField === 'linkedin_optimizations_count' ? (b.linkedin_optimizations_count || 0) :
                   sortField === 'saved_letters_count' ? (b.saved_letters_count || 0) :
                   sortField === 'saved_cvs_count' ? (b.saved_cvs_count || 0) :
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
        // Fetch all user data from the new view (includes usage stats + saved counts)
        const { data: usersData, error: usersError } = await supabase
          .from('user_feature_usage_stats')
          .select(`
            user_id,
            email,
            full_name,
            subscription_tier,
            premium_source,
            premium_until,
            created_at,
            last_active,
            letters_generated_count,
            cv_analyses_count,
            cv_templates_downloaded_count,
            job_matches_count,
            linkedin_optimizations_count,
            saved_letters_count,
            saved_cvs_count
          `)
          .order('created_at', { ascending: false });

        if (usersError) throw usersError;

        // Fetch additional data not in view (stripe info + email verification)
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, stripe_customer_id, subscription_status, email_verified_at');

        if (profilesError) throw profilesError;

        // Create a map for additional profile data
        const stripeDataMap = new Map(
          profiles?.map(p => [p.id, {
            stripe_customer_id: p.stripe_customer_id,
            subscription_status: p.subscription_status,
            email_verified_at: p.email_verified_at
          }]) || []
        );

        // Merge data
        const enrichedUsers = usersData?.map((user): User => {
          const stripeData = stripeDataMap.get(user.user_id);
          return {
            id: user.user_id,
            email: user.email,
            full_name: user.full_name,
            subscription_tier: user.subscription_tier || 'free',
            premium_source: user.premium_source,
            premium_until: user.premium_until,
            stripe_customer_id: stripeData?.stripe_customer_id || null,
            subscription_status: stripeData?.subscription_status || null,
            email_verified_at: stripeData?.email_verified_at || null,
            created_at: user.created_at,
            last_active: user.last_active,
            letters_generated_count: user.letters_generated_count || 0,
            cv_analyses_count: user.cv_analyses_count || 0,
            cv_templates_downloaded_count: user.cv_templates_downloaded_count || 0,
            job_matches_count: user.job_matches_count || 0,
            linkedin_optimizations_count: user.linkedin_optimizations_count || 0,
            saved_letters_count: user.saved_letters_count || 0,
            saved_cvs_count: user.saved_cvs_count || 0,
          };
        }) || [];

        setUsers(enrichedUsers);
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
          Gästinbjudan
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
      setPremiumDays('unlimited');
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  const handleUpgradeUser = async () => {
    if (!selectedUser) return;

    setIsUpdating(true);
    setUpdateSuccess(null);
    setError(null);

    try {
      // Berakna premium_until baserat pa valt intervall
      let premiumUntil: string | null = null;
      if (premiumDays !== 'unlimited') {
        const until = new Date();
        until.setDate(until.getDate() + premiumDays);
        premiumUntil = until.toISOString();
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: 'premium',
          premium_until: premiumUntil,
          premium_source: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      const updatedUser = {
        ...selectedUser,
        subscription_tier: 'premium',
        premium_source: 'admin',
        premium_until: premiumUntil,
      } as User;
      setUsers(prevUsers => prevUsers.map(user =>
        user.id === selectedUser.id ? updatedUser : user
      ));
      setSelectedUser(updatedUser);

      const durationLabel =
        premiumDays === 'unlimited'
          ? 'obegränsad tid'
          : `${premiumDays} ${premiumDays === 1 ? 'dag' : 'dagar'}`;
      setUpdateSuccess(
        `${selectedUser.full_name || selectedUser.email} har uppgraderats till Premium (${durationLabel}).`
      );

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

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (deleteConfirmText !== selectedUser.email) {
      setError('Bekräftelsetexten matchar inte e-postadressen');
      return;
    }

    setIsUpdating(true);
    setUpdateSuccess(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Kunde inte ta bort användaren');
      }

      // Ta bort fran lokala listan
      setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));

      setUpdateSuccess(
        `${selectedUser.full_name || selectedUser.email} har tagits bort permanent.`
      );

      // Frigor laddning innan timeout sa modalen kan oppna for annan anvandare
      setIsUpdating(false);

      setTimeout(() => {
        closeActionModal();
      }, 1800);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Ett fel uppstod vid borttagning av användaren');
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

  // ============== BULK-SELEKTION ==============

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const togglePageSelection = () => {
    const pageUsers = getCurrentPageUsers();
    const pageIds = pageUsers.map(u => u.id);
    const allSelected = pageIds.every(id => selectedUserIds.has(id));

    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach(id => next.delete(id));
      } else {
        pageIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedUserIds(new Set());
    setBulkActionMode('idle');
    setBulkMessage(null);
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.size === 0) return;

    setBulkProcessing(true);
    setBulkMessage(null);

    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          userIds: Array.from(selectedUserIds),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kunde inte ta bort användare');
      }

      // Ta bort lyckade fran lokala listan
      const succeededIds: string[] = data.succeeded || [];
      setUsers(prev => prev.filter(u => !succeededIds.includes(u.id)));

      const failed = data.failed || [];
      if (failed.length > 0) {
        setBulkMessage({
          type: 'error',
          text: `${succeededIds.length} av ${selectedUserIds.size} togs bort. ${failed.length} misslyckades.`,
        });
      } else {
        setBulkMessage({
          type: 'success',
          text: data.message || `${succeededIds.length} användare borttagna.`,
        });
      }

      setSelectedUserIds(new Set());
      setBulkActionMode('idle');
    } catch (err: any) {
      setBulkMessage({
        type: 'error',
        text: err.message || 'Ett fel uppstod',
      });
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkGrantPremium = async () => {
    if (selectedUserIds.size === 0) return;

    setBulkProcessing(true);
    setBulkMessage(null);

    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grant_premium',
          userIds: Array.from(selectedUserIds),
          premiumDays: bulkPremiumDays,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kunde inte uppgradera användare');
      }

      // Uppdatera lokala listan
      let premiumUntil: string | null = null;
      if (bulkPremiumDays !== 'unlimited' && typeof bulkPremiumDays === 'number') {
        const until = new Date();
        until.setDate(until.getDate() + bulkPremiumDays);
        premiumUntil = until.toISOString();
      }

      setUsers(prev =>
        prev.map(u =>
          selectedUserIds.has(u.id)
            ? {
                ...u,
                subscription_tier: 'premium',
                premium_source: 'admin',
                premium_until: premiumUntil,
              }
            : u
        )
      );

      setBulkMessage({
        type: 'success',
        text: data.message || `${selectedUserIds.size} användare uppgraderade.`,
      });

      setSelectedUserIds(new Set());
      setBulkActionMode('idle');
    } catch (err: any) {
      setBulkMessage({
        type: 'error',
        text: err.message || 'Ett fel uppstod',
      });
    } finally {
      setBulkProcessing(false);
    }
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
    totalLettersGenerated: users.reduce((sum, u) => sum + (u.letters_generated_count || 0), 0),
    totalCVAnalyses: users.reduce((sum, u) => sum + (u.cv_analyses_count || 0), 0),
    totalCVTemplates: users.reduce((sum, u) => sum + (u.cv_templates_downloaded_count || 0), 0),
    totalJobMatches: users.reduce((sum, u) => sum + (u.job_matches_count || 0), 0),
    totalLinkedInOpts: users.reduce((sum, u) => sum + (u.linkedin_optimizations_count || 0), 0),
    totalSavedLetters: users.reduce((sum, u) => sum + (u.saved_letters_count || 0), 0),
    totalSavedCVs: users.reduce((sum, u) => sum + (u.saved_cvs_count || 0), 0),
    usersWithLetters: users.filter(u => (u.letters_generated_count || 0) > 0).length,
    usersWithCVTemplates: users.filter(u => (u.cv_templates_downloaded_count || 0) > 0).length,
    usersWithCVs: users.filter(u => (u.saved_cvs_count || 0) > 0).length,
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
          <FileText className="absolute right-2 top-2 w-8 h-8 text-pink-300" />
          <div className="text-2xl font-bold text-gray-900">{totalStats.totalLettersGenerated}</div>
          <div className="text-sm text-gray-600">Genererade brev</div>
          <div className="text-xs text-gray-500 mt-1">
            {totalStats.usersWithLetters} aktiva användare
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 relative overflow-hidden">
          <ScrollText className="absolute right-2 top-2 w-8 h-8 text-blue-300" />
          <div className="text-2xl font-bold text-gray-900">{totalStats.totalCVAnalyses}</div>
          <div className="text-sm text-gray-600">CV-analyser</div>
          <div className="text-xs text-gray-500 mt-1">
            totalt genomförda
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 relative overflow-hidden">
          <FileText className="absolute right-2 top-2 w-8 h-8 text-orange-300" />
          <div className="text-2xl font-bold text-gray-900">{totalStats.totalCVTemplates}</div>
          <div className="text-sm text-gray-600">CV-mallar</div>
          <div className="text-xs text-gray-500 mt-1">
            {totalStats.usersWithCVTemplates} aktiva användare
          </div>
        </div>
      </div>

      {/* Second row of stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <option value="guest">Premium - Gästinbjudan</option>
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
            {/* BULK ACTION-BAR */}
            {selectedUserIds.size > 0 && (
              <div className="mb-3 sticky top-0 z-20 bg-white border border-pink-200 rounded-lg shadow-md overflow-hidden">
                {/* Status-rad */}
                {bulkMessage && (
                  <div
                    className={`px-4 py-2 text-sm font-medium ${
                      bulkMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                        : 'bg-red-50 text-red-800 border-b border-red-200'
                    }`}
                  >
                    {bulkMessage.text}
                  </div>
                )}

                <div className="px-4 py-3 flex flex-col lg:flex-row lg:items-center gap-3">
                  {/* Vänster: antal valda */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-sm font-bold tabular-nums">
                      {selectedUserIds.size} valda
                    </div>
                    <button
                      onClick={clearSelection}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      rensa
                    </button>
                  </div>

                  {/* Mitten: åtgärds-zoner */}
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    {/* Idle: visa val-knappar */}
                    {bulkActionMode === 'idle' && (
                      <>
                        <button
                          onClick={() => setBulkActionMode('choose_premium')}
                          disabled={bulkProcessing}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-md text-sm font-medium hover:from-yellow-500 hover:to-amber-600 disabled:opacity-50"
                        >
                          <Crown className="w-3.5 h-3.5" />
                          Ge Premium
                        </button>
                        <button
                          onClick={() => setBulkActionMode('confirm_delete')}
                          disabled={bulkProcessing}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-600 text-red-600 rounded-md text-sm font-medium hover:bg-red-600 hover:text-white disabled:opacity-50"
                        >
                          <Trash className="w-3.5 h-3.5" />
                          Ta bort
                        </button>
                      </>
                    )}

                    {/* Premium-val */}
                    {bulkActionMode === 'choose_premium' && (
                      <>
                        <span className="text-xs font-medium text-gray-600 mr-1">
                          Varaktighet:
                        </span>
                        <div className="flex gap-1 flex-wrap">
                          {([1, 2, 5, 7, 'unlimited'] as const).map((days) => (
                            <button
                              key={days}
                              onClick={() => setBulkPremiumDays(days)}
                              disabled={bulkProcessing}
                              className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors ${
                                bulkPremiumDays === days
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-100'
                              }`}
                            >
                              {days === 'unlimited' ? '∞' : `${days} ${days === 1 ? 'dag' : 'dgr'}`}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={handleBulkGrantPremium}
                          disabled={bulkProcessing}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-md text-sm font-bold hover:from-yellow-500 hover:to-amber-600 disabled:opacity-50 ml-auto lg:ml-0"
                        >
                          {bulkProcessing ? (
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white" />
                          ) : (
                            <>
                              <Crown className="w-3.5 h-3.5" />
                              Bekräfta
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setBulkActionMode('idle')}
                          disabled={bulkProcessing}
                          className="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                        >
                          Avbryt
                        </button>
                      </>
                    )}

                    {/* Delete-bekräftelse */}
                    {bulkActionMode === 'confirm_delete' && (
                      <>
                        <span className="text-sm font-medium text-red-700">
                          Ta bort {selectedUserIds.size} användare permanent?
                        </span>
                        <button
                          onClick={handleBulkDelete}
                          disabled={bulkProcessing}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-bold hover:bg-red-700 disabled:opacity-50 ml-auto lg:ml-0"
                        >
                          {bulkProcessing ? (
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white" />
                          ) : (
                            <>
                              <Trash className="w-3.5 h-3.5" />
                              Ja, ta bort permanent
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setBulkActionMode('idle')}
                          disabled={bulkProcessing}
                          className="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                        >
                          Avbryt
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-3 text-center w-10"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                        checked={
                          getCurrentPageUsers().length > 0 &&
                          getCurrentPageUsers().every(u => selectedUserIds.has(u.id))
                        }
                        onChange={togglePageSelection}
                        title="Markera alla på denna sida"
                      />
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider"
                      title="E-post verifierad"
                    >
                      <Check className="w-4 h-4 mx-auto" />
                    </th>
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
                    {/* PRIMARY: Användningsstatistik (aktivitet) */}
                    <th
                      scope="col"
                      className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('letters_generated_count')}
                      title="Totalt antal genererade brev"
                    >
                      <div className="flex items-center gap-1">
                        <span>Genererade brev</span>
                        {getSortIcon('letters_generated_count')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('cv_analyses_count')}
                      title="Antal CV-analyser genomförda"
                    >
                      <div className="flex items-center gap-1">
                        <span>CV-analyser</span>
                        {getSortIcon('cv_analyses_count')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('cv_templates_downloaded_count')}
                      title="Antal CV-mallar nedladdade"
                    >
                      <div className="flex items-center gap-1">
                        <span>CV-mallar</span>
                        {getSortIcon('cv_templates_downloaded_count')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('job_matches_count')}
                      title="Antal jobbmatchningssökningar"
                    >
                      <div className="flex items-center gap-1">
                        <span>Jobbmatchningar</span>
                        {getSortIcon('job_matches_count')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('linkedin_optimizations_count')}
                      title="Antal LinkedIn-optimeringar"
                    >
                      <div className="flex items-center gap-1">
                        <span>LinkedIn-opt.</span>
                        {getSortIcon('linkedin_optimizations_count')}
                      </div>
                    </th>
                    {/* SECONDARY: Sparade dokument (retention) */}
                    <th
                      scope="col"
                      className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('saved_letters_count')}
                      title="Antal brev sparade i biblioteket"
                    >
                      <div className="flex items-center gap-1">
                        <span>Sparade brev</span>
                        {getSortIcon('saved_letters_count')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('saved_cvs_count')}
                      title="Antal CV:n uppladdade"
                    >
                      <div className="flex items-center gap-1">
                        <span>Sparade CV:n</span>
                        {getSortIcon('saved_cvs_count')}
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
                      <td colSpan={15} className="px-6 py-12 text-center">
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
                      <tr
                        key={user.id}
                        className={`hover:bg-gray-50 transition-colors group ${
                          selectedUserIds.has(user.id) ? 'bg-pink-50/40' : ''
                        }`}
                      >
                        <td className="px-3 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                            checked={selectedUserIds.has(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                          />
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center">
                          <div title={user.email_verified_at ? "E-post verifierad" : "E-post ej verifierad"} className="inline-block">
                            {user.email_verified_at ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <X className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                        </td>
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
                        {/* PRIMARY: Användningsstatistik */}
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          <span className={user.letters_generated_count > 0 ? 'font-medium text-pink-600' : 'text-gray-400'}>
                            {user.letters_generated_count}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          <span className={user.cv_analyses_count > 0 ? 'font-medium text-blue-600' : 'text-gray-400'}>
                            {user.cv_analyses_count}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          <span className={user.cv_templates_downloaded_count > 0 ? 'font-medium text-orange-600' : 'text-gray-400'}>
                            {user.cv_templates_downloaded_count}
                          </span>
                        </td>
                        <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          <span className={user.job_matches_count > 0 ? 'font-medium text-purple-600' : 'text-gray-400'}>
                            {user.job_matches_count}
                          </span>
                        </td>
                        <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          <span className={user.linkedin_optimizations_count > 0 ? 'font-medium text-cyan-600' : 'text-gray-400'}>
                            {user.linkedin_optimizations_count}
                          </span>
                        </td>
                        {/* SECONDARY: Sparade dokument */}
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {user.saved_letters_count}
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {user.saved_cvs_count}
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

                <div className="text-gray-600 font-medium">Genererade brev:</div>
                <div className="text-gray-900">
                  <span className={selectedUser.letters_generated_count > 0 ? 'font-medium text-pink-600' : ''}>
                    {selectedUser.letters_generated_count}
                  </span>
                </div>

                <div className="text-gray-600 font-medium">CV-analyser:</div>
                <div className="text-gray-900">
                  <span className={selectedUser.cv_analyses_count > 0 ? 'font-medium text-blue-600' : ''}>
                    {selectedUser.cv_analyses_count}
                  </span>
                </div>

                <div className="text-gray-600 font-medium">CV-mallar:</div>
                <div className="text-gray-900">
                  <span className={selectedUser.cv_templates_downloaded_count > 0 ? 'font-medium text-orange-600' : ''}>
                    {selectedUser.cv_templates_downloaded_count}
                  </span>
                </div>

                <div className="text-gray-600 font-medium">Jobbmatchningar:</div>
                <div className="text-gray-900">
                  <span className={selectedUser.job_matches_count > 0 ? 'font-medium text-purple-600' : ''}>
                    {selectedUser.job_matches_count}
                  </span>
                </div>

                <div className="text-gray-600 font-medium">LinkedIn-opt.:</div>
                <div className="text-gray-900">
                  <span className={selectedUser.linkedin_optimizations_count > 0 ? 'font-medium text-cyan-600' : ''}>
                    {selectedUser.linkedin_optimizations_count}
                  </span>
                </div>

                <div className="text-gray-600 font-medium text-sm">Sparade brev:</div>
                <div className="text-gray-500 text-sm">{selectedUser.saved_letters_count}</div>

                <div className="text-gray-600 font-medium text-sm">Sparade CV:n:</div>
                <div className="text-gray-500 text-sm">{selectedUser.saved_cvs_count}</div>
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
                  <div className="space-y-2 p-3 border border-amber-200 bg-amber-50/50 rounded-lg">
                    <label className="block text-xs font-medium text-amber-900 uppercase tracking-wide">
                      Premium-varaktighet
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {([1, 2, 5, 7, 'unlimited'] as const).map((days) => (
                        <button
                          key={days}
                          onClick={() => setPremiumDays(days)}
                          disabled={isUpdating}
                          className={`px-2 py-1.5 rounded-md text-xs font-bold transition-colors ${
                            premiumDays === days
                              ? 'bg-amber-500 text-white'
                              : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-100'
                          }`}
                        >
                          {days === 'unlimited' ? '∞' : `${days} ${days === 1 ? 'dag' : 'dgr'}`}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleUpgradeUser}
                      disabled={isUpdating}
                      className="flex items-center justify-center w-full px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-lg hover:from-yellow-500 hover:to-amber-600 disabled:opacity-60 transition-all font-medium"
                    >
                      {isUpdating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Crown className="w-4 h-4 mr-2" />
                      )}
                      Uppgradera till Premium
                      {premiumDays !== 'unlimited' && ` (${premiumDays} ${premiumDays === 1 ? 'dag' : 'dgr'})`}
                    </button>
                  </div>
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

                {/* Ta bort-knapp + bekraftelse-flode */}
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isUpdating}
                    className="flex items-center justify-center w-full px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white disabled:opacity-50 transition-colors"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Ta bort konto
                  </button>
                ) : (
                  <div className="space-y-2 p-3 border border-red-300 bg-red-50 rounded-lg">
                    <p className="text-xs text-red-800 leading-relaxed">
                      <strong>Varning:</strong> Detta tar bort kontot permanent
                      tillsammans med ALL data (CV:n, brev, analyser).
                      Bekräfta genom att skriva e-postadressen nedan:
                    </p>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder={selectedUser.email}
                      disabled={isUpdating}
                      className="w-full px-3 py-2 border border-red-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText('');
                          setError(null);
                        }}
                        disabled={isUpdating}
                        className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                      >
                        Avbryt
                      </button>
                      <button
                        onClick={handleDeleteUser}
                        disabled={isUpdating || deleteConfirmText !== selectedUser.email}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-md text-sm font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                        ) : (
                          <>
                            <Trash className="w-3.5 h-3.5 mr-1.5" />
                            Ta bort permanent
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
