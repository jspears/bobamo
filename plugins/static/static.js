var Plugin = require('../../lib/plugin-api'), util = require('util'), path = require('path'), static = require('connect/lib/middleware/static');
var StaticPlugin = function () {
    Plugin.apply(this, arguments);
}
util.inherits(StaticPlugin, Plugin);
StaticPlugin.prototype.editors = function () {
    return ['Text', 'Checkbox',
        'Checkboxes',
        'Date',
        'DateTime',
        'Hidden',
        'List',
        'NestedModel',
        'Number',
        'Object',
        'Password',
        'Radio',
        'Select',
        'TextArea', 'MultiEditor'];
}
StaticPlugin.prototype.filters = function () {
    var prefix = this.baseUrl;
    var sdir = path.join(this.path, 'public');
    var psdir = path.join(process.cwd(), 'public');

    var public = static(sdir);
    var publicUser = static(psdir);
    console.log("Public Dir: ", psdir);
    this.app.get(prefix + '*', function (req, res, next) {
        req._url = req.url;
        req.url = req.url.substring(prefix.length - 1);

        next();

    }, publicUser, public, function (req, res, next) {
        req.url = req._url;
        next();
    });
}
StaticPlugin.prototype.routes = function () {
}
module.exports = StaticPlugin;