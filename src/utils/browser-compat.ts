/**
 * Browser Compatibility Utilities for Mantis MCP
 * Detection and handling of browser-specific issues
 */

export interface BrowserCapabilities {
  webgl: boolean;
  webgl2: boolean;
  postMessage: boolean;
  iframe: boolean;
  canvas: boolean;
  localStorage: boolean;
  cookies: boolean;
  fullscreen: boolean;
}

export interface BrowserInfo {
  name: string;
  version: number;
  platform: string;
  mobile: boolean;
  privateMode: boolean;
}

/**
 * Detect browser capabilities
 */
export function detectBrowserCapabilities(): BrowserCapabilities {
  const capabilities: BrowserCapabilities = {
    webgl: false,
    webgl2: false,
    postMessage: typeof window !== 'undefined' && 'postMessage' in window,
    iframe: typeof document !== 'undefined',
    canvas: typeof document !== 'undefined' && 'createElement' in document,
    localStorage: false,
    cookies: typeof document !== 'undefined' && navigator.cookieEnabled,
    fullscreen: typeof document !== 'undefined' && 'requestFullscreen' in document.documentElement
  };

  // Test WebGL support
  if (typeof document !== 'undefined') {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      capabilities.webgl = !!gl;
      
      if (gl) {
        const gl2 = canvas.getContext('webgl2');
        capabilities.webgl2 = !!gl2;
      }
    } catch (e) {
      capabilities.webgl = false;
      capabilities.webgl2 = false;
    }
  }

  // Test localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      capabilities.localStorage = true;
    }
  } catch (e) {
    capabilities.localStorage = false;
  }

  return capabilities;
}

/**
 * Parse browser information from user agent
 */
export function parseBrowserInfo(userAgent?: string): BrowserInfo {
  const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  
  const browsers = [
    { name: 'Chrome', pattern: /Chrome\/(\d+)/ },
    { name: 'Safari', pattern: /Version\/(\d+).*Safari/ },
    { name: 'Firefox', pattern: /Firefox\/(\d+)/ },
    { name: 'Edge', pattern: /Edg\/(\d+)/ },
    { name: 'Opera', pattern: /OPR\/(\d+)/ }
  ];

  let browserInfo: BrowserInfo = {
    name: 'Unknown',
    version: 0,
    platform: 'Unknown',
    mobile: false,
    privateMode: false
  };

  // Detect browser
  for (const browser of browsers) {
    const match = ua.match(browser.pattern);
    if (match) {
      browserInfo.name = browser.name;
      browserInfo.version = parseInt(match[1], 10);
      break;
    }
  }

  // Detect platform
  if (ua.includes('Mac')) {
    browserInfo.platform = 'macOS';
  } else if (ua.includes('Windows')) {
    browserInfo.platform = 'Windows';
  } else if (ua.includes('Linux')) {
    browserInfo.platform = 'Linux';
  } else if (ua.includes('Android')) {
    browserInfo.platform = 'Android';
    browserInfo.mobile = true;
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    browserInfo.platform = 'iOS';
    browserInfo.mobile = true;
  }

  // Detect mobile
  if (!browserInfo.mobile) {
    browserInfo.mobile = /Mobi|Android/i.test(ua);
  }

  return browserInfo;
}

/**
 * Detect Safari private mode
 */
export async function detectSafariPrivateMode(): Promise<boolean> {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return false;
  }

  // Method 1: Storage quota
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.quota !== undefined && estimate.quota < 120000000; // Less than ~120MB
    }
  } catch (e) {
    // Fall through to other methods
  }

  // Method 2: IndexedDB test
  try {
    return new Promise<boolean>((resolve) => {
      const idb = indexedDB.open('test');
      idb.onerror = () => resolve(true); // Private mode
      idb.onsuccess = () => {
        indexedDB.deleteDatabase('test');
        resolve(false); // Not private mode
      };
    });
  } catch (e) {
    return true; // Assume private mode if can't test
  }
}

/**
 * Check for known browser issues
 */
