/**
 * Environment Detection Utility
 * Detects the calling environment (Claude Desktop, Claude Code, Cursor, etc.)
 * to provide appropriate response formats
 */

export interface Environment {
  type: 'claude-desktop' | 'claude-code' | 'cursor' | 'generic';
  capabilities: {
    canCreateFiles: boolean;
    canRunCommands: boolean;
    canShowArtifacts: boolean;
    prefersCopyable: boolean;
  };
}

/**
 * Detect the current environment based on available context
 */
export function detectEnvironment(): Environment {
  // Check environment variables that might indicate the calling context
  const nodeEnv = process.env.NODE_ENV;
  const cwd = process.cwd();
  const hasGit = process.env.GIT_DIR || cwd.includes('.git');
  
  // Look for IDE-specific patterns
  const isCursor = process.env.CURSOR_SESSION || process.env.CURSOR_USER;
  const isVSCode = process.env.VSCODE_PID || process.env.TERM_PROGRAM === 'vscode';
  
  // Check for terminal/CLI indicators that suggest executable environment
  const isTTY = process.stdout?.isTTY;
  const hasStdio = process.stdin && process.stdout && process.stderr;
  const isTerminal = process.env.TERM || process.env.TERMINAL;
  
  // Check for Claude-specific patterns
  // Claude Code typically runs MCP servers through stdio in a project context
  const hasProjectContext = hasGit || cwd.includes('projects') || cwd.includes('src');
  const isStdioTransport = hasStdio && !process.env.MCP_TRANSPORT_HTTP;
  
  // Check if we're running as an MCP server (common pattern: running from dist/index.js)
  const isMCPServer = process.argv[1]?.includes('dist/index.js') || 
                      process.argv[1]?.includes('mantis-mcp');
  
  // If we have strong indicators of a development environment with stdio transport,
  // or we're running as an MCP server in a project context,
  // assume it's Claude Code or similar IDE
  if ((isStdioTransport && (hasProjectContext || isTerminal || isTTY)) || 
      (isMCPServer && hasProjectContext)) {
    return {
      type: 'claude-code',
      capabilities: {
        canCreateFiles: true,
        canRunCommands: true,
        canShowArtifacts: false,
        prefersCopyable: false
      }
    };
  }
  
  // Cursor detection
  if (isCursor) {
    return {
      type: 'cursor',
      capabilities: {
        canCreateFiles: true,
        canRunCommands: true,
        canShowArtifacts: false,
        prefersCopyable: false
      }
    };
  }
  
  // VSCode or generic IDE with project context
  if ((isVSCode || nodeEnv === 'development') && hasProjectContext) {
    return {
      type: 'generic',
      capabilities: {
        canCreateFiles: true,
        canRunCommands: true,
        canShowArtifacts: false,
        prefersCopyable: false
      }
    };
  }
  
  // Default to Claude Desktop (chat interface)
  // This is the safest default for unknown environments
  return {
    type: 'claude-desktop',
    capabilities: {
      canCreateFiles: false,
      canRunCommands: false,
      canShowArtifacts: true,
      prefersCopyable: true
    }
  };
}

/**
 * Format response based on environment capabilities
 */
export function formatResponse(
  result: any,
  environment: Environment,
  responseType: 'instructions' | 'execute' | 'analysis' = 'instructions'
): any {
  const { type, capabilities } = environment;
  
  if (responseType === 'execute' && capabilities.canCreateFiles) {
    // Return executable actions for IDE environments
    return {
      action: 'execute',
      environment: type,
      ...result
    };
  }
  
  if (responseType === 'instructions' || capabilities.prefersCopyable) {
    // Return instructional format for chat environments
    return {
      action: 'instructions',
      environment: type,
      copyable: capabilities.prefersCopyable,
      ...result
    };
  }
  
  // Return analysis format for general use
  return {
    action: 'analysis',
    environment: type,
    ...result
  };
}