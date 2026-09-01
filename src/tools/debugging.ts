/**
 * Debugging Tools
 * Tools for debugging postMessage communication and analyzing errors
 */

import { Environment, formatResponse } from '../utils/environment.js';

export const debuggingTools = {
  /**
   * Debug postMessage communication issues between frames
   */
  async debugPostMessage(args: any, environment: Environment) {
    const { url, captureTime = 10, filterOrigin } = args;
    
    // Simulate postMessage debugging with realistic scenarios
    const messages = [
      {
        timestamp: Date.now() - 5000,
        origin: 'https://localhost:3000',
        data: { type: 'mantis-ready', version: '1.4.2' },
        direction: 'outbound'
      },
      {
        timestamp: Date.now() - 4500,
        origin: 'https://app.example.com',
        data: { type: 'ack', status: 'initialized' },
        direction: 'inbound'
      },
      {
        timestamp: Date.now() - 3000,
        origin: 'https://localhost:3000',
        data: { type: 'load-model', productId: 'prod_123' },
        direction: 'outbound',
        error: 'SecurityError: Origin mismatch'
      }
    ];
    
    // Filter by origin if specified
    const filteredMessages = filterOrigin ? 
      messages.filter(m => m.origin === filterOrigin) : 
      messages;
    
    // Analyze for common issues
    const analysis = analyzePostMessageIssues(filteredMessages);
    
    const result = {
      success: true,
      captureInfo: {
        duration: captureTime,
        url: url || 'Current page',
        messagesFound: filteredMessages.length,
        filterApplied: filterOrigin
      },
      messages: filteredMessages,
      analysis,
      recommendations: getPostMessageRecommendations(analysis),
      debugScript: getPostMessageDebugScript()
    };
    
    return formatResponse(result, environment, 'analysis');
  },

  /**
   * Analyze console errors and provide fixes
   */
  async analyzeConsoleErrors(args: any, environment: Environment) {
    const { errors, browserInfo } = args;
    
    const analysisResults = errors.map((error: string) => {
      const pattern = identifyErrorPattern(error);
      return {
        error,
        pattern: pattern.type,
        severity: pattern.severity,
        description: pattern.description,
        solution: pattern.solution,
        codeExample: pattern.codeExample,
        relatedErrors: pattern.relatedErrors,
        browserSpecific: pattern.browserSpecific
      };
    });
    
    const summary = {
      total: errors.length,
      critical: analysisResults.filter((r: any) => r.severity === 'critical').length,
      warning: analysisResults.filter((r: any) => r.severity === 'warning').length,
      info: analysisResults.filter((r: any) => r.severity === 'info').length
    };
    
    const result = {
      success: true,
      summary,
      errors: analysisResults,
      browserInfo,
      generalRecommendations: [
        'Enable verbose logging in development mode',
        'Set up error tracking with Sentry or similar',
        'Test in multiple browsers and devices',
        'Implement graceful error handling'
      ],
      debuggingTips: getDebuggingTips()
    };
    
    return formatResponse(result, environment, 'analysis');
  },

  /**
   * Check browser compatibility for Mantis SDK features
   */
  async checkBrowserCompatibility(args: any, environment: Environment) {
    const { userAgent, features } = args;
    
    const browserInfo = parseBrowserInfo(userAgent);
    const compatibilityResults = features.map((feature: string) => 
      checkFeatureCompatibility(feature, browserInfo)
    );
    
    const overallScore = Math.round(
      compatibilityResults.reduce((sum: number, r: any) => sum + r.score, 0) / features.length
    );
    
    const result = {
      success: true,
      browser: browserInfo,
      overallScore,
      compatibility: compatibilityResults,
      recommendations: getCompatibilityRecommendations(compatibilityResults, browserInfo),
      polyfills: getRecommendedPolyfills(compatibilityResults),
      fallbacks: getFallbackStrategies(compatibilityResults)
    };
    
    return formatResponse(result, environment, 'analysis');
  }
};

// Helper functions for debugging tools

function analyzePostMessageIssues(messages: any[]) {
  const issues = [];
  const origins = [...new Set(messages.map(m => m.origin))];
  
  // Check for origin mismatches
  const errorMessages = messages.filter(m => m.error);
  if (errorMessages.length > 0) {
    issues.push({
      type: 'origin_mismatch',
      severity: 'critical',
      description: 'Origin mismatch detected in postMessage communication',
      affectedMessages: errorMessages.length,
      solution: 'Add missing origins to allowedOrigins configuration'
    });
  }
  
  // Check for missing responses
  const outbound = messages.filter(m => m.direction === 'outbound').length;
  const inbound = messages.filter(m => m.direction === 'inbound').length;
  if (outbound > inbound + 1) {
    issues.push({
      type: 'missing_responses',
      severity: 'warning',
      description: `${outbound - inbound} messages sent without responses`,
      solution: 'Check if Mantis iframe is properly loaded and responsive'
    });
  }
  
  // Check for rapid fire messages
  const rapidMessages = messages.filter((m, i) => {
    if (i === 0) return false;
    return m.timestamp - messages[i - 1].timestamp < 100;
  });
  if (rapidMessages.length > 2) {
    issues.push({
      type: 'rapid_messaging',
      severity: 'warning',
      description: 'Rapid message sending detected',
      solution: 'Implement message queuing and debouncing'
    });
  }
  
  return {
    issues,
    origins,
    messageFlow: messages.map(m => ({
      time: new Date(m.timestamp).toISOString(),
      direction: m.direction,
      type: m.data?.type,
      status: m.error ? 'error' : 'success'
    }))
  };
}

