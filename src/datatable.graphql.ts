import { ReactNode, useMemo } from 'react'
import { AnyVariables, gql } from 'urql'
import { Employee, Exact, Maybe, Scalars } from './graphql'

/**
 * Generic types and utils here
 */
export type DataTableData = {
  variables: AnyVariables
  query: any
  projections: Projection[]
  resolvers: {
    main: (data: any) => any
    fields: {
      [key: string]: (data: any) => any
    }
  }
}

// TODO: This should be typed properly!
export type Projection = {
  title: string
  visible?: boolean // default: true
} & (
  | {
      field: keyof EmployeesDataTableFields // TODO: generic typing
      render?: (value: any) => ReactNode
    }
  | {
      fields: Array<keyof EmployeesDataTableFields> // TODO: generic typing
      render: (...value: any[]) => ReactNode
    }
)

export type DataTableConfig = {
  projections: Projection[]
  data: DataTableData
}

const getVariables = (
  queryIncludesArray: string[] | readonly string[],
  projections: Projection[]
) => {
  const variablesObject = [...queryIncludesArray].reduce(
    (memo, key) => ({
      ...memo,
      [key]: false,
    }),
    {}
  ) as EmployeesDataTableQueryVariables

  projections.forEach((projection) => {
    if ('fields' in projection) {
      projection.fields.forEach((field) => {
        const key = `include${field[0].toUpperCase()}${field.slice(
          1
        )}` as keyof typeof variablesObject
        variablesObject[key] = true
      })
    } else {
      const key =
        `include${projection.field[0].toUpperCase()}${projection.field.slice(
          1
        )}` as keyof typeof variablesObject
      variablesObject[key] = true
    }
  })

  return variablesObject
}

/**
 * Generated specifics for tables here
 */
export type EmployeesDataTableQuery = {
  __typename?: 'Query'
  employees?: Array<{
    __typename?: 'Employee'
    access?: {
      __typename?: 'Access'
      email?: string | null
      firstName?: string | null
      lastName?: string | null
    } | null
    company?: { __typename?: 'Company'; name?: string | null } | null
    subordinates?: Array<{
      __typename?: 'Employee'
      access?: {
        __typename?: 'Access'
        firstName?: string | null
        lastName?: string | null
      } | null
    }> | null
    job?: { __typename?: 'Job'; name?: string | null } | null
  }> | null
}

export const EmployeesDataTableDocument = gql`
  query EmployeesDataTable(
    $includeFirstName: Boolean!
    $includeLastName: Boolean!
    $includeEmail: Boolean!
    $includeCompanyName: Boolean!
    $includeSubordinates: Boolean!
    $includeJobName: Boolean!
  ) {
    employees {
      access @include(if: $includeFirstName) {
        firstName
      }
      access @include(if: $includeLastName) {
        lastName
      }
      access @include(if: $includeEmail) {
        email
      }
      company @include(if: $includeCompanyName) {
        name
      }
      subordinates @include(if: $includeSubordinates) {
        access {
          firstName
          lastName
        }
      }
      job @include(if: $includeJobName) {
        name
      }
    }
  }
`

export const EmployeesDataTableQueryIncludes = [
  'includeFirstName',
  'includeLastName',
  'includeEmail',
  'includeCompanyName',
  'includeSubordinates',
  'includeJobName',
] as const

export type EmployeesDataTableQueryVariables = Exact<{
  [key in (typeof EmployeesDataTableQueryIncludes)[number]]: boolean
}>

export type EmployeesDataTableFields = {
  firstName: Maybe<Scalars['String']>
  lastName: Maybe<Scalars['String']>
  email: Maybe<Scalars['String']>
  companyName: Maybe<Scalars['String']>
  subordinates: Maybe<Array<Employee>>
  jobName: Maybe<Scalars['String']>
}

export const EmployeesDataTableFieldsResolvers = {
  main: (data: EmployeesDataTableQuery) => data.employees, // This gives us the amount of rows
  fields: {
    firstName: (
      main: NonNullable<EmployeesDataTableQuery['employees']>[number]
    ) => main.access?.firstName,
    lastName: (
      main: NonNullable<EmployeesDataTableQuery['employees']>[number]
    ) => main.access?.lastName,
    email: (main: NonNullable<EmployeesDataTableQuery['employees']>[number]) =>
      main.access?.email,
    companyName: (
      main: NonNullable<EmployeesDataTableQuery['employees']>[number]
    ) => main.company?.name,
    subordinates: (
      main: NonNullable<EmployeesDataTableQuery['employees']>[number]
    ) => main.subordinates,
    jobName: (
      main: NonNullable<EmployeesDataTableQuery['employees']>[number]
    ) => main.job?.name,
  },
}

export function useEmployeesDataTable(
  projections: Projection[]
): DataTableData {
  const variables = useMemo(
    () => getVariables(EmployeesDataTableQueryIncludes, projections),
    [projections]
  )

  return {
    query: EmployeesDataTableDocument,
    variables,
    projections,
    resolvers: EmployeesDataTableFieldsResolvers,
  }
}
