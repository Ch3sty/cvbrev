// /app/api/learning-plans/[id]/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

export const maxDuration = 10;

// POST - Add progress entry and update stats
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    console.log('--- API /learning-plans/[id]/progress: POST request initiated');

    try {
        const cookieStore = await cookies();
        const supabase = createServerClient({ cookies: cookieStore });
        const { id: planId } = await params;

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Ej autentiserad' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            skillId,
            hoursSpent = 0,
            activityType, // 'applied', 'accepted', 'enrolled', 'course_completed', 'module_started', 'skill_completed', 'study_session'
            activityDescription,
            xpEarned = 50, // Default XP
            studyMethod,
            studyQuality,
            notes,
            date
        } = body;

        // Verify ownership
        const { data: plan, error: planError } = await supabase
            .from('learning_plans')
            .select('id, time_commitment_hours')
            .eq('id', planId)
            .eq('user_id', user.id)
            .single();

        if (planError || !plan) {
            return NextResponse.json(
                { error: 'Lärandeplan hittades inte' },
                { status: 404 }
            );
        }

        // Create progress entry
        const { data: progressEntry, error: progressError } = await supabase
            .from('learning_progress_entries')
            .insert({
                user_id: user.id,
                plan_id: planId,
                skill_id: skillId,
                hours_spent: hoursSpent,
                xp_earned: xpEarned,
                activity_type: activityType,
                activity_description: activityDescription,
                date: date || new Date().toISOString().split('T')[0],
                study_method: studyMethod || null,
                study_quality_rating: studyQuality || null,
                notes: notes || null
            })
            .select()
            .single();

        if (progressError) {
            throw progressError;
        }

        // Get or create gamification stats
        const { data: stats, error: statsError } = await supabase
            .from('user_gamification_stats')
            .select('*')
            .eq('user_id', user.id)
            .eq('plan_id', planId)
            .single();

        let finalStats = stats;

        if (statsError && statsError.code === 'PGRST116') {
            // Create initial stats
            const { data: newStats } = await supabase
                .from('user_gamification_stats')
                .insert({
                    user_id: user.id,
                    plan_id: planId,
                    total_xp: xpEarned,
                    current_level: 1,
                    current_streak: 1,
                    weekly_goal_hours: plan.time_commitment_hours || 10,
                    weekly_progress_hours: hoursSpent,
                    last_activity_date: new Date().toISOString().split('T')[0]
                })
                .select()
                .single();
            finalStats = newStats;
        } else if (stats) {
            // Update existing stats
            const today = new Date().toISOString().split('T')[0];
            const lastActivity = stats.last_activity_date;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            // Calculate streak
            let newStreak = stats.current_streak;
            if (lastActivity === yesterdayStr) {
                newStreak = stats.current_streak + 1;
            } else if (lastActivity !== today) {
                newStreak = 1; // Reset streak if more than 1 day gap
            }

            // Calculate new level (every 1000 XP = 1 level)
            const newTotalXP = stats.total_xp + xpEarned;
            const newLevel = Math.floor(newTotalXP / 1000) + 1;

            // Update stats
            const { data: updatedStats } = await supabase
                .from('user_gamification_stats')
                .update({
                    total_xp: newTotalXP,
                    current_level: newLevel,
                    current_streak: newStreak,
                    longest_streak: Math.max(newStreak, stats.longest_streak),
                    last_activity_date: today,
                    updated_at: new Date().toISOString()
                })
                .eq('id', stats.id)
                .select()
                .single();

            finalStats = updatedStats;

            // Check for achievements
            await checkAndAwardAchievements(supabase, user.id, planId, finalStats || stats, activityType);
        }

        // Update skill status based on activity type
        if (skillId) {
            const updateData: any = {};

            // Update application status for education-related activities
            if (activityType === 'applied') {
                updateData.application_status = 'applied';
            } else if (activityType === 'accepted') {
                updateData.application_status = 'accepted';
            } else if (activityType === 'enrolled') {
                updateData.application_status = 'enrolled';
                updateData.status = 'in_progress';
                updateData.start_date = new Date().toISOString().split('T')[0];
            } else if (activityType === 'skill_completed' || (activityType === 'course_completed' && hoursSpent >= 50)) {
                updateData.application_status = 'completed';
                updateData.status = 'completed';
                updateData.end_date = new Date().toISOString().split('T')[0];
            } else if (activityType === 'module_started' && !updateData.status) {
                updateData.status = 'in_progress';
            }

            // Update actual hours if progress was made
            if (hoursSpent > 0) {
                const { data: currentSkill } = await supabase
                    .from('learning_plan_skills')
                    .select('actual_hours')
                    .eq('id', skillId)
                    .single();

                updateData.actual_hours = (currentSkill?.actual_hours || 0) + hoursSpent;
            }

            // Apply updates if any
            if (Object.keys(updateData).length > 0) {
                await supabase
                    .from('learning_plan_skills')
                    .update(updateData)
                    .eq('id', skillId);
            }

            // Update plan's completed skills count
            const { data: allSkills } = await supabase
                .from('learning_plan_skills')
                .select('status, application_status')
                .eq('plan_id', planId);

            const completedCount = allSkills?.filter(s =>
                s.status === 'completed' || s.application_status === 'completed'
            ).length || 0;

            await supabase
                .from('learning_plans')
                .update({ completed_skills: completedCount })
                .eq('id', planId);
        }

        return NextResponse.json({
            success: true,
            progress: progressEntry,
            stats: finalStats,
            message: 'Progress uppdaterad!'
        }, { status: 200 });

    } catch (error: any) {
        console.error('--- API /learning-plans/[id]/progress: Error:', error);
        return NextResponse.json(
            { error: 'Kunde inte uppdatera progress' },
            { status: 500 }
        );
    }
}

