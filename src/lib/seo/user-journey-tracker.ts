// src/lib/seo/user-journey-tracker.ts
'use client';

import { getSupabaseClient } from '@/lib/supabase/client-manager';

export interface UserJourneyStep {
  page: string;
  timestamp: string;
  time_spent: number;
  scroll_depth?: number;
  cta_clicked?: string;
  form_interactions?: string[];
}

export interface UserJourneySession {
  session_id: string;
  user_id?: string;
  entry_page: string;
  entry_source: 'organic' | 'direct' | 'referral' | 'social' | 'email' | 'paid';
  entry_medium?: string;
  entry_campaign?: string;
  pages_visited: UserJourneyStep[];
  total_pages: number;
  session_duration: number;
  converted: boolean;
  conversion_type?: 'premium' | 'signup' | 'email' | 'download' | 'cv_created' | 'letter_created';
  conversion_value?: number;
  exit_page: string;
  exit_reason: 'conversion' | 'bounce' | 'timeout' | 'navigation';
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location?: {
    country: string;
    city: string;
  };
}

class UserJourneyTracker {
  private supabase = getSupabaseClient();
  private sessionId: string;
  private currentSession: Partial<UserJourneySession>;
  private pageStartTime: number;
  private currentPage: string;
  private scrollDepth: number = 0;
  private isTracking: boolean = false;
  private heartbeatInterval?: NodeJS.Timeout;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.currentSession = {};
    this.pageStartTime = Date.now();
    this.currentPage = '';
    
