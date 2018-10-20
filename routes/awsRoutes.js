const AWS = require('aws-sdk');
const keys = require('../config/keys');

const s3 = AWS.S3({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey
});

module.exports = app => {
  app.get('/api/aws/upload', (req, res) => {

  });
};