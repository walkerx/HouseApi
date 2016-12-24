'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 积分墙集合
 */
var GirlSystemSchema = new Schema({
    hideVip: {type: Number},    // 隐藏VIP 1:隐藏 2:不隐藏
    osType: {type: Number},     // 1:Android 2:IOS 
    status: {type: Number},  //0 不可见  1 可见  2 删除
    created_at: {type: Date} // 创建时间
}, {autoIndex: false});

mongoose.model('GirlSystem', GirlSystemSchema);
