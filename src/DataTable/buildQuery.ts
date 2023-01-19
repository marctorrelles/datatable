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

  projections.map((projection) => {
    const { fields, operation } = projection.query
    if (Array.isArray(fields.at(0))) {
      // string[][]
      fields.map((field) => {
        queryArray.push(buildSubQuery(operation, field as string[]))
      })
    } else {
      queryArray.push(buildSubQuery(operation, fields as string[]))
    }
  })

  console.log(
    queryArray.join(`
  `)
  )

  // TODO: Change DataTableDynamicQuery to whatever?
  return gql`
  query DataTableDynamicQuery {
    ${queryArray.join(`
  `)}
  }
  `
}
