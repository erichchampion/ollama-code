/**
 * Execution Tool
 *
 * Provides secure command execution capabilities with timeout handling,
 * output capture, and environment management.
 */
import { spawn } from 'child_process';
import { normalizeError } from '../utils/error-utils.js';
import { BaseTool } from './types.js';
import { logger } from '../utils/logger.js';
import { TIMEOUT_CONSTANTS } from '../config/constants.js';
export class ExecutionTool extends BaseTool {
    metadata = {
        name: 'execution',
        description: 'Secure command execution with timeout and output capture',
        category: 'core',
        version: '1.0.0',
        parameters: [
            {
                name: 'command',
                type: 'string',
                description: 'The command to execute',
                required: true
            },
            {
                name: 'args',
                type: 'array',
                description: 'Command arguments',
                required: false,
                default: []
            },
            {
                name: 'cwd',
                type: 'string',
                description: 'Working directory for command execution',
                required: false
            },
            {
                name: 'timeout',
                type: 'number',
                description: 'Execution timeout in milliseconds',
                required: false,
                default: 30000
            },
            {
                name: 'env',
                type: 'object',
                description: 'Additional environment variables',
                required: false,
                default: {}
            },
            {
                name: 'shell',
                type: 'boolean',
                description: 'Whether to run command in shell',
                required: false,
                default: false
            },
            {
                name: 'captureOutput',
                type: 'boolean',
                description: 'Whether to capture stdout/stderr',
                required: false,
                default: true
            },
            {
                name: 'allowedCommands',
                type: 'array',
                description: 'Whitelist of allowed commands (security)',
                required: false
            }
        ],
        examples: [
            {
                description: 'Run npm install',
                parameters: {
                    command: 'npm',
                    args: ['install'],
                    timeout: TIMEOUT_CONSTANTS.GIT_OPERATION
                }
            },
            {
                description: 'Execute TypeScript compiler',
                parameters: {
                    command: 'tsc',
                    args: ['--noEmit'],
                    cwd: 'src'
                }
            },
            {
                description: 'Run tests with custom environment',
                parameters: {
                    command: 'npm',
                    args: ['test'],
                    env: { NODE_ENV: 'test' },
                    timeout: TIMEOUT_CONSTANTS.LONG
                }
            }
        ]
    };
    async execute(parameters, context) {
        const startTime = Date.now();
        try {
            if (!this.validateParameters(parameters)) {
                return {
                    success: false,
                    error: 'Invalid parameters provided'
                };
            }
            const { command, args = [], cwd, timeout = 30000, env = {}, shell = false, captureOutput = true, allowedCommands } = parameters;
            // Security check: validate allowed commands
            if (allowedCommands && !allowedCommands.includes(command)) {
                return {
                    success: false,
                    error: `Command '${command}' is not in the allowed commands list`
                };
            }
            // Additional security checks
            if (!this.isCommandSafe(command)) {
                return {
                    success: false,
                    error: `Command '${command}' is not allowed for security reasons`
                };
            }
            const workingDir = cwd
                ? this.resolvePath(cwd, context.workingDirectory)
                : context.workingDirectory;
            // Security check: ensure working directory is within project boundaries
            if (!this.isPathSafe(workingDir, context.projectRoot)) {
                return {
                    success: false,
                    error: 'Working directory is outside project boundaries'
                };
            }
            const result = await this.executeCommand({
                command,
                args,
                cwd: workingDir,
                timeout,
                env: { ...context.environment, ...env },
                shell,
                captureOutput,
                abortSignal: context.abortSignal
            });
            return {
                success: result.exitCode === 0,
                data: result,
                error: result.exitCode !== 0 ? `Command failed with exit code ${result.exitCode}` : undefined,
                metadata: {
                    executionTime: result.executionTime,
                    resourcesUsed: {
                        command: result.command,
                        exitCode: result.exitCode,
                        timedOut: result.timedOut
                    }
                }
            };
        }
        catch (error) {
            logger.error(`Execution tool error: ${error}`);
            return {
                success: false,
                error: normalizeError(error).message,
                metadata: {
                    executionTime: Date.now() - startTime
                }
            };
        }
    }
    async executeCommand(options) {
        const startTime = Date.now();
        let stdout = '';
        let stderr = '';
        let timedOut = false;
        return new Promise((resolve, reject) => {
            const child = spawn(options.command, options.args, {
                cwd: options.cwd,
                env: options.env,
                shell: options.shell,
                stdio: options.captureOutput ? 'pipe' : 'inherit'
            });
            // Set up timeout
            const timeoutId = setTimeout(() => {
                timedOut = true;
                child.kill('SIGTERM');
                // Force kill if process doesn't terminate
                setTimeout(() => {
                    if (!child.killed) {
                        child.kill('SIGKILL');
                    }
                }, 5000);
            }, options.timeout);
            // Handle abort signal
            if (options.abortSignal) {
                options.abortSignal.addEventListener('abort', () => {
                    clearTimeout(timeoutId);
                    child.kill('SIGTERM');
                });
            }
            // Capture output if requested
            if (options.captureOutput && child.stdout && child.stderr) {
                child.stdout.on('data', (data) => {
                    stdout += data.toString();
                });
                child.stderr.on('data', (data) => {
                    stderr += data.toString();
                });
            }
            child.on('error', (error) => {
                clearTimeout(timeoutId);
                reject(error);
            });
            child.on('close', (code) => {
                clearTimeout(timeoutId);
                const result = {
                    command: `${options.command} ${options.args.join(' ')}`.trim(),
                    exitCode: code || 0,
                    stdout,
                    stderr,
                    executionTime: Date.now() - startTime,
                    timedOut
                };
                resolve(result);
            });
        });
    }
    isCommandSafe(command) {
        // Blacklist of dangerous commands
        const dangerousCommands = [
            'rm', 'rmdir', 'del', 'format', 'fdisk',
            'sudo', 'su', 'chmod', 'chown',
            'wget', 'curl', 'nc', 'netcat',
            'eval', 'exec', 'sh', 'bash', 'cmd',
            'powershell', 'pwsh'
        ];
        const commandName = command.toLowerCase().split(/[/\\]/).pop() || command;
        return !dangerousCommands.includes(commandName);
    }
    resolvePath(targetPath, basePath) {
        if (require('path').isAbsolute(targetPath)) {
            return targetPath;
        }
        return require('path').resolve(basePath, targetPath);
    }
    isPathSafe(targetPath, projectRoot) {
        const resolved = require('path').resolve(targetPath);
        const root = require('path').resolve(projectRoot);
        return resolved.startsWith(root);
    }
}
//# sourceMappingURL=execution.js.map