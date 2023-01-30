import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

import gql from 'graphql-tag'
import { ReactNode, useMemo, useState } from 'react'

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };

export type AnyVariables =
  | {
      [prop: string]: any
    }
  | void
  | undefined

export type DataTableData<T> = {
  variables: AnyVariables
  query: any
  initialProjections: Projection<T>[]
  projections: Projection<T>[]
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

export const EmployeesDataTableDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EmployeesDataTable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employees"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lastName"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"includeLastName"}}]},{"kind":"Field","name":{"kind":"Name","value":"firstName"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"includeFirstName"}}]},{"kind":"Field","name":{"kind":"Name","value":"email"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"includeEmail"}}]}]}},{"kind":"Field","name":{"kind":"Name","value":"company"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"includeName"}}]}]}},{"kind":"Field","name":{"kind":"Name","value":"subordinates"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"includeSubordinates"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"job"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"includeName"}}]}]}}]}}]}}]} as unknown as DocumentNode<EmployeesDataTableQuery, EmployeesDataTableQueryVariables>;

accessLastName,accessFirstName,accessEmail,companyName,jobName,subordinates
    