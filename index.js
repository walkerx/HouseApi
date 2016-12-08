'use strict';

var express = require('express');
var kraken = require('kraken-js');
global.$ROOT = process.cwd();

var db = require('./lib/database'),
    expressValidator = require('./lib/validator')(),
    redis = require('./redis/redis');

var options, app;

/*
 * Create and configure application. Also exports application instance for use by tests.
 * See https://github.com/krakenjs/kraken-js#options for additional configuration options.
 */
options = {
    onconfig: function (config, next) {
        redis.config(config.get('redis'));
        db.config(config.get('databaseConfig'));
        next(null, config);
    }
};

app = module.exports = express();
app.use(kraken(options));
app.on('start', function () {
    global.MongoDatabase = app.kraken.get('databaseConfig:database');
});
app.on('middleware:before:session', function (eventargs) {
    app.use(expressValidator);
});
app.on('middleware:after:session', function (eventargs) {
});
