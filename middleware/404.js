'use strict';

module.exports = function () {
    return (req, res, next) => {
        if (!res.finished) {
            res.status(404);
            res.json({result: 404});
        }
    };
};
