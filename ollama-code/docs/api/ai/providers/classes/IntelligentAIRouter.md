[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / IntelligentAIRouter

# Class: IntelligentAIRouter

Defined in: [ai/providers/intelligent-router.ts:82](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/intelligent-router.ts#L82)

Intelligent AI Router

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new IntelligentAIRouter**(`config`): `IntelligentAIRouter`

Defined in: [ai/providers/intelligent-router.ts:92](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/intelligent-router.ts#L92)

#### Parameters

##### config

`Partial`\<[`RouterConfig`](../interfaces/RouterConfig.md)\> = `{}`

#### Returns

`IntelligentAIRouter`

#### Overrides

`EventEmitter.constructor`

## Methods

### registerProvider()

> **registerProvider**(`provider`): `Promise`\<`void`\>

Defined in: [ai/providers/intelligent-router.ts:114](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/intelligent-router.ts#L114)

Register a provider with the router

#### Parameters

##### provider

[`BaseAIProvider`](BaseAIProvider.md)

#### Returns

`Promise`\<`void`\>

***

### unregisterProvider()

> **unregisterProvider**(`providerName`): `Promise`\<`void`\>

Defined in: [ai/providers/intelligent-router.ts:145](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/intelligent-router.ts#L145)

Unregister a provider

#### Parameters

##### providerName

`string`

#### Returns

`Promise`\<`void`\>

***

### route()

> **route**(`prompt`, `options`, `context`): `Promise`\<[`AICompletionResponse`](../interfaces/AICompletionResponse.md)\>

Defined in: [ai/providers/intelligent-router.ts:164](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/intelligent-router.ts#L164)

Route a completion request to the optimal provider

#### Parameters

##### prompt

`string` | [`AIMessage`](../interfaces/AIMessage.md)[]

##### options

[`AICompletionOptions`](../interfaces/AICompletionOptions.md) = `{}`

##### context

`Partial`\<[`RoutingContext`](../interfaces/RoutingContext.md)\> = `{}`

#### Returns

`Promise`\<[`AICompletionResponse`](../interfaces/AICompletionResponse.md)\>

***

### routeStream()

> **routeStream**(`prompt`, `options`, `onEvent`, `context`, `abortSignal?`): `Promise`\<`void`\>

Defined in: [ai/providers/intelligent-router.ts:212](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/intelligent-router.ts#L212)

Route a streaming completion request

#### Parameters

##### prompt

`string` | [`AIMessage`](../interfaces/AIMessage.md)[]

##### options

[`AICompletionOptions`](../interfaces/AICompletionOptions.md)

##### onEvent

(`event`) => `void`

##### context

`Partial`\<[`RoutingContext`](../interfaces/RoutingContext.md)\> = `{}`

##### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<`void`\>

***

### getBestProvider()

> **getBestProvider**(`context`): `Promise`\<`null` \| [`BaseAIProvider`](BaseAIProvider.md)\>

Defined in: [ai/providers/intelligent-router.ts:256](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/intelligent-router.ts#L256)

Get the best provider for specific capabilities

#### Parameters

##### context

`Partial`\<[`RoutingContext`](../interfaces/RoutingContext.md)\> = `{}`

#### Returns

`Promise`\<`null` \| [`BaseAIProvider`](BaseAIProvider.md)\>

***

### getAllModels()

> **getAllModels**(): `Promise`\<[`AIModel`](../interfaces/AIModel.md)[]\>

Defined in: [ai/providers/intelligent-router.ts:268](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/intelligent-router.ts#L268)

List all available models across all providers

#### Returns

`Promise`\<[`AIModel`](../interfaces/AIModel.md)[]\>

***

### getMetrics()

> **getMetrics**(): [`RouterMetrics`](../interfaces/RouterMetrics.md)

Defined in: [ai/providers/intelligent-router.ts:286](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/intelligent-router.ts#L286)

Get router metrics

#### Returns

[`RouterMetrics`](../interfaces/RouterMetrics.md)

***

### getProviderStatus()

> **getProviderStatus**(): `Record`\<`string`, `any`\>

Defined in: [ai/providers/intelligent-router.ts:293](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/intelligent-router.ts#L293)

Get provider status summary

#### Returns

`Record`\<`string`, `any`\>

***

### cleanup()

> **cleanup**(): `Promise`\<`void`\>

Defined in: [ai/providers/intelligent-router.ts:320](https://github.com/erichchampion/ollama-code/blob/ab39001f5b20eb752663d221d744e3f01c2bdae9/ollama-code/src/ai/providers/intelligent-router.ts#L320)

Cleanup router resources

#### Returns

`Promise`\<`void`\>