// Helper function to check and award achievements
async function checkAndAwardAchievements(
    supabase: any,
    userId: string,
    planId: string,
    stats: any,
    activityType: string
) {
    const achievements = [];

    // First course completed
    if (activityType === 'course_completed') {
        const { data: existing } = await supabase
            .from('user_achievements')
            .select('id')
            .eq('user_id', userId)
            .eq('plan_id', planId)
            .eq('achievement_key', 'first_course')
            .single();

        if (!existing) {
            achievements.push({
                user_id: userId,
                plan_id: planId,
                achievement_key: 'first_course',
                xp_reward: 100
            });
        }
    }

    // Week streak
    if (stats.current_streak >= 7) {
        const { data: existing } = await supabase
            .from('user_achievements')
            .select('id')
            .eq('user_id', userId)
            .eq('plan_id', planId)
            .eq('achievement_key', 'week_streak')
            .single();

        if (!existing) {
            achievements.push({
                user_id: userId,
                plan_id: planId,
                achievement_key: 'week_streak',
                xp_reward: 200
            });
        }
    }

    // Skill master (completed a skill)
    if (activityType === 'skill_completed') {
        const { data: existing } = await supabase
            .from('user_achievements')
            .select('id')
            .eq('user_id', userId)
            .eq('plan_id', planId)
            .eq('achievement_key', 'skill_master')
            .single();

        if (!existing) {
            achievements.push({
                user_id: userId,
                plan_id: planId,
                achievement_key: 'skill_master',
                xp_reward: 300
            });
        }
    }

    // Level achievements
    const levelAchievements = [
        { level: 5, key: 'level_5', xp: 500 },
        { level: 10, key: 'level_10', xp: 1000 },
        { level: 20, key: 'level_20', xp: 2000 }
    ];

    for (const levelAch of levelAchievements) {
        if (stats.current_level >= levelAch.level) {
            const { data: existing } = await supabase
                .from('user_achievements')
                .select('id')
                .eq('user_id', userId)
                .eq('plan_id', planId)
                .eq('achievement_key', levelAch.key)
                .single();

            if (!existing) {
                achievements.push({
                    user_id: userId,
                    plan_id: planId,
                    achievement_key: levelAch.key,
                    xp_reward: levelAch.xp
                });
            }
        }
    }

    // Insert new achievements
    if (achievements.length > 0) {
        await supabase
            .from('user_achievements')
            .insert(achievements);

        // Add achievement XP to total
        const totalAchievementXP = achievements.reduce((sum, ach) => sum + ach.xp_reward, 0);
        if (totalAchievementXP > 0) {
            await supabase
                .from('user_gamification_stats')
                .update({
                    total_xp: stats.total_xp + totalAchievementXP
                })
                .eq('user_id', userId)
                .eq('plan_id', planId);
        }
    }
}