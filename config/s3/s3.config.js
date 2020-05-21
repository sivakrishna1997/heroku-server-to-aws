const AWS = require('aws-sdk');
const env = require('./s3.env.js');

const s3 = new AWS.S3({
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
});

// const uploadParams = {
//          Bucket: 'mentor-video-aimentr',//env.Bucket, 
//          Key: '', // pass key
//          Body: null, // pass file body
// };

// const s3 = {};
// s3.s3Client = s3Client;
// s3.uploadParams = uploadParams;

// console.log('s3 connected')

module.exports = s3;