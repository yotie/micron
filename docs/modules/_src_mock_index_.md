**[@yotie/micron](../README.md)**

> [Globals](../globals.md) / "src/mock/index"

# Module: "src/mock/index"

## Index

### Type aliases

* [MockLambda](_src_mock_index_.md#mocklambda)

### Functions

* [mockLambda](_src_mock_index_.md#mocklambda)

## Type aliases

### MockLambda

Ƭ  **MockLambda**: { shutdown: Function ; url: string ; fetch: (_path?: string \| RequestInit,opts?: RequestInit) => Promise\<Response>  }

*Defined in [src/mock/index.ts:7](https://github.com/yotie/micron/blob/333f721/src/mock/index.ts#L7)*

#### Type declaration:

Name | Type |
------ | ------ |
`shutdown` | Function |
`url` | string |
`fetch` | (_path?: string \| RequestInit,opts?: RequestInit) => Promise\<Response> |

## Functions

### mockLambda

▸ `Const`**mockLambda**(`fn`: RequestListener): Promise\<[MockLambda](_src_mock_index_.md#mocklambda)>

*Defined in [src/mock/index.ts:13](https://github.com/yotie/micron/blob/333f721/src/mock/index.ts#L13)*

#### Parameters:

Name | Type |
------ | ------ |
`fn` | RequestListener |

**Returns:** Promise\<[MockLambda](_src_mock_index_.md#mocklambda)>
