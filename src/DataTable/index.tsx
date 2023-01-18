import { DocumentNode } from 'graphql'
import { useState } from 'react'
import { useQuery } from 'urql'
import ColumnSelectorButton from './ColumnSelectorButton'
import { Body, Cell, Head, Row, Table } from './components'
import getFieldsForColumns from './getFieldsForColumns'
import * as styles from './index.css'

type Path =
  | {
      argsPath: string[]
      method: (...args: any[]) => string
    }
  | {
      path: string // TODO: type it better
    }

export type Projection = {
  name: string
  identifier: string
  visible?: boolean // default: true
} & Path

type Pagination = 'cursor' | 'offset' | 'none'

type Props = {
  query: DocumentNode
  queryOptions?: Record<string, any>
  projections: Projection[]
  pagination: Pagination
}

const DataTable = ({
  query,
  queryOptions,
  projections: initialProjections,
}: Props) => {
  const [projections, setProjections] = useState<Projection[]>(
    initialProjections.filter((projection) => projection.visible !== false)
  )

  const [{ fetching, error, data }] = useQuery({ query, ...queryOptions })

  if (fetching) return <p>Loading...</p>
  if (error) return <p>Oh no... {error.message}</p>

  const builtData: string[][] = getFieldsForColumns(projections, data)

  return (
    <div className={styles.container}>
      <ColumnSelectorButton
        currentProjections={projections}
        initialProjections={initialProjections}
        setCurrentProjections={setProjections}
      />
      <Table>
        <Head>
          <Row isPair>
            {projections.map((projection) => (
              <Cell.Head key={projection.identifier}>
                {projection.name}
              </Cell.Head>
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
    </div>
  )
}

export default DataTable
