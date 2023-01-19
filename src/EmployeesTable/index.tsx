import DataTable from '../DataTable'

const EmployeesTable = () => {
  return (
    <DataTable
      operation="employees"
      projections={[
        {
          name: 'Company',
          query: {
            operation: 'employees',
            fields: ['company', 'name'],
          },
        },
        {
          name: 'First Name',
          query: {
            operation: 'employees',
            fields: ['access', 'firstName'],
          },
          visible: false,
        },
        {
          name: 'Last Name',
          query: {
            operation: 'employees',
            fields: ['access', 'lastName'],
          },
          visible: false,
        },
        {
          name: 'Full Name',
          query: {
            operation: 'employees',
            fields: [
              ['access', 'firstName'],
              ['access', 'lastName'],
            ],
            resolver: (firstName: string, lastName: string) =>
              `${firstName} ${lastName}`,
          },
        },
        {
          name: 'Position',
          query: {
            operation: 'employees',
            fields: ['job', 'name'],
          },
        },
        {
          name: 'Email',
          query: {
            operation: 'employees',
            fields: ['access', 'email'],
          },
          visible: false,
        },
      ]}
    />
  )
}

export default EmployeesTable
