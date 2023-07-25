'use strict'

const Database = require('../database/connection.js');
const db = new Database();

exports.logout = function(req, res) {
    req.session.destroy(() => {
        req.session;
    })
    res.redirect('/')
}

exports.login = async function(req, res) {
    const {name} = req.body;
    const user = await db.first('users', "name=?", [name]);
    if (user) {
        req.session.user = {
            id: user.id,
            name: user.name,
            stage_01: user.stage_01 === 0 ? false : true,
            stage_02: user.stage_02 === 0 ? false : true,
            stage_03: user.stage_03 === 0 ? false : true,
        }
        res.redirect('/')
    }
}

exports.register = async function(req, res) {
    const {name} = req.body;
    if (!name) return console.error("name is not defined.")

    const user = await db.first('users', "name=?", [name]);
    if (user) {
        if (user.stage_01 === 1 && user.stage_02 === 1 && user.stage_03 === 1) {
            res.render("signup", {
                name: name,
                status: {
                    type: "USER_EXPIRED",
                    message: "이미 사용된 닉네임 입니다."
                }
            })
        } else {
            res.render("signup", {
                name: name,
                status: {
                    type: "USER_EXISTS",
                    message: "이 닉네임으로 이미 진행 중인 게임이 있습니다."
                }
            })
        }
    } else {
        //signup
        db.insert('users', ["name"], [name])
            .then(() => {
                req.session.user = {
                    name: name,
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