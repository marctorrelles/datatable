import { ReactNode } from 'react'
import { DataTableData, Projection } from '../datatable.graphql'

export default function getFieldsForColumns(
  projections: Projection[],
  data: any,
  resolvers: DataTableData['resolvers']
): ReactNode[][] {
  const main = resolvers.main(data)
  const resolvedData: ReactNode[][] = []

  main.forEach((item: any) => {
    const fields = projections.map((projection) => {
      if ('fields' in projection) {
        const fields = projection.fields.map((field) => {
          return resolvers.fields[field](item)
        })

        return projection.render(...fields)
      } else {
        const field = resolvers.fields[projection.field](item)

        if (projection.render) {
          return projection.render(field)
        }
        return field
      }
    })

    resolvedData.push(fields)
  })

  return resolvedData
}
