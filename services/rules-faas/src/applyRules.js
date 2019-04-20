const uuidv1 = require('uuid/v1')

const TAX_TRANSACTION_NAME = '9% state sales tax'

const applyRules = transactionItems => {
  // Remove any existing “9% state sales tax” item to avoid duplicating objects in the array
  const accountItems = transactionItems.filter(item => {
    return item.name !== TAX_TRANSACTION_NAME
  })

  // Add 9% sales tax.
  let salesTaxValue = 0
  accountItems.forEach(item => {
    const quantity = item.quantity || 1
    const price = item.price || 0
    salesTaxValue += price * quantity * 0.09
  })

  if (salesTaxValue > 0) {
    accountItems.push({
      uuid: uuidv1(),
      author: accountItems[0].author,
      rule_instance_id: uuidv1(),
      name: TAX_TRANSACTION_NAME,
      price: salesTaxValue.toFixed(3),
      quantity: 1,
      creditor: 'StateOfCalifornia',
      debitor: accountItems[0].debitor
    })
  }
  console.log('Applied rules: ', JSON.stringify(accountItems))

  return accountItems
}

module.exports = applyRules