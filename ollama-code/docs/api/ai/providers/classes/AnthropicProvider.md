[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / AnthropicProvider

# Class: AnthropicProvider

Defined in: [ai/providers/anthropic-provider.ts:70](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/anthropic-provider.ts#L70)

Anthropic Provider

## Extends

- [`BaseAIProvider`](BaseAIProvider.md)

## Constructors

### Constructor

> **new AnthropicProvider**(`config`): `AnthropicProvider`

Defined in: [ai/providers/anthropic-provider.ts:75](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/anthropic-provider.ts#L75)

#### Parameters

##### config

[`ProviderConfig`](../interfaces/ProviderConfig.md)

#### Returns

`AnthropicProvider`

#### Overrides

[`BaseAIProvider`](BaseAIProvider.md).[`constructor`](BaseAIProvider.md#constructor)

## Methods

### getName()

> **getName**(): `string`

Defined in: [ai/providers/anthropic-provider.ts:106](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/anthropic-provider.ts#L106)

Get provider name

#### Returns

`string`

#### Overrides

[`BaseAIProvider`](BaseAIProvider.md).[`getName`](BaseAIProvider.md#getname)

***

### getCapabilities()

> **getCapabilities**(): [`ProviderCapabilities`](../interfaces/ProviderCapabilities.md)

Defined in: [ai/providers/anthropic-provider.ts:110](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/anthropic-provider.ts#L110)

Get provider capabilities

#### Returns

[`ProviderCapabilities`](../interfaces/ProviderCapabilities.md)

#### Overrides

[`BaseAIProvider`](BaseAIProvider.md).[`getCapabilities`](BaseAIProvider.md#getcapabilities)

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [ai/providers/anthropic-provider.ts:138](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/anthropic-provider.ts#L138)

Initialize the provider

#### Returns

`Promise`\<`void`\>

#### Overrides

[`BaseAIProvider`](BaseAIProvider.md).[`initialize`](BaseAIProvider.md#initialize)

***

### testConnection()

> **testConnection**(): `Promise`\<`boolean`\>

Defined in: [ai/providers/anthropic-provider.ts:162](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/anthropic-provider.ts#L162)

Test connection to the provider

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[`BaseAIProvider`](BaseAIProvider.md).[`testConnection`](BaseAIProvider.md#testconnection)

***

### complete()

> **complete**(`prompt`, `options`): `Promise`\<[`AICompletionResponse`](../interfaces/AICompletionResponse.md)\>

Defined in: [ai/providers/anthropic-provider.ts:177](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/anthropic-provider.ts#L177)

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

Defined in: [ai/providers/anthropic-provider.ts:287](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/anthropic-provider.ts#L287)

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

Defined in: [ai/providers/anthropic-provider.ts:395](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/anthropic-provider.ts#L395)

List available models

#### Returns

`Promise`\<[`AIModel`](../interfaces/AIModel.md)[]\>

#### Overrides

[`BaseAIProvider`](BaseAIProvider.md).[`listModels`](BaseAIProvider.md#listmodels)

***

### getModel()

> **getModel**(`modelId`): `Promise`\<`null` \| [`AIModel`](../interfaces/AIModel.md)\>

Defined in: [ai/providers/anthropic-provider.ts:438](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/anthropic-provider.ts#L438)

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

Defined in: [ai/providers/anthropic-provider.ts:443](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/anthropic-provider.ts#L443)

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

***

### getDisplayName()

> **getDisplayName**(): `string`

Defined in: [ai/providers/base-provider.ts:177](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/base-provider.ts#L177)

Get provider display name

#### Returns

`string`

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`getDisplayName`](BaseAIProvider.md#getdisplayname)

***

### getHealth()

> **getHealth**(): [`ProviderHealth`](../interfaces/ProviderHealth.md)

Defined in: [ai/providers/base-provider.ts:232](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/base-provider.ts#L232)

Get provider health status

#### Returns

[`ProviderHealth`](../interfaces/ProviderHealth.md)

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`getHealth`](BaseAIProvider.md#gethealth)

***

### getMetrics()

> **getMetrics**(): [`ProviderMetrics`](../interfaces/ProviderMetrics.md)

Defined in: [ai/providers/base-provider.ts:239](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/base-provider.ts#L239)

Get provider metrics

#### Returns

[`ProviderMetrics`](../interfaces/ProviderMetrics.md)

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`getMetrics`](BaseAIProvider.md#getmetrics)

***

### supportsCapability()

> **supportsCapability**(`capability`): `boolean`

Defined in: [ai/providers/base-provider.ts:246](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/base-provider.ts#L246)

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

Defined in: [ai/providers/base-provider.ts:253](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/base-provider.ts#L253)

Get provider configuration

#### Returns

[`ProviderConfig`](../interfaces/ProviderConfig.md)

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`getConfig`](BaseAIProvider.md#getconfig)

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [ai/providers/base-provider.ts:260](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/base-provider.ts#L260)

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

Defined in: [ai/providers/base-provider.ts:268](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/base-provider.ts#L268)

Cleanup provider resources

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`cleanup`](BaseAIProvider.md#cleanup)

***

### isReady()

> **isReady**(): `boolean`

Defined in: [ai/providers/base-provider.ts:276](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/base-provider.ts#L276)

Check if provider is initialized

#### Returns

`boolean`

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`isReady`](BaseAIProvider.md#isready)

***

### performHealthCheck()

> **performHealthCheck**(): `Promise`\<`void`\>

Defined in: [ai/providers/base-provider.ts:283](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/base-provider.ts#L283)

Perform health check

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`performHealthCheck`](BaseAIProvider.md#performhealthcheck)

***

### updateMetrics()

> `protected` **updateMetrics**(`success`, `responseTime`, `tokensUsed`, `cost`): `void`

Defined in: [ai/providers/base-provider.ts:313](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/base-provider.ts#L313)

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

## Properties

### config

> `protected` **config**: [`ProviderConfig`](../interfaces/ProviderConfig.md)

Defined in: [ai/providers/base-provider.ts:157](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/base-provider.ts#L157)

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`config`](BaseAIProvider.md#config)

***

### health

> `protected` **health**: [`ProviderHealth`](../interfaces/ProviderHealth.md)

Defined in: [ai/providers/base-provider.ts:158](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/base-provider.ts#L158)

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`health`](BaseAIProvider.md#health)

***

### metrics

> `protected` **metrics**: [`ProviderMetrics`](../interfaces/ProviderMetrics.md)

Defined in: [ai/providers/base-provider.ts:159](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/base-provider.ts#L159)

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`metrics`](BaseAIProvider.md#metrics)

***

### isInitialized

> `protected` **isInitialized**: `boolean` = `false`

Defined in: [ai/providers/base-provider.ts:160](https://github.com/erichchampion/ollama-code/blob/586a37c3b5ca4898110458ba6693f528259f1a2d/ollama-code/src/ai/providers/base-provider.ts#L160)

#### Inherited from

[`BaseAIProvider`](BaseAIProvider.md).[`isInitialized`](BaseAIProvider.md#isinitialized)
