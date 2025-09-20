// /app/api/learning-plans/skills/[skillId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { logUserActivity } from '@/lib/activity-logger';

export const maxDuration = 10;

// PATCH - Update skill (including removing from enrolled status)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ skillId: string }> }
) {
    console.log('--- API /learning-plans/skills/[skillId]: PATCH request initiated');

    try {
        const cookieStore = await cookies();
        const supabase = createServerClient({ cookies: cookieStore });
        const { skillId } = await params;

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Ej autentiserad' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { action, ...updateData } = body;

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

        let finalUpdateData: any = {};
        let activityDescription = '';

        switch (action) {
            case 'unenroll':
                // Remove from enrolled status and reset progress
                finalUpdateData = {
                    application_status: 'not_applied',
                    status: 'pending',
                    actual_hours: 0,
                    start_date: null,
                    end_date: null,
                    started_at: null,
                    completed_at: null,
                    updated_at: new Date().toISOString()
                };
                activityDescription = `Avregistrerade från kompetens: ${skill.skill_name}`;

                // Delete all course enrollments for this skill
                await supabase
                    .from('user_course_enrollments')
                    .delete()
                    .eq('skill_id', skillId)
                    .eq('user_id', user.id);

                // Delete progress entries for this skill
                await supabase
                    .from('learning_progress_entries')
                    .delete()
                    .eq('skill_id', skillId)
                    .eq('user_id', user.id);
                break;

            case 'update':
                // Regular update
                finalUpdateData = {
                    ...updateData,
                    updated_at: new Date().toISOString()
                };
                activityDescription = `Uppdaterade kompetens: ${skill.skill_name}`;
                break;

            default:
                return NextResponse.json(
                    { error: 'Ogiltig action' },
                    { status: 400 }
                );
        }

        // Update the skill
        const { data: updatedSkill, error: updateError } = await supabase
            .from('learning_plan_skills')
            .update(finalUpdateData)
            .eq('id', skillId)
            .select()
            .single();

        if (updateError) {
            console.error('--- API /learning-plans/skills/[skillId]: Update error:', updateError);
            return NextResponse.json(
                { error: 'Kunde inte uppdatera kompetens' },
                { status: 500 }
            );
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
            'skill_updated' as any,
            activityDescription,
            {
                skillId,
                action,
                planId: skill.plan_id,
                skillName: skill.skill_name,
                changes: finalUpdateData
            }
        );

        return NextResponse.json({
            success: true,
            skill: updatedSkill,
            message: action === 'unenroll' ? 'Avregistrerad från kompetens' : 'Kompetens uppdaterad'
        }, { status: 200 });

    } catch (error: any) {
        console.error('--- API /learning-plans/skills/[skillId]: Unexpected error:', error);
        return NextResponse.json(
            { error: 'Ett oväntat fel uppstod' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a skill from learning plan
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ skillId: string }> }
) {
    console.log('--- API /learning-plans/skills/[skillId]: DELETE request initiated');

    try {
        const cookieStore = await cookies();
        const supabase = createServerClient({ cookies: cookieStore });
        const { skillId } = await params;

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Ej autentiserad' },
                { status: 401 }
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

        // Delete all related data first (cascading delete)
        await supabase
            .from('user_course_enrollments')
            .delete()
            .eq('skill_id', skillId)
            .eq('user_id', user.id);

        await supabase
            .from('learning_progress_entries')
            .delete()
            .eq('skill_id', skillId)
            .eq('user_id', user.id);

        await supabase
            .from('learning_progress')
            .delete()
            .eq('skill_id', skillId)
            .eq('user_id', user.id);

        // Delete the skill
        const { error: deleteError } = await supabase
            .from('learning_plan_skills')
            .delete()
            .eq('id', skillId);

        if (deleteError) {
            console.error('--- API /learning-plans/skills/[skillId]: Delete error:', deleteError);
            return NextResponse.json(
                { error: 'Kunde inte radera kompetens' },
                { status: 500 }
            );
        }

        // Update plan's total and completed skills count
        const { data: remainingSkills } = await supabase
            .from('learning_plan_skills')
            .select('status, application_status')
            .eq('plan_id', skill.plan_id);

        const totalSkills = remainingSkills?.length || 0;
        const completedCount = remainingSkills?.filter(s =>
            s.status === 'completed' || s.application_status === 'completed'
        ).length || 0;

        await supabase
            .from('learning_plans')
            .update({
                total_skills: totalSkills,
                completed_skills: completedCount
            })
            .eq('id', skill.plan_id);

        // Log activity
        await logUserActivity(
            user.id,
            'skill_deleted' as any,
            `Raderade kompetens: ${skill.skill_name}`,
            {
                skillId,
                planId: skill.plan_id,
                skillName: skill.skill_name
            }
        );

        return NextResponse.json({
            success: true,
            message: 'Kompetens raderad'
        }, { status: 200 });

    } catch (error: any) {
        console.error('--- API /learning-plans/skills/[skillId]: Unexpected error:', error);
        return NextResponse.json(
            { error: 'Ett oväntat fel uppstod' },
            { status: 500 }
        );
    }
}