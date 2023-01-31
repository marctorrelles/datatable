import { Employee } from './generated/graphql'

// Below here goes to the static generated thingie
import gql from 'graphql-tag'
import { ReactNode, useCallback, useMemo, useRef, useState } from 'react'

/**
 * Generic types and utils here
 */
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
}
export type AnyVariables = { [prop: string]: any } | void | undefined

type RemoveArrayAndNull<T> = T extends Array<any>
  ? NonNullable<T[number]>
  : NonNullable<T>

type RevealType<T extends string[], U> = T extends [infer First, ...infer Rest]
  ? Rest extends string[]
    ? First extends keyof U
      ? RevealType<Rest, RemoveArrayAndNull<U[First]>>
      : never
    : never
  : U | null | undefined // TODO: Is this null or undefined assumption always true?

export type DataTableData<T> = {
  getVariables: (args: any) => AnyVariables
  query: any
  projections: Projection<T>[]
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
  ) as any

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

export type EmployeesDataTableQueryMainType = RemoveArrayAndNull<
  EmployeesDataTableQuery['employees']
>

export interface EmployeesDataTableFields {
  firstName: RevealType<
    ['access', 'firstName'],
    EmployeesDataTableQueryMainType
  >
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
  main: (data: EmployeesDataTableQuery) => data.employees,
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
  const getEmployeesDataTableVariables = useRef(
    (projections: Array<Projection<EmployeesDataTableFields>>) =>
      getVariables<EmployeesDataTableFields>(
        EmployeesDataTableQueryIncludes,
        projections
      )
  ).current

  return {
    query: EmployeesDataTableDocument,
    getVariables: getEmployeesDataTableVariables,
    projections,
    resolvers: EmployeesDataTableFieldsResolvers,
  }
}
