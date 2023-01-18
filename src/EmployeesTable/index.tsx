import DataTable from '../DataTable'
import { GetEmployeesDocument } from '../graphql'

const EmployeesTable = () => {
  return (
    <DataTable
      query={GetEmployeesDocument}
      queryOptions={{
        variables: {},
      }}
      projections={[
        {
          name: 'Company',
          identifier: 'company',
          path: 'employees.company.name',
        },
        {
          name: 'First Name',
          identifier: 'firstName',
          path: 'employees.access.firstName',
          visible: false,
        },
        {
          name: 'Last Name',
          identifier: 'lastName',
          path: 'employees.access.lastName',
          visible: false,
        },
        {
          name: 'Full Name',
          identifier: 'fullName',
          argsPath: ['employees.access.firstName', 'employees.access.lastName'],
          method: (firstName: string, lastName: string) =>
            `${firstName} ${lastName}`,
        },
        {
          name: 'Position',
          identifier: 'position',
          path: 'employees.job.name',
        },
        {
          name: 'Email',
          identifier: 'email',
          path: 'employees.access.email',
          visible: false,
        },
      ]}
      pagination="cursor"
    />
  )
}

export default EmployeesTable
