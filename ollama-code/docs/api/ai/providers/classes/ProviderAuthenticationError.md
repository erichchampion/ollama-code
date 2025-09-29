[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / ProviderAuthenticationError

# Class: ProviderAuthenticationError

Defined in: [ai/providers/base-provider.ts:405](https://github.com/erichchampion/ollama-code/blob/a6ec53910f51a174af1f2c4fb981760e5f53805f/ollama-code/src/ai/providers/base-provider.ts#L405)

Provider error types

## Extends

- [`ProviderError`](ProviderError.md)

## Constructors

### Constructor

> **new ProviderAuthenticationError**(`provider`): `ProviderAuthenticationError`

Defined in: [ai/providers/base-provider.ts:406](https://github.com/erichchampion/ollama-code/blob/a6ec53910f51a174af1f2c4fb981760e5f53805f/ollama-code/src/ai/providers/base-provider.ts#L406)

#### Parameters

##### provider

`string`

#### Returns

`ProviderAuthenticationError`

#### Overrides

[`ProviderError`](ProviderError.md).[`constructor`](ProviderError.md#constructor)

## Properties

### provider

> **provider**: `string`

Defined in: [ai/providers/base-provider.ts:382](https://github.com/erichchampion/ollama-code/blob/a6ec53910f51a174af1f2c4fb981760e5f53805f/ollama-code/src/ai/providers/base-provider.ts#L382)

#### Inherited from

[`ProviderError`](ProviderError.md).[`provider`](ProviderError.md#provider)

***

### code?

> `optional` **code**: `string`

Defined in: [ai/providers/base-provider.ts:383](https://github.com/erichchampion/ollama-code/blob/a6ec53910f51a174af1f2c4fb981760e5f53805f/ollama-code/src/ai/providers/base-provider.ts#L383)

#### Inherited from

[`ProviderError`](ProviderError.md).[`code`](ProviderError.md#code)

***

### retryable

> **retryable**: `boolean` = `false`

Defined in: [ai/providers/base-provider.ts:384](https://github.com/erichchampion/ollama-code/blob/a6ec53910f51a174af1f2c4fb981760e5f53805f/ollama-code/src/ai/providers/base-provider.ts#L384)

#### Inherited from

[`ProviderError`](ProviderError.md).[`retryable`](ProviderError.md#retryable)
