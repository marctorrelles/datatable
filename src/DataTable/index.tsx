import { Query as QueryOperation } from '../graphql'
import { useMemo, useState } from 'react'
import { useQuery } from 'urql'
import ColumnSelectorButton from './ColumnSelectorButton'
import { Body, Cell, Head, Row, Table } from './components'
import getFieldsForColumns from './getFieldsForColumns'
import * as styles from './index.css'
import { buildQuery } from './buildQuery'

type Operation = keyof QueryOperation

type Path =
  | {
      fields: string[][] // TODO: type it better
      resolver: (...args: any[]) => string
    }
  | {
      fields: string[] // TODO: type it better
    }

export type Query = {
  // TODO: Make operation just a string? Then it would not be typed but it's not ideal to have it as a dependency of the generated types...
  operation: Operation
} & Path

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

  const query = buildQuery<Operation>(operation, projections)

  const [{ fetching, error, data }] = useQuery({ query })

  const builtData: string[][] = useMemo(() => {
    if (!data) return []
    return getFieldsForColumns(projections, data)
  }, [data, projections])

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
