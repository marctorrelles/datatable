/**
 * NOTE: GraphQL plugins only run in Node.js, so:
 * 1. We type in TypeScript, entry point under `plugin.ts`.
 * 2. When calling the plugin, we transform the TS files to JS files and run it.
 *
 * If we ever decide to build the codegen outside of this –i.e, as another package–, this mambo
 * jambo would be unnecessary.
 *
 * ¯\_(ツ)_/¯
 */

const { execSync } = require('child_process')

module.exports = {
  async plugin(schema, documents, config) {
    execSync(`
      mkdir -p tmp/datatable-codegen-plugin
      find datatable-codegen-plugin -name \\*.ts -exec cp -prv '{}' 'tmp/datatable-codegen-plugin' ';'
      npx tsc --esModuleInterop --target esnext --moduleResolution node tmp/datatable-codegen-plugin/plugin.ts
    `)

    const { plugin } = require('../tmp/datatable-codegen-plugin/plugin.js')

    return plugin(schema, documents, config)
  },
}
