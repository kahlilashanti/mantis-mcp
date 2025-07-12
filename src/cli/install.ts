#!/usr/bin/env node

/**
 * Mantis MCP Server CLI Installation Tool
 * 
 * Usage:
 *   npx mantis-mcp           # Install and configure
 *   npx mantis-mcp --status  # Check installation status  
 *   npx mantis-mcp --uninstall # Remove from Claude config
 *   npx mantis-mcp --repair  # Fix broken installation
 */

import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { 
  addMCPServer, 
  removeMCPServer, 
  isMCPServerConfigured, 
  validateMCPServer,
  createMCPServerConfig,
  getClaudeConfigPath,
  configExists,
  backupConfig,
  ConfigError 
} from './utils.js';
import { 
  CLI_MESSAGES, 
  MCP_SERVER_NAME, 
  PACKAGE_NAME 
} from './constants.js';

async function install(): Promise<void> {
  console.log(chalk.blue.bold(`\n${CLI_MESSAGES.WELCOME}\n`));
  
  const spinner = ora();
  
  try {
    // Step 1: Check system
    spinner.start(CLI_MESSAGES.CHECKING);
    
    const configPath = getClaudeConfigPath();
    const hasConfig = configExists();
    const isAlreadyInstalled = isMCPServerConfigured(MCP_SERVER_NAME);
    
    spinner.succeed('System check completed');
    
    // Show system info
    console.log(chalk.gray(`Claude config path: ${configPath}`));
    console.log(chalk.gray(`Config exists: ${hasConfig ? 'Yes' : 'No'}`));
    console.log(chalk.gray(`Already installed: ${isAlreadyInstalled ? 'Yes' : 'No'}`));
    
    // Step 2: Handle existing installation
    if (isAlreadyInstalled) {
      const { shouldReinstall } = await inquirer.prompt([{
        type: 'confirm',
        name: 'shouldReinstall',
        message: 'Mantis MCP server is already configured. Reinstall?',
        default: false
      }]);
      
      if (!shouldReinstall) {
        console.log(chalk.yellow('\nInstallation cancelled.'));
        return;
      }
    }
    
    // Step 3: Backup existing config
    let backupPath = '';
    if (hasConfig) {
      spinner.start('Creating config backup...');
      backupPath = backupConfig();
      if (backupPath) {
        spinner.succeed(`Config backed up to: ${backupPath}`);
      } else {
        spinner.succeed('No existing config to backup');
      }
    }
    
    // Step 4: Validate MCP server
    spinner.start(CLI_MESSAGES.VALIDATING);
    const serverValid = await validateMCPServer();
    
    if (!serverValid) {
      spinner.fail('MCP server validation failed');
      console.log(chalk.red('\nThe MCP server could not be started. Please ensure:'));
      console.log(chalk.yellow('1. Dependencies are installed: npm install'));
      console.log(chalk.yellow('2. Project is built: npm run build'));
      console.log(chalk.yellow('3. Node.js version is compatible (v18+)'));
      process.exit(1);
    }
    
    spinner.succeed('MCP server validated');
    
    // Step 5: Get user confirmation
    const { shouldProceed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'shouldProceed',
      message: 'Add Mantis MCP server to Claude Desktop configuration?',
      default: true
    }]);
    
    if (!shouldProceed) {
      console.log(chalk.yellow('\nInstallation cancelled.'));
      return;
    }
    
    // Step 6: Configure Claude Desktop
    spinner.start(CLI_MESSAGES.CONFIGURING);
    
    const serverConfig = createMCPServerConfig();
    addMCPServer(MCP_SERVER_NAME, serverConfig);
    
    spinner.succeed('Claude Desktop configured');
    
    // Step 7: Success message
    console.log(chalk.green.bold(`\n${CLI_MESSAGES.SUCCESS}`));
    console.log(chalk.yellow(`\n${CLI_MESSAGES.RESTART_REQUIRED}`));
    
    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.white('1. Restart Claude Desktop completely'));
    console.log(chalk.white('2. Ask Claude: "Can you list the available Mantis MCP tools?"'));
    console.log(chalk.white('3. Try the demo scenarios in DEMO.md'));
    
    console.log(chalk.gray(`\nServer configured as: ${MCP_SERVER_NAME}`));
    console.log(chalk.gray(`Config path: ${configPath}`));
    
  } catch (error) {
    spinner.fail('Installation failed');
    
    if (error instanceof ConfigError) {
      console.log(chalk.red(`\n${CLI_MESSAGES.ERROR}: ${error.message}`));
      
      switch (error.code) {
        case 'CONFIG_PERMISSION':
          console.log(chalk.yellow('\nTry running with elevated permissions or check file permissions.'));
          break;
        case 'CONFIG_MALFORMED':
          console.log(chalk.yellow('\nBackup and recreate your Claude Desktop config file.'));
          break;
        case 'SERVER_NOT_FOUND':
          console.log(chalk.yellow('\nRun "npm run build" to build the MCP server first.'));
          break;
        case 'UNKNOWN_PLATFORM':
          console.log(chalk.yellow('\nManual configuration required for your platform.'));
          break;
      }
    } else {
      console.log(chalk.red(`\n${CLI_MESSAGES.ERROR}: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
    
    process.exit(1);
  }
}

async function checkStatus(): Promise<void> {
  console.log(chalk.blue.bold('\n🔍 Mantis MCP Server Status\n'));
  
  try {
    const configPath = getClaudeConfigPath();
    const hasConfig = configExists();
    const isInstalled = isMCPServerConfigured(MCP_SERVER_NAME);
    const serverValid = await validateMCPServer();
    
    console.log(chalk.gray(`Claude config path: ${configPath}`));
    console.log(`Config file exists: ${hasConfig ? chalk.green('✓') : chalk.red('✗')}`);
    console.log(`MCP server configured: ${isInstalled ? chalk.green('✓') : chalk.red('✗')}`);
    console.log(`Server executable valid: ${serverValid ? chalk.green('✓') : chalk.red('✗')}`);
    
    if (isInstalled && serverValid) {
      console.log(chalk.green.bold('\n✅ Mantis MCP server is properly installed and configured!'));
      console.log(chalk.yellow('If you can\'t see the tools in Claude, try restarting Claude Desktop.'));
    } else {
      console.log(chalk.red.bold('\n❌ Mantis MCP server is not properly configured.'));
      console.log(chalk.yellow('Run "npx mantis-mcp" to install or "npx mantis-mcp --repair" to fix.'));
    }
    
  } catch (error) {
    console.log(chalk.red(`Error checking status: ${error instanceof Error ? error.message : 'Unknown error'}`));
    process.exit(1);
  }
}

async function uninstall(): Promise<void> {
  console.log(chalk.blue.bold('\n🗑️  Mantis MCP Server Uninstall\n'));
  
  try {
    const isInstalled = isMCPServerConfigured(MCP_SERVER_NAME);
    
    if (!isInstalled) {
      console.log(chalk.yellow('Mantis MCP server is not currently configured.'));
      return;
    }
    
    const { shouldUninstall } = await inquirer.prompt([{
      type: 'confirm',
      name: 'shouldUninstall',
      message: 'Remove Mantis MCP server from Claude Desktop configuration?',
      default: false
    }]);
    
    if (!shouldUninstall) {
      console.log(chalk.yellow('Uninstall cancelled.'));
      return;
    }
    
    const spinner = ora('Removing MCP server configuration...').start();
    
    const removed = removeMCPServer(MCP_SERVER_NAME);
    
    if (removed) {
      spinner.succeed('MCP server configuration removed');
      console.log(chalk.green.bold('\n✅ Mantis MCP server uninstalled successfully!'));
      console.log(chalk.yellow('Restart Claude Desktop to complete removal.'));
    } else {
      spinner.fail('Failed to remove MCP server configuration');
    }
    
  } catch (error) {
    console.log(chalk.red(`Error during uninstall: ${error instanceof Error ? error.message : 'Unknown error'}`));
    process.exit(1);
  }
}

async function repair(): Promise<void> {
  console.log(chalk.blue.bold('\n🔧 Mantis MCP Server Repair\n'));
  
  try {
    const spinner = ora('Checking current installation...').start();
    
    const isInstalled = isMCPServerConfigured(MCP_SERVER_NAME);
    const serverValid = await validateMCPServer();
    
    spinner.succeed('Installation checked');
    
    if (isInstalled && serverValid) {
      console.log(chalk.green('✅ Installation appears to be working correctly.'));
      console.log(chalk.yellow('If you\'re still having issues, try restarting Claude Desktop.'));
      return;
    }
    
    console.log(chalk.yellow('Issues detected. Attempting repair...'));
    
    // Remove and reinstall
    if (isInstalled) {
      console.log(chalk.gray('Removing existing configuration...'));
      removeMCPServer(MCP_SERVER_NAME);
    }
    
    if (!serverValid) {
      console.log(chalk.red('Server validation failed. Please ensure:'));
      console.log(chalk.yellow('- npm install has been run'));
      console.log(chalk.yellow('- npm run build has been run'));
      console.log(chalk.yellow('- Node.js version is v18 or higher'));
      return;
    }
    
    console.log(chalk.gray('Reinstalling MCP server configuration...'));
    const serverConfig = createMCPServerConfig();
    addMCPServer(MCP_SERVER_NAME, serverConfig);
    
    console.log(chalk.green.bold('\n✅ Repair completed!'));
    console.log(chalk.yellow('Restart Claude Desktop to use the repaired configuration.'));
    
  } catch (error) {
    console.log(chalk.red(`Error during repair: ${error instanceof Error ? error.message : 'Unknown error'}`));
    process.exit(1);
  }
}

// CLI Program Setup
program
  .name('mantis-mcp')
  .description('Install and manage Mantis MCP Server for Claude Desktop')
  .version('1.0.0');

program
  .option('--status', 'Check installation status')
  .option('--uninstall', 'Remove from Claude Desktop configuration')
  .option('--repair', 'Repair broken installation')
  .action(async (options) => {
    if (options.status) {
      await checkStatus();
    } else if (options.uninstall) {
      await uninstall();
    } else if (options.repair) {
      await repair();
    } else {
      await install();
    }
  });

program.parse();