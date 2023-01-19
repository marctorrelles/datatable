import DataTable from '../DataTable'

const EmployeesTable = () => {
  return (
    <DataTable
      operation="employees"
      projections={[
        {
          name: 'Company',
          query: {
            fields: ['company', 'name'],
          },
        },
        {
          name: 'First Name',
          query: {
            fields: ['access', 'firstName'],
          },
          visible: false,
        },
        {
          name: 'Last Name',
          query: {
            fields: ['access', 'lastName'],
          },
          visible: false,
        },
        {
          name: 'Full Name',
          query: {
            fieldsArray: [
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
            fields: ['job', 'name'],
          },
        },
        {
          name: 'Email',
          query: {
            fields: ['access', 'email'],
          },
          visible: false,
        },
      ]}
    />
  )
}

export default EmployeesTable
