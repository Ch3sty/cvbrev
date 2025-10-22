'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import StudyHoursModal from '@/components/learning/StudyHoursModal';
import CompletedCourseModal from '@/components/learning/CompletedCourseModal';
import CompleteEducationModal from '@/components/learning/CompleteEducationModal';
import CourseSelectionModal from '@/components/learning/CourseSelectionModal';
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
  Zap,
  Plus,
  ExternalLink,
  GraduationCap,
  Trash2
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
  application_status?: 'not_applied' | 'applied' | 'accepted' | 'enrolled' | 'completed';
  start_date?: string;
  end_date?: string;
}

interface UserStats {
  currentStreak: number;
  totalXP: number;
  currentLevel: number;
  weeklyGoal: number;
  weeklyProgress: number;
  achievements: string[];
}

interface ProgressEntry {
  id: string;
  date: string;
  activity_type: string;
  activity_description: string;
  skill_id?: string;
  xp_earned: number;
  hours_spent?: number;
}

export default function LearningPlanPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const [planId, setPlanId] = useState<string>('');
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
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
  const [showStudyHoursModal, setShowStudyHoursModal] = useState(false);
  const [showCompletedCourseModal, setShowCompletedCourseModal] = useState(false);
  const [showCompleteEducationModal, setShowCompleteEducationModal] = useState(false);
  const [showCourseSelectionModal, setShowCourseSelectionModal] = useState(false);
  const [courseSelectionAction, setCourseSelectionAction] = useState<'applied' | 'accepted' | 'enrolled'>('applied');
  const [selectedSkillForProgress, setSelectedSkillForProgress] = useState<Skill | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function initializePage() {
      const resolvedParams = await params;
      setPlanId(resolvedParams.id);
      await loadLearningPlan(resolvedParams.id);
    }
    initializePage();
  }, [params]);

  const handleCourseSelection = async (selectedCourses: any[]) => {
    if (!selectedSkillForProgress) return;

    // Save the selected courses for this skill
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Register course enrollments
    for (const course of selectedCourses) {
      await supabase
        .from('user_course_enrollments')
        .insert({
          user_id: user.id,
          plan_id: planId,
          skill_id: selectedSkillForProgress.id,
          course_title: course.title,
          course_url: course.url,
          course_provider: course.provider,
          course_duration: course.duration,
          course_cost: course.cost,
          enrollment_status: courseSelectionAction
        });
    }

    // Update skill status based on action
    await updateProgress(selectedSkillForProgress.id, courseSelectionAction, 0);

    // Reload to show changes
    await loadLearningPlan(planId);
  };

  const handleResetSkill = async (skillId: string) => {
    try {
      const response = await fetch('/api/learning-plans/skills/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId,
          resetType: 'enrollment'
        })
      });

      if (response.ok) {
        await loadLearningPlan(planId);
      }
    } catch (error) {
      console.error('Error resetting skill:', error);
    }
  };

  const handleCourseEnrollment = async (skillId: string, course: any) => {
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const courseKey = `${skillId}-${course.title}`;

      if (enrolledCourses.has(courseKey)) {
        // Remove enrollment
        await supabase
          .from('user_course_enrollments')
          .delete()
          .eq('skill_id', skillId)
          .eq('course_title', course.title);

        setEnrolledCourses(prev => {
          const newSet = new Set(prev);
          newSet.delete(courseKey);
          return newSet;
        });
      } else {
        // Add enrollment
        await supabase
          .from('user_course_enrollments')
          .insert({
            user_id: user.id,
            plan_id: planId,
            skill_id: skillId,
            course_title: course.title,
            course_url: course.url,
            course_provider: course.provider,
            course_duration: course.duration,
            course_cost: course.cost,
            enrollment_status: 'applied'
          });

        setEnrolledCourses(prev => {
          const newSet = new Set(prev);
          newSet.add(courseKey);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error handling course enrollment:', error);
    }
  };

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

      // Load all progress entries for timeline
      const { data: allProgressEntries } = await supabase
        .from('learning_progress_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('plan_id', id)
        .order('date', { ascending: false })
        .limit(10);

      setProgressEntries(allProgressEntries || []);

      // Load enrolled courses
      const { data: enrollmentsData } = await supabase
        .from('user_course_enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('plan_id', id);

      if (enrollmentsData) {
        const enrolledSet = new Set(enrollmentsData.map(e => `${e.skill_id}-${e.course_title}`));
        setEnrolledCourses(enrolledSet);
      }

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
      // Determine XP based on activity type
      let xpEarned = 50; // Default
      let description = '';
      const skill = skills.find(s => s.id === skillId);

      switch(activityType) {
        case 'applied':
          xpEarned = 100;
          description = (skill?.estimated_hours || 0) > 100 ?
            `Ansökte till ${skill?.skill_name}` :
            `Anmälde sig till ${skill?.skill_name}`;
          break;
        case 'accepted':
          xpEarned = 200;
          description = `Blev antagen till ${skill?.skill_name}`;
          break;
        case 'enrolled':
          xpEarned = 150;
          description = `Påbörjade ${skill?.skill_name}`;
          break;
        case 'course_completed':
          xpEarned = 100;
          description = `Genomförde studietid i ${skill?.skill_name}`;
          break;
        case 'skill_completed':
          xpEarned = 500;
          description = `Slutförde ${skill?.skill_name}`;
          break;
        default:
          description = `Arbetade med ${skill?.skill_name}`;
      }

      const response = await fetch(`/api/learning-plans/${planId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId,
          hoursSpent,
          activityType,
          activityDescription: description,
          xpEarned
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
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Laddar din lärandeplan...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Lärandeplan ej hittad</h1>
        <p className="text-gray-600">Den begärda lärande-planen kunde inte hittas.</p>
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
                <p className="text-gray-600">Målroll: {plan.target_role}</p>
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
                    className="text-gray-200"
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
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#4F46E5" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{getProgressPercentage()}%</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-gray-700">{plan.completed_skills} av {plan.total_skills} färdigheter slutförda</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">{plan.time_commitment_hours} timmar total tidsåtgång</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">Matchning: {plan.match_score}%</span>
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

        {/* Quick Actions - Simplified without gamification */}
        <div className="lg:w-80 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Snabbåtgärder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="secondary" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Schemalägg studietid
              </Button>
              <Button className="w-full justify-start" variant="secondary" size="sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Visa kurskatalog
              </Button>
              <Button className="w-full justify-start" variant="secondary" size="sm">
                <Award className="w-4 h-4 mr-2" />
                Exportera certifikat
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-white/80 backdrop-blur-xl p-1 rounded-lg w-fit border border-gray-200/50 shadow-xl">
        {[
          { key: 'overview', label: 'Översikt', icon: Target },
          { key: 'skills', label: 'Kompetensutveckling', icon: BookOpen },
          { key: 'progress', label: 'Framsteg', icon: Award }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
              {(() => {
                // Find skills that are actively being worked on
                const enrolledSkills = skills.filter(s => s.application_status === 'enrolled');
                const acceptedSkills = skills.filter(s => s.application_status === 'accepted');
                const appliedSkills = skills.filter(s => s.application_status === 'applied');
                const notAppliedSkills = skills.filter(s => !s.application_status || s.application_status === 'not_applied');

                if (enrolledSkills.length > 0) {
                  return (
                    <div className="space-y-4">
                      {enrolledSkills.map(skill => (
                        <div key={skill.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{skill.skill_name}</h4>
                            <Badge variant="outline" className="text-blue-600 border-blue-600">Pågår</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {skill.actual_hours || 0}h av {skill.estimated_hours}h slutfört
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full"
                              style={{ width: `${Math.min(((skill.actual_hours || 0) / skill.estimated_hours) * 100, 100)}%` }}
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setSelectedSkillForProgress(skill);
                                setShowStudyHoursModal(true);
                              }}
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Studietimmar
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setSelectedSkillForProgress(skill);
                                setShowCompletedCourseModal(true);
                              }}
                            >
                              <Award className="w-4 h-4 mr-2" />
                              Avslutad kurs
                            </Button>
                            {(skill.actual_hours || 0) >= skill.estimated_hours * 0.5 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedSkillForProgress(skill);
                                  setShowCompleteEducationModal(true);
                                }}
                              >
                                <GraduationCap className="w-4 h-4 mr-2" />
                                Slutför
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                } else if (acceptedSkills.length > 0) {
                  return (
                    <div className="space-y-4">
                      {acceptedSkills.map(skill => (
                        <div key={skill.id} className="border border-green-500/30 bg-green-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">{skill.skill_name}</h4>
                          <p className="text-sm text-green-700 mb-3">
                            🎉 Grattis! Du har blivit antagen!
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => updateProgress(skill.id, 'enrolled', 0)}
                              disabled={isUpdatingProgress}
                            >
                              {isUpdatingProgress ? 'Startar...' : 'Markera som påbörjad'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                } else if (appliedSkills.length > 0) {
                  return (
                    <div className="space-y-4">
                      <div className="border border-orange-500/30 bg-orange-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Väntar på antagningsbesked</h4>
                        <p className="text-sm text-orange-700 mb-3">
                          Du har ansökt till {appliedSkills.length} utbildning{appliedSkills.length > 1 ? 'ar' : ''}
                        </p>
                        <ul className="space-y-1">
                          {appliedSkills.map(skill => (
                            <li key={skill.id} className="text-sm text-gray-700">
                              • {skill.skill_name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                } else if (notAppliedSkills.length > 0) {
                  return (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="font-semibold text-gray-900 mb-2">Börja din utbildningsresa</h4>
                      <p className="text-gray-600 mb-4">
                        {notAppliedSkills.length} utbildning{notAppliedSkills.length > 1 ? 'ar' : ''} väntar på din ansökan
                      </p>
                      <Button
                        onClick={() => setActiveTab('skills')}
                      >
                        Visa utbildningar
                      </Button>
                    </div>
                  );
                } else {
                  return (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                      <h4 className="font-semibold text-gray-900 mb-2">Alla färdigheter slutförda!</h4>
                      <p className="text-gray-600">Grattis till din prestation!</p>
                    </div>
                  );
                }
              })()}
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
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {achievement === 'first_course' && 'Första kursen!'}
                          {achievement === 'week_streak' && 'Veckostreak!'}
                          {achievement === 'skill_master' && 'Färdighetsmästare!'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {achievement === 'first_course' && 'Slutförde din första kurs'}
                          {achievement === 'week_streak' && 'Lärde dig 7 dagar i rad'}
                          {achievement === 'skill_master' && 'Behärskade en färdighet'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Inga prestationer än. Börja lära dig för att låsa upp dina första badges!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="space-y-6">
          {skills.map((skill, index) => {
            // Determine if this is a long education (>100 hours)
            const isLongEducation = skill.estimated_hours > 100;
            const applicationStatus = skill.application_status || 'not_applied';

            const getStatusConfig = () => {
              switch (applicationStatus) {
                case 'applied':
                  return {
                    badge: <Badge variant="outline" className="text-orange-400 border-orange-400 bg-orange-400/10">Ansökt</Badge>,
                    iconBg: 'bg-orange-500',
                    progressColor: 'from-orange-500 to-red-500'
                  };
                case 'accepted':
                  return {
                    badge: <Badge variant="outline" className="text-green-400 border-green-400 bg-green-400/10">Antagen</Badge>,
                    iconBg: 'bg-green-500',
                    progressColor: 'from-green-500 to-emerald-500'
                  };
                case 'enrolled':
                  return {
                    badge: <Badge variant="outline" className="text-blue-400 border-blue-400 bg-blue-400/10">Pågår</Badge>,
                    iconBg: 'bg-blue-500',
                    progressColor: 'from-blue-500 to-purple-500'
                  };
                case 'completed':
                  return {
                    badge: <Badge variant="outline" className="text-emerald-400 border-emerald-400 bg-emerald-400/10">Slutförd</Badge>,
                    iconBg: 'bg-emerald-500',
                    progressColor: 'from-emerald-500 to-green-500'
                  };
                default:
                  return {
                    badge: null,
                    iconBg: 'bg-navy-600',
                    progressColor: 'from-gray-500 to-gray-600'
                  };
              }
            };

            const getEducationLength = () => {
              const hours = skill.estimated_hours;
              if (hours >= 1600) return `${Math.round(hours / 1600)} år`;
              if (hours >= 800) return `${Math.round(hours / 800)} termin(er)`;
              if (hours >= 160) return `${Math.round(hours / 160)} månad(er)`;
              if (hours >= 40) return `${Math.round(hours / 40)} veckor`;
              return `${hours} timmar`;
            };

            const statusConfig = getStatusConfig();
            const progressPercentage = applicationStatus === 'enrolled' ? Math.min(((skill.actual_hours || 0) / skill.estimated_hours) * 100, 100) : 0;

            return (
              <Card key={skill.id} className="group hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 border-gray-200 hover:border-blue-500/30">
                <CardContent className="p-0">
                  {/* Premium Skill Header */}
                  <div className="relative p-4 pb-0 overflow-hidden">
                    {/* Subtle background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-blue-500/5 opacity-60"></div>

                    <div className="relative flex items-start gap-4">
                      {/* Premium Number Indicator */}
                      <div className="relative flex-shrink-0">
                        <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center ${statusConfig.iconBg} shadow-lg border border-white/10 group-hover:scale-105 transition-all duration-300 backdrop-blur-sm`}>
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent"></div>
                          {applicationStatus === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-white relative z-10" />
                          ) : (
                            <span className="text-white font-bold text-lg relative z-10">{index + 1}</span>
                          )}
                          {/* Animated border for enrolled status */}
                          {applicationStatus === 'enrolled' && (
                            <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/50 animate-pulse"></div>
                          )}
                        </div>
                        {/* Progress indicator */}
                        {applicationStatus === 'enrolled' && progressPercentage > 0 && (
                          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-gray-200 shadow">
                            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>

                      {/* Premium Skill Info */}
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            {/* Badge Row */}
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="px-2 py-0.5 text-xs font-medium text-gray-900 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 backdrop-blur-sm"
                              >
                                KOMPETENSOMRÅDE
                              </Badge>
                              {statusConfig.badge}
                            </div>

                            {/* Skill Title */}
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-200 leading-tight">
                              {skill.skill_name}
                            </h3>
                          </div>

                          {/* Importance Badge */}
                          <Badge
                            variant={skill.importance === 'essential' ? 'default' : 'secondary'}
                            className={`px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                              skill.importance === 'essential'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white shadow-md hover:shadow-blue-500/20'
                                : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {skill.importance === 'essential' ? 'Kritisk' : skill.importance === 'desirable' ? 'Önskvärd' : 'Valfri'}
                          </Badge>
                        </div>

                        {/* Compact Metadata */}
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          {/* Level */}
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-xs font-medium text-gray-600">Nivå:</span>
                            <span className="text-xs font-semibold text-gray-900">
                              {skill.skill_level === 'foundation' ? 'Grund' : skill.skill_level === 'intermediate' ? 'Medel' : 'Avancerad'}
                            </span>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="text-xs font-medium text-gray-600">Tid:</span>
                            <span className="text-xs font-semibold text-gray-900">{getEducationLength()}</span>
                          </div>

                          {/* Start Date */}
                          {skill.start_date && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                              <Calendar className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-xs font-medium text-gray-600">Start:</span>
                              <span className="text-xs font-semibold text-gray-900">{new Date(skill.start_date).toLocaleDateString('sv-SE')}</span>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar for Enrolled Skills */}
                        {applicationStatus === 'enrolled' && (
                          <div className="mt-3 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-gray-600">Framsteg</span>
                              <span className="text-xs text-gray-600">
                                {skill.actual_hours || 0}h / {skill.estimated_hours}h ({progressPercentage.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${statusConfig.progressColor} rounded-full transition-all duration-1000 ease-out`}
                                style={{ width: `${progressPercentage}%` }}
                              >
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Course Options Section */}
                  {skill.courses && skill.courses.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                        <h4 className="text-sm font-semibold text-gray-700">Utbildningsväg för denna kompetens</h4>
                        <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                      </div>

                      <div className="grid gap-2">
                        {skill.courses.map((course: any, idx: number) => {
                          const isEnrolled = enrolledCourses.has(`${skill.id}-${course.title}`);
                          return (
                            <div
                              key={idx}
                              className={`relative p-3 rounded-lg border transition-all duration-200 ${
                                isEnrolled
                                  ? 'border-green-500/30 bg-green-50'
                                  : 'border-gray-200 bg-gray-50 hover:border-blue-500/30 hover:bg-white'
                              }`}
                            >
                              {isEnrolled && (
                                <div className="absolute top-2 right-2">
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                </div>
                              )}

                              <div className="space-y-2">
                                {/* Course Title and Details on same row */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 space-y-1">
                                    {course.url ? (
                                      <a
                                        href={course.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-gray-900 hover:text-blue-700 transition-colors duration-200 flex items-center gap-1.5 group/link"
                                      >
                                        {course.title || course.name || course}
                                        <ExternalLink className="w-3 h-3 opacity-60 group-hover/link:opacity-100 transition-opacity" />
                                      </a>
                                    ) : (
                                      <h5 className="text-sm font-medium text-gray-900">
                                        {course.title || course.name || course}
                                      </h5>
                                    )}

                                    {/* Course Details */}
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                                      {course.provider && (
                                        <span>{course.provider}</span>
                                      )}
                                      {course.duration && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {course.duration}
                                        </span>
                                      )}
                                      {course.cost && (
                                        <span>{course.cost}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons Section */}
                  <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/50">
                    <div className="flex flex-wrap gap-2">
                      {applicationStatus === 'not_applied' && (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 text-white text-xs font-medium shadow-md hover:shadow-blue-500/20 transition-all duration-200"
                          onClick={() => {
                            setSelectedSkillForProgress(skill);
                            setCourseSelectionAction('applied');
                            setShowCourseSelectionModal(true);
                          }}
                          disabled={isUpdatingProgress}
                        >
                          <PlayCircle className="w-3 h-3 mr-1" />
                          Markera som anmäld till kurser ovan
                        </Button>
                      )}

                      {applicationStatus === 'applied' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500/30 text-green-300 text-xs hover:bg-green-500/10 hover:border-green-400"
                          onClick={() => {
                            setSelectedSkillForProgress(skill);
                            setCourseSelectionAction('accepted');
                            setShowCourseSelectionModal(true);
                          }}
                          disabled={isUpdatingProgress}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Markera som antagen till kurs ovan
                        </Button>
                      )}

                      {applicationStatus === 'accepted' && (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 text-white text-xs font-medium"
                          onClick={() => {
                            setSelectedSkillForProgress(skill);
                            setCourseSelectionAction('enrolled');
                            setShowCourseSelectionModal(true);
                          }}
                          disabled={isUpdatingProgress}
                        >
                          <PlayCircle className="w-3 h-3 mr-1" />
                          Påbörja studier för kurs ovan
                        </Button>
                      )}

                      {applicationStatus === 'enrolled' && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="hover:bg-navy-600 text-xs"
                            onClick={() => {
                              setSelectedSkillForProgress(skill);
                              setShowStudyHoursModal(true);
                            }}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Logga timmar
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="hover:bg-navy-600 text-xs"
                            onClick={() => {
                              setSelectedSkillForProgress(skill);
                              setShowCompletedCourseModal(true);
                            }}
                          >
                            <Award className="w-3 h-3 mr-1" />
                            Avslutad kurs
                          </Button>
                          {progressPercentage >= 50 && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-emerald-500/30 text-emerald-300 text-xs hover:bg-emerald-500/10"
                              onClick={() => {
                                setSelectedSkillForProgress(skill);
                                setShowCompleteEducationModal(true);
                              }}
                            >
                              <GraduationCap className="w-3 h-3 mr-1" />
                              Slutför
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-300 text-xs hover:bg-red-500/10"
                            onClick={() => {
                              if (confirm('Vill du verkligen ta bort denna påbörjade utbildning? All progress kommer att nollställas.')) {
                                handleResetSkill(skill.id);
                              }
                            }}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Ta bort
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
                {progressEntries.length > 0 ? (
                  progressEntries.map((entry) => {
                    const getIcon = () => {
                      switch (entry.activity_type) {
                        case 'course_completed': return <CheckCircle className="w-4 h-4 text-white" />;
                        case 'module_started': return <PlayCircle className="w-4 h-4 text-white" />;
                        case 'skill_completed': return <Star className="w-4 h-4 text-white" />;
                        case 'applied': return <BookOpen className="w-4 h-4 text-white" />;
                        case 'accepted': return <Award className="w-4 h-4 text-white" />;
                        default: return <Zap className="w-4 h-4 text-white" />;
                      }
                    };

                    const getColor = () => {
                      switch (entry.activity_type) {
                        case 'course_completed': return 'bg-emerald-500';
                        case 'module_started': return 'bg-blue-500';
                        case 'skill_completed': return 'bg-purple-500';
                        case 'applied': return 'bg-orange-500';
                        case 'accepted': return 'bg-green-500';
                        default: return 'bg-gray-500';
                      }
                    };

                    const getDaysAgo = () => {
                      const days = Math.floor((Date.now() - new Date(entry.date).getTime()) / (1000 * 60 * 60 * 24));
                      if (days === 0) return 'Idag';
                      if (days === 1) return 'Igår';
                      return `För ${days} dagar sedan`;
                    };

                    return (
                      <div key={entry.id} className="flex items-start gap-3">
                        <div className={`w-8 h-8 ${getColor()} rounded-full flex items-center justify-center`}>
                          {getIcon()}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{entry.activity_description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-gray-600">{getDaysAgo()}</p>
                            {entry.xp_earned > 0 && (
                              <span className="text-xs text-green-600">+{entry.xp_earned} XP</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Ingen aktivitet ännu. Börja din utbildningsresa!</p>
                  </div>
                )}
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
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-700">Total studietid</span>
                  <span className="font-bold text-gray-900">
                    {skills.reduce((sum, skill) => sum + (skill.actual_hours || 0), 0)}h
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-700">Slutförda utbildningar</span>
                  <span className="font-bold text-gray-900">
                    {skills.filter(s => s.application_status === 'completed' || s.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-700">Pågående utbildningar</span>
                  <span className="font-bold text-gray-900">
                    {skills.filter(s => s.application_status === 'enrolled').length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-700">Status</span>
                  <span className="font-bold text-gray-900">
                    {skills.filter(s => s.application_status === 'applied').length > 0 &&
                      `${skills.filter(s => s.application_status === 'applied').length} ansökningar`}
                    {skills.filter(s => s.application_status === 'accepted').length > 0 &&
                      `${skills.filter(s => s.application_status === 'accepted').length} antagningar`}
                    {skills.filter(s => s.application_status === 'enrolled').length > 0 &&
                      `${skills.filter(s => s.application_status === 'enrolled').length} pågående`}
                    {!skills.some(s => ['applied', 'accepted', 'enrolled'].includes(s.application_status || '')) &&
                      'Inga aktiva'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Study Hours Modal */}
      {showStudyHoursModal && selectedSkillForProgress && (
        <StudyHoursModal
          isOpen={showStudyHoursModal}
          onClose={() => {
            setShowStudyHoursModal(false);
            setSelectedSkillForProgress(null);
          }}
          skillId={selectedSkillForProgress.id}
          skillName={selectedSkillForProgress.skill_name}
          planId={planId}
          onSuccess={() => {
            loadLearningPlan(planId);
            setShowStudyHoursModal(false);
            setSelectedSkillForProgress(null);
          }}
        />
      )}

      {/* Completed Course Modal */}
      {showCompletedCourseModal && selectedSkillForProgress && (
        <CompletedCourseModal
          isOpen={showCompletedCourseModal}
          onClose={() => {
            setShowCompletedCourseModal(false);
            setSelectedSkillForProgress(null);
          }}
          skillId={selectedSkillForProgress.id}
          skillName={selectedSkillForProgress.skill_name}
          planId={planId}
          onSuccess={() => {
            loadLearningPlan(planId);
            setShowCompletedCourseModal(false);
            setSelectedSkillForProgress(null);
          }}
        />
      )}

      {/* Complete Education Modal */}
      {showCompleteEducationModal && selectedSkillForProgress && (
        <CompleteEducationModal
          isOpen={showCompleteEducationModal}
          onClose={() => {
            setShowCompleteEducationModal(false);
            setSelectedSkillForProgress(null);
          }}
          skillId={selectedSkillForProgress.id}
          skillName={selectedSkillForProgress.skill_name}
          planId={planId}
          totalHours={selectedSkillForProgress.estimated_hours}
          onSuccess={() => {
            loadLearningPlan(planId);
            setShowCompleteEducationModal(false);
            setSelectedSkillForProgress(null);
          }}
        />
      )}

      {/* Course Selection Modal */}
      {showCourseSelectionModal && selectedSkillForProgress && (
        <CourseSelectionModal
          isOpen={showCourseSelectionModal}
          onClose={() => {
            setShowCourseSelectionModal(false);
            setSelectedSkillForProgress(null);
          }}
          skillId={selectedSkillForProgress.id}
          skillName={selectedSkillForProgress.skill_name}
          courses={selectedSkillForProgress.courses || []}
          action={courseSelectionAction}
          onConfirm={handleCourseSelection}
        />
      )}
    </div>
  );
}