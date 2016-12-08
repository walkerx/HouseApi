'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 项目所涉及到的标签
 */
var GirlTagsSchema = new Schema({
    name: {type: String, require: true},        // 标签名称
    children: [{type: String}],                 //子标签名
    albumNum: {type: Number, default: 0},       //该专辑的贴士数量
    grade: {type: Number, default: 1, require: true}, //标签层级 从1开始
    sort: {type: Number},                       // 排序值,越大越靠前
    status: {type: Number},                     // 0 不可见  1 可见  2 删除
    updated_at: {type: Date},                   // 修改时间
    created_at: {type: Date}                    // 创建时间
}, {autoIndex: false});

mongoose.model('GirlTags', GirlTagsSchema);
