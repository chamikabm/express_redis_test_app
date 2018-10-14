const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('localhost:3000');
});

afterEach(async () => {
   await page.close();
});

test('The header has the correct text.', async () => {
  const text = await page.getContentsOf('a.brand-logo');
  expect(text).toEqual('Blogster');
});

test('Clicking login starts oauth flow.', async () => {
  await page.click('.right a');
  const url = await page.url();
  expect(url).toMatch('/accounts\.google\.com/');
});

test('When signed in, show logout button.', async () => {
  await page.login();
  const element = 'a[href="/auth/logout"]';
  const text = await await page.getContentsOf(element);
  expect(text).toEqual('Logout');
});