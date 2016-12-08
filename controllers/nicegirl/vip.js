'use strict';

var db = require($ROOT + '/models/niceGirl'),
    tip = require($ROOT + '/config/tip.js'),
    utils = require($ROOT + '/lib/utils'),
    auth = require($ROOT + '/lib/auth');

var getVipList = function (req, res, next) {
    db.GirlVip
        .find({status:1})
        .sort({})
        .lean(true)
        .exec(function(err,vips){
            
        })
};

module.exports = function (app) {

    app.get('/list', getVipList); //获取办理活动列表

};

