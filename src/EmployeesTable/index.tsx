import React from 'react'
import DataTable from '../DataTable'
import { useEmployeesDataTable } from '../datatable.graphql'
import { Employee } from '../graphql'

const Subordinates: React.FC<{ subordinates: Employee[] }> = ({
  subordinates,
}) => {
  if (subordinates.length === 0) return <span>None :'(</span>

  return (
    <span style={{ color: 'green' }}>
      {subordinates
        .map((sub) => `${sub.access?.firstName} ${sub.access?.lastName}`)
        .join(', ')}
    </span>
  )
}

const NewEmployeesTable = () => {
  const data = useEmployeesDataTable([
    {
      title: 'First Name',
      field: 'firstName',
      visible: false,
    },
    {
      title: 'Last Name',
      field: 'lastName',
      visible: false,
    },
    {
      title: 'Full Name',
      fields: ['firstName', 'lastName'],
      render: (firstName: string, lastName: string) =>
        `${firstName} ${lastName}`,
    },
    {
      title: 'Position',
      field: 'jobName',
    },
    {
      title: 'Email',
      field: 'email',
    },
    {
      title: 'Subordinates',
      field: 'subordinates',
      render: (subordinates: Employee[]) => (
        <Subordinates subordinates={subordinates} />
      ),
      visible: false,
    },
  ])

  return <DataTable data={data} />
}

export default NewEmployeesTable
