// /app/api/learning-plans/skills/reset/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { logUserActivity } from '@/lib/activity-logger';

export const maxDuration = 10;

// POST - Reset skill progress
export async function POST(request: NextRequest) {
    console.log('--- API /learning-plans/skills/reset: POST request initiated');

    try {
        const cookieStore = await cookies();
        const supabase = createServerClient({ cookies: cookieStore });

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Ej autentiserad' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { skillId, resetType = 'hours' } = body;

        if (!skillId) {
            return NextResponse.json(
                { error: 'Skill ID krävs' },
                { status: 400 }
            );
        }

        // Verify ownership and get skill details
        const { data: skill, error: skillError } = await supabase
            .from('learning_plan_skills')
            .select(`
                *,
                plan:learning_plans(id, user_id)
            `)
            .eq('id', skillId)
            .single();

        if (skillError || !skill || skill.plan?.user_id !== user.id) {
            return NextResponse.json(
                { error: 'Kompetens hittades inte eller du har inte behörighet' },
                { status: 404 }
            );
        }

        let updateData: any = {};
        let activityDescription = '';

        switch (resetType) {
            case 'hours':
                // Reset only the actual hours to 0
                updateData = {
                    actual_hours: 0,
                    updated_at: new Date().toISOString()
                };
                activityDescription = `Återställde timmar för kompetens: ${skill.skill_name}`;
                break;

            case 'progress':
                // Reset hours and set status back to pending
                updateData = {
                    actual_hours: 0,
                    status: 'pending',
                    started_at: null,
                    completed_at: null,
                    updated_at: new Date().toISOString()
                };
                activityDescription = `Återställde progress för kompetens: ${skill.skill_name}`;
                break;

            case 'enrollment':
                // Reset everything including application status
                updateData = {
                    actual_hours: 0,
                    status: 'pending',
                    application_status: 'not_applied',
                    start_date: null,
                    end_date: null,
                    started_at: null,
                    completed_at: null,
                    updated_at: new Date().toISOString()
                };
                activityDescription = `Återställde enrollment för kompetens: ${skill.skill_name}`;

                // Also delete all course enrollments for this skill
                await supabase
                    .from('user_course_enrollments')
                    .delete()
                    .eq('skill_id', skillId)
                    .eq('user_id', user.id);
                break;

            default:
                return NextResponse.json(
                    { error: 'Ogiltig reset-typ' },
                    { status: 400 }
                );
        }

        // Update the skill
        const { data: updatedSkill, error: updateError } = await supabase
            .from('learning_plan_skills')
            .update(updateData)
            .eq('id', skillId)
            .select()
            .single();

        if (updateError) {
            console.error('--- API /learning-plans/skills/reset: Update error:', updateError);
            return NextResponse.json(
                { error: 'Kunde inte återställa kompetens' },
                { status: 500 }
            );
        }

        // If resetting enrollment, also clear related progress entries for transparency
        if (resetType === 'enrollment') {
            await supabase
                .from('learning_progress_entries')
                .delete()
                .eq('skill_id', skillId)
                .eq('user_id', user.id);
        }

        // Update plan's completed skills count
        const { data: allSkills } = await supabase
            .from('learning_plan_skills')
            .select('status, application_status')
            .eq('plan_id', skill.plan_id);

        const completedCount = allSkills?.filter(s =>
            s.status === 'completed' || s.application_status === 'completed'
        ).length || 0;

        await supabase
            .from('learning_plans')
            .update({ completed_skills: completedCount })
            .eq('id', skill.plan_id);

        // Log activity
        await logUserActivity(
            user.id,
            'skill_reset' as any,
            activityDescription,
            {
                skillId,
                resetType,
                planId: skill.plan_id,
                skillName: skill.skill_name
            }
        );

        return NextResponse.json({
            success: true,
            skill: updatedSkill,
            message: 'Kompetens återställd'
        }, { status: 200 });

    } catch (error: any) {
        console.error('--- API /learning-plans/skills/reset: Unexpected error:', error);
        return NextResponse.json(
            { error: 'Ett oväntat fel uppstod' },
            { status: 500 }
        );
    }
}