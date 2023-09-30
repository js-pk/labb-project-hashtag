const Database = require('../../database/connection.js');
const db = new Database();

const twoFactor = require("node-2fa");
const secret = process.env.APP_SECRET;
const token = twoFactor.generateToken(secret).token;

exports.logout = function (req, res) {
  req.session.destroy(() => {
    req.session;
  });
  res.redirect('/');
};

exports.login = async function (req, res) {
  const { email } = req.body;
  const user = await db.first('users', 'WHERE email=?', [email]);
  if (user) {
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      stage_01: user.stage_01 !== 0,
      stage_02: user.stage_02 !== 0,
      stage_03: user.stage_03 !== 0,
      reward_exchanged: user.reward_exchanged !== 0,
    };
    res.redirect('/');
  } else {
    res.render('home/login', {
      email,
      token: token,
      status: {
        type: 'LOGIN_FAILED',
        message: '존재하지 않는 이메일입니다.',
      },
    });
  }
};

exports.register = async function (req, res) {
  const { name, email } = req.body;
  if (!name) return console.error('name is not defined.');
  if (!email) return console.error('email is not defined.');

  const user = await db.first('users', 'WHERE email=?', [email]);
  if (user) {
    res.render('home/signup', {
      name,
      email,
      token: token,
      status: {
        type: 'USER_EXISTS',
        message: '이미 사용된 이메일입니다. 이전에 게임을 플레이하셨다면 로그인하세요',
      },
    });
  } else {
    // signup
    db.insert('users', ['name', 'email'], [name, email])
      .then(() => {
        req.session.user = {
          name,
          email,
          stage_01: false,
          stage_02: false,
          stage_03: false,
          reward_exchanged: false,
        };
        res.redirect('/tutorial/01');
      }).catch((err) => {
        console.err(err.message);
        res.status(500).send('회원 가입 중에 에러가 발생했습니다.');
      });
  }
};

exports.reward = async function (req, res) {
  db.update('users', 'reward_exchanged = 1', 'email=?', [req.session.user.email])
    .then(() => {
      req.session.user.reward_exchanged = true;
      res.redirect('/reward');
    }).catch((err) => {
      console.err(err.message);
      res.status(500).send('리워드 교환 중에 에러가 발생했습니다.');
    });
};
