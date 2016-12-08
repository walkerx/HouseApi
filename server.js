'use strict';

var app = require('./index');
var http = require('http');
var server;
server = http.createServer(app);
server.listen(process.env.PORT || 8000);
server.on('listening', function () {
    var date = new Date();
    console.log('%s [%s] Listening on http://localhost:%d', date, app.settings.env, this.address().port);
});
