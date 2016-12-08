'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 项目所涉及到的标签
 */
var GirlVipSchema = new Schema({
    name: {type: String, require: true},        // 会员活动名
    price: {type: Number},                      //会员价格
    duration: {type: Number},                   //几个月
    desc: {type: String},                       //活动描述
    recommend: {type: Number},                  // 0:推荐 1:不是
    sort: {type: Number},                       // 排序值,越大越靠前
    status: {type: Number},                     // 0 不可见  1 可见  2 删除
    updated_at: {type: Date},                   // 修改时间
    created_at: {type: Date}                    // 创建时间
}, {autoIndex: false});

mongoose.model('GirlVip', GirlVipSchema);
