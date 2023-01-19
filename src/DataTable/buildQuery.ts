import { DocumentNode } from 'graphql'
import { gql } from 'urql'
import { Projection } from '.'

const buildSubQuery = (operation: string, fields: string[]) => {
  // Should we care about insdentation?
  const subQuery = fields
    .slice()
    .reverse()
    .reduce((memo, field) => {
      if (memo === '') {
        return field
      }

      return `${field} {
      ${memo}
    }`
    }, '')

  return `${operation} {
  ${subQuery}
}`
}

export const buildQuery = <Operation extends string>(
  operation: Operation,
  projections: Projection[]
): DocumentNode => {
  const queryArray: string[] = []

  projections.forEach((projection) => {
    if ('fieldsArray' in projection.query) {
      projection.query.fieldsArray.forEach((fields) => {
        queryArray.push(buildSubQuery(operation, fields))
      })
    } else {
      queryArray.push(buildSubQuery(operation, projection.query.fields))
    }
  })

  // TODO: Change DataTableDynamicQuery to whatever?
  return gql`
  query DataTableDynamicQuery {
    ${queryArray.join(`
  `)}
  }
  `
}
