import { createClient, dedupExchange, fetchExchange, Provider } from 'urql'

const API_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:9002/graphql'

const client = createClient({
  url: API_ENDPOINT,
  exchanges: [dedupExchange, fetchExchange],
  requestPolicy: 'cache-first',
})

type Props = {
  children: React.ReactNode
}

export const UrqlProvider = ({ children }: Props) => (
  <Provider value={client}>{children}</Provider>
)

export default UrqlProvider
