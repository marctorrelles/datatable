import { useMemo, useState } from 'react'
import { useQuery } from 'urql'
import { Query as QueryOperation } from '../graphql'
import { useBuildQuery } from './useBuildQuery'
import ColumnSelectorButton from './ColumnSelectorButton'
import { Body, Cell, Head, Row, Table } from './components'
import getFieldsForColumns from './getFieldsForColumns'
import * as styles from './index.css'

export type Operation = keyof QueryOperation

type Query =
  | {
      fieldsArray: string[][] // TODO: type it better
      resolver: (...args: any[]) => string
    }
  | {
      fields: string[] // TODO: type it better
    }

export type Projection = {
  name: string
  visible?: boolean // default: true
  query: Query
}

type Props = {
  operation: Operation
  projections: Projection[]
}

const DataTable = ({ operation, projections: initialProjections }: Props) => {
  const [projections, setProjections] = useState<Projection[]>(
    initialProjections.filter((projection) => projection.visible !== false)
  )

  const query = useBuildQuery(operation, projections)

  const [{ fetching, error, data }] = useQuery({ query })

  const builtData: string[][] = useMemo(() => {
    if (!data || fetching || error) return []
    return getFieldsForColumns(operation, projections, data)
  }, [data, error, fetching, operation, projections])

  return (
    <div className={styles.container}>
      <ColumnSelectorButton
        currentProjections={projections}
        initialProjections={initialProjections}
        setCurrentProjections={setProjections}
      />
      {fetching && <p>Loading...</p>}
      {error && <p>Oh no... {error.message}</p>}
      {!fetching && !error && (
        <Table>
          <Head>
            <Row isPair>
              {projections.map((projection) => (
                <Cell.Head key={projection.name}>{projection.name}</Cell.Head>
              ))}
            </Row>
          </Head>
          <Body>
            {builtData.map((row, index) => (
              <Row key={index} isPair={index % 2 === 0}>
                {Object.values(row).map((value, index) => (
                  <Cell.Body key={index}>{value}</Cell.Body>
                ))}
              </Row>
            ))}
          </Body>
        </Table>
      )}
    </div>
  )
}

export default DataTable
