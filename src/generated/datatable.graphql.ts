import { ReactNode, useRef } from 'react'
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };

type AnyVariables = { [prop: string]: any } | void | undefined

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

type DataTableData<T> = {
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

type ProjectionBuiler<T> = (
  args: ProjectionArgs<T, (keyof T)[]>
) => typeof args

export type Projection<T> = ReturnType<ProjectionBuiler<T>>

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

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Access = {
  __typename?: 'Access';
  email?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  lastName?: Maybe<Scalars['String']>;
};

export type Company = {
  __typename?: 'Company';
  employees?: Maybe<Array<Employee>>;
  id?: Maybe<Scalars['ID']>;
  industry?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

export type Employee = {
  __typename?: 'Employee';
  access?: Maybe<Access>;
  address?: Maybe<Scalars['String']>;
  company?: Maybe<Company>;
  hiringDate?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  job?: Maybe<Job>;
  subordinates?: Maybe<Array<Employee>>;
  zipCode?: Maybe<Scalars['String']>;
};

export type Job = {
  __typename?: 'Job';
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  salary?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  companies?: Maybe<Array<Company>>;
  company?: Maybe<Company>;
  employee?: Maybe<Employee>;
  employees?: Maybe<Array<Employee>>;
};


export type QueryCompanyArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryEmployeeArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryEmployeesArgs = {
  first?: InputMaybe<Scalars['Int']>;
};

export type EmployeesDataTableQueryVariables = Exact<{ [key: string]: never; }>;


export type EmployeesDataTableQuery = { __typename?: 'Query', employees?: Array<{ __typename?: 'Employee', access?: { __typename?: 'Access', lastName?: string | null, firstName?: string | null, email?: string | null } | null, company?: { __typename?: 'Company', name?: string | null } | null, subordinates?: Array<{ __typename?: 'Employee', access?: { __typename?: 'Access', firstName?: string | null, lastName?: string | null } | null }> | null, job?: { __typename?: 'Job', name?: string | null } | null }> | null };

const EmployeesDataTableDocument = gql`
query EmployeesDataTable($includeLastName: Boolean!, $includeFirstName: Boolean!, $includeEmail: Boolean!, $includeName: Boolean!, $includeName: Boolean!, $includeSubordinates: Boolean!) {
  employees {
    access {
      lastName @include(if: $includeLastName)
      firstName @include(if: $includeFirstName)
      email @include(if: $includeEmail)
    }
    company {
      name @include(if: $includeName)
    }
    subordinates @include(if: $includeSubordinates) {
      access {
        firstName
        lastName
      }
    }
    job {
      name @include(if: $includeName)
    }
  }
}
`

const EmployeesDataTableIncludes = [
  'includeLastName',
  'includeFirstName',
  'includeEmail',
  'includeName',
  'includeName',
  'includeSubordinates',
] as const

type EmployeesDataTableMainType = RemoveArrayAndNull<
  EmployeesDataTableQuery['employees']
>

interface EmployeesDataTableFields {
  accessLastName: RevealType<['subordinates', 'access', 'lastName'], EmployeesDataTableMainType>
  accessFirstName: RevealType<['subordinates', 'access', 'firstName'], EmployeesDataTableMainType>
  accessEmail: RevealType<['access', 'email'], EmployeesDataTableMainType>
  companyName: RevealType<['job', 'name'], EmployeesDataTableMainType>
  jobName: RevealType<['job', 'name'], EmployeesDataTableMainType>
  subordinates: RevealType<['subordinates'], EmployeesDataTableMainType>
}

const EmployeesDataTableFieldsResolvers = {
  main: (data: EmployeesDataTableQuery) => data.employees,
  fields: {
    accessLastName: (
      main: NonNullable<EmployeesDataTableQuery['employees']>[number]
    ) => main.subordinates?.access?.lastName,
    accessFirstName: (
      main: NonNullable<EmployeesDataTableQuery['employees']>[number]
    ) => main.subordinates?.access?.firstName,
    accessEmail: (
      main: NonNullable<EmployeesDataTableQuery['employees']>[number]
    ) => main.access?.email,
    companyName: (
      main: NonNullable<EmployeesDataTableQuery['employees']>[number]
    ) => main.job?.name,
    jobName: (
      main: NonNullable<EmployeesDataTableQuery['employees']>[number]
    ) => main.job?.name,
    subordinates: (
      main: NonNullable<EmployeesDataTableQuery['employees']>[number]
    ) => main.subordinates,
  }
}

export const employeesProjection = <F extends (keyof EmployeesDataTableFields)[]>(
  args: ProjectionArgs<EmployeesDataTableFields, F>
) => projection<EmployeesDataTableFields>(args)

export function useEmployeesDataTable(
  projections: Projection<EmployeesDataTableFields>[]
): DataTableData<EmployeesDataTableFields> {
  const getEmployeesDataTableVariables = useRef(
    (projections: Array<Projection<EmployeesDataTableFields>>) => (
      getVariables<EmployeesDataTableFields>(EmployeesDataTableIncludes, projections)
    )
  ).current

  return {
    query: EmployeesDataTableDocument,
    getVariables: getEmployeesDataTableVariables,
    projections,
    resolvers: EmployeesDataTableFieldsResolvers,
  }
}