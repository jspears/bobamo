var Plugin = require('../../lib/plugin-api'), util = require('util'), _u = require('underscore'), schemaUtil = require('../../lib/schema-util'), inflection = require('../../lib/inflection');

var IdentityPlugin = function (options) {
    Plugin.apply(this, arguments);
    this.pluginUrl = this.baseUrl;
}

util.inherits(IdentityPlugin, Plugin);

module.exports = IdentityPlugin;