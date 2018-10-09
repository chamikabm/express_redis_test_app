const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');

  /*
  This return (i.e return this) enables to use cache() as a chainable function with other functions.

  i.e :
  ----------------------------------
  Blog
    .find({ _user: req.user.id })
    .limit(10)
    .cache()
    .orderBy('asc')
  ----------------------------------
  */
  return this;
};

mongoose.Query.prototype.exec = async function() {
  console.log('Im about to run a query. Cache Enabled : {} ', this.useCache || false);
  if (!this.useCache) {
    console.log('Serving from Mongo DB.');
    return exec.apply(this, arguments);
  }
  // console.log(this.getQuery());
  // console.log(this.mongooseCollection.name);

  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name,
  }));

  console.log('KEY : ', key);
  console.log('hashKey : ', this.hashKey);

  // See if we have a value for key in redis.
  const cachedValue = await client.hget(this.hashKey, key);

  // If we do, return that.
  if (cachedValue) {
     console.log('Serving from cache. cachedValue : {}' , cachedValue);

    /*
    This is same as below code. Here this reference to the Query.prototype.exec, that is tha Query. From there we
    can grab the query model by accessing the  this.model.
    new this.model(JSON.parse(cachedValue));

    Same as above.
    new Blog({
      title: 'Blog Post One',
    });

    But we can`t return new this.model(JSON.parse(cachedValue)) on one shot. Because there can be two situations where
    JSON.parse(cachedValue) will return single model  or multiple models(i.e Arrays of models.) So we need to handle
    both the cases.

    That is for user query this return new this.model(JSON.parse(cachedValue)) will work, but for blog posts return
    new this.model(JSON.parse(cachedValue)) will not work as it has more items.

    user {_id: 13, googleId: '213w332423425'} <- Works for this

    blogs [{title: a, content: 'werwsdfsf'}, {title: b, content: 'sjuewr'}] <- Does not work for this.

    To overcome this issue we can check for array and treat each case differently as below.


    -------------------
    What exactly is hydration?

    Hydration is the process of "filling out" an object structure with data.
    It can be array of data or single obj data.
    */

    const docs = JSON.parse(cachedValue);
    return Array.isArray(docs) ? docs.map(doc => new this.model(doc)) : this.model(docs);
  }

  // Otherwise, issue the query and store result in redis.
  console.log('Serving from Mongo DB.');
  const result = await exec.apply(this, arguments);
  client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);

  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
};

