[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / RoutingContext

# Interface: RoutingContext

Defined in: [ai/providers/intelligent-router.ts:41](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/intelligent-router.ts#L41)

## Properties

### requiredCapabilities

> **requiredCapabilities**: [`AICapability`](../enumerations/AICapability.md)[]

Defined in: [ai/providers/intelligent-router.ts:42](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/intelligent-router.ts#L42)

***

### preferredResponseTime

> **preferredResponseTime**: `number`

Defined in: [ai/providers/intelligent-router.ts:43](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/intelligent-router.ts#L43)

***

### maxCostPerToken

> **maxCostPerToken**: `number`

Defined in: [ai/providers/intelligent-router.ts:44](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/intelligent-router.ts#L44)

***

### prioritizeQuality

> **prioritizeQuality**: `boolean`

Defined in: [ai/providers/intelligent-router.ts:45](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/intelligent-router.ts#L45)

***

### sessionId?

> `optional` **sessionId**: `string`

Defined in: [ai/providers/intelligent-router.ts:46](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/intelligent-router.ts#L46)

***

### userId?

> `optional` **userId**: `string`

Defined in: [ai/providers/intelligent-router.ts:47](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/intelligent-router.ts#L47)

***

### requestType

> **requestType**: `"analysis"` \| `"completion"` \| `"streaming"` \| `"generation"`

Defined in: [ai/providers/intelligent-router.ts:48](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/intelligent-router.ts#L48)
