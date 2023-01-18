import { style } from '@vanilla-extract/css'

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  width: '100%',
  justifyContent: 'center',
  paddingTop: '3rem',
  paddingBottom: '3rem',
  textAlign: 'left',
})
