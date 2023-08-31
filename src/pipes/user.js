'use strict'

const Database = require('../../database/connection.js');
const db = new Database();

exports.logout = function(req, res) {
    req.session.destroy(() => {
        req.session;
    })
    res.redirect('/')
}

exports.login = async function(req, res) {
    const {email} = req.body;
    const user = await db.first('users', "WHERE email=?", [email]);
    if (user) {
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            stage_01: user.stage_01 === 0 ? false : true,
            stage_02: user.stage_02 === 0 ? false : true,
            stage_03: user.stage_03 === 0 ? false : true,
        }
        res.redirect('/')
    } else {
        res.render("login", {
            email: email,
            status: {
                type: "LOGIN_FAILED",
                message: "존재하지 않는 이메일입니다."
            }
        })
    }
}

exports.register = async function(req, res) {
    const {name, email} = req.body;
    if (!name) return console.error("name is not defined.")
    if (!email) return console.error("email is not defined.")

    const user = await db.first('users', "WHERE email=?", [email]);
    if (user) {
        res.render("signup", {
            name: name,
            email: email,
            status: {
                type: "USER_EXISTS",
                message: "이미 사용된 이메일입니다."
            }
        })
    } else {
        //signup
        db.insert('users', ["name", "email"], [name, email])
            .then(() => {
                req.session.user = {
                    name: name,
                    email: email,
                    stage_01: false,
                    stage_02: false,
                    stage_03: false
                };
                res.redirect('/game/01');
            }
            ).catch((err) => {
                console.err(err.message)
            })
    }  
}