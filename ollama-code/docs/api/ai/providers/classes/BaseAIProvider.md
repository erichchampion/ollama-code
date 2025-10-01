[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / BaseAIProvider

# Abstract Class: BaseAIProvider

Defined in: [ai/providers/base-provider.ts:156](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L156)

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

Defined in: [ai/providers/base-provider.ts:162](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L162)

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

Defined in: [ai/providers/base-provider.ts:172](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L172)

Get provider name

#### Returns

`string`

***

### getDisplayName()

> **getDisplayName**(): `string`

Defined in: [ai/providers/base-provider.ts:177](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L177)

Get provider display name

#### Returns

`string`

***

### getCapabilities()

> `abstract` **getCapabilities**(): [`ProviderCapabilities`](../interfaces/ProviderCapabilities.md)

Defined in: [ai/providers/base-provider.ts:184](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L184)

Get provider capabilities

#### Returns

[`ProviderCapabilities`](../interfaces/ProviderCapabilities.md)

***

### initialize()

> `abstract` **initialize**(): `Promise`\<`void`\>

Defined in: [ai/providers/base-provider.ts:189](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L189)

Initialize the provider

#### Returns

`Promise`\<`void`\>

***

### testConnection()

> `abstract` **testConnection**(): `Promise`\<`boolean`\>

Defined in: [ai/providers/base-provider.ts:194](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L194)

Test connection to the provider

#### Returns

`Promise`\<`boolean`\>

***

### complete()

> `abstract` **complete**(`prompt`, `options?`): `Promise`\<[`AICompletionResponse`](../interfaces/AICompletionResponse.md)\>

Defined in: [ai/providers/base-provider.ts:199](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L199)

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

Defined in: [ai/providers/base-provider.ts:207](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L207)

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

Defined in: [ai/providers/base-provider.ts:217](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L217)

List available models

#### Returns

`Promise`\<[`AIModel`](../interfaces/AIModel.md)[]\>

***

### getModel()

> `abstract` **getModel**(`modelId`): `Promise`\<`null` \| [`AIModel`](../interfaces/AIModel.md)\>

Defined in: [ai/providers/base-provider.ts:222](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L222)

Get specific model information

#### Parameters

##### modelId

`string`

#### Returns

`Promise`\<`null` \| [`AIModel`](../interfaces/AIModel.md)\>

***

### calculateCost()

> `abstract` **calculateCost**(`promptTokens`, `completionTokens`, `model?`): `number`

Defined in: [ai/providers/base-provider.ts:227](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L227)

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

Defined in: [ai/providers/base-provider.ts:232](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L232)

Get provider health status

#### Returns

[`ProviderHealth`](../interfaces/ProviderHealth.md)

***

### getMetrics()

> **getMetrics**(): [`ProviderMetrics`](../interfaces/ProviderMetrics.md)

Defined in: [ai/providers/base-provider.ts:239](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L239)

Get provider metrics

#### Returns

[`ProviderMetrics`](../interfaces/ProviderMetrics.md)

***

### supportsCapability()

> **supportsCapability**(`capability`): `boolean`

Defined in: [ai/providers/base-provider.ts:246](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L246)

Check if provider supports a capability

#### Parameters

##### capability

[`AICapability`](../enumerations/AICapability.md)

#### Returns

`boolean`

***

### getConfig()

> **getConfig**(): [`ProviderConfig`](../interfaces/ProviderConfig.md)

Defined in: [ai/providers/base-provider.ts:253](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L253)

Get provider configuration

#### Returns

[`ProviderConfig`](../interfaces/ProviderConfig.md)

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [ai/providers/base-provider.ts:260](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L260)

Update provider configuration

#### Parameters

##### config

`Partial`\<[`ProviderConfig`](../interfaces/ProviderConfig.md)\>

#### Returns

`void`

***

### cleanup()

> **cleanup**(): `Promise`\<`void`\>

Defined in: [ai/providers/base-provider.ts:268](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L268)

Cleanup provider resources

#### Returns

`Promise`\<`void`\>

***

### isReady()

> **isReady**(): `boolean`

Defined in: [ai/providers/base-provider.ts:276](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L276)

Check if provider is initialized

#### Returns

`boolean`

***

### performHealthCheck()

> **performHealthCheck**(): `Promise`\<`void`\>

Defined in: [ai/providers/base-provider.ts:283](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L283)

Perform health check

#### Returns

`Promise`\<`void`\>

***

### updateMetrics()

> `protected` **updateMetrics**(`success`, `responseTime`, `tokensUsed`, `cost`): `void`

Defined in: [ai/providers/base-provider.ts:313](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L313)

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

Defined in: [ai/providers/base-provider.ts:157](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L157)

***

### health

> `protected` **health**: [`ProviderHealth`](../interfaces/ProviderHealth.md)

Defined in: [ai/providers/base-provider.ts:158](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L158)

***

### metrics

> `protected` **metrics**: [`ProviderMetrics`](../interfaces/ProviderMetrics.md)

Defined in: [ai/providers/base-provider.ts:159](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L159)

***

### isInitialized

> `protected` **isInitialized**: `boolean` = `false`

Defined in: [ai/providers/base-provider.ts:160](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/base-provider.ts#L160)
