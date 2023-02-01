import React from 'react'
import DataTable from '../DataTable'
import {
  employeesDataTableProjection,
  useEmployeesDataTable,
} from '../generated/datatable.graphql'
import { Employee } from '../generated/graphql'

const Subordinates: React.FC<{ subordinates?: Employee[] | null }> = ({
  subordinates,
}) => {
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
    employeesDataTableProjection({
      title: 'First Name',
      fields: ['firstName'],
      visible: false,
    }),
    employeesDataTableProjection({
      title: 'Last Name',
      fields: ['lastName'],
      visible: false,
    }),
    employeesDataTableProjection({
      title: 'Company',
      fields: ['companyName'],
    }),
    employeesDataTableProjection({
      title: 'Full Name',
      fields: ['firstName', 'lastName'],
      render: ({ firstName, lastName }) => `${firstName} ${lastName}`,
    }),
    employeesDataTableProjection({
      title: 'Position',
      fields: ['jobName'],
    }),
    employeesDataTableProjection({
      title: 'Email',
      fields: ['email'],
    }),
    employeesDataTableProjection({
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
