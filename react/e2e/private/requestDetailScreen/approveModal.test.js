const puppeteer = require('puppeteer')
const login = require('../../utils/login')

const { BASE_URL, REQUEST_URL } = require('../../constants')

const activeButtonSelector = 'button[data-id="activeButton"]'

const selectors = {
  backButton: '[data-id="backButton"]',
  approveModal: '[data-id=passwordApproveTransactionPopUp]',
  successModal: '[data-id=transactionSuccessPopup]',
  transactButton: '[data-id="transactButton"]',
  cancelButton: '[data-id="cancelButton"]',
  okButton: '[data-id="okButton"]',
  passwordInput: '[data-id="passwordInputField"]'
}

let browser
let page

beforeAll(async () => {
  browser = await puppeteer.launch({
    args: ['--no-sandbox']
  })

  page = await browser.newPage()
  await page.goto(BASE_URL)
  page = await login(page)
  await page.goto(REQUEST_URL)
  await page.waitForSelector(activeButtonSelector)
  const link = await page.$('[data-id="requestItemIndicator"]')
  await link.click()
})

afterAll(async () => {
  await browser.close()
})

const getApproveModalStatus = async () =>
  await page.$eval(selectors.approveModal, element =>
    element.getAttribute('data-open')
  )

test('1 - open/close passwordApproveTransaction Modal', async () => {
  const transactBtn = await page.$(selectors.transactButton)
  await transactBtn.click()
  await page.waitFor(1000)

  expect(await getApproveModalStatus()).toEqual('true')

  const cancelButton = await page.$(selectors.cancelButton)
  await cancelButton.click()
  expect(await getApproveModalStatus()).toEqual('false')
})

test(
  '2 - password error',
  async () => {
    await page.goto(REQUEST_URL)
    await page.waitForSelector(activeButtonSelector)
    const link = await page.$('[data-id="requestItemIndicator"]')
    await link.click()

    const transactBtn = await page.$(selectors.transactButton)
    await transactBtn.click()
    expect(await getApproveModalStatus()).toEqual('true')
    const passwordInput = await page.$(selectors.passwordInput)
    await passwordInput.type('FALSE')
    const okButton = await page.$(selectors.okButton)
    await okButton.click()

    await page.waitFor(1600)
    const hasError = await page.$eval(selectors.passwordInput, element =>
      element.getAttribute('data-haserror')
    )
    expect(hasError).toEqual('true')

    await passwordInput.type('X')

    const hasError2 = await page.$eval(selectors.passwordInput, element =>
      element.getAttribute('data-haserror')
    )
    await page.waitFor(1500)
    expect(hasError2).toEqual('false')
  },
  15000
)
