var mongoose = require('mongoose');
var utils = require($ROOT + '/lib/utils');
var paths = utils.getPath($ROOT + '/models/niceGirl');
paths.forEach(function (path) {
    require(path);
});

exports.GirlUser = mongoose.model('GirlUser');
exports.GirlAlbum = mongoose.model('GirlAlbum');
exports.GirlAd = mongoose.model('GirlAd');
exports.GirlApp = mongoose.model('GirlApp');
exports.GirlInfo = mongoose.model('GirlInfo');
exports.GirlTags = mongoose.model('GirlTags');
exports.GirlVip = mongoose.model('GirlVip');
exports.GirlOrder = mongoose.model('GirlOrder');
