[**Ollama Code API Documentation v0.1.0**](../../../../README.md)

***

[Ollama Code API Documentation](../../../../modules.md) / [ai/providers/local-fine-tuning](../README.md) / ModelDeployment

# Interface: ModelDeployment

Defined in: [ai/providers/local-fine-tuning.ts:102](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/local-fine-tuning.ts#L102)

## Properties

### id

> **id**: `string`

Defined in: [ai/providers/local-fine-tuning.ts:103](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/local-fine-tuning.ts#L103)

***

### name

> **name**: `string`

Defined in: [ai/providers/local-fine-tuning.ts:104](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/local-fine-tuning.ts#L104)

***

### modelPath

> **modelPath**: `string`

Defined in: [ai/providers/local-fine-tuning.ts:105](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/local-fine-tuning.ts#L105)

***

### status

> **status**: `"error"` \| `"deployed"` \| `"deploying"` \| `"stopped"`

Defined in: [ai/providers/local-fine-tuning.ts:106](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/local-fine-tuning.ts#L106)

***

### endpoint?

> `optional` **endpoint**: `string`

Defined in: [ai/providers/local-fine-tuning.ts:107](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/local-fine-tuning.ts#L107)

***

### port?

> `optional` **port**: `number`

Defined in: [ai/providers/local-fine-tuning.ts:108](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/local-fine-tuning.ts#L108)

***

### resources

> **resources**: `object`

Defined in: [ai/providers/local-fine-tuning.ts:109](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/local-fine-tuning.ts#L109)

#### memoryUsage

> **memoryUsage**: `number`

#### cpuUsage

> **cpuUsage**: `number`

#### gpuUsage?

> `optional` **gpuUsage**: `number`

***

### performance

> **performance**: `object`

Defined in: [ai/providers/local-fine-tuning.ts:114](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/local-fine-tuning.ts#L114)

#### requestsPerSecond

> **requestsPerSecond**: `number`

#### averageLatency

> **averageLatency**: `number`

#### throughput

> **throughput**: `number`

***

### createdAt

> **createdAt**: `Date`

Defined in: [ai/providers/local-fine-tuning.ts:119](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/local-fine-tuning.ts#L119)

***

### lastAccessed?

> `optional` **lastAccessed**: `Date`

Defined in: [ai/providers/local-fine-tuning.ts:120](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/local-fine-tuning.ts#L120)
