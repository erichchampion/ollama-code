[**Ollama Code API Documentation v0.1.0**](../../../../README.md)

***

[Ollama Code API Documentation](../../../../modules.md) / [ai/vcs/ci-template-generator](../README.md) / generateCIConfig

# Function: generateCIConfig()

> **generateCIConfig**(`platform`, `options?`): `string`

Defined in: [ai/vcs/ci-template-generator.ts:516](https://github.com/erichchampion/ollama-code/blob/b99cb69c24326793ea2d4f713f56de8fdfcd084d/ollama-code/src/ai/vcs/ci-template-generator.ts#L516)

Generate CI configuration for a specific platform

## Parameters

### platform

`"github"` | `"gitlab"` | `"bitbucket"` | `"azure"` | `"circleci"` | `"jenkins"`

### options?

`Partial`\<[`CITemplateConfig`](../interfaces/CITemplateConfig.md)\>

## Returns

`string`
