'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Crown, 
  MoreHorizontal,
  UserCheck,
  UserX,
  Eye,
  Trash,
  Edit
} from 'lucide-react';
import Link from 'next/link';

// Typ-definitioner
interface User {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: string | null;
  created_at: string;
  last_active: string | null;
  phone: string | null;
  preferred_tonality: string | null;
  saved_letters_count?: number;
  cv_count?: number;
}

export default function AdminUsersPage() {
  // State för användarlistan och filtrering
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State för paginering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // State för sortering
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // State för filtrering
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string | null>(null);
  
  // State för modal
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  
  // Referens till Supabase-klienten
  const supabase = getSupabaseClient();
  
  // Applicera filtrering och sortering (nu med useCallback)
  const applyFiltersAndSort = useCallback((userList = users) => {
    let result = [...userList];
    
    // Applicera sökning
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(user => 
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchLower))
      );
    }
    
    // Applicera prenumerationsfilter
    if (subscriptionFilter) {
      result = result.filter(user => user.subscription_tier === subscriptionFilter);
    }
    
    // Applicera sortering
    result.sort((a, b) => {
      const fieldA = a[sortField as keyof User];
      const fieldB = b[sortField as keyof User];
      
      // Hantera null-värden
      if (fieldA === null && fieldB === null) return 0;
      if (fieldA === null) return sortDirection === 'asc' ? -1 : 1;
      if (fieldB === null) return sortDirection === 'asc' ? 1 : -1;
      
      // Sortera strängar och nummer olika
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }
      
      // För numeriska värden
      return sortDirection === 'asc'
        ? (fieldA as number) - (fieldB as number)
        : (fieldB as number) - (fieldA as number);
    });
    
    // Uppdatera totalPages baserat på filtrerad data
    setTotalPages(Math.max(1, Math.ceil(result.length / pageSize)));
    
    // Begränsa currentPage om den är utanför giltigt intervall efter filtrering
    if (currentPage > Math.ceil(result.length / pageSize)) {
      setCurrentPage(1);
    }
    
    // Spara filtrerad och sorterad data
    setFilteredUsers(result);
  }, [users, searchTerm, subscriptionFilter, sortField, sortDirection, currentPage, pageSize]);
  
  // Hämta användare från databasen
  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Hämta användarprofiler
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (profilesError) {
          throw profilesError;
        }
        
        // Hämta antal sparade brev per användare med hjälp av den skapade funktionen
        const { data: letterCounts, error: letterError } = await supabase
          .rpc('get_letter_counts_by_user', { is_saved_param: true });
        
        if (letterError) {
          console.error('Fel vid hämtning av brevantal:', letterError);
        }
        
        // Hämta antal CV per användare med hjälp av den skapade funktionen
        const { data: cvCounts, error: cvError } = await supabase
          .rpc('get_cv_counts_by_user');
        
        if (cvError) {
          console.error('Fel vid hämtning av CV-antal:', cvError);
        }
        
        // Kombinera data
        const letterCountMap = new Map();
        letterCounts?.forEach((item: any) => {
          letterCountMap.set(item.user_id, item.count);
        });
        
        const cvCountMap = new Map();
        cvCounts?.forEach((item: any) => {
          cvCountMap.set(item.user_id, item.count);
        });
        
        // Berika profildata med antal brev och CV
        const enrichedProfiles = profiles?.map((profile: any) => ({
          ...profile,
          saved_letters_count: letterCountMap.get(profile.id) || 0,
          cv_count: cvCountMap.get(profile.id) || 0
        })) || [];
        
        setUsers(enrichedProfiles);
        applyFiltersAndSort(enrichedProfiles);
      } catch (err: any) {
        console.error('Fel vid hämtning av användare:', err);
        setError(err.message || 'Ett fel uppstod vid hämtning av användare');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUsers();
  }, [supabase, applyFiltersAndSort]);
  
  // Uppdatera filtrering/sortering när relevanta tillstånd ändras
  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);
  
  // Hantera sortering
  const handleSort = (field: string) => {
    if (field === sortField) {
      // Växla riktning om samma fält klickas igen
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Nytt fält, standardsortering är descending
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Få sorteringsikon för kolumn
  const getSortIcon = (field: string) => {
    if (field !== sortField) return null;
    
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4" /> 
      : <ChevronDown className="w-4 h-4" />;
  };
  
  // Visa användaråtgärdsmodal
  const showUserActions = (user: User) => {
    setSelectedUser(user);
    setShowActionModal(true);
  };
  
  // Hantera uppgradering av användare till premium
  const handleUpgradeUser = async () => {
    if (!selectedUser) return;
    
    setIsUpdating(true);
    setUpdateSuccess(null);
    
    try {
      // Uppdatera användarens prenumerationsnivå i databasen
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_tier: 'premium',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      
      // Uppdatera lokal data
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === selectedUser.id 
          ? { ...user, subscription_tier: 'premium' } 
          : user
      ));
      
      // Uppdatera filtrerad data
      setFilteredUsers(prevUsers => prevUsers.map(user => 
        user.id === selectedUser.id 
          ? { ...user, subscription_tier: 'premium' } 
          : user
      ));
      
      setUpdateSuccess(`${selectedUser.full_name || selectedUser.email} har uppgraderats till Premium!`);
      
      // Återställ efter en kort stund
      setTimeout(() => {
        setShowActionModal(false);
        setSelectedUser(null);
        setUpdateSuccess(null);
      }, 2000);
      
    } catch (err: any) {
      console.error('Fel vid uppgradering av användare:', err);
      setError(err.message || 'Ett fel uppstod vid uppgradering av användaren');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Hantera nedgradering av användare till free
  const handleDowngradeUser = async () => {
    if (!selectedUser) return;
    
    setIsUpdating(true);
    setUpdateSuccess(null);
    
    try {
      // Uppdatera användarens prenumerationsnivå i databasen
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_tier: 'free',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      
      // Uppdatera lokal data
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === selectedUser.id 
          ? { ...user, subscription_tier: 'free' } 
          : user
      ));
      
      // Uppdatera filtrerad data
      setFilteredUsers(prevUsers => prevUsers.map(user => 
        user.id === selectedUser.id 
          ? { ...user, subscription_tier: 'free' } 
          : user
      ));
      
      setUpdateSuccess(`${selectedUser.full_name || selectedUser.email} har nedgraderats till Free!`);
      
      // Återställ efter en kort stund
      setTimeout(() => {
        setShowActionModal(false);
        setSelectedUser(null);
        setUpdateSuccess(null);
      }, 2000);
      
    } catch (err: any) {
      console.error('Fel vid nedgradering av användare:', err);
      setError(err.message || 'Ett fel uppstod vid nedgradering av användaren');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Få de aktuella användarna för den visade sidan
  const getCurrentPageUsers = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredUsers.slice(startIndex, endIndex);
  };
  
  // Formatera datum
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Visa status för prenumerationsnivå med färg
  const getSubscriptionBadge = (tier: string | null) => {
    if (tier === 'premium') {
      return (
        <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </span>
      );
    }
    
    return (
      <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-200">
        Free
      </span>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Hantera användare</h1>
          <p className="text-gray-400">
            {filteredUsers.length} användare totalt
          </p>
        </div>
        
        {/* Sök och filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Sök på namn eller e-post..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-navy-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          
          <select
            value={subscriptionFilter || ''}
            onChange={(e) => setSubscriptionFilter(e.target.value || null)}
            className="px-3 py-2 bg-navy-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Alla typer</option>
            <option value="free">Gratis</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r mb-4">
          <h2 className="text-lg font-semibold text-white mb-2">Ett fel uppstod</h2>
          <p className="text-red-200">{error}</p>
        </div>
      )}
      
      {/* Användartabell */}
      <div className="bg-navy-800 rounded-lg overflow-hidden border border-gray-700">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Laddar användare...</p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-500 mb-3" />
            <h3 className="text-xl font-semibold text-white mb-2">Inga användare hittades</h3>
            <p className="text-gray-400">
              {searchTerm || subscriptionFilter 
                ? 'Prova att ändra dina sökfilter' 
                : 'Det finns ännu inga användare i systemet'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-navy-700">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('full_name')}
                    >
                      <div className="flex items-center">
                        <span>Användare</span>
                        {getSortIcon('full_name')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('subscription_tier')}
                    >
                      <div className="flex items-center">
                        <span>Prenumeration</span>
                        {getSortIcon('subscription_tier')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('saved_letters_count')}
                    >
                      <div className="flex items-center">
                        <span>Brev</span>
                        {getSortIcon('saved_letters_count')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('cv_count')}
                    >
                      <div className="flex items-center">
                        <span>CV:n</span>
                        {getSortIcon('cv_count')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center">
                        <span>Registrerad</span>
                        {getSortIcon('created_at')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Åtgärder
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-navy-800 divide-y divide-gray-700">
                  {getCurrentPageUsers().map((user) => (
                    <tr key={user.id} className="hover:bg-navy-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-navy-600 flex items-center justify-center">
                            <span className="text-white">
                              {user.full_name 
                                ? user.full_name.charAt(0).toUpperCase() 
                                : user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {user.full_name || 'Namnlös användare'}
                            </div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSubscriptionBadge(user.subscription_tier)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.saved_letters_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.cv_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => showUserActions(user)}
                          className="text-pink-500 hover:text-pink-400 hover:bg-navy-700 p-1 rounded-md"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-700">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-navy-700 hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Föregående
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-navy-700 hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Nästa
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Visar <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> till <span className="font-medium">{Math.min(currentPage * pageSize, filteredUsers.length)}</span> av{' '}
                    <span className="font-medium">{filteredUsers.length}</span> användare
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-navy-700 text-sm font-medium text-gray-300 hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Första</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {/* Page numbers */}
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i + 1
                            ? 'bg-pink-600 text-white border-pink-500'
                            : 'bg-navy-700 text-gray-300 border-gray-700 hover:bg-navy-600'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-navy-700 text-sm font-medium text-gray-300 hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Sista</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* User Action Modal */}
      {showActionModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-navy-800 rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => {
                if (!isUpdating) {
                  setShowActionModal(false);
                  setSelectedUser(null);
                }
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              disabled={isUpdating}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-xl font-semibold text-white mb-4">Hantera användare</h3>
            
            <div className="mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-navy-600 flex items-center justify-center">
                  <span className="text-white text-lg">
                    {selectedUser.full_name 
                      ? selectedUser.full_name.charAt(0).toUpperCase() 
                      : selectedUser.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <div className="text-lg font-medium text-white">
                    {selectedUser.full_name || 'Namnlös användare'}
                  </div>
                  <div className="text-sm text-gray-400">{selectedUser.email}</div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-400">Prenumeration:</div>
                <div className="text-white">{getSubscriptionBadge(selectedUser.subscription_tier)}</div>
                
                <div className="text-gray-400">Registrerad:</div>
                <div className="text-white">{formatDate(selectedUser.created_at)}</div>
                
                <div className="text-gray-400">Sparade brev:</div>
                <div className="text-white">{selectedUser.saved_letters_count || 0}</div>
                
                <div className="text-gray-400">CV:n:</div>
                <div className="text-white">{selectedUser.cv_count || 0}</div>
              </div>
            </div>
            
            {updateSuccess && (
              <div className="mb-4 bg-green-600/20 border-l-4 border-green-500 p-3 rounded-r">
                <p className="text-green-400">{updateSuccess}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400 uppercase">Åtgärder</h4>
              
              <div className="grid grid-cols-1 gap-2">
                {selectedUser.subscription_tier !== 'premium' && (
                  <button
                    onClick={handleUpgradeUser}
                    disabled={isUpdating}
                    className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-md hover:from-yellow-600 hover:to-amber-600 disabled:opacity-50"
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
                    className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
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
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                   Visa användarprofil
               </Link>
               
               <button
                 className="flex items-center justify-center px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white"
                 disabled // Tillfälligt inaktiverad, implementera en "Är du säker?"-dialog för att göra detta säkert
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