export function checkBrowserIssues(browserInfo: BrowserInfo, capabilities: BrowserCapabilities): string[] {
  const issues: string[] = [];

  // Safari issues
  if (browserInfo.name === 'Safari') {
    if (browserInfo.version < 14) {
      issues.push('safari-old-webgl2');
    }
    if (browserInfo.privateMode) {
      issues.push('safari-private-mode');
    }
    if (browserInfo.mobile) {
      issues.push('safari-mobile-iframe-height');
    }
  }

  // Chrome issues
  if (browserInfo.name === 'Chrome' && browserInfo.version < 80) {
    issues.push('chrome-old-version');
  }

  // Firefox issues
  if (browserInfo.name === 'Firefox' && browserInfo.version < 90) {
    issues.push('firefox-webgl-performance');
  }

  // Capability-based issues
  if (!capabilities.webgl) {
    issues.push('no-webgl-support');
  }

  if (!capabilities.localStorage && !capabilities.cookies) {
    issues.push('no-storage-available');
  }

  if (browserInfo.mobile && !capabilities.fullscreen) {
    issues.push('mobile-no-fullscreen');
  }

  return issues;
}

/**
 * Get workarounds for browser issues
 */
export function getBrowserWorkarounds(issues: string[]): Record<string, any> {
  const workarounds: Record<string, any> = {
    'safari-private-mode': {
      description: 'Safari Private Mode blocks cross-origin storage',
      solution: 'Show user message about private mode limitations',
      code: `
if (await detectSafariPrivateMode()) {
  showMessage('For the best experience, please disable Private Mode');
}`
    },

    'safari-old-webgl2': {
      description: 'Older Safari versions have limited WebGL 2.0 support',
      solution: 'Fallback to WebGL 1.0 renderer',
      code: `
const webglVersion = capabilities.webgl2 ? 2 : 1;
const renderer = webglVersion === 2 ? new WebGL2Renderer() : new WebGLRenderer();`
    },

    'safari-mobile-iframe-height': {
      description: 'Mobile Safari has iframe height calculation issues',
      solution: 'Use viewport-based sizing and handle orientation changes',
      code: `
// Use viewport units and handle resize
iframe.style.height = '50vh';
window.addEventListener('orientationchange', () => {
  setTimeout(() => iframe.style.height = '50vh', 500);
});`
    },

    'no-webgl-support': {
      description: 'Browser does not support WebGL',
      solution: 'Show 2D fallback or upgrade message',
      code: `
if (!capabilities.webgl) {
  showFallbackMessage('3D features require a modern browser with WebGL support');
}`
    },

    'no-storage-available': {
      description: 'No storage mechanisms available',
      solution: 'Use in-memory storage with session persistence warnings',
      code: `
const storage = capabilities.localStorage ? localStorage : 
               capabilities.cookies ? new CookieStorage() : 
               new MemoryStorage();`
    }
  };

  const result: Record<string, any> = {};
  issues.forEach(issue => {
    if (workarounds[issue]) {
      result[issue] = workarounds[issue];
    }
  });

  return result;
}

/**
 * Generate browser compatibility report
 */
export function generateCompatibilityReport(): any {
  const capabilities = detectBrowserCapabilities();
  const browserInfo = parseBrowserInfo();
  const issues = checkBrowserIssues(browserInfo, capabilities);
  const workarounds = getBrowserWorkarounds(issues);

  return {
    browser: browserInfo,
    capabilities,
    issues,
    workarounds,
    compatibilityScore: calculateCompatibilityScore(capabilities, issues),
    recommendations: generateCompatibilityRecommendations(issues)
  };
}

function calculateCompatibilityScore(capabilities: BrowserCapabilities, issues: string[]): number {
  let score = 100;

  // Deduct points for missing capabilities
  if (!capabilities.webgl) score -= 30;
  if (!capabilities.webgl2) score -= 10;
  if (!capabilities.postMessage) score -= 20;
  if (!capabilities.localStorage) score -= 10;

  // Deduct points for issues
  issues.forEach(issue => {
    if (issue.includes('private-mode')) score -= 15;
    if (issue.includes('old-version')) score -= 10;
    if (issue.includes('no-webgl')) score -= 30;
  });

  return Math.max(0, score);
}

function generateCompatibilityRecommendations(issues: string[]): string[] {
  const recommendations = [];

  if (issues.includes('safari-private-mode')) {
    recommendations.push('Detect and handle Safari Private Mode gracefully');
  }

  if (issues.includes('no-webgl-support')) {
    recommendations.push('Provide 2D fallback for browsers without WebGL');
  }

  if (issues.some(i => i.includes('old-version'))) {
    recommendations.push('Consider showing browser upgrade prompts for very old versions');
  }

  if (issues.includes('mobile-no-fullscreen')) {
    recommendations.push('Adapt UI for mobile devices without fullscreen support');
  }

  if (recommendations.length === 0) {
    recommendations.push('Browser compatibility is excellent');
  }

  return recommendations;
}