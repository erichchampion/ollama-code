[**Ollama Code API Documentation v0.1.0**](../../../../README.md)

***

[Ollama Code API Documentation](../../../../modules.md) / [ai/providers/local-fine-tuning](../README.md) / FineTuningConfig

# Interface: FineTuningConfig

Defined in: [ai/providers/local-fine-tuning.ts:72](https://github.com/erichchampion/ollama-code/blob/98a042c8536165fb6d83661d7bd5f5a513c67591/ollama-code/src/ai/providers/local-fine-tuning.ts#L72)

## Properties

### epochs

> **epochs**: `number`

Defined in: [ai/providers/local-fine-tuning.ts:73](https://github.com/erichchampion/ollama-code/blob/98a042c8536165fb6d83661d7bd5f5a513c67591/ollama-code/src/ai/providers/local-fine-tuning.ts#L73)

***

### learningRate

> **learningRate**: `number`

Defined in: [ai/providers/local-fine-tuning.ts:74](https://github.com/erichchampion/ollama-code/blob/98a042c8536165fb6d83661d7bd5f5a513c67591/ollama-code/src/ai/providers/local-fine-tuning.ts#L74)

***

### batchSize

> **batchSize**: `number`

Defined in: [ai/providers/local-fine-tuning.ts:75](https://github.com/erichchampion/ollama-code/blob/98a042c8536165fb6d83661d7bd5f5a513c67591/ollama-code/src/ai/providers/local-fine-tuning.ts#L75)

***

### validationSplit

> **validationSplit**: `number`

Defined in: [ai/providers/local-fine-tuning.ts:76](https://github.com/erichchampion/ollama-code/blob/98a042c8536165fb6d83661d7bd5f5a513c67591/ollama-code/src/ai/providers/local-fine-tuning.ts#L76)

***

### maxSequenceLength

> **maxSequenceLength**: `number`

Defined in: [ai/providers/local-fine-tuning.ts:77](https://github.com/erichchampion/ollama-code/blob/98a042c8536165fb6d83661d7bd5f5a513c67591/ollama-code/src/ai/providers/local-fine-tuning.ts#L77)

***

### temperature

> **temperature**: `number`

Defined in: [ai/providers/local-fine-tuning.ts:78](https://github.com/erichchampion/ollama-code/blob/98a042c8536165fb6d83661d7bd5f5a513c67591/ollama-code/src/ai/providers/local-fine-tuning.ts#L78)

***

### dropout?

> `optional` **dropout**: `number`

Defined in: [ai/providers/local-fine-tuning.ts:79](https://github.com/erichchampion/ollama-code/blob/98a042c8536165fb6d83661d7bd5f5a513c67591/ollama-code/src/ai/providers/local-fine-tuning.ts#L79)

***

### gradientClipping?

> `optional` **gradientClipping**: `number`

Defined in: [ai/providers/local-fine-tuning.ts:80](https://github.com/erichchampion/ollama-code/blob/98a042c8536165fb6d83661d7bd5f5a513c67591/ollama-code/src/ai/providers/local-fine-tuning.ts#L80)

***

### weightDecay?

> `optional` **weightDecay**: `number`

Defined in: [ai/providers/local-fine-tuning.ts:81](https://github.com/erichchampion/ollama-code/blob/98a042c8536165fb6d83661d7bd5f5a513c67591/ollama-code/src/ai/providers/local-fine-tuning.ts#L81)

***

### warmupSteps?

> `optional` **warmupSteps**: `number`

Defined in: [ai/providers/local-fine-tuning.ts:82](https://github.com/erichchampion/ollama-code/blob/98a042c8536165fb6d83661d7bd5f5a513c67591/ollama-code/src/ai/providers/local-fine-tuning.ts#L82)

***

### saveSteps?

> `optional` **saveSteps**: `number`

Defined in: [ai/providers/local-fine-tuning.ts:83](https://github.com/erichchampion/ollama-code/blob/98a042c8536165fb6d83661d7bd5f5a513c67591/ollama-code/src/ai/providers/local-fine-tuning.ts#L83)

***

### evaluationSteps?

> `optional` **evaluationSteps**: `number`

Defined in: [ai/providers/local-fine-tuning.ts:84](https://github.com/erichchampion/ollama-code/blob/98a042c8536165fb6d83661d7bd5f5a513c67591/ollama-code/src/ai/providers/local-fine-tuning.ts#L84)

***

### earlyStopping?

> `optional` **earlyStopping**: `object`

Defined in: [ai/providers/local-fine-tuning.ts:85](https://github.com/erichchampion/ollama-code/blob/98a042c8536165fb6d83661d7bd5f5a513c67591/ollama-code/src/ai/providers/local-fine-tuning.ts#L85)

#### enabled

> **enabled**: `boolean`

#### patience

> **patience**: `number`

#### minDelta

> **minDelta**: `number`

***

### quantization?

> `optional` **quantization**: `object`

Defined in: [ai/providers/local-fine-tuning.ts:90](https://github.com/erichchampion/ollama-code/blob/98a042c8536165fb6d83661d7bd5f5a513c67591/ollama-code/src/ai/providers/local-fine-tuning.ts#L90)

#### enabled

> **enabled**: `boolean`

#### type

> **type**: `"int8"` \| `"int4"` \| `"float16"`

***

### lora?

> `optional` **lora**: `object`

Defined in: [ai/providers/local-fine-tuning.ts:94](https://github.com/erichchampion/ollama-code/blob/98a042c8536165fb6d83661d7bd5f5a513c67591/ollama-code/src/ai/providers/local-fine-tuning.ts#L94)

#### enabled

> **enabled**: `boolean`

#### rank

> **rank**: `number`

#### alpha

> **alpha**: `number`

#### dropout

> **dropout**: `number`
