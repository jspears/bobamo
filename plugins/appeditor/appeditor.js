var Plugin = require('../../lib/plugin-api');
var AppEditorPlugin = function (options, app, name) {
    Plugin.apply(this, arguments);
}
require('util').inherits(AppEditorPlugin, Plugin);

AppEditorPlugin.prototype.routes = function (options) {

    this.app.get(this.pluginUrl + '/admin/:id', function (req, res, next) {
        var appModel = res.local('appModel');
        res.send({
            payload:appModel,
            status:1
        })
    });

    this.app.post(this.pluginUrl + '/admin', function (req, res, next) {
        res.send({
            status:0,
            payload:{}
        })
    });

    this.app.put(this.pluginUrl + '/admin', function (req, res, next) {
        res.send({
            status:0,
            payload:{}
        })
    });

    Plugin.prototype.routes.apply(this, arguments);
}

module.exports = AppEditorPlugin;