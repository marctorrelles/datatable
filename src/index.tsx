import React from 'react'
import ReactDOM from 'react-dom/client'
import DataTable from './DataTable'
import { UrqlProvider } from './urql'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <UrqlProvider>
      <DataTable />
    </UrqlProvider>
  </React.StrictMode>
)