    if (typeof window !== 'undefined') {
      this.initializeTracking();
    }
  }

  // Initiera tracking när objektet skapas
  private initializeTracking(): void {
    this.currentPage = window.location.pathname;
    this.isTracking = true;

    // Identifiera entry source
    this.identifyEntrySource();
    
    // Sätt upp event listeners
    this.setupEventListeners();
    
    // Starta session tracking
    this.startSession();
    
    // Starta heartbeat för att uppdatera session regelbundet
    this.startHeartbeat();
  }

  // Identifiera hur användaren kom till sidan
  private identifyEntrySource(): void {
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);
    
    // UTM parameters
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');

    let source: UserJourneySession['entry_source'] = 'direct';
    let medium = '';
    let campaign = '';

    if (utmSource) {
      // UTM tracking
      source = this.mapUTMSourceToEntrySource(utmSource, utmMedium);
      medium = utmMedium || '';
      campaign = utmCampaign || '';
    } else if (referrer) {
      // Referrer-based detection
      if (this.isSearchEngine(referrer)) {
        source = 'organic';
      } else if (this.isSocialMedia(referrer)) {
        source = 'social';
      } else {
        source = 'referral';
      }
      medium = this.extractDomain(referrer);
    }

    this.currentSession = {
      ...this.currentSession,
      session_id: this.sessionId,
      entry_page: this.currentPage,
      entry_source: source,
      entry_medium: medium,
      entry_campaign: campaign,
      pages_visited: [],
      total_pages: 1,
      session_duration: 0,
      converted: false,
      device_type: this.getDeviceType(),
      browser: this.getBrowser(),
      location: this.getLocation()
    };
  }

  // Sätt upp event listeners för användarinteraktioner
  private setupEventListeners(): void {
    // Page visibility change (när användaren lämnar/återvänder)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.onPageExit('navigation');
      } else {
        this.onPageEnter();
      }
    });

    // Before unload (när användaren lämnar sidan)
    window.addEventListener('beforeunload', () => {
      this.onPageExit('navigation');
      this.endSession();
    });

    // Scroll tracking
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.updateScrollDepth();
      }, 100);
    });

    // Click tracking för CTA:s och viktiga element
    document.addEventListener('click', (event) => {
      this.trackClick(event);
    });

    // Form interactions
    document.addEventListener('submit', (event) => {
      this.trackFormSubmit(event);
    });

    // Route changes (för SPA navigation)
    window.addEventListener('popstate', () => {
      this.onRouteChange();
    });
  }

  // Starta session och spara till databas
  private async startSession(): Promise<void> {
    try {
      await this.supabase
        .from('user_journeys')
        .insert(this.currentSession);
      
      console.log('User journey session started:', this.sessionId);
    } catch (error) {
      console.error('Error starting user journey session:', error);
    }
  }

  // Heartbeat för att uppdatera session regelbundet
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.updateSession();
    }, 30000); // Uppdatera var 30:e sekund
  }

  // När användaren kommer till en ny sida
  onPageEnter(page?: string): void {
    if (!this.isTracking) return;

    const newPage = page || window.location.pathname;
    
    // Spara tiden för föregående sida om det inte är första sidan
    if (this.currentPage && this.currentPage !== newPage) {
      this.onPageExit('navigation');
    }

    this.currentPage = newPage;
    this.pageStartTime = Date.now();
    this.scrollDepth = 0;

    // Lägg till ny sida till journey
    this.currentSession.total_pages = (this.currentSession.total_pages || 0) + 1;
  }

  // När användaren lämnar en sida
  private onPageExit(reason: 'conversion' | 'bounce' | 'timeout' | 'navigation'): void {
    if (!this.isTracking || !this.currentPage) return;

    const timeSpent = Date.now() - this.pageStartTime;
    
    const step: UserJourneyStep = {
      page: this.currentPage,
      timestamp: new Date(this.pageStartTime).toISOString(),
      time_spent: timeSpent,
      scroll_depth: this.scrollDepth
    };

    this.currentSession.pages_visited = [...(this.currentSession.pages_visited || []), step];
    this.currentSession.exit_page = this.currentPage;
    this.currentSession.exit_reason = reason;
    
    // Beräkna total session duration
    if (this.currentSession.pages_visited) {
      this.currentSession.session_duration = this.currentSession.pages_visited.reduce(
        (total, step) => total + step.time_spent, 0
      );
    }

    this.updateSession();
  }

  // Spåra route changes i SPA
  private onRouteChange(): void {
    const newPath = window.location.pathname;
    if (newPath !== this.currentPage) {
      this.onPageExit('navigation');
      this.onPageEnter(newPath);
    }
  }

  // Spåra scroll depth
  private updateScrollDepth(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    const currentScrollDepth = Math.round(
      ((scrollTop + windowHeight) / documentHeight) * 100
    );
    
    this.scrollDepth = Math.max(this.scrollDepth, currentScrollDepth);
  }

  // Spåra klick på viktiga element
  private trackClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // Identifiera CTA clicks
    const ctaElements = [
      'button',
      '[role="button"]',
      '.cta',
      '.btn',
      '.button',
      '[data-cta]'
    ];

    const isCTA = ctaElements.some(selector => target.matches(selector));
    
    if (isCTA) {
      const ctaText = target.textContent?.trim() || target.getAttribute('aria-label') || 'Unknown CTA';
      
      // Lägg till CTA click till current page step
      if (this.currentSession.pages_visited) {
        const currentStep = this.currentSession.pages_visited.find(
          step => step.page === this.currentPage
        );
        if (currentStep) {
          currentStep.cta_clicked = ctaText;
        }
      }
    }
  }

  // Spåra form submissions
  private trackFormSubmit(event: SubmitEvent): void {
    const form = event.target as HTMLFormElement;
    const formId = form.id || form.className || 'unknown-form';
    
    // Identifiera conversion type baserat på form
    let conversionType: UserJourneySession['conversion_type'];
    
    if (formId.includes('signup') || formId.includes('register')) {
      conversionType = 'signup';
    } else if (formId.includes('email') || formId.includes('newsletter')) {
      conversionType = 'email';
    } else if (formId.includes('cv')) {
      conversionType = 'cv_created';
    } else if (formId.includes('letter') || formId.includes('brev')) {
      conversionType = 'letter_created';
    } else if (formId.includes('premium') || formId.includes('subscription')) {
      conversionType = 'premium';
    }

    if (conversionType) {
      this.trackConversion(conversionType);
    }
  }

  // Spåra konvertering
  trackConversion(
    type: UserJourneySession['conversion_type'], 
    value: number = 0
  ): void {
    this.currentSession.converted = true;
    this.currentSession.conversion_type = type;
    this.currentSession.conversion_value = value;
    
    this.onPageExit('conversion');
    this.updateSession();
    
    // Skicka conversion event till Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        event_category: 'User Journey',
        event_label: type,
        value: value,
        session_id: this.sessionId
      });
    }
  }

  // Uppdatera session i databas
  private async updateSession(): Promise<void> {
    try {
      await this.supabase
        .from('user_journeys')
        .update(this.currentSession)
        .eq('session_id', this.sessionId);
    } catch (error) {
      console.error('Error updating user journey session:', error);
    }
  }

  // Avsluta session
  private endSession(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.isTracking = false;
    this.updateSession();
  }

  // Hämta session data (för debugging)
  getSessionData(): Partial<UserJourneySession> {
    return { ...this.currentSession };
  }

  // Restart tracking för ny session
  restartTracking(): void {
    this.sessionId = this.generateSessionId();
    this.currentSession = {};
    this.isTracking = true;
    this.initializeTracking();
  }

  // Helper methods
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private mapUTMSourceToEntrySource(
    utmSource: string, 
    utmMedium?: string | null
  ): UserJourneySession['entry_source'] {
    if (utmMedium === 'organic' || utmSource === 'google' || utmSource === 'bing') {
      return 'organic';
    }
    if (utmMedium === 'social' || ['facebook', 'twitter', 'linkedin', 'instagram'].includes(utmSource)) {
      return 'social';
    }
    if (utmMedium === 'email' || utmSource === 'email') {
      return 'email';
    }
    if (utmMedium === 'cpc' || utmMedium === 'paid') {
      return 'paid';
    }
    return 'referral';
  }

  private isSearchEngine(referrer: string): boolean {
    const searchEngines = ['google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com'];
    return searchEngines.some(engine => referrer.includes(engine));
  }

  private isSocialMedia(referrer: string): boolean {
    const socialPlatforms = ['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com'];
    return socialPlatforms.some(platform => referrer.includes(platform));
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getLocation(): { country: string; city: string } {
    // Detta skulle implementeras med en IP geolocation service
    return { country: 'Sweden', city: 'Stockholm' };
  }
}

// Export singleton instance
export const userJourneyTracker = new UserJourneyTracker();

// React hook för att använda user journey tracking
export function useUserJourneyTracking() {
  const tracker = userJourneyTracker;
  
  const trackPageView = (page?: string) => {
    tracker.onPageEnter(page);
  };
  
  const trackConversion = (type: UserJourneySession['conversion_type'], value?: number) => {
    tracker.trackConversion(type, value);
  };
  
  const getSessionData = () => {
    return tracker.getSessionData();
  };
  
  return {
    trackPageView,
    trackConversion,
    getSessionData
  };
}