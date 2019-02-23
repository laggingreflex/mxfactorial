import gql from 'graphql-tag'

const fetchRules = gql`
  query fetchRules($transactions: [TransactionItem]) {
    rules(transactions: $transactions) {
      uuid
      name
      price
      quantity
      rule_instance_id
    }
  }
`

export { fetchRules }
