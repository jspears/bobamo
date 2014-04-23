var Q = require('q');

module.exports.bus = require('./lib/bus')
module.exports.express = require('./lib/bobamo-express.js');
module.exports.expressApi = require('express');
module.exports.PluginApi = require('./lib/plugin-api.js');
module.exports.app = require('./lib/boot.js');
module.exports.mongoose = require('mongoose');
module.exports.DisplayModel = require('./lib/display-model');
module.exports.FinderModel = require('./lib/finder-model');
module.exports.inflection = require('./lib/inflection');
module.exports.Q = Q;
module.exports.moment = require('moment');
module.exports.ready = Q.defer();
