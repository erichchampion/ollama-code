[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / ProviderConfig

# Interface: ProviderConfig

Defined in: [ai/providers/base-provider.ts:107](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L107)

## Properties

### name

> **name**: `string`

Defined in: [ai/providers/base-provider.ts:108](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L108)

***

### apiKey?

> `optional` **apiKey**: `string`

Defined in: [ai/providers/base-provider.ts:109](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L109)

***

### baseUrl?

> `optional` **baseUrl**: `string`

Defined in: [ai/providers/base-provider.ts:110](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L110)

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [ai/providers/base-provider.ts:111](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L111)

***

### retryOptions?

> `optional` **retryOptions**: `object`

Defined in: [ai/providers/base-provider.ts:112](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L112)

#### maxRetries

> **maxRetries**: `number`

#### initialDelayMs

> **initialDelayMs**: `number`

#### maxDelayMs

> **maxDelayMs**: `number`

***

### rateLimiting?

> `optional` **rateLimiting**: `object`

Defined in: [ai/providers/base-provider.ts:117](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L117)

#### enabled

> **enabled**: `boolean`

#### requestsPerMinute

> **requestsPerMinute**: `number`

#### tokensPerMinute

> **tokensPerMinute**: `number`

***

### caching?

> `optional` **caching**: `object`

Defined in: [ai/providers/base-provider.ts:122](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L122)

#### enabled

> **enabled**: `boolean`

#### ttlMs

> **ttlMs**: `number`
