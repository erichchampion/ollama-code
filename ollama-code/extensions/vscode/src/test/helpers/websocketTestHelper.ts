/**
 * WebSocket Test Helpers
 * Utilities for testing WebSocket server functionality
 */

import WebSocket from 'ws';
import { WEBSOCKET_TEST_CONSTANTS } from './test-constants.js';
import { sleep } from '../../../../tests/shared/test-utils.js';

export interface WebSocketTestClient {
  ws: WebSocket;
  messages: any[];
  errors: Error[];
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(data: any): Promise<void>;
  waitForMessage(timeout?: number): Promise<any>;
  clearMessages(): void;
}

/**
 * Create a test WebSocket client
 */
export function createTestWebSocketClient(url: string): WebSocketTestClient {
  const messages: any[] = [];
  const errors: Error[] = [];
  let ws: WebSocket;

  return {
    get ws() {
      return ws;
    },
    messages,
    errors,

    async connect(): Promise<void> {
      return new Promise((resolve, reject) => {
        ws = new WebSocket(url);
        let isConnected = false;

        ws.on('open', () => {
          isConnected = true;
          resolve();
        });

        ws.on('message', (data: WebSocket.Data) => {
          try {
            const parsed = JSON.parse(data.toString());
            messages.push(parsed);
          } catch (error) {
            messages.push(data.toString());
          }
        });

        ws.on('error', (error: Error) => {
          errors.push(error);
          // Only reject if connection hasn't been established yet
          if (!isConnected) {
            reject(error);
          }
        });

        ws.on('close', () => {
          // Connection closed
        });
      });
    },

    async disconnect(): Promise<void> {
      return new Promise((resolve) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.once('close', () => {
            resolve();
          });
          ws.close();
        } else {
          resolve();
        }
      });
    },

    async send(data: any): Promise<void> {
      return new Promise((resolve, reject) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          reject(new Error('WebSocket is not connected'));
          return;
        }

        const message = typeof data === 'string' ? data : JSON.stringify(data);
        ws.send(message, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    },

    async waitForMessage(timeout: number = WEBSOCKET_TEST_CONSTANTS.MESSAGE_TIMEOUT): Promise<any> {
      const startTime = Date.now();

      while (Date.now() - startTime < timeout) {
        if (messages.length > 0) {
          return messages.shift();
        }
        await sleep(WEBSOCKET_TEST_CONSTANTS.MESSAGE_POLL_INTERVAL);
      }

      throw new Error('Timeout waiting for WebSocket message');
    },

    clearMessages(): void {
      messages.length = 0;
      errors.length = 0;
    }
  };
}

/**
 * Mock MCP server for testing
 */
export interface MockMCPServer {
  start(port: number): Promise<void>;
  stop(): Promise<void>;
  getConnectedClients(): number;
  broadcastMessage(data: any): void;
  getReceivedMessages(): any[];
}

export function createMockMCPServer(): MockMCPServer {
  let wss: WebSocket.Server | null = null;
  const clients: Set<WebSocket> = new Set();
  const receivedMessages: any[] = [];

  return {
    async start(port: number): Promise<void> {
      return new Promise((resolve, reject) => {
        try {
          wss = new WebSocket.Server({ port });

          wss.on('connection', (ws: WebSocket) => {
            clients.add(ws);

            ws.on('message', (data: WebSocket.Data) => {
              try {
                const parsed = JSON.parse(data.toString());
                receivedMessages.push(parsed);
              } catch {
                receivedMessages.push(data.toString());
              }
            });

            ws.on('close', () => {
              clients.delete(ws);
            });

            ws.on('error', (error) => {
              console.error('WebSocket client error:', error);
            });
          });

          wss.on('listening', () => {
            resolve();
          });

          wss.on('error', (error) => {
            reject(error);
          });
        } catch (error) {
          reject(error);
        }
      });
    },

    async stop(): Promise<void> {
      return new Promise((resolve) => {
        if (wss) {
          // Close all client connections
          clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.close();
            }
          });

          wss.close(() => {
            wss = null;
            clients.clear();
            resolve();
          });
        } else {
          resolve();
        }
      });
    },

    getConnectedClients(): number {
      return clients.size;
    },

    broadcastMessage(data: any): void {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    },

    getReceivedMessages(): any[] {
      return [...receivedMessages];
    }
  };
}

/**
 * Wait for WebSocket connection
 */
export async function waitForConnection(
  ws: WebSocket,
  timeout: number = WEBSOCKET_TEST_CONSTANTS.CONNECTION_TIMEOUT
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (ws.readyState === WebSocket.OPEN) {
      resolve();
      return;
    }

    const timer = setTimeout(() => {
      reject(new Error('WebSocket connection timeout'));
    }, timeout);

    ws.once('open', () => {
      clearTimeout(timer);
      resolve();
    });

    ws.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

// sleep is now imported from shared utilities

/**
 * Assert WebSocket is connected
 */
export function assertConnected(ws: WebSocket): void {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error('WebSocket is not connected');
  }
}

/**
 * Assert WebSocket is disconnected
 */
export function assertDisconnected(ws: WebSocket): void {
  if (ws && ws.readyState === WebSocket.OPEN) {
    throw new Error('WebSocket is still connected');
  }
}

/**
 * Send and wait for response
 */
export async function sendAndWaitForResponse(
  client: WebSocketTestClient,
  request: any,
  timeout: number = WEBSOCKET_TEST_CONSTANTS.MESSAGE_TIMEOUT
): Promise<any> {
  client.clearMessages();
  await client.send(request);
  return await client.waitForMessage(timeout);
}

/**
 * Test connection heartbeat
 */
export async function testHeartbeat(
  client: WebSocketTestClient,
  interval: number = WEBSOCKET_TEST_CONSTANTS.HEARTBEAT_INTERVAL,
  count: number = WEBSOCKET_TEST_CONSTANTS.HEARTBEAT_COUNT
): Promise<boolean> {
  for (let i = 0; i < count; i++) {
    await client.send({ type: 'ping' });
    await sleep(interval);
  }

  return client.errors.length === 0;
}
