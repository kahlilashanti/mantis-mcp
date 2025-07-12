/**
 * Error Pattern Recognition for Mantis MCP
 * Common error patterns and their solutions
 */

export interface ErrorPattern {
  pattern: RegExp;
  category: 'mantis' | 'browser' | 'network' | 'security' | 'webgl' | 'javascript';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  solution: string;
  code?: string;
}

export interface ErrorAnalysis {
  pattern: string;
  category: string;
  severity: string;
  count: number;
  examples: string[];
  solution: string;
  prevention: string;
}

/**
 * Known error patterns for Mantis SDK
 */
export const ERROR_PATTERNS: ErrorPattern[] = [
  // PostMessage errors
  {
    pattern: /Failed to execute 'postMessage' on '(DOMWindow|Window)'/i,
    category: 'mantis',
    severity: 'critical',
    description: 'PostMessage communication failure between frames',
    solution: 'Check allowedOrigins configuration and ensure origins match exactly',
    code: `
// Fix origin mismatch
const sdk = new MantisSDK({
  allowedOrigins: [
    window.location.origin,
    'https://mantisxr.com',
    'https://your-domain.com'
  ]
});`
  },

  {
    pattern: /The target origin provided.*does not match.*recipient window's origin/i,
    category: 'security',
    severity: 'high',
    description: 'Origin mismatch in postMessage communication',
    solution: 'Add the correct origin to allowedOrigins or use window.location.origin',
    code: `
// Dynamic origin detection
const allowedOrigins = [
  window.location.origin,
  'https://mantisxr.com'
];`
  },

  // WebGL errors
  {
    pattern: /WebGL context lost|CONTEXT_LOST_WEBGL/i,
    category: 'webgl',
    severity: 'high',
    description: 'WebGL context has been lost, usually due to GPU issues',
    solution: 'Implement context restoration and handle gracefully',
    code: `
canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  console.warn('WebGL context lost, attempting recovery...');
});

canvas.addEventListener('webglcontextrestored', () => {
  console.log('WebGL context restored');
  reinitializeWebGL();
});`
  },

  {
    pattern: /WebGL.*not supported|WebGL.*disabled/i,
    category: 'browser',
    severity: 'critical',
    description: 'WebGL is not supported or disabled in this browser',
    solution: 'Provide fallback experience or browser upgrade message',
    code: `
if (!isWebGLSupported()) {
  showFallbackMessage('3D features require WebGL support');
  loadFallbackExperience();
}`
  },

  // CORS errors
  {
    pattern: /CORS.*blocked|Cross-Origin Request Blocked/i,
    category: 'network',
    severity: 'high',
    description: 'CORS policy is blocking resource requests',
    solution: 'Configure server CORS headers or use proxy for development',
    code: `
// Server-side CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://your-domain.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});`
  },

  // Mantis SDK errors
  {
    pattern: /MantisSDK.*not defined|Mantis.*is not a constructor/i,
    category: 'mantis',
    severity: 'critical',
    description: 'Mantis SDK is not loaded or imported correctly',
    solution: 'Ensure SDK is properly installed and imported',
    code: `
// Check SDK installation
npm list @mantis-3d/sdk

// Proper import
import { MantisSDK } from '@mantis-3d/sdk';`
  },

  {
    pattern: /Model.*failed to load|Model.*not found/i,
    category: 'mantis',
    severity: 'medium',
    description: '3D model file could not be loaded',
    solution: 'Check model URL, file format, and network connectivity',
    code: `
// Add error handling for model loading
sdk.on('model-error', (event) => {
  console.error('Model loading failed:', event.data);
  showErrorMessage('Failed to load 3D model');
});`
  },

  // Safari-specific errors
  {
    pattern: /SecurityError.*blocked.*origin|SecurityError.*sandbox/i,
    category: 'security',
    severity: 'high',
    description: 'Safari security restrictions, possibly private mode',
    solution: 'Detect private mode and show appropriate message',
    code: `
// Detect Safari private mode
async function handleSafariSecurity() {
  try {
    await navigator.storage.estimate();
  } catch (error) {
    if (error.name === 'SecurityError') {
      showPrivateModeMessage();
    }
  }
}`
  },

  // Memory errors
  {
    pattern: /out of memory|maximum call stack|heap.*limit/i,
    category: 'javascript',
    severity: 'high',
    description: 'Memory limit exceeded or stack overflow',
    solution: 'Optimize memory usage and implement cleanup',
    code: `
// Implement proper cleanup
sdk.on('beforeunload', () => {
  sdk.destroy();
  cleanupResources();
});`
  },

  // Network errors
  {
    pattern: /Failed to fetch|Network.*error|net::ERR_/i,
    category: 'network',
    severity: 'medium',
    description: 'Network request failed',
    solution: 'Implement retry logic and offline handling',
    code: `
// Retry logic for network requests
async function fetchWithRetry(url, options = {}, retries = 3) {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (retries > 0) {
      await delay(1000);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}`
  },

  // Mixed content errors
  {
    pattern: /Mixed Content.*blocked|insecure.*request/i,
    category: 'security',
    severity: 'medium',
    description: 'Mixed content: HTTPS page loading HTTP resources',
    solution: 'Ensure all resources use HTTPS',
    code: `
// Force HTTPS for all resource URLs
const secureUrl = url.replace(/^http:/, 'https:');`
  }
];

