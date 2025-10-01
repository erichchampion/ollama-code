[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / ProviderRateLimitError

# Class: ProviderRateLimitError

Defined in: [ai/providers/base-provider.ts:391](https://github.com/erichchampion/ollama-code/blob/97554aa24b97798bc862485527ccd6faff2a1d42/ollama-code/src/ai/providers/base-provider.ts#L391)

Provider error types

## Extends

- [`ProviderError`](ProviderError.md)

## Constructors

### Constructor

> **new ProviderRateLimitError**(`provider`, `retryAfter?`): `ProviderRateLimitError`

Defined in: [ai/providers/base-provider.ts:392](https://github.com/erichchampion/ollama-code/blob/97554aa24b97798bc862485527ccd6faff2a1d42/ollama-code/src/ai/providers/base-provider.ts#L392)

#### Parameters

##### provider

`string`

##### retryAfter?

`number`

#### Returns

`ProviderRateLimitError`

#### Overrides

[`ProviderError`](ProviderError.md).[`constructor`](ProviderError.md#constructor)

## Properties

### provider

> **provider**: `string`

Defined in: [ai/providers/base-provider.ts:382](https://github.com/erichchampion/ollama-code/blob/97554aa24b97798bc862485527ccd6faff2a1d42/ollama-code/src/ai/providers/base-provider.ts#L382)

#### Inherited from

[`ProviderError`](ProviderError.md).[`provider`](ProviderError.md#provider)

***

### code?

> `optional` **code**: `string`

Defined in: [ai/providers/base-provider.ts:383](https://github.com/erichchampion/ollama-code/blob/97554aa24b97798bc862485527ccd6faff2a1d42/ollama-code/src/ai/providers/base-provider.ts#L383)

#### Inherited from

[`ProviderError`](ProviderError.md).[`code`](ProviderError.md#code)

***

### retryable

> **retryable**: `boolean` = `false`

Defined in: [ai/providers/base-provider.ts:384](https://github.com/erichchampion/ollama-code/blob/97554aa24b97798bc862485527ccd6faff2a1d42/ollama-code/src/ai/providers/base-provider.ts#L384)

#### Inherited from

[`ProviderError`](ProviderError.md).[`retryable`](ProviderError.md#retryable)
