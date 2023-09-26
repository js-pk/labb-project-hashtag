const authorize = function (req) {
  return req.session.user;
};

exports.index = function (req, res, next) {
  if (authorize(req)) {
    res.render('dashboard', {
      stage_01: req.session.user.stage_01,
      stage_02: req.session.user.stage_02,
      stage_03: req.session.user.stage_03,
    });
  } else {
    res.render('init');
  }
};

exports.reward = function (req, res, next) {
  // add logic only user who cleared all games can access
  if (authorize(req)) {
    if (req.session.user.stage_01 && req.session.user.stage_02 && req.session.user.stage_03) {
      res.render('reward', {
        reward_exchanged: req.session.user.reward_exchanged,
      });
    } else {
      res.render('denied', {
        message: '게임을 모두 완료해야 보상을 받을 수 있습니다.',
      });
    }
  }
};

exports.register = function (req, res, next) {
  if (authorize(req)) {
    res.render('dashboard', {
      stage_01: req.session.user.stage_01,
      stage_02: req.session.user.stage_02,
      stage_03: req.session.user.stage_03,
    });
  } else {
    res.render('signup');
  }
};

exports.login = function (req, res, next) {
  if (authorize(req)) {
    res.render('dashboard', {
      stage_01: req.session.user.stage_01,
      stage_02: req.session.user.stage_02,
      stage_03: req.session.user.stage_03,
    });
  } else {
    res.render('login');
  }
};
