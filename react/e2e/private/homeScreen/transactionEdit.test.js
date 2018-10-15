const puppeteer = require('puppeteer')
const login = require('../../utils/login')
const { addTransaction, milk, bread, honey } = require('./utils')
const { BASE_URL, HOME_URL, HOME_SELECTOR } = require('../../constants')

let browser
let page

beforeAll(async () => {
  browser = await puppeteer.launch({
    args: ['--no-sandbox']
  })

  page = await browser.newPage()
  await page.goto(BASE_URL)
  page = await login(page)
  await page.goto(HOME_URL)
  await page.waitForSelector(HOME_SELECTOR)
})

afterAll(async () => {
  await browser.close()
})

const getInputByValue = async value =>
  await page.$$eval(`input[value="${value}"]`, element => element.length)

const getTotal = async () =>
  await page.$eval('[name="total-value"]', element => element.innerHTML)

describe('transaction add remove (milk, honey, bread)', () => {
  test(
    '1 - adds three items',
    async () => {
      expect(await getTotal()).toEqual('0')

      await addTransaction(page, milk)
      expect(await getTotal()).toEqual('20')

      await addTransaction(page, honey)
      expect(await getTotal()).toEqual('60')

      await addTransaction(page, bread)
      expect(await getTotal()).toEqual('80')
    },
    20000
  )

  test(
    '2 - item names should be corect',
    async () => {
      expect(await getInputByValue('milk')).toEqual(1)
      expect(await getInputByValue('honey')).toEqual(1)
      expect(await getInputByValue('bread')).toEqual(1)
    },
    20000
  )

  test(
    '3 - edit milk',
    async () => {
      const milkNameInput = await page.$('input[value="milk"]')
      await milkNameInput.click({ clickCount: 3 })
      await milkNameInput.type('cheese')

      expect(await getInputByValue('milk')).toEqual(0)
      expect(await getInputByValue('cheese')).toEqual(1)
      expect(await getInputByValue('honey')).toEqual(1)
      expect(await getInputByValue('bread')).toEqual(1)

      const milkPriceInput = await page.$(
        `input[name="price"][value="${milk.price}"]`
      )

      await milkPriceInput.click({ clickCount: 3 })
      await milkPriceInput.type('5')
      expect(await getTotal()).toEqual('70')
    },
    20000
  )

  test(
    '4 - edit honey',
    async () => {
      const milkNameInput = await page.$('input[value="honey"]')
      await milkNameInput.click({ clickCount: 3 })
      await milkNameInput.type('mustard')

      expect(await getInputByValue('cheese')).toEqual(1)
      expect(await getInputByValue('honey')).toEqual(0)
      expect(await getInputByValue('mustard')).toEqual(1)
      expect(await getInputByValue('bread')).toEqual(1)

      const milkPriceInput = await page.$(
        `input[name="price"][value="${honey.price}"]`
      )

      await milkPriceInput.click({ clickCount: 3 })
      await milkPriceInput.type('60')
      expect(await getTotal()).toEqual('90')
    },
    20000
  )
})