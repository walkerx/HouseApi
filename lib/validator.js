'use strict';

var expressValidator = require('express-validator'),
    utils = require('../lib/utils');

//自定义参数验证方法集
var customValidators = {};

customValidators.isObjectId = function (value) {
    return new RegExp('^[0-9a-fA-F]{24}$').test(value);
};

//数字区间：例如 [1,6]
customValidators.isNumInterval = function(param, min, max) {
    return param >= min && param <= max;
};

//匹配正数
customValidators.isPositive = function (value) {
    return (/^(?:[1-9][0-9]*)$/).test(value);
};

//匹配非负数
customValidators.isNonNegative = function (value) {
    return (/^(?:0|[1-9][0-9]*)$/).test(value);
};

//匹配字母或数字或下划线或汉字或空格
customValidators.isChar = function (value) {
    return (/^[ _0-9a-zA-Z\u4E00-\u9FFF]+$/).test(value);
};

//匹配字母或数字或下划线或汉字
customValidators.isValidChar = function (value) {
    return (/^[_0-9a-zA-Z\u4E00-\u9FFF]+$/).test(value);
};

//自定义参数校验方法集
module.exports = function(){
    return expressValidator({
        customValidators: customValidators
    });
};

module.exports.validator = utils.extend(expressValidator.validator, customValidators);
