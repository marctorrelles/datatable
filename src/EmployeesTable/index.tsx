import React from 'react'
import DataTable from '../DataTable'
import {
  employeesProjection,
  useEmployeesDataTable,
} from '../datatable.graphql'
import { Employee } from '../graphql'

const Subordinates: React.FC<{ subordinates: Employee[] | null }> = ({
  subordinates,
}) => {
  console.log('subordinates', subordinates)
  if (!subordinates || subordinates.length === 0) return <span>None :'(</span>

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
    employeesProjection({
      title: 'First Name',
      fields: ['firstName'],
      visible: false,
    }),
    employeesProjection({
      title: 'Last Name',
      fields: ['lastName'],
      visible: false,
    }),
    employeesProjection({
      title: 'Company',
      fields: ['companyName'],
    }),
    employeesProjection({
      title: 'Full Name',
      fields: ['firstName', 'lastName'],
      render: ({ firstName, lastName }) => `${firstName} ${lastName}`,
    }),
    employeesProjection({
      title: 'Position',
      fields: ['jobName'],
    }),
    employeesProjection({
      title: 'Email',
      fields: ['email'],
      render: ({ email }) => email,
    }),
    employeesProjection({
      title: 'Subordinates',
      fields: ['subordinates'],
      render: ({ subordinates }) => (
        <Subordinates subordinates={subordinates} />
      ),
      visible: false,
    }),
  ])

  return <DataTable data={data} />
}

export default NewEmployeesTable
