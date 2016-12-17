'use strict';

var db = require($ROOT + '/models/nicegirl/index'),
    utils = require($ROOT + '/lib/utils'),
    moment = require('moment'),
    auth = require($ROOT + '/lib/auth')

/**
 * 获取标签列表
 */
var getTags = function(req, res){
    db.GirlTags
        .find({status:1})
        .select('_id name')
        .sort({sort:-1})
        .exec(function(err, tags){
            if (err){
                return next(err);
            }

            return res.json({result: 1, data: tags});
        });
};

/**
 * 获取指定标签下的专辑列表
 */
var getAlbums = function(req, res, next){
    req.checkQuery('tag', '参数错误').isChar();
    req.checkQuery('size', '参数错误').isPositive();
    req.checkQuery('offset', '参数错误').isNonNegative();
    var errors = req.validationErrors();
    if (errors) {
        return res.json({result: 2, data: errors[0].msg});
    }
    var size = parseInt(req.query.size),
        skip = parseInt(req.query.offset);

    db.GirlAd
        .findOne()
        .select('-created_at')
        .exec(function(err, ads){
            db.GirlAlbum.find({tag: req.query.tag})
                .select('_id cover picNum tag name')
                .skip(skip)
                .limit(size)
                .exec(function(err, albums){
                    if (err){
                        return next(err);
                    }
                    return res.json({result: 1, data: {albums: albums, ads: ads}});
                })
        })
};

/**
 * 获取指定专辑
 */
var getAlbum = function(req, res, next){
    req.checkQuery('_id', '参数错误').isObjectId();
    var errors = req.validationErrors();
    if (errors) {
        return res.json({result: 2, data: errors[0].msg});
    }
    db.GirlAlbum
        .findOne({_id:req.query._id})
        .select('_id cover picNum pics tag name girl')
        .lean(true)
        .exec(function(err, album){
            if (err){
                return next(err);
            }
            album.isVip = true;
            if(!req.user
                || !req.user.vipEndTime
                || moment(req.user.vipEndTime).format('YYYYMMDD') < moment(new Date()).format('YYYYMMDD')
            ){
                album.unlock = album.pics.length - 5;
                album.pics = album.pics.slice(0,6);
                album.isVip = false;
            }
            return res.json({result: 1, data: album});
        });
};

/**
 * 获取指定专辑的更多
 */
var getAlbumMore = function(req, res, next){
    req.checkQuery('_id', '参数错误').isObjectId();
    req.checkQuery('size', '参数错误').isPositive();
    req.checkQuery('offset', '参数错误').isNonNegative();
    var errors = req.validationErrors();
    if (errors) {
        return res.json({result: 2, data: errors[0].msg});
    }
    var size = parseInt(req.query.size),
        skip = parseInt(req.query.offset);
    db.GirlAlbum
        .find({_id:{$ne:req.query._id}})
        .select('_id cover picNum tag name')
        .skip(skip)
        .limit(size)
        .exec(function(err, albums){
            if (err){
                return next(err);
            }
            return res.json({result: 1, data: {albums: albums}});
        })
};

/**
 * 获取积分墙数据
 */
var getApps = function(req, res){
    db.GirlApp
        .find()
        .exec(function(err, apps){
            if (err){
                return res.json({result: 2});
            }
            return res.json({result: 1, data: apps});
        })
};

/**
 * 获取模特详情
 */
var getModelDetail = function(req, res, next){
    req.checkQuery('id', '参数错误').isObjectId();
    var errors = req.validationErrors();
    if (errors) {
        return res.json({result: 2, data: errors[0].msg});
    }
    db.GirlInfo
        .findOne({_id: req.query.id, status: 1})
        .select('_id name thumbnail cover profileDesc albums relatedPerson')
        .populate([
            {
                path: 'albums',
                select: '_id name picNum cover'
            },
            {
                path: 'relatedPerson',
                select: '_id name thumbnail'
            }
        ])
        .exec(function(err, girl){
            if (err){
                return next(err);
            }
            if(!girl){
                return res.json({result: 2, data: '该模特不存在'});
            }
            return res.json({result: 1, data: girl});
        })
};

/**
 * 获取人气模特
 */
var getModelHot = function(req, res, next){
    db.GirlInfo
        .find({status: 1, hot: 1})
        .select('_id name thumbnail')
        .exec(function(err, girls){
            if (err){
                return next(err);
            }
            return res.json({result: 1, data: girls});
        })
};

/**
 * 获取全部模特
 */
var getModelAll = function(req, res, next){
    req.checkQuery('size', '参数错误').isPositive();
    req.checkQuery('offset', '参数错误').isNonNegative();
    var errors = req.validationErrors();
    if (errors) {
        return res.json({result: 2, data: errors[0].msg});
    }
    var size = parseInt(req.query.size),
        skip = parseInt(req.query.offset);

    db.GirlInfo
        .find({status: 1})
        .skip(skip)
        .limit(size)
        .select('_id name thumbnail')
        .exec(function(err, girls){
            if (err){
                return next(err);
            }
            return res.json({result: 1, data: girls});
        })
};

module.exports = function (router) {

    //获取标签列表
    router.get('/tags', getTags);

    //获取指定标签下的专辑列表
    router.get('/albums', getAlbums);

    //获取指定专辑
    router.get('/album', auth.getUser, getAlbum);

    //获取指定专辑的更多
    router.get('/album/more', getAlbumMore);

    //积分墙
    router.get('/apps', getApps);

    //模特详情
    router.get('/model/detail', auth.isLogin, getModelDetail);

    //人气模特
    router.get('/model/hot', getModelHot);

    //全部模特
    router.get('/model/all', getModelAll);
};
