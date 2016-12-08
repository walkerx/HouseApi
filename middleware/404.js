'use strict';

module.exports = function (template) {
    return function fileNotFound(req, res, next) {
        if (!res.finished) {
            res.status(404);
            res.json({result: 404});
        } else {
            //statistics
            //stat(req,res);
        }
    };
};
