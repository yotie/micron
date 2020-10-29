**[@yotie/micron](../README.md)**

> [Globals](../globals.md) / "src/createLambda"

# Module: "src/createLambda"

## Index

### Interfaces

* [MicronMiddleware](../interfaces/_src_createlambda_.micronmiddleware.md)

### Type aliases

* [LambdaOptions](_src_createlambda_.md#lambdaoptions)

### Variables

* [log](_src_createlambda_.md#log)

### Functions

* [compose](_src_createlambda_.md#compose)
* [createLambda](_src_createlambda_.md#createlambda)
* [intro](_src_createlambda_.md#intro)

## Type aliases

### LambdaOptions

Ƭ  **LambdaOptions**: { cors?: CorsOptions ; middlewares?: [MicronMiddleware](../interfaces/_src_createlambda_.micronmiddleware.md)[]  }

*Defined in [src/createLambda.ts:31](https://github.com/yotie/micron/blob/333f721/src/createLambda.ts#L31)*

#### Type declaration:

Name | Type |
------ | ------ |
`cors?` | CorsOptions |
`middlewares?` | [MicronMiddleware](../interfaces/_src_createlambda_.micronmiddleware.md)[] |

## Variables

### log

• `Const` **log**: Debugger = debug('micron:createLambda')

*Defined in [src/createLambda.ts:7](https://github.com/yotie/micron/blob/333f721/src/createLambda.ts#L7)*

## Functions

### compose

▸ `Const`**compose**(...`fns`: any[]): any

*Defined in [src/createLambda.ts:12](https://github.com/yotie/micron/blob/333f721/src/createLambda.ts#L12)*

#### Parameters:

Name | Type |
------ | ------ |
`...fns` | any[] |

**Returns:** any

___

### createLambda

▸ **createLambda**(`service`: NowLambda, `opts`: [LambdaOptions](_src_createlambda_.md#lambdaoptions)): NowLambda

*Defined in [src/createLambda.ts:36](https://github.com/yotie/micron/blob/333f721/src/createLambda.ts#L36)*

#### Parameters:

Name | Type | Default value |
------ | ------ | ------ |
`service` | NowLambda | - |
`opts` | [LambdaOptions](_src_createlambda_.md#lambdaoptions) | {} |

**Returns:** NowLambda

___

### intro

▸ `Const`**intro**(`fn`: NowLambda): (Anonymous function)

*Defined in [src/createLambda.ts:20](https://github.com/yotie/micron/blob/333f721/src/createLambda.ts#L20)*

#### Parameters:

Name | Type |
------ | ------ |
`fn` | NowLambda |

**Returns:** (Anonymous function)
