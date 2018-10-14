const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });

  test('Should see blog create form.', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title');
  });

  describe('And using valid inputs', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'My title');
      await page.type('.content input', 'My Content');
      await page.click('form button');
    });

    test('Submitting user takes to review screen.', async () => {
      const text = await page.getContentsOf('h5');
      expect(text).toEqual('Please confirm your entries');
    });

    test('Submitting then saving add blogs to index page.', async () => {
      await page.click('button.green');
      await page.waitFor('.card');
      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');
      expect(title).toEqual('My title');
      expect(content).toEqual('My Content');
    });
  });

  describe('And using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });
    test('The form shows error messages.', async () => {
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });
});

describe('When not logged in', async () => {
  test('User cannot get blog posts.', async () => {
    const result = await page.get('api/blogs');
    expect(result).toEqual({ error: 'You must log in!' });  });
  test('User cannot create blog posts.', async () => {
    const result = await page.post('api/blogs', { title: 'My Title', content: 'My Content' });
    expect(result).toEqual({ error: 'You must log in!' });
  });
});