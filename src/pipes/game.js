const Database = require('../../database/connection.js');

const db = new Database();
const ULID = require('ulid');
const sharp = require('sharp');
const aws = require('aws-sdk');

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS,
  secretAccessKey: process.env.AWS_SECRET,
  region: process.env.AWS_REGION,
});

const uploadMetaDataDB = async (key, userId) => {
  db.insert('photos', ['key', 'user_id'], [key, userId])
    .catch((err) => {
      console.err(err.message);
    });
};

const uploadFileS3 = async (fileName, fileData, callback) => {
  s3.upload({
    Bucket: 'labb-photos',
    Key: fileName,
    Body: fileData,
  }, (error, data) => {
    if (error) throw error;
    callback();
  });
};

const resizeImage = async (buffer) =>
// TODO: should handle error
  await sharp(buffer)
    .resize({
      width: 720,
      fit: 'outside',
    })
    .toBuffer();

const resizeImageToFile = (buffer) => {
  sharp(buffer)
    .resize({
      width: 720,
      fit: 'outside',
    })
    .toFile(
      `${__dirname}/../../public/images/upload/test.png`,
      (err, info) => {

      },
    );
};

const authorize = function (req) {
  return req.session.user;
};

exports.showTutorial = function(req, res, next) {
  const stageNo = req.params.stageNo || '01';
  const { user } = req.session;

  if (authorize(req)) {
    if (stageNo === '01') {
      res.render(`game/tutorial`, {
        name: user.name,
        nav_title_code: 'TUTORIAL_01',
        game_index: 0
      });
    } else if (stageNo === '02') {
      if (req.session.user.stage_01 === true) {
        res.render(`game/tutorial`, {
          name: user.name,
          nav_title_code: 'TUTORIAL_02',
          game_index: 1
        });
      } else {
        res.render('denied', {
          message_code: 'GAME_02_DENIED'
        });
      }
    } else if (stageNo === '03') {
      if (req.session.user.stage_01 === true && req.session.user.stage_02 === true) {
        res.render(`game/tutorial`, {
          name: user.name,
          nav_title_code: 'TUTORIAL_03',
          game_index: 2
        });
      } else {
        res.render('denied', {
          message_code: 'GAME_03_DENIED',
        });
      }
    }
  } else {
    res.redirect('/');
  }
;}

exports.showGame = function (req, res, next) {
  const stageNo = req.params.stageNo || '01';
  const { user } = req.session;

  if (authorize(req)) {
    if (stageNo === '01') {
      res.render(`game/${stageNo}`, {
        name: user.name,
        nav_title_code: 'FARM_LEVEL_01'
      });
    } else if (stageNo === '02') {
      if (req.session.user.stage_01 === true) {
        res.render(`game/${stageNo}`, {
          name: user.name,
          nav_title_code: 'FARM_LEVEL_02'
        });
      } else {
        res.render('denied', {
          message_code: 'GAME_02_DENIED',
        });
      }
    } else if (stageNo === '03') {
      if (req.session.user.stage_01 === true && req.session.user.stage_02 === true) {
        res.render(`game/${stageNo}`, {
          name: user.name,
          nav_title_code: 'FARM_LEVEL_03'
        });
      } else {
        res.render('denied', {
          message_code: 'GAME_03_DENIED',
        });
      }
    }
  } else {
    res.redirect('/');
  }
};

exports.upload = async function (req, res) {
  if (!req.files) return res.status(400).send('File not found');
  const { image } = req.files;
  if (!image || image.mimetype != 'image/png') return res.status(400).send('Wrong image format');

  const imageBuffer = Buffer.from(image.data, 'binary');
  const resizedImageBuffer = await resizeImage(imageBuffer);
  const key = ULID.ulid();
  uploadFileS3(`${key}.png`, resizedImageBuffer, () => uploadMetaDataDB(key, req.session.user.id));

  res.sendStatus(200);
};

exports.complete = function (req, res, next) {
  if (authorize(req)) {
    const { stageNo } = req.params;
    if (['01', '02', '03'].includes(stageNo)) {
      const stageString = `stage_${stageNo}`;
      db.update('users', `${stageString}=?`, 'id=?', [1, req.session.user.id]);
      // update session and redirect to next game
      req.session.user[stageString] = true;
      if (stageNo === '01') {
        res.redirect('/tutorial/02');
      } else if (stageNo === '02') {
        res.redirect('/tutorial/03');
      } else if (stageNo === '03') {
        res.redirect('/reward');
      }
    } else {
      res.status(404).send('Page not founded');
    }
  } else {
    console.log("req not authorized");
    res.status(500).send('Server error');
  }
};
