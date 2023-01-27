import { ReactNode, useMemo, useState } from 'react'
import { AnyVariables, gql } from 'urql'
import { Employee, Exact, Maybe, Scalars } from './graphql'

/**
 * Generic types and utils here
 */
export type DataTableData<T> = {
  variables: AnyVariables
  query: any
  projections: Projection<T>[]
  visibleProjections: Projection<T>[]
  setProjections: (projections: Projection<T>[]) => void
  resolvers: {
    main: (data: any) => any
    fields: Exact<Record<keyof T, (data: any) => any>>
  }
}

interface ProjectionArgs<T, F extends (keyof T)[]> {
  title: string
  visible?: boolean
  fields: F
  render?: (object: Pick<T, F[number]>) => ReactNode
}

function projection<T>(args: ProjectionArgs<T, (keyof T)[]>) {
  return args
}

export type ProjectionBuiler<T> = (
  args: ProjectionArgs<T, (keyof T)[]>
) => typeof args

export type Projection<T> = ReturnType<ProjectionBuiler<T>>

export type DataTableConfig<T> = {
  projections: Projection<T>[]
  data: DataTableData<T>
}

const getVariables = <T>(
  queryIncludesArray: string[] | readonly string[],
  projections: Projection<T>[]
) => {
  const variablesObject = [...queryIncludesArray].reduce(
    (memo, key) => ({
      ...memo,
      [key]: false,
    }),
    {}
  ) as EmployeesDataTableQueryVariables

  projections.forEach((projection) => {
    projection.fields.forEach((field) => {
      const key = `include${(field as string)[0].toUpperCase()}${(
        field as string
      ).slice(1)}` as keyof typeof variablesObject
      variablesObject[key] = true
    })
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
      access {
        firstName @include(if: $includeFirstName)
        lastName @include(if: $includeLastName)
        email @include(if: $includeEmail)
      }
      company {
        name @include(if: $includeCompanyName)
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

export interface EmployeesDataTableFields {
  firstName: Maybe<Scalars['String']>
  lastName: Maybe<Scalars['String']>
  email: Maybe<Scalars['String']>
  companyName: Maybe<Scalars['String']>
  subordinates: Maybe<Array<Employee>>
  jobName: Maybe<Scalars['String']>
}

export const employeesProjection = <
  F extends (keyof EmployeesDataTableFields)[]
>(
  args: ProjectionArgs<EmployeesDataTableFields, F>
) => projection<EmployeesDataTableFields>(args)

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
  projections: Projection<EmployeesDataTableFields>[]
): DataTableData<EmployeesDataTableFields> {
  // NOTE: Not sure net two things should be on hook level or on the table level
  const [visibleProjections, setProjections] = useState<
    Projection<EmployeesDataTableFields>[]
  >(projections.filter((projection) => projection.visible !== false))

  const variables = useMemo(
    () =>
      getVariables<EmployeesDataTableFields>(
        EmployeesDataTableQueryIncludes,
        visibleProjections
      ),
    [visibleProjections]
  )

  return {
    query: EmployeesDataTableDocument,
    variables,
    projections,
    visibleProjections,
    setProjections,
    resolvers: EmployeesDataTableFieldsResolvers,
  }
}
