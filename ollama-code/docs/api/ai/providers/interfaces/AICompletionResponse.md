[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / AICompletionResponse

# Interface: AICompletionResponse

Defined in: [ai/providers/base-provider.ts:30](https://github.com/erichchampion/ollama-code/blob/f6c86092ceb05c9cf6b0f52863f31d0a214195fb/ollama-code/src/ai/providers/base-provider.ts#L30)

## Properties

### content

> **content**: `string`

Defined in: [ai/providers/base-provider.ts:31](https://github.com/erichchampion/ollama-code/blob/f6c86092ceb05c9cf6b0f52863f31d0a214195fb/ollama-code/src/ai/providers/base-provider.ts#L31)

***

### model

> **model**: `string`

Defined in: [ai/providers/base-provider.ts:32](https://github.com/erichchampion/ollama-code/blob/f6c86092ceb05c9cf6b0f52863f31d0a214195fb/ollama-code/src/ai/providers/base-provider.ts#L32)

***

### finishReason

> **finishReason**: `"length"` \| `"error"` \| `"stop"` \| `"content_filter"` \| `"function_call"`

Defined in: [ai/providers/base-provider.ts:33](https://github.com/erichchampion/ollama-code/blob/f6c86092ceb05c9cf6b0f52863f31d0a214195fb/ollama-code/src/ai/providers/base-provider.ts#L33)

***

### usage

> **usage**: `object`

Defined in: [ai/providers/base-provider.ts:34](https://github.com/erichchampion/ollama-code/blob/f6c86092ceb05c9cf6b0f52863f31d0a214195fb/ollama-code/src/ai/providers/base-provider.ts#L34)

#### promptTokens

> **promptTokens**: `number`

#### completionTokens

> **completionTokens**: `number`

#### totalTokens

> **totalTokens**: `number`

***

### metadata

> **metadata**: `object`

Defined in: [ai/providers/base-provider.ts:39](https://github.com/erichchampion/ollama-code/blob/f6c86092ceb05c9cf6b0f52863f31d0a214195fb/ollama-code/src/ai/providers/base-provider.ts#L39)

#### requestId

> **requestId**: `string`

#### processingTime

> **processingTime**: `number`

#### provider

> **provider**: `string`

#### cached?

> `optional` **cached**: `boolean`

#### retryCount?

> `optional` **retryCount**: `number`
