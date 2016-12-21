'use strict';

let User = require('../models/niceGirl/index').GirlUser,
    LocalStrategy = require('passport-local').Strategy;

exports.localStrategy = function () {
    return new LocalStrategy({usernameField: 'account', passwordField: 'passWd', passReqToCallback: true, session: true},
        function (req, username, password, done) {
            User.findOne({account: username}, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        message: '用户不存在'
                    });
                }
                if (!user.authenticate(password)) {
                    return done(null, false, {
                        message: '密码错误'
                    });
                }
                done(null, user);
            });
        });
};

exports.serializeUser = function (user, done) {
    done(null, user._id);
};

exports.deserializeUser = function (id, done) {
    User.findOne({_id: id}, function (err, user) {
        done(null, user);
    });
};

exports.isLogin = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.status(401);
        return res.json({});
    } else {
        next();
    }
};





