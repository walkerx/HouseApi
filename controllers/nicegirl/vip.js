'use strict';

var db = require($ROOT + '/models/niceGirl'),
    tip = require($ROOT + '/config/tip.js'),
    utils = require($ROOT + '/lib/utils'),
    config = require($ROOT + '/config/config'),
    auth = require($ROOT + '/lib/auth'),
    moment = require('moment'),
    xml2js = require('xml2js'),
    request = require('request'),
    crypto = require('crypto');

var getVipList = function (req, res, next) {
    db.GirlVip
        .find({status:1})
        .sort({position: 1})
        .select('_id name price duration desc recommend')
        .lean(true)
        .exec(function(err,vips){
            if(err){
                return next(err)
            }
            return res.json({result: 1, data: vips});
        })
};

//订单号生成策略
var generateOrderId = function() {
    //e.g.2016030217551191477
    var date = moment().format('YYYYMMDDHHmmssSSS');
    var random = Math.round(Math.random() * 99);
    if(random < 10){
        random = '0' + random;
    }
    return date + random;
};

var order = function (req, res, next) {
    req.checkBody('payType', '无效支付方式').isNumInterval(1,2);  //1.微信支付 2.支付宝
    req.checkBody('id', '地址错误').notEmpty().isObjectId(); //购买的Vip id
    var errors = req.validationErrors();
    if(errors){
        return res.json({result: 2, data: errors[0].msg});
    }
    db.GirlVip
        .findOne({status:1, _id: req.body.id})
        .lean(true)
        .exec(function(err,vip){
            if(err){
                return next(err)
            }
            var now = new Date();
            var orderObj = new db.GirlOrder({
                user: req.user._id,
                uid: generateOrderId(),
                vip: vip._id,
                status: 1,
                created_at: now,
                updated_at: now
            });
            orderObj.save(function (err, order) {
                if (err) {
                    return res.json({result: 2, data: err});
                }
                if(req.body.payType === 1){//微信支付
                    //var postURL = 'https://api.mch.weixin.qq.com/pay/unifiedorder';//统一下单地址
                    var clientIp =  utils.getClientIp(req);
                    if(utils.getClientIp(req).indexOf(':') > -1){
                        clientIp = utils.getClientIp(req).split(':').pop()
                    }
                    var payInfo ={
                        appid: config.wxPay.appId,
                        body: vip.name,  //商品描述 不能超过42位
                        mch_id: config.wxPay.partnerId,
                        nonce_str: utils.getUid(32), //随机数
                        notify_url: config.wxPay.notifyUrl,
                        out_trade_no: order.uid, //订单号
                        spbill_create_ip: clientIp,
                        trade_type: 'APP',
                        total_fee: parseInt(vip.price * 100)  //总额单位:分 取整
                    };
                    var stringSignTemp = utils.obj2ParamStr(payInfo,null);
                    stringSignTemp += '&key=' + config.wxPay.md5Key;
                    payInfo.sign = utils.getMD5(stringSignTemp).toUpperCase();
                    var builder = new xml2js.Builder({rootName: 'xml', headless: true});
                    var data = builder.buildObject(payInfo);
                    var options = {
                        url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
                        method: 'POST',
                        headers:{
                            'Accept':'application/xml',
                            'Content-Type':'application/xml;charset=utf-8'
                        },
                        body: data
                    };
                    request(options, function(error, response, body){
                        if(error || response.statusCode !== 200){
                            return res.json({result: 2, data: '创建支付链接失败'});
                        }
                        xml2js.parseString(body, {explicitArray:false}, function(err, resJSON){
                            if(!resJSON){
                                return res.json({result: 2, data: '创建支付链接失败'});
                            }
                            if(resJSON.xml.return_code !== 'SUCCESS'){
                                return res.json({result: 2, data: resJSON.xml.return_msg});
                            }
                            if(resJSON.xml.result_code !== 'SUCCESS'){
                                return res.json({result: 2, data: resJSON.xml.err_code_des});
                            }
                            var clientPayInfo = {
                                appid: config.wxPay.appId,
                                partnerid: config.wxPay.partnerId,
                                prepayid: resJSON.xml.prepay_id,
                                package: 'Sign=WXPay',
                                noncestr: utils.getUid(32),
                                timestamp: parseInt(new Date().getTime() / 1000)
                            };
                            var clientStr =  utils.obj2ParamStr(clientPayInfo,null);
                            clientStr += '&key=' + config.wxPay.md5Key;
                            clientPayInfo.sign = utils.getMD5(clientStr).toUpperCase();
                            return res.json({result:1, data: clientPayInfo});
                        });
                    });
                }else{
                    var biz_content = {
                        "timeout_express": "30m",
                        "seller_id": config.aliPay.partner,
                        "product_code": "QUICK_MSECURITY_PAY",
                        "total_amount": vip.price,
                        "subject": vip.name,
                        "body": "开通会员",
                        "out_trade_no": order.uid //订单号
                    };
                    var aliPayInfo = [
                        'app_id=' + config.aliPay.appId,   //appId
                        'biz_content=' + JSON.stringify(biz_content),
                        'charset=utf-8',
                        'format=json',
                        'method=alipay.trade.app.pay',
                        'notify_url=' + config.aliPay.notifyUrl,  //异步通知地址
                        'sign_type=RSA',
                        'timestamp=' + moment().format('YYYY-MM-DD HH:mm:ss'),
                        'version=1.0'
                    ];
                    var str = aliPayInfo.join('&');
                    console.log(str)
                    var sign = crypto.createSign('RSA-SHA1');
                    sign.update(str, 'utf-8');
                    aliPayInfo.push('sign=' + sign.sign(config.aliPay.privateKey,'base64'));
                    aliPayInfo.forEach(function(value,index){
                        var key = value.split('=')[0] + '=';
                        aliPayInfo[index] = key + encodeURIComponent(value.split(key)[1]);
                    });
                    console.log(aliPayInfo.join('&'))
                    return res.json({result: 1, data:aliPayInfo.join('&')});
                }
            });
        })
};

