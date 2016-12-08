'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 积分墙集合
 */
var GirlAppSchema = new Schema({
    name: {type: String},    // 应用名称
    icon: {type: String},    // 应用icon
    desc: {type: String},    // 应用介绍
    url: {type: String},     // 应用商店url
    status: {type: Number},  //0 不可见  1 可见  2 删除
    created_at: {type: Date} // 创建时间
}, {autoIndex: false});

mongoose.model('GirlApp', GirlAppSchema);
