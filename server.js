'use strict';

let app = require('./index');
let http = require('http');
let server;
server = http.createServer(app);
server.listen(process.env.PORT || 8000);
server.on('listening', function () {
    let date = new Date();
    console.log('%s [%s] Listening on http://localhost:%d', date, app.settings.env, this.address().port);
});
