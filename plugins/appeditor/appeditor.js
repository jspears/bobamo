var bobamo = require('../../index'), Plugin = bobamo.PluginApi, Model = bobamo.DisplayModel, _u = require('underscore');
var AppEditorPlugin = function (options, app, name) {
    Plugin.apply(this, arguments);
    this.conf = {};
}
require('util').inherits(AppEditorPlugin, Plugin);
AppEditorPlugin.prototype._admin = new Model('appeditor', {
    schema: {
        title: {help: 'Application Title', validators:[{type:'required'}]},
        version: {help: 'Version of application'},
        description: {},
        authors: {
            type: 'List',
            help: 'People who have contributed, email "Justin Spears" &lt;speajus@gmail.com&gt;'
        }
    },
    title:'About'
});

AppEditorPlugin.prototype.admin = function () {
    var adm = this._admin;
    adm.defaults = this.conf;
    return adm;
}
AppEditorPlugin.prototype.appModel = function () {
    return this.conf;
}
AppEditorPlugin.prototype.save = function (conf, cb) {
    var appModel = this.pluginManager.appModel;
    if (conf.version != appModel.version) {
        var revisions = (conf.revisions || (conf.revisions = []));
        revisions.push({
            version: appModel.version,
            description: appModel.description,
            modified: appModel.modified || new Date(),
            timestamp: appModel.timestamp
        })
    }
    Plugin.prototype.save.call(this, this.conf, cb);
}

module.exports = AppEditorPlugin;
