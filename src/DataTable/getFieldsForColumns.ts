import { ReactNode } from 'react'
import { DataTableData, Projection } from '../datatable.graphql'

export default function getFieldsForColumns<T>(
  projections: Projection<T>[],
  data: any,
  resolvers: DataTableData<T>['resolvers']
): ReactNode[][] {
  const main = resolvers.main(data)
  const resolvedData: ReactNode[][] = []

  main.forEach((item: any) => {
    const fields = projections.map((projection) => {
      const fields = projection.fields.reduce(
        (memo, field) => ({
          ...memo,
          [field]: resolvers.fields[field](item),
        }),
        {}
      )

      if (projection.render) {
        return projection.render({ ...fields } as Pick<T, keyof T>)
      }

      return Object.values(fields).join(', ')
    })

    resolvedData.push(fields)
  })

  return resolvedData
}
