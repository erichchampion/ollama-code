[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / ProviderCapabilities

# Interface: ProviderCapabilities

Defined in: [ai/providers/base-provider.ts:90](https://github.com/erichchampion/ollama-code/blob/da0d5de255d803db9921aedd29b30f1aea1c1c02/ollama-code/src/ai/providers/base-provider.ts#L90)

## Properties

### maxContextWindow

> **maxContextWindow**: `number`

Defined in: [ai/providers/base-provider.ts:91](https://github.com/erichchampion/ollama-code/blob/da0d5de255d803db9921aedd29b30f1aea1c1c02/ollama-code/src/ai/providers/base-provider.ts#L91)

***

### supportedCapabilities

> **supportedCapabilities**: [`AICapability`](../enumerations/AICapability.md)[]

Defined in: [ai/providers/base-provider.ts:92](https://github.com/erichchampion/ollama-code/blob/da0d5de255d803db9921aedd29b30f1aea1c1c02/ollama-code/src/ai/providers/base-provider.ts#L92)

***

### rateLimits

> **rateLimits**: `object`

Defined in: [ai/providers/base-provider.ts:93](https://github.com/erichchampion/ollama-code/blob/da0d5de255d803db9921aedd29b30f1aea1c1c02/ollama-code/src/ai/providers/base-provider.ts#L93)

#### requestsPerMinute

> **requestsPerMinute**: `number`

#### tokensPerMinute

> **tokensPerMinute**: `number`

***

### features

> **features**: `object`

Defined in: [ai/providers/base-provider.ts:97](https://github.com/erichchampion/ollama-code/blob/da0d5de255d803db9921aedd29b30f1aea1c1c02/ollama-code/src/ai/providers/base-provider.ts#L97)

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
