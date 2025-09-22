import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Generate mock monitoring data (in production, fetch from monitoring tables)
    const systemMetrics = [
      {
        name: 'API Response Time',
        value: 145,
        unit: 'ms',
        status: 'healthy',
        trend: 'stable'
      },
      {
        name: 'Database Query Time',
        value: 23,
        unit: 'ms',
        status: 'healthy',
        trend: 'down'
      },
      {
        name: 'Error Rate',
        value: 0.12,
        unit: '%',
        status: 'healthy',
        trend: 'down'
      },
      {
        name: 'Active Users',
        value: 342,
        unit: 'users',
        status: 'healthy',
        trend: 'up'
      },
      {
        name: 'CPU Usage',
        value: 45,
        unit: '%',
        status: 'healthy',
        trend: 'stable'
      },
      {
        name: 'Memory Usage',
        value: 67,
        unit: '%',
        status: 'warning',
        trend: 'up'
      }
    ];
    
    const alerts = [
      {
        id: '1',
        alert_type: 'warning',
        title: 'High API Response Time',
        description: 'Average response time exceeded 500ms threshold',
        severity: 3,
        status: 'active',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        alert_type: 'info',
        title: 'Scheduled Maintenance',
        description: 'Database backup completed successfully',
        severity: 1,
        status: 'resolved',
        created_at: new Date(Date.now() - 7200000).toISOString()
      }
    ];
    
    const apiMetrics = [
      {
        endpoint: '/api/generate-letter',
        avg_response_time: 450,
        total_requests: 1234,
        error_rate: 0.5,
        p95_response_time: 850
      },
      {
        endpoint: '/api/analyze-cv',
        avg_response_time: 320,
        total_requests: 876,
        error_rate: 0.2,
        p95_response_time: 520
      },
      {
        endpoint: '/api/auth/login',
        avg_response_time: 120,
        total_requests: 2341,
        error_rate: 0.1,
        p95_response_time: 200
      }
    ];
    
    // Determine system status
    const criticalAlerts = alerts.filter(a => a.alert_type === 'critical' && a.status === 'active');
    const warningAlerts = alerts.filter(a => a.alert_type === 'warning' && a.status === 'active');
    
    let systemStatus = 'operational';
    if (criticalAlerts.length > 0) {
      systemStatus = 'down';
    } else if (warningAlerts.length > 0) {
      systemStatus = 'degraded';
    }
    
    return NextResponse.json({
      systemStatus,
      systemMetrics,
      alerts,
      apiMetrics
    });
    
  } catch (error) {
    console.error('Error fetching monitoring data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    const { action, alertId } = body;
    
    if (action === 'acknowledge' || action === 'resolve') {
      // In production, update the alert status in the database
      // For now, just return success
      return NextResponse.json({ 
        success: true,
        message: `Alert ${alertId} ${action}d successfully`
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}