[**Ollama Code API Documentation v0.1.0**](../../../../README.md)

***

[Ollama Code API Documentation](../../../../modules.md) / [ai/vcs/ci-template-generator](../README.md) / generateCIConfig

# Function: generateCIConfig()

> **generateCIConfig**(`platform`, `options?`): `string`

Defined in: [ai/vcs/ci-template-generator.ts:516](https://github.com/erichchampion/ollama-code/blob/d3714fddada0e31a207f4ac11b8476937193173b/ollama-code/src/ai/vcs/ci-template-generator.ts#L516)

Generate CI configuration for a specific platform

## Parameters

### platform

`"github"` | `"gitlab"` | `"bitbucket"` | `"azure"` | `"circleci"` | `"jenkins"`

### options?

`Partial`\<[`CITemplateConfig`](../interfaces/CITemplateConfig.md)\>

## Returns

`string`