function getPostMessageRecommendations(analysis: any) {
  const recommendations = [
    'Always configure allowedOrigins in MantisSDK constructor',
    'Implement message acknowledgment patterns',
    'Add timeout handling for critical messages',
    'Log all postMessage communication in development'
  ];
  
  if (analysis.issues.some((i: any) => i.type === 'origin_mismatch')) {
    recommendations.unshift('CRITICAL: Fix origin mismatch errors immediately');
  }
  
  return recommendations;
}

function getPostMessageDebugScript() {
  return `// Add to your page for debugging postMessage communication
window.addEventListener('message', (event) => {
  console.log('PostMessage Debug:', {
    origin: event.origin,
    data: event.data,
    timestamp: new Date().toISOString(),
    source: event.source === window ? 'self' : 'external'
  });
}, true);

// Override postMessage to log outbound messages
const originalPostMessage = window.postMessage;
window.postMessage = function(message, targetOrigin, transfer) {
  console.log('PostMessage Sent:', {
    message,
    targetOrigin,
    timestamp: new Date().toISOString()
  });
  return originalPostMessage.call(this, message, targetOrigin, transfer);
};`;
}

function identifyErrorPattern(error: string) {
  const patterns = [
    {
      regex: /MantisSDK is not defined/i,
      type: 'sdk_not_loaded',
      severity: 'critical' as const,
      description: 'Mantis SDK script not loaded or initialization failed',
      solution: 'Ensure @mantis-3d/sdk is properly installed and imported',
      codeExample: `import { MantisSDK } from '@mantis-3d/sdk';
// or for CDN
<script src="https://unpkg.com/@mantis-3d/sdk@latest"></script>`,
      relatedErrors: ['ReferenceError', 'Module not found'],
      browserSpecific: false
    },
    {
      regex: /Failed to execute 'postMessage'/i,
      type: 'postmessage_blocked',
      severity: 'critical' as const,
      description: 'postMessage blocked by browser security policy',
      solution: 'Configure allowedOrigins and check CORS settings',
      codeExample: `const sdk = new MantisSDK({
  allowedOrigins: ['https://your-domain.com', 'https://localhost:3000']
});`,
      relatedErrors: ['SecurityError', 'DOMException'],
      browserSpecific: 'Safari Private Mode'
    },
    {
      regex: /WebGL context lost/i,
      type: 'webgl_context_lost',
      severity: 'warning' as const,
      description: '3D rendering context lost, usually due to GPU issues',
      solution: 'Implement WebGL context restoration',
      codeExample: `canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  // Stop rendering
});
canvas.addEventListener('webglcontextrestored', () => {
  // Reinitialize WebGL
});`,
      relatedErrors: ['WebGL error', 'GPU timeout'],
      browserSpecific: 'Mobile browsers'
    },
    {
      regex: /Network Error|Failed to fetch/i,
      type: 'network_error',
      severity: 'warning' as const,
      description: 'Network connectivity issues loading 3D models',
      solution: 'Implement retry logic and offline fallbacks',
      codeExample: `const sdk = new MantisSDK({
  retryAttempts: 3,
  retryDelay: 1000,
  offlineFallback: true
});`,
      relatedErrors: ['TypeError', 'NetworkError'],
      browserSpecific: false
    }
  ];
  
  const match = patterns.find(p => p.regex.test(error));
  return match || {
    type: 'unknown',
    severity: 'info' as const,
    description: 'Unknown error pattern',
    solution: 'Check browser console for more details',
    codeExample: '// Enable debug logging\nconst sdk = new MantisSDK({ enableLogging: true });',
    relatedErrors: [],
    browserSpecific: false
  };
}

function getDebuggingTips() {
  return [
    'Use browser dev tools Network tab to check model loading',
    'Enable MantisSDK debug logging in development',
    'Test in incognito/private browsing mode',
    'Check for ad blockers interfering with 3D content',
    'Verify HTTPS is used for production deployments',
    'Monitor GPU usage in Chrome dev tools Performance tab'
  ];
}

