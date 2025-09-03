// src/lib/seo/core-web-vitals.ts
// Build-compatible version using mock implementations
import React, { useState, useEffect } from 'react';

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
      this.initializeMockTracking();
    }
  }

  // Mock tracking instead of real web-vitals
  private initializeMockTracking(): void {
    // Simulate metrics with random values
    setTimeout(() => {
      this.metrics = {
        lcp: Math.floor(Math.random() * 3000) + 1000,
        fid: Math.floor(Math.random() * 200) + 50,
        cls: Math.random() * 0.3,
        fcp: Math.floor(Math.random() * 2000) + 500,
        ttfb: Math.floor(Math.random() * 500) + 100,
        url: typeof window !== 'undefined' ? window.location.pathname : '/',
        timestamp: Date.now()
      };
      this.updateMetrics();
    }, 1000);
  }

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
        url: typeof window !== 'undefined' ? window.location.pathname : '/',
        timestamp: Date.now()
      };

      this.callbacks.forEach(callback => callback(completeMetrics));
    }
  }

  onMetricsComplete(callback: (metrics: WebVitalMetrics) => void): void {
    this.callbacks.push(callback);
  }

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

  getCurrentMetrics(): Partial<WebVitalMetrics> {
    return { ...this.metrics };
  }

  // Mock version of measureVitals for server-side testing
  async measureVitals(url: string): Promise<WebVitalMetrics | null> {
    try {
      return {
        lcp: Math.floor(Math.random() * 3000) + 1000,
        fid: Math.floor(Math.random() * 200) + 50,
        cls: Math.random() * 0.3,
        fcp: Math.floor(Math.random() * 2000) + 500,
        ttfb: Math.floor(Math.random() * 500) + 100,
        url,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error measuring vitals for URL:', url, error);
      return null;
    }
  }

  getRecommendations(): Array<{metric: string; issue: string; recommendation: string; priority: 'high' | 'medium' | 'low'}> {
    const recommendations: Array<{metric: string; issue: string; recommendation: string; priority: 'high' | 'medium' | 'low'}> = [];
    
    // Mock recommendations based on thresholds
    if (this.metrics.lcp && this.metrics.lcp > this.thresholds.lcp.poor) {
      recommendations.push({
        metric: 'LCP',
        issue: `Largest Contentful Paint är ${Math.round(this.metrics.lcp)}ms (dålig prestanda)`,
        recommendation: 'Optimera bildladdning, använd CDN, förbättra server response time',
        priority: 'high'
      });
    }

    return recommendations;
  }

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

    setMetrics(tracker.getCurrentMetrics());
  }, []);

  return { metrics, report };
}