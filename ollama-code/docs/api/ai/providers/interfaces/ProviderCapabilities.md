[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / ProviderCapabilities

# Interface: ProviderCapabilities

Defined in: [ai/providers/base-provider.ts:91](https://github.com/erichchampion/ollama-code/blob/d3714fddada0e31a207f4ac11b8476937193173b/ollama-code/src/ai/providers/base-provider.ts#L91)

## Properties

### maxContextWindow

> **maxContextWindow**: `number`

Defined in: [ai/providers/base-provider.ts:92](https://github.com/erichchampion/ollama-code/blob/d3714fddada0e31a207f4ac11b8476937193173b/ollama-code/src/ai/providers/base-provider.ts#L92)

***

### supportedCapabilities

> **supportedCapabilities**: [`AICapability`](../enumerations/AICapability.md)[]

Defined in: [ai/providers/base-provider.ts:93](https://github.com/erichchampion/ollama-code/blob/d3714fddada0e31a207f4ac11b8476937193173b/ollama-code/src/ai/providers/base-provider.ts#L93)

***

### rateLimits

> **rateLimits**: `object`

Defined in: [ai/providers/base-provider.ts:94](https://github.com/erichchampion/ollama-code/blob/d3714fddada0e31a207f4ac11b8476937193173b/ollama-code/src/ai/providers/base-provider.ts#L94)

#### requestsPerMinute

> **requestsPerMinute**: `number`

#### tokensPerMinute

> **tokensPerMinute**: `number`

***

### features

> **features**: `object`

Defined in: [ai/providers/base-provider.ts:98](https://github.com/erichchampion/ollama-code/blob/d3714fddada0e31a207f4ac11b8476937193173b/ollama-code/src/ai/providers/base-provider.ts#L98)

#### streaming

> **streaming**: `boolean`

#### functionCalling

> **functionCalling**: `boolean`

#### imageInput

> **imageInput**: `boolean`

#### documentInput

> **documentInput**: `boolean`

#### customInstructions

> **customInstructions**: `boolean`
