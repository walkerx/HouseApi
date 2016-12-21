'use strict';

var db = require($ROOT + '/models/niceGirl/index'),
    utils = require($ROOT + '/lib/utils'),
    auth = require($ROOT + '/lib/auth');

/**
 * 获取标签列表
 */
var getDiaries = function(req, res, next){
    var session = utils.getSession();
    res.cookie('session', session);
    return res.json({result: 1, data: [{
        pic:'http://t2.27270.com/uploads/tu/20150422/3-131109142125.jpg',
        content:'可爱宝宝戴着它们喜欢的帽子在熟睡是不是很有爱啊!那一张张纯真的笑脸。分享这组可爱宝宝温馨素材，在他刚出生的时候有点丑，像是一个小老头一样，但是很可爱吧!'
    },{
        pic:'http://t2.27270.com/uploads/tu/20150422/3-131109142125.jpg',
        content:'可爱宝宝戴着它们喜欢的帽子在熟睡是不是很有爱啊!那一张张纯真的笑脸。分享这组可爱宝宝温馨素材，在他刚出生的时候有点丑，像是一个小老头一样，但是很可爱吧!'
    },{
        pic:'http://t2.27270.com/uploads/tu/20150422/3-131109142125.jpg',
        content:'可爱宝宝戴着它们喜欢的帽子在熟睡是不是很有爱啊!那一张张纯真的笑脸。分享这组可爱宝宝温馨素材，在他刚出生的时候有点丑，像是一个小老头一样，但是很可爱吧!'
    }]});
};

module.exports = function (router) {

    //获取标签列表
    router.get('/diaries', getDiaries);
};
