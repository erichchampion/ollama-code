/**
 * WebSocket Constants
 *
 * Standard WebSocket close codes and IDE-specific constants
 */
/**
 * Standard WebSocket Close Codes
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
 */
export declare const WS_CLOSE_CODES: {
    /** Normal closure */
    readonly NORMAL: 1000;
    /** Going away (e.g., server going down or browser navigating away) */
    readonly GOING_AWAY: 1001;
    /** Protocol error */
    readonly PROTOCOL_ERROR: 1002;
    /** Unsupported data type */
    readonly UNSUPPORTED_DATA: 1003;
    /** No status received */
    readonly NO_STATUS_RECEIVED: 1005;
    /** Abnormal closure */
    readonly ABNORMAL_CLOSURE: 1006;
    /** Invalid frame payload data */
    readonly INVALID_FRAME_PAYLOAD: 1007;
    /** Policy violation */
    readonly POLICY_VIOLATION: 1008;
    /** Message too big */
    readonly MESSAGE_TOO_BIG: 1009;
    /** Mandatory extension missing */
    readonly MISSING_EXTENSION: 1010;
    /** Internal server error */
    readonly INTERNAL_ERROR: 1011;
    /** Service restart */
    readonly SERVICE_RESTART: 1012;
    /** Try again later */
    readonly TRY_AGAIN_LATER: 1013;
    /** Bad gateway */
    readonly BAD_GATEWAY: 1014;
    /** TLS handshake failure */
    readonly TLS_HANDSHAKE: 1015;
};
/**
 * IDE-specific close reasons
 */
export declare const IDE_CLOSE_REASONS: {
    readonly SERVER_SHUTDOWN: "Server shutdown";
    readonly CLIENT_TIMEOUT: "Client timeout";
    readonly STARTUP_FAILED: "Server startup failed";
    readonly EXTENSION_DISCONNECTING: "Extension disconnecting";
    readonly AUTHENTICATION_FAILED: "Authentication failed";
    readonly PROTOCOL_VERSION_MISMATCH: "Protocol version mismatch";
};
/**
 * Default IDE Integration Server configuration
 */
export declare const IDE_SERVER_DEFAULTS: {
    /** Default port for IDE integration server */
    readonly PORT: 3002;
    /** Default MCP server port offset */
    readonly MCP_PORT_OFFSET: 1;
    /** Maximum concurrent client connections */
    readonly MAX_CLIENTS: 50;
    /** Maximum message size (1MB) */
    readonly MAX_MESSAGE_SIZE: number;
};
/**
 * Get close code description
 */
export declare function getCloseCodeDescription(code: number): string;
