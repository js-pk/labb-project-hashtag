const Database = require('../../database/connection.js');
const db = new Database();

exports.run = async (req, res, next) => {
  
  const reject = () => {
    res.setHeader("www-authenticate", "Basic");
    res.sendStatus(401);
  };

  const authorization = req.headers.authorization;
  
  if (!authorization) {
    return reject();
  }
  
  const [username, password] = Buffer.from(
    authorization.replace("Basic ", ""),
    "base64"
  ).toString().split(":");
  
  if (!(username === process.env.ADMIN_NAME && password === process.env.ADMIN_PASSWORD)) {
    return reject();
  }

  const recentPhotos = await db.all('photos', 'ORDER BY id DESC', [], 100);
  res.render('photo/photos', {
    photos: recentPhotos,
  });
};

exports.admin = async(req, res, next) => {
  
  const reject = () => {
    res.setHeader("www-authenticate", "Basic");
    res.sendStatus(401);
  };

  const authorization = req.headers.authorization;
  
  if (!authorization) {
    return reject();
  }
  
  const [username, password] = Buffer.from(
    authorization.replace("Basic ", ""),
    "base64"
  ).toString().split(":");
  
  if (!(username === process.env.ADMIN_NAME && password === process.env.ADMIN_PASSWORD)) {
    return reject();
  }
  
  const recentPhotos = await db.all('photos', 'ORDER BY id DESC', [], 100);
  
  res.render('photo/admin', {
    photos: recentPhotos,
  });
}

exports.delete = async (req, res, next) => {
  const { photoKey } = req.body;
  
  db.delete("photos", "key=?", [photoKey])
  .then(() => {
    res.redirect('/photo/admin');
  }).catch((error) => {
    console.log(error);
    res.status(500).send('사진 삭제 중에 에러가 발생했습니다.');
  })
  
}
