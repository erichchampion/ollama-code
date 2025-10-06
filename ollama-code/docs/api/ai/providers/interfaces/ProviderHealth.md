[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / ProviderHealth

# Interface: ProviderHealth

Defined in: [ai/providers/base-provider.ts:128](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L128)

## Properties

### status

> **status**: `"healthy"` \| `"degraded"` \| `"unhealthy"`

Defined in: [ai/providers/base-provider.ts:129](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L129)

***

### lastCheck

> **lastCheck**: `Date`

Defined in: [ai/providers/base-provider.ts:130](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L130)

***

### responseTime

> **responseTime**: `number`

Defined in: [ai/providers/base-provider.ts:131](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L131)

***

### errorRate

> **errorRate**: `number`

Defined in: [ai/providers/base-provider.ts:132](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L132)

***

### availability

> **availability**: `number`

Defined in: [ai/providers/base-provider.ts:133](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L133)

***

### details

> **details**: `object`

Defined in: [ai/providers/base-provider.ts:134](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L134)

#### endpoint

> **endpoint**: `string`

#### lastError?

> `optional` **lastError**: `string`

#### consecutiveFailures

> **consecutiveFailures**: `number`

#### lastSuccessfulRequest?

> `optional` **lastSuccessfulRequest**: `Date`
