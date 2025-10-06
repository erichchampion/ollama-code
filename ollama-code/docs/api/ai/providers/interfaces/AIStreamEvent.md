[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / AIStreamEvent

# Interface: AIStreamEvent

Defined in: [ai/providers/base-provider.ts:49](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L49)

## Properties

### content

> **content**: `string`

Defined in: [ai/providers/base-provider.ts:50](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L50)

***

### done

> **done**: `boolean`

Defined in: [ai/providers/base-provider.ts:51](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L51)

***

### delta?

> `optional` **delta**: `string`

Defined in: [ai/providers/base-provider.ts:52](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L52)

***

### usage?

> `optional` **usage**: `object`

Defined in: [ai/providers/base-provider.ts:53](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L53)

#### promptTokens

> **promptTokens**: `number`

#### completionTokens

> **completionTokens**: `number`

#### totalTokens

> **totalTokens**: `number`

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `any`\>

Defined in: [ai/providers/base-provider.ts:58](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/ai/providers/base-provider.ts#L58)
