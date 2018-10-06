const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
  /*
    By making this await next() it waits to complete the handler and then executes the middleware. Hence we can clear
    the cash after all the handler code completed executing.
   */
  await next();
  clearHash(req.user.id);
};


