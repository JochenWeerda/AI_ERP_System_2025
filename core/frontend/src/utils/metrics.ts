import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

// Initialize performance observer
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    const metric = {
      name: entry.name,
      value: entry.startTime,
      rating: getRating(entry.name, entry.startTime),
    };
    sendToAnalytics(metric);
  });
});

observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });

// Get rating based on metric thresholds
const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  switch (name) {
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
    case 'FID':
      return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
    case 'LCP':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
    case 'FCP':
      return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
    case 'TTFB':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
    default:
      return 'needs-improvement';
  }
};

// Send metrics to analytics endpoint
const sendToAnalytics = async (metric: {
  name: string;
  value: number;
  rating: string;
}) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      await fetch('/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
      });
    } else {
      console.log('Metric:', metric);
    }
  } catch (error) {
    console.error('Error sending metric:', error);
  }
};

// Report Core Web Vitals
export const reportWebVitals = () => {
  onCLS((metric) => sendToAnalytics({ ...metric, rating: getRating('CLS', metric.value) }));
  onFID((metric) => sendToAnalytics({ ...metric, rating: getRating('FID', metric.value) }));
  onLCP((metric) => sendToAnalytics({ ...metric, rating: getRating('LCP', metric.value) }));
  onFCP((metric) => sendToAnalytics({ ...metric, rating: getRating('FCP', metric.value) }));
  onTTFB((metric) => sendToAnalytics({ ...metric, rating: getRating('TTFB', metric.value) }));
}; 