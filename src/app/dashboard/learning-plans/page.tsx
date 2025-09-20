// src/app/dashboard/learning-plans/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import {
  GraduationCap, Plus, Target, Calendar, Clock,
  TrendingUp, ChevronRight, Loader2, Award,
  BookOpen, Zap
} from 'lucide-react';

interface LearningPlan {
  id: string;
  title: string;
  target_role: string;
  created_at: string;
  status: 'active' | 'paused' | 'completed';
  match_score: number;
  total_skills: number;
  completed_skills: number;
  estimated_completion_date: string;
  learning_path: 'quick' | 'balanced' | 'comprehensive';
  time_commitment_hours: number;
}

export default function LearningPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLearningPlans();
  }, []);

  const fetchLearningPlans = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('learning_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setPlans(data || []);
    } catch (err: any) {
      console.error('Error fetching learning plans:', err);
      setError('Kunde inte hämta lärandeplaner');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getPathLabel = (path: string) => {
    const labels: Record<string, string> = {
      'quick': 'Snabbspår',
      'balanced': 'Balanserad',
      'comprehensive': 'Omfattande'
    };
    return labels[path] || path;
  };

  const getPathColor = (path: string) => {
    const colors: Record<string, string> = {
      'quick': 'bg-green-500',
      'balanced': 'bg-blue-500',
      'comprehensive': 'bg-purple-500'
    };
    return colors[path] || 'bg-gray-500';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      'active': { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Aktiv' },
      'paused': { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Pausad' },
      'completed': { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Slutförd' }
    };
    return badges[status] || badges.active;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-400">Laddar dina lärandeplaner...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchLearningPlans}
          className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Försök igen
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-pink-500" />
            Mina Lärandeplaner
          </h1>
          <Link
            href="/dashboard/kompetensutveckling"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all"
          >
            <Plus className="w-5 h-5" />
            Skapa ny plan
          </Link>
        </div>
        <p className="text-gray-400">
          Hantera dina personliga lärandeplaner och följ din utveckling
        </p>
      </div>

      {/* Stats Overview */}
      {plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-navy-800 rounded-lg p-4 border border-navy-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Aktiva planer</p>
                <p className="text-2xl font-bold text-white">
                  {plans.filter(p => p.status === 'active').length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-navy-800 rounded-lg p-4 border border-navy-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total kompetenser</p>
                <p className="text-2xl font-bold text-white">
                  {plans.reduce((acc, p) => acc + p.total_skills, 0)}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-navy-800 rounded-lg p-4 border border-navy-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Slutförda</p>
                <p className="text-2xl font-bold text-white">
                  {plans.reduce((acc, p) => acc + p.completed_skills, 0)}
                </p>
              </div>
              <Award className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>
      )}

      {/* Learning Plans Grid */}
      {plans.length === 0 ? (
        <div className="bg-navy-800 rounded-lg p-12 border border-navy-700 text-center">
          <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Inga lärandeplaner än
          </h3>
          <p className="text-gray-400 mb-6">
            Börja din kompetensutveckling genom att skapa din första lärandeplan
          </p>
          <Link
            href="/dashboard/kompetensutveckling"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition-all"
          >
            <Plus className="w-5 h-5" />
            Skapa din första plan
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {plans.map((plan) => {
            const progress = getProgressPercentage(plan.completed_skills, plan.total_skills);
            const statusBadge = getStatusBadge(plan.status);

            return (
              <div
                key={plan.id}
                className="bg-navy-800 rounded-lg border border-navy-700 hover:border-pink-500/50 transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {plan.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                      <p className="text-gray-400 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        {plan.target_role}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-pink-500">
                        {plan.match_score}%
                      </div>
                      <p className="text-xs text-gray-500">Matchning</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        {plan.completed_skills} av {plan.total_skills} kompetenser
                      </span>
                      <span className="text-sm font-medium text-white">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-navy-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${getPathColor(plan.learning_path)}`} />
                      <span className="text-gray-400">
                        {getPathLabel(plan.learning_path)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      {plan.time_commitment_hours}h/vecka
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(plan.estimated_completion_date).toLocaleDateString('sv-SE')}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/dashboard/learning-plan/${plan.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition-all"
                    >
                      Fortsätt lärande
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <button
                      className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg transition-colors"
                    >
                      <TrendingUp className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}