[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / RoutingContext

# Interface: RoutingContext

Defined in: [ai/providers/intelligent-router.ts:39](https://github.com/erichchampion/ollama-code/blob/3ba5f33b3e9ed162574fb0c1b20bfa222984db0a/ollama-code/src/ai/providers/intelligent-router.ts#L39)

## Properties

### requiredCapabilities

> **requiredCapabilities**: [`AICapability`](../enumerations/AICapability.md)[]

Defined in: [ai/providers/intelligent-router.ts:40](https://github.com/erichchampion/ollama-code/blob/3ba5f33b3e9ed162574fb0c1b20bfa222984db0a/ollama-code/src/ai/providers/intelligent-router.ts#L40)

***

### preferredResponseTime

> **preferredResponseTime**: `number`

Defined in: [ai/providers/intelligent-router.ts:41](https://github.com/erichchampion/ollama-code/blob/3ba5f33b3e9ed162574fb0c1b20bfa222984db0a/ollama-code/src/ai/providers/intelligent-router.ts#L41)

***

### maxCostPerToken

> **maxCostPerToken**: `number`

Defined in: [ai/providers/intelligent-router.ts:42](https://github.com/erichchampion/ollama-code/blob/3ba5f33b3e9ed162574fb0c1b20bfa222984db0a/ollama-code/src/ai/providers/intelligent-router.ts#L42)

***

### prioritizeQuality

> **prioritizeQuality**: `boolean`

Defined in: [ai/providers/intelligent-router.ts:43](https://github.com/erichchampion/ollama-code/blob/3ba5f33b3e9ed162574fb0c1b20bfa222984db0a/ollama-code/src/ai/providers/intelligent-router.ts#L43)

***

### sessionId?

> `optional` **sessionId**: `string`

Defined in: [ai/providers/intelligent-router.ts:44](https://github.com/erichchampion/ollama-code/blob/3ba5f33b3e9ed162574fb0c1b20bfa222984db0a/ollama-code/src/ai/providers/intelligent-router.ts#L44)

***

### userId?

> `optional` **userId**: `string`

Defined in: [ai/providers/intelligent-router.ts:45](https://github.com/erichchampion/ollama-code/blob/3ba5f33b3e9ed162574fb0c1b20bfa222984db0a/ollama-code/src/ai/providers/intelligent-router.ts#L45)

***

### requestType

> **requestType**: `"analysis"` \| `"completion"` \| `"streaming"` \| `"generation"`

Defined in: [ai/providers/intelligent-router.ts:46](https://github.com/erichchampion/ollama-code/blob/3ba5f33b3e9ed162574fb0c1b20bfa222984db0a/ollama-code/src/ai/providers/intelligent-router.ts#L46)
