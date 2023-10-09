const twoFactor = require("node-2fa");
const secret = process.env.APP_SECRET;
const masterToken = process.env.MASTER_TOKEN;

const authorize = function (req) {
  return req.session.user;
};

const verifyIsInMeuseum = function (req) {
  if (req.query.token) {
    const token = req.query.token;
    if (twoFactor.verifyToken(secret, token, 60)) {
      return true;
    } else if (token == masterToken) { //for ipad device
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
        message_code: 'ACCESS_DENIED'
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
        nav_title_code: 'REWARD'
      });
    } else {
      res.render('home/denied', {
        message_code: 'REWARD_DENIED',
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
      message_code: 'ACCESS_DENIED'
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
      message_code: 'ACCESS_DENIED'
    })
  }
};
