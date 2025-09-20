// /app/api/learning-plans/enrollments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { logUserActivity } from '@/lib/activity-logger';

export const maxDuration = 10;

// DELETE - Remove course enrollment
export async function DELETE(request: NextRequest) {
    console.log('--- API /learning-plans/enrollments: DELETE request initiated');

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
        const { enrollmentId, skillId } = body;

        if (!enrollmentId) {
            return NextResponse.json(
                { error: 'Enrollment ID krävs' },
                { status: 400 }
            );
        }

        // Verify ownership and get enrollment details
        const { data: enrollment, error: enrollmentError } = await supabase
            .from('user_course_enrollments')
            .select(`
                *,
                skill:learning_plan_skills(id, skill_name, plan_id)
            `)
            .eq('id', enrollmentId)
            .eq('user_id', user.id)
            .single();

        if (enrollmentError || !enrollment) {
            return NextResponse.json(
                { error: 'Kursenrollment hittades inte eller du har inte behörighet' },
                { status: 404 }
            );
        }

        // Delete the enrollment
        const { error: deleteError } = await supabase
            .from('user_course_enrollments')
            .delete()
            .eq('id', enrollmentId)
            .eq('user_id', user.id);

        if (deleteError) {
            console.error('--- API /learning-plans/enrollments: Delete error:', deleteError);
            return NextResponse.json(
                { error: 'Kunde inte radera kursenrollment' },
                { status: 500 }
            );
        }

        // Update skill status back to pending if this was the last enrollment
        if (skillId) {
            const { data: remainingEnrollments } = await supabase
                .from('user_course_enrollments')
                .select('id')
                .eq('skill_id', skillId)
                .eq('user_id', user.id);

            // If no remaining enrollments, reset skill status
            if (!remainingEnrollments || remainingEnrollments.length === 0) {
                await supabase
                    .from('learning_plan_skills')
                    .update({
                        application_status: 'not_applied',
                        status: 'pending'
                    })
                    .eq('id', skillId);
            }
        }

        // Log activity
        await logUserActivity(
            user.id,
            'course_enrollment_deleted' as any,
            `Raderade kursenrollment: ${enrollment.course_title}`,
            {
                enrollmentId,
                skillId,
                courseTitle: enrollment.course_title,
                planId: enrollment.skill?.plan_id
            }
        );

        return NextResponse.json({
            success: true,
            message: 'Kursenrollment raderad'
        }, { status: 200 });

    } catch (error: any) {
        console.error('--- API /learning-plans/enrollments: Unexpected error:', error);
        return NextResponse.json(
            { error: 'Ett oväntat fel uppstod' },
            { status: 500 }
        );
    }
}