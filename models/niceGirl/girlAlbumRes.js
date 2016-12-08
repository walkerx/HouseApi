'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 图片专辑集合
 */
var GirlAlbumResSchema = new Schema({
    iSiteId: {type: Number},      // 自定义的网站id
    unqueId: {type: String},      // 该网站的唯一id
    resUrl: {type: String},     // 来源的详细地址
    resData:{},                 // 原来爬取的数据
    site: {type: String},       // 所属网站url
    name: {type: String},       // 专辑名称
    tag: [{type: String}],      // 专辑标签
    picNum: {type: Number},     // 专辑图片数量
    pics: [{type: String}],     // 专辑图片url列表
    cover: {type: String},      // 专辑封面图
    girl: { type: Schema.ObjectId, ref: 'GirlInfo'},  //关联模特
    url: {type: String},        // 源网站专辑url
    status: {type: Number},     //0 不可见  1 审核可见  2 审核未通过
    created_at: {type: Date}    // 创建时间
}, {autoIndex: false});

mongoose.model('GirlAlbumRes', GirlAlbumResSchema);
