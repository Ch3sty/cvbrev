'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import {
  Trophy,
  Target,
  Clock,
  Star,
  Flame,
  CheckCircle,
  PlayCircle,
  Calendar,
  TrendingUp,
  Award,
  BookOpen,
  Zap
} from 'lucide-react';

// Types
interface LearningPlan {
  id: string;
  title: string;
  target_role: string;
  status: string;
  match_score: number;
  total_skills: number;
  completed_skills: number;
  time_commitment_hours: number;
  estimated_completion_date: string;
  created_at: string;
}

interface Skill {
  id: string;
  skill_name: string;
  skill_level: string;
  importance: string;
  status: string;
  estimated_hours: number;
  actual_hours: number;
  courses: any[];
  order_index: number;
}

interface UserStats {
  currentStreak: number;
  totalXP: number;
  currentLevel: number;
  weeklyGoal: number;
  weeklyProgress: number;
  achievements: string[];
}

export default function LearningPlanPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const [planId, setPlanId] = useState<string>('');
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    currentStreak: 0,
    totalXP: 0,
    currentLevel: 1,
    weeklyGoal: 10,
    weeklyProgress: 0,
    achievements: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'progress'>('overview');
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  useEffect(() => {
    async function initializePage() {
      const resolvedParams = await params;
      setPlanId(resolvedParams.id);
      await loadLearningPlan(resolvedParams.id);
    }
    initializePage();
  }, [params]);

  const loadLearningPlan = async (id: string) => {
    try {
      setIsLoading(true);
      const supabase = getSupabaseClient();

      // Load learning plan
      const { data: planData, error: planError } = await supabase
        .from('learning_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (planError) throw planError;
      setPlan(planData);

      // Load skills for this plan
      const { data: skillsData, error: skillsError } = await supabase
        .from('learning_plan_skills')
        .select('*')
        .eq('plan_id', id)
        .order('order_index');

      if (skillsError) throw skillsError;
      setSkills(skillsData || []);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load or create gamification stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_gamification_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('plan_id', id)
        .single();

      let finalStatsData = statsData;

      if (statsError && statsError.code === 'PGRST116') {
        // No stats exist, create initial stats
        const { data: newStats } = await supabase
          .from('user_gamification_stats')
          .insert({
            user_id: user.id,
            plan_id: id,
            total_xp: 0,
            current_level: 1,
            current_streak: 0,
            weekly_goal_hours: planData.time_commitment_hours || 10,
            weekly_progress_hours: 0
          })
          .select()
          .single();
        finalStatsData = newStats;
      }

      // Load user achievements
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('achievement_key')
        .eq('user_id', user.id)
        .eq('plan_id', id);

      // Calculate weekly progress from last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: weeklyProgressData } = await supabase
        .from('learning_progress_entries')
        .select('hours_spent')
        .eq('user_id', user.id)
        .eq('plan_id', id)
        .gte('date', weekAgo.toISOString().split('T')[0]);

      const weeklyHours = weeklyProgressData?.reduce((sum, entry) => sum + Number(entry.hours_spent), 0) || 0;

      // Set user stats with real data
      setUserStats({
        currentStreak: finalStatsData?.current_streak || 0,
        totalXP: finalStatsData?.total_xp || 0,
        currentLevel: finalStatsData?.current_level || 1,
        weeklyGoal: finalStatsData?.weekly_goal_hours || 10,
        weeklyProgress: weeklyHours,
        achievements: achievementsData?.map(a => a.achievement_key) || []
      });

    } catch (error) {
      console.error('Error loading learning plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (!plan || plan.total_skills === 0) return 0;
    return Math.round((plan.completed_skills / plan.total_skills) * 100);
  };

  const getNextLevelXP = () => {
    return userStats.currentLevel * 1000;
  };

  const getCurrentLevelProgress = () => {
    const currentLevelXP = (userStats.currentLevel - 1) * 1000;
    const progressInLevel = userStats.totalXP - currentLevelXP;
    return Math.min((progressInLevel / 1000) * 100, 100);
  };

  const getLevelTitle = (level: number) => {
    const titles = {
      1: 'Nybörjare',
      2: 'Utforskare',
      3: 'Utvecklare',
      4: 'Expert',
      5: 'Specialist'
    };
    return titles[level as keyof typeof titles] || 'Mästare';
  };

  // Function to update progress
  const updateProgress = async (skillId: string, activityType: string, hoursSpent = 0.5) => {
    if (isUpdatingProgress || !planId) return;

    setIsUpdatingProgress(true);
    try {
      const response = await fetch(`/api/learning-plans/${planId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId,
          hoursSpent,
          activityType,
          activityDescription: `Arbetade med ${skills.find(s => s.id === skillId)?.skill_name}`,
          xpEarned: activityType === 'skill_completed' ? 200 : 50
        })
      });

      if (!response.ok) throw new Error('Failed to update progress');

      const data = await response.json();

      // Reload the page data to show updated stats
      await loadLearningPlan(planId);

      // Show success message (you could add a toast notification here)
      console.log('Progress updated!', data);
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Laddar din lärandeplan...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-4">Lärandeplan ej hittad</h1>
        <p className="text-gray-400">Den begärda lärande-planen kunde inte hittas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Progress Card */}
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{plan.title}</CardTitle>
                <p className="text-gray-400">Målroll: {plan.target_role}</p>
              </div>
              <Badge
                variant={plan.status === 'active' ? 'success' : 'secondary'}
                className="text-sm"
              >
                {plan.status === 'active' ? 'Aktiv' : 'Utkast'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-6">
              {/* Circular Progress */}
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-navy-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${getProgressPercentage() * 2.51} 251`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#E9457A" />
                      <stop offset="100%" stopColor="#9333EA" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{getProgressPercentage()}%</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-gray-300">{plan.completed_skills} av {plan.total_skills} färdigheter slutförda</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-300">{plan.time_commitment_hours} timmar total tidsåtgång</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-pink-500" />
                  <span className="text-gray-300">Matchning: {plan.match_score}%</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <Button className="flex-1" size="sm">
                <PlayCircle className="w-4 h-4 mr-2" />
                Fortsätt lärande
              </Button>
              <Button variant="secondary" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Schemalägg
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Gamification Stats */}
        <div className="lg:w-80 space-y-4">
          {/* Level & XP */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold">Nivå {userStats.currentLevel}</span>
                </div>
                <span className="text-sm text-gray-400">{getLevelTitle(userStats.currentLevel)}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">XP</span>
                  <span className="text-white">{userStats.totalXP} / {getNextLevelXP()}</span>
                </div>
                <div className="w-full bg-navy-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${getCurrentLevelProgress()}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streak Counter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Flame className="w-6 h-6 text-orange-500" />
                    {userStats.currentStreak > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{userStats.currentStreak}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">Streak</p>
                    <p className="text-xs text-gray-400">dagar i rad</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-500">{userStats.currentStreak}</p>
                  <p className="text-xs text-gray-400">Fantastiskt!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Goal */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">Veckomål</span>
                </div>
                <span className="text-sm text-gray-400">{userStats.weeklyProgress}h / {userStats.weeklyGoal}h</span>
              </div>
              <div className="w-full bg-navy-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((userStats.weeklyProgress / userStats.weeklyGoal) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {userStats.weeklyProgress >= userStats.weeklyGoal
                  ? 'Mål uppnått! Bra jobbat!'
                  : `${userStats.weeklyGoal - userStats.weeklyProgress} timmar kvar`
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-navy-800 p-1 rounded-lg w-fit">
        {[
          { key: 'overview', label: 'Översikt', icon: Target },
          { key: 'skills', label: 'Färdigheter', icon: BookOpen },
          { key: 'progress', label: 'Framsteg', icon: Award }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-pink-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-navy-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Focus */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Aktuellt fokus
              </CardTitle>
            </CardHeader>
            <CardContent>
              {skills.find(skill => skill.status === 'in_progress') ? (
                <div className="space-y-4">
                  {skills.filter(skill => skill.status === 'in_progress').map(skill => (
                    <div key={skill.id} className="border border-navy-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white">{skill.skill_name}</h4>
                        <Badge variant={skill.importance === 'essential' ? 'default' : 'secondary'}>
                          {skill.importance === 'essential' ? 'Kritisk' : 'Önskvärd'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        {skill.actual_hours}h av {skill.estimated_hours}h slutfört
                      </p>
                      <div className="w-full bg-navy-700 rounded-full h-2 mb-3">
                        <div
                          className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${Math.min((skill.actual_hours / skill.estimated_hours) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => updateProgress(skill.id, 'module_started', 0.5)}
                        disabled={isUpdatingProgress}
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        {isUpdatingProgress ? 'Uppdaterar...' : `Fortsätt med ${skill.skill_name}`}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PlayCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h4 className="font-semibold text-white mb-2">Redo att börja?</h4>
                  <p className="text-gray-400 mb-4">Välj en färdighet att fokusera på</p>
                  <Button
                    onClick={() => {
                      const firstSkill = skills.find(s => s.status === 'pending');
                      if (firstSkill) {
                        updateProgress(firstSkill.id, 'module_started', 0.5);
                      }
                    }}
                    disabled={isUpdatingProgress || skills.length === 0}
                  >
                    {isUpdatingProgress ? 'Startar...' : 'Börja första färdigheten'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Senaste prestationer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userStats.achievements.length > 0 ? (
                  userStats.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-navy-700 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {achievement === 'first_course' && 'Första kursen!'}
                          {achievement === 'week_streak' && 'Veckostreak!'}
                          {achievement === 'skill_master' && 'Färdighetsmästare!'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {achievement === 'first_course' && 'Slutförde din första kurs'}
                          {achievement === 'week_streak' && 'Lärde dig 7 dagar i rad'}
                          {achievement === 'skill_master' && 'Behärskade en färdighet'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Inga prestationer än. Börja lära dig för att låsa upp dina första badges!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="space-y-4">
          {skills.map((skill, index) => (
            <Card key={skill.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        skill.status === 'completed' ? 'bg-emerald-500' :
                        skill.status === 'in_progress' ? 'bg-blue-500' :
                        'bg-navy-700'
                      }`}>
                        {skill.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-white">{skill.skill_name}</h3>
                      <Badge variant={skill.importance === 'essential' ? 'default' : 'secondary'}>
                        {skill.importance === 'essential' ? 'Kritisk' : skill.importance === 'desirable' ? 'Önskvärd' : 'Valfri'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <span>Nivå: {skill.skill_level === 'foundation' ? 'Grund' : skill.skill_level === 'intermediate' ? 'Medel' : 'Avancerad'}</span>
                      <span>•</span>
                      <span>{skill.estimated_hours} timmar</span>
                      <span>•</span>
                      <span>{skill.courses?.length || 0} kurser</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-navy-700 rounded-full h-2 mb-4">
                      <div
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          skill.status === 'completed' ? 'bg-emerald-500' :
                          skill.status === 'in_progress' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                          'bg-gray-600'
                        }`}
                        style={{
                          width: skill.status === 'completed' ? '100%' :
                                skill.status === 'in_progress' ? `${Math.min((skill.actual_hours / skill.estimated_hours) * 100, 100)}%` :
                                '0%'
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">
                        {skill.status === 'completed' ? 'Slutförd!' :
                         skill.status === 'in_progress' ? `${skill.actual_hours}h av ${skill.estimated_hours}h` :
                         'Inte påbörjad'}
                      </span>

                      {skill.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant={skill.status === 'in_progress' ? 'default' : 'secondary'}
                          onClick={() => updateProgress(
                            skill.id,
                            skill.status === 'pending' ? 'module_started' : 'course_completed',
                            skill.status === 'pending' ? 0.5 : 1
                          )}
                          disabled={isUpdatingProgress}
                        >
                          {isUpdatingProgress ? 'Uppdaterar...' : skill.status === 'in_progress' ? 'Fortsätt' : 'Börja'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Progress Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Framstegstidslinje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Placeholder progress items */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Slutförde "JavaScript Grundkurs"</p>
                    <p className="text-sm text-gray-400">För 2 dagar sedan</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <PlayCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Påbörjade "React Fundamentals"</p>
                    <p className="text-sm text-gray-400">För 1 dag sedan</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Fick "Veckostreak" badge</p>
                    <p className="text-sm text-gray-400">Idag</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Lärande-statistik</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-navy-700 rounded-lg">
                  <span className="text-gray-300">Total studietid</span>
                  <span className="font-bold text-white">{skills.reduce((sum, skill) => sum + skill.actual_hours, 0)}h</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-navy-700 rounded-lg">
                  <span className="text-gray-300">Slutförda färdigheter</span>
                  <span className="font-bold text-white">{skills.filter(s => s.status === 'completed').length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-navy-700 rounded-lg">
                  <span className="text-gray-300">Pågående färdigheter</span>
                  <span className="font-bold text-white">{skills.filter(s => s.status === 'in_progress').length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-navy-700 rounded-lg">
                  <span className="text-gray-300">Uppskattad tid kvar</span>
                  <span className="font-bold text-white">
                    {skills.reduce((sum, skill) => {
                      return sum + (skill.estimated_hours - skill.actual_hours);
                    }, 0)}h
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}