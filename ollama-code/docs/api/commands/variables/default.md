[**Ollama Code API Documentation v0.1.0**](../../README.md)

***

[Ollama Code API Documentation](../../modules.md) / [commands](../README.md) / default

# Variable: default

> **default**: `object`

Defined in: [commands/index.ts:621](https://github.com/erichchampion/ollama-code/blob/affe7d5f274db61281678933960f6b13bf0d7a5f/ollama-code/src/commands/index.ts#L621)

## Type Declaration

### commandRegistry

> **commandRegistry**: `CommandRegistry`

### parseArgs()

> **parseArgs**: (`args`, `command`) => `Record`\<`string`, `any`\>

Parse command-line arguments

#### Parameters

##### args

`string`[]

##### command

[`CommandDef`](../interfaces/CommandDef.md)

#### Returns

`Record`\<`string`, `any`\>

### executeCommand()

> **executeCommand**: (`commandName`, `args`) => `Promise`\<`any`\>

Execute a command

#### Parameters

##### commandName

`string`

##### args

`string`[]

#### Returns

`Promise`\<`any`\>

### generateCommandHelp()

> **generateCommandHelp**: (`command`) => `string`

Generate help text for a command

#### Parameters

##### command

[`CommandDef`](../interfaces/CommandDef.md)

#### Returns

`string`
