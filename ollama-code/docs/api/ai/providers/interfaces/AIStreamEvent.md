[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / AIStreamEvent

# Interface: AIStreamEvent

Defined in: [ai/providers/base-provider.ts:48](https://github.com/erichchampion/ollama-code/blob/3ba5f33b3e9ed162574fb0c1b20bfa222984db0a/ollama-code/src/ai/providers/base-provider.ts#L48)

## Properties

### content

> **content**: `string`

Defined in: [ai/providers/base-provider.ts:49](https://github.com/erichchampion/ollama-code/blob/3ba5f33b3e9ed162574fb0c1b20bfa222984db0a/ollama-code/src/ai/providers/base-provider.ts#L49)

***

### done

> **done**: `boolean`

Defined in: [ai/providers/base-provider.ts:50](https://github.com/erichchampion/ollama-code/blob/3ba5f33b3e9ed162574fb0c1b20bfa222984db0a/ollama-code/src/ai/providers/base-provider.ts#L50)

***

### delta?

> `optional` **delta**: `string`

Defined in: [ai/providers/base-provider.ts:51](https://github.com/erichchampion/ollama-code/blob/3ba5f33b3e9ed162574fb0c1b20bfa222984db0a/ollama-code/src/ai/providers/base-provider.ts#L51)

***

### usage?

> `optional` **usage**: `object`

Defined in: [ai/providers/base-provider.ts:52](https://github.com/erichchampion/ollama-code/blob/3ba5f33b3e9ed162574fb0c1b20bfa222984db0a/ollama-code/src/ai/providers/base-provider.ts#L52)

#### promptTokens

> **promptTokens**: `number`

#### completionTokens

> **completionTokens**: `number`

#### totalTokens

> **totalTokens**: `number`

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `any`\>

Defined in: [ai/providers/base-provider.ts:57](https://github.com/erichchampion/ollama-code/blob/3ba5f33b3e9ed162574fb0c1b20bfa222984db0a/ollama-code/src/ai/providers/base-provider.ts#L57)
