[**Ollama Code API Documentation v0.1.0**](../../../../README.md)

***

[Ollama Code API Documentation](../../../../modules.md) / [ai/providers/local-fine-tuning](../README.md) / LocalFineTuningManager

# Class: LocalFineTuningManager

Defined in: [ai/providers/local-fine-tuning.ts:123](https://github.com/erichchampion/ollama-code/blob/a6ec53910f51a174af1f2c4fb981760e5f53805f/ollama-code/src/ai/providers/local-fine-tuning.ts#L123)

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new LocalFineTuningManager**(`workspaceDir`): `LocalFineTuningManager`

Defined in: [ai/providers/local-fine-tuning.ts:132](https://github.com/erichchampion/ollama-code/blob/a6ec53910f51a174af1f2c4fb981760e5f53805f/ollama-code/src/ai/providers/local-fine-tuning.ts#L132)

#### Parameters

##### workspaceDir

`string` = `'./ollama-code-workspace'`

#### Returns

`LocalFineTuningManager`

#### Overrides

`EventEmitter.constructor`

## Methods

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [ai/providers/local-fine-tuning.ts:142](https://github.com/erichchampion/ollama-code/blob/a6ec53910f51a174af1f2c4fb981760e5f53805f/ollama-code/src/ai/providers/local-fine-tuning.ts#L142)

Initialize the fine-tuning workspace

#### Returns

`Promise`\<`void`\>

***

### createDataset()

> **createDataset**(`name`, `description`, `type`, `sourceFiles`, `options`): `Promise`\<[`FineTuningDataset`](../interfaces/FineTuningDataset.md)\>

Defined in: [ai/providers/local-fine-tuning.ts:156](https://github.com/erichchampion/ollama-code/blob/a6ec53910f51a174af1f2c4fb981760e5f53805f/ollama-code/src/ai/providers/local-fine-tuning.ts#L156)

Create a new dataset from files

#### Parameters

##### name

`string`

##### description

`string`

##### type

`"documentation"` | `"general"` | `"code_analysis"` | `"code_completion"`

##### sourceFiles

`string`[]

##### options

###### language?

`string`

###### framework?

`string`

###### domain?

`string`

###### format?

`"csv"` \| `"jsonl"` \| `"parquet"`

###### validateQuality?

`boolean`

#### Returns

`Promise`\<[`FineTuningDataset`](../interfaces/FineTuningDataset.md)\>

***

### startFineTuning()

> **startFineTuning**(`name`, `baseModel`, `datasetId`, `config`): `Promise`\<[`FineTuningJob`](../interfaces/FineTuningJob.md)\>

Defined in: [ai/providers/local-fine-tuning.ts:218](https://github.com/erichchampion/ollama-code/blob/a6ec53910f51a174af1f2c4fb981760e5f53805f/ollama-code/src/ai/providers/local-fine-tuning.ts#L218)

Start a fine-tuning job

#### Parameters

##### name

`string`

##### baseModel

`string`

##### datasetId

`string`

##### config

`Partial`\<[`FineTuningConfig`](../interfaces/FineTuningConfig.md)\> = `{}`

#### Returns

`Promise`\<[`FineTuningJob`](../interfaces/FineTuningJob.md)\>

***

### getJob()

> **getJob**(`jobId`): `undefined` \| [`FineTuningJob`](../interfaces/FineTuningJob.md)

Defined in: [ai/providers/local-fine-tuning.ts:266](https://github.com/erichchampion/ollama-code/blob/a6ec53910f51a174af1f2c4fb981760e5f53805f/ollama-code/src/ai/providers/local-fine-tuning.ts#L266)

Monitor a fine-tuning job

#### Parameters

##### jobId

`string`

#### Returns

`undefined` \| [`FineTuningJob`](../interfaces/FineTuningJob.md)

***

### listJobs()

> **listJobs**(): [`FineTuningJob`](../interfaces/FineTuningJob.md)[]

Defined in: [ai/providers/local-fine-tuning.ts:273](https://github.com/erichchampion/ollama-code/blob/a6ec53910f51a174af1f2c4fb981760e5f53805f/ollama-code/src/ai/providers/local-fine-tuning.ts#L273)

List all jobs

#### Returns

[`FineTuningJob`](../interfaces/FineTuningJob.md)[]

***

### cancelJob()

> **cancelJob**(`jobId`): `Promise`\<`void`\>

Defined in: [ai/providers/local-fine-tuning.ts:280](https://github.com/erichchampion/ollama-code/blob/a6ec53910f51a174af1f2c4fb981760e5f53805f/ollama-code/src/ai/providers/local-fine-tuning.ts#L280)

Cancel a running job

#### Parameters

##### jobId

`string`

#### Returns

`Promise`\<`void`\>

***

### deployModel()

> **deployModel**(`name`, `modelPath`, `options`): `Promise`\<[`ModelDeployment`](../interfaces/ModelDeployment.md)\>

Defined in: [ai/providers/local-fine-tuning.ts:304](https://github.com/erichchampion/ollama-code/blob/a6ec53910f51a174af1f2c4fb981760e5f53805f/ollama-code/src/ai/providers/local-fine-tuning.ts#L304)

Deploy a fine-tuned model

#### Parameters

##### name

`string`

##### modelPath

`string`

##### options

###### port?

`number`

###### resources?

\{ `maxMemory?`: `number`; `maxCpu?`: `number`; `useGpu?`: `boolean`; \}

###### resources.maxMemory?

`number`

###### resources.maxCpu?

`number`

###### resources.useGpu?

`boolean`

#### Returns

`Promise`\<[`ModelDeployment`](../interfaces/ModelDeployment.md)\>

***

### listDatasets()

> **listDatasets**(): [`FineTuningDataset`](../interfaces/FineTuningDataset.md)[]

Defined in: [ai/providers/local-fine-tuning.ts:355](https://github.com/erichchampion/ollama-code/blob/a6ec53910f51a174af1f2c4fb981760e5f53805f/ollama-code/src/ai/providers/local-fine-tuning.ts#L355)

List all datasets

#### Returns

[`FineTuningDataset`](../interfaces/FineTuningDataset.md)[]

***

### listDeployments()

> **listDeployments**(): [`ModelDeployment`](../interfaces/ModelDeployment.md)[]

Defined in: [ai/providers/local-fine-tuning.ts:362](https://github.com/erichchampion/ollama-code/blob/a6ec53910f51a174af1f2c4fb981760e5f53805f/ollama-code/src/ai/providers/local-fine-tuning.ts#L362)

List all deployments

#### Returns

[`ModelDeployment`](../interfaces/ModelDeployment.md)[]

***

### getDeployment()

> **getDeployment**(`deploymentId`): `undefined` \| [`ModelDeployment`](../interfaces/ModelDeployment.md)

Defined in: [ai/providers/local-fine-tuning.ts:369](https://github.com/erichchampion/ollama-code/blob/a6ec53910f51a174af1f2c4fb981760e5f53805f/ollama-code/src/ai/providers/local-fine-tuning.ts#L369)

Get deployment status

#### Parameters

##### deploymentId

`string`

#### Returns

`undefined` \| [`ModelDeployment`](../interfaces/ModelDeployment.md)

***

### stopDeployment()

> **stopDeployment**(`deploymentId`): `Promise`\<`void`\>

Defined in: [ai/providers/local-fine-tuning.ts:376](https://github.com/erichchampion/ollama-code/blob/a6ec53910f51a174af1f2c4fb981760e5f53805f/ollama-code/src/ai/providers/local-fine-tuning.ts#L376)

Stop a model deployment

#### Parameters

##### deploymentId

`string`

#### Returns

`Promise`\<`void`\>

***

### cleanup()

> **cleanup**(): `Promise`\<`void`\>

Defined in: [ai/providers/local-fine-tuning.ts:390](https://github.com/erichchampion/ollama-code/blob/a6ec53910f51a174af1f2c4fb981760e5f53805f/ollama-code/src/ai/providers/local-fine-tuning.ts#L390)

Cleanup resources

#### Returns

`Promise`\<`void`\>
