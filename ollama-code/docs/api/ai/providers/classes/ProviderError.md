[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / ProviderError

# Class: ProviderError

Defined in: [ai/providers/base-provider.ts:380](https://github.com/erichchampion/ollama-code/blob/f579fc18d250ee6a96568b59118babb3bbd950b6/ollama-code/src/ai/providers/base-provider.ts#L380)

Provider error types

## Extends

- `Error`

## Extended by

- [`ProviderRateLimitError`](ProviderRateLimitError.md)
- [`ProviderConnectionError`](ProviderConnectionError.md)
- [`ProviderAuthenticationError`](ProviderAuthenticationError.md)

## Constructors

### Constructor

> **new ProviderError**(`message`, `provider`, `code?`, `retryable?`): `ProviderError`

Defined in: [ai/providers/base-provider.ts:381](https://github.com/erichchampion/ollama-code/blob/f579fc18d250ee6a96568b59118babb3bbd950b6/ollama-code/src/ai/providers/base-provider.ts#L381)

#### Parameters

##### message

`string`

##### provider

`string`

##### code?

`string`

##### retryable?

`boolean` = `false`

#### Returns

`ProviderError`

#### Overrides

`Error.constructor`

## Properties

### provider

> **provider**: `string`

Defined in: [ai/providers/base-provider.ts:383](https://github.com/erichchampion/ollama-code/blob/f579fc18d250ee6a96568b59118babb3bbd950b6/ollama-code/src/ai/providers/base-provider.ts#L383)

***

### code?

> `optional` **code**: `string`

Defined in: [ai/providers/base-provider.ts:384](https://github.com/erichchampion/ollama-code/blob/f579fc18d250ee6a96568b59118babb3bbd950b6/ollama-code/src/ai/providers/base-provider.ts#L384)

***

### retryable

> **retryable**: `boolean` = `false`

Defined in: [ai/providers/base-provider.ts:385](https://github.com/erichchampion/ollama-code/blob/f579fc18d250ee6a96568b59118babb3bbd950b6/ollama-code/src/ai/providers/base-provider.ts#L385)
