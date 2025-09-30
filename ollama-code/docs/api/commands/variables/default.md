[**Ollama Code API Documentation v0.1.0**](../../README.md)

***

[Ollama Code API Documentation](../../modules.md) / [commands](../README.md) / default

# Variable: default

> **default**: `object`

Defined in: [commands/index.ts:621](https://github.com/erichchampion/ollama-code/blob/5f12b416589e9f978f73e54f8bfc9efaaaa273d1/ollama-code/src/commands/index.ts#L621)

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
