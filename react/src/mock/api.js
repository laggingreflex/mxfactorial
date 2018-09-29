import * as R from 'ramda'

import data from './data.json'
import requests from './requests.json'

const mapRequestsByStatus = R.pipe(
  R.groupBy(item => (item.rejection_time === '' ? 'active' : 'rejected'))
)(requests)

export const fetchTransactions = () => Promise.resolve(data)

export const fetchBalance = () => Promise.resolve(0)

export const fetchRequests = () => Promise.resolve(mapRequestsByStatus)