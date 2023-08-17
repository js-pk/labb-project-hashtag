'use strict'

const aws = require('aws-sdk');
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS,
    secretAccessKey: process.env.AWS_SECRET,
    region: process.env.AWS_REGION,
    params: {Bucket: 'labb-photos'}
});

exports.listAlbums = () => {
    s3.listObjects({Delimiter: '/'}, function(err, data) {
      if (err) {
        throw new Error(err);
      } else {
        // var albums = data.CommonPrefixes.map(function(commonPrefix) {
        //   var prefix = commonPrefix.Prefix;
        //   var albumName = decodeURIComponent(prefix.replace('/', ''));
        //   return albumName;
        // });
        return data;
      }
    });
}