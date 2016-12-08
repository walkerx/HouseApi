'use strict';

var db = require($ROOT + '/models/niceGirl'),
    async = require('async'),
    utils = require('./utils');

var checkLogin = function(req, callback){
    if(!req.sessionID){
        return callback(false);
    }
    db.User
        .findOne({session: req.sessionID})
        .lean(true)
        .exec(function (err, user) {
            if(err){
                utils.logError(req, err);
                return callback(false);
            }
            if(!user){
                return callback(false);
            }
            return callback(true,user);
        });
};

exports.isLogin = function(req, res, next){
    checkLogin(req,function(isLogin,user){
        if (!isLogin) {
            res.status(401);
            return res.json({result: 2, message: '未登录'});
        }
        req.user = user;
        return next();
    })
};
