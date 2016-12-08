'use strict';

var redis = require('./redis');

function Session() {
    this.prefix = 'sess:';
}

Session.prototype.deleteKey = function (key, callback) {
    redis.client.del(this.prefix + key, callback);
};


module.exports = new Session;
