// Mock version för build-kompatibilitet

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

export class CoreWebVitals {
  private readonly thresholds: WebVitalThresholds = {
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 }
  };

  async measurePageVitals(url: string): Promise<WebVitalMetrics> {
    // Mock data - real implementation would use web-vitals library
    return {
      lcp: Math.floor(Math.random() * 3000) + 1000,
      fid: Math.floor(Math.random() * 200) + 50,
      cls: Math.random() * 0.3,
      fcp: Math.floor(Math.random() * 2000) + 500,
      ttfb: Math.floor(Math.random() * 500) + 100,
      url,
      timestamp: Date.now(),
    };
  }

  async getAggregatedMetrics(timeRange: {start: string, end: string}) {
    return {
      lcp: { avg: 2200, p75: 2800, samples: 100 },
      fid: { avg: 80, p75: 120, samples: 100 },
      cls: { avg: 0.05, p75: 0.08, samples: 100 },
      fcp: { avg: 1200, p75: 1600, samples: 100 },
      ttfb: { avg: 200, p75: 300, samples: 100 },
    };
  }

  evaluateScore(metric: keyof WebVitalMetrics, value: number): 'good' | 'needs-improvement' | 'poor' {
    if (metric === 'cls') {
      if (value <= this.thresholds.cls.good) return 'good';
      if (value <= this.thresholds.cls.poor) return 'needs-improvement';
      return 'poor';
    }
    
    const threshold = this.thresholds[metric as keyof WebVitalThresholds];
    if (!threshold) return 'good';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }
}