import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { RealtimeChannel } from '@supabase/supabase-js';

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

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    let alertChannel: RealtimeChannel;
    let notificationChannel: RealtimeChannel;
    
    const setupRealtimeSubscriptions = async () => {
      try {
        // Subscribe to system alerts
        alertChannel = supabase
          .channel('system-alerts')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'system_alerts'
            },
            (payload) => {
              console.log('System alert received:', payload);
              
              if (payload.eventType === 'INSERT') {
                setAlerts(prev => [payload.new as SystemAlert, ...prev]);
                
                // Show browser notification if it's critical
                if (payload.new.alert_type === 'critical' && 'Notification' in window) {
                  if (Notification.permission === 'granted') {
                    new Notification('Critical System Alert', {
                      body: payload.new.title,
                      icon: '/favicon.ico'
                    });
                  }
                }
              } else if (payload.eventType === 'UPDATE') {
                setAlerts(prev => prev.map(alert => 
                  alert.id === payload.new.id ? payload.new as SystemAlert : alert
                ));
              } else if (payload.eventType === 'DELETE') {
                setAlerts(prev => prev.filter(alert => alert.id !== payload.old.id));
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Connected to system alerts channel');
              setIsConnected(true);
            }
          });
        
        // Subscribe to user notifications
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          notificationChannel = supabase
            .channel('user-notifications')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
              },
              (payload) => {
                console.log('Notification received:', payload);
                
                if (payload.eventType === 'INSERT') {
                  setNotifications(prev => [payload.new as Notification, ...prev]);
                  
                  // Show browser notification
                  if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(payload.new.title, {
                      body: payload.new.message,
                      icon: '/favicon.ico'
                    });
                  }
                } else if (payload.eventType === 'UPDATE') {
                  setNotifications(prev => prev.map(notif => 
                    notif.id === payload.new.id ? payload.new as Notification : notif
                  ));
                }
              }
            )
            .subscribe();
        }
        
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission();
        }
        
      } catch (error) {
        console.error('Error setting up realtime subscriptions:', error);
        setIsConnected(false);
      }
    };
    
    setupRealtimeSubscriptions();
    
    // Cleanup
    return () => {
      if (alertChannel) {
        supabase.removeChannel(alertChannel);
      }
      if (notificationChannel) {
        supabase.removeChannel(notificationChannel);
      }
      setIsConnected(false);
    };
  }, [supabase]);
  
  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/admin/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'acknowledge', alertId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to acknowledge alert');
      }
      
      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'acknowledged' as const } : alert
      ));
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };
  
  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/admin/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve', alertId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to resolve alert');
      }
      
      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'resolved' as const } : alert
      ));
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };
  
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  return {
    alerts,
    notifications,
    isConnected,
    acknowledgeAlert,
    resolveAlert,
    markNotificationAsRead,
    unreadCount: notifications.filter(n => !n.read).length,
    activeAlertCount: alerts.filter(a => a.status === 'active').length
  };
}