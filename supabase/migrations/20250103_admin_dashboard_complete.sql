-- =====================================
-- ADMIN DASHBOARD COMPLETE MIGRATION
-- =====================================

-- =====================================
-- EKONOMISK ÖVERVAKNING
-- =====================================

-- Revenue tracking tabell
CREATE TABLE IF NOT EXISTS public.revenue_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'SEK',
  type VARCHAR(50) NOT NULL CHECK (type IN ('subscription', 'one_time', 'refund')),
  description TEXT,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription metrics tabell  
CREATE TABLE IF NOT EXISTS public.subscription_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_subscribers INTEGER DEFAULT 0,
  new_subscribers INTEGER DEFAULT 0,
  churned_subscribers INTEGER DEFAULT 0,
  mrr DECIMAL(10,2) DEFAULT 0,
  arr DECIMAL(10,2) DEFAULT 0,
  average_revenue_per_user DECIMAL(10,2) DEFAULT 0,
  churn_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- HÄNDELSELOGGNING & AUDIT
-- =====================================

-- Audit log för alla kritiska händelser
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin actions log
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type VARCHAR(100) NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- SYSTEMÖVERVAKNING
-- =====================================

-- System metrics för performance tracking
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(50) NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  value NUMERIC NOT NULL,
  unit VARCHAR(20),
  tags JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- API usage metrics
CREATE TABLE IF NOT EXISTS public.api_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- NOTIFIKATIONER & ALERTS
-- =====================================

-- System alerts
CREATE TABLE IF NOT EXISTS public.system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('error', 'warning', 'info', 'critical')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity INTEGER DEFAULT 1 CHECK (severity BETWEEN 1 AND 5),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- =====================================
-- ANVÄNDNINGSSTATISTIK
-- =====================================

-- Daily usage statistics
CREATE TABLE IF NOT EXISTS public.daily_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cv_analyses_count INTEGER DEFAULT 0,
  letters_generated_count INTEGER DEFAULT 0,
  competence_analyses_count INTEGER DEFAULT 0,
  total_ai_tokens INTEGER DEFAULT 0,
  total_ai_cost DECIMAL(10,4) DEFAULT 0,
  session_duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, user_id)
);

-- =====================================
-- AI/ML PREDICTION TABLES
-- =====================================

-- User predictions
CREATE TABLE IF NOT EXISTS public.user_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_type VARCHAR(50) NOT NULL,
  prediction_value DECIMAL(5,2),
  confidence_score DECIMAL(5,2),
  factors JSONB,
  metadata JSONB DEFAULT '{}',
  predicted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Revenue forecasts
CREATE TABLE IF NOT EXISTS public.revenue_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_date DATE NOT NULL,
  forecast_amount DECIMAL(10,2),
  best_case DECIMAL(10,2),
  worst_case DECIMAL(10,2),
  confidence_interval DECIMAL(5,2),
  factors JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- INDEXES FÖR PERFORMANCE
-- =====================================

-- Revenue tracking indexes
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_user_id ON public.revenue_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_created_at ON public.revenue_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_status ON public.revenue_tracking(status);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_type ON public.revenue_tracking(type);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- System metrics indexes
CREATE INDEX IF NOT EXISTS idx_system_metrics_type ON public.system_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at ON public.system_metrics(recorded_at DESC);

-- API metrics indexes
CREATE INDEX IF NOT EXISTS idx_api_metrics_endpoint ON public.api_metrics(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_metrics_created_at ON public.api_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_metrics_user_id ON public.api_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_api_metrics_status ON public.api_metrics(status_code);

-- System alerts indexes
CREATE INDEX IF NOT EXISTS idx_system_alerts_status ON public.system_alerts(status);
CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON public.system_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_system_alerts_created_at ON public.system_alerts(created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Daily usage stats indexes
CREATE INDEX IF NOT EXISTS idx_daily_usage_stats_date ON public.daily_usage_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_usage_stats_user_id ON public.daily_usage_stats(user_id);

-- User predictions indexes
CREATE INDEX IF NOT EXISTS idx_user_predictions_user_id ON public.user_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_predictions_type ON public.user_predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_user_predictions_expires_at ON public.user_predictions(expires_at);

-- =====================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================

-- Enable RLS on all new tables
ALTER TABLE public.revenue_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_forecasts ENABLE ROW LEVEL SECURITY;

-- Revenue tracking policies
CREATE POLICY "Admins can view all revenue" ON public.revenue_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can view own revenue" ON public.revenue_tracking
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- Subscription metrics policies (only admins)
CREATE POLICY "Only admins can view subscription metrics" ON public.subscription_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = (SELECT auth.uid())
    )
  );

