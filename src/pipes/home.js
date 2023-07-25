'use strict'

const authorize = function(req) {
    return req.session.user
}

exports.run = function(req, res, next) {
    if (authorize(req)) {
        res.render("dashboard")
    } else {
        res.render("signup")
    }
}