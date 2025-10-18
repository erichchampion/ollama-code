[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / OllamaProvider

# Class: OllamaProvider

Defined in: [ai/providers/ollama-provider.ts:81](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/ollama-provider.ts#L81)

Ollama AI Provider

## Extends

- [`BaseAIProvider`](BaseAIProvider.md)

## Constructors

### Constructor

> **new OllamaProvider**(`config`): `OllamaProvider`

Defined in: [ai/providers/ollama-provider.ts:85](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/ollama-provider.ts#L85)

#### Parameters

##### config

[`ProviderConfig`](../interfaces/ProviderConfig.md)

#### Returns

`OllamaProvider`

#### Overrides

[`BaseAIProvider`](BaseAIProvider.md).[`constructor`](BaseAIProvider.md#constructor)

## Methods

### getDisplayName()

> **getDisplayName**(): `string`

Defined in: [ai/providers/base-provider.ts:178](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/base-provider.ts#L178)

Get provider display name

#### Returns

`string`

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`getDisplayName`](BaseAIProvider.md#getdisplayname)

***

### getHealth()

> **getHealth**(): [`ProviderHealth`](../interfaces/ProviderHealth.md)

Defined in: [ai/providers/base-provider.ts:233](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/base-provider.ts#L233)

Get provider health status

#### Returns

[`ProviderHealth`](../interfaces/ProviderHealth.md)

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`getHealth`](BaseAIProvider.md#gethealth)

***

### getMetrics()

> **getMetrics**(): [`ProviderMetrics`](../interfaces/ProviderMetrics.md)

Defined in: [ai/providers/base-provider.ts:240](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/base-provider.ts#L240)

Get provider metrics

#### Returns

[`ProviderMetrics`](../interfaces/ProviderMetrics.md)

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`getMetrics`](BaseAIProvider.md#getmetrics)

***

### supportsCapability()

> **supportsCapability**(`capability`): `boolean`

Defined in: [ai/providers/base-provider.ts:247](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/base-provider.ts#L247)

Check if provider supports a capability

#### Parameters

##### capability

[`AICapability`](../enumerations/AICapability.md)

#### Returns

`boolean`

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`supportsCapability`](BaseAIProvider.md#supportscapability)

***

### getConfig()

> **getConfig**(): [`ProviderConfig`](../interfaces/ProviderConfig.md)

Defined in: [ai/providers/base-provider.ts:254](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/base-provider.ts#L254)

Get provider configuration

#### Returns

[`ProviderConfig`](../interfaces/ProviderConfig.md)

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`getConfig`](BaseAIProvider.md#getconfig)

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [ai/providers/base-provider.ts:261](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/base-provider.ts#L261)

Update provider configuration

#### Parameters

##### config

`Partial`\<[`ProviderConfig`](../interfaces/ProviderConfig.md)\>

#### Returns

`void`

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`updateConfig`](BaseAIProvider.md#updateconfig)

***

### cleanup()

> **cleanup**(): `Promise`\<`void`\>

Defined in: [ai/providers/base-provider.ts:269](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/base-provider.ts#L269)

Cleanup provider resources

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`cleanup`](BaseAIProvider.md#cleanup)

***

### isReady()

> **isReady**(): `boolean`

Defined in: [ai/providers/base-provider.ts:277](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/base-provider.ts#L277)

Check if provider is initialized

#### Returns

`boolean`

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`isReady`](BaseAIProvider.md#isready)

***

### performHealthCheck()

> **performHealthCheck**(): `Promise`\<`void`\>

Defined in: [ai/providers/base-provider.ts:284](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/base-provider.ts#L284)

Perform health check

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`performHealthCheck`](BaseAIProvider.md#performhealthcheck)

***

### updateMetrics()

> `protected` **updateMetrics**(`success`, `responseTime`, `tokensUsed`, `cost`): `void`

Defined in: [ai/providers/base-provider.ts:314](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/base-provider.ts#L314)

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

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`updateMetrics`](BaseAIProvider.md#updatemetrics)

***

### getName()

> **getName**(): `string`

Defined in: [ai/providers/ollama-provider.ts:112](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/ollama-provider.ts#L112)

Get provider name

#### Returns

`string`

#### Overrides

[`BaseAIProvider`](BaseAIProvider.md).[`getName`](BaseAIProvider.md#getname)

***

### getCapabilities()

> **getCapabilities**(): [`ProviderCapabilities`](../interfaces/ProviderCapabilities.md)

Defined in: [ai/providers/ollama-provider.ts:116](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/ollama-provider.ts#L116)

Get provider capabilities

#### Returns

[`ProviderCapabilities`](../interfaces/ProviderCapabilities.md)

#### Overrides

[`BaseAIProvider`](BaseAIProvider.md).[`getCapabilities`](BaseAIProvider.md#getcapabilities)

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [ai/providers/ollama-provider.ts:141](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/ollama-provider.ts#L141)

Initialize the provider

#### Returns

`Promise`\<`void`\>

#### Overrides

[`BaseAIProvider`](BaseAIProvider.md).[`initialize`](BaseAIProvider.md#initialize)

***

### testConnection()

> **testConnection**(): `Promise`\<`boolean`\>

Defined in: [ai/providers/ollama-provider.ts:165](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/ollama-provider.ts#L165)

Test connection to the provider

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[`BaseAIProvider`](BaseAIProvider.md).[`testConnection`](BaseAIProvider.md#testconnection)

***

### complete()

> **complete**(`prompt`, `options`): `Promise`\<[`AICompletionResponse`](../interfaces/AICompletionResponse.md)\>

Defined in: [ai/providers/ollama-provider.ts:192](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/ollama-provider.ts#L192)

Complete text/chat request

#### Parameters

##### prompt

`string` | [`AIMessage`](../interfaces/AIMessage.md)[]

##### options

[`AICompletionOptions`](../interfaces/AICompletionOptions.md) = `{}`

#### Returns

`Promise`\<[`AICompletionResponse`](../interfaces/AICompletionResponse.md)\>

#### Overrides

[`BaseAIProvider`](BaseAIProvider.md).[`complete`](BaseAIProvider.md#complete)

***

### completeStream()

> **completeStream**(`prompt`, `options`, `onEvent`, `abortSignal?`): `Promise`\<`void`\>

Defined in: [ai/providers/ollama-provider.ts:298](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/ollama-provider.ts#L298)

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

#### Overrides

[`BaseAIProvider`](BaseAIProvider.md).[`completeStream`](BaseAIProvider.md#completestream)

***

### listModels()

> **listModels**(): `Promise`\<[`AIModel`](../interfaces/AIModel.md)[]\>

Defined in: [ai/providers/ollama-provider.ts:374](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/ollama-provider.ts#L374)

List available models

#### Returns

`Promise`\<[`AIModel`](../interfaces/AIModel.md)[]\>

#### Overrides

[`BaseAIProvider`](BaseAIProvider.md).[`listModels`](BaseAIProvider.md#listmodels)

***

### getModel()

> **getModel**(`modelId`): `Promise`\<`null` \| [`AIModel`](../interfaces/AIModel.md)\>

Defined in: [ai/providers/ollama-provider.ts:411](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/ollama-provider.ts#L411)

Get specific model information

#### Parameters

##### modelId

`string`

#### Returns

`Promise`\<`null` \| [`AIModel`](../interfaces/AIModel.md)\>

#### Overrides

[`BaseAIProvider`](BaseAIProvider.md).[`getModel`](BaseAIProvider.md#getmodel)

***

### calculateCost()

> **calculateCost**(`promptTokens`, `completionTokens`, `model?`): `number`

Defined in: [ai/providers/ollama-provider.ts:416](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/ollama-provider.ts#L416)

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

#### Overrides

[`BaseAIProvider`](BaseAIProvider.md).[`calculateCost`](BaseAIProvider.md#calculatecost)

## Properties

### config

> `protected` **config**: [`ProviderConfig`](../interfaces/ProviderConfig.md)

Defined in: [ai/providers/base-provider.ts:158](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/base-provider.ts#L158)

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`config`](BaseAIProvider.md#config)

***

### health

> `protected` **health**: [`ProviderHealth`](../interfaces/ProviderHealth.md)

Defined in: [ai/providers/base-provider.ts:159](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/base-provider.ts#L159)

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`health`](BaseAIProvider.md#health)

***

### metrics

> `protected` **metrics**: [`ProviderMetrics`](../interfaces/ProviderMetrics.md)

Defined in: [ai/providers/base-provider.ts:160](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/base-provider.ts#L160)

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`metrics`](BaseAIProvider.md#metrics)

***

### isInitialized

> `protected` **isInitialized**: `boolean` = `false`

Defined in: [ai/providers/base-provider.ts:161](https://github.com/erichchampion/ollama-code/blob/78170438060c778413879e5a38e477096b574d9c/ollama-code/src/ai/providers/base-provider.ts#L161)

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`isInitialized`](BaseAIProvider.md#isinitialized)