/**
 * Analyze errors against known patterns
 */
export function analyzeErrors(errors: string[]): ErrorAnalysis[] {
  const analysis = new Map<string, ErrorAnalysis>();

  errors.forEach(error => {
    for (const pattern of ERROR_PATTERNS) {
      if (pattern.pattern.test(error)) {
        const key = pattern.description;
        
        if (analysis.has(key)) {
          const existing = analysis.get(key)!;
          existing.count++;
          existing.examples.push(error);
        } else {
          analysis.set(key, {
            pattern: pattern.pattern.source,
            category: pattern.category,
            severity: pattern.severity,
            count: 1,
            examples: [error],
            solution: pattern.solution,
            prevention: generatePreventionTip(pattern)
          });
        }
        break; // Match first pattern only
      }
    }
  });

  return Array.from(analysis.values()).sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity as keyof typeof severityOrder] - 
           severityOrder[a.severity as keyof typeof severityOrder];
  });
}

/**
 * Get solutions for specific error patterns
 */
export function getSolutionsForError(error: string): any[] {
  const solutions = [];

  for (const pattern of ERROR_PATTERNS) {
    if (pattern.pattern.test(error)) {
      solutions.push({
        description: pattern.description,
        solution: pattern.solution,
        code: pattern.code,
        severity: pattern.severity,
        category: pattern.category
      });
    }
  }

  return solutions;
}

/**
 * Generate prevention tips for error patterns
 */
function generatePreventionTip(pattern: ErrorPattern): string {
  const preventionTips: Record<string, string> = {
    mantis: 'Ensure proper SDK initialization and configuration',
    browser: 'Test across different browsers and implement feature detection',
    network: 'Implement retry logic and offline handling',
    security: 'Review security policies and origin configurations',
    webgl: 'Implement WebGL context loss handling and fallbacks',
    javascript: 'Use proper error boundaries and memory management'
  };

  return preventionTips[pattern.category] || 'Follow best practices for error handling';
}

/**
 * Categorize errors by type
 */
export function categorizeErrors(errors: string[]): Record<string, string[]> {
  const categories: Record<string, string[]> = {
    mantis: [],
    browser: [],
    network: [],
    security: [],
    webgl: [],
    javascript: [],
    unknown: []
  };

  errors.forEach(error => {
    let categorized = false;
    
    for (const pattern of ERROR_PATTERNS) {
      if (pattern.pattern.test(error)) {
        categories[pattern.category].push(error);
        categorized = true;
        break;
      }
    }
    
    if (!categorized) {
      categories.unknown.push(error);
    }
  });

  return categories;
}

/**
 * Get error severity distribution
 */
export function getErrorSeverityDistribution(errors: string[]): Record<string, number> {
  const distribution = { critical: 0, high: 0, medium: 0, low: 0, unknown: 0 };

  errors.forEach(error => {
    let found = false;
    
    for (const pattern of ERROR_PATTERNS) {
      if (pattern.pattern.test(error)) {
        distribution[pattern.severity]++;
        found = true;
        break;
      }
    }
    
    if (!found) {
      distribution.unknown++;
    }
  });

  return distribution;
}

/**
 * Generate comprehensive error report
 */
export function generateErrorReport(errors: string[]): any {
  const analysis = analyzeErrors(errors);
  const categories = categorizeErrors(errors);
  const severity = getErrorSeverityDistribution(errors);

  return {
    summary: {
      totalErrors: errors.length,
      uniquePatterns: analysis.length,
      criticalIssues: severity.critical,
      knownPatterns: errors.length - severity.unknown
    },
    analysis,
    categories,
    severity,
    recommendations: generateErrorRecommendations(analysis),
    monitoring: {
      alertThresholds: {
        critical: 1, // Alert on any critical error
        high: 5,     // Alert on 5+ high severity errors
        medium: 20   // Alert on 20+ medium severity errors
      },
      trackingMetrics: [
        'Error frequency by pattern',
        'Error severity trends over time',
        'Browser-specific error rates',
        'Error impact on user experience'
      ]
    }
  };
}

function generateErrorRecommendations(analysis: ErrorAnalysis[]): string[] {
  const recommendations = [];

  // Priority recommendations based on severity and frequency
  const criticalErrors = analysis.filter(a => a.severity === 'critical');
  if (criticalErrors.length > 0) {
    recommendations.push('URGENT: Address critical errors immediately - they prevent core functionality');
  }

  const frequentErrors = analysis.filter(a => a.count > 5);
  if (frequentErrors.length > 0) {
    recommendations.push('Focus on frequently occurring errors for maximum impact');
  }

  // Category-specific recommendations
  const mantisErrors = analysis.filter(a => a.category === 'mantis');
  if (mantisErrors.length > 0) {
    recommendations.push('Review Mantis SDK integration and configuration');
  }

  const browserErrors = analysis.filter(a => a.category === 'browser');
  if (browserErrors.length > 0) {
    recommendations.push('Implement better browser compatibility testing');
  }

  const networkErrors = analysis.filter(a => a.category === 'network');
  if (networkErrors.length > 0) {
    recommendations.push('Add robust network error handling and retry logic');
  }

  if (recommendations.length === 0) {
    recommendations.push('Error patterns look manageable - focus on monitoring and prevention');
  }

  return recommendations;
}