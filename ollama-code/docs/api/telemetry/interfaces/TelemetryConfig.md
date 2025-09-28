[**Ollama Code API Documentation v0.1.0**](../../README.md)

***

[Ollama Code API Documentation](../../modules.md) / [telemetry](../README.md) / TelemetryConfig

# Interface: TelemetryConfig

Defined in: [telemetry/index.ts:80](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/telemetry/index.ts#L80)

Telemetry configuration

## Properties

### enabled

> **enabled**: `boolean`

Defined in: [telemetry/index.ts:84](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/telemetry/index.ts#L84)

Whether telemetry is enabled

***

### clientId

> **clientId**: `string`

Defined in: [telemetry/index.ts:89](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/telemetry/index.ts#L89)

Client ID (anonymous)

***

### endpoint?

> `optional` **endpoint**: `string`

Defined in: [telemetry/index.ts:94](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/telemetry/index.ts#L94)

Endpoint for sending telemetry data

***

### additionalData?

> `optional` **additionalData**: `Record`\<`string`, `any`\>

Defined in: [telemetry/index.ts:99](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/telemetry/index.ts#L99)

Additional data to include with all events
