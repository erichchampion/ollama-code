[**Ollama Code API Documentation v0.1.0**](../../../../README.md)

***

[Ollama Code API Documentation](../../../../modules.md) / [ai/vcs/ci-template-generator](../README.md) / CITemplateConfig

# Interface: CITemplateConfig

Defined in: [ai/vcs/ci-template-generator.ts:11](https://github.com/erichchampion/ollama-code/blob/f579fc18d250ee6a96568b59118babb3bbd950b6/ollama-code/src/ai/vcs/ci-template-generator.ts#L11)

## Properties

### platform

> **platform**: `"github"` \| `"gitlab"` \| `"bitbucket"` \| `"azure"` \| `"circleci"` \| `"jenkins"`

Defined in: [ai/vcs/ci-template-generator.ts:12](https://github.com/erichchampion/ollama-code/blob/f579fc18d250ee6a96568b59118babb3bbd950b6/ollama-code/src/ai/vcs/ci-template-generator.ts#L12)

***

### branches?

> `optional` **branches**: `string`[]

Defined in: [ai/vcs/ci-template-generator.ts:13](https://github.com/erichchampion/ollama-code/blob/f579fc18d250ee6a96568b59118babb3bbd950b6/ollama-code/src/ai/vcs/ci-template-generator.ts#L13)

***

### enableParallel?

> `optional` **enableParallel**: `boolean`

Defined in: [ai/vcs/ci-template-generator.ts:14](https://github.com/erichchampion/ollama-code/blob/f579fc18d250ee6a96568b59118babb3bbd950b6/ollama-code/src/ai/vcs/ci-template-generator.ts#L14)

***

### enableCaching?

> `optional` **enableCaching**: `boolean`

Defined in: [ai/vcs/ci-template-generator.ts:15](https://github.com/erichchampion/ollama-code/blob/f579fc18d250ee6a96568b59118babb3bbd950b6/ollama-code/src/ai/vcs/ci-template-generator.ts#L15)

***

### enableArtifacts?

> `optional` **enableArtifacts**: `boolean`

Defined in: [ai/vcs/ci-template-generator.ts:16](https://github.com/erichchampion/ollama-code/blob/f579fc18d250ee6a96568b59118babb3bbd950b6/ollama-code/src/ai/vcs/ci-template-generator.ts#L16)

***

### enableSchedule?

> `optional` **enableSchedule**: `boolean`

Defined in: [ai/vcs/ci-template-generator.ts:17](https://github.com/erichchampion/ollama-code/blob/f579fc18d250ee6a96568b59118babb3bbd950b6/ollama-code/src/ai/vcs/ci-template-generator.ts#L17)

***

### customConfig?

> `optional` **customConfig**: `Record`\<`string`, `any`\>

Defined in: [ai/vcs/ci-template-generator.ts:18](https://github.com/erichchampion/ollama-code/blob/f579fc18d250ee6a96568b59118babb3bbd950b6/ollama-code/src/ai/vcs/ci-template-generator.ts#L18)
