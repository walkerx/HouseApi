'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 广告集合
 */
var GirlAdSchema = new Schema({
    source: {type: String},  // 广告来源
    pic: {type: String},     // 图片url
    url: {type: String},     // 跳转url
    status: {type: Number},  //0 不可见  1 可见  2 删除
    created_at: {type: Date} // 创建时间
}, {autoIndex: false});

mongoose.model('GirlAd', GirlAdSchema);
