// src/lib/seo/core-web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export interface WebVitalMetrics {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
  url: string;
  timestamp: number;
}

export interface WebVitalThresholds {
  lcp: { good: number; poor: number };
  fid: { good: number; poor: number };
  cls: { good: number; poor: number };
}

export class CoreWebVitalsTracker {
  private readonly thresholds: WebVitalThresholds = {
    lcp: { good: 2500, poor: 4000 }, // milliseconds
    fid: { good: 100, poor: 300 },   // milliseconds
    cls: { good: 0.1, poor: 0.25 }   // score
  };

  private metrics: Partial<WebVitalMetrics> = {};
  private callbacks: ((metrics: WebVitalMetrics) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeTracking();
    }
  }

  // Initiera tracking av Core Web Vitals
  private initializeTracking(): void {
    // Track Largest Contentful Paint (LCP)
    getLCP((metric) => {
      this.metrics.lcp = metric.value;
      this.updateMetrics();
      this.sendToAnalytics('LCP', metric.value);
    });

    // Track First Input Delay (FID)
    getFID((metric) => {
      this.metrics.fid = metric.value;
      this.updateMetrics();
      this.sendToAnalytics('FID', metric.value);
    });

    // Track Cumulative Layout Shift (CLS)
    getCLS((metric) => {
      this.metrics.cls = metric.value;
      this.updateMetrics();
      this.sendToAnalytics('CLS', metric.value);
    });

    // Track First Contentful Paint (FCP)
    getFCP((metric) => {
      this.metrics.fcp = metric.value;
      this.updateMetrics();
      this.sendToAnalytics('FCP', metric.value);
    });

    // Track Time to First Byte (TTFB)
    getTTFB((metric) => {
      this.metrics.ttfb = metric.value;
      this.updateMetrics();
      this.sendToAnalytics('TTFB', metric.value);
    });
  }

  // Uppdatera metrics och trigga callbacks om alla värden finns
  private updateMetrics(): void {
    const { lcp, fid, cls, fcp, ttfb } = this.metrics;
    
    if (lcp !== undefined && fid !== undefined && cls !== undefined && 
        fcp !== undefined && ttfb !== undefined) {
      
      const completeMetrics: WebVitalMetrics = {
        lcp,
        fid,
        cls,
        fcp,
        ttfb,
        url: window.location.pathname,
        timestamp: Date.now()
      };

      this.callbacks.forEach(callback => callback(completeMetrics));
    }
  }

  // Lägg till callback för när alla metrics är samlade
  onMetricsComplete(callback: (metrics: WebVitalMetrics) => void): void {
    this.callbacks.push(callback);
  }

  // Skicka metrics till Google Analytics
  private sendToAnalytics(metricName: string, value: number): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metricName, {
        event_category: 'Web Vitals',
        value: Math.round(value),
        custom_parameter_1: this.getPerformanceGrade(metricName.toLowerCase(), value)
      });
    }
  }

  // Få performance grade för ett specifikt metric
  getPerformanceGrade(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    switch (metric.toLowerCase()) {
      case 'lcp':
        return value <= this.thresholds.lcp.good ? 'good' : 
               value <= this.thresholds.lcp.poor ? 'needs-improvement' : 'poor';
      case 'fid':
        return value <= this.thresholds.fid.good ? 'good' : 
               value <= this.thresholds.fid.poor ? 'needs-improvement' : 'poor';
      case 'cls':
        return value <= this.thresholds.cls.good ? 'good' : 
               value <= this.thresholds.cls.poor ? 'needs-improvement' : 'poor';
      default:
        return 'poor';
    }
  }

  // Få översikt av alla current metrics
  getCurrentMetrics(): Partial<WebVitalMetrics> {
    return { ...this.metrics };
  }

  // Mäta metrics för en specifik URL (för server-side eller synthetic testing)
  async measureVitals(url: string): Promise<WebVitalMetrics | null> {
    try {
      // Detta skulle implementeras med verktyg som Lighthouse CI eller PageSpeed Insights API
      const response = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('PageSpeed API request failed');
      }

      const data = await response.json();
      const metrics = data.lighthouseResult.audits;

      return {
        lcp: metrics['largest-contentful-paint']?.numericValue || 0,
        fid: metrics['max-potential-fid']?.numericValue || 0,
        cls: metrics['cumulative-layout-shift']?.numericValue || 0,
        fcp: metrics['first-contentful-paint']?.numericValue || 0,
        ttfb: metrics['time-to-first-byte']?.numericValue || 0,
        url,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error measuring vitals for URL:', url, error);
      return null;
    }
  }

  // Få rekommendationer baserat på current metrics
  getRecommendations(): Array<{metric: string; issue: string; recommendation: string; priority: 'high' | 'medium' | 'low'}> {
    const recommendations: Array<{metric: string; issue: string; recommendation: string; priority: 'high' | 'medium' | 'low'}> = [];
    
    // LCP rekommendationer
    if (this.metrics.lcp && this.metrics.lcp > this.thresholds.lcp.poor) {
      recommendations.push({
        metric: 'LCP',
        issue: `Largest Contentful Paint är ${Math.round(this.metrics.lcp)}ms (dålig prestanda)`,
        recommendation: 'Optimera bildladdning, använd CDN, förbättra server response time',
        priority: 'high'
      });
    } else if (this.metrics.lcp && this.metrics.lcp > this.thresholds.lcp.good) {
      recommendations.push({
        metric: 'LCP',
        issue: `Largest Contentful Paint är ${Math.round(this.metrics.lcp)}ms (behöver förbättring)`,
        recommendation: 'Implementera lazy loading, komprimera bilder, använd WebP format',
        priority: 'medium'
      });
    }

    // FID rekommendationer
    if (this.metrics.fid && this.metrics.fid > this.thresholds.fid.poor) {
      recommendations.push({
        metric: 'FID',
        issue: `First Input Delay är ${Math.round(this.metrics.fid)}ms (dålig prestanda)`,
        recommendation: 'Minska JavaScript execution time, använd code splitting, defer non-critical JS',
        priority: 'high'
      });
    } else if (this.metrics.fid && this.metrics.fid > this.thresholds.fid.good) {
      recommendations.push({
        metric: 'FID',
        issue: `First Input Delay är ${Math.round(this.metrics.fid)}ms (behöver förbättring)`,
        recommendation: 'Optimera third-party scripts, använd web workers för heavy computations',
        priority: 'medium'
      });
    }

    // CLS rekommendationer
    if (this.metrics.cls && this.metrics.cls > this.thresholds.cls.poor) {
      recommendations.push({
        metric: 'CLS',
        issue: `Cumulative Layout Shift är ${this.metrics.cls.toFixed(3)} (dålig prestanda)`,
        recommendation: 'Sätt explicita dimensioner på bilder/videos, undvik dynamiskt injected content',
        priority: 'high'
      });
    } else if (this.metrics.cls && this.metrics.cls > this.thresholds.cls.good) {
      recommendations.push({
        metric: 'CLS',
        issue: `Cumulative Layout Shift är ${this.metrics.cls.toFixed(3)} (behöver förbättring)`,
        recommendation: 'Reservera plats för ads/embeds, använd font-display: swap försiktigt',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  // Skapa performance rapport
  generatePerformanceReport(): {
    overall_score: number;
    grades: {[key: string]: 'good' | 'needs-improvement' | 'poor'};
    metrics: Partial<WebVitalMetrics>;
    recommendations: Array<{metric: string; issue: string; recommendation: string; priority: 'high' | 'medium' | 'low'}>;
  } {
    const grades = {
      lcp: this.metrics.lcp ? this.getPerformanceGrade('lcp', this.metrics.lcp) : 'poor',
      fid: this.metrics.fid ? this.getPerformanceGrade('fid', this.metrics.fid) : 'poor',
      cls: this.metrics.cls ? this.getPerformanceGrade('cls', this.metrics.cls) : 'poor'
    };

    // Beräkna overall score (0-100)
    const scoreMap = { good: 100, 'needs-improvement': 65, poor: 30 };
    const scores = Object.values(grades).map(grade => scoreMap[grade]);
    const overall_score = scores.reduce((acc, score) => acc + score, 0) / scores.length;

    return {
      overall_score: Math.round(overall_score),
      grades,
      metrics: this.getCurrentMetrics(),
      recommendations: this.getRecommendations()
    };
  }
}

// Global tracker instance
export const coreWebVitalsTracker = new CoreWebVitalsTracker();

// React hook för att använda Core Web Vitals i komponenter
export function useWebVitals() {
  const [metrics, setMetrics] = useState<Partial<WebVitalMetrics>>({});
  const [report, setReport] = useState<ReturnType<CoreWebVitalsTracker['generatePerformanceReport']> | null>(null);

  useEffect(() => {
    const tracker = new CoreWebVitalsTracker();
    
    tracker.onMetricsComplete((completeMetrics) => {
      setMetrics(completeMetrics);
      setReport(tracker.generatePerformanceReport());
    });

    // Uppdatera metrics med current state
    setMetrics(tracker.getCurrentMetrics());
  }, []);

  return { metrics, report };
}