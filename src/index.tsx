import React from 'react'
import ReactDOM from 'react-dom/client'
import EmployeesTable from './EmployeesTable'
import { UrqlProvider } from './urql'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <UrqlProvider>
      <EmployeesTable />
    </UrqlProvider>
  </React.StrictMode>
)
