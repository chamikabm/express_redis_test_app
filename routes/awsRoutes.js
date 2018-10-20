const AWS = require('aws-sdk');
const keys = require('../config/keys');

const s3 = AWS.S3({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey
});

module.exports = app => {
  app.get('/api/aws/upload', (req, res) => {
    const params = {
      Bucket: 'my-blog-bucket-ckb',
      ContentType: 'jpeg',
      Key: '',
    };
    s3.getSignedUrl('putObject', params, (err, url) => {
      console.log('The URL is', url);
    });
  });
};