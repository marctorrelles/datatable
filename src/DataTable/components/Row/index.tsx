import React from 'react'
import * as styles from './index.css'

type Props = React.PropsWithChildren<{
  isPair: boolean
}>

export default function Row({ children, isPair }: Props) {
  return <tr className={isPair ? styles.pair : styles.odd}>{children}</tr>
}