function parseBrowserInfo(userAgent?: string) {
  if (!userAgent) {
    return {
      name: 'Unknown',
      version: 'Unknown',
      platform: 'Unknown',
      mobile: false
    };
  }
  
  // Simple browser detection (would use a proper library in real implementation)
  let name = 'Unknown';
  let version = 'Unknown';
  
  if (userAgent.includes('Chrome')) {
    name = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Firefox')) {
    name = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    name = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Edge')) {
    name = 'Edge';
    const match = userAgent.match(/Edge\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  }
  
  return {
    name,
    version,
    platform: userAgent.includes('Windows') ? 'Windows' : 
              userAgent.includes('Mac') ? 'macOS' : 
              userAgent.includes('Linux') ? 'Linux' : 'Unknown',
    mobile: /Mobile|Android|iPhone|iPad/.test(userAgent)
  };
}

function checkFeatureCompatibility(feature: string, browserInfo: any) {
  const compatibilityMatrix: Record<string, any> = {
    webgl: {
      Chrome: { min: 9, score: 100 },
      Firefox: { min: 4, score: 100 },
      Safari: { min: 5.1, score: 95 },
      Edge: { min: 12, score: 100 }
    },
    webgl2: {
      Chrome: { min: 56, score: 100 },
      Firefox: { min: 51, score: 100 },
      Safari: { min: 15, score: 90 },
      Edge: { min: 79, score: 100 }
    },
    postmessage: {
      Chrome: { min: 1, score: 100 },
      Firefox: { min: 3, score: 100 },
      Safari: { min: 4, score: 95 },
      Edge: { min: 12, score: 100 }
    },
    fullscreen: {
      Chrome: { min: 15, score: 100 },
      Firefox: { min: 10, score: 100 },
      Safari: { min: 5.1, score: 85 },
      Edge: { min: 12, score: 100 }
    },
    deviceorientation: {
      Chrome: { min: 7, score: 95 },
      Firefox: { min: 6, score: 90 },
      Safari: { min: 4.2, score: 100 },
      Edge: { min: 12, score: 95 }
    }
  };
  
  const featureData = compatibilityMatrix[feature];
  if (!featureData) {
    return {
      feature,
      supported: false,
      score: 0,
      notes: 'Feature compatibility unknown'
    };
  }
  
  const browserData = featureData[browserInfo.name];
  if (!browserData) {
    return {
      feature,
      supported: false,
      score: 50,
      notes: `Compatibility unknown for ${browserInfo.name}`
    };
  }
  
  const browserVersion = parseInt(browserInfo.version);
  const supported = browserVersion >= browserData.min;
  
  return {
    feature,
    supported,
    score: supported ? browserData.score : 0,
    minVersion: browserData.min,
    currentVersion: browserVersion,
    notes: supported ? 'Fully supported' : `Requires ${browserInfo.name} ${browserData.min}+`
  };
}

function getCompatibilityRecommendations(results: any[], browserInfo: any) {
  const recommendations = [];
  
  const unsupported = results.filter(r => !r.supported);
  if (unsupported.length > 0) {
    recommendations.push(`Upgrade ${browserInfo.name} to support: ${unsupported.map(u => u.feature).join(', ')}`);
  }
  
  if (browserInfo.name === 'Safari' && browserInfo.mobile) {
    recommendations.push('Consider iOS-specific optimizations for better performance');
  }
  
  if (browserInfo.mobile) {
    recommendations.push('Implement touch-friendly controls for mobile devices');
    recommendations.push('Optimize 3D models for mobile GPU performance');
  }
  
  recommendations.push('Test across all target browsers before deployment');
  
  return recommendations;
}

function getRecommendedPolyfills(results: any[]) {
  const polyfills = [];
  
  if (results.some(r => r.feature === 'fullscreen' && !r.supported)) {
    polyfills.push({
      feature: 'fullscreen',
      library: 'screenfull.js',
      cdn: 'https://unpkg.com/screenfull@5.2.0/dist/screenfull.min.js'
    });
  }
  
  if (results.some(r => r.feature === 'webgl' && !r.supported)) {
    polyfills.push({
      feature: 'webgl',
      library: 'WebGL fallback',
      note: 'Consider showing 2D images instead of 3D models'
    });
  }
  
  return polyfills;
}

function getFallbackStrategies(results: any[]) {
  const strategies = [];
  
  if (results.some(r => r.feature === 'webgl' && !r.supported)) {
    strategies.push({
      feature: 'webgl',
      strategy: 'Show high-quality product images with zoom functionality',
      implementation: 'Use CSS transforms and touch gestures for interaction'
    });
  }
  
  if (results.some(r => r.feature === 'deviceorientation' && !r.supported)) {
    strategies.push({
      feature: 'deviceorientation',
      strategy: 'Provide manual rotation controls',
      implementation: 'Add rotation buttons and gesture support'
    });
  }
  
  strategies.push({
    feature: 'general',
    strategy: 'Progressive enhancement approach',
    implementation: 'Start with basic functionality and enhance with 3D features'
  });
  
  return strategies;
}