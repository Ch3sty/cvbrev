// /app/api/learning-plans/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { logUserActivity } from '@/lib/activity-logger';
import { determineStrategy, getStrategyConfig, mapLegacyPath } from '@/lib/learning/course-prioritization';
import type { LegacyLearningPath } from '@/lib/learning/course-prioritization';

export const maxDuration = 10;

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    console.log('--- API /learning-plans/create: Request initiated');

    try {
        const cookieStore = await cookies();
        const supabase = createServerClient({ cookies: cookieStore });

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
            learningPath, // Optional - now auto-determined if not provided
            timeCommitmentHours, // Optional - now auto-determined if not provided
            selectedSkills,
            selectedCoursesByStep, // New format from timeline
            matchScore
        } = body;

        // Validate required fields (learningPath and timeCommitmentHours now optional)
        if (!jobId || !title || !targetRole) {
            return NextResponse.json(
                { error: 'Saknade obligatoriska fält' },
                { status: 400 }
            );
        }

        // Handle both old (selectedSkills) and new (selectedCoursesByStep) formats
        let skillsToProcess = selectedSkills;
        if (!skillsToProcess && selectedCoursesByStep) {
            // Convert selectedCoursesByStep to selectedSkills format
            skillsToProcess = [];

            if (selectedCoursesByStep.step1 && selectedCoursesByStep.step1.length > 0) {
                skillsToProcess.push(...selectedCoursesByStep.step1.map((courseId: string, index: number) => ({
                    name: courseId,
                    level: 'foundation',
                    importance: 'essential',
                    estimatedHours: 40,
                    courses: [courseId],
                    step: 'step1'
                })));
            }

            if (selectedCoursesByStep.step2 && selectedCoursesByStep.step2.length > 0) {
                skillsToProcess.push(...selectedCoursesByStep.step2.map((courseId: string, index: number) => ({
                    name: courseId,
                    level: 'intermediate',
                    importance: 'desirable',
                    estimatedHours: 40,
                    courses: [courseId],
                    step: 'step2'
                })));
            }

            if (selectedCoursesByStep.step3 && selectedCoursesByStep.step3.length > 0) {
                skillsToProcess.push(...selectedCoursesByStep.step3.map((courseId: string, index: number) => ({
                    name: courseId,
                    level: 'advanced',
                    importance: 'desirable',
                    estimatedHours: 40,
                    courses: [courseId],
                    step: 'step3'
                })));
            }
        }

        // Validate we have skills to process
        if (!skillsToProcess || skillsToProcess.length === 0) {
            return NextResponse.json(
                { error: 'Inga kurser valda' },
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

        // Determine learning strategy automatically if not provided
        let finalStrategy = learningPath;
        let isAutoStrategy = false;

        if (!learningPath || ['quick', 'balanced', 'comprehensive'].includes(learningPath)) {
            // Auto-determine strategy based on match score
            const autoStrategy = determineStrategy(job.match_score || 50);
            const strategyConfig = getStrategyConfig(autoStrategy);
            finalStrategy = autoStrategy;
            isAutoStrategy = true;

            console.log(`--- API /learning-plans/create: Auto-determined strategy: ${autoStrategy} (match score: ${job.match_score}%)`);
        } else if (['quick', 'balanced', 'comprehensive'].includes(learningPath)) {
            // Map legacy values
            finalStrategy = mapLegacyPath(learningPath as LegacyLearningPath);
            console.log(`--- API /learning-plans/create: Mapped legacy path ${learningPath} to ${finalStrategy}`);
        }

        // Get strategy config for default hours
        const strategyConfig = getStrategyConfig(finalStrategy as any);

        // Calculate estimated completion date based on learning path and commitment
        const hoursPerWeek = timeCommitmentHours || strategyConfig.defaultHoursPerWeek;
        const totalHours = skillsToProcess.reduce((sum: number, skill: any) =>
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
                learning_path: finalStrategy,
                time_commitment_hours: hoursPerWeek,
                estimated_completion_date: estimatedCompletionDate.toISOString(),
                status: 'active',
                match_score: job.match_score,
                total_skills: skillsToProcess.length,
                completed_skills: 0,
                metadata: {
                    created_from: 'competence_analysis',
                    original_gaps: job.skill_gaps,
                    analysis_mode: job.analysis_mode,
                    auto_strategy: isAutoStrategy,
                    strategy_config: strategyConfig,
                    original_learning_path: learningPath // Store original for backwards compatibility
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
        const skillEntries = skillsToProcess.map((skill: any, index: number) => ({
            plan_id: learningPlan.id,
            skill_name: skill.name,
            skill_level: skill.level || 'foundation',
            importance: skill.importance || 'desirable',
            status: 'pending',
            estimated_hours: skill.estimatedHours || 40,
            courses: skill.courses || [],
            prerequisites: skill.prerequisites || [],
            order_index: index,
            step: skill.step // Preserve step information if available
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
            'learning_plan_created' as any,
            `Skapade utvecklingsplan: ${title}`,
            {
                planId: learningPlan.id,
                targetRole,
                learningPath: finalStrategy,
                autoStrategy: isAutoStrategy,
                totalSkills: skillsToProcess.length,
                estimatedWeeks: weeksNeeded
            }
        );

        const responseTime = Date.now() - startTime;
        console.log(`--- API /learning-plans/create: Request completed in ${responseTime}ms`);

        return NextResponse.json({
            success: true,
            planId: learningPlan.id,
            message: 'Utvecklingsplan skapad!',
            strategy: finalStrategy,
            strategyTitle: strategyConfig.title,
            autoStrategy: isAutoStrategy,
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