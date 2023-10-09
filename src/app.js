const express = require('express');
require('dotenv').config();

const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const fileUpload = require('express-fileupload');
const i18n=require("i18n-express");

const home = require('./pipes/home');
const user = require('./pipes/user');
const game = require('./pipes/game');
const photo = require('./pipes/photo');
const auth = require('./pipes/auth');

const app = express();

// Config
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.static('public'));

// Set middlewares
app.use(
  bodyParser.urlencoded({
    limit: '10mb',
    extended: false,
  }),
);
app.use(express.json({
  limit: '10mb',
}));
app.use(fileUpload({
  limit: '10mb',
}));

// Set cookie and session
app.use(cookieParser());
const maxAge = 1000 * 60 * 60 * 12; // 12hours
app.use(
  session({
    secret: process.env.SESSEION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({ checkPeriod: maxAge }),
    cookie: {
      maxAge,
    },
  }),
);

app.use(i18n({
  translationsPath: path.join(__dirname, 'i18n'), 
  siteLangs: ["ko", "en"],
  textsVarName: 'translation',
  defaultLang: "ko"
}));

app.get('/auth/:token', auth.authenticate);
app.get('/auth', auth.generate);

app.get('/', home.index);
app.get('/register', home.register);
app.get('/login', home.login);
app.get('/reward', home.reward);

app.get('/tutorial/:stageNo', game.showTutorial);
app.get('/game/:stageNo', game.showGame);
app.get('/game/complete/:stageNo', game.complete);
app.post('/game/upload', game.upload);

app.post('/user/login', user.login);
app.post('/user/logout', user.logout);
app.post('/user/register', user.register);
app.post('/user/reward', user.reward);

app.get('/photo', photo.run);
app.get('/photo/admin', photo.admin);
app.post('/photo/delete', photo.delete);

module.exports = app;
