const { GraphQLClient } = require('graphql-request')
const { tearDownIntegrationTestDataInRDS } = require('../utils/tearDown')
const { REQUEST_URL } = require('../utils/baseUrl')
const { createTransaction } = require('../queries/transactions')

const graphQLClient = new GraphQLClient(REQUEST_URL, {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

afterAll(() => {
  tearDownIntegrationTestDataInRDS()
})

const debitRequest = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2',
    author: 'Joe Smith',
    debitor: 'Joe Smith',
    creditor: 'Mary'
  },
  {
    name: '9% state sales tax',
    price: '0.540',
    quantity: '1',
    author: 'Joe Smith',
    debitor: 'Joe Smith',
    creditor: 'StateOfCalifornia'
  }
]

const creditRequest = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2',
    author: 'Joe Smith',
    creditor: 'Joe Smith',
    debitor: 'Mary'
  },
  {
    name: '9% state sales tax',
    price: '0.540',
    quantity: '1',
    author: 'Joe Smith',
    debitor: 'Mary',
    creditor: 'StateOfCalifornia'
  }
]

jest.setTimeout(30000) // lambda and serverless aurora cold starts

describe('Function As A Service GraphQL Server /transact endpoint', () => {
  it('sends transaction mutation', async done => {
    const response = await graphQLClient.request(createTransaction, {
      items: debitRequest
    })
    expect(response.createTransaction).toHaveLength(debitRequest.length)
    done()
  })

  it('sets debitor_approval_time if author === debitor', async done => {
    const response = await graphQLClient.request(createTransaction, {
      items: debitRequest
    })
    response.createTransaction.forEach(item => {
      if (item.author === item.debitor) {
        expect(item.creditor_approval_time).toBeNull()
        expect(item.debitor_approval_time).not.toBeNull()
      }
    })
    done()
  })

  it('sets creditor_approval_time if author === creditor', async done => {
    const response = await graphQLClient.request(createTransaction, {
      items: creditRequest
    })
    response.createTransaction.forEach(item => {
      if (item.author === item.creditor) {
        expect(item.creditor_approval_time).not.toBeNull()
        expect(item.debitor_approval_time).toBeNull()
      }
    })
    done()
  })
})
