/*
jest.setTimeout - Time to wait before failing a test case. Some times async await takes more time to complete a test
case as it sometimes takes time to load web pages etc. By default it has only 5 seconds (5000ms) to complete a test case.
 */
jest.setTimeout(30000);


require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useMongoClient: true });