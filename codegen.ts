import type { CodegenConfig } from '@graphql-codegen/cli'

const resourcesSchema = 'api/schema.faker.graphql'
const resourcesDocuments = ['**/*.graphql', '!**/*.datatable.graphql']
const dataTableResourcesDocuments = ['**/*.datatable.graphql']

const resourcesNamingConvention = {
  avoidOptionals: true,
  transformUnderscore: true,
  enumValues: 'upper-case#upperCase',
  typenames: 'pascal-case#pascalCase',
  addTypename: true,
  nonOptionalTypename: true,
  strictScalars: true,
}

const config: CodegenConfig = {
  ignoreNoDocuments: true,
  schema: resourcesSchema,
  generates: {
    'src/generated/': {
      documents: resourcesDocuments,
      preset: 'client',
      plugins: [],
      config: {
        namingConvention: resourcesNamingConvention,
        useTypeImports: true,
        strictScalars: true,
        arrayInputCoercion: false,
      },
    },
    'src/generated/resources-introspection.json': {
      plugins: ['urql-introspection'],
      config: {
        includeScalars: true,
      },
    },
    './src/generated/datatable.graphql.ts': {
      documents: dataTableResourcesDocuments,
      plugins: ['datatable-codegen-plugin/index.js'],
    },
  },
}

export default config
