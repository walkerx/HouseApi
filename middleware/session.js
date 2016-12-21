'use strict';

let session = require('express-session'),
    mongoose = require('mongoose'),
    MongoStore = require('connect-mongo')(session);

module.exports = function (sessionConfig, mongoConfig) {

    let store = new MongoStore({mongooseConnection: mongoose.connection,
        touchAfter: 3600 * 24  //这段时间内session不再更新
    });

    store.touch = function(sid, session, callback){
        const touchAfter = store.options.touchAfter * 1000,
            lastModified = session.lastModified ? session.lastModified.getTime() : 0,
            currentDate = new Date();

        if (touchAfter > 0 && lastModified > 0) {
            const timeElapsed = currentDate.getTime() - session.lastModified;

            if (timeElapsed < touchAfter) {
                return callback();
            } else {
                store.set(sid, session, callback);
            }
        }else{
            return callback();
        }
    };

    sessionConfig.store = store;
    return session(sessionConfig);
};
