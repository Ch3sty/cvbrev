'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  InformationCircleIcon,
  ClockIcon,
  ServerIcon,
  ChartBarIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

interface SystemAlert {
  id: string;
  alert_type: 'error' | 'warning' | 'info' | 'critical';
  title: string;
  description: string;
  severity: number;
  status: 'active' | 'acknowledged' | 'resolved';
  created_at: string;
  metadata?: any;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface ApiMetric {
  endpoint: string;
  avg_response_time: number;
  total_requests: number;
  error_rate: number;
  p95_response_time: number;
}

export default function MonitoringDashboard() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [apiMetrics, setApiMetrics] = useState<ApiMetric[]>([]);
  const [systemStatus, setSystemStatus] = useState<'operational' | 'degraded' | 'down'>('operational');
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 30000); // Update every 30 seconds
    
    // Set up realtime subscription for alerts
    const channel = supabase
      .channel('system-alerts')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'system_alerts'
      }, (payload) => {
        console.log('New alert:', payload);
        fetchAlerts();
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      channel.unsubscribe();
    };
  }, [supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMonitoringData = async () => {
    await Promise.all([
      fetchAlerts(),
      fetchSystemMetrics(),
      fetchApiMetrics()
    ]);
    setLoading(false);
  };

  const fetchAlerts = async () => {
    try {
      // For now, generate mock alerts (in production, fetch from system_alerts table)
      const mockAlerts: SystemAlert[] = [
        {
          id: '1',
          alert_type: 'warning',
          title: 'High API Response Time',
          description: 'Average response time exceeded 500ms threshold',
          severity: 3,
          status: 'active',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          metadata: { endpoint: '/api/generate-letter', avg_time: 650 }
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
      
      setAlerts(mockAlerts);
      
      // Determine system status based on alerts
      const criticalAlerts = mockAlerts.filter(a => a.alert_type === 'critical' && a.status === 'active');
      const warningAlerts = mockAlerts.filter(a => a.alert_type === 'warning' && a.status === 'active');
      
      if (criticalAlerts.length > 0) {
        setSystemStatus('down');
      } else if (warningAlerts.length > 0) {
        setSystemStatus('degraded');
      } else {
        setSystemStatus('operational');
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchSystemMetrics = async () => {
    try {
      // Generate mock system metrics (in production, fetch from system_metrics table)
      const metrics: SystemMetric[] = [
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
      
      setSystemMetrics(metrics);
    } catch (error) {
      console.error('Error fetching system metrics:', error);
    }
  };

  const fetchApiMetrics = async () => {
    try {
      // Generate mock API metrics (in production, fetch from api_metrics table)
      const metrics: ApiMetric[] = [
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
        },
        {
          endpoint: '/api/user/profile',
          avg_response_time: 85,
          total_requests: 3456,
          error_rate: 0.05,
          p95_response_time: 150
        }
      ];
      
      setApiMetrics(metrics);
    } catch (error) {
      console.error('Error fetching API metrics:', error);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    // In production, update the alert status in the database
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'acknowledged' as const } : alert
    ));
  };

  const resolveAlert = async (alertId: string) => {
    // In production, update the alert status in the database
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' as const } : alert
    ));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'text-green-500';
      case 'warning':
      case 'degraded':
        return 'text-yellow-500';
      case 'critical':
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">System Monitoring</h1>
          <p className="text-gray-400 mt-1">Monitor system health, performance, and alerts</p>
        </div>
        
        {/* System Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            systemStatus === 'operational' ? 'bg-green-500' :
            systemStatus === 'degraded' ? 'bg-yellow-500' :
            'bg-red-500'
          }`} />
          <span className={`font-semibold ${getStatusColor(systemStatus)}`}>
            {systemStatus.charAt(0).toUpperCase() + systemStatus.slice(1)}
          </span>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systemMetrics.map((metric, index) => (
          <div key={index} className="bg-navy-800 rounded-lg p-4 border border-navy-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">{metric.name}</p>
                <div className="flex items-baseline space-x-2 mt-1">
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                  <p className="text-gray-400 text-sm">{metric.unit}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-xs font-medium ${getStatusColor(metric.status)}`}>
                  {metric.status}
                </span>
                {metric.trend !== 'stable' && (
                  <span className="text-xs text-gray-400 mt-1">
                    {metric.trend === 'up' ? '↑' : '↓'} trending
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts Section */}
      <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">System Alerts</h2>
          <span className="text-sm text-gray-400">
            {alerts.filter(a => a.status === 'active').length} active alerts
          </span>
        </div>
        
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No alerts at this time</p>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="bg-navy-900 rounded-lg p-4 border border-navy-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.alert_type)}
                    <div>
                      <h3 className="text-white font-medium">{alert.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">{alert.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-500">
                          <ClockIcon className="w-3 h-3 inline mr-1" />
                          {new Date(alert.created_at).toLocaleString('sv-SE')}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          alert.status === 'active' ? 'bg-red-900 text-red-300' :
                          alert.status === 'acknowledged' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-green-900 text-green-300'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {alert.status === 'active' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="text-xs text-yellow-400 hover:text-yellow-300"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="text-xs text-green-400 hover:text-green-300"
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* API Metrics Table */}
      <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
        <h2 className="text-xl font-bold text-white mb-4">API Performance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-navy-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Avg Response
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  P95 Response
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Requests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Error Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700">
              {apiMetrics.map((metric, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {metric.endpoint}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={metric.avg_response_time > 400 ? 'text-yellow-400' : 'text-gray-300'}>
                      {metric.avg_response_time}ms
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={metric.p95_response_time > 800 ? 'text-yellow-400' : 'text-gray-300'}>
                      {metric.p95_response_time}ms
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {metric.total_requests.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={metric.error_rate > 1 ? 'text-red-400' : 'text-gray-300'}>
                      {metric.error_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Recommendations */}
      <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
        <h2 className="text-xl font-bold text-white mb-4">Performance Recommendations</h2>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <BoltIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-white font-medium">Optimize /api/generate-letter endpoint</p>
              <p className="text-gray-400 text-sm mt-1">
                Response time is 30% above target. Consider implementing caching for common requests.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <ServerIcon className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-white font-medium">Scale database connections</p>
              <p className="text-gray-400 text-sm mt-1">
                Connection pool utilization at 85%. Consider increasing pool size.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <ChartBarIcon className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="text-white font-medium">Enable query result caching</p>
              <p className="text-gray-400 text-sm mt-1">
                Frequently accessed data can be cached to reduce database load by 40%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}