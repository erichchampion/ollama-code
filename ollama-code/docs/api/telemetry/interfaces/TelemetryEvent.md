[**Ollama Code API Documentation v0.1.0**](../../README.md)

***

[Ollama Code API Documentation](../../modules.md) / [telemetry](../README.md) / TelemetryEvent

# Interface: TelemetryEvent

Defined in: [telemetry/index.ts:30](https://github.com/erichchampion/ollama-code/blob/d2cd048413007cebba90b2ada3aac13c65c13827/ollama-code/src/telemetry/index.ts#L30)

Telemetry event

## Properties

### type

> **type**: [`TelemetryEventType`](../enumerations/TelemetryEventType.md)

Defined in: [telemetry/index.ts:34](https://github.com/erichchampion/ollama-code/blob/d2cd048413007cebba90b2ada3aac13c65c13827/ollama-code/src/telemetry/index.ts#L34)

Event type

***

### timestamp

> **timestamp**: `string`

Defined in: [telemetry/index.ts:39](https://github.com/erichchampion/ollama-code/blob/d2cd048413007cebba90b2ada3aac13c65c13827/ollama-code/src/telemetry/index.ts#L39)

Event timestamp

***

### properties

> **properties**: `Record`\<`string`, `any`\>

Defined in: [telemetry/index.ts:44](https://github.com/erichchampion/ollama-code/blob/d2cd048413007cebba90b2ada3aac13c65c13827/ollama-code/src/telemetry/index.ts#L44)

Event properties

***

### client

> **client**: `object`

Defined in: [telemetry/index.ts:49](https://github.com/erichchampion/ollama-code/blob/d2cd048413007cebba90b2ada3aac13c65c13827/ollama-code/src/telemetry/index.ts#L49)

Client information

#### version

> **version**: `string`

CLI version

#### id

> **id**: `string`

Client ID (anonymous)

#### nodeVersion

> **nodeVersion**: `string`

Node.js version

#### os

> **os**: `string`

Operating system

#### osVersion

> **osVersion**: `string`

Operating system version
