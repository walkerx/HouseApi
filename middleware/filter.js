'use strict';
module.exports = function () {
    return function filter(req, res, next) {
        next();
    };
};
