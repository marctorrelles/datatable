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

const IMPORTS = `import { ReactNode, useRef } from 'react'`

const STATIC_GENERATED_CODE = `
type AnyVariables = { [prop: string]: any } | void | undefined

type RemoveArrayAndNull<T> = T extends Array<any>
  ? NonNullable<T[number]>
  : NonNullable<T>

type RevealType<T extends string[], U> = T extends [infer First, ...infer Rest]
  ? Rest extends string[]
    ? First extends keyof U
      ? RevealType<Rest, RemoveArrayAndNull<U[First]>>
      : never
    : never
  : U | null | undefined // TODO: Is this null or undefined assumption always true?

export type DataTableData<T> = {
  getVariables: (args: any) => AnyVariables
  query: any
  projections: Projection<T>[]
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

type ProjectionBuiler<T> = (
  args: ProjectionArgs<T, (keyof T)[]>
) => typeof args

export type Projection<T> = ReturnType<ProjectionBuiler<T>>

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
  return `const ${visitor.documentName} = gql\`
${print(JSON.parse(node))}
\``
}

function buildQueryIncludes(visitor: TypeScriptDocumentNodesVisitor) {
  return `const ${visitor.queryName}Includes = [${visitor.dataFields.map(
    ({ field }) => `\n  '${visitor.generateIncludeName(field)}'`
  )},
] as const`
}

const buildMainType = (visitor: TypeScriptDocumentNodesVisitor) => {
  const generic = visitor.dataSource.fullPath.reduce((prev, current) => {
    const currentString = `['${current}']`

    if (prev.length) {
      return `RemoveArrayAndNull<${prev}>${currentString}`
    }

    return `${visitor.queryName}Query${currentString}`
  }, '')
  return `type ${visitor.queryName}MainType = RemoveArrayAndNull<
  ${generic}
>`
}

const buildFields = (visitor: TypeScriptDocumentNodesVisitor) => {
  return `interface ${visitor.queryName}Fields {
  ${visitor.dataFields
    .map((field) => {
      return `${field.id}: RevealType<[${visitor
        .getDataFieldPath(field.id)
        .map((field) => `'${field}'`)
        .join(', ')}], ${visitor.queryName}MainType>`
    })
    .join('\n  ')}
}`
}

const buildProjection = (visitor: TypeScriptDocumentNodesVisitor) => {
  return `export const ${visitor.dataSource.field.name.value}Projection = <F extends (keyof ${visitor.queryName}Fields)[]>(
  args: ProjectionArgs<${visitor.queryName}Fields, F>
) => projection<${visitor.queryName}Fields>(args)`
}

const buildFieldsResolvers = (visitor: TypeScriptDocumentNodesVisitor) => {
  const mainArg = `NonNullable<${
    visitor.queryName
  }Query[${visitor.dataSource.fullPath
    .map((f) => `'${f}'`)
    .join(', ')}]>[number]`

  return `const EmployeesDataTableFieldsResolvers = {
  main: (data: ${
    visitor.queryName
  }Query) => data.${visitor.dataSource.fullPath.join('.')},
  fields: {
${visitor.dataFields
  .map(({ id }) => {
    return `    ${id}: (
      main: ${mainArg}
    ) => main.${visitor.getDataFieldPath(id).join('?.')},`
  })
  .join('\n')}
  }
}`
}

const buildHook = (visitor: TypeScriptDocumentNodesVisitor) => {
  return `export function use${visitor.queryName}(
  projections: Projection<${visitor.queryName}Fields>[]
): DataTableData<${visitor.queryName}Fields> {
  const get${visitor.queryName}Variables = useRef(
    (projections: Array<Projection<${visitor.queryName}Fields>>) => (
      getVariables<${visitor.queryName}Fields>(${visitor.queryName}Includes, projections)
    )
  ).current

  return {
    query: ${visitor.queryName}Document,
    getVariables: get${visitor.queryName}Variables,
    projections,
    resolvers: ${visitor.queryName}FieldsResolvers,
  }
}`
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
      buildMainType(visitor),
      buildFields(visitor),
      buildFieldsResolvers(visitor),
      buildProjection(visitor),
      buildHook(visitor),
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
