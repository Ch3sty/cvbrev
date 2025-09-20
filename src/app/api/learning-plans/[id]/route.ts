// /app/api/learning-plans/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { logUserActivity } from '@/lib/activity-logger';

export const maxDuration = 10;

// GET - Fetch a specific learning plan
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('--- API /learning-plans/[id]: GET request initiated');

    try {
        const supabase = await createServerClient();
        const planId = params.id;

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Ej autentiserad' },
                { status: 401 }
            );
        }

        // Fetch the learning plan with skills
        const { data: plan, error: planError } = await supabase
            .from('learning_plans')
            .select(`
                *,
                skills:learning_plan_skills(*)
            `)
            .eq('id', planId)
            .eq('user_id', user.id)
            .single();

        if (planError || !plan) {
            console.error('--- API /learning-plans/[id]: Plan not found:', planError);
            return NextResponse.json(
                { error: 'Lärandeplan hittades inte' },
                { status: 404 }
            );
        }

        // Fetch progress data
        const { data: progress, error: progressError } = await supabase
            .from('learning_progress')
            .select('*')
            .eq('plan_id', planId)
            .order('created_at', { ascending: false });

        if (progressError) {
            console.error('--- API /learning-plans/[id]: Error fetching progress:', progressError);
        }

        return NextResponse.json({
            plan,
            progress: progress || [],
            message: 'Lärandeplan hämtad'
        }, { status: 200 });

    } catch (error: any) {
        console.error('--- API /learning-plans/[id]: Unexpected error:', error);
        return NextResponse.json(
            { error: 'Ett oväntat fel uppstod' },
            { status: 500 }
        );
    }
}

// PATCH - Update a learning plan or its skills
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('--- API /learning-plans/[id]: PATCH request initiated');

    try {
        const supabase = await createServerClient();
        const planId = params.id;

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Ej autentiserad' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { updateType, data } = body;

        // Verify ownership
        const { data: plan, error: planError } = await supabase
            .from('learning_plans')
            .select('id')
            .eq('id', planId)
            .eq('user_id', user.id)
            .single();

        if (planError || !plan) {
            return NextResponse.json(
                { error: 'Lärandeplan hittades inte eller du har inte behörighet' },
                { status: 404 }
            );
        }

        let result;
        let activityMessage = '';

        switch (updateType) {
            case 'plan':
                // Update the plan itself
                const { data: updatedPlan, error: updateError } = await supabase
                    .from('learning_plans')
                    .update(data)
                    .eq('id', planId)
                    .select()
                    .single();

                if (updateError) {
                    throw updateError;
                }
                result = updatedPlan;
                activityMessage = 'Uppdaterade lärandeplan';
                break;

            case 'skill':
                // Update a specific skill
                const { skillId, ...skillData } = data;
                const { data: updatedSkill, error: skillError } = await supabase
                    .from('learning_plan_skills')
                    .update(skillData)
                    .eq('id', skillId)
                    .eq('plan_id', planId)
                    .select()
                    .single();

                if (skillError) {
                    throw skillError;
                }

                // If skill is marked as completed, update plan stats
                if (skillData.status === 'completed') {
                    const { data: allSkills } = await supabase
                        .from('learning_plan_skills')
                        .select('status')
                        .eq('plan_id', planId);

                    const completedCount = allSkills?.filter(s => s.status === 'completed').length || 0;

                    await supabase
                        .from('learning_plans')
                        .update({
                            completed_skills: completedCount
                        })
                        .eq('id', planId);
                }

                result = updatedSkill;
                activityMessage = `Uppdaterade kompetens: ${updatedSkill.skill_name}`;
                break;

            case 'progress':
                // Add progress entry
                const { data: progressEntry, error: progressError } = await supabase
                    .from('learning_progress')
                    .insert({
                        ...data,
                        plan_id: planId,
                        user_id: user.id
                    })
                    .select()
                    .single();

                if (progressError) {
                    throw progressError;
                }
                result = progressEntry;
                activityMessage = 'La till progress';
                break;

            default:
                return NextResponse.json(
                    { error: 'Ogiltig uppdateringstyp' },
                    { status: 400 }
                );
        }

        // Log activity
        await logUserActivity(
            user.id,
            'learning_plan_updated',
            activityMessage,
            {
                planId,
                updateType,
                changes: data
            }
        );

        return NextResponse.json({
            success: true,
            data: result,
            message: 'Lärandeplan uppdaterad'
        }, { status: 200 });

    } catch (error: any) {
        console.error('--- API /learning-plans/[id]: Update error:', error);
        return NextResponse.json(
            { error: 'Kunde inte uppdatera lärandeplan' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a learning plan
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('--- API /learning-plans/[id]: DELETE request initiated');

    try {
        const supabase = await createServerClient();
        const planId = params.id;

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Ej autentiserad' },
                { status: 401 }
            );
        }

        // Delete the plan (cascades to skills and progress)
        const { error: deleteError } = await supabase
            .from('learning_plans')
            .delete()
            .eq('id', planId)
            .eq('user_id', user.id);

        if (deleteError) {
            console.error('--- API /learning-plans/[id]: Delete error:', deleteError);
            return NextResponse.json(
                { error: 'Kunde inte radera lärandeplan' },
                { status: 500 }
            );
        }

        // Log activity
        await logUserActivity(
            user.id,
            'learning_plan_deleted',
            'Raderade lärandeplan',
            { planId }
        );

        return NextResponse.json({
            success: true,
            message: 'Lärandeplan raderad'
        }, { status: 200 });

    } catch (error: any) {
        console.error('--- API /learning-plans/[id]: Unexpected error:', error);
        return NextResponse.json(
            { error: 'Ett oväntat fel uppstod' },
            { status: 500 }
        );
    }
}