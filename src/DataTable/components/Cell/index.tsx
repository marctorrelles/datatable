import React from 'react'
import * as styles from './index.css'

function HeaderCell({ children }: React.PropsWithChildren) {
  return <th className={styles.cell}>{children}</th>
}

function BodyCell({ children }: React.PropsWithChildren) {
  return <td className={styles.cell}>{children}</td>
}

const Cell = {
  Head: HeaderCell,
  Body: BodyCell,
}

export default Cell
