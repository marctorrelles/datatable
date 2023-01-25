const minimatch = require('minimatch')

let DATATABLE_FILE_PATTERNS = ['**/*.datatable.graphql']

module.exports = {
  plugin(schema, documents, config) {
    if (config.documents) {
      DATATABLE_FILE_PATTERNS = Array.isArray(config.documents)
        ? config.documents
        : [config.documents]
    }

    return documents
      .filter((doc) => {
        return DATATABLE_FILE_PATTERNS.some((pattern) =>
          minimatch(doc.location, pattern)
        )
      })
      .map((doc) => {
        console.log(config)
        const docsNames = doc.document.definitions.map((def) => def.name.value)

        // return `File ${doc.location} contains: ${docsNames.join(', ')}`
        return ''
      })
      .join('\n')
  },
}
