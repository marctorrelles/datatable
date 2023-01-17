import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
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

export type GetEmployeesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetEmployeesQuery = { __typename?: 'Query', employees?: Array<{ __typename?: 'Employee', access?: { __typename?: 'Access', firstName?: string | null, lastName?: string | null } | null, company?: { __typename?: 'Company', name?: string | null } | null, subordinates?: Array<{ __typename?: 'Employee', access?: { __typename?: 'Access', firstName?: string | null, lastName?: string | null } | null }> | null, job?: { __typename?: 'Job', name?: string | null } | null }> | null };


export const GetEmployeesDocument = gql`
    query GetEmployees {
  employees {
    access {
      firstName
      lastName
    }
    company {
      name
    }
    subordinates {
      access {
        firstName
        lastName
      }
    }
    job {
      name
    }
  }
}
    `;

export function useGetEmployeesQuery(options?: Omit<Urql.UseQueryArgs<GetEmployeesQueryVariables>, 'query'>) {
  return Urql.useQuery<GetEmployeesQuery, GetEmployeesQueryVariables>({ query: GetEmployeesDocument, ...options });
};