const twoFactor = require("node-2fa");
const secret = process.env.APP_SECRET;

const authorize = function (req) {
  return req.session.user;
};

const verifyIsInMeuseum = function (req) {
  if (req.query.token) {
    const token = req.query.token;
    if (twoFactor.verifyToken(secret, token, 60)) {
      return true;
    } 
  }
  return false;
}

exports.index = function (req, res, next) {
  if (authorize(req)) {
    res.render('home/dashboard', {
      stage_01: req.session.user.stage_01,
      stage_02: req.session.user.stage_02,
      stage_03: req.session.user.stage_03
    });
  } else {
    if (verifyIsInMeuseum(req)) {
      res.render('home/init');
    } else {
      res.render('home/denied', {
        message: '원펀치 쓰리 강냉이는 국립현대미술관 서울관에서만 플레이 가능합니다.\n 전시관 내부의 QR코드를 이용해 접속해주세요.'
      })
    }
  }
};

exports.reward = function (req, res, next) {
  // add logic only user who cleared all games can access
  if (authorize(req)) {
    if (req.session.user.stage_01 && req.session.user.stage_02 && req.session.user.stage_03) {
      res.render('home/reward', {
        reward_exchanged: req.session.user.reward_exchanged,
        nav_title: 'reward'
      });
    } else {
      res.render('home/denied', {
        message: '게임을 모두 완료해야 보상을 받을 수 있습니다.',
      });
    }
  }
};

exports.register = function (req, res, next) {
  if (authorize(req)) {
    res.render('home/dashboard', {
      stage_01: req.session.user.stage_01,
      stage_02: req.session.user.stage_02,
      stage_03: req.session.user.stage_03,
    });
  } else if (verifyIsInMeuseum(req)) {
    res.render('home/signup');
  } else {
    res.render('home/denied', {
      message: '원펀치 쓰리 강냉이는 국립현대미술관 서울관에서만 플레이 가능합니다.\n 전시관 내부의 QR코드를 이용해 접속해주세요.'
    })
  }
};

exports.login = function (req, res, next) {
  if (authorize(req)) {
    res.render('home/dashboard', {
      stage_01: req.session.user.stage_01,
      stage_02: req.session.user.stage_02,
      stage_03: req.session.user.stage_03,
    });
  } else if (verifyIsInMeuseum(req)) {
    res.render('home/login');
  } else {
    res.render('home/denied', {
      message: '원펀치 쓰리 강냉이는 국립현대미술관 서울관에서만 플레이 가능합니다.\n 전시관 내부의 QR코드를 이용해 접속해주세요.'
    })
  }
};
