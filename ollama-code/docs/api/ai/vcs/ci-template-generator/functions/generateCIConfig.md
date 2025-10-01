[**Ollama Code API Documentation v0.1.0**](../../../../README.md)

***

[Ollama Code API Documentation](../../../../modules.md) / [ai/vcs/ci-template-generator](../README.md) / generateCIConfig

# Function: generateCIConfig()

> **generateCIConfig**(`platform`, `options?`): `string`

Defined in: [ai/vcs/ci-template-generator.ts:516](https://github.com/erichchampion/ollama-code/blob/7bf02bdc8ebf923c87dd1be8a3c8c4011170f2d0/ollama-code/src/ai/vcs/ci-template-generator.ts#L516)

Generate CI configuration for a specific platform

## Parameters

### platform

`"github"` | `"gitlab"` | `"bitbucket"` | `"azure"` | `"circleci"` | `"jenkins"`

### options?

`Partial`\<[`CITemplateConfig`](../interfaces/CITemplateConfig.md)\>

## Returns

`string`
