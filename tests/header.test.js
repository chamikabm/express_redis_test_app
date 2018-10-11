const puppeteer = require('puppeteer');
const sessionFactory = require('./factories/sessionFactory');

let browser, page;

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false
  });
  page = await browser.newPage();
  await page.goto('localhost:3000');
});

afterEach(async () => {
   await browser.close();
});

test('The header has the correct text.', async () => {

  const text = await page.$eval('a.brand-logo', el => el.innerHTML);
  expect(text).toEqual('Blogster');
});

test('Clicking login starts oauth flow.', async () => {
  await page.click('.right a');
  const url = await page.url();
  expect(url).toMatch('/accounts\.google\.com/');
});

test('When signed in, show logout button.', async () => {
  const { session, sessionSig } = sessionFactory();

  await page.setCookie({ name : 'session', value: session });
  await page.setCookie({ name : 'session.sig', value: sessionSig });
  await page.goto('localhost:3000'); // Refreshing the page.

  const element = 'a[href="/auth/logout"]';
  await page.waitFor(element); // Wait for the element to be loaded.
  const text = await page.$eval(element, el => el.innerHTML);
  expect(text).toEqual('Logout');
});