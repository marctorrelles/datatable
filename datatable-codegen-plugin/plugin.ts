import {
  oldVisit,
  PluginFunction,
  Types,
} from '@graphql-codegen/plugin-helpers'
import { plugin as pluginTypeScript } from '@graphql-codegen/typescript'
import { plugin as pluginOperations } from '@graphql-codegen/typescript-operations'
import { ClientSideBaseVisitor } from '@graphql-codegen/visitor-plugin-common'
import { concatAST, DocumentNode, GraphQLSchema, print } from 'graphql'
import { TypeScriptDocumentNodesVisitor } from './datatable-visitor'

const IMPORTS = `
import { ReactNode, useMemo, useState } from 'react'
import type { DocumentNode } from 'graphql'
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

const visitorPrepend = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[]
) => {
  const allAst = concatAST(documents.map((v) => v.document as DocumentNode))
  const visitor = new ClientSideBaseVisitor(
    schema,
    [],
    {},
    {},
    documents.map((d) => d.document as Types.DocumentFile)
  )
  return allAst.definitions.length === 0 ? [] : visitor.getImports()
}

// TODO: Check if there's a proper way of doing this? 🤯
const buildQuery = (
  visitor: TypeScriptDocumentNodesVisitor,
  visitorNode: any,
  document: Types.DocumentFile
) => {
  if (!document.document) return null

  const definition = visitorNode.definitions[0]
  const node = definition.slice(
    definition.indexOf('{'),
    definition.lastIndexOf('}') + 1
  )
  return `export const ${visitor.documentName} = gql\`
${print(JSON.parse(node))}
\``
}

function buildQueryIncludes(visitor: TypeScriptDocumentNodesVisitor) {
  return `export const ${visitor.queryName}Includes = [${visitor.dataFields.map(
    ({ field }) => `\n  '${visitor.generateIncludeName(field)}'`
  )},
] as const`
}

const buildqueryVariablesType = (visitor: TypeScriptDocumentNodesVisitor) => {
  return `export type ${visitor.queryName}Variables = Exact<{
  [key in (typeof ${visitor.queryName}Includes)[number]]: boolean
}>`
}

const generateContent = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[]
) => {
  return documents.map((document) => {
    if (!document.document) return null

    // Doing the visitor thingie here for performance, even it could be done on each method
    const visitor = new TypeScriptDocumentNodesVisitor(schema, document)

    const visitorNode = oldVisit(document.document, {
      leave: visitor as any,
    })

    return [
      buildQuery(visitor, visitorNode, document),
      buildQueryIncludes(visitor),
      buildqueryVariablesType(visitor),
    ]
      .filter(Boolean)
      .join('\n\n')
  })
}

export const plugin: PluginFunction = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  _config: any
) => {
  const typeScript = await pluginTypeScript(schema, documents, {})
  const operations = await pluginOperations(schema, documents, {})

  const { prepend: prependTypeScript, content: contentTypeScript } =
    typeof typeScript === 'string' ? { prepend: '', content: null } : typeScript

  const { prepend: prependOperations, content: contentOperations } =
    typeof operations === 'string' ? { prepend: '', content: null } : operations

  const customContent = generateContent(schema, documents)

  // TODO: Add support for fragments?

  return {
    prepend: [
      IMPORTS,
      ...normalizePrepend(prependTypeScript),
      ...normalizePrepend(prependOperations),
      ...visitorPrepend(schema, documents),
    ],
    content: [
      STATIC_GENERATED_CODE,
      contentTypeScript,
      contentOperations,
      ...customContent,
    ]
      .filter(Boolean)
      .join('\n'),
  }
}
