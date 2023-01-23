import { DocumentNode } from 'graphql'
import { useMemo } from 'react'
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

export const useBuildQuery = <Operation extends string>(
  operation: Operation,
  projections: Projection[]
): DocumentNode => {
  return useMemo(
    () => gql`
    query DataTableDynamicQuery {
      ${projections.map((projection) => {
        if ('fieldsArray' in projection.query) {
          return projection.query.fieldsArray
            .map((fields) => buildSubQuery(operation, fields))
            .join('\n')
        }

        return buildSubQuery(operation, projection.query.fields)
      }).join(`
    `)}
    }
  `,
    [operation, projections]
  )
}
