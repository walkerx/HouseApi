'use strict';

var fs = require('fs'),
    path = require('path'),
    uuid = require('uuid'),
    crypto = require('crypto'),
    uid = require('uid-safe').sync,
    underscore = require('underscore');

/**
 * 格式化字符串
 * @param str  字符串模板,需要参数化的字段需要用{}包含
 * @param args 参数对象,key值和参数化字段的值对应
 *
 */
var format = function (str, args) {
    var result = str;
    if (arguments.length === 0) {
        return result;
    }

    for (var key in args) {
        var reg = new RegExp("\{" + key + "\}");
        result = result.replace(reg, args[key]);
    }

    return result;
};

var extend = function (o, n, override) {
    for (var p in n)if (n.hasOwnProperty(p) && (!o.hasOwnProperty(p) || override))o[p] = n[p];
    return o;
};

function getPath(dir, paths) {
    if (!paths) {
        paths = [];
    }
    var files = fs.readdirSync(dir);
    for (var file in files) {
        var fName = dir + path.sep + files[file];
        var stat = fs.lstatSync(fName);
        if (stat.isDirectory() === true) {
            getPath(fName, paths);
        } else {
            if (files[file].indexOf('.js') > -1) {
                paths.push(fName);
            }
        }
    }
    return paths;
}

function getDir(dir, paths) {
    if (!paths) {
        paths = [];
    }
    var files = fs.readdirSync(dir);
    for (var file in files) {
        var fName = dir + path.sep + files[file];
        var stat = fs.lstatSync(fName);
        if (stat.isDirectory() === true) {
            paths.push(fName);
        }
    }
    return paths;
}

function getUuid() {
    return uuid.v4();
}

// 从一个数组中获取每一个对象元素的其中一列,然后组合成数组返回
var arrayColumn = function (array, column) {
    var result = [];
    for (var i in array) {
        if (array[i][column]) {
            result.push(array[i][column]);
        }
    }
    return result;
};

// 检测值是否在数组中存在,如果column有传,则取到数据元素的具体一列
var arrayContain = function (value, array, column) {
    for (var i in array) {
        if (array[i][column] && array[i][column] == value) {
            return i;
        }
    }
    return -1;
};


// 克隆对象
var clone = function (obj) {
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        var i, len;
        for (i = 0, len = obj.length; i < len; ++i) {
            copy[i] = this.clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = this.clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
};


var logFormat = function (arr) {
    return underscore.reduce(arr, function (str, info, index) {
        if (index === 1) {
            return '[' + str + ']' + '[' + info + ']';
        }
        return str + '[' + info + ']';
    });
};

//获取客户端IP 获取的地址是IPv6 ：：ffff:127.0.0.1
var getClientIp = function (req) {
    return req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'] ||
        req.ip ||
        req._remoteAddress ||
        (req.connection && req.connection.remoteAddress) ||
        undefined;
};

function logError(req, err) {
    var date, dateStr, ip, user_agent, method, url, http_version, err_reason, file, infos;
    dateStr = new Date();
    date = new Date(dateStr.getTime() - dateStr.getTimezoneOffset() * 60000).toISOString();

    if (req) {
        ip = getClientIp(req);
        user_agent = req.headers['user-agent'];
        method = req.method;
        url = req.originalUrl || req.url;
        http_version = 'HTTP/' + req.httpVersionMajor.toString() + '.' + req.httpVersionMinor.toString();
    }
    else {
        ip = '-';
        user_agent = '-';
        method = '-';
        url = '-';
        http_version = '-';
    }
    err_reason = '-';
    file = '-';

    infos = [date, ip, user_agent, method, url, http_version, err_reason, file];

    if (err) {
        infos[6] = err.message || err;
        if (err.stack && err.stack.split) {
            var fileInfo = (/\(.+?\)/g).exec(err.stack.split('\n')[1]);
            if (fileInfo && fileInfo.length > 0) {
                infos[7] = fileInfo[0];
            }
        }
    }
    var str = logFormat(infos);
    console.error(str);
}

/**
 * 将对象转化为字符串参数形式
 * @param {Object} obj 待转化的对象
 * @param {Array} excludes 不参与转化的属性
 * @returns {string} 转化后的字符串
 */

function obj2ParamStr(obj, excludes) {
    if (!excludes) {
        excludes = [];
    }
    var arr = [];
    for (var key in obj) {
        if (excludes.indexOf(key) !== -1) {
            continue;
        }
        arr.push(key + '=' + obj[key]);
    }
    arr.sort();
    return arr.join('&');
}

function getMD5(text) {
    return crypto.createHash('md5').update(text, 'utf8').digest('hex');
}

/**
 * Return a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
var getUid = function (len) {
    var buf = [],
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        charlen = chars.length;

    for (var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
};

module.exports = {
    format: format,
    extend: extend,
    getPath: getPath,
    getDir: getDir,
    getUuid:getUuid,
    arrayColumn: arrayColumn,
    arrayContain: arrayContain,
    clone: clone,
    getClientIp: getClientIp,
    logError: logError,
    obj2ParamStr: obj2ParamStr,
    getMD5: getMD5,
    getUid: getUid
};
