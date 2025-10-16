[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / BaseAIProvider

# Abstract Class: BaseAIProvider

Defined in: [ai/providers/base-provider.ts:157](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L157)

Abstract base class for all AI providers

## Extends

- `EventEmitter`

## Extended by

- [`CustomLocalProvider`](../local-fine-tuning/classes/CustomLocalProvider.md)
- [`OllamaProvider`](OllamaProvider.md)
- [`OpenAIProvider`](OpenAIProvider.md)
- [`AnthropicProvider`](AnthropicProvider.md)
- [`GoogleProvider`](GoogleProvider.md)

## Constructors

### Constructor

> **new BaseAIProvider**(`config`): `BaseAIProvider`

Defined in: [ai/providers/base-provider.ts:163](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L163)

#### Parameters

##### config

[`ProviderConfig`](../interfaces/ProviderConfig.md)

#### Returns

`BaseAIProvider`

#### Overrides

`EventEmitter.constructor`

## Methods

### getName()

> `abstract` **getName**(): `string`

Defined in: [ai/providers/base-provider.ts:173](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L173)

Get provider name

#### Returns

`string`

***

### getDisplayName()

> **getDisplayName**(): `string`

Defined in: [ai/providers/base-provider.ts:178](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L178)

Get provider display name

#### Returns

`string`

***

### getCapabilities()

> `abstract` **getCapabilities**(): [`ProviderCapabilities`](../interfaces/ProviderCapabilities.md)

Defined in: [ai/providers/base-provider.ts:185](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L185)

Get provider capabilities

#### Returns

[`ProviderCapabilities`](../interfaces/ProviderCapabilities.md)

***

### initialize()

> `abstract` **initialize**(): `Promise`\<`void`\>

Defined in: [ai/providers/base-provider.ts:190](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L190)

Initialize the provider

#### Returns

`Promise`\<`void`\>

***

### testConnection()

> `abstract` **testConnection**(): `Promise`\<`boolean`\>

Defined in: [ai/providers/base-provider.ts:195](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L195)

Test connection to the provider

#### Returns

`Promise`\<`boolean`\>

***

### complete()

> `abstract` **complete**(`prompt`, `options?`): `Promise`\<[`AICompletionResponse`](../interfaces/AICompletionResponse.md)\>

Defined in: [ai/providers/base-provider.ts:200](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L200)

Complete text/chat request

#### Parameters

##### prompt

`string` | [`AIMessage`](../interfaces/AIMessage.md)[]

##### options?

[`AICompletionOptions`](../interfaces/AICompletionOptions.md)

#### Returns

`Promise`\<[`AICompletionResponse`](../interfaces/AICompletionResponse.md)\>

***

### completeStream()

> `abstract` **completeStream**(`prompt`, `options`, `onEvent`, `abortSignal?`): `Promise`\<`void`\>

Defined in: [ai/providers/base-provider.ts:208](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L208)

Stream completion request

#### Parameters

##### prompt

`string` | [`AIMessage`](../interfaces/AIMessage.md)[]

##### options

[`AICompletionOptions`](../interfaces/AICompletionOptions.md)

##### onEvent

(`event`) => `void`

##### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<`void`\>

***

### listModels()

> `abstract` **listModels**(): `Promise`\<[`AIModel`](../interfaces/AIModel.md)[]\>

Defined in: [ai/providers/base-provider.ts:218](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L218)

List available models

#### Returns

`Promise`\<[`AIModel`](../interfaces/AIModel.md)[]\>

***

### getModel()

> `abstract` **getModel**(`modelId`): `Promise`\<`null` \| [`AIModel`](../interfaces/AIModel.md)\>

Defined in: [ai/providers/base-provider.ts:223](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L223)

Get specific model information

#### Parameters

##### modelId

`string`

#### Returns

`Promise`\<`null` \| [`AIModel`](../interfaces/AIModel.md)\>

***

### calculateCost()

> `abstract` **calculateCost**(`promptTokens`, `completionTokens`, `model?`): `number`

Defined in: [ai/providers/base-provider.ts:228](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L228)

Calculate cost for a request

#### Parameters

##### promptTokens

`number`

##### completionTokens

`number`

##### model?

`string`

#### Returns

`number`

***

### getHealth()

> **getHealth**(): [`ProviderHealth`](../interfaces/ProviderHealth.md)

Defined in: [ai/providers/base-provider.ts:233](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L233)

Get provider health status

#### Returns

[`ProviderHealth`](../interfaces/ProviderHealth.md)

***

### getMetrics()

> **getMetrics**(): [`ProviderMetrics`](../interfaces/ProviderMetrics.md)

Defined in: [ai/providers/base-provider.ts:240](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L240)

Get provider metrics

#### Returns

[`ProviderMetrics`](../interfaces/ProviderMetrics.md)

***

### supportsCapability()

> **supportsCapability**(`capability`): `boolean`

Defined in: [ai/providers/base-provider.ts:247](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L247)

Check if provider supports a capability

#### Parameters

##### capability

[`AICapability`](../enumerations/AICapability.md)

#### Returns

`boolean`

***

### getConfig()

> **getConfig**(): [`ProviderConfig`](../interfaces/ProviderConfig.md)

Defined in: [ai/providers/base-provider.ts:254](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L254)

Get provider configuration

#### Returns

[`ProviderConfig`](../interfaces/ProviderConfig.md)

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [ai/providers/base-provider.ts:261](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L261)

Update provider configuration

#### Parameters

##### config

`Partial`\<[`ProviderConfig`](../interfaces/ProviderConfig.md)\>

#### Returns

`void`

***

### cleanup()

> **cleanup**(): `Promise`\<`void`\>

Defined in: [ai/providers/base-provider.ts:269](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L269)

Cleanup provider resources

#### Returns

`Promise`\<`void`\>

***

### isReady()

> **isReady**(): `boolean`

Defined in: [ai/providers/base-provider.ts:277](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L277)

Check if provider is initialized

#### Returns

`boolean`

***

### performHealthCheck()

> **performHealthCheck**(): `Promise`\<`void`\>

Defined in: [ai/providers/base-provider.ts:284](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L284)

Perform health check

#### Returns

`Promise`\<`void`\>

***

### updateMetrics()

> `protected` **updateMetrics**(`success`, `responseTime`, `tokensUsed`, `cost`): `void`

Defined in: [ai/providers/base-provider.ts:314](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L314)

Update metrics after a request

#### Parameters

##### success

`boolean`

##### responseTime

`number`

##### tokensUsed

`number` = `0`

##### cost

`number` = `0`

#### Returns

`void`

## Properties

### config

> `protected` **config**: [`ProviderConfig`](../interfaces/ProviderConfig.md)

Defined in: [ai/providers/base-provider.ts:158](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L158)

***

### health

> `protected` **health**: [`ProviderHealth`](../interfaces/ProviderHealth.md)

Defined in: [ai/providers/base-provider.ts:159](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L159)

***

### metrics

> `protected` **metrics**: [`ProviderMetrics`](../interfaces/ProviderMetrics.md)

Defined in: [ai/providers/base-provider.ts:160](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L160)

***

### isInitialized

> `protected` **isInitialized**: `boolean` = `false`

Defined in: [ai/providers/base-provider.ts:161](https://github.com/erichchampion/ollama-code/blob/71525b68c65a1139d08d5a868e15d1644edd30d9/ollama-code/src/ai/providers/base-provider.ts#L161)
