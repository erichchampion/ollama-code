[**Ollama Code API Documentation v0.1.0**](../../../../README.md)

***

[Ollama Code API Documentation](../../../../modules.md) / [ai/providers/model-deployment-manager](../README.md) / LoadBalancer

# Interface: LoadBalancer

Defined in: [ai/providers/model-deployment-manager.ts:88](https://github.com/erichchampion/ollama-code/blob/d3714fddada0e31a207f4ac11b8476937193173b/ollama-code/src/ai/providers/model-deployment-manager.ts#L88)

## Properties

### id

> **id**: `string`

Defined in: [ai/providers/model-deployment-manager.ts:89](https://github.com/erichchampion/ollama-code/blob/d3714fddada0e31a207f4ac11b8476937193173b/ollama-code/src/ai/providers/model-deployment-manager.ts#L89)

***

### deploymentId

> **deploymentId**: `string`

Defined in: [ai/providers/model-deployment-manager.ts:90](https://github.com/erichchampion/ollama-code/blob/d3714fddada0e31a207f4ac11b8476937193173b/ollama-code/src/ai/providers/model-deployment-manager.ts#L90)

***

### strategy

> **strategy**: `"round_robin"` \| `"random"` \| `"least_connections"` \| `"weighted"`

Defined in: [ai/providers/model-deployment-manager.ts:91](https://github.com/erichchampion/ollama-code/blob/d3714fddada0e31a207f4ac11b8476937193173b/ollama-code/src/ai/providers/model-deployment-manager.ts#L91)

***

### instances

> **instances**: `string`[]

Defined in: [ai/providers/model-deployment-manager.ts:92](https://github.com/erichchampion/ollama-code/blob/d3714fddada0e31a207f4ac11b8476937193173b/ollama-code/src/ai/providers/model-deployment-manager.ts#L92)

***

### currentIndex

> **currentIndex**: `number`

Defined in: [ai/providers/model-deployment-manager.ts:93](https://github.com/erichchampion/ollama-code/blob/d3714fddada0e31a207f4ac11b8476937193173b/ollama-code/src/ai/providers/model-deployment-manager.ts#L93)

***

### weights?

> `optional` **weights**: `Map`\<`string`, `number`\>

Defined in: [ai/providers/model-deployment-manager.ts:94](https://github.com/erichchampion/ollama-code/blob/d3714fddada0e31a207f4ac11b8476937193173b/ollama-code/src/ai/providers/model-deployment-manager.ts#L94)

***

### healthyInstances

> **healthyInstances**: `Set`\<`string`\>

Defined in: [ai/providers/model-deployment-manager.ts:95](https://github.com/erichchampion/ollama-code/blob/d3714fddada0e31a207f4ac11b8476937193173b/ollama-code/src/ai/providers/model-deployment-manager.ts#L95)
