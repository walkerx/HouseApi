'use strict';

var db = require($ROOT + '/models/niceGirl'),
    tip = require($ROOT + '/config/tip.js'),
    moment = require('moment'),
    utils = require($ROOT + '/lib/utils'),
    auth = require($ROOT + '/lib/auth'),
    _ = require('lodash'),
    redis = require($ROOT + '/redis'),
    async = require('async');

var responseUserInfo = function(user){
    var select = '_id nickname qq weChat provider';
    return _.pick(user,select.split(' '));
};

//注册流程
var register = function (req, res, next) {
    req.checkBody('account', '昵称须为2-16位字母数字下划线汉字').notEmpty().len(2, 16).isValidChar();
    req.checkBody('passWd', '密码须为6-16位字母数字下划线汉字').notEmpty().len(6, 16).isValidChar();
    // req.checkBody('confirmPd', '昵称须为6-12位字母数字下划线汉字').notEmpty().len(2, 12).isValidChar();
    var errors = req.validationErrors();
    if (errors) {
        return res.json({result: 2, data: errors[0].msg});
    }
    // if(req.body.pd !== req.body.confirmPd){
    //     return res.json({result: 2, data: '密码不一致!'});
    // }
    db.GirlUser
        .findOne({nickname: req.body.account})
        .lean(true)
        .exec(function (err, user) {
            if (err) {
                return next(err);
            }
            if (user) {
                return res.json({result: 2, data: tip.user.nickExist});
            }
            var now = new Date();
            //保存用户信息
            var userObj = new db.GirlUser({
                account: req.body.account,
                register_at: now,
                lastLogin_at: now,
                provider: 1,
                status: 1,
                session: req.sessionID
            });
            userObj.set('password', req.body.passWd);
            userObj.save(function (err, user) {
                if (err) {
                    return res.json({result: 2, data: err});
                }
                req.session.user = user._id;
                req.session.save(function(err){
                    if (err) {
                        return res.json({result: 2, data: err});
                    }
                    return res.json({result: 1});
                })
            });
        });

};

var deleteSession = function(req, user, callback){
    if(req.sessionID === user.session){
        return callback(null)
    }
    redis.Session.deleteKey(user.session, function(err){
        return callback(err)
    })
};

//验证获取TOKEN
var login = function (req, res, next) {
    req.checkBody('account', '昵称须为2-16位字母数字下划线汉字').notEmpty().len(2, 16).isValidChar();
    req.checkBody('passWd', '密码须为6-16位字母数字下划线汉字').notEmpty().len(6, 16).isValidChar();
    var errors = req.validationErrors();
    if (errors) {
        return res.json({result: 2, data: errors[0].msg});
    }
    db.GirlUser
        .findOne({nickname: req.body.nickname})
        .exec(function (err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.json({result: 2, data: '用户不存在或者密码错误'});
            }
            if (!user.authenticate(req.body.pd)) {
                return res.json({result: 2, data: '用户不存在或者密码错误'});
            }
            var now = new Date();
            deleteSession(req, user, function(err){
                if (err) {
                    return next(err);
                }
                db.GirlUser.update(
                    {_id:user._id},
                    {
                        session: req.sessionID,
                        lastLogin_at: now
                    }
                ).exec(function(err){
                    if (err) {
                        return next(err);
                    }
                    req.session.user = user._id;
                    req.session.save(function(err){
                        if (err) {
                            return res.json({result: 2, data: err});
                        }
                        var result = responseUserInfo(user);
                        return res.json({result: 1, data: result});
                    })
                });
            });

        });
};

var thirdPartyLogin = function (req, res, next) {
    req.checkBody('type', '登录类型错误').notEmpty().isInt({min: 1, max: 2});  //1:qq 2:weChat
    req.checkBody('uid', '获取第三方用户信息失败').notEmpty();
    req.checkBody('nickname', '昵称格式错误').optional().notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.json({result: 2, data: errors[0].msg});
    }
    var provider;
    var condition = {};
    switch (parseInt(req.body.type)) {
        case 1:
            provider = 'qq';
            condition = {'qq.uid': req.body.uid};
            break;
        case 2:
            provider = 'weChat';
            condition = {'weChat.uid': req.body.uid};
            break;
        default :
            return res.json({result: 2, data: '类型错误'});
    }
    var nickname = provider + new Date().getTime(),
        now = new Date().getTime(),
        session = utils.getSession();
    if(req.body.nickname){
        nickname = req.body.nickname;
    }
    //保存用户信息
    var updateObj = {
        nickname: nickname,
        lastLogin_at: now,
        provider: provider,
        status: 1,
        session:session
    };
    updateObj[provider] = {
        uid: req.body.uid,
        nickname: req.body.nickname
    };
    db.GirlUser
        .findOneAndUpdate(
            condition,
            {
                $set: updateObj,
                $setOnInsert: {register_at: now}
            },
            {upsert: true, new: true}
        )
        .exec(function (err, user) {
            if (err) {
                return next(err);
            }
            var result = responseUserInfo(user);
            return res.json({result: 1, data: result});
        });
};

var logout = function (req, res, next) {
    db.GirlUser
        .findOneAndUpdate(
            {_id: req.user._id},
            {
                $unset: { session:1 }
            },
            {upsert: false, new: false}
        ).exec(function (err, user) {
            if (err) {
                return next(err);
            }
            redis.Session.deleteKey(user.session, function(err){
                if (err) {
                    return next(err);
                }
                var result = responseUserInfo(user);
                return res.json({result: 1, data: result});
            })
        });
};

module.exports = function (app) {

    // app.post('/oauth/thirdParty', thirdPartyLogin);

    app.post('/login', login); //登录

    app.post('/register', register);	//注册

    app.get('/logout', auth.isLogin, logout);	//注册

};

