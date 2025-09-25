"use strict";
/**
 * Ollama Code WebSocket Client
 *
 * Handles communication with the Ollama Code CLI backend server
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaCodeClient = void 0;
const ws_1 = __importDefault(require("ws"));
const vscode = __importStar(require("vscode"));
const events_1 = require("events");
class OllamaCodeClient extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.context = {};
        this.pendingRequests = new Map();
        this.config = config;
        this.setupWorkspaceContext();
    }
    /**
     * Connect to the Ollama Code CLI backend
     */
    async connect() {
        if (this.isConnected) {
            return;
        }
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, this.config.connectionTimeout);
            try {
                this.ws = new ws_1.default(`ws://localhost:${this.config.port}`);
                this.ws?.on('open', () => {
                    clearTimeout(timeout);
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.emit('connected');
                    resolve();
                });
                this.ws?.on('message', (data) => {
                    this.handleMessage(data);
                });
                this.ws?.on('close', (code, reason) => {
                    this.handleDisconnection(code, reason);
                });
                this.ws?.on('error', (error) => {
                    clearTimeout(timeout);
                    this.emit('error', error);
                    if (!this.isConnected) {
                        reject(error);
                    }
                });
            }
            catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }
    /**
     * Disconnect from the backend
     */
    async disconnect() {
        if (this.ws && this.isConnected) {
            this.ws.close(1000, 'Extension disconnecting'); // WS_CLOSE_CODES.NORMAL
        }
        this.isConnected = false;
        this.emit('disconnected');
    }
    /**
     * Send AI request to backend
     */
    async sendAIRequest(request) {
        if (!this.isConnected) {
            throw new Error('Not connected to Ollama Code backend');
        }
        const requestId = this.generateRequestId();
        const ideRequest = {
            id: requestId,
            type: 'ai_request',
            payload: {
                ...request,
                context: { ...this.context, ...request.context }
            },
            timestamp: Date.now()
        };
        return this.sendRequest(ideRequest);
    }
    /**
     * Execute CLI command through backend
     */
    async executeCommand(command, args = []) {
        if (!this.isConnected) {
            throw new Error('Not connected to Ollama Code backend');
        }
        const requestId = this.generateRequestId();
        const ideRequest = {
            id: requestId,
            type: 'command',
            payload: { command, args },
            timestamp: Date.now()
        };
        return this.sendRequest(ideRequest);
    }
    /**
     * Analyze workspace
     */
    async analyzeWorkspace(analysisType, files = []) {
        if (!this.isConnected) {
            throw new Error('Not connected to Ollama Code backend');
        }
        const requestId = this.generateRequestId();
        const ideRequest = {
            id: requestId,
            type: 'workspace_analysis',
            payload: { analysisType, files },
            timestamp: Date.now()
        };
        return this.sendRequest(ideRequest);
    }
    /**
     * Update workspace context
     */
    updateContext(context) {
        this.context = { ...this.context, ...context };
        if (this.isConnected) {
            const requestId = this.generateRequestId();
            const ideRequest = {
                id: requestId,
                type: 'context_update',
                payload: this.context,
                timestamp: Date.now()
            };
            this.sendRequestNoResponse(ideRequest);
        }
    }
    /**
     * Update client configuration
     */
    async updateConfig(config) {
        const wasConnected = this.isConnected;
        // Update configuration
        this.config = { ...this.config, ...config };
        // Reconnect if port changed and was connected
        if (config.port && wasConnected) {
            await this.disconnect();
            await this.connect();
        }
    }
    /**
     * Get connection status
     */
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            config: { ...this.config }
        };
    }
    /**
     * Handle incoming message from backend
     */
    handleMessage(data) {
        try {
            const response = JSON.parse(data.toString());
            const pending = this.pendingRequests.get(response.id);
            if (!pending) {
                // Handle unsolicited messages (notifications, etc.)
                this.emit('notification', response);
                return;
            }
            switch (response.type) {
                case 'success':
                    clearTimeout(pending.timeout);
                    this.pendingRequests.delete(response.id);
                    pending.resolve(response.payload);
                    break;
                case 'error':
                    clearTimeout(pending.timeout);
                    this.pendingRequests.delete(response.id);
                    pending.reject(new Error(response.payload.error || 'Unknown error'));
                    break;
                case 'progress':
                    this.emit('progress', response.id, response.payload);
                    break;
                case 'stream':
                    this.emit('stream', response.id, response.payload);
                    break;
            }
        }
        catch (error) {
            this.emit('error', new Error('Failed to parse response from backend'));
        }
    }
    /**
     * Handle WebSocket disconnection
     */
    handleDisconnection(code, reason) {
        this.isConnected = false;
        this.emit('disconnected', code, reason);
        // Reject all pending requests
        for (const [id, pending] of this.pendingRequests) {
            clearTimeout(pending.timeout);
            pending.reject(new Error('Connection lost'));
        }
        this.pendingRequests.clear();
        // Attempt reconnection if appropriate
        if (code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
                this.attemptReconnection();
            }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
        }
    }
    /**
     * Attempt to reconnect to backend
     */
    async attemptReconnection() {
        if (this.isConnected)
            return;
        this.reconnectAttempts++;
        this.emit('reconnecting', this.reconnectAttempts);
        try {
            await this.connect();
            vscode.window.showInformationMessage('Reconnected to Ollama Code backend');
        }
        catch (error) {
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                vscode.window.showErrorMessage('Failed to reconnect to Ollama Code backend. Please restart the extension or check the server.');
                this.emit('reconnectionFailed');
            }
        }
    }
    /**
     * Send request and wait for response
     */
    sendRequest(request) {
        return new Promise((resolve, reject) => {
            if (!this.ws || !this.isConnected) {
                reject(new Error('Not connected'));
                return;
            }
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(request.id);
                reject(new Error('Request timeout'));
            }, this.config.connectionTimeout);
            this.pendingRequests.set(request.id, {
                resolve,
                reject,
                timeout
            });
            try {
                this.ws.send(JSON.stringify(request));
            }
            catch (error) {
                clearTimeout(timeout);
                this.pendingRequests.delete(request.id);
                reject(error);
            }
        });
    }
    /**
     * Send request without waiting for response
     */
    sendRequestNoResponse(request) {
        if (this.ws && this.isConnected) {
            try {
                this.ws.send(JSON.stringify(request));
            }
            catch (error) {
                this.emit('error', error);
            }
        }
    }
    /**
     * Set up initial workspace context
     */
    setupWorkspaceContext() {
        // Get workspace information
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            this.context.rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }
        // Get active editor information
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            this.context.activeFile = activeEditor.document.uri.fsPath;
            this.context.language = activeEditor.document.languageId;
            this.context.cursorPosition = {
                line: activeEditor.selection.active.line,
                character: activeEditor.selection.active.character
            };
            if (!activeEditor.selection.isEmpty) {
                this.context.selection = {
                    start: {
                        line: activeEditor.selection.start.line,
                        character: activeEditor.selection.start.character
                    },
                    end: {
                        line: activeEditor.selection.end.line,
                        character: activeEditor.selection.end.character
                    }
                };
            }
        }
        // Get open files
        this.context.openFiles = vscode.workspace.textDocuments.map(doc => doc.uri.fsPath);
    }
    /**
     * Generate unique request ID
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.OllamaCodeClient = OllamaCodeClient;
//# sourceMappingURL=ollamaCodeClient.js.map