//完成订单
var finishOrder = function (uid, totalPrice, tradeId, buyerId, callback) {
    db.GirlOrder
        .findOne({uid: uid,status: 1})
        .populate([
            {
                path: 'vip',
                select: '_id name price duration'
            },
            {
                path: 'user',
                select: '_id vipEndTime'
            }
        ])
        .exec(function (err, order) {
            if (err) {
                return callback(err);
            }
            if (!order) {
                return callback('订单不存在');
            }
            if (totalPrice < order.price) {  //支付的价格跟订单的价格不一样 报错
                return callback(tip.vip.payError);
            }
            db.GirlOrder
                .update(
                    {_id: order._id.toString()},
                    {$set: {status: 2, tradeId: tradeId, buyerId: buyerId}},
                    {upsert: false}
                ).exec(function (err) {
                    if (err) {
                        return callback(err);
                    }
                    var vipEndTime = new Date(moment().add(order.vip.duration, 'months').format());
                    if( order.user.vipEndTime
                        && moment(order.user.vipEndTime).format('YYYYMMDD') >= moment(new Date()).format('YYYYMMDD')
                    ){
                        vipEndTime = new Date(moment(order.user.vipEndTime).add(order.vip.duration, 'months').format());
                    }
                    db.GirlUser
                        .update(
                            {_id: order.user._id},
                            {$set:{vipEndTime: vipEndTime}}
                        ).exec(function(err){
                            if (err) {
                                return callback(err);
                            }
                            return callback(null);
                        });
            });
        });
};


var aliNotify = function (req, res, next) {
    var postParams = req.body;
    postParams = { total_amount: '0.01',
        buyer_id: '2088602122416433',
        trade_no: '2016122321001004430292210088',
        body: '开通会员',
        notify_time: '2016-12-23 15:06:09',
        subject: '年度会员',
        sign_type: 'RSA',
        buyer_logon_id: '182****9853',
        auth_app_id: '2016120804023415',
        charset: 'utf-8',
        notify_type: 'trade_status_sync',
        invoice_amount: '0.01',
        out_trade_no: '2016122315060043374',
        trade_status: 'TRADE_SUCCESS',
        gmt_payment: '2016-12-23 15:06:08',
        version: '1.0',
        point_amount: '0.00',
        sign: 'PcFLZ9tXK32/NZlUOUHFIg7lBT2Q/OjJHcwudkxH//0qBX314HMNp/tV4HoesSfMsyFKrIllXJivvKBmN18EMQr2bqRGj59h4Qh8wjL2myucmhiVdKfFfr9VrxE9gFVLLnqMf1WgM4Jf72zhZ5c9N7PBKNBPaiaGAyBO89v8qJY=',
        gmt_create: '2016-12-23 15:06:08',
        buyer_pay_amount: '0.01',
        receipt_amount: '0.01',
        fund_bill_list: '[{"amount":"0.01","fundChannel":"ALIPAYACCOUNT"}]',
        app_id: '2016120804023415',
        seller_id: '2088522422093751',
        notify_id: '213fad53d5dfcc5f1c343d181606d32jbi',
        seller_email: '1980867962@qq.com' };
    var signResult = postParams.sign;
    var info = [];
    for (var notifyKey in postParams) {
        if (notifyKey === 'sign' || notifyKey === 'sign_type') {
            continue;
        }
        info.push(notifyKey + '=' + postParams[notifyKey]);
    }
    info.sort();
    var str = info.join('&');
    var verify = crypto.createVerify('RSA-SHA1');
    verify.update(str, 'utf-8');
    if (!verify.verify(config.aliPay.aliPublicKey, signResult, 'base64')) {
        return res.end('fail');
    }
    if(postParams.app_id !== config.aliPay.appId){
        return res.end('fail');
    }
    var tradeStatus = postParams.trade_status;
    if (tradeStatus !== 'TRADE_FINISHED' && tradeStatus !== 'TRADE_SUCCESS') {
        return res.end('success');
    }
    finishOrder(postParams.out_trade_no, postParams.total_amount / 100, postParams.trade_no, postParams.buyer_id, function (err, order) {
        if (err) {
            utils.logError(req, err);
            return res.end('fail');
        }
        return res.end('success');
    });
};

var wxNotify = function (req, res, next) {
    xml2js.parseString(req.body, {explicitArray: false}, function (err, result) {
        var builder = new xml2js.Builder({rootName: 'xml', headless: true});
        var success = {
            return_code: 'SUCCESS'
        };
        var fail = {
            return_code: 'FAIL'
        };
        if (result.xml.return_code !== 'SUCCESS') {
            return res.end(builder.buildObject(success));
        }
        var resultStr = utils.obj2ParamStr(result.xml, ['sign']);
        resultStr += '&key=' + config.wxPay.md5Key;
        var sign = utils.getMD5(resultStr).toUpperCase();
        if (result.xml.sign !== sign) {
            return res.end(builder.buildObject(fail));
        }
        finishOrder(result.xml.out_trade_no, result.xml.total_fee, function (err, order) {
            if (err) {
                utils.logError(req, err);
                return res.end('fail');
            }
            return res.end('success');
        });
    });

};

module.exports = function (app) {

    //获取办理活动列表
    app.get('/list', getVipList);

    //下单
    app.post('/order', auth.isLogin, order);

    //支付宝支付通知
    app.post('/notify/ali', aliNotify);

    //微信支付通知
    app.post('/notify/wx', wxNotify);

};

