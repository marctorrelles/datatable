import { AnyVariables, UseQueryResponse } from 'urql'
import { useGetEmployeesQuery } from '../graphql'
import Cell from './components/Cell'
import Row from './components/Row'
import Table from './components/Table'
import getLeafs from './getLeafs'
import * as styles from './index.css'

type Projection = {
  name: string
  path: string // TODO: type it better
  visible?: boolean // default: true
}

type Props<Data extends any, Variables extends AnyVariables> = {
  response: UseQueryResponse<Data, Variables>
  projections: Projection[]
}

const DataTable = <Data extends any, Variables extends AnyVariables>({
  response,
  projections,
}: Props<Data, Variables>) => {
  const [{ fetching, error, data }] = response

  if (fetching) return <p>Loading...</p>
  if (error) return <p>Oh no... {error.message}</p>

  // const leafs = getLeafs(accessibleData)
  const header = projections.map((projection) => projection.name)
  const builtData: string[][] = [] // TODO

  return (
    <div className={styles.container}>
      <Table>
        <Row isPair>
          {Object.values(header).map((value) => (
            <Cell.Head>{value}</Cell.Head>
          ))}
        </Row>
        {builtData.map((row, index) => (
          <Row isPair={index % 2 === 0}>
            {Object.values(row).map((value) => (
              <Cell.Body>{value}</Cell.Body>
            ))}
          </Row>
        ))}
      </Table>
    </div>
  )
}

const Wrapper = () => {
  const response = useGetEmployeesQuery()

  return (
    <DataTable
      response={response}
      projections={[
        {
          name: 'Company',
          path: 'employees[].company.name',
        },
        {
          name: 'First Name',
          path: 'employees[].access.firstName',
        },
        {
          name: 'Last Name',
          path: 'employees[].access.lastName',
        },
        {
          name: 'Position',
          path: 'employees[].job.name',
        },
      ]}
    />
  )
}

export default Wrapper
// export default DataTable
