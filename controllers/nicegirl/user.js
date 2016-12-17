'use strict';

var db = require($ROOT + '/models/niceGirl'),
    tip = require($ROOT + '/config/tip.js'),
    moment = require('moment'),
    utils = require($ROOT + '/lib/utils'),
    auth = require($ROOT + '/lib/auth'),
    _ = require('lodash'),
    redis = require($ROOT + '/redis'),
    config = require($ROOT + '/config/config'),
    request = require('request'),
    async = require('async');

var responseUserInfo = function(user){
    var select = '_id account qq weChat provider vipEndTime';
    return _.pick(user,select.split(' '));
};

//注册流程
var register = function (req, res, next) {
    req.checkBody('account', '昵称须为2-16位字母数字下划线汉字').notEmpty().len(2, 16).isValidChar();
    req.checkBody('passWd', '密码须为6-16位字母数字下划线汉字').notEmpty().len(6, 16).isValidChar();
    var errors = req.validationErrors();
    if (errors) {
        return res.json({result: 2, data: errors[0].msg});
    }
    db.GirlUser
        .findOne({account: req.body.account})
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
                    var result = responseUserInfo(user);
                    return res.json({result: 1, data: result});
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

var updateUserInfo = function(req, user, now, callback){
    deleteSession(req, user, function(err){
        if (err) {
            return callback(err);
        }
        db.GirlUser.update(
            {_id:user._id},
            {
                session: req.sessionID,
                lastLogin_at: now
            }
        ).exec(function(err){
            if (err) {
                return callback(err);
            }
            req.session.user = user._id;
            req.session.save(function(err){
                return callback(err);
            })
        });
    });
};

//登录
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
            if (!user.authenticate(req.body.passWd)) {
                return res.json({result: 2, data: '用户不存在或者密码错误'});
            }
            var now = new Date();
            updateUserInfo(req, user, now, function(err){
                if (err) {
                    return res.json({result: 2, data: err});
                }
                var result = responseUserInfo(user);
                return res.json({result: 1, data: result});
            });


        });
};

var getThirdPartyUid = function(code,type,callback){
    if(type === 1){  //qq
        return callback(null,{uid:'1111111',openId:'123123123'});
    }else{
        var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid='
            + config.wxLogin.AppID + '&secret='
            + config.wxLogin.AppSecret + '&code='
            + code + '&grant_type=authorization_code';
        request(url, function (error, response, body) {
            if(error){
                return callback(error);
            }
            if(!response || response && response.statusCode !== 200){
                var err = '微信token请求错误';
                return callback(err);
            }
            if (response.statusCode == 200) {
                var result = JSON.parse(body)
                if(result.errcode){
                    return callback(result.errmsg);
                }
                return callback(null,result);
            }
        })
    }
};

var thirdPartyLogin = function (req, res, next) {
    req.checkBody('type', '登录类型错误').notEmpty().isInt({min: 1, max: 2});  //1:qq 2:weChat
    req.checkBody('code', '获取第三方code失败').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.json({result: 2, data: errors[0].msg});
    }
    var provider,
        providerObj = {},
        condition = {},
        code = req.body.code,
        type = req.body.type;
    getThirdPartyUid(code,type,function(err, result){
        if(err){
            return next(err);
        }
        switch (parseInt(type)) {
            case 1:
                provider = 'qq';
                condition = {'qq.uid': result.uid};
                providerObj = {
                    uid: result.uid
                };
                break;
            case 2:
                provider = 'weChat';
                condition = {'weChat.uid': result.unionid};
                providerObj = {
                    uid: result.unionid,
                    openId: result.openid,
                    accessToken: result.access_token,
                    expiresIn: result.expires_in,
                    refreshToken: result.refresh_token,
                    scope: result.scope
                };
                break;
            default :
                return res.json({result: 2, data: '类型错误'});
        }
        var nickname = provider + new Date().getTime(),
            now = new Date().getTime();
        //保存用户信息
        var updateObj = {
            lastLogin_at: now,
            provider: provider,
            status: 1
        };
        updateObj[provider] = providerObj;
        db.GirlUser
            .findOneAndUpdate(
                condition,
                {
                    $set: updateObj,
                    $setOnInsert: {
                        account: nickname,
                        register_at: now
                    }
                },
                {upsert: true, new: true}
            )
            .exec(function (err, user) {
                if (err) {
                    return next(err);
                }
                updateUserInfo(req, user, now, function(err){
                    if (err) {
                        return res.json({result: 2, data: err});
                    }
                    var result = responseUserInfo(user);
                    return res.json({result: 1, data: result});
                });
            });
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

var getMe  = function (req, res, next) {
    var result = responseUserInfo(req.user);
    return res.json({result: 1, data: result});
};

module.exports = function (app) {

    app.post('/thirdPartyLogin', thirdPartyLogin);

    //登录
    app.post('/login', login);

    //注册
    app.post('/register', register);

    //登出
    app.get('/logout', auth.isLogin, logout);

    //获取用户信息
    app.get('/me', auth.isLogin, getMe);

};

