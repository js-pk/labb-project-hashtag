'use strict'

const authorize = function(req) {
    return req.session.user
}

exports.index = function(req, res, next) {
    if (authorize(req)) {
        res.render("dashboard")
    } else {
        res.render("signup")
    }
}

exports.login = function(req, res, next) {
    if (authorize(req)) {
        res.render("dashboard")
    } else {
        res.render("login")
    }
}