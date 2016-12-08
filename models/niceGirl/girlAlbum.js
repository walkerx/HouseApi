'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 图片专辑集合
 */
var GirlAlbumSchema = new Schema({
    iSiteId: {type: Number},        // 自定义的网站id
    unqueId: {type: String},        // 该网站的唯一id
    resData:{},                     // 原来爬取的数据
    site: {type: String},           // 所属网站url
    name: {type: String},           // 专辑名称
    tag: [{type: String}],          // 专辑标签
    picNum: {type: Number},         // 专辑图片数量
    pics: [{type: String}],         // 专辑图片url列表
    cover: {type: String},          // 专辑封面图
    girl: { type: Schema.ObjectId, ref: 'GirlInfo'},  //关联模特
    url: {type: String},            // 源网站专辑url
    status: {type: Number},         // 0 初始采集数据  1 审核通过并可见  2 审核未通过或者删除  3 审核通过但不可见
    update_at: {type: Date},        // 修改时间
    created_at: {type: Date}        // 创建时间
}, {autoIndex: false});

mongoose.model('GirlAlbum', GirlAlbumSchema);
