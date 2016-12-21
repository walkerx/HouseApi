'use strict';

let express = require('express');
let kraken = require('kraken-js');
global.$ROOT = process.cwd();

let db = require('./lib/database'),
    passport = require('passport'),
    auth = require('./lib/auth'),
    expressValidator = require('./lib/validator')();

let options, app;

options = {
    onconfig: function (config, next) {
        db.config(config.get('databaseConfig'));
        next(null, config);
    }
};

app = module.exports = express();
app.use(kraken(options));
app.on('start', function () {
});
app.on('middleware:before:session', function (eventargs) {
    app.use(expressValidator);
});
app.on('middleware:after:session', function (eventargs) {
    passport.serializeUser(auth.serializeUser);
    passport.deserializeUser(auth.deserializeUser);
    passport.use(auth.localStrategy());
    app.use(passport.initialize());
    app.use(passport.session());
});
