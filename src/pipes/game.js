'use strict'
const Database = require('../../database/connection.js');
const db = new Database();

const authorize = function(req) {
    return req.session.user
}

exports.run = function(req, res, next) {
    const stageNo = req.params.stageNo || "01";
    if (["01", "02", "03"].includes(stageNo)) {
        if (authorize(req)) {
            res.render(`games/${stageNo}`)
        } else {
            res.redirect("/")
        }
    }
}

exports.complete = function(req, res, next) {
    if (authorize(req)) {
        const stageNo= req.params.stageNo;
        if (["01", "02", "03"].includes(stageNo)) {
            const stageString = `stage_${stageNo}`;
            db.update("users", `${stageString}=?`, "id=?", [1, req.session.user.id]);
            // update session and redirect to next game
            req.session.user[stageString] = true;
            if (["01", "02"].includes(stageNo)) {
                res.redirect(`/game/0${Number(stageNo)+1}`);
            } else if (stageNo === "03") {
                res.redirect('/');
            }
        } else {
            res.status(404).send("Server error");
        }
    } else {
        res.status(500).send("Server error");
    }   
}