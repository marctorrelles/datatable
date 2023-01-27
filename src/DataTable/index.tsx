import { useMemo, useState } from 'react'
import { useQuery } from 'urql'
import ColumnSelectorButton from './ColumnSelectorButton'
import { Body, Cell, Head, Row, Table } from './components'
import * as styles from './index.css'
import { DataTableData, Projection } from '../datatable.graphql'
import getFieldsForColumns from './getFieldsForColumns'

type Props<T> = {
  data: DataTableData<T>
}

function DataTable<T>({ data }: Props<T>) {
  const {
    query,
    variables,
    projections,
    setProjections,
    initialProjections,
    resolvers,
  } = data

  const [{ fetching, error, data: queryData }] = useQuery({
    query: query,
    variables: variables,
  })

  const builtData = useMemo(() => {
    if (!queryData || fetching || error) return []
    return getFieldsForColumns(projections, queryData, data.resolvers)
  }, [queryData, error, fetching, data.resolvers, projections])

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
                <Cell.Head key={projection.title}>{projection.title}</Cell.Head>
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
