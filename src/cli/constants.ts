/**
 * Platform-specific constants for Claude Desktop configuration
 */

import { homedir } from 'os';
import { join } from 'path';

export const CLAUDE_CONFIG_PATHS = {
  darwin: join(homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
  win32: join(process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'), 'Claude', 'claude_desktop_config.json'),
  linux: join(homedir(), '.config', 'claude', 'claude_desktop_config.json')
};

export const PACKAGE_NAME = '@mantis-3d/mcp-server';
export const MCP_SERVER_NAME = 'mantis-mcp';

export const CLI_MESSAGES = {
  WELCOME: '🎯 Mantis MCP Server Installation',
  SUCCESS: '✅ Installation completed successfully!',
  ERROR: '❌ Installation failed',
  WARNING: '⚠️  Warning',
  INFO: 'ℹ️  Info',
  CHECKING: '🔍 Checking system...',
  INSTALLING: '📦 Installing MCP server...',
  CONFIGURING: '⚙️  Configuring Claude Desktop...',
  VALIDATING: '✓ Validating installation...',
  RESTART_REQUIRED: '🔄 Please restart Claude Desktop to use Mantis tools'
};

export const ERROR_CODES = {
  CONFIG_NOT_FOUND: 'CONFIG_NOT_FOUND',
  CONFIG_PERMISSION: 'CONFIG_PERMISSION',
  CONFIG_MALFORMED: 'CONFIG_MALFORMED',
  SERVER_NOT_FOUND: 'SERVER_NOT_FOUND',
  SERVER_START_FAILED: 'SERVER_START_FAILED',
  UNKNOWN_PLATFORM: 'UNKNOWN_PLATFORM'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];