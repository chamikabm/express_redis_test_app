const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = (user) => {
  const sessionObject = {
    passport: {
      user: user._id.toString() // toString() method is here because in mogoose models _id is a object.
    }
  };
  const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
  const sessionSig = keygrip.sign('session=' + session);

  return {
    session,
    sessionSig,
  }
};