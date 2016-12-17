'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//订单
var GirlOrderSchema = new Schema({
    user:{type: Schema.ObjectId,ref:'GirlUser', required: true},        //用户
    uid: {type: String, required: true},                            //自己生成的订单ID
    vip: {type: Schema.ObjectId, ref: 'GirlVip'},                   //开通的会员id
    status: {type:Number,default:1},                                  // 1:待付款 2:付款完成
    type: {type:Number},                                            //1:微信支付 2:支付宝
    tradeId: {type: String},                                        //支付宝或微信交易凭证号
    buyerId: {type: String},                                        //买家支付宝或微信号 不一定有
    created_at: {type: Date, default: Date.now},                     //创建时间
    updated_at: {type: Date, default: Date.now}                     //修改时间
}, {autoIndex: false});

mongoose.model('GirlOrder', GirlOrderSchema);
