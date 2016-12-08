'use strict';

var redis = require('ioredis');

function Redis() {
    this.client = '';
}

Redis.prototype.config = function (conf) {
    //this.client = redis.createClient(conf.port, conf.host, {});
    this.client = new redis({
        port: conf.port,          // Redis port
        host: conf.host,   // Redis host
        db: conf.db,
        dropBufferSupport: true
    });

    this.client.on('error', function (err) {
        console.error("error:" + err);
    });
    this.client.on('connect', function () {
        console.log('redis connect');
    });
    this.client.on('ready', function () {
        console.log('client ready');
    });
};

module.exports = new Redis;
