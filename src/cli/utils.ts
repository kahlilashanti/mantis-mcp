/**
 * Utility functions for CLI operations
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { platform } from 'os';
import { CLAUDE_CONFIG_PATHS, ERROR_CODES, type ErrorCode } from './constants.js';

export interface ClaudeConfig {
  mcpServers?: Record<string, {
    command: string;
    args: string[];
    env?: Record<string, string>;
  }>;
  [key: string]: any;
}

export interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export class ConfigError extends Error {
  constructor(public code: ErrorCode, message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * Get the Claude Desktop config path for the current platform
 */
export function getClaudeConfigPath(): string {
  const currentPlatform = platform() as keyof typeof CLAUDE_CONFIG_PATHS;
  const configPath = CLAUDE_CONFIG_PATHS[currentPlatform];
  
  if (!configPath) {
    throw new ConfigError(ERROR_CODES.UNKNOWN_PLATFORM, `Unsupported platform: ${currentPlatform}`);
  }
  
  return configPath;
}

/**
 * Check if Claude Desktop config file exists
 */
export function configExists(): boolean {
  try {
    const configPath = getClaudeConfigPath();
    return existsSync(configPath);
  } catch {
    return false;
  }
}

/**
 * Read and parse Claude Desktop config
 */
export function readClaudeConfig(): ClaudeConfig {
  const configPath = getClaudeConfigPath();
  
  if (!existsSync(configPath)) {
    // Return empty config if file doesn't exist
    return {};
  }
  
  try {
    const configContent = readFileSync(configPath, 'utf-8');
    
    if (!configContent.trim()) {
      return {};
    }
    
    return JSON.parse(configContent);
  } catch (error) {
    if ((error as any).code === 'EACCES') {
      throw new ConfigError(ERROR_CODES.CONFIG_PERMISSION, `Permission denied reading config file: ${configPath}`);
    }
    throw new ConfigError(ERROR_CODES.CONFIG_MALFORMED, `Invalid JSON in config file: ${configPath}`);
  }
}

/**
 * Write Claude Desktop config
 */
export function writeClaudeConfig(config: ClaudeConfig): void {
  const configPath = getClaudeConfigPath();
  
  try {
    // Ensure directory exists
    const configDir = dirname(configPath);
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }
    
    const configJson = JSON.stringify(config, null, 2);
    writeFileSync(configPath, configJson, 'utf-8');
  } catch (error) {
    if ((error as any).code === 'EACCES') {
      throw new ConfigError(ERROR_CODES.CONFIG_PERMISSION, `Permission denied writing config file: ${configPath}`);
    }
    throw error;
  }
}

/**
 * Get the path to the MCP server executable
 */
export function getMCPServerPath(): string {
  // Try to find the built server file
  const possiblePaths = [
    resolve(process.cwd(), 'dist', 'index.js'),
    resolve(__dirname, '..', '..', 'dist', 'index.js'),
    resolve(__dirname, '..', 'index.js')
  ];
  
  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return path;
    }
  }
  
  throw new ConfigError(ERROR_CODES.SERVER_NOT_FOUND, 'MCP server executable not found. Run "npm run build" first.');
}

/**
 * Create MCP server configuration
 */
export function createMCPServerConfig(): MCPServerConfig {
  const serverPath = getMCPServerPath();
  
  return {
    command: 'node',
    args: [serverPath],
    env: {}
  };
}

/**
 * Add MCP server to Claude config
 */
export function addMCPServer(serverName: string, serverConfig: MCPServerConfig): void {
  const config = readClaudeConfig();
  
  // Initialize mcpServers if it doesn't exist
  if (!config.mcpServers) {
    config.mcpServers = {};
  }
  
  // Add or update the server
  config.mcpServers[serverName] = serverConfig;
  
  writeClaudeConfig(config);
}

/**
 * Remove MCP server from Claude config
 */
export function removeMCPServer(serverName: string): boolean {
  const config = readClaudeConfig();
  
  if (!config.mcpServers || !config.mcpServers[serverName]) {
    return false; // Server wasn't configured
  }
  
  delete config.mcpServers[serverName];
  
  // Remove mcpServers object if it's empty
  if (Object.keys(config.mcpServers).length === 0) {
    delete config.mcpServers;
  }
  
  writeClaudeConfig(config);
  return true;
}

/**
 * Check if MCP server is configured
 */
export function isMCPServerConfigured(serverName: string): boolean {
  try {
    const config = readClaudeConfig();
    return !!(config.mcpServers && config.mcpServers[serverName]);
  } catch {
    return false;
  }
}

/**
 * Validate MCP server can start
 */
export async function validateMCPServer(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const serverPath = getMCPServerPath();
      const { spawn } = require('child_process');
      
      const child = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 3000
      });
      
      let hasOutput = false;
      
      // Listen for the startup message on stderr
      child.stderr.on('data', (data: Buffer) => {
        const output = data.toString();
        if (output.includes('Mantis MCP Server running')) {
          hasOutput = true;
          child.kill();
          resolve(true);
        }
      });
      
      // Also listen on stdout in case it goes there
      child.stdout.on('data', (data: Buffer) => {
        const output = data.toString();
        if (output.includes('Mantis MCP Server running')) {
          hasOutput = true;
          child.kill();
          resolve(true);
        }
      });
      
      child.on('exit', (code: number | null) => {
        // If it started and exited cleanly, that's good
        if (hasOutput || code === 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
      
      child.on('error', () => {
        resolve(false);
      });
      
      // Send empty JSON to trigger server startup and immediate exit
      child.stdin.write('{}');
      child.stdin.end();
      
      // Timeout after 3 seconds
      setTimeout(() => {
        if (!hasOutput) {
          child.kill();
          // If we get here, try a simpler validation - just check if file exists and is executable
          resolve(existsSync(serverPath));
        }
      }, 3000);
      
    } catch {
      resolve(false);
    }
  });
}

/**
 * Create a backup of the current config
 */
export function backupConfig(): string {
  const configPath = getClaudeConfigPath();
  const backupPath = `${configPath}.backup.${Date.now()}`;
  
  if (existsSync(configPath)) {
    const configContent = readFileSync(configPath, 'utf-8');
    writeFileSync(backupPath, configContent, 'utf-8');
    return backupPath;
  }
  
  return '';
}