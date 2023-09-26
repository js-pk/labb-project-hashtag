const Database = require('../../database/connection.js');

const db = new Database();
// const aws = require('aws-sdk');
// const s3 = new aws.S3({
//     accessKeyId: process.env.AWS_ACCESS,
//     secretAccessKey: process.env.AWS_SECRET,
//     region: process.env.AWS_REGION,
//     params: {Bucket: 'labb-photos'}
// });

exports.run = async (req, res, next) => {
  const recentPhotos = await db.all('photos', 'ORDER BY id DESC', [], 100);
  res.render('photos', {
    photos: recentPhotos,
  });
};

// TODO: photo deleting method for management
