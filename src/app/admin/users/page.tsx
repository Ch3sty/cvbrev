'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import {
  Users,
  Search,
  Filter, // Not used directly, but kept for potential future use
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Crown,
  MoreHorizontal,
  UserCheck, // Not used directly, but kept for potential future use
  UserX,
  Eye,
  Trash,
  Edit, // Not used directly, but kept for potential future use
  FileText,
  ScrollText,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

// Typ-definitioner
interface User {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: string | null;
  created_at: string;
  last_active: string | null; // Not currently displayed, but kept in type
  phone: string | null;       // Not currently displayed, but kept in type
  preferred_tonality: string | null; // Not currently displayed, but kept in type
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
  const [pageSize, setPageSize] = useState(10); // Behåll eller justera efter behov
  
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
  
  // Funktion för att få filtrerade och sorterade användare utan att uppdatera state
  const getFilteredAndSortedUsers = useCallback((userList = users) => {
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
      // Handle potential undefined counts by defaulting to 0 for sorting
      const valA = sortField === 'saved_letters_count' ? (a.saved_letters_count || 0) :
                   sortField === 'cv_count' ? (a.cv_count || 0) :
                   a[sortField as keyof User];
      const valB = sortField === 'saved_letters_count' ? (b.saved_letters_count || 0) :
                   sortField === 'cv_count' ? (b.cv_count || 0) :
                   b[sortField as keyof User];

      // Hantera null/undefined-värden generellt
      if (valA == null && valB == null) return 0;
      if (valA == null) return sortDirection === 'asc' ? -1 : 1;
      if (valB == null) return sortDirection === 'asc' ? 1 : -1;

      // Sortera strängar och nummer olika
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      
      // För numeriska värden (inkluderar datumsträngar som jämförs som strängar om de inte konverteras)
      // Om created_at ska sorteras som datum:
      if (sortField === 'created_at' || sortField === 'last_active') {
         const dateA = new Date(valA as string).getTime();
         const dateB = new Date(valB as string).getTime();
         return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }

      // För andra numeriska värden
      return sortDirection === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });
    
