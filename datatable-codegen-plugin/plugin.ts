import {
  oldVisit,
  PluginFunction,
  Types,
} from '@graphql-codegen/plugin-helpers'
import { plugin as pluginTypeScript } from '@graphql-codegen/typescript'
import { plugin as pluginOperations } from '@graphql-codegen/typescript-operations'
import { concatAST, DocumentNode, GraphQLSchema } from 'graphql'
import { TypeScriptDocumentNodesVisitor } from './datatable-visitor'

const IMPORTS = `
import gql from 'graphql-tag'
import { ReactNode, useMemo, useState } from 'react'
`

const STATIC_GENERATED_CODE = `
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

const normalizePrepend = (prependContent: string | string[] | undefined) => {
  if (!prependContent) return []
  if (Array.isArray(prependContent)) return prependContent
  return [prependContent]
}

export const plugin: PluginFunction = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: any
) => {
  const typeScript = await pluginTypeScript(schema, documents, config)
  const operations = await pluginOperations(schema, documents, config)

  const { prepend: prependTypeScript, content: contentTypeScript } =
    typeof typeScript === 'string' ? { prepend: '', content: null } : typeScript

  const { prepend: prependOperations, content: contentOperations } =
    typeof operations === 'string' ? { prepend: '', content: null } : operations

  // Start visitor!
  // get gql`myQuery` and change it
  // TODO: Iterate through documents so the output is clearer
  const allAst = concatAST(documents.map((v) => v.document as DocumentNode))
  const visitorPrepend =
    allAst.definitions.length === 0 ? [] : new TypeScriptDocumentNodesVisitor(schema, documents).getImports()

  const definitions = documents.map(({document}) => {
    if (!document) return null

    const visitorResult = oldVisit(concatAST([document]), { leave: visitor as any })
    const visitorDefinitions = visitorResult.definitions
      .filter((t) => typeof t === 'string')
      .join('\n')

    const visitor = new TypeScriptDocumentNodesVisitor(schema, documents)

    return [
      visitorDefinitions,
      visitor.getIncludedArrays()
    ].join('\n')
  }).filter(Boolean)

  // TODO: Add support for fragments?

  // End visitor!

  return {
    prepend: [
      IMPORTS,
      ...normalizePrepend(prependTypeScript),
      ...normalizePrepend(prependOperations),
      ...visitorPrepend,
    ],
    content: [
      STATIC_GENERATED_CODE,
      contentTypeScript,
      contentOperations,
      definitions,
      definitions.map(def => def.getIncludedArrays()).join(\n),
    ]
      .filter(Boolean)
      .join('\n'),
  }
}
