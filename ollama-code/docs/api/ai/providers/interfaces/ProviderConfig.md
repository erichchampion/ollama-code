[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / ProviderConfig

# Interface: ProviderConfig

Defined in: [ai/providers/base-provider.ts:106](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/ai/providers/base-provider.ts#L106)

## Properties

### name

> **name**: `string`

Defined in: [ai/providers/base-provider.ts:107](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/ai/providers/base-provider.ts#L107)

***

### apiKey?

> `optional` **apiKey**: `string`

Defined in: [ai/providers/base-provider.ts:108](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/ai/providers/base-provider.ts#L108)

***

### baseUrl?

> `optional` **baseUrl**: `string`

Defined in: [ai/providers/base-provider.ts:109](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/ai/providers/base-provider.ts#L109)

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [ai/providers/base-provider.ts:110](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/ai/providers/base-provider.ts#L110)

***

### retryOptions?

> `optional` **retryOptions**: `object`

Defined in: [ai/providers/base-provider.ts:111](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/ai/providers/base-provider.ts#L111)

#### maxRetries

> **maxRetries**: `number`

#### initialDelayMs

> **initialDelayMs**: `number`

#### maxDelayMs

> **maxDelayMs**: `number`

***

### rateLimiting?

> `optional` **rateLimiting**: `object`

Defined in: [ai/providers/base-provider.ts:116](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/ai/providers/base-provider.ts#L116)

#### enabled

> **enabled**: `boolean`

#### requestsPerMinute

> **requestsPerMinute**: `number`

#### tokensPerMinute

> **tokensPerMinute**: `number`

***

### caching?

> `optional` **caching**: `object`

Defined in: [ai/providers/base-provider.ts:121](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/ai/providers/base-provider.ts#L121)

#### enabled

> **enabled**: `boolean`

#### ttlMs

> **ttlMs**: `number`