    return result;
  }, [users, searchTerm, subscriptionFilter, sortField, sortDirection]);
  
  // Hämta användare från databasen
  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      setError(null);

      try {
        // Hämta användarprofiler
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('Fel vid hämtning av profiler:', profilesError);
          throw profilesError;
        }

        console.log(`Hämtade ${profiles?.length || 0} användarprofiler`);

        // Hämta antal sparade brev per användare med hjälp av den skapade funktionen
        const { data: letterCounts, error: letterError } = await supabase
          .rpc('get_letter_counts_by_user', { is_saved_param: true });

        if (letterError) {
          console.error('Fel vid hämtning av brevantal:', letterError);
          console.error('Detaljer:', letterError.message, letterError.details, letterError.hint);
        } else {
          console.log(`Hämtade brevantal för ${letterCounts?.length || 0} användare`);
        }

        // Hämta antal CV per användare med hjälp av den skapade funktionen
        const { data: cvCounts, error: cvError } = await supabase
          .rpc('get_cv_counts_by_user');

        if (cvError) {
          console.error('Fel vid hämtning av CV-antal:', cvError);
          console.error('Detaljer:', cvError.message, cvError.details, cvError.hint);
        } else {
          console.log(`Hämtade CV-antal för ${cvCounts?.length || 0} användare`);
        }

        // Kombinera data
        const letterCountMap = new Map<string, number>();
        if (letterCounts && Array.isArray(letterCounts)) {
          letterCounts.forEach((item: { user_id: string, count: number | string }) => {
            // Konvertera count till number om det kommer som string
            const count = typeof item.count === 'string' ? parseInt(item.count, 10) : item.count;
            letterCountMap.set(item.user_id, count || 0);
          });
        }

        const cvCountMap = new Map<string, number>();
        if (cvCounts && Array.isArray(cvCounts)) {
          cvCounts.forEach((item: { user_id: string, count: number | string }) => {
            // Konvertera count till number om det kommer som string
            const count = typeof item.count === 'string' ? parseInt(item.count, 10) : item.count;
            cvCountMap.set(item.user_id, count || 0);
          });
        }

        console.log('Letter count map storlek:', letterCountMap.size);
        console.log('CV count map storlek:', cvCountMap.size);

        // Berika profildata med antal brev och CV
        const enrichedProfiles = profiles?.map((profile): User => {
          const letterCount = letterCountMap.get(profile.id) || 0;
          const cvCount = cvCountMap.get(profile.id) || 0;

          return {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            subscription_tier: profile.subscription_tier || 'free',
            created_at: profile.created_at,
            last_active: profile.last_active,
            phone: profile.phone,
            preferred_tonality: profile.preferred_tonality,
            saved_letters_count: letterCount,
            cv_count: cvCount
          };
        }) || [];

        console.log(`Totalt ${enrichedProfiles.length} användare med berikad data`);
        console.log('Exempel på användardata:', enrichedProfiles.slice(0, 3).map(u => ({
          email: u.email,
          letters: u.saved_letters_count,
          cvs: u.cv_count
        })));

        setUsers(enrichedProfiles);
      } catch (err: any) {
        console.error('Fel vid hämtning av användare:', err);
        setError(err.message || 'Ett fel uppstod vid hämtning av användare');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [supabase]); // Dependency array includes supabase
  
  // Uppdatera filtrerade användare och pagination när relevanta tillstånd ändras
  useEffect(() => {
    const filteredResults = getFilteredAndSortedUsers();
    setFilteredUsers(filteredResults);
    
    // Beräkna totalt antal sidor
    const newTotalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
    setTotalPages(newTotalPages);
    
    // Justera currentPage om den är utanför giltigt intervall efter filtrering/ändring av sidstorlek
    // Sätt till 1 om currentPage blir ogiltigt
    setCurrentPage(prev => Math.max(1, Math.min(prev, newTotalPages)));

  }, [getFilteredAndSortedUsers, pageSize, currentPage]); // Added currentPage dependency
  
  // Hantera sortering
  const handleSort = (field: string) => {
    if (field === sortField) {
      // Växla riktning om samma fält klickas igen
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Nytt fält, standardsortering är descending (eller ascending beroende på fält?)
      // Låt oss hålla 'desc' som standard för de flesta fält, kanske 'asc' för namn?
      setSortField(field);
      setSortDirection('desc'); // Eller basera på fält-typ
    }
    setCurrentPage(1); // Återställ till första sidan vid sortering
  };
  
  // Få sorteringsikon för kolumn
  const getSortIcon = (field: string) => {
    if (field !== sortField) return <ChevronDown className="w-4 h-4 text-gray-500 opacity-50" />; // Visa en svag ikon för att indikera sorterbarhet
    
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-pink-400" /> 
      : <ChevronDown className="w-4 h-4 text-pink-400" />;
  };
  
  // Visa användaråtgärdsmodal
  const showUserActions = (user: User) => {
    setSelectedUser(user);
    setShowActionModal(true);
    // Återställ eventuella tidigare fel/success-meddelanden när modalen öppnas
    setError(null);
    setUpdateSuccess(null);
  };
  
  // Stäng modal
  const closeActionModal = () => {
    if (!isUpdating) {
      setShowActionModal(false);
      setSelectedUser(null);
      // Rensa fel/success när modalen stängs manuellt
      setError(null);
      setUpdateSuccess(null);
    }
  }

  // Hantera uppgradering av användare till premium
  const handleUpgradeUser = async () => {
    if (!selectedUser) return;
    
    setIsUpdating(true);
    setUpdateSuccess(null);
    setError(null); // Rensa tidigare fel
    
    try {
      // Uppdatera användarens prenumerationsnivå i databasen
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          subscription_tier: 'premium',
          updated_at: new Date().toISOString() // Bra att uppdatera denna
        })
        .eq('id', selectedUser.id)
        .select() // Lägg till select för att få tillbaka den uppdaterade raden (valfritt)
        .single(); // Om du förväntar dig exakt en rad tillbaka
      
      if (updateError) throw updateError;
      
      // Uppdatera lokal state MER ROBUST
      const updatedUser = { ...selectedUser, subscription_tier: 'premium' } as User;
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === selectedUser.id ? updatedUser : user
      ));
      setSelectedUser(updatedUser); // Uppdatera även den valda användaren i modalen
      
      setUpdateSuccess(`${selectedUser.full_name || selectedUser.email} har uppgraderats till Premium!`);
      
      // Stäng modalen automatiskt efter framgång
      setTimeout(() => {
        closeActionModal();
      }, 2000);
      
    } catch (err: any) {
      console.error('Fel vid uppgradering av användare:', err);
      // Visa felet i modalen istället för globalt?
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
    setError(null); // Rensa tidigare fel
    
    try {
      // Uppdatera användarens prenumerationsnivå i databasen
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          subscription_tier: 'free', // Sätt till 'free'
          updated_at: new Date().toISOString() 
        })
        .eq('id', selectedUser.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      // Uppdatera lokal state
      const updatedUser = { ...selectedUser, subscription_tier: 'free' } as User;
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === selectedUser.id ? updatedUser : user
      ));
       setSelectedUser(updatedUser); // Uppdatera även den valda användaren i modalen
      
      setUpdateSuccess(`${selectedUser.full_name || selectedUser.email} har nedgraderats till Free.`);
      
      // Stäng modalen automatiskt efter framgång
      setTimeout(() => {
        closeActionModal();
      }, 2000);
      
    } catch (err: any) {
      console.error('Fel vid nedgradering av användare:', err);
       // Visa felet i modalen
      setError(err.message || 'Ett fel uppstod vid nedgradering av användaren');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Få de aktuella användarna för den visade sidan
  const getCurrentPageUsers = () => {
    // Filtrering och sortering hanteras nu av `filteredUsers` via useEffect
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredUsers.slice(startIndex, endIndex);
  };
  
  // Formatera datum
  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'short', // 'short' (sep) eller 'long' (september)
        day: 'numeric',
        // hour: '2-digit', // Valfritt att inkludera tid
        // minute: '2-digit',
      });
    } catch (e) {
      console.error("Failed to format date:", dateStr, e);
      return '-'; // Returnera '-' vid ogiltigt datum
    }
  };
  
  // Visa status för prenumerationsnivå med färg
  const getSubscriptionBadge = (tier: string | null) => {
    if (tier === 'premium') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-sm">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </span>
      );
    }
    // Explicit hantering för 'free' eller null/undefined
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-gray-100">
        {/* Ingen ikon för free? Eller en enkel User ikon? */}
        Free
      </span>
    );
  };

  // Hantera ändring av sidstorlek
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1); // Återställ till första sidan när sidstorleken ändras
  };

  
  // Beräkna totalstatistik
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
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-navy-900 min-h-screen"> {/* Lägg till padding och bakgrund */}
      {/* Statistikkort */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-navy-800 p-4 rounded-lg border border-gray-700 relative overflow-hidden">
          <Users className="absolute right-2 top-2 w-8 h-8 text-gray-600 opacity-20" />
          <div className="text-2xl font-bold text-white">{totalStats.totalUsers}</div>
          <div className="text-sm text-gray-400">Totalt antal användare</div>
          <div className="text-xs text-gray-500 mt-1">
            {totalStats.premiumUsers} premium, {totalStats.freeUsers} free
          </div>
        </div>
        <div className="bg-navy-800 p-4 rounded-lg border border-gray-700 relative overflow-hidden">
          <FileText className="absolute right-2 top-2 w-8 h-8 text-gray-600 opacity-20" />
          <div className="text-2xl font-bold text-white">{totalStats.totalLetters}</div>
          <div className="text-sm text-gray-400">Sparade brev</div>
          <div className="text-xs text-gray-500 mt-1">
            från {totalStats.usersWithLetters} användare
          </div>
        </div>
        <div className="bg-navy-800 p-4 rounded-lg border border-gray-700 relative overflow-hidden">
          <ScrollText className="absolute right-2 top-2 w-8 h-8 text-gray-600 opacity-20" />
          <div className="text-2xl font-bold text-white">{totalStats.totalCVs}</div>
          <div className="text-sm text-gray-400">Skapade CV:n</div>
          <div className="text-xs text-gray-500 mt-1">
            från {totalStats.usersWithCVs} användare
          </div>
        </div>
        <div className="bg-navy-800 p-4 rounded-lg border border-gray-700 relative overflow-hidden">
          <AlertCircle className="absolute right-2 top-2 w-8 h-8 text-gray-600 opacity-20" />
          <div className="text-2xl font-bold text-white">
            {totalStats.usersWithoutName > 0 ? (
              <span className="text-yellow-400">{totalStats.usersWithoutName}</span>
            ) : (
              <span className="text-green-400">0</span>
            )}
          </div>
          <div className="text-sm text-gray-400">Ofullständiga profiler</div>
          <div className="text-xs text-gray-500 mt-1">
            saknar namn
          </div>
        </div>
      </div>

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Hantera användare</h1>
          <p className="text-gray-400">
            {/* Visa antal baserat på filtrerade resultat */}
            {filteredUsers.length} användare matchar filter
          </p>
        </div>
        
        {/* Sök och filter */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch"> {/* items-stretch för lika höjd */}
          <div className="relative flex-grow"> {/* flex-grow för att sökrutan ska ta upp plats */}
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Sök namn/e-post..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} // Återställ sida vid sökning
              className="w-full pl-10 pr-4 py-2 h-full bg-navy-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          
          <select
            value={subscriptionFilter || ''}
            onChange={(e) => { setSubscriptionFilter(e.target.value || null); setCurrentPage(1); }} // Återställ sida vid filter
            className="px-3 py-2 h-full bg-navy-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="">Alla typer</option>
            <option value="free">Gratis</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>
      
      {/* Globalt felmeddelande (utanför modalen) */}
      {error && !showActionModal && ( // Visa endast om modalen inte är öppen (modalen har eget felområde)
        <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r mb-4" role="alert">
          <h2 className="text-lg font-semibold text-red-300 mb-1">Ett fel uppstod</h2>
          <p className="text-red-200">{error}</p>
        </div>
      )}
      
      {/* Användartabell */}
      <div className="bg-navy-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Laddar användare...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto"> {/* Behåll horisontell scroll för tabellen */}
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-navy-700/50"> {/* Lite transparens? */}
                  <tr>
                    <th 
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-navy-600/50 transition-colors"
                      onClick={() => handleSort('full_name')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Användare</span>
                        {getSortIcon('full_name')}
                      </div>
                    </th>
                    <th 
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-navy-600/50 transition-colors"
                      onClick={() => handleSort('subscription_tier')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Status</span> {/* Kanske "Status" är tydligare än "Prenumeration"? */}
                        {getSortIcon('subscription_tier')}
                      </div>
                    </th>
                    {/* --- RESPONSIVE: Dölj på små skärmar --- */}
                    <th 
                      scope="col"
                      className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-navy-600/50 transition-colors"
                      onClick={() => handleSort('saved_letters_count')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Brev</span>
                        {getSortIcon('saved_letters_count')}
                      </div>
                    </th>
                    <th 
                      scope="col"
                      className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-navy-600/50 transition-colors"
                      onClick={() => handleSort('cv_count')}
                    >
                      <div className="flex items-center gap-1">
                        <span>CV:n</span>
                        {getSortIcon('cv_count')}
                      </div>
                    </th>
                    <th 
                      scope="col"
                      className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-navy-600/50 transition-colors" // Dölj även på md, visa från lg?
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Registrerad</span>
                        {getSortIcon('created_at')}
                      </div>
                    </th>
                     {/* --- SLUT RESPONSIVE --- */}
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Åtgärder
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-navy-800 divide-y divide-gray-700">
                  {filteredUsers.length === 0 ? (
                     <tr>
                       <td colSpan={6} className="px-6 py-12 text-center"> {/* colSpan behöver matcha antalet VISADE kolumner */}
                         <div className="flex flex-col items-center">
                          <Users className="w-12 h-12 mx-auto text-gray-500 mb-3" />
                          <h3 className="text-lg font-semibold text-white mb-1">Inga användare hittades</h3>
                          <p className="text-gray-400 text-sm">
                            {searchTerm || subscriptionFilter 
                              ? 'Inga användare matchar dina filter.' 
                              : 'Det finns inga användare än.'}
                          </p>
                         </div>
                       </td>
                     </tr>
                  ) : (
                    getCurrentPageUsers().map((user) => (
                      <tr key={user.id} className="hover:bg-navy-700/60 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-navy-600 flex items-center justify-center ring-1 ring-navy-500">
                              <span className="text-sm font-medium text-white">
                                {user.full_name 
                                  ? user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() // Initialer (max 2)
                                  : user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {/* --- RESPONSIVE: Mindre marginal på små skärmar --- */}
                            <div className="ml-2 sm:ml-4"> 
                              <div className="text-sm font-medium text-white truncate max-w-[150px] sm:max-w-[250px]" title={user.full_name || 'Namnlös användare'}>
                                {user.full_name || <span className="italic text-gray-400">Namnlös</span>}
                              </div>
                              <div className="text-sm text-gray-400 truncate max-w-[150px] sm:max-w-[250px]" title={user.email}>{user.email}</div>
                            </div>
                             {/* --- SLUT RESPONSIVE --- */}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getSubscriptionBadge(user.subscription_tier)}
                        </td>
                         {/* --- RESPONSIVE: Dölj på små skärmar --- */}
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                          {user.saved_letters_count ?? 0} {/* Använd ?? för null/undefined */}
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                          {user.cv_count ?? 0}
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(user.created_at)}
                        </td>
                         {/* --- SLUT RESPONSIVE --- */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                           {/* Gör knappen lite mer synlig vid hover på raden */}
                          <button 
                            onClick={() => showUserActions(user)}
                            className="text-gray-400 hover:text-pink-400 opacity-50 group-hover:opacity-100 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-navy-800 transition-opacity"
                            aria-label={`Åtgärder för ${user.full_name || user.email}`}
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
            
            {/* Pagination and Page Size Selector */}
            {totalPages > 1 && ( // Visa bara pagination om det finns mer än en sida
              <div className="px-4 py-3 sm:px-6 flex flex-col md:flex-row items-center justify-between border-t border-gray-700 gap-4">
                {/* Page Size Selector */}
                 <div className="flex items-center gap-2">
                   <label htmlFor="pageSize" className="text-sm text-gray-400">Visa:</label>
                   <select
                     id="pageSize"
                     value={pageSize}
                     onChange={handlePageSizeChange}
                     className="px-2 py-1 bg-navy-700 border border-gray-600 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                   >
                     <option value={10}>10</option>
                     <option value={25}>25</option>
                     <option value={50}>50</option>
                     <option value={100}>100</option>
                   </select>
                   <span className="text-sm text-gray-400">per sida</span>
                 </div>

                {/* Pagination Info and Controls */}
                <div className="flex-1 flex justify-between sm:justify-end items-center w-full md:w-auto">
                  {/* Mobile Pagination (simple prev/next) */}
                  <div className="sm:hidden flex-1 flex justify-between">
                     <button
                       onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                       disabled={currentPage === 1}
                       className="relative inline-flex items-center px-3 py-1 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-navy-700 hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       Föreg.
                     </button>
                      <span className="text-sm text-gray-400 mx-2">
                        Sida {currentPage} av {totalPages}
                      </span>
                     <button
                       onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                       disabled={currentPage === totalPages}
                       className="relative inline-flex items-center px-3 py-1 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-navy-700 hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       Nästa
                     </button>
                   </div>

                   {/* Desktop Pagination (Numbers) */}
                   <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between md:justify-end">
                     <div>
                      <p className="text-sm text-gray-400">
                        Visar <span className="font-medium text-white">{(currentPage - 1) * pageSize + 1}</span>
                        {' '}till{' '} 
                        <span className="font-medium text-white">{Math.min(currentPage * pageSize, filteredUsers.length)}</span>
                        {' '}av{' '}
                        <span className="font-medium text-white">{filteredUsers.length}</span> resultat
                      </p>
                    </div>
                    <div className="ml-4"> {/* Marginal mellan text och knappar */}
                      {/* --- RESPONSIVE: Lägg till flex-wrap --- */}
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px flex-wrap" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} // Changed to relative navigation
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-navy-700 text-sm font-medium text-gray-300 hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed focus:z-10 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                          aria-label="Föregående sida"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        
                        {/* Page numbers (Consider implementing ellipsis for many pages later if needed) */}
                        {[...Array(totalPages)].map((_, i) => {
                           const pageNum = i + 1;
                           // Basic pagination logic: show first, last, current, and +- neighbors
                           const showPage = pageNum === 1 || pageNum === totalPages || pageNum === currentPage || Math.abs(pageNum - currentPage) <= 1;
                           // Add ellipsis logic later if totalPages is large
                           if (showPage) {
                             return (
                               <button
                                 key={pageNum}
                                 onClick={() => setCurrentPage(pageNum)}
                                 aria-current={currentPage === pageNum ? 'page' : undefined}
                                 className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 ${
                                   currentPage === pageNum
                                     ? 'z-10 bg-pink-600 text-white border-pink-500'
                                     : 'bg-navy-700 text-gray-300 border-gray-700 hover:bg-navy-600'
                                 }`}
                               >
                                 {pageNum}
                               </button>
                             );
                           } else if (Math.abs(pageNum - currentPage) === 2) {
                              // Placeholder for potential ellipsis
                              // return <span key={`ellipsis-${pageNum}`} className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-navy-700 text-sm font-medium text-gray-500">...</span>;
                           }
                           return null; // Don't render other page numbers for now
                          })}
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} // Changed to relative navigation
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-navy-700 text-sm font-medium text-gray-300 hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed focus:z-10 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                          aria-label="Nästa sida"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                 </div>
              </div>
            )} {/* End pagination conditional rendering */}
          </>
        )}
      </div>
      
      {/* User Action Modal */}
      {showActionModal && selectedUser && (
        <div 
           className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity" 
           onClick={closeActionModal} // Stäng vid klick utanför
           role="dialog"
           aria-modal="true"
           aria-labelledby="modal-title"
        >
          <div 
             className="bg-navy-800 rounded-lg p-6 w-full max-w-md relative shadow-xl border border-navy-700"
             onClick={(e) => e.stopPropagation()} // Förhindra att klick inuti stänger modalen
          >
            <button
              onClick={closeActionModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
              disabled={isUpdating}
              aria-label="Stäng modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 id="modal-title" className="text-xl font-semibold text-white mb-5">Hantera användare</h3>
            
            {/* User Info */}
            <div className="mb-6 border-b border-navy-700 pb-4">
              <div className="flex items-center">
                 <div className="flex-shrink-0 h-12 w-12 rounded-full bg-navy-600 flex items-center justify-center ring-1 ring-navy-500">
                    <span className="text-white text-lg font-medium">
                      {selectedUser.full_name 
                        ? selectedUser.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                        : selectedUser.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                <div className="ml-4">
                  <div className="text-lg font-medium text-white">
                    {selectedUser.full_name || <span className="italic text-gray-400">Namnlös användare</span>}
                  </div>
                  <div className="text-sm text-gray-400">{selectedUser.email}</div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div className="text-gray-400 font-medium">Status:</div>
                <div className="text-white">{getSubscriptionBadge(selectedUser.subscription_tier)}</div>
                
                <div className="text-gray-400 font-medium">Registrerad:</div>
                <div className="text-white">{formatDate(selectedUser.created_at)}</div>
                
                <div className="text-gray-400 font-medium">Sparade brev:</div>
                <div className="text-white">{selectedUser.saved_letters_count ?? 0}</div>
                
                <div className="text-gray-400 font-medium">CV:n:</div>
                <div className="text-white">{selectedUser.cv_count ?? 0}</div>
              </div>
            </div>
            
            {/* Action Feedback */}
            {updateSuccess && (
              <div className="mb-4 bg-green-600/20 border border-green-500/50 p-3 rounded-md text-center" role="status">
                <p className="text-sm text-green-300">{updateSuccess}</p>
              </div>
            )}
             {/* Felmeddelande specifikt för modalen */}
             {error && showActionModal && ( 
              <div className="mb-4 bg-red-900/30 border border-red-500/50 p-3 rounded-md text-center" role="alert">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
            
            {/* Actions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Åtgärder</h4>
              
              <div className="grid grid-cols-1 gap-3">
                {selectedUser.subscription_tier !== 'premium' && (
                  <button
                    onClick={handleUpgradeUser}
                    disabled={isUpdating}
                    className="flex items-center justify-center w-full px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-md hover:from-yellow-600 hover:to-amber-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-800 focus:ring-amber-500"
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
                    className="flex items-center justify-center w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-800 focus:ring-gray-500"
                  >
                    {isUpdating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    ) : (
                      <UserX className="w-4 h-4 mr-2" />
                    )}
                    Nedgradera till Free
                  </button>
                )}
                
                {/* Länk till detaljsida */}
                <Link 
                  href={`/admin/users/${selectedUser.id}`}
                  className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-800 focus:ring-blue-500"
                  onClick={() => setShowActionModal(false)} // Stäng modalen när man navigerar iväg
                >
                  <Eye className="w-4 h-4 mr-2" />
                   Visa detaljer
               </Link>
               
               {/* Ta bort-knapp (Fortfarande disabled - kräver bekräftelsedialog) */}
               {/* TODO: Implementera bekräftelsedialog innan borttagning */}
               <button
                 className="flex items-center justify-center w-full px-4 py-2 border border-red-600 text-red-500 rounded-md hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-800 focus:ring-red-500"
                 disabled // Håll inaktiverad tills bekräftelse finns
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