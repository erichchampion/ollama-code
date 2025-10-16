[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / AICompletionResponse

# Interface: AICompletionResponse

Defined in: [ai/providers/base-provider.ts:31](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L31)

## Properties

### content

> **content**: `string`

Defined in: [ai/providers/base-provider.ts:32](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L32)

***

### model

> **model**: `string`

Defined in: [ai/providers/base-provider.ts:33](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L33)

***

### finishReason

> **finishReason**: `"length"` \| `"error"` \| `"stop"` \| `"content_filter"` \| `"function_call"`

Defined in: [ai/providers/base-provider.ts:34](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L34)

***

### usage

> **usage**: `object`

Defined in: [ai/providers/base-provider.ts:35](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L35)

#### promptTokens

> **promptTokens**: `number`

#### completionTokens

> **completionTokens**: `number`

#### totalTokens

> **totalTokens**: `number`

***

### metadata

> **metadata**: `object`

Defined in: [ai/providers/base-provider.ts:40](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L40)

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
