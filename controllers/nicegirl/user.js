'use strict';

let db = require($ROOT + '/models/niceGirl'),
    tip = require($ROOT + '/config/tip.js'),
    moment = require('moment'),
    passport = require('passport'),
    auth = require($ROOT + '/lib/auth'),
    _ = require('lodash'),
    config = require($ROOT + '/config/config'),
    request = require('request'),
    async = require('async');

let responseUserInfo = function (user) {
    let select = '_id account qq weChat provider vipEndTime';
    return _.pick(user, select.split(' '));
};

//注册流程
let register = function (req, res, next) {
    req.checkBody('account', '昵称须为2-16位字母数字下划线汉字').notEmpty().len(2, 16).isValidChar();
    req.checkBody('passWd', '密码须为6-16位字母数字下划线汉字').notEmpty().len(6, 16).isValidChar();
    let errors = req.validationErrors();
    if (errors) {
        return res.json({result: 2, data: errors[0].msg});
    }
    db.GirlUser.findOne({account: req.body.account}).lean(true).exec(function (err, user) {
            if (err) {
                return next(err);
            }
            if (user) {
                return res.json({result: 2, data: tip.user.nickExist});
            }
            let now = new Date();
            //保存用户信息
            let userObj = new db.GirlUser({
                account: req.body.account,
                register_at: now,
                lastLogin_at: now,
                provider: 1,
                status: 1,
                // session: req.sessionID
            });
            userObj.set('password', req.body.passWd);
            userObj.save(function (err, user) {
                if (err) {
                    return res.json({result: 2, data: err});
                }
                // req.session.user = user._id.toString();
                //req.session.save(function (err) {
                 //   if (err) {
                //        return res.json({result: 2, data: err});
                //    }
                    return res.json({result: 1, data: responseUserInfo(user)});
                //})
            });
        });
};

// let deleteSession = function (req, user, callback) {
//     return callback(null)
//     if (req.sessionID === user.session) {
//         return callback(null)
//     }
//     req.session.destroy(user.session, function (err) {
//         return callback(null)
//     });
//
// };


//登录
let login = function (req, res, next) {
    req.checkBody('account', '昵称须为2-16位字母数字下划线汉字').notEmpty().len(2, 16).isValidChar();
    req.checkBody('passWd', '密码须为6-16位字母数字下划线汉字').notEmpty().len(6, 16).isValidChar();
    let errors = req.validationErrors();
    if (errors) {
        return res.json({result: 2, data: errors[0].msg});
    }

    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err)
        }
        if (!user) {
            return res.json({result: 2, data: info.message});
        }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.json({result: 1, data: responseUserInfo(user)});
        });
    })(req, res, next);
};

let getThirdPartyUid = function (code, type, callback) {
    if (type === 1) {  //qq
        return callback(null, {uid: '1111111', openId: '123123123'});
    } else {
        let url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid='
            + config.wxLogin.AppID + '&secret='
            + config.wxLogin.AppSecret + '&code='
            + code + '&grant_type=authorization_code';
        request(url, function (error, response, body) {
            if (error) {
                return callback(error);
            }
            if (!response || response && response.statusCode !== 200) {
                let err = '微信token请求错误';
                return callback(err);
            }
            if (response.statusCode == 200) {
                let result = JSON.parse(body)
                if (result.errcode) {
                    return callback(result.errmsg);
                }
                return callback(null, result);
            }
        })
    }
};

let thirdPartyLogin = function (req, res, next) {
    req.checkBody('type', '登录类型错误').notEmpty().isInt({min: 1, max: 2});  //1:qq 2:weChat
    req.checkBody('code', '获取第三方code失败').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.json({result: 2, data: errors[0].msg});
    }
    let provider,
        providerObj = {},
        condition = {},
        code = req.body.code,
        type = req.body.type;
    getThirdPartyUid(code, type, function (err, result) {
        if (err) {
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
        let nickname = provider + new Date().getTime(),
            now = new Date().getTime();
        //保存用户信息
        let updateObj = {
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
                //updateUserInfo(req, user, now, function (err) {
                //     if (err) {
                //         return res.json({result: 2, data: err});
                //     }
                    return res.json({result: 1, data: responseUserInfo(user)});
                //});
            });
    });

};

let logout = function (req, res, next) {
    req.logOut(req);
    return res.json({result: 1});
};

let getMe = function (req, res, next) {
    let result = responseUserInfo(req.user);
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

