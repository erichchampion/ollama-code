[**Ollama Code API Documentation v0.1.0**](../../../README.md)

***

[Ollama Code API Documentation](../../../modules.md) / [ai/providers](../README.md) / ProviderAuthenticationError

# Class: ProviderAuthenticationError

Defined in: [ai/providers/base-provider.ts:406](https://github.com/erichchampion/ollama-code/blob/f579fc18d250ee6a96568b59118babb3bbd950b6/ollama-code/src/ai/providers/base-provider.ts#L406)

Provider error types

## Extends

- [`ProviderError`](ProviderError.md)

## Constructors

### Constructor

> **new ProviderAuthenticationError**(`provider`): `ProviderAuthenticationError`

Defined in: [ai/providers/base-provider.ts:407](https://github.com/erichchampion/ollama-code/blob/f579fc18d250ee6a96568b59118babb3bbd950b6/ollama-code/src/ai/providers/base-provider.ts#L407)

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

Defined in: [ai/providers/base-provider.ts:383](https://github.com/erichchampion/ollama-code/blob/f579fc18d250ee6a96568b59118babb3bbd950b6/ollama-code/src/ai/providers/base-provider.ts#L383)

#### Inherited from

[`ProviderError`](ProviderError.md).[`provider`](ProviderError.md#provider)

***

### code?

> `optional` **code**: `string`

Defined in: [ai/providers/base-provider.ts:384](https://github.com/erichchampion/ollama-code/blob/f579fc18d250ee6a96568b59118babb3bbd950b6/ollama-code/src/ai/providers/base-provider.ts#L384)

#### Inherited from

[`ProviderError`](ProviderError.md).[`code`](ProviderError.md#code)

***

### retryable

> **retryable**: `boolean` = `false`

Defined in: [ai/providers/base-provider.ts:385](https://github.com/erichchampion/ollama-code/blob/f579fc18d250ee6a96568b59118babb3bbd950b6/ollama-code/src/ai/providers/base-provider.ts#L385)

#### Inherited from

[`ProviderError`](ProviderError.md).[`retryable`](ProviderError.md#retryable)
