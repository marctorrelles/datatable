import { useMemo } from 'react'
import { useQuery } from 'urql'
import { DataTableData } from '../datatable.graphql'
import { Body, Cell, Head, Row, Table } from './components'
import ColumnSelectorButton from './components/ColumnSelectorButton'
import * as styles from './index.css'
import getFieldsForColumns from './lib/getFieldsForColumns'

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
    return getFieldsForColumns(projections, queryData, resolvers)
  }, [queryData, error, fetching, resolvers, projections])

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