-- Audit logs policies (only admins)
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = (SELECT auth.uid())
    )
  );

-- Admin actions policies (only admins)
CREATE POLICY "Only admins can view admin actions" ON public.admin_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = (SELECT auth.uid())
    )
  );

-- System metrics policies (only admins)
CREATE POLICY "Only admins can manage system metrics" ON public.system_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = (SELECT auth.uid())
    )
  );

-- API metrics policies (only admins)
CREATE POLICY "Only admins can view API metrics" ON public.api_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = (SELECT auth.uid())
    )
  );

-- System alerts policies (only admins)
CREATE POLICY "Only admins can manage system alerts" ON public.system_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = (SELECT auth.uid())
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- Daily usage stats policies
CREATE POLICY "Admins can view all usage stats" ON public.daily_usage_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can view own usage stats" ON public.daily_usage_stats
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- User predictions policies
CREATE POLICY "Admins can view all predictions" ON public.user_predictions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can view own predictions" ON public.user_predictions
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- Revenue forecasts policies (only admins)
CREATE POLICY "Only admins can view revenue forecasts" ON public.revenue_forecasts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = (SELECT auth.uid())
    )
  );

-- =====================================
-- TRIGGER FUNCTIONS
-- =====================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_revenue_tracking_updated_at 
  BEFORE UPDATE ON public.revenue_tracking 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_metrics_updated_at 
  BEFORE UPDATE ON public.subscription_metrics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_alerts_updated_at 
  BEFORE UPDATE ON public.system_alerts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- HELPER FUNCTIONS
-- =====================================

-- Calculate MRR (Monthly Recurring Revenue)
CREATE OR REPLACE FUNCTION public.calculate_mrr()
RETURNS DECIMAL AS $$
DECLARE
  total_mrr DECIMAL;
BEGIN
  SELECT COALESCE(SUM(
    CASE 
      WHEN subscription_tier = 'premium' THEN 149.00
      ELSE 0
    END
  ), 0) INTO total_mrr
  FROM public.profiles
  WHERE subscription_status = 'active';
  
  RETURN total_mrr;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Get revenue statistics
CREATE OR REPLACE FUNCTION public.get_revenue_stats(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_revenue DECIMAL,
  subscription_revenue DECIMAL,
  refund_amount DECIMAL,
  transaction_count BIGINT,
  average_transaction DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue,
    COALESCE(SUM(CASE WHEN type = 'subscription' AND status = 'completed' THEN amount ELSE 0 END), 0) as subscription_revenue,
    COALESCE(SUM(CASE WHEN type = 'refund' THEN ABS(amount) ELSE 0 END), 0) as refund_amount,
    COUNT(*) as transaction_count,
    COALESCE(AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END), 0) as average_transaction
  FROM public.revenue_tracking
  WHERE created_at::date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- =====================================
-- MONITORING VIEWS
-- =====================================

-- Create dashboard overview view
CREATE OR REPLACE VIEW public.dashboard_overview AS
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.profiles WHERE subscription_status = 'active') as active_subscribers,
  (SELECT calculate_mrr()) as current_mrr,
  (SELECT COUNT(*) FROM public.cv_texts WHERE created_at > NOW() - INTERVAL '24 hours') as cvs_last_24h,
  (SELECT COUNT(*) FROM public.letters WHERE created_at > NOW() - INTERVAL '24 hours') as letters_last_24h,
  (SELECT COUNT(*) FROM public.system_alerts WHERE status = 'active') as active_alerts;

-- Grant access to dashboard view
GRANT SELECT ON public.dashboard_overview TO authenticated;

-- =====================================
-- ENABLE REALTIME
-- =====================================

-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.revenue_tracking;

-- =====================================
-- FIX EXISTING SECURITY ISSUES
-- =====================================

-- Enable RLS on existing tables that lack it
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_activities
CREATE POLICY "Users can view own activities" ON public.user_activities
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all activities" ON public.user_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = (SELECT auth.uid())
    )
  );

-- Create RLS policies for usage_log
CREATE POLICY "Users can view own usage" ON public.usage_log
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all usage" ON public.usage_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = (SELECT auth.uid())
    )
  );

-- Add missing indexes on existing tables
CREATE INDEX IF NOT EXISTS idx_cv_texts_user_id ON public.cv_texts(user_id);
CREATE INDEX IF NOT EXISTS idx_letters_user_id ON public.letters(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_log_user_id ON public.usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_log_created_at ON public.usage_log(created_at DESC);