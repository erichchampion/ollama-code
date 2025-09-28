[**Ollama Code API Documentation v0.1.0**](../../../../README.md)

***

[Ollama Code API Documentation](../../../../modules.md) / [ai/providers/local-fine-tuning](../README.md) / FineTuningDataset

# Interface: FineTuningDataset

Defined in: [ai/providers/local-fine-tuning.ts:18](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/ai/providers/local-fine-tuning.ts#L18)

## Properties

### id

> **id**: `string`

Defined in: [ai/providers/local-fine-tuning.ts:19](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/ai/providers/local-fine-tuning.ts#L19)

***

### name

> **name**: `string`

Defined in: [ai/providers/local-fine-tuning.ts:20](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/ai/providers/local-fine-tuning.ts#L20)

***

### description

> **description**: `string`

Defined in: [ai/providers/local-fine-tuning.ts:21](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/ai/providers/local-fine-tuning.ts#L21)

***

### type

> **type**: `"documentation"` \| `"general"` \| `"code_analysis"` \| `"code_completion"`

Defined in: [ai/providers/local-fine-tuning.ts:22](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/ai/providers/local-fine-tuning.ts#L22)

***

### format

> **format**: `"csv"` \| `"jsonl"` \| `"parquet"`

Defined in: [ai/providers/local-fine-tuning.ts:23](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/ai/providers/local-fine-tuning.ts#L23)

***

### filePath

> **filePath**: `string`

Defined in: [ai/providers/local-fine-tuning.ts:24](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/ai/providers/local-fine-tuning.ts#L24)

***

### size

> **size**: `number`

Defined in: [ai/providers/local-fine-tuning.ts:25](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/ai/providers/local-fine-tuning.ts#L25)

***

### samples

> **samples**: `number`

Defined in: [ai/providers/local-fine-tuning.ts:26](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/ai/providers/local-fine-tuning.ts#L26)

***

### createdAt

> **createdAt**: `Date`

Defined in: [ai/providers/local-fine-tuning.ts:27](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/ai/providers/local-fine-tuning.ts#L27)

***

### lastModified

> **lastModified**: `Date`

Defined in: [ai/providers/local-fine-tuning.ts:28](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/ai/providers/local-fine-tuning.ts#L28)

***

### metadata

> **metadata**: `object`

Defined in: [ai/providers/local-fine-tuning.ts:29](https://github.com/erichchampion/ollama-code/blob/ca3d01d6583b7059317fc460806efc2977c21eee/ollama-code/src/ai/providers/local-fine-tuning.ts#L29)

#### language?

> `optional` **language**: `string`

#### framework?

> `optional` **framework**: `string`

#### domain?

> `optional` **domain**: `string`

#### quality?

> `optional` **quality**: `"low"` \| `"medium"` \| `"high"`

#### validated

> **validated**: `boolean`
