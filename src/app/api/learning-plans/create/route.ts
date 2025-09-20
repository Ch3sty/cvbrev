// /app/api/learning-plans/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { logUserActivity } from '@/lib/activity-logger';

export const maxDuration = 10;

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    console.log('--- API /learning-plans/create: Request initiated');

    try {
        const supabase = await createServerClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('--- API /learning-plans/create: Auth error:', authError);
            return NextResponse.json(
                { error: 'Ej autentiserad' },
                { status: 401 }
            );
        }

        const userId = user.id;
        console.log(`--- API /learning-plans/create: User authenticated: ${userId}`);

        // Parse request body
        const body = await request.json();
        const {
            jobId,
            title,
            targetRole,
            learningPath,
            timeCommitmentHours,
            selectedSkills
        } = body;

        // Validate required fields
        if (!jobId || !title || !targetRole || !learningPath) {
            return NextResponse.json(
                { error: 'Saknade obligatoriska fält' },
                { status: 400 }
            );
        }

        // Fetch the competence analysis job data
        const { data: job, error: jobError } = await supabase
            .from('competence_analysis_jobs')
            .select('*')
            .eq('id', jobId)
            .eq('user_id', userId)
            .single();

        if (jobError || !job) {
            console.error('--- API /learning-plans/create: Job not found:', jobError);
            return NextResponse.json(
                { error: 'Kompetensanalys hittades inte' },
                { status: 404 }
            );
        }

        // Calculate estimated completion date based on learning path and commitment
        const hoursPerWeek = timeCommitmentHours || 10;
        const totalHours = selectedSkills.reduce((sum: number, skill: any) =>
            sum + (skill.estimatedHours || 40), 0
        );
        const weeksNeeded = Math.ceil(totalHours / hoursPerWeek);
        const estimatedCompletionDate = new Date();
        estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + (weeksNeeded * 7));

        // Create the learning plan
        const { data: learningPlan, error: planError } = await supabase
            .from('learning_plans')
            .insert({
                user_id: userId,
                title,
                target_role: targetRole,
                created_from_job_id: jobId,
                learning_path: learningPath,
                time_commitment_hours: hoursPerWeek,
                estimated_completion_date: estimatedCompletionDate.toISOString(),
                status: 'active',
                match_score: job.match_score,
                total_skills: selectedSkills.length,
                completed_skills: 0,
                metadata: {
                    created_from: 'competence_analysis',
                    original_gaps: job.skill_gaps,
                    analysis_mode: job.analysis_mode
                }
            })
            .select()
            .single();

        if (planError) {
            console.error('--- API /learning-plans/create: Failed to create plan:', planError);
            return NextResponse.json(
                { error: 'Kunde inte skapa lärandeplan' },
                { status: 500 }
            );
        }

        // Create skill entries for the plan
        const skillEntries = selectedSkills.map((skill: any, index: number) => ({
            plan_id: learningPlan.id,
            skill_name: skill.name,
            skill_level: skill.level || 'foundation',
            importance: skill.importance || 'desirable',
            status: 'pending',
            estimated_hours: skill.estimatedHours || 40,
            courses: skill.courses || [],
            prerequisites: skill.prerequisites || [],
            order_index: index
        }));

        const { error: skillsError } = await supabase
            .from('learning_plan_skills')
            .insert(skillEntries);

        if (skillsError) {
            console.error('--- API /learning-plans/create: Failed to create skills:', skillsError);
            // Rollback by deleting the plan
            await supabase
                .from('learning_plans')
                .delete()
                .eq('id', learningPlan.id);

            return NextResponse.json(
                { error: 'Kunde inte skapa kompetenser för planen' },
                { status: 500 }
            );
        }

        // Log activity
        await logUserActivity(
            userId,
            'learning_plan_created',
            `Skapade lärandeplan: ${title}`,
            {
                planId: learningPlan.id,
                targetRole,
                learningPath,
                totalSkills: selectedSkills.length,
                estimatedWeeks: weeksNeeded
            }
        );

        const responseTime = Date.now() - startTime;
        console.log(`--- API /learning-plans/create: Request completed in ${responseTime}ms`);

        return NextResponse.json({
            success: true,
            planId: learningPlan.id,
            message: 'Lärandeplan skapad!',
            estimatedCompletion: estimatedCompletionDate.toISOString(),
            totalHours,
            weeksNeeded
        }, { status: 201 });

    } catch (error: any) {
        console.error('--- API /learning-plans/create: Unexpected error:', error);
        return NextResponse.json(
            { error: 'Ett oväntat fel uppstod' },
            { status: 500 }
        );
    }
}