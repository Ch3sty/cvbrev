-- SEO & Content Analytics Database Schema
-- Implementera via Supabase migrations

-- 1. SEO Performance Tracking
CREATE TABLE seo_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  organic_traffic INTEGER DEFAULT 0,
  organic_sessions INTEGER DEFAULT 0,
  organic_users INTEGER DEFAULT 0,
  organic_conversions INTEGER DEFAULT 0,
  organic_conversion_rate DECIMAL(5,2) DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0,
  pages_per_session DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Keyword Rankings
CREATE TABLE keyword_rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  position INTEGER,
  search_volume INTEGER,
  difficulty_score INTEGER,
  url TEXT,
  date DATE NOT NULL,
  change_from_previous INTEGER DEFAULT 0,
  serp_features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Content Performance
CREATE TABLE content_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_slug TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'article', 'page', 'landing-page'
  title TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- Traffic metrics
  pageviews INTEGER DEFAULT 0,
  unique_pageviews INTEGER DEFAULT 0,
  sessions INTEGER DEFAULT 0,
  users INTEGER DEFAULT 0,
  
  -- Engagement metrics  
  avg_time_on_page INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  scroll_depth_avg DECIMAL(5,2) DEFAULT 0,
  
  -- Conversion metrics
  conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  cta_clicks INTEGER DEFAULT 0,
  cta_click_rate DECIMAL(5,2) DEFAULT 0,
  
  -- SEO metrics
  organic_traffic INTEGER DEFAULT 0,
  organic_clicks INTEGER DEFAULT 0,
  organic_impressions INTEGER DEFAULT 0,
  average_position DECIMAL(5,2) DEFAULT 0,
  click_through_rate DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Core Web Vitals
CREATE TABLE core_web_vitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  date DATE NOT NULL,
  device_type TEXT NOT NULL, -- 'desktop', 'mobile'
  
  -- Core Web Vitals metrics
  lcp_score DECIMAL(5,2), -- Largest Contentful Paint
  fid_score DECIMAL(5,2), -- First Input Delay  
  cls_score DECIMAL(5,3), -- Cumulative Layout Shift
  
  -- Additional performance metrics
  fcp_score DECIMAL(5,2), -- First Contentful Paint
  ttfb_score DECIMAL(5,2), -- Time to First Byte
  speed_index DECIMAL(5,2),
  
  -- Performance grades
  lcp_grade TEXT, -- 'good', 'needs-improvement', 'poor'
  fid_grade TEXT,
  cls_grade TEXT,
  overall_grade TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Backlink Monitoring
CREATE TABLE backlinks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_domain TEXT NOT NULL,
  source_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  anchor_text TEXT,
  domain_authority INTEGER,
  page_authority INTEGER,
  follow_type TEXT, -- 'follow', 'nofollow'
  link_type TEXT, -- 'text', 'image', 'redirect'
  first_seen DATE NOT NULL,
  last_seen DATE NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'lost', 'new'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. User Journey Tracking
CREATE TABLE user_journeys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  
  -- Journey data
  entry_page TEXT NOT NULL,
  entry_source TEXT, -- 'organic', 'direct', 'referral', 'social', 'email'
  entry_medium TEXT,
  entry_campaign TEXT,
  
  -- Journey progression
  pages_visited JSONB, -- Array of pages with timestamps
  total_pages INTEGER DEFAULT 0,
  session_duration INTEGER DEFAULT 0,
  
  -- Conversion data
  converted BOOLEAN DEFAULT FALSE,
  conversion_type TEXT, -- 'premium', 'signup', 'email', 'download'
  conversion_value DECIMAL(10,2) DEFAULT 0,
  
  -- Exit data
  exit_page TEXT,
  exit_reason TEXT, -- 'conversion', 'bounce', 'timeout'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Technical SEO Issues
CREATE TABLE technical_seo_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  issue_type TEXT NOT NULL, -- '404', 'redirect-chain', 'missing-meta', 'duplicate-content'
  severity TEXT NOT NULL, -- 'critical', 'warning', 'info'
  description TEXT NOT NULL,
  recommendation TEXT,
  status TEXT DEFAULT 'open', -- 'open', 'fixed', 'ignored'
  first_detected DATE NOT NULL,
  last_checked DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Campaign Performance
CREATE TABLE campaign_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL, -- 'email', 'social', 'paid', 'content'
  source TEXT NOT NULL,
  medium TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- Traffic metrics
  sessions INTEGER DEFAULT 0,
  users INTEGER DEFAULT 0,
  pageviews INTEGER DEFAULT 0,
  
  -- Conversion metrics
  conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  
  -- Cost metrics (for paid campaigns)
  cost DECIMAL(10,2) DEFAULT 0,
  cost_per_click DECIMAL(10,2) DEFAULT 0,
  cost_per_conversion DECIMAL(10,2) DEFAULT 0,
  roas DECIMAL(5,2) DEFAULT 0, -- Return on Ad Spend
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_seo_performance_date ON seo_performance(date);
CREATE INDEX idx_keyword_rankings_date_keyword ON keyword_rankings(date, keyword);
CREATE INDEX idx_content_performance_date_slug ON content_performance(date, content_slug);
CREATE INDEX idx_core_web_vitals_date_url ON core_web_vitals(date, url);
CREATE INDEX idx_user_journeys_session_created ON user_journeys(session_id, created_at);
CREATE INDEX idx_technical_seo_status_severity ON technical_seo_issues(status, severity);

-- Enable Row Level Security
ALTER TABLE seo_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_web_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE backlinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_seo_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_performance ENABLE ROW LEVEL SECURITY;

-- Create policies (admin access only)
CREATE POLICY "Admin access to seo_performance" ON seo_performance FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin access to keyword_rankings" ON keyword_rankings FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin access to content_performance" ON content_performance FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin access to core_web_vitals" ON core_web_vitals FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin access to backlinks" ON backlinks FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin access to user_journeys" ON user_journeys FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin access to technical_seo_issues" ON technical_seo_issues FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin access to campaign_performance" ON campaign_performance FOR ALL USING (auth.jwt() ->> 'role' = 'admin');