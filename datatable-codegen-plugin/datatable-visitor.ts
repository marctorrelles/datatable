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
import {
  ASTNode,
  DirectiveNode,
  DocumentNode,
  FieldNode,
  GraphQLSchema,
  Kind,
  OperationDefinitionNode,
  SelectionNode,
  SelectionSetNode,
  VariableDefinitionNode,
} from 'graphql'
import fs from 'fs'

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
  document: Types.DocumentFile

  constructor(schema: GraphQLSchema, document: Types.DocumentFile) {
    super(
      schema,
      [],
      {
        documentMode: DocumentMode.documentNodeImportFragments,
        documentNodeImport:
          '@graphql-typed-document-node/core#TypedDocumentNode',
      },
      {},
      [document]
    )

    autoBind(this)
    this.document = document
    this.validateQuery()
  }

  public OperationDefinition(node: OperationDefinitionNode) {
    const newNode: OperationDefinitionNode = {
      ...node,
      variableDefinitions: [
        ...(node.variableDefinitions?.map((el) => el) ?? []),
        ...this.dataFields.map(({ field }) => {
          return {
            kind: Kind.VARIABLE_DEFINITION,
            variable: {
              kind: Kind.VARIABLE,
              name: {
                kind: Kind.NAME,
                value: this.generateIncludeName(field),
              },
            },
            type: {
              kind: Kind.NON_NULL_TYPE,
              type: {
                kind: Kind.NAMED_TYPE,
                name: {
                  kind: Kind.NAME,
                  value: 'Boolean',
                },
              },
            },
          } as VariableDefinitionNode
        }),
      ],
    }
    return JSON.stringify(newNode)
  }

  public SelectionSet(
    node: ASTNode,
    _key: string | number | undefined,
    _parent: ASTNode | ASTNode[] | undefined
  ) {
    if (node.kind !== Kind.SELECTION_SET) return

    const newSelections = node.selections.map((selection) => {
      let newSelection = selection

      newSelection = this.transformDataFieldDirective(selection)
      newSelection = this.removeDataSourceDirective(newSelection)

      return newSelection
    })

    return {
      ...node,
      selections: newSelections,
    }
  }

  get queryName() {
    return (
      (this.document.document?.definitions[0] as OperationDefinitionNode).name
        ?.value ?? ''
    )
  }

  get documentName() {
    return this.queryName.concat('Document')
  }

  public generateIncludeName = ({ name }: FieldNode) => {
    return `include${name.value[0].toUpperCase()}${name.value.slice(1)}`
  }

  private validateQuery = () => {
    if ((this.document.document?.definitions || []).length > 1) {
      throw new Error('DataTable queries only accept a single query')
    }

    if (this.document.document?.definitions[0].kind !== 'OperationDefinition') {
      throw new Error('Only OperationDefinition are accepted in DataTables')
    }

    if (!this.document.document?.definitions[0].name) {
      throw new Error('Please, provide a name for your Query')
    }
  }

  private transformDataFieldDirective = (
    selection: SelectionNode
  ): SelectionNode => {
    if (!selection.directives) return selection

    const directive = selection.directives.find(
      (directive) => directive.name.value === 'dataField'
    )

    if (!directive) return selection

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

    const newDirective: DirectiveNode = {
      ...directive,
      name: {
        ...directive.name,
        value: 'include',
      },
      arguments: [
        {
          kind: Kind.ARGUMENT,
          name: {
            kind: Kind.NAME,
            value: 'if',
          },
          value: {
            kind: Kind.VARIABLE,
            name: {
              kind: Kind.NAME,
              value: this.generateIncludeName(selection),
            },
          },
        },
      ],
    }

    return {
      ...selection,
      directives: [
        ...selection.directives.filter((d) => d.name.value !== 'dataField'),
        newDirective,
      ],
    }
  }

  private removeDataSourceDirective = (selection: SelectionNode) => {
    if (!selection.directives) return selection

    const directive = selection.directives.find(
      (directive) => directive.name.value === 'dataSource'
    )

    if (!directive) return selection

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

    return {
      ...selection,
      directives: selection.directives.filter(
        (d) => d.name.value !== 'dataSource'
      ),
    }
  }
}
