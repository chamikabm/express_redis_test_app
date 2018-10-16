const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function (target, property) {
        return target[property] || browser[property] || page[property];
      }
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login () {
    const user = await userFactory();
    const { session, sessionSig } = sessionFactory(user);

    await this.page.setCookie({ name : 'session', value: session });
    await this.page.setCookie({ name : 'session.sig', value: sessionSig });
    await this.page.goto('http://localhost:3000/blogs'); // Redirecting to blogs the page.

    const element = 'a[href="/auth/logout"]';
    await this.page.waitFor(element); // Wait for the element to be loaded.
  }

  async getContentsOf(selector) {
    return await this.page.$eval(selector, el => el.innerHTML);
  }

  async get(path) {
    return await this.page.evaluate((_path) => {
        return fetch(_path, { // fetch library is available with almost all the new browsers to work with http requests and responses.
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          }
        }).then(res => res.json());
      }, path);
  }

  async post(path, data) {
    return await this.page.evaluate((_path, _data) => {
      return fetch(_path, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(_data)
      }).then(res => res.json());
    }, path, data);
  }

  async executeActions(actions) {
    return Promise.all(
      actions.map(({ method, path, data }) => {
       return this[method](path, data);
      })
    );
  }
}

module.exports = CustomPage;