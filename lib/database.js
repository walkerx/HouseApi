'use strict';

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var db = function () {
    return {
        config: function (conf) {
            var connectString = 'mongodb://';
            for (var i = 0; i < conf.instance.length; i++) {
                connectString += conf.instance[i].host + ':' + conf.instance[i].port;
                if (i < conf.instance.length - 1) {
                    connectString += ',';
                }
            }
            var option = {
                replset: {rs_name: conf.replset}
            };
            connectString += '/' + conf.database;
            mongoose.connect(connectString, option);
            console.error(connectString);
            //mongoose.set('debug', true);
            var db = mongoose.connection;
            db.on('error', console.error.bind(console, 'connection error:'));
            db.once('open', function callback() {
                console.log('db connection open');
            });

        },
        close: function () {
            mongoose.connection.close();
        }
    };
};

module.exports = db();
