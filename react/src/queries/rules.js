import gql from 'graphql-tag'

const fetchRules = gql`
  query fetchRules($transactions: [TransactionInputType]) {
    rules(transactions: $transactions) {
      uuid
      name
      price
      quantity
      author
      debitor
      creditor
      rule_instance_id
    }
  }
`

export { fetchRules }
