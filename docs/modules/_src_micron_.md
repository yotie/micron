**[@yotie/micron](../README.md)**

> [Globals](../globals.md) / "src/micron"

# Module: "src/micron"

## Index

### Type aliases

* [ActionMap](_src_micron_.md#actionmap)
* [MatchActions](_src_micron_.md#matchactions)

### Variables

* [del](_src_micron_.md#del)
* [get](_src_micron_.md#get)
* [log](_src_micron_.md#log)
* [patch](_src_micron_.md#patch)
* [post](_src_micron_.md#post)
* [put](_src_micron_.md#put)

### Functions

* [isValidMethod](_src_micron_.md#isvalidmethod)
* [match](_src_micron_.md#match)
* [micron](_src_micron_.md#micron)
* [routeType](_src_micron_.md#routetype)

### Object literals

* [actionMap](_src_micron_.md#actionmap)

## Type aliases

### ActionMap

Ƭ  **ActionMap**: { [key:string]: Micron;  }

*Defined in [src/micron.ts:60](https://github.com/yotie/micron/blob/333f721/src/micron.ts#L60)*

___

### MatchActions

Ƭ  **MatchActions**: { [key:string]: MicronLambda;  }

*Defined in [src/micron.ts:55](https://github.com/yotie/micron/blob/333f721/src/micron.ts#L55)*

## Variables

### del

• `Const` **del**: Micron = routeType("DELETE")

*Defined in [src/micron.ts:69](https://github.com/yotie/micron/blob/333f721/src/micron.ts#L69)*

___

### get

• `Const` **get**: Micron = routeType("GET")

*Defined in [src/micron.ts:65](https://github.com/yotie/micron/blob/333f721/src/micron.ts#L65)*

___

### log

• `Const` **log**: Debugger = debug('micron\t')

*Defined in [src/micron.ts:6](https://github.com/yotie/micron/blob/333f721/src/micron.ts#L6)*

___

### patch

• `Const` **patch**: Micron = routeType("PATCH")

*Defined in [src/micron.ts:68](https://github.com/yotie/micron/blob/333f721/src/micron.ts#L68)*

___

### post

• `Const` **post**: Micron = routeType("POST")

*Defined in [src/micron.ts:67](https://github.com/yotie/micron/blob/333f721/src/micron.ts#L67)*

___

### put

• `Const` **put**: Micron = routeType("PUT")

*Defined in [src/micron.ts:66](https://github.com/yotie/micron/blob/333f721/src/micron.ts#L66)*

## Functions

### isValidMethod

▸ `Const`**isValidMethod**(`method`: string): boolean

*Defined in [src/micron.ts:41](https://github.com/yotie/micron/blob/333f721/src/micron.ts#L41)*

#### Parameters:

Name | Type | Default value |
------ | ------ | ------ |
`method` | string | "" |

**Returns:** boolean

___

### match

▸ `Const`**match**(`actions`: [MatchActions](_src_micron_.md#matchactions)): NowLambda

*Defined in [src/micron.ts:74](https://github.com/yotie/micron/blob/333f721/src/micron.ts#L74)*

#### Parameters:

Name | Type |
------ | ------ |
`actions` | [MatchActions](_src_micron_.md#matchactions) |

**Returns:** NowLambda

___

### micron

▸ `Const`**micron**(`fn`: MicronLambda): NowLambda

*Defined in [src/micron.ts:8](https://github.com/yotie/micron/blob/333f721/src/micron.ts#L8)*

#### Parameters:

Name | Type |
------ | ------ |
`fn` | MicronLambda |

**Returns:** NowLambda

___

### routeType

▸ `Const`**routeType**(`method`: string): Micron

*Defined in [src/micron.ts:45](https://github.com/yotie/micron/blob/333f721/src/micron.ts#L45)*

#### Parameters:

Name | Type |
------ | ------ |
`method` | string |

**Returns:** Micron

## Object literals

### actionMap

▪ `Const` **actionMap**: object

*Defined in [src/micron.ts:72](https://github.com/yotie/micron/blob/333f721/src/micron.ts#L72)*

#### Properties:

Name | Type | Value |
------ | ------ | ------ |
`del` | Micron | Micron |
`get` | Micron | Micron |
`patch` | Micron | Micron |
`post` | Micron | Micron |
`put` | Micron | Micron |
