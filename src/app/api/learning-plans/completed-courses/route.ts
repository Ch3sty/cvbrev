// /app/api/learning-plans/completed-courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

export const maxDuration = 10;

// POST - Register a completed course
export async function POST(request: NextRequest) {
    console.log('--- API /learning-plans/completed-courses: POST request initiated');

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
        const {
            skillId,
            planId,
            courseName,
            provider,
            creditsHp,
            gradeSystem,
            gradeValue,
            studyHours,
            completionDate,
            courseUrl,
            cost,
            fundedBy
        } = body;

        // Validate required fields
        if (!skillId || !planId || !courseName || !studyHours) {
            return NextResponse.json(
                { error: 'Saknade obligatoriska fält' },
                { status: 400 }
            );
        }

        // Verify ownership of the plan
        const { data: plan, error: planError } = await supabase
            .from('learning_plans')
            .select('id')
            .eq('id', planId)
            .eq('user_id', user.id)
            .single();

        if (planError || !plan) {
            return NextResponse.json(
                { error: 'Lärandeplan hittades inte' },
                { status: 404 }
            );
        }

        // Insert the completed course
        const { data: course, error: courseError } = await supabase
            .from('completed_courses')
            .insert({
                user_id: user.id,
                skill_id: skillId,
                plan_id: planId,
                course_name: courseName,
                provider: provider || null,
                credits_hp: creditsHp || null,
                grade_system: gradeSystem || null,
                grade_value: gradeValue || null,
                study_hours: studyHours,
                completion_date: completionDate || new Date().toISOString().split('T')[0],
                course_url: courseUrl || null,
                cost: cost || null,
                funded_by: fundedBy || null,
                is_verified: false
            })
            .select()
            .single();

        if (courseError) {
            console.error('--- API /learning-plans/completed-courses: Error creating course:', courseError);
            return NextResponse.json(
                { error: 'Kunde inte registrera kursen' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            course,
            message: 'Kurs registrerad!'
        }, { status: 201 });

    } catch (error: any) {
        console.error('--- API /learning-plans/completed-courses: Unexpected error:', error);
        return NextResponse.json(
            { error: 'Ett oväntat fel uppstod' },
            { status: 500 }
        );
    }
}

// GET - Fetch completed courses
export async function GET(request: NextRequest) {
    console.log('--- API /learning-plans/completed-courses: GET request initiated');

    try {
        const cookieStore = await cookies();
        const supabase = createServerClient({ cookies: cookieStore });

        const { searchParams } = new URL(request.url);
        const planId = searchParams.get('planId');
        const skillId = searchParams.get('skillId');

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Ej autentiserad' },
                { status: 401 }
            );
        }

        // Build query
        let query = supabase
            .from('completed_courses')
            .select('*')
            .eq('user_id', user.id)
            .order('completion_date', { ascending: false });

        if (planId) {
            query = query.eq('plan_id', planId);
        }
        if (skillId) {
            query = query.eq('skill_id', skillId);
        }

        const { data: courses, error: coursesError } = await query;

        if (coursesError) {
            console.error('--- API /learning-plans/completed-courses: Error fetching courses:', coursesError);
            return NextResponse.json(
                { error: 'Kunde inte hämta kurser' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            courses: courses || [],
            message: 'Kurser hämtade'
        }, { status: 200 });

    } catch (error: any) {
        console.error('--- API /learning-plans/completed-courses: Unexpected error:', error);
        return NextResponse.json(
            { error: 'Ett oväntat fel uppstod' },
            { status: 500 }
        );
    }
}