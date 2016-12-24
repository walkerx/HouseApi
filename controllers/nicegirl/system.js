'use strict';

var db = require($ROOT + '/models/niceGirl'),
    tip = require($ROOT + '/config/tip.js'),
    utils = require($ROOT + '/lib/utils'),
    config = require($ROOT + '/config/config'),
    auth = require($ROOT + '/lib/auth'),
    moment = require('moment'),
    xml2js = require('xml2js'),
    request = require('request'),
    crypto = require('crypto');

var getInfo = function (req, res, next) {
    //android: Android House IOS: IOS House
    // osType: 1: android  2: ios
    var osType = 1;
    if(req.headers['user-agent'] === 'IOS House'){
        osType = 2;
    }
    db.GirlSystem
        .findOne({status:1,osType: osType})
        .select('hideVip')
        .lean(true)
        .exec(function(err, system){
            if (err){
                return next(err);
            }
            if(!system){
                return res.json({result: 1, data: {}});
            }
            return res.json({result: 1, data: system});
        });
};

module.exports = function (app) {

    //获取办理活动列表
    app.get('/info', getInfo);

};

