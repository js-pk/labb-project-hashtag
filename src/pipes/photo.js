'use strict'

const aws = require('aws-sdk');
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS,
    secretAccessKey: process.env.AWS_SECRET,
    region: process.env.AWS_REGION,
    params: {Bucket: 'labb-photos'}
});

exports.listAlbums = (req, res, next) => {
    s3.listObjects({Delimiter: '/'}, function(err, data) {
      if (err) {
        throw new Error(err);
      } else {
        if (data && data.Contents) {
          const MAX = 100;
          let photos = data.Contents.slice(0, MAX);
          photos.sort((a, b) => b.LastModified - a.LastModified);

          res.render("photos", {
            photos: photos
          })
        } else {
          res.render("photos", {
            photos: []
          })
        }
      }
    });

}