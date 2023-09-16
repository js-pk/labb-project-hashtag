const express = require('express');
require('dotenv').config();

const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const fileUpload = require('express-fileupload');

const home = require('./pipes/home');
const user = require('./pipes/user');
const game = require('./pipes/game');
const photo = require('./pipes/photo')

const app = express();

//Config
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));
app.use(express.static('public'));

app.locals.variables = require('./variables.json');

//Set middlewares
app.use(
    bodyParser.urlencoded({
        limit: '10mb',
        extended:false
    })
);
app.use(express.json({
    limit: '10mb'
}));
app.use(fileUpload({
    limit: '10mb'
}));

//Set cookie and session
app.use(cookieParser());
const maxAge = 1000 * 60 * 60 * 12; //12hours
app.use(
    session({
        secret: "aaa", //temp
        resave: false,
        saveUninitialized: true,
        store: new MemoryStore({checkPeriod: maxAge}),
        cookie: {
            maxAge: maxAge
        }
    })
);

app.get("/", home.index);
app.get("/login", home.login);

app.get("/game/:stageNo", game.run);
app.get("/game/complete/:stageNo", game.complete);
app.post("/game/upload", game.upload);

app.post('/user/login', user.login);
app.post('/user/logout', user.logout);
app.post('/user/register', user.register);

app.get("/photos", photo.run);

app.get("/init", (req, res) => {
    res.render("init");
})

module.exports = app;