import minimatch from 'minimatch'
import { TsVisitor } from '@graphql-codegen/typescript'
import {
  oldVisit,
  PluginFunction,
  Types,
} from '@graphql-codegen/plugin-helpers'
import { transformSchemaAST } from '@graphql-codegen/schema-ast'
import { GraphQLSchema } from 'graphql'
import { CodegenPlugin } from '@graphql-codegen/plugin-helpers'

const STATIC_GENERATED_CODE = `
import gql from 'graphql-tag'
import { ReactNode, useMemo, useState } from 'react'

/**
 * Generic types and utils here
 */
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
}
export type AnyVariables =
  | {
      [prop: string]: any
    }
  | void
  | undefined

export type DataTableData<T> = {
  variables: AnyVariables
  query: any
  initialProjections: Projection<T>[]
  projections: Projection<T>[]
  setProjections: (projections: Projection<T>[]) => void
  resolvers: {
    main: (data: any) => any
    fields: Exact<Record<keyof T, (data: any) => any>>
  }
}

interface ProjectionArgs<T, F extends (keyof T)[]> {
  title: string
  visible?: boolean
  fields: F
  render?: (object: Pick<T, F[number]>) => ReactNode
}

function projection<T>(args: ProjectionArgs<T, (keyof T)[]>) {
  return args
}

export type ProjectionBuiler<T> = (
  args: ProjectionArgs<T, (keyof T)[]>
) => typeof args

export type Projection<T> = ReturnType<ProjectionBuiler<T>>

export type DataTableConfig<T> = {
  projections: Projection<T>[]
  data: DataTableData<T>
}

const getVariables = <T>(
  queryIncludesArray: string[] | readonly string[],
  projections: Projection<T>[]
) => {
  const variablesObject = [...queryIncludesArray].reduce(
    (memo, key) => ({
      ...memo,
      [key]: false,
    }),
    {}
  ) as any

  projections.forEach((projection) => {
    projection.fields.forEach((field) => {
      const key = \`include\${(field as string)[0].toUpperCase()}\${(
        field as string
      ).slice(1)}\` as keyof typeof variablesObject
      variablesObject[key] = true
    })
  })

  return variablesObject
}
`

const getSchema = (schema: GraphQLSchema, config: any) => {
  const { schema: _schema, ast } = transformSchemaAST(schema, config)
  const visitor = new TsVisitor(_schema, config)
  const visitorResult = oldVisit(ast, { leave: visitor as any })
  return visitorResult.definitions.filter(Boolean).join('\n')
}

export const plugin: PluginFunction = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: any
) => {
  const docsInfo = documents
    .map((doc) => {
      return JSON.stringify(doc.document)
    })
    .join('\n')

  const generatedCode = [
    JSON.stringify(docsInfo, null, 4),
    getSchema(schema, config),
  ]
    .filter(Boolean)
    .join('\n\n')

  return [STATIC_GENERATED_CODE, generatedCode].join(
    '\n\n// This is the autogenerated part!\n'
  )
}
