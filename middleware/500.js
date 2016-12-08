'use strict';
var util = require($ROOT + '/lib/utils');

module.exports = function (template) {
    return function serverError(err, req, res, next) {
        util.logError(req, err);
        console.log(err)
        if (!res.finished) {
            res.status(500);
            res.json({result: 0});
        }
    };
};
