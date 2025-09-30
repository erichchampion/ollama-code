[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / ProviderConnectionError

# Class: ProviderConnectionError

Defined in: [ai/providers/base-provider.ts:398](https://github.com/erichchampion/ollama-code/blob/9a797208bc9e993c86c1b8d84dd48ab6c5c7989f/ollama-code/src/ai/providers/base-provider.ts#L398)

Provider error types

## Extends

- [`ProviderError`](ProviderError.md)

## Constructors

### Constructor

> **new ProviderConnectionError**(`provider`, `cause?`): `ProviderConnectionError`

Defined in: [ai/providers/base-provider.ts:399](https://github.com/erichchampion/ollama-code/blob/9a797208bc9e993c86c1b8d84dd48ab6c5c7989f/ollama-code/src/ai/providers/base-provider.ts#L399)

#### Parameters

##### provider

`string`

##### cause?

`Error`

#### Returns

`ProviderConnectionError`

#### Overrides

[`ProviderError`](ProviderError.md).[`constructor`](ProviderError.md#constructor)

## Properties

### provider

> **provider**: `string`

Defined in: [ai/providers/base-provider.ts:382](https://github.com/erichchampion/ollama-code/blob/9a797208bc9e993c86c1b8d84dd48ab6c5c7989f/ollama-code/src/ai/providers/base-provider.ts#L382)

#### Inherited from

[`ProviderError`](ProviderError.md).[`provider`](ProviderError.md#provider)

***

### code?

> `optional` **code**: `string`

Defined in: [ai/providers/base-provider.ts:383](https://github.com/erichchampion/ollama-code/blob/9a797208bc9e993c86c1b8d84dd48ab6c5c7989f/ollama-code/src/ai/providers/base-provider.ts#L383)

#### Inherited from

[`ProviderError`](ProviderError.md).[`code`](ProviderError.md#code)

***

### retryable

> **retryable**: `boolean` = `false`

Defined in: [ai/providers/base-provider.ts:384](https://github.com/erichchampion/ollama-code/blob/9a797208bc9e993c86c1b8d84dd48ab6c5c7989f/ollama-code/src/ai/providers/base-provider.ts#L384)

#### Inherited from

[`ProviderError`](ProviderError.md).[`retryable`](ProviderError.md#retryable)
