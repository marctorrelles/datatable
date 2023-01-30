/**
 * Dear dev,
 * This code is copy/pasted from here: https://github.com/dotansimha/graphql-code-generator/blob/master/packages/plugins/typescript/typed-document-node/src/visitor.ts.
 * It has some pecularities, though:
 *
 * ~ `@dataSource` directive
 *
 * This directive is the one indicating where on the tree the table needs to start iterating its
 * rows.
 * If more than one directive is found, the codegen exits with an error.
 * Once the directive is found, its location is set as an output as "dataSource".
 *
 * ~ `@dataField(id: String)` directive
 *
 * This directive is in charge of registering the different "fields" of the table. Each field is a
 * column that can be queried and added to the table.
 * Once a directive is found, its location is added to the "fields" output.
 *
 */
import { Types } from '@graphql-codegen/plugin-helpers'
import {
  ClientSideBasePluginConfig,
  ClientSideBaseVisitor,
  DocumentMode,
  RawClientSideBasePluginConfig,
} from '@graphql-codegen/visitor-plugin-common'
import autoBind from 'auto-bind'
import { FieldNode, GraphQLSchema, SelectionNode } from 'graphql'

interface TypeScriptDocumentNodesVisitorPluginConfig
  extends RawClientSideBasePluginConfig {
  addTypenameToSelectionSets?: boolean
}

type DataSource = SelectionNode

type DataField = {
  id: string
  field: FieldNode
}

export class TypeScriptDocumentNodesVisitor extends ClientSideBaseVisitor<
  TypeScriptDocumentNodesVisitorPluginConfig,
  ClientSideBasePluginConfig
> {
  dataSource: DataSource
  dataFields: DataField[] = []

  constructor(
    schema: GraphQLSchema,
    documents: Types.DocumentFile[]
  ) {
    super(
      schema,
      [],
      {
        documentMode: DocumentMode.documentNodeImportFragments,
        documentNodeImport:
          '@graphql-typed-document-node/core#TypedDocumentNode',
      },
      {},
      documents
    )

    autoBind(this)
  }

  public SelectionSet(node, _, parent) {
    // No changes if no selections.
    const { selections } = node
    if (!selections) {
      return
    }

    // TODO: Maybe add some comments?
    const newSelections = node.selections.map((selection: SelectionNode) => {
      if (!selection.directives?.length) return selection

      let newDirectives = selection.directives

      const directive = selection.directives.find(
        (directive) => directive.name.value === 'dataField' || 'dataSource'
      )

      if (!directive) return selection

      if (directive.name.value === 'dataField') {
        if (selection.kind !== 'Field') {
          throw new Error('Directive @dataField can only be applied to Fields')
        }

        const idArgument = directive.arguments?.find((arg) => {
          return arg.name.value === 'id'
        })

        if (!idArgument || idArgument.value.kind !== 'StringValue') {
          throw new Error(
            `SelectionNode ${selection.name} with directive @dataField needs a String argument called id`
          )
        }

        this.dataFields.push({
          id: idArgument.value.value,
          field: selection,
        })

        // @ts-ignore
        directive.name.value = this.generateIncludeName(selection)
        // @ts-ignore
        directive.arguments = []
      } else if (directive.name.value === 'dataSource') {
        if (selection.kind !== 'Field') {
          throw new Error('Directive @dataSource can only be applied to Fields')
        }

        if (!this.dataSource) {
          this.dataSource = selection
        } else {
          throw new Error(
            'You cannot have more than one @dataSource directive in the same query'
          )
        }

        newDirectives = selection.directives.filter((directive) => {
          return directive.name.value !== 'dataSource'
        })
      }

      return {
        ...selection,
        directives: newDirectives,
      }
    })

    return {
      ...node,
      selections: newSelections,
    }
  }

  protected generateIncludeName = ({ name }: FieldNode) => {
    return `include${name.value[0].toUpperCase()}${name.value.slice(1)}`
  }

  public getIncludedArrays = () => {
    const values = this.dataFields.map((f) => this.generateIncludeName(f.field))
    console.log(this._documents[0].document?.definitions)
    return `
${this.dataFields.map((f) => f.id)}
    `
  }
}
