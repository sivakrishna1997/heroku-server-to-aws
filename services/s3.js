const fs = require('fs');
const AWS = require('aws-sdk');


const ID = 'AKIAICCO356V6UKKT3QQ';
const SECRET = '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';

// The name of the bucket that you have created
const BUCKET_NAME = 'mentor-video-aimentr';

const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});

// const s3 = new AWS.S3();

const params = {
    Bucket: BUCKET_NAME,
};

s3.createBucket(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else console.log('Bucket Created Successfully', data.Location);
});


module.exports = s3;