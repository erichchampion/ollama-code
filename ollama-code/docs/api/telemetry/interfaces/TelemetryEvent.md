[**Ollama Code API Documentation v0.1.0**](../../README.md)

***

[Ollama Code API Documentation](../../modules.md) / [telemetry](../README.md) / TelemetryEvent

# Interface: TelemetryEvent

Defined in: [telemetry/index.ts:31](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/telemetry/index.ts#L31)

Telemetry event

## Properties

### type

> **type**: [`TelemetryEventType`](../enumerations/TelemetryEventType.md)

Defined in: [telemetry/index.ts:35](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/telemetry/index.ts#L35)

Event type

***

### timestamp

> **timestamp**: `string`

Defined in: [telemetry/index.ts:40](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/telemetry/index.ts#L40)

Event timestamp

***

### properties

> **properties**: `Record`\<`string`, `any`\>

Defined in: [telemetry/index.ts:45](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/telemetry/index.ts#L45)

Event properties

***

### client

> **client**: `object`

Defined in: [telemetry/index.ts:50](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/telemetry/index.ts#L50)

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
