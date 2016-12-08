'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 个人专辑名称集合
 */
var GirlInfoSchema = new Schema({
    site: {type: String},           // 来源网站
    iSiteId: {type: Number},        // 数据采集来源编号
    unqueId: {type: String},        // 数据来源唯一标识符
    resData: { },                   // 采集源数据
    name: {type: String},             // 模特名
    thumbnail: {type: String},        // 个人专辑缩略图
    cover: {type: String},            // 专辑封面图
    profileDesc: {type: String},       // 个人专辑描述
    albums: [{ type: Schema.ObjectId, ref: 'GirlAlbum'}],    // 个人专辑Id列表
    relatedPerson: [{ type: Schema.ObjectId, ref: 'GirlInfo'}], // 相关模特Id列表,如果有设置就增加显示,没有就按规则显示
    sort:{type: Number},       // 排序值,越大越靠前
    hot:{type: Number},        //热门模特  0:不是 1:热门
    status: {type: Number},  //0 不可见  1 可见  2 删除
    update_at: {type: Date},   // 修改时间
    created_at: {type: Date}   // 创建时间
}, {autoIndex: false});

mongoose.model('GirlInfo', GirlInfoSchema